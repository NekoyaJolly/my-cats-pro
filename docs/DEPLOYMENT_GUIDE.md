# デプロイガイド

本番環境およびステージング環境へのデプロイ手順とバージョン確認方法を説明します。

## 前提条件

- GitHub リポジトリへの push 権限
- GitHub Actions の実行権限
- （オプション）Google Cloud Console へのアクセス権

## デプロイ手順

### 1. コードの準備

```bash
# 最新のコードを取得
git checkout main
git pull origin main

# 変更をコミット
git add .
git commit -m "feat: 新機能の追加"
git push origin main
```

### 2. デプロイの実行

#### GitHub Actions から手動デプロイ

1. GitHub リポジトリページにアクセス
2. **Actions** タブをクリック
3. **Deploy Only (Staging & Production)** ワークフローを選択
4. **Run workflow** をクリック
5. デプロイ先の環境を選択:
   - `staging`: ステージング環境のみ
   - `production`: 本番環境のみ
   - `both`: ステージング → 本番の順にデプロイ
6. **Run workflow** ボタンをクリック

#### CI/CD パイプライン経由（自動）

main ブランチへの push 時、CI/CD パイプラインが自動的に実行されます：

1. セキュリティスキャン
2. Lint & 型チェック
3. ユニットテスト
4. E2E テスト
5. ビルド検証

すべてのチェックが通過した後、手動でデプロイワークフローを実行します。

### 3. デプロイの確認

#### 方法1: 検証スクリプトを使用（推奨）

```bash
# ステージング環境の確認
./scripts/verify-deployment.sh staging

# 本番環境の確認
./scripts/verify-deployment.sh production
```

出力例:
```
================================================
デプロイバージョン確認 - production
================================================

📡 デバッグエンドポイントにアクセス中...
   URL: https://nekoya.co.jp/api/debug-version

✅ レスポンス取得成功

📊 デプロイ情報:
  タイムスタンプ    : 2026-02-13T16:30:00.000Z
  Gitコミット       : f4161a0586ef7997525b2427224505be91ac5cec
  ビルド時刻        : 2026-02-13T16:25:00Z
  期待コミット      : f4161a0586ef7997525b2427224505be91ac5cec
  メッセージ        : 血統書モバイル最適化版 - 2026-02-08 22:35
  実行環境          : production
  API URL          : https://api.nekoya.co.jp/api/v1

🔍 バージョン検証:
✅ 期待されるコミットがデプロイされています
   コミット: f4161a0586ef7997525b2427224505be91ac5cec

✅ ビルド時刻が記録されています: 2026-02-13T16:25:00Z

✅ NODE_ENV が正しく設定されています: production

✅ API URL が本番環境を指しています
```

#### 方法2: 手動でエンドポイントにアクセス

```bash
# ステージング環境
curl https://mycats-pro-frontend-staging-687406216678.asia-northeast1.run.app/api/debug-version | jq

# 本番環境
curl https://nekoya.co.jp/api/debug-version | jq
```

#### 方法3: ブラウザでアクセス

- ステージング: https://mycats-pro-frontend-staging-687406216678.asia-northeast1.run.app/api/debug-version
- 本番: https://nekoya.co.jp/api/debug-version

### 4. コミットハッシュの確認

現在のローカルブランチのコミットハッシュを確認:

```bash
git rev-parse HEAD
```

デプロイされているコミットと一致することを確認します。

## トラブルシューティング

### 問題: デプロイ後も古いコードが表示される

#### 確認手順

1. **ブラウザのキャッシュをクリア**
   ```bash
   # ハードリロード
   # Mac: Cmd + Shift + R
   # Windows: Ctrl + Shift + R
   ```

2. **シークレットモードで確認**
   
   新しいシークレットウィンドウで該当URLにアクセス

3. **デバッグエンドポイントで確認**
   ```bash
   ./scripts/verify-deployment.sh production
   ```

4. **Cloud Run のリビジョンを確認**
   ```bash
   gcloud run revisions list \
     --service=mycats-pro-frontend \
     --region=asia-northeast1 \
     --project=YOUR_PROJECT_ID
   ```

5. **トラフィックの割り当てを確認**
   ```bash
   gcloud run services describe mycats-pro-frontend \
     --region=asia-northeast1 \
     --project=YOUR_PROJECT_ID \
     --format='value(status.traffic)'
   ```

### 問題: デプロイが失敗する

#### ログの確認

1. **GitHub Actions のログ**
   - Actions タブ → 失敗したワークフローをクリック
   - 各ステップのログを確認

2. **Cloud Build のログ**
   ```bash
   # Google Cloud Console でビルドログを確認
   # https://console.cloud.google.com/cloud-build/builds
   ```

