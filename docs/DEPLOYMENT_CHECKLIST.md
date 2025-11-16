# Cloud Run デプロイメント チェックリスト

このドキュメントは、Cloud Runへのデプロイ前に確認すべき項目をまとめたものです。

## 🚫 禁止事項（Cloud Run予約済み）

### 環境変数
- [ ] `PORT` - Cloud Runが自動設定（**絶対に手動設定しない**）
- [ ] `K_SERVICE` - サービス名（自動設定）
- [ ] `K_REVISION` - リビジョン名（自動設定）
- [ ] `K_CONFIGURATION` - 設定名（自動設定）
- [ ] `X_GOOGLE_*` - Google予約プレフィックス

## ✅ 必須確認事項

### Dockerfile
- [ ] `EXPOSE` ポートを指定（推奨: 8080）
- [ ] アプリケーションが`process.env.PORT`を読み取る実装になっている
- [ ] 本番環境で必要な依存関係が全てインストールされている
- [ ] Alpine Linuxの場合、必要なシステムライブラリ（openssl, libc6-compatなど）がインストールされている（バージョン指定なしで自動解決を推奨）

### Backend (Prisma)
- [ ] `prisma` パッケージが `dependencies` に含まれている（devDependenciesではない）
- [ ] `prisma/` ディレクトリ全体（migrationsを含む）がDockerイメージにコピーされている
- [ ] 本番ステージで `prisma generate` が実行されている
- [ ] マイグレーションコマンドにスキーマパスが明示されている（`--schema=./prisma/schema.prisma`）

### Cloud Build (cloudbuild.yaml)
- [ ] 置換変数（substitutions）に未定義の変数がない
- [ ] 使用していない置換変数は削除されている
- [ ] Secret Managerのシークレットが正しく参照されている
- [ ] Cloud SQL接続名が正しい形式（`PROJECT_ID:REGION:INSTANCE`）
- [ ] リソース制限（memory, cpu）が適切に設定されている

### Frontend (Next.js)
- [ ] ビルド時の環境変数（`NEXT_PUBLIC_*`）が正しく渡されている
- [ ] ビルド引数として `ARG` と `ENV` が設定されている
- [ ] 本番ビルドが成功することを確認済み

### Secret Manager
- [ ] 必要なシークレットが全て登録されている
  - [ ] `DATABASE_URL`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
- [ ] Cloud BuildとCloud Runのサービスアカウントに権限が付与されている
  - [ ] `roles/secretmanager.secretAccessor`

### Cloud SQL
- [ ] データベースインスタンスが存在する
- [ ] 接続名が正しい
- [ ] Cloud RunサービスにCloud SQL接続が追加されている（`--add-cloudsql-instances`）
- [ ] データベースが作成済み
- [ ] ユーザーが作成済み

### IAM権限
- [ ] Cloud Build サービスアカウント
  - [ ] Artifact Registry書き込み権限
  - [ ] Cloud Run管理者権限
  - [ ] Secret Manager読み取り権限
  - [ ] Cloud SQL Client権限
- [ ] Cloud Run サービスアカウント
  - [ ] Secret Manager読み取り権限
  - [ ] Cloud SQL Client権限

## 🔍 デプロイ後の確認

### サービスの起動確認
```bash
# サービスが起動しているか確認
gcloud run services describe SERVICE_NAME --region REGION

# ログを確認
gcloud run services logs read SERVICE_NAME --region REGION --limit 50
```

### マイグレーション確認
```bash
# コンテナに入ってマイグレーションステータス確認
gcloud run services proxy SERVICE_NAME --region REGION
# 別のターミナルで
docker exec -it CONTAINER_ID npx prisma migrate status
```

### エンドポイント確認
```bash
# バックエンドのヘルスチェック
curl https://SERVICE_URL/health

# フロントエンドの確認
curl https://FRONTEND_URL
```

## 📋 トラブルシューティング

### よくあるエラー

#### 1. `PORT environment variable is reserved`
**原因:** `--set-env-vars` で `PORT` を設定している  
**解決:** cloudbuild.yamlから `PORT=8080` を削除

#### 2. `prisma: command not found`
**原因:** prismaがdevDependenciesにある、またはイメージに含まれていない  
**解決:** package.jsonでprismaをdependenciesに移動

#### 3. `Error: P1001: Can't reach database server`
**原因:** Cloud SQL接続の設定ミス  
**解決:** 
- 接続名を確認
- IAM権限を確認
- データベースが起動しているか確認

#### 4. `Cannot find module '@prisma/client'`
**原因:** Prisma Clientが生成されていない  
**解決:** Dockerfile で `RUN npx prisma generate` を追加

#### 5. `Migration directory not found`
**原因:** migrationsディレクトリがイメージにコピーされていない  
**解決:** `COPY backend/prisma ./prisma/` で全体をコピー

#### 6. Alpine Linuxパッケージバージョン競合エラー
**エラー例:**
```
gcompat-1.1.0-r4: breaks: world[libc6-compat=1.2.5-r8]
openssl-3.5.4-r0: breaks: world[openssl=3.3.2-r4]
```
**原因:** Dockerfileでopensslやlibc6-compatのバージョンを固定している  
**解決:** ベースイメージのAlpineバージョンを固定し、パッケージは自動解決に任せる
```dockerfile
# ❌ 避けるべき（ローリングリリースで固定バージョン）
FROM node:20-alpine
RUN apk add --no-cache openssl=3.3.2-r4 libc6-compat=1.2.5-r8

# ✅ 推奨（ベースイメージを固定し、hadolintルールを明示的に無効化）
FROM node:20-alpine3.22
# hadolint ignore=DL3018
RUN apk add --no-cache openssl libc6-compat
```
**理由:** 
- Alpine Linuxベースイメージのバージョンを固定することで、再現可能なビルドを保証
- パッケージバージョンの固定は、そのAlpineバージョンとの互換性問題を引き起こす
- hadolint DL3018ルールは、ベースイメージが固定されている場合は意図的に無視できる

#### 7. hadolint DL3018 警告
**警告:** `Pin versions in apk add`  
**原因:** hadolintがパッケージバージョンの固定を推奨している  
**解決:** ベースイメージのバージョンを固定し、必要に応じてhadolintルールを無効化
```dockerfile
# ベースイメージを固定
FROM node:20-alpine3.22

# 明示的にルールを無効化（理由をコメントで説明）
# hadolint ignore=DL3018
RUN apk add --no-cache openssl libc6-compat
```

## 🚀 推奨フロー

### 初回デプロイ
1. Secret Managerにシークレットを登録
2. IAM権限を設定
3. Cloud SQLインスタンスを作成
4. `gcloud builds submit` でデプロイ
5. サービスURLを取得して `cloudbuild.yaml` の `_NEXT_PUBLIC_API_URL` と `_CORS_ORIGIN` を更新
6. 再度デプロイ

### 2回目以降
1. コードをコミット
2. `gcloud builds submit` でデプロイ
3. ログでエラーがないか確認

## 📚 参考リンク

- [Cloud Run環境変数](https://cloud.google.com/run/docs/configuring/services/environment-variables)
- [Cloud Run シークレット](https://cloud.google.com/run/docs/configuring/secrets)
- [Cloud SQL接続](https://cloud.google.com/sql/docs/mysql/connect-run)
- [Prisma本番デプロイ](https://www.prisma.io/docs/guides/deployment/deployment-guides)
