# デプロイバージョン管理 - クイックリファレンス

## 🚀 デプロイ実行

GitHub Actions から実行する:

1. Actions タブで "Deploy Only" を選択
2. "Run workflow" → 環境を選択して実行

## ✅ デプロイ確認（3つの方法）

### 方法1: 自動検証スクリプト（推奨）

```bash
./scripts/verify-deployment.sh production   # 本番
./scripts/verify-deployment.sh staging      # ステージング
```

### 方法2: curl コマンド

```bash
# 本番
curl https://nekoya.co.jp/api/debug-version | jq

# ステージング  
curl https://mycats-pro-frontend-staging-687406216678.asia-northeast1.run.app/api/debug-version | jq
```

### 方法3: ブラウザ

- 本番: https://nekoya.co.jp/api/debug-version
- ステージング: https://mycats-pro-frontend-staging-XXX.run.app/api/debug-version

## 🔍 確認ポイント

```json
{
  "gitCommit": "be3f6d6...",     // ← ローカルの `git rev-parse HEAD` と一致するか
  "buildTime": "2026-02-13...",  // ← 最近の時刻か
  "nodeEnv": "production",       // ← 環境に応じた値か
  "nextPublicApiUrl": "..."      // ← 正しい API URL か
}
```

## ⚠️ トラブルシューティング

### 古いコードが表示される

1. ブラウザキャッシュをクリア（`Cmd+Shift+R` / `Ctrl+Shift+R`）
2. シークレットモードで確認
3. デバッグエンドポイントでコミットハッシュを確認

### gitCommit が "unknown"

- 原因: GitHub Actions で GITHUB_SHA が渡されていない
- 対処: 最新のブランチからデプロイを再実行

### buildTime が "unknown"

- 原因: GitHub Actions で BUILD_TIME が渡されていない
- 対処: 最新のブランチからデプロイを再実行

## 📊 Cloud Run 確認コマンド

```bash
# リビジョン一覧
gcloud run revisions list \
  --service=mycats-pro-frontend \
  --region=asia-northeast1

# トラフィック配分確認
gcloud run services describe mycats-pro-frontend \
  --region=asia-northeast1 \
  --format='value(status.traffic)'

# ログ確認
gcloud run services logs read mycats-pro-frontend \
  --region=asia-northeast1 \
  --limit=50
```

## 🔄 ロールバック

```bash
# 前のリビジョンに戻す
gcloud run services update-traffic mycats-pro-frontend \
  --region=asia-northeast1 \
  --to-revisions=REVISION_NAME=100
```

## 📈 ビルド時間の確認

```bash
# 最近のビルド履歴
gcloud builds list \
  --region=asia-northeast1 \
  --limit=10 \
  --format='table(id,createTime,duration,status)'

# 平均ビルド時間
gcloud builds list \
  --region=asia-northeast1 \
  --limit=10 \
  --format='value(duration)' | \
  awk '{sum+=$1; count++} END {print sum/count " seconds"}'
```

## 📚 関連ドキュメント

- **問題詳細**: `docs/DEPLOYMENT_VERSION_ISSUE.md`
- **デプロイ手順**: `docs/DEPLOYMENT_GUIDE.md`
- **最適化**: `docs/DOCKER_BUILD_OPTIMIZATION.md`
- **完全版サマリー**: `docs/DEPLOYMENT_VERSION_SOLUTION_SUMMARY.md`

## 💡 ベストプラクティス

✅ デプロイ前: `pnpm lint && pnpm build && pnpm test`  
✅ デプロイ後: `./scripts/verify-deployment.sh [env]`  
✅ 問題発生時: デバッグエンドポイントを最初に確認

## 🎯 期待されるビルド時間

- **変更前**: 3-5分
- **変更後**: 8-12分（`--no-cache` 使用）
- **将来の最適化後**: 5-7分（コミットタグ戦略）

---

**更新日**: 2026-02-13  
**バージョン**: 1.0
