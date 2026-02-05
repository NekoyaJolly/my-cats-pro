# Cloud Run デプロイ前チェックリスト

本番環境へのデプロイ前に、このチェックリストを確認してください。

## 🔒 セキュリティ

- [ ] 依存関係に CRITICAL/HIGH の脆弱性がない
  ```bash
  pnpm audit --audit-level high --prod
  ```

- [ ] ソースコードに脆弱性がない
  ```bash
  trivy fs --severity CRITICAL,HIGH .
  ```

- [ ] `.env` ファイルや認証情報がコミットされていない
  ```bash
  git log --all --full-history -- "**/.env"
  ```

- [ ] Secret Manager でシークレットが適切に管理されている
  - DATABASE_URL (Supabase Transaction Pooler, port 6543)
  - DIRECT_URL (Supabase Direct Connection, port 5432)
  - JWT_SECRET
  - JWT_REFRESH_SECRET

## 📝 コード品質

- [ ] Lint チェックが **ゼロ警告** でパス
  ```bash
  # Backend
  cd backend && npm run lint -- --max-warnings=0
  
  # Frontend
  pnpm --filter frontend run lint
  ```

- [ ] TypeScript 型チェックがパス
  ```bash
  # Backend
  cd backend && npm run type-check
  
  # Frontend
  pnpm --filter frontend run type-check
  ```

- [ ] すべてのユニットテストがパス
  ```bash
  # Backend
  cd backend && npm run test
  
  # Frontend
  pnpm --filter frontend run test
  ```

- [ ] E2E テストがパス
  ```bash
  cd backend && npm run test:e2e
  ```

## 🐳 Docker & コンテナ

- [ ] Dockerfile が Hadolint でチェック済み
  ```bash
  hadolint Dockerfile.backend
  hadolint Dockerfile.frontend
  ```

- [ ] Docker イメージがビルド成功
  ```bash
  docker build -f Dockerfile.backend -t backend:test .
  docker build -f Dockerfile.frontend -t frontend:test .
  ```

- [ ] Docker イメージに脆弱性がない
  ```bash
  trivy image --severity CRITICAL,HIGH backend:test
  trivy image --severity CRITICAL,HIGH frontend:test
  ```

- [ ] Port 8080 が公開されている
  ```bash
  grep "EXPOSE 8080" Dockerfile.backend
  grep "EXPOSE 8080" Dockerfile.frontend
  ```

- [ ] コンテナが正常に起動する
  ```bash
  # Backend テスト
  docker run -d --name test-backend \
    -e DATABASE_URL="postgresql://test:test@localhost:5432/testdb" \
    -e JWT_SECRET="test-secret-key-minimum-32-chars-long" \
    -e NODE_ENV="production" \
    -e PORT=8080 \
    -p 8080:8080 \
    backend:test
  
  # 起動確認
  sleep 10
  docker ps | grep test-backend
  
  # クリーンアップ
  docker stop test-backend && docker rm test-backend
  ```

## ☁️ Cloud Run 互換性

- [ ] ヘルスチェックエンドポイントが動作
  ```bash
  # ローカルで Backend 起動後
  curl http://localhost:8080/health
  # 期待値: {"success":true,"data":{"status":"ok",...}}
  ```

- [ ] 環境変数が適切に設定されている
  - `PORT=8080`
  - `NODE_ENV=production`
  - データベース接続情報
  - JWT シークレット

- [ ] データベースマイグレーションが成功
  ```bash
  cd backend && npx prisma migrate deploy
  ```

- [ ] CORS 設定が正しい
  - `CORS_ORIGIN` が本番フロントエンドの URL に設定されている

- [ ] レスポンスタイムが 1 秒未満
  ```bash
  time curl http://localhost:8080/health
  ```

## 📦 ビルド成果物

- [ ] Backend ビルドが成功
  ```bash
  cd backend && npm run build
  ls -la dist/
  ```

- [ ] Frontend ビルドが成功
  ```bash
  pnpm --filter frontend run build
  ls -la frontend/.next/
  ```

- [ ] ビルド成果物のサイズが適切
  ```bash
  du -sh backend/dist
  du -sh frontend/.next
  ```

## ⚙️ Cloud Build 設定

- [ ] `cloudbuild.yaml` が存在し、有効
  ```bash
  cat cloudbuild.yaml
  ```

- [ ] 必須フィールドが設定されている
  - `steps`
  - `images`
  - `substitutions`

