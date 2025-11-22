# CI/CDデプロイメントフロー

## 概要

このドキュメントでは、mycats-proプロジェクトのCI/CDパイプラインとデプロイメントフローについて説明します。

## パイプライン構成

### 1. テスト & ビルドフェーズ

すべてのブランチで実行されるジョブ：

1. **Security Scan** - セキュリティスキャン（Trivy、pnpm audit）
2. **Lint & Type Check** - TypeScript型チェックとLint
3. **Unit Tests** - ユニットテスト（バックエンド・フロントエンド）
4. **E2E Tests** - E2Eテスト（バックエンド）
5. **Build** - プロダクションビルド
6. **Cloud Run Validation** - Cloud Run互換性チェック
7. **Deployment Readiness** - デプロイ準備確認

### 2. デプロイメントフェーズ

#### ステージング環境デプロイ

- **トリガー**: `main` または `develop` ブランチへのプッシュ
- **デプロイ先**:
  - Backend: `mycats-pro-backend-staging`
  - Frontend: `mycats-pro-frontend-staging`
- **実行条件**: すべてのテストとビルドが成功
- **承認**: 不要（自動実行）

#### 本番環境デプロイ

- **トリガー**: `main` ブランチへのプッシュのみ
- **デプロイ先**:
  - Backend: `mycats-pro-backend`
  - Frontend: `mycats-pro-frontend`
- **実行条件**: ステージング環境デプロイが成功
- **承認**: GitHub Environmentの設定により制御可能

## デプロイフロー

### mainブランチ

```
コミット/PR マージ
    ↓
セキュリティスキャン
    ↓
Lint & 型チェック
    ↓
ユニットテスト
    ↓
E2Eテスト
    ↓
ビルド
    ↓
Cloud Run互換性チェック
    ↓
デプロイ準備確認
    ↓
ステージング環境デプロイ ← 自動実行
    ↓
本番環境デプロイ ← 自動実行（承認設定可能）
```

### developブランチ

```
コミット/PR マージ
    ↓
（テストフェーズは同じ）
    ↓
ステージング環境デプロイのみ
```

## 削除されたジョブ

以前のパイプラインから以下のDockerテストジョブが削除されました：

1. **dockerfile-validation** - Dockerfileのlintとベストプラクティスチェック
2. **docker-build-and-scan** - Dockerイメージビルドと脆弱性スキャン

### 削除理由

- これらのテストが失敗してもデプロイを実行できるようにするため
- Cloud Buildが実際のDockerイメージビルドを担当するため
- CI/CD実行時間の短縮

## 環境別設定

### ステージング環境

`cloudbuild.yaml`の実行時に以下の変数を指定：

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend-staging,\
_FRONTEND_SERVICE_NAME=mycats-pro-frontend-staging,\
_ENVIRONMENT=staging,\
_CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-stg-db,\
_CORS_ORIGIN=https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app,\
_NEXT_PUBLIC_API_URL=https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/api/v1
```

**ステージング環境のCloud Run設定:**
- **Backend Service Name**: `mycats-pro-backend-staging`
- **Frontend Service Name**: `mycats-pro-frontend-staging`
- **Backend Service Account**: `cloud-run-backend-staging@my-cats-pro.iam.gserviceaccount.com`
- **Frontend Service Account**: `cloud-run-frontend-staging@my-cats-pro.iam.gserviceaccount.com`
- **NODE_ENV**: `staging`
- **Backend URL**: `https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app`
- **Frontend URL**: `https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app`
- **CORS_ORIGIN**: staging frontend URL
- **NEXT_PUBLIC_API_URL**: staging backend API URL

**ステージング環境のCloud SQL設定:**
- **インスタンス名**: `mycats-stg-db`
- **接続名**: `my-cats-pro:asia-northeast1:mycats-stg-db`
- **データベース**: ステージング専用のデータベースを使用
- **Secret Manager**: `DATABASE_URL_staging` シークレットに接続文字列を保存
- **Cloud Run 環境変数**: `INSTANCE_CONNECTION_NAME` に接続名が設定される
- **デプロイ時の指定**: GitHub Actions の `deploy-staging` ジョブで `_CLOUD_SQL_CONNECTION_NAME` を明示的に指定

### 本番環境

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend,\
_FRONTEND_SERVICE_NAME=mycats-pro-frontend,\
_ENVIRONMENT=production
```

**本番環境のCloud Run設定:**
- **Backend Service Name**: `mycats-pro-backend`
- **Frontend Service Name**: `mycats-pro-frontend`
- **Backend Service Account**: `cloud-run-backend@my-cats-pro.iam.gserviceaccount.com`
- **Frontend Service Account**: `cloud-run-frontend@my-cats-pro.iam.gserviceaccount.com`
- **NODE_ENV**: `production`
- **Backend URL**: `https://mycats-pro-backend-518939509282.asia-northeast1.run.app`
- **Frontend URL**: `https://mycats-pro-frontend-518939509282.asia-northeast1.run.app`
- **CORS_ORIGIN**: production frontend URL (デフォルト値を使用)
- **NEXT_PUBLIC_API_URL**: production backend API URL (デフォルト値を使用)

**本番環境のCloud SQL設定:**
- **インスタンス名**: `mycats-prod-db`
- **接続名**: `my-cats-pro:asia-northeast1:mycats-prod-db` (デフォルト)
- **データベース**: `mycats_production`
- **Secret Manager**: `DATABASE_URL_production` シークレットに接続文字列を保存
- **Cloud Run 環境変数**: `INSTANCE_CONNECTION_NAME` に接続名が設定される
- **デプロイ時の指定**: `cloudbuild.yaml` のデフォルト値を使用（明示的な指定は不要）