3. **Cloud Run のログ**
   ```bash
   # サービスログの確認
   gcloud run services logs read mycats-pro-frontend \
     --region=asia-northeast1 \
     --limit=50
   ```

#### よくある原因

1. **環境変数の設定ミス**
   - GitHub Secrets が正しく設定されているか確認
   - `GCP_SA_KEY`, `GCP_PROJECT_ID`, `GCP_RUN_SA_FRONTEND`, `GCP_RUN_SA_BACKEND`

2. **権限の問題**
   - サービスアカウントに必要な権限があるか確認
   - Cloud Run Admin, Artifact Registry Writer など

3. **ビルドエラー**
   - Lint やテストが失敗していないか確認
   - `pnpm lint`, `pnpm test` をローカルで実行

4. **リソース不足**
   - Docker ビルドでメモリ不足が発生していないか確認

### 問題: バージョン情報が "unknown" と表示される

#### 原因と対処法

**gitCommit が "unknown"**:
- 原因: `GITHUB_SHA` 環境変数が Cloud Build に渡されていない
- 対処: `.github/workflows/deploy-only.yml` で `_GITHUB_SHA=${{ github.sha }}` が設定されているか確認

**buildTime が "unknown"**:
- 原因: `BUILD_TIME` 環境変数が Cloud Build に渡されていない
- 対処: `.github/workflows/deploy-only.yml` で `BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")` が設定されているか確認

## 環境別の設定

### ステージング環境

- **URL**: https://mycats-pro-frontend-staging-687406216678.asia-northeast1.run.app
- **API URL**: https://mycats-pro-backend-staging-687406216678.asia-northeast1.run.app/api/v1
- **Project ID**: （ステージングプロジェクトID）
- **用途**: 新機能のテスト、QA検証

### 本番環境

- **URL**: https://nekoya.co.jp
- **API URL**: https://api.nekoya.co.jp/api/v1
- **Project ID**: （本番プロジェクトID）
- **用途**: 実ユーザー向けサービス

## ベストプラクティス

### デプロイ前のチェックリスト

- [ ] ローカルでビルドが成功することを確認 (`pnpm build`)
- [ ] すべてのテストが通過することを確認 (`pnpm test`)
- [ ] Lint が通過することを確認 (`pnpm lint`)
- [ ] 型チェックが通過することを確認 (`pnpm type-check`)
- [ ] データベースマイグレーションが必要な場合、マイグレーションファイルを作成
- [ ] 変更内容を PR でレビュー済み

### デプロイ後のチェックリスト

- [ ] デバッグエンドポイントで正しいコミットがデプロイされていることを確認
- [ ] 主要な画面が正常に表示されることを確認
- [ ] API が正常に動作することを確認
- [ ] エラーログに異常がないことを確認
- [ ] パフォーマンスに問題がないことを確認

### 段階的なデプロイ

1. **ステージング環境にデプロイ**
   ```bash
   # GitHub Actions から staging 環境を選択してデプロイ
   ```

2. **ステージング環境でテスト**
   ```bash
   ./scripts/verify-deployment.sh staging
   # 手動でUIやAPIをテスト
   ```

3. **問題がなければ本番環境にデプロイ**
   ```bash
   # GitHub Actions から production 環境を選択してデプロイ
   ```

4. **本番環境で確認**
   ```bash
   ./scripts/verify-deployment.sh production
   # 主要な機能を確認
   ```

### ロールバック手順

問題が発生した場合、前のリビジョンに戻す:

```bash
# 前のリビジョンを確認
gcloud run revisions list \
  --service=mycats-pro-frontend \
  --region=asia-northeast1

# 特定のリビジョンにトラフィックを戻す
gcloud run services update-traffic mycats-pro-frontend \
  --region=asia-northeast1 \
  --to-revisions=REVISION_NAME=100
```

または、前のコミットを再デプロイ:

```bash
# 前のコミットをチェックアウト
git checkout PREVIOUS_COMMIT_HASH

# 再デプロイ
# GitHub Actions で Deploy Only を実行
```

## 参考資料

- [デプロイバージョン不一致問題の詳細](./DEPLOYMENT_VERSION_ISSUE.md)
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [GitHub Actions ドキュメント](https://docs.github.com/en/actions)
- [Next.js デプロイガイド](https://nextjs.org/docs/deployment)

## サポート

問題が解決しない場合:

1. GitHub Issues でイシューを作成
2. デバッグエンドポイントの出力を添付
3. 実行したコマンドとエラーメッセージを記載
4. 環境（staging / production）を明記
