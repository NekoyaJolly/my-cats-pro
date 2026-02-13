# デプロイバージョン不一致問題 - 調査と解決策

## 問題の概要

Cloud Run へのデプロイは成功しているが、実際にブラウザで表示される内容が古いままになっている問題。
特に血統書管理ページのモバイル最適化（コミット 760f5ce, 50aae26）が反映されていない。

## 原因分析

### 1. Docker イメージのタグ戦略の問題

**問題点**: 
- 現在、フロントエンドとバックエンドの Docker イメージは常に `:latest` タグで保存されている
- コミットハッシュやビルド時刻などのバージョン情報がイメージに含まれていない
- Cloud Run は同じタグのイメージを再プルする際、キャッシュされた古いレイヤーを使用する可能性がある

**該当ファイル**: `cloudbuild.yaml` line 15, 27, 41, 49

```yaml
# 問題のあるタグ付け
- '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:latest'
```

### 2. Next.js ビルドキャッシュの問題

**問題点**:
- Dockerfile のマルチステージビルドで、前回のビルド結果（`.next` ディレクトリ）がキャッシュされる
- Docker のレイヤーキャッシュにより、コードが変更されていても古いビルド成果物が使用される可能性がある

**該当ファイル**: `Dockerfile.frontend` line 23-38

### 3. ビルドメタデータの欠如

**問題点**:
- デプロイされたコードがどのコミットから生成されたか追跡できない
- ビルド時刻の記録がない
- デプロイ後にバージョンを確認する手段がない

## 実装した解決策

### 1. デバッグエンドポイントの追加

**ファイル**: `frontend/src/app/api/debug-version/route.ts`

デプロイされたアプリケーションのバージョン情報を取得できるエンドポイントを追加。

**アクセス方法**:
- 本番環境: `https://nekoya.co.jp/api/debug-version`
- ステージング環境: `https://mycats-pro-frontend-staging-XXX.run.app/api/debug-version`

**レスポンス例**:
```json
{
  "timestamp": "2026-02-13T16:30:00.000Z",
  "gitCommit": "f4161a0586ef7997525b2427224505be91ac5cec",
  "buildTime": "2026-02-13T16:25:00Z",
  "expectedCommit": "f4161a0586ef7997525b2427224505be91ac5cec",
  "message": "血統書モバイル最適化版 - 2026-02-08 22:35",
  "nodeEnv": "production",
  "nextPublicApiUrl": "https://api.nekoya.co.jp/api/v1",
  "buildMetadata": {
    "dockerBuildArg": "not-set",
    "ciSystem": "GitHub Actions",
    "timezone": "Asia/Tokyo"
  }
}
```

### 2. Dockerfile の改善

**変更内容** (`Dockerfile.frontend`):
- ビルド時に `GITHUB_SHA` と `BUILD_TIME` を ARG として受け取る
- これらを環境変数として Next.js ビルドに注入
- Next.js のビルドプロセスで環境変数として利用可能にする

```dockerfile
# ビルド時環境変数: バージョン追跡用
ARG GITHUB_SHA
ARG BUILD_TIME

# Next.js ビルドに環境変数を注入
ENV GITHUB_SHA=${GITHUB_SHA}
ENV BUILD_TIME=${BUILD_TIME}
```

### 3. Cloud Build 設定の改善

**変更内容** (`cloudbuild.yaml`):

#### a. Docker ビルドに `--no-cache` フラグを追加

```yaml
- '--no-cache'  # キャッシュを使用しない（最新のコードを確実にビルドするため）
```

**トレードオフ**:
- ✅ メリット: 毎回完全に新しいビルドを保証
- ⚠️ デメリット: ビルド時間が増加（依存関係のダウンロードとビルドを毎回実行）

#### b. ビルド引数の追加

```yaml
# Pass Git commit SHA for version tracking
- '--build-arg'
- 'GITHUB_SHA=${_GITHUB_SHA}'
# Pass build timestamp for version tracking
- '--build-arg'
- 'BUILD_TIME=${_BUILD_TIME}'
```

#### c. Substitutions に新しい変数を追加

```yaml
substitutions:
  # ... 既存の変数 ...
  # Build metadata for version tracking
  _GITHUB_SHA: 'unknown'
  _BUILD_TIME: 'unknown'
```

### 4. GitHub Actions デプロイワークフローの改善

**変更内容** (`.github/workflows/deploy-only.yml`):

#### ステージングとプロダクション両方に適用:

```bash
# ビルドメタデータをバージョン追跡用に追加
BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

SUBSTITUTIONS="${SUBSTITUTIONS},_GITHUB_SHA=${{ github.sha }}"
SUBSTITUTIONS="${SUBSTITUTIONS},_BUILD_TIME=${BUILD_TIME}"
```

**動作**:
- GitHub Actions の `${{ github.sha }}` から現在のコミットハッシュを取得
- UTC タイムゾーンで現在のビルド時刻を記録
- これらを Cloud Build に渡す

## 検証方法

### 1. ローカルでのテスト

