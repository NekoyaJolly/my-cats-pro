# Supabase 接続設定ガイド

このドキュメントでは、Supabase PostgreSQL への接続設定方法と、Connection Pooler の使用方法について説明します。

## 📋 概要

Supabase は2種類の接続方法を提供しています:

1. **Transaction Pooler (推奨)** - ポート 6543
   - サーバーレス環境やコネクションプールが必要な環境で使用
   - PgBouncer による効率的なコネクション管理
   - **本番環境で推奨**

2. **Direct Connection** - ポート 5432
   - データベースマイグレーションの実行時に必要
   - 長時間接続やトランザクション制御が必要な場合に使用
   - 開発環境では直接接続も可能

## 🔧 Prisma 設定

### schema.prisma

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Transaction Pooler (port 6543)
  directUrl = env("DIRECT_URL")        // Direct Connection (port 5432)
}
```

- `url`: 通常のクエリ実行に使用（Transaction Pooler経由）
- `directUrl`: マイグレーション実行時に使用（Direct Connection経由）

## 🌐 環境変数設定

### 本番環境 (.env.production)

```bash
# Transaction Pooler（アプリケーション実行時）
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection（マイグレーション実行時）
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 開発環境 (.env.development)

開発環境では、状況に応じて選択できます:

#### オプション1: ローカル PostgreSQL（推奨）
```bash
DATABASE_URL="postgresql://runner:password@localhost:55432/mycats_development"
# DIRECT_URL は不要 - Prisma が DATABASE_URL をマイグレーションにも使用します
```

**注意**: ローカル PostgreSQL 使用時は `DIRECT_URL` は不要です（Prisma が `DATABASE_URL` をマイグレーションにも使用します）。

#### オプション2: Supabase 使用
```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**注意**: Supabase の Transaction Pooler（port 6543）を `DATABASE_URL` に設定する場合は、`DIRECT_URL`（port 5432）の設定が**必須**です。マイグレーション実行時に直接接続が必要になります。

## 📝 Supabase ダッシュボードでの接続文字列取得

1. Supabase プロジェクトダッシュボードにログイン
2. **Settings** → **Database** を選択
3. **Connection string** セクションで以下を確認:

### Transaction Pooler (Transaction mode - 推奨)

**注意**: Supabase の Connection Pooler には「Transaction mode」と「Session mode」の2つのモードがあります。**Prisma を使用する場合は Transaction mode が推奨されます**。Transaction mode は短命なトランザクション向けで、サーバーレス環境に最適です。Session mode は `SET`、`PREPARE`、`LISTEN/NOTIFY` などのセッション機能が必要な場合にのみ使用してください。

```
Host: aws-0-[REGION].pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.[PROJECT_REF]
Password: [YOUR_PASSWORD]
Mode: Transaction (Supabase ダッシュボードで選択)
```

完全な接続文字列:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Direct Connection
```
Host: aws-0-[REGION].pooler.supabase.com
Port: 5432
Database: postgres
User: postgres.[PROJECT_REF]
Password: [YOUR_PASSWORD]
```

完全な接続文字列:
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

## 🚀 使用例

### マイグレーション実行

マイグレーションは `DIRECT_URL` を使用して実行されます:

```bash
# 本番環境へのマイグレーション適用
pnpm --filter backend run prisma:migrate:deploy

