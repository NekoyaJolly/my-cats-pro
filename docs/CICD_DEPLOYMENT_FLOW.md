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
_ENVIRONMENT=staging
```

### 本番環境

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend,\
_FRONTEND_SERVICE_NAME=mycats-pro-frontend,\
_ENVIRONMENT=production
```

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
- `cloud-run-backend-staging@my-cats-pro.iam.gserviceaccount.com`
- `cloud-run-frontend-staging@my-cats-pro.iam.gserviceaccount.com`

#### 本番環境
- `cloud-run-backend@my-cats-pro.iam.gserviceaccount.com`
- `cloud-run-frontend@my-cats-pro.iam.gserviceaccount.com`

### Secret Manager

環境ごとに以下のシークレットを作成：

#### ステージング環境
- `DATABASE_URL_staging`
- `JWT_SECRET_staging`
- `JWT_REFRESH_SECRET_staging`
- `CSRF_TOKEN_SECRET_staging`

#### 本番環境
- `DATABASE_URL_production`
- `JWT_SECRET_production`
- `JWT_REFRESH_SECRET_production`
- `CSRF_TOKEN_SECRET_production`

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
