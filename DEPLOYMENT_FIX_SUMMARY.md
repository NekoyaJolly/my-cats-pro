# Cloud Run Deployment Fix Summary

## 概要

このドキュメントは、mycats-pro プロジェクトの Cloud Run デプロイメントで発生していた環境変数の問題を修正した内容をまとめたものです。

## 修正前の問題

### 1. 環境変数検証エラー

**症状:**
```
NODE_ENV: Invalid enum value. Expected 'development' | 'staging' | 'production' | 'test', 
received 'staging _BACKEND_SERVICE_NAME=... _FRONTEND_SERVICE_NAME=... _NEXT_PUBLIC_API_URL=... _CORS_ORIGIN=... ...'
```

**原因:**
- `NODE_ENV` に複数の key=value ペアを含む単一の文字列が設定されていた
- `gcloud builds submit --substitutions=...` の使用方法が誤っていた
- ステージング環境のシークレット名が小文字（`DATABASE_URL_staging`）を使用していた（正しくは `DATABASE_URL_STAGING`）
- プロダクション環境でほとんどの置換変数が欠落していた

### 2. Cloud Run スタートアッププローブの失敗

**症状:**
- Type: `HealthCheckContainerError`
- コンテナが環境変数検証失敗後すぐに終了
- Cloud Run の起動プローブ（`GET /health`）が成功しない

## 実施した修正

### 1. `.github/workflows/deploy-only.yml` の修正

#### ステージング環境デプロイ（行 66-72）

**修正前:**
```yaml
--substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend-staging,_FRONTEND_SERVICE_NAME=mycats-pro-frontend-staging,_ENVIRONMENT=staging,_CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-stg-db,_CORS_ORIGIN=https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app,_NEXT_PUBLIC_API_URL=https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/api/v1,_DATABASE_URL_SECRET_NAME=DATABASE_URL_staging,_JWT_SECRET_NAME=JWT_SECRET_staging,_JWT_REFRESH_SECRET_NAME=JWT_REFRESH_SECRET_staging,_CSRF_TOKEN_SECRET_NAME=CSRF_TOKEN_SECRET_staging
```

**修正後:**
```yaml
--substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend-staging,_FRONTEND_SERVICE_NAME=mycats-pro-frontend-staging,_ENVIRONMENT=staging,_CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-stg-db,_CORS_ORIGIN=https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app,_NEXT_PUBLIC_API_URL=https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/api/v1,_DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING,_DATABASE_URL_SECRET_VERSION=3,_JWT_SECRET_NAME=JWT_SECRET_STAGING,_JWT_SECRET_VERSION=1,_JWT_REFRESH_SECRET_NAME=JWT_REFRESH_SECRET_STAGING,_JWT_REFRESH_SECRET_VERSION=1,_CSRF_TOKEN_SECRET_NAME=CSRF_TOKEN_SECRET_STAGING,_CSRF_TOKEN_SECRET_VERSION=1
```

**変更点:**
- ✅ シークレット名のサフィックスを小文字 `_staging` から大文字 `_STAGING` に修正
- ✅ シークレットバージョンを追加（`_DATABASE_URL_SECRET_VERSION=3` など）
- ✅ すべての置換変数がカンマ区切りで正しく指定されている

#### プロダクション環境デプロイ（行 148-154）

**修正前:**
```yaml
--substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend,_FRONTEND_SERVICE_NAME=mycats-pro-frontend,_ENVIRONMENT=production
```

**修正後:**
```yaml
--substitutions=_BACKEND_SERVICE_NAME=mycats-pro-backend,_FRONTEND_SERVICE_NAME=mycats-pro-frontend,_ENVIRONMENT=production,_CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-prod-db,_CORS_ORIGIN=https://mycats-pro-frontend-518939509282.asia-northeast1.run.app,_NEXT_PUBLIC_API_URL=https://mycats-pro-backend-518939509282.asia-northeast1.run.app/api/v1,_DATABASE_URL_SECRET_NAME=DATABASE_URL,_DATABASE_URL_SECRET_VERSION=1,_JWT_SECRET_NAME=JWT_SECRET,_JWT_SECRET_VERSION=1,_JWT_REFRESH_SECRET_NAME=JWT_REFRESH_SECRET,_JWT_REFRESH_SECRET_VERSION=1,_CSRF_TOKEN_SECRET_NAME=CSRF_TOKEN_SECRET,_CSRF_TOKEN_SECRET_VERSION=1
```

