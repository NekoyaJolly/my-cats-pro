# GCP デプロイメントガイド

MyCats Pro を Google Cloud 環境へ安全にデプロイするための統合ガイドです。Cloud Run + Cloud SQL + Artifact Registry を前提とし、従来のオンプレ／Docker 手順は廃止しました。

---

## 1. プロジェクト概要

| 項目 | 値 |
| --- | --- |
| GCP プロジェクト | `my-cats-pro` |
| リージョン | `asia-northeast1` (東京) |
| 本番データベース | Cloud SQL / PostgreSQL 15 (`mycats-prod-db`) |
| アーティファクトレジストリ | `asia-northeast1-docker.pkg.dev/my-cats-pro/mycats-pro` |
| 本番サービス | Cloud Run (`mycats-pro-backend`, `mycats-pro-frontend`) |
| CI/CD | Cloud Build (`cloudbuild.yaml`) |

---

## 2. 基盤セットアップ

### 2.1 有効化済み API

- Cloud SQL Admin API (`sqladmin.googleapis.com`)
- Cloud Run API (`run.googleapis.com`)
- Artifact Registry API (`artifactregistry.googleapis.com`)
- Cloud Build API (`cloudbuild.googleapis.com`)
- Secret Manager API (`secretmanager.googleapis.com`)
- Compute Engine / Cloud Billing API

確認コマンド:

```bash
gcloud services list --enabled | grep -E "sqladmin|run|artifact|cloudbuild|secret"
```

### 2.2 Secret Manager

| シークレット | 用途 |
| --- | --- |
| `DATABASE_URL` | Cloud SQL 接続文字列 (`sslmode=require` 推奨) |
| `DB_PASSWORD` | DB ユーザーパスワード |
| `JWT_SECRET` | アクセストークン署名キー |
| `JWT_REFRESH_SECRET` | リフレッシュトークン署名キー |

```bash
# 最新バージョンの取得例
gcloud secrets versions access latest --secret=DATABASE_URL
```

### 2.3 Cloud SQL

- インスタンス: `mycats-prod-db` (db-f1-micro, `asia-northeast1-b`)
- DB 名: `mycats_production`
- ユーザー: `mycats_prod`
- 自動バックアップ: 有効 (03:00 JST)

```bash
# 接続テスト
gcloud sql connect mycats-prod-db --user=mycats_prod --database=mycats_production
```

### 2.4 Artifact Registry

```text
asia-northeast1-docker.pkg.dev/my-cats-pro/mycats-pro/backend:TAG
asia-northeast1-docker.pkg.dev/my-cats-pro/mycats-pro/frontend:TAG
```

### 2.5 IAM 権限

Cloud Build サービスアカウント (`$PROJECT_NUMBER@cloudbuild.gserviceaccount.com`) に以下を付与します。

- `roles/run.admin`
- `roles/iam.serviceAccountUser`
- `roles/artifactregistry.writer`
- `roles/cloudsql.client`
- `roles/secretmanager.secretAccessor`

Cloud Run 実行サービスアカウントには `roles/secretmanager.secretAccessor` と `roles/cloudsql.client` を割り当ててください。

---

## 3. デプロイメントパイプライン

### 3.1 事前チェック

```bash
git pull origin main
pnpm install --frozen-lockfile
pnpm -w run lint
pnpm -w run test:e2e -- --passWithNoTests
pnpm --filter backend run build
pnpm --filter frontend run build
pnpm -w run db:generate
```

### 3.2 Cloud Build トリガー

`cloudbuild.yaml` に定義済み。main ブランチ push で自動実行されます。

手動実行例:

```bash
gcloud builds submit --config cloudbuild.yaml --substitutions _LOCATION="asia-northeast1",_REPO_NAME="mycats-pro",_BACKEND_SERVICE_NAME="mycats-pro-backend",_FRONTEND_SERVICE_NAME="mycats-pro-frontend",_NEXT_PUBLIC_API_URL="https://backend.example.com/api/v1",_CORS_ORIGIN="https://frontend.example.com"
```

### 3.3 Cloud Run 更新

Cloud Build が以下を実行します。

1. Backend / Frontend の Docker イメージをビルドして Artifact Registry に push
2. `DATABASE_URL` などの Secret をマウント
3. `--add-cloudsql-instances` で Cloud SQL をアタッチ
4. `PORT=8080` で起動 (Cloud Run 予約値に上書きしない)