デプロイ前にローカルで debug endpoint の動作を確認:

```bash
cd frontend
pnpm dev
```

次に別のターミナルで:
```bash
curl http://localhost:3000/api/debug-version | jq
```

### 2. デプロイ後の確認

#### ステージング環境:

```bash
curl https://mycats-pro-frontend-staging-XXX.asia-northeast1.run.app/api/debug-version | jq
```

または:
```bash
gcloud run services describe mycats-pro-frontend-staging \
  --region=asia-northeast1 \
  --project=YOUR_PROJECT_ID \
  --format='value(status.url)' | \
  xargs -I {} curl {}/api/debug-version | jq
```

#### 本番環境:

```bash
curl https://nekoya.co.jp/api/debug-version | jq
```

### 3. 期待される結果

- `gitCommit` が最新のコミットハッシュと一致すること
- `buildTime` が最近のデプロイ時刻であること
- `expectedCommit` と `gitCommit` が一致すること（最新版がデプロイされている証拠）

### 4. デプロイが成功しているかの確認

```bash
# 期待されるコミットを確認
EXPECTED_COMMIT="f4161a0586ef7997525b2427224505be91ac5cec"

# 実際にデプロイされているコミットを取得
ACTUAL_COMMIT=$(curl -s https://nekoya.co.jp/api/debug-version | jq -r '.gitCommit')

# 比較
if [ "$EXPECTED_COMMIT" = "$ACTUAL_COMMIT" ]; then
  echo "✅ デプロイ成功: 期待されるコミットがデプロイされています"
else
  echo "❌ デプロイ失敗: 期待されるコミット: $EXPECTED_COMMIT, 実際: $ACTUAL_COMMIT"
fi
```

## 今後のデプロイフロー

### 推奨される運用フロー:

1. **コードをプッシュ**
   ```bash
   git push origin main
   ```

2. **GitHub Actions でデプロイ**
   - Actions タブから "Deploy Only" ワークフローを手動実行
   - 環境（staging / production / both）を選択
   - デプロイが完了するまで待つ

3. **デプロイの確認**
   ```bash
   # バージョンエンドポイントで確認
   curl https://nekoya.co.jp/api/debug-version | jq
   
   # コミットハッシュを確認
   git rev-parse HEAD
   ```

4. **問題があれば調査**
   - `gitCommit` が期待と異なる場合 → Cloud Build のログを確認
   - `buildTime` が古い場合 → Docker イメージのキャッシュ問題を疑う
   - API が 404 を返す場合 → デプロイ自体が失敗している可能性

## トラブルシューティング

### 問題: デプロイ後も古いコードが表示される

**確認項目**:

1. **Cloud Run のリビジョンを確認**
   ```bash
   gcloud run revisions list \
     --service=mycats-pro-frontend \
     --region=asia-northeast1
   ```

2. **トラフィックの割り当てを確認**
   ```bash
   gcloud run services describe mycats-pro-frontend \
     --region=asia-northeast1 \
     --format='value(status.traffic)'
   ```

3. **デバッグエンドポイントで実際のバージョンを確認**
   ```bash
   curl https://nekoya.co.jp/api/debug-version
   ```

4. **ブラウザのキャッシュをクリア**
   - ハードリロード: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
   - シークレットモードで確認

### 問題: `--no-cache` でビルド時間が長すぎる

**オプション**:

1. **条件付きキャッシュクリア**
   - 重要な変更時のみ `--no-cache` を使用
   - 通常のデプロイはキャッシュを活用

2. **イメージタグにコミットハッシュを含める**
   ```yaml
   # cloudbuild.yaml
   - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:${_GITHUB_SHA}'
   - '${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/frontend:latest'
   ```
   
   この方法なら `--no-cache` なしでも、新しいコミットは新しいイメージとして作成される。

## まとめ

### 実装した変更:

1. ✅ デバッグエンドポイント `/api/debug-version` を追加
2. ✅ Docker ビルドに `--no-cache` フラグを追加
3. ✅ ビルド時に `GITHUB_SHA` と `BUILD_TIME` を注入
4. ✅ GitHub Actions から Cloud Build にメタデータを渡す

### 効果:

- デプロイされたバージョンを即座に確認可能
- 古いキャッシュが使用されるリスクを排除
- デプロイの成功/失敗を明確に判定可能

### 次のステップ（オプション）:

1. **イメージタグの改善**: `:latest` だけでなく、`:${COMMIT_SHA}` も追加
2. **自動テスト**: デプロイ後に自動で `/api/debug-version` を確認するスクリプトを追加
3. **アラート**: 期待されるコミットと実際のコミットが異なる場合に通知

## 参考情報

- Next.js Standalone Output: https://nextjs.org/docs/pages/api-reference/next-config-js/output
- Docker Multi-stage Builds: https://docs.docker.com/build/building/multi-stage/
- Cloud Build Substitutions: https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values
- GitHub Actions Context: https://docs.github.com/en/actions/learn-github-actions/contexts#github-context