# 新しいマイグレーションの作成
pnpm --filter backend run prisma:migrate:dev
```

Prisma は自動的に `directUrl` を使用してマイグレーションを実行します。

### アプリケーション実行

通常のクエリは `DATABASE_URL`（Transaction Pooler）を使用:

```bash
# アプリケーション起動
pnpm --filter backend run start:prod
```

### データインポートスクリプト

`migrate_csv_to_supabase.ts` などのスクリプトでは、環境変数から自動的に適切な接続が使用されます:

```typescript
// PrismaClient は自動的に DATABASE_URL を使用
const prisma = new PrismaClient();
```

## ⚠️ トラブルシューティング

### Connection Pooler (port 6543) でタイムアウトが発生する場合

**原因**: 
- Connection Pooler の設定が未完了
- ファイアウォール設定の問題
- Supabase プロジェクトの pooler が有効化されていない

**解決方法**:

1. **Supabase ダッシュボードで Connection Pooler を有効化**:
   - Settings → Database → Connection Pooling
   - "Enable connection pooling" をON

2. **一時的に Direct Connection を使用**:
   ```bash
   # DATABASE_URL を一時的に Direct Connection に設定
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

3. **ファイアウォール設定の確認**:
   - ポート 6543 へのアウトバウンド接続が許可されているか確認
   - Cloud Run などのサーバーレス環境では通常問題ありません

### マイグレーションが失敗する場合

**原因**: 
- `DIRECT_URL` が設定されていない
- Direct Connection (port 5432) への接続が失敗

**解決方法**:

1. **環境変数の確認**:
   ```bash
   # .env ファイルに DIRECT_URL が設定されているか確認
   echo $DIRECT_URL
   ```

2. **接続テスト**:
   ```bash
   # Direct Connection でのテスト
   psql "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   ```

## 🔐 セキュリティベストプラクティス

1. **環境変数の管理**:
   - `.env` ファイルは絶対に Git にコミットしない
   - `.gitignore` に `.env` が含まれていることを確認

2. **パスワードの保護**:
   - 本番環境では Google Secret Manager などを使用
   - 定期的にパスワードをローテーション

3. **接続文字列の検証**:
   ```bash
   # 接続文字列にパスワードが含まれていることを確認
   # （実際のパスワードは表示しないこと）
   echo $DATABASE_URL | grep -o "postgresql://.*@"
   ```

## 📚 参考資料

- [Prisma Documentation: Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Supabase Documentation: Database](https://supabase.com/docs/guides/database)
- [PgBouncer Documentation](https://www.pgbouncer.org/)

## 🔄 Cloud Run デプロイ時の設定

### Google Cloud Secret Manager での設定

```bash
# DATABASE_URL を Secret Manager に保存
gcloud secrets create DATABASE_URL \
  --data-file=- <<< "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL を Secret Manager に保存
gcloud secrets create DIRECT_URL \
  --data-file=- <<< "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### Cloud Run サービスへの環境変数の設定

```bash
# デプロイ時に環境変数を設定
gcloud run deploy mycats-backend \
  --image=asia-northeast1-docker.pkg.dev/PROJECT_ID/mycats-pro/backend:latest \
  --region=asia-northeast1 \
  --update-secrets=DATABASE_URL=DATABASE_URL:latest,DIRECT_URL=DIRECT_URL:latest
```

**注意**: イメージパスは実際のプロジェクト構成に合わせて変更してください。形式: `${_LOCATION}-docker.pkg.dev/${PROJECT_ID}/${_REPO_NAME}/backend:latest`

## ✅ チェックリスト

デプロイ前に以下を確認してください:

- [ ] Supabase ダッシュボードで Connection Pooler が有効化されている
- [ ] `DATABASE_URL` が Transaction Pooler (port 6543) を指している
- [ ] `DIRECT_URL` が Direct Connection (port 5432) を指している
- [ ] `schema.prisma` に `directUrl = env("DIRECT_URL")` が設定されている
- [ ] マイグレーションが正常に実行できることを確認
- [ ] アプリケーションが正常に起動することを確認
- [ ] 本番環境で接続エラーが発生しないことを確認

---

**最終更新**: 2026-02-05  
**関連ドキュメント**: 
- [DATABASE_DEPLOYMENT_GUIDE.md](./DATABASE_DEPLOYMENT_GUIDE.md)
- [DEPLOYMENT_CHECKLIST.md](../.github/DEPLOYMENT_CHECKLIST.md)