---

## 4. Cloud Run チェックリスト

| カテゴリ | 確認項目 |
| --- | --- |
| 環境変数 | `PORT` や `K_SERVICE` 等の予約変数を上書きしない |
| Dockerfile | `EXPOSE 8080`、`process.env.PORT` を参照、Prisma 生成済み、`prisma/` ディレクトリをコピー |
| Backend | `prisma` は dependencies、`npx prisma generate` 実行、マイグレーションファイルを含める |
| Frontend | `NEXT_PUBLIC_*` を `--set-env-vars` 経由で渡す、`next build` がローカルで成功する |
| Cloud Build | 未使用の置換変数を削除、Secret Manager の参照名を確認、Cloud SQL 接続名を `PROJECT:REGION:INSTANCE` 形式で設定 |
| Secret Manager | `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET` が最新、Cloud Build/Run に `secretAccessor` 権限を付与 |
| Cloud SQL | インスタンス稼働中、DB/ユーザー作成済み、Cloud Run からの接続を許可 |
| IAM | Cloud Build に Run/Admin/Artifact/Secret/SQL 権限、Cloud Run に Secret/SQL 権限 |

---

## 5. データベースマイグレーション

Cloud Build の `Migrate Database` ステップで `pnpm prisma migrate deploy` を実行します。手動で適用する場合は以下を参照してください。

```bash
export DATABASE_URL=$(gcloud secrets versions access latest --secret=DATABASE_URL)
cd backend
pnpm prisma migrate deploy
```

---

## 6. デプロイ後検証

```bash
# Cloud Build 状態
gcloud builds list --limit=5

# Cloud Run サービス URL
gcloud run services describe mycats-pro-backend \
  --region=asia-northeast1 --format="value(status.url)"

gcloud run services describe mycats-pro-frontend \
  --region=asia-northeast1 --format="value(status.url)"

# ヘルスチェック
curl -f "$BACKEND_URL"/health
curl -f "$FRONTEND_URL"

# ログ確認
gcloud run services logs read mycats-pro-backend --region=asia-northeast1 --limit 100
```

---

## 7. 運用・監視ポイント

| 項目 | コマンド例 |
| --- | --- |
| サービス稼働確認 | `gcloud run services list --region=asia-northeast1` |
| ログ監視 | `gcloud run services logs read <service> --tail` |
| Cloud SQL 状態 | `gcloud sql instances describe mycats-prod-db` |
| ヘルスチェック | `curl -f "$BACKEND_URL"/health` |
| 監視ルール | Cloud Monitoring でレイテンシ (<500ms) / エラー率 (<1%) を通知 |

詳細な監視・バックアップ・障害対応は `docs/operations.md` を参照してください。

---

## 8. トラブルシューティング

| 症状 | 原因 | 対応 |
| --- | --- | --- |
| `PORT environment variable is reserved` | Cloud Run 予約変数を上書き | `cloudbuild.yaml` から `PORT` の手動設定を削除する |
| `prisma: command not found` | Prisma が devDependencies にある | `prisma` を `dependencies` に移動し、Dockerfile で `npx prisma generate` 実行 |
| `Error: P1001 Can't reach database` | Cloud SQL 接続設定ミス | 接続名、IAM 権限、Secret を確認し、Cloud SQL Proxy 経由でテスト |
| `Cannot find module '@prisma/client'` | Prisma Client 未生成 | Dockerfile に `RUN pnpm prisma generate` を追加 |
| Cloud Build 失敗 | Cloud SQL/Secret 権限不足 | `gcloud projects add-iam-policy-binding` で権限を再付与し、再実行 |
| Cloud Run 500 | 環境変数不足 | `gcloud run services describe` で設定を確認し、`cloudbuild.yaml` の substitutions を更新 |

---

## 9. 関連ドキュメント

- `cloudbuild.yaml` (CI/CD 定義)
- `docs/operations.md` (監視・障害対応ランブック)
- `docs/system-design.md` (アーキテクチャ)
- `docs/api-specification.md`
- `TROUBLESHOOTING.md` (共通トラブル対処)

---

**最終更新**: 2025-11-17