- [ ] 置換変数が正しく設定されている
  - `_LOCATION` (例: asia-northeast1)
  - `_REPO_NAME` (例: mycats-pro)
  - `_BACKEND_SERVICE_NAME`
  - `_FRONTEND_SERVICE_NAME`
  - `_NEXT_PUBLIC_API_URL`
  - `_CORS_ORIGIN`
  - `_CLOUD_SQL_CONNECTION_NAME`

## 🗄️ データベース

- [ ] Cloud SQL インスタンスが起動している
  ```bash
  gcloud sql instances describe mycats-prod-db
  ```

- [ ] データベースが作成されている
  ```bash
  gcloud sql databases list --instance=mycats-prod-db
  ```

- [ ] Secret Manager にデータベース認証情報が保存されている
  ```bash
  gcloud secrets versions access latest --secret=DATABASE_URL
  ```

- [ ] マイグレーションファイルが最新
  ```bash
  ls -la backend/prisma/migrations/
  ```

## 🔐 GCP 権限

- [ ] Cloud Build サービスアカウントに必要な権限がある
  - `roles/run.admin`
  - `roles/iam.serviceAccountUser`
  - Secret Manager へのアクセス権限

- [ ] Artifact Registry が作成されている
  ```bash
  gcloud artifacts repositories list
  ```

- [ ] 必要な API が有効化されている
  ```bash
  gcloud services list --enabled | grep -E "(run|cloudbuild|artifactregistry|secretmanager|sqladmin)"
  ```

## 📊 モニタリング準備

- [ ] Cloud Logging が有効
- [ ] Cloud Monitoring が設定されている
- [ ] アラートポリシーが設定されている（オプション）
- [ ] エラー通知の設定（オプション）

## 🚀 デプロイ前最終確認

- [ ] GitHub Actions の CI/CD がすべてパス
  - ✅ Security Scan
  - ✅ Lint & Type Check
  - ✅ Unit Tests
  - ✅ E2E Tests
  - ✅ Build
  - ✅ Dockerfile Validation
  - ✅ Docker Build & Security Scan
  - ✅ Cloud Run Compatibility Check
  - ✅ Production Deployment Readiness

- [ ] Pull Request がレビューされている
- [ ] `main` または `develop` ブランチにマージ準備完了
- [ ] デプロイのタイミングが適切（ピーク時間外など）
- [ ] ロールバックプランがある

## 📝 デプロイ手順

### 自動デプロイ（推奨）

1. Pull Request を `main` ブランチにマージ
2. GitHub Actions が自動的に実行
3. すべてのチェックがパス
4. Cloud Build がトリガー（設定されている場合）
5. Cloud Run にデプロイ

### 手動デプロイ

```bash
# Cloud Build を手動トリガー
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_LOCATION=asia-northeast1,_REPO_NAME=mycats-pro

# または GitHub Actions から手動実行
# Actionsタブ > CI/CD Pipeline > Run workflow
```

## 🔍 デプロイ後確認

- [ ] Cloud Run サービスが起動している
  ```bash
  gcloud run services list
  ```

- [ ] ヘルスチェックが成功
  ```bash
  curl https://mycats-pro-backend-XXXXXXXXXX-an.a.run.app/health
  ```

- [ ] フロントエンドがアクセス可能
  ```bash
  curl https://mycats-pro-frontend-XXXXXXXXXX-an.a.run.app
  ```

- [ ] ログにエラーがない
  ```bash
  gcloud run services logs read mycats-pro-backend --limit=50
  gcloud run services logs read mycats-pro-frontend --limit=50
  ```

- [ ] データベース接続が成功している
- [ ] API エンドポイントが正常に動作
- [ ] 認証フローが動作している

## ⚠️ トラブルシューティング

### デプロイが失敗した場合

1. GitHub Actions ログを確認
2. Cloud Build ログを確認
   ```bash
   gcloud builds list --limit=5
   gcloud builds log [BUILD_ID]
   ```
3. Cloud Run サービスログを確認
   ```bash
   gcloud run services logs read [SERVICE_NAME] --limit=100
   ```

### ロールバックが必要な場合

```bash
# 以前のリビジョンを確認
gcloud run revisions list --service=[SERVICE_NAME]

# 特定のリビジョンにロールバック
gcloud run services update-traffic [SERVICE_NAME] \
  --to-revisions=[REVISION_NAME]=100
```

## 📞 サポート

問題が発生した場合：

1. `CICD_PRODUCTION_GUIDE.md` のトラブルシューティングセクションを確認
2. GitHub Actions ログを確認
3. Cloud Console でサービスの状態を確認
4. チームに連絡

---

**このチェックリストをすべてクリアしてからデプロイしてください！**