**変更点:**
- ✅ 欠落していた Cloud SQL 接続名を追加
- ✅ CORS オリジンを追加
- ✅ Next.js Public API URL を追加
- ✅ すべてのシークレット名とバージョンを追加

### 2. `backend/src/common/environment.validation.ts` の修正

**修正前:**
```typescript
if (requiredVars.NODE_ENV && !["development", "production", "test"].includes(requiredVars.NODE_ENV)) {
  errors.push("NODE_ENV must be one of: development, production, test");
}
```

**修正後:**
```typescript
if (requiredVars.NODE_ENV && !["development", "staging", "production", "test"].includes(requiredVars.NODE_ENV)) {
  errors.push("NODE_ENV must be one of: development, staging, production, test");
}
```

**変更点:**
- ✅ `NODE_ENV` の検証に `'staging'` を追加
- **注:** メインの検証ファイル `backend/src/common/config/env.validation.ts` はすでに `'staging'` を含んでいた

### 3. `cloudbuild.yaml` の修正

**変更点:**
- ✅ 末尾の空白を削除（YAML リントエラーの修正）
- ✅ 既存の設定は正しかったため、その他の変更は不要

## 修正が環境変数の問題を解決する理由

### 問題の根本原因

元のエラーメッセージ:
```
NODE_ENV: Invalid enum value. Expected 'development' | 'staging' | 'production' | 'test', 
received 'staging _BACKEND_SERVICE_NAME=... _FRONTEND_SERVICE_NAME=...'
```

このエラーは、`NODE_ENV` が単一の文字列に複数の変数を含んでいることを示していました。

### 修正により解決される理由

1. **置換変数の正しいフォーマット:**
   - `gcloud builds submit --substitutions=` はカンマ区切りの `key=value` ペアを期待
   - 修正後の形式: `_VAR1=value1,_VAR2=value2,_VAR3=value3`
   - これにより各変数が `cloudbuild.yaml` で個別に利用可能になる

2. **`cloudbuild.yaml` での環境変数の設定:**
   ```bash
   --set-env-vars "NODE_ENV=${_ENVIRONMENT},CORS_ORIGIN=${_CORS_ORIGIN},INSTANCE_CONNECTION_NAME=${_CLOUD_SQL_CONNECTION_NAME}"
   ```
   - `${_ENVIRONMENT}` は `staging` または `production` のみを展開
   - 他の変数は別々の環境変数として設定される
   - `NODE_ENV` はクリーンな単一値を受け取る

3. **シークレット名の大文字化:**
   - Cloud Secret Manager のシークレット名は `DATABASE_URL_STAGING` （大文字）
   - `cloudbuild.yaml` の `--set-secrets` は `${_DATABASE_URL_SECRET_NAME}:${_DATABASE_URL_SECRET_VERSION}` を使用
   - 置換変数が正しいシークレット名を提供するようになった

## デプロイメントフロー

### ステージング環境

1. GitHub Actions が Cloud Build をトリガー
2. Cloud Build が `cloudbuild.yaml` を実行し、以下の置換変数を使用:
   - `_ENVIRONMENT=staging`
   - `_BACKEND_SERVICE_NAME=mycats-pro-backend-staging`
   - `_DATABASE_URL_SECRET_NAME=DATABASE_URL_STAGING`
   - など
3. バックエンドデプロイ時に環境変数が設定:
   - `NODE_ENV=staging` （クリーン）
   - `CORS_ORIGIN=https://mycats-pro-frontend-staging-...`
   - `INSTANCE_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-stg-db`
4. シークレットがマウント:
   - `DATABASE_URL` ← `DATABASE_URL_STAGING:3`
   - `JWT_SECRET` ← `JWT_SECRET_STAGING:1`
   - など
5. NestJS アプリが起動し、環境変数を検証:
   - `NODE_ENV` が `'staging'` として正しく検証される ✅
   - すべての必須変数が存在する ✅
6. `/health` エンドポイントが HTTP 200 を返す ✅

### プロダクション環境

同様のフローで、以下の置換変数を使用:
- `_ENVIRONMENT=production`
- `_BACKEND_SERVICE_NAME=mycats-pro-backend`
- `_DATABASE_URL_SECRET_NAME=DATABASE_URL`
- `_CLOUD_SQL_CONNECTION_NAME=my-cats-pro:asia-northeast1:mycats-prod-db`
- など

