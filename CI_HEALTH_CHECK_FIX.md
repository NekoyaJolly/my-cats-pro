# CI/CD Health Check Failure Fix

## 問題の概要

CI/CD パイプラインの「Cloud Run Compatibility」ジョブが health check endpoint のテスト中に失敗していました。

## 原因

`.github/workflows/ci-cd.yml` の「Start backend service」ステップで、以下のコマンドが順次実行されていましたが、シェルの動作により `npm run build` の完了を待たずに `nohup node dist/main.js &` が実行されていました:

```bash
npm run build
nohup node dist/main.js &  # ビルド完了前に実行される
echo $! > backend.pid
sleep 10
```

### エラーログ

```
Error: Cannot find module '/home/runner/work/my-cats-pro/my-cats-pro/backend/dist/main.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1207:15)
```

このエラーは、`dist/main.js` がまだ生成されていない状態で Node.js が起動を試みたために発生していました。

## 解決策

以下の改善を実装しました:

### 1. ビルド完了の確認

```bash
echo "🔨 Building backend..."
npm run build

echo "✅ Build complete, verifying dist/main.js exists..."
if [ ! -f dist/main.js ]; then
  echo "❌ Error: dist/main.js not found after build"
  exit 1
fi
```

- `npm run build` コマンドはシェルによって同期的に実行されます（バックグラウンドジョブではないため）
- ビルド完了後、`dist/main.js` の存在を明示的に検証
- ファイルが存在しない場合は早期にエラーを報告

### 2. プロセス起動の検証

```bash
echo "🚀 Starting backend service..."
nohup node dist/main.js > /tmp/backend.log 2>&1 &
echo $! > backend.pid

echo "⏳ Waiting for backend to start..."
sleep 10

echo "📋 Backend process status:"
if ps -p $(cat backend.pid) > /dev/null 2>&1; then
  echo "✅ Backend process is running (PID: $(cat backend.pid))"
else
  echo "❌ Backend process failed to start"
  echo "Last 50 lines of backend log:"
  tail -50 /tmp/backend.log
  exit 1
fi
```

- バックエンドプロセスをバックグラウンドで起動
- 10秒間の待機後、プロセスが実際に実行中であることを確認
- プロセスが失敗した場合、デバッグ用にログの最後の50行を表示

### 3. ログ出力の改善

```bash
nohup node dist/main.js > /tmp/backend.log 2>&1 &
```

- 標準出力と標準エラー出力の両方を `/tmp/backend.log` にリダイレクト
- 起動失敗時のデバッグを容易にする

### 4. クリーンアップの修正

```bash
if [ -f backend/backend.pid ]; then
  echo "🧹 Cleaning up backend process..."
  kill $(cat backend/backend.pid) || true
  rm backend/backend.pid
fi
if [ -f /tmp/backend.log ]; then
  echo "📝 Final backend log (last 20 lines):"
  tail -20 /tmp/backend.log
fi
```

- 正しいパス (`backend/backend.pid`) を参照
- 常に最終的なログを表示してデバッグを支援

## テスト

修正後、以下を確認してください:

1. CI/CD パイプラインの「Cloud Run Compatibility」ジョブが成功すること
2. Health check endpoint が 200 OK を返すこと
3. ビルドとプロセス起動のログが明確に表示されること

## 関連ファイル

- `.github/workflows/ci-cd.yml`: CI/CD ワークフロー定義
- `backend/src/main.ts`: バックエンドエントリーポイント
- `backend/src/health/health.controller.ts`: Health check エンドポイント実装

## 参考リンク

- [GitHub Actions: バックグラウンドプロセス](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-system-path)
- [Bash コマンドの同期実行](https://www.gnu.org/software/bash/manual/html_node/Lists.html)
