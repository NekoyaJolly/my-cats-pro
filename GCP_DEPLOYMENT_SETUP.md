# 🚀 GCP本番環境セットアップ完了レポート

**作成日時**: 2025年11月13日  
**プロジェクト**: my-cats-pro  
**プロジェクト番号**: 518939509282

## ✅ 完了した設定

### 1. GCPプロジェクト設定
- ✅ プロジェクトID: `my-cats-pro`
- ✅ リージョン: `asia-northeast1` (東京)
- ✅ 請求アカウント: 有効

### 2. 有効化されたAPI
- ✅ Cloud SQL Admin API (`sqladmin.googleapis.com`)
- ✅ Cloud Run API (`run.googleapis.com`)
- ✅ Cloud Build API (`cloudbuild.googleapis.com`)
- ✅ Artifact Registry API (`artifactregistry.googleapis.com`)
- ✅ Secret Manager API (`secretmanager.googleapis.com`)
- ✅ Compute Engine API (`compute.googleapis.com`)
- ✅ Cloud Billing API (`cloudbilling.googleapis.com`)

### 3. Secret Manager（本番用シークレット）
以下のシークレットが作成・保存されています：

| シークレット名 | 用途 | 状態 |
|--------------|------|------|
| `DATABASE_URL` | PostgreSQL接続文字列 | ✅ 作成済み |
| `DB_PASSWORD` | データベースパスワード | ✅ 作成済み |
| `JWT_SECRET` | JWTアクセストークン署名鍵 | ✅ 作成済み |
| `JWT_REFRESH_SECRET` | JWTリフレッシュトークン署名鍵 | ✅ 作成済み |

**確認コマンド**:
```bash
gcloud secrets list
```

### 4. Cloud SQL（本番用データベース）

#### インスタンス情報
- **インスタンス名**: `mycats-prod-db`
- **PostgreSQLバージョン**: 15
- **マシンタイプ**: `db-f1-micro` (0.6GB RAM)
- **リージョン**: `asia-northeast1-b`
- **パブリックIP**: `34.84.58.114`
- **状態**: RUNNABLE ✅
- **自動バックアップ**: 有効（毎日03:00 JST）

#### データベース
- **データベース名**: `mycats_production`
- **ユーザー名**: `mycats_prod`
- **パスワード**: Secret Managerに保存済み（`DB_PASSWORD`）

**接続文字列の取得**:
```bash
gcloud secrets versions access latest --secret=DATABASE_URL
```

**直接接続（デバッグ用）**:
```bash
gcloud sql connect mycats-prod-db --user=mycats_prod --database=mycats_production
```

### 5. Artifact Registry（Dockerイメージリポジトリ）
- **リポジトリ名**: `mycats-pro`
- **形式**: Docker
- **ロケーション**: `asia-northeast1`
- **暗号化**: Google管理キー

**イメージプッシュURL**:
```
asia-northeast1-docker.pkg.dev/my-cats-pro/mycats-pro/backend:latest
asia-northeast1-docker.pkg.dev/my-cats-pro/mycats-pro/frontend:latest
```

### 6. IAM権限設定
Cloud Buildサービスアカウントに以下の権限を付与済み：

- ✅ `roles/run.admin` - Cloud Runサービスのデプロイ権限
- ✅ `roles/iam.serviceAccountUser` - サービスアカウント使用権限
- ✅ Secret Managerへのアクセス権限（全シークレット）

### 7. cloudbuild.yaml更新
以下の修正を適用しました：

1. `JWT_REFRESH_SECRET`を`availableSecrets`に追加
2. バックエンドデプロイに以下を追加：
   - `JWT_REFRESH_SECRET`シークレットのマウント
   - `PORT=8080`環境変数（Cloud Runデフォルト）
   - Cloud SQLインスタンス接続設定

## 🔧 次のステップ

### 1. 初回デプロイ実行