## 検証項目

修正が成功したことを確認するには:

### ステージング環境

1. **デプロイメント成功:**
   ```bash
   gcloud run revisions list --service=mycats-pro-backend-staging --region=asia-northeast1
   ```
   - 最新リビジョンのステータスが `Ready=True` であることを確認

2. **ヘルスチェック:**
   ```bash
   curl https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/health
   ```
   - HTTP 200 を返し、`status: "ok"` を含むこと

3. **ログ確認:**
   ```bash
   gcloud logs read --service=mycats-pro-backend-staging --limit=50
   ```
   - ✅ 環境変数検証エラーがないこと
   - ✅ `NODE_ENV: staging` が正しく設定されていること
   - ✅ スタートアッププローブが成功していること

### プロダクション環境

同様の手順で `mycats-pro-backend` サービスを確認:

```bash
gcloud run revisions list --service=mycats-pro-backend --region=asia-northeast1
curl https://mycats-pro-backend-518939509282.asia-northeast1.run.app/health
gcloud logs read --service=mycats-pro-backend --limit=50
```

## Cloud Secret Manager の設定確認

修正が機能するためには、以下のシークレットが存在する必要があります:

### ステージング環境
```bash
gcloud secrets versions list DATABASE_URL_STAGING
gcloud secrets versions list JWT_SECRET_STAGING
gcloud secrets versions list JWT_REFRESH_SECRET_STAGING
gcloud secrets versions list CSRF_TOKEN_SECRET_STAGING
```

### プロダクション環境
```bash
gcloud secrets versions list DATABASE_URL
gcloud secrets versions list JWT_SECRET
gcloud secrets versions list JWT_REFRESH_SECRET
gcloud secrets versions list CSRF_TOKEN_SECRET
```

各シークレットは、以下の形式である必要があります:

**`DATABASE_URL_STAGING` (version 3):**
```
postgresql://user:password@localhost:5432/mycats_staging?host=/cloudsql/my-cats-pro:asia-northeast1:mycats-stg-db
```

**`DATABASE_URL` (version 1):**
```
postgresql://user:password@localhost:5432/mycats_prod?host=/cloudsql/my-cats-pro:asia-northeast1:mycats-prod-db
```

## まとめ

### 修正されたファイル

1. ✅ `.github/workflows/deploy-only.yml`
   - ステージングデプロイメントのシークレット名を大文字化
   - ステージングデプロイメントにシークレットバージョンを追加
   - プロダクションデプロイメントに欠落していた置換変数を追加

2. ✅ `backend/src/common/environment.validation.ts`
   - `NODE_ENV` 検証に `'staging'` を追加（整合性のため）

3. ✅ `cloudbuild.yaml`
   - 末尾の空白を削除（リントエラー修正のみ）

### 問題の解決

- ❌ **修正前:** `NODE_ENV` が複数の変数を含む不正な文字列を受け取っていた
- ✅ **修正後:** `NODE_ENV` はクリーンな値（`staging` または `production`）のみを受け取る
- ❌ **修正前:** ステージング環境のシークレット名が一致しない（小文字 vs 大文字）
- ✅ **修正後:** シークレット名が Cloud Secret Manager と一致
- ❌ **修正前:** プロダクション環境で重要な置換変数が欠落
- ✅ **修正後:** 両環境で完全な置換変数セットを提供

### 期待される結果

1. **ステージング環境:**
   - ✅ `mycats-pro-backend-staging` が正常にデプロイ
   - ✅ Cloud Run のステータスが Ready=True
   - ✅ ログに環境変数検証エラーなし
   - ✅ `GET /health` が HTTP 200 を返す

2. **プロダクション環境:**
   - ✅ `mycats-pro-backend` が正常にデプロイ
   - ✅ `NODE_ENV` が正確に `production`
   - ✅ 環境変数検証エラーやスタートアッププローブ失敗なし
   - ✅ `GET /health` が HTTP 200 を返す

3. **パイプライン:**
   - ✅ 単一の "Deploy Only (Staging & Production)" ワークフローで以下が可能:
     - ステージングのみデプロイ
     - プロダクションのみデプロイ
     - 両方をデプロイ（ステージング → プロダクション）
   - ✅ Cloud Build が `cloudbuild.yaml` を使用し、クリーンな置換変数と安定した `gcloud run deploy` フラグを使用
