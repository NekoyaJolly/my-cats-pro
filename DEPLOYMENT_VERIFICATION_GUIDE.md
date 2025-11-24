# Deployment Verification Guide

このガイドは、Cloud Run デプロイメントの修正が正しく機能することを確認するための手順を説明します。

## 前提条件

以下のツールとアクセス権が必要です:

- Google Cloud SDK (`gcloud` CLI) がインストール済み
- GCP プロジェクト `my-cats-pro` へのアクセス権
- GitHub リポジトリへのアクセス権
- 必要な権限:
  - Cloud Run サービスの閲覧
  - Cloud Build の閲覧/実行
  - Secret Manager の閲覧
  - ログの閲覧

## ステップ 1: ローカル検証（デプロイ前）

### 1.1 設定ファイルの検証

リポジトリのルートディレクトリで検証スクリプトを実行:

```bash
cd /path/to/my-cats-pro
./scripts/validate-deployment-config.sh
```

**期待される結果:**
```
🎉 All critical checks passed! Configuration looks good.
```

すべてのチェックが PASS であることを確認してください。

### 1.2 YAML 構文の確認

```bash
# GitHub Actions ワークフローの確認
yamllint .github/workflows/deploy-only.yml

# Cloud Build 設定の確認
yamllint cloudbuild.yaml
```

### 1.3 環境変数検証コードの確認

```bash
# NODE_ENV に 'staging' が含まれていることを確認
grep "NODE_ENV.*enum" backend/src/common/config/env.validation.ts
# 期待される出力: z.enum(['development', 'staging', 'production', 'test'])
```

## ステップ 2: Cloud Secret Manager の確認

### 2.1 ステージング環境のシークレット

```bash
# GCP プロジェクトの設定
gcloud config set project my-cats-pro

# ステージング環境のシークレットを確認
gcloud secrets describe DATABASE_URL_STAGING
gcloud secrets describe JWT_SECRET_STAGING
gcloud secrets describe JWT_REFRESH_SECRET_STAGING
gcloud secrets describe CSRF_TOKEN_SECRET_STAGING

# バージョンの確認
gcloud secrets versions list DATABASE_URL_STAGING
# version 3 が存在することを確認
```

**期待される出力:**
各シークレットが存在し、指定されたバージョンが有効（enabled）であること。

### 2.2 プロダクション環境のシークレット

```bash
# プロダクション環境のシークレットを確認
gcloud secrets describe DATABASE_URL
gcloud secrets describe JWT_SECRET
gcloud secrets describe JWT_REFRESH_SECRET
gcloud secrets describe CSRF_TOKEN_SECRET

# バージョンの確認
gcloud secrets versions list DATABASE_URL
# version 1 が存在することを確認
```

## ステップ 3: GitHub Actions でのステージングデプロイ

### 3.1 ワークフローのトリガー

1. GitHub リポジトリに移動: https://github.com/NekoyaJolly/my-cats-pro
2. `Actions` タブをクリック
3. 左サイドバーで `Deploy Only (Staging & Production)` を選択
4. 右上の `Run workflow` をクリック
5. `Environment to deploy` で **`staging`** を選択
6. `Run workflow` をクリック

### 3.2 デプロイの監視

#### Cloud Build の確認

```bash
# 最新のビルドを確認
gcloud builds list --limit=1 --region=asia-northeast1

# ビルドログを確認（BUILD_ID を置き換え）
gcloud builds log BUILD_ID --region=asia-northeast1
```

**確認ポイント:**
- ビルドが `SUCCESS` で完了すること
- ログに環境変数検証エラーがないこと
- `NODE_ENV=staging` が正しく設定されていること

#### GitHub Actions ログの確認

GitHub Actions のワークフロー実行ページで:
- ✅ `Deploy to Staging` ジョブが成功すること
- ✅ `Test Staging Health Endpoint` が HTTP 200 を返すこと

### 3.3 ステージング環境の検証

#### 3.3.1 Cloud Run サービスの状態確認

```bash
# バックエンドサービスの確認
gcloud run services describe mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --format="value(status.conditions)"

# 最新リビジョンの確認
gcloud run revisions list \
  --service=mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --limit=1
```

**期待される結果:**
```
Ready=True
```

#### 3.3.2 ヘルスチェックエンドポイントの確認

```bash
# バックエンドのヘルスチェック
curl -v https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/health

# フロントエンドの確認
curl -v https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app
```

**期待される結果（バックエンド）:**
```json
HTTP/2 200
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-11-24T...",
    "service": "Cat Management System API",
    "version": "1.0.0",
    "environment": "staging",
    "uptime": 123.456,
    "memory": {
      "used": 89.45,
      "total": 512.00
    },
    "database": "ok"
  }
}
```

#### 3.3.3 ログの確認

```bash
# バックエンドのログを確認
gcloud logs read \
  --resource-type=cloud_run_revision \
  --log-filter='resource.labels.service_name="mycats-pro-backend-staging"' \
  --limit=50 \
  --format="table(timestamp, severity, textPayload)"
```

**確認ポイント:**
- ❌ **エラーがないこと:** `環境変数のバリデーションに失敗しました` が表示されないこと
- ✅ **正しい設定:** `NODE_ENV: staging` が表示されること
- ✅ **起動成功:** `Application is running on: http://localhost:8080` が表示されること
- ✅ **DB 接続成功:** Prisma 接続エラーがないこと