```bash
# Cloud Buildトリガーを手動実行するか、mainブランチにプッシュ
git add .
git commit -m "feat: GCP本番環境設定完了"
git push origin main
```

### 2. デプロイ後の確認

```bash
# Cloud Buildのログを確認
gcloud builds list --limit=5

# デプロイされたCloud Runサービスを確認
gcloud run services list --region=asia-northeast1

# バックエンドURLを取得
gcloud run services describe mycats-pro-backend \
  --region=asia-northeast1 \
  --format="value(status.url)"

# フロントエンドURLを取得
gcloud run services describe mycats-pro-frontend \
  --region=asia-northeast1 \
  --format="value(status.url)"
```

### 3. データベースマイグレーション

初回デプロイ時、Cloud BuildのMigrate Databaseステップで自動的に実行されます。

**手動実行する場合**:
```bash
# DATABASE_URLを取得
export DATABASE_URL=$(gcloud secrets versions access latest --secret=DATABASE_URL)

# Prismaマイグレーション実行
cd backend
pnpm prisma migrate deploy
```

### 4. 環境変数の更新

デプロイ後、`cloudbuild.yaml`の`substitutions`セクションを更新：

```yaml
substitutions:
  _LOCATION: 'asia-northeast1'
  _REPO_NAME: 'mycats-pro'
  _BACKEND_SERVICE_NAME: 'mycats-pro-backend'
  _FRONTEND_SERVICE_NAME: 'mycats-pro-frontend'
  _NEXT_PUBLIC_API_URL: '<バックエンドのCloud Run URL>/api/v1'
  _CORS_ORIGIN: '<フロントエンドのCloud Run URL>'
```

## 🔒 セキュリティ推奨事項

### 実施済み
- ✅ すべてのシークレットをSecret Managerで管理
- ✅ データベースパスワードをランダム生成
- ✅ Cloud SQL自動バックアップ有効化
- ✅ SSL/TLS接続を強制（`sslmode=require`）

### 今後の推奨対応
- [ ] Cloud SQL Private IP設定（VPCピアリング）
- [ ] Cloud Armorでレート制限・DDoS対策
- [ ] Cloud Loggingで監視・アラート設定
- [ ] Secret Managerのローテーション設定
- [ ] Cloud Run認証設定（`--allow-unauthenticated`を削除）
- [ ] カスタムドメイン設定

## 📊 コスト見積もり

### 月間概算（無料枠含む）
- **Cloud SQL (db-f1-micro)**: 約 ¥1,500/月
- **Cloud Run**: 従量課金（低トラフィックなら無料枠内）
- **Secret Manager**: ¥100/月未満
- **Cloud Build**: 120分/日まで無料
- **Artifact Registry**: 0.5GB まで無料

**合計**: 約 ¥2,000〜¥3,000/月（低トラフィック想定）

## 🆘 トラブルシューティング

### Cloud Buildが失敗する場合
```bash
# 最新のビルドログを確認
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
```

### データベース接続できない場合
```bash
# Cloud SQLインスタンスの状態確認
gcloud sql instances describe mycats-prod-db

# 接続テスト
gcloud sql connect mycats-prod-db --user=mycats_prod
```

### シークレットにアクセスできない場合
```bash
# 権限確認
gcloud secrets get-iam-policy DATABASE_URL
```

## 📚 関連ドキュメント

- [cloudbuild.yaml](./cloudbuild.yaml) - CI/CDパイプライン定義
- [docs/production-deployment.md](./docs/production-deployment.md) - 本番デプロイガイド
- [docs/DATABASE_DEPLOYMENT_GUIDE.md](./docs/DATABASE_DEPLOYMENT_GUIDE.md) - データベースデプロイ手順

## 🎉 セットアップ完了！

本番環境の基盤が整いました。次は実際にデプロイして動作確認を行ってください。

---

**問い合わせ**: プロジェクトオーナー nekonokawase@gmail.com