## 必要なGitHub Secrets

CI/CDパイプラインを実行するために、以下のGitHub Secretsを設定する必要があります：

- `GCP_SA_KEY`: Google Cloud サービスアカウントのJSONキー
- `GCP_PROJECT_ID`: Google Cloud プロジェクトID（`my-cats-pro`）

### Secretsの設定方法

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」をクリック
3. 上記のSecretsを追加

## 必要なGCP設定

### サービスアカウント

以下のサービスアカウントが必要です：

#### ステージング環境
- **Backend**: `cloud-run-backend-staging@my-cats-pro.iam.gserviceaccount.com`
  - Cloud Run で Backend サービスを実行するために使用
  - Cloud SQL インスタンス `mycats-stg-db` への接続権限が必要
  - Secret Manager のステージング用シークレットへのアクセス権限が必要
- **Frontend**: `cloud-run-frontend-staging@my-cats-pro.iam.gserviceaccount.com`
  - Cloud Run で Frontend サービスを実行するために使用

#### 本番環境
- **Backend**: `cloud-run-backend@my-cats-pro.iam.gserviceaccount.com`
  - Cloud Run で Backend サービスを実行するために使用
  - Cloud SQL インスタンス `mycats-prod-db` への接続権限が必要
  - Secret Manager の本番用シークレットへのアクセス権限が必要
- **Frontend**: `cloud-run-frontend@my-cats-pro.iam.gserviceaccount.com`
  - Cloud Run で Frontend サービスを実行するために使用

**重要な変更点**: 
- Cloud Build はサービスアカウントを**メールアドレス形式で直接指定**します（例: `cloud-run-backend-staging@my-cats-pro.iam.gserviceaccount.com`）
- 以前の `projects/my-cats-pro/serviceAccounts/{EMAIL}` 形式は不要になりました
- Cloud Build 実行前に `gcloud config unset run/service-account` を実行し、デフォルトのサービスアカウント設定をクリアします
- これにより、Compute Engine のデフォルトサービスアカウント (`518939509282-compute@developer.gserviceaccount.com`) が誤って使用されることを防ぎます
- デバッグ出力により、デプロイ時に正しいサービスアカウントが使用されていることを確認できます

### Secret Manager

環境ごとに以下のシークレットを作成：

#### ステージング環境
- `DATABASE_URL_staging` - ステージング用Cloud SQLインスタンス(`mycats-stg-db`)への接続文字列
- `JWT_SECRET_staging`
- `JWT_REFRESH_SECRET_staging`
- `CSRF_TOKEN_SECRET_staging`

#### 本番環境
- `DATABASE_URL_production` - 本番用Cloud SQLインスタンス(`mycats-prod-db`)への接続文字列
- `JWT_SECRET_production`
- `JWT_REFRESH_SECRET_production`
- `CSRF_TOKEN_SECRET_production`

**Cloud SQL接続文字列の例:**
```
postgresql://[USER]:[PASSWORD]@localhost/[DATABASE]?host=/cloudsql/[CONNECTION_NAME]
```

ステージング環境の場合:
```
postgresql://mycats_stg:[PASSWORD]@localhost/mycats_staging?host=/cloudsql/my-cats-pro:asia-northeast1:mycats-stg-db
```

本番環境の場合:
```
postgresql://mycats_prod:[PASSWORD]@localhost/mycats_production?host=/cloudsql/my-cats-pro:asia-northeast1:mycats-prod-db
```

## デプロイの承認設定（オプション）

本番環境へのデプロイに手動承認を追加する場合：

1. GitHubリポジトリの「Settings」→「Environments」
2. `production` という名前の環境を作成
3. 「Required reviewers」を設定
4. デプロイ時に承認が必要になります

ステージング環境も同様に `staging` 環境を作成して制御できます。

## トラブルシューティング

### デプロイが失敗する場合

1. **GitHub Actions のログを確認**
   ```
   リポジトリ → Actions → 失敗したワークフロー → ログを確認
   ```

2. **Cloud Build のログを確認**
   ```bash
   gcloud builds list --limit=5
   gcloud builds log <BUILD_ID>
   ```

3. **Cloud Run サービスの状態を確認**
   ```bash
   gcloud run services list --region=asia-northeast1
   gcloud run services describe <SERVICE_NAME> --region=asia-northeast1
   ```

### よくある問題

#### Secret Manager のアクセス権限エラー

```bash
# サービスアカウントに権限を付与
gcloud secrets add-iam-policy-binding <SECRET_NAME> \
  --member="serviceAccount:<SERVICE_ACCOUNT>" \
  --role="roles/secretmanager.secretAccessor"
```

#### Cloud SQL 接続エラー

```bash
# Cloud SQLインスタンスの状態確認
gcloud sql instances describe mycats-prod-db

# Cloud Runサービスに正しいCloud SQL接続が設定されているか確認
gcloud run services describe <SERVICE_NAME> \
  --region=asia-northeast1 \
  --format="value(spec.template.spec.containers[0].env)"
```

## 参考資料

- [GitHub Actions ワークフロー](.github/workflows/ci-cd.yml)
- [Cloud Build 設定](../cloudbuild.yaml)
- [GCP デプロイメントセットアップ](../GCP_DEPLOYMENT_SETUP.md)
- [本番デプロイガイド](./production-deployment.md)