特に以下のログメッセージを確認:
```
📋 環境変数の設定:
  NODE_ENV: staging
  PORT: 8080
  ...
✅ staging environment validation passed
🚀 Application is running on: http://localhost:8080
```

#### 3.3.4 環境変数の確認

```bash
# バックエンドサービスの環境変数を確認
gcloud run services describe mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --format="yaml(spec.template.spec.containers[0].env)"
```

**期待される結果:**
```yaml
- name: NODE_ENV
  value: staging
- name: CORS_ORIGIN
  value: https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app
- name: INSTANCE_CONNECTION_NAME
  value: my-cats-pro:asia-northeast1:mycats-stg-db
```

#### 3.3.5 シークレットの確認

```bash
# マウントされたシークレットを確認
gcloud run services describe mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --format="yaml(spec.template.spec.containers[0].env)" | grep -A2 "valueFrom"
```

**期待される結果:**
```yaml
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      key: '3'
      name: DATABASE_URL_STAGING
- name: JWT_SECRET
  valueFrom:
    secretKeyRef:
      key: '1'
      name: JWT_SECRET_STAGING
...
```

## ステップ 4: プロダクション環境でのデプロイ（ステージング成功後）

### 4.1 ワークフローのトリガー

ステージング環境が正常に動作していることを確認した後:

1. GitHub Actions で `Deploy Only (Staging & Production)` を実行
2. `Environment to deploy` で **`production`** を選択
3. `Run workflow` をクリック

### 4.2 プロダクション環境の検証

ステージング環境と同様の手順で、以下を確認:

```bash
# バックエンドサービスの状態
gcloud run services describe mycats-pro-backend \
  --region=asia-northeast1

# ヘルスチェック
curl https://mycats-pro-backend-518939509282.asia-northeast1.run.app/health

# ログの確認
gcloud logs read \
  --resource-type=cloud_run_revision \
  --log-filter='resource.labels.service_name="mycats-pro-backend"' \
  --limit=50
```

**確認ポイント:**
- `NODE_ENV: production` が正しく設定されていること
- すべてのシークレット（`DATABASE_URL`, `JWT_SECRET` など）が正しくマウントされていること
- Cloud SQL 接続名が `my-cats-pro:asia-northeast1:mycats-prod-db` であること

## ステップ 5: トラブルシューティング

### 問題: 環境変数検証エラーが継続

**症状:**
```
❌ 環境変数のバリデーションに失敗しました:
  - NODE_ENV: Invalid enum value...
```

**確認事項:**
1. `deploy-only.yml` の `--substitutions` が正しいか
2. シークレット名が大文字（例: `DATABASE_URL_STAGING`）か
3. `cloudbuild.yaml` の `--set-env-vars` 構文が正しいか

### 問題: シークレットが見つからない

**症状:**
```
ERROR: Secret [DATABASE_URL_STAGING] not found
```

**解決方法:**
```bash
# シークレットの存在確認
gcloud secrets list | grep DATABASE_URL

# 存在しない場合は作成
gcloud secrets create DATABASE_URL_STAGING \
  --data-file=- <<< "postgresql://user:pass@localhost:5432/mycats_staging?host=/cloudsql/my-cats-pro:asia-northeast1:mycats-stg-db"
```

### 問題: Health Check Failure

**症状:**
Cloud Run がコンテナを起動できず、ヘルスチェックが失敗する。

**確認事項:**
```bash
# 最新のリビジョンログを確認
gcloud run revisions list \
  --service=mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --limit=1

# 失敗したリビジョンのログを確認
gcloud logs read \
  --resource-type=cloud_run_revision \
  --log-filter='resource.labels.service_name="mycats-pro-backend-staging" AND severity>=ERROR' \
  --limit=100
```

## ステップ 6: ロールバック（必要に応じて）

デプロイに問題がある場合、前のリビジョンにロールバック:

```bash
# 利用可能なリビジョンを確認
gcloud run revisions list \
  --service=mycats-pro-backend-staging \
  --region=asia-northeast1

# 前のリビジョンにロールバック（REVISION_NAME を置き換え）
gcloud run services update-traffic mycats-pro-backend-staging \
  --to-revisions=REVISION_NAME=100 \
  --region=asia-northeast1
```

## チェックリスト

デプロイ前の最終確認:

- [ ] `./scripts/validate-deployment-config.sh` がすべて PASS
- [ ] Cloud Secret Manager にすべてのシークレットが存在
- [ ] シークレット名が大文字（`_STAGING` サフィックス）
- [ ] `cloudbuild.yaml` に末尾の空白がない
- [ ] 環境変数検証に `'staging'` が含まれる

デプロイ後の確認:

- [ ] Cloud Run サービスのステータスが `Ready=True`
- [ ] `/health` エンドポイントが HTTP 200 を返す
- [ ] ログに環境変数検証エラーがない
- [ ] `NODE_ENV` が正しい値（`staging` or `production`）
- [ ] Database 接続が成功

## サポート情報

- **問題報告:** GitHub Issues に報告
- **ドキュメント:** `DEPLOYMENT_FIX_SUMMARY.md` を参照
- **ログ:** Cloud Run と Cloud Build のログを確認

## 参考リンク

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Prisma Cloud SQL Documentation](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-gcp-cloud-run)
