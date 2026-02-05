# ローカル PostgreSQL から Supabase への移行ガイド

このドキュメントは、既存のローカル PostgreSQL 環境から Supabase へ移行する手順を説明します。

## 目次

1. [前提条件](#前提条件)
2. [移行手順](#移行手順)
3. [ロールバック手順](#ロールバック手順)
4. [トラブルシューティング](#トラブルシューティング)

## 前提条件

- Supabase プロジェクトが作成済みであること
- ローカル環境でデータベースのバックアップが取得済みであること
- `docs/SUPABASE_CONNECTION_GUIDE.md` を読んで、Supabase の接続設定を理解していること

## 移行手順

### 1. データベースのバックアップ

まず、既存のローカル PostgreSQL データベースをバックアップします。

```bash
# Docker Compose経由でバックアップ
docker exec mycats_postgres pg_dump -U mycats -d mycats_development > backup_$(date +%Y%m%d_%H%M%S).sql

# または、ローカルのPostgreSQLから直接バックアップ
pg_dump -h localhost -p 5433 -U mycats -d mycats_development > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Supabase プロジェクトのセットアップ

1. [Supabase ダッシュボード](https://app.supabase.com)にアクセス
2. 新規プロジェクトを作成（または既存のプロジェクトを使用）
3. **Project Settings** > **Database** から接続情報を取得

### 3. 環境変数の設定

`.env.development` ファイルを更新します：

```env
# Supabase 接続設定
# Transaction Pooler (通常のクエリ実行用)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Connection (マイグレーション実行用)
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

**重要**: `[PASSWORD]` は実際のパスワードに置き換えてください。

### 4. docker-compose.yml の更新

ローカル PostgreSQL サービスを無効化します：

```yaml
# docker-compose.yml
services:
  # PostgreSQL Database - DISABLED (Using Supabase)
  # postgres:
  #   image: postgres:15-alpine
  #   ...
  
  backend:
    # depends_on を削除またはコメントアウト
    # depends_on:
    #   postgres:
    #     condition: service_healthy
```

### 5. Prisma マイグレーションの実行

Supabase データベースにスキーマを適用します：

```bash
cd backend

# マイグレーションの状態を確認
pnpm run prisma:status

# マイグレーションを実行
pnpm run prisma:migrate

# Prisma Clientを再生成
pnpm run prisma:generate
```

### 6. データのインポート

#### オプション A: バックアップファイルから復元

```bash
# psql を使用してバックアップを復元
psql "postgresql://postgres.xxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres" < backup_20260205_120000.sql
```

#### オプション B: 血統書データCSVから移行（該当する場合）

```bash
cd backend

# 環境変数でCSVパスを指定（オプション）
export PEDIGREE_CSV_PATH=../src/pedigree/pedigree_data_utf8.csv

# 移行スクリプトを実行（確認プロンプトあり）
pnpm exec dotenv -e ./.env.development -- tsx scripts/migrate_csv_to_supabase.ts

# または、自動実行（--forceフラグ）
pnpm exec dotenv -e ./.env.development -- tsx scripts/migrate_csv_to_supabase.ts --force
```

### 7. 動作確認

```bash
# バックエンドを起動
pnpm dev

# ヘルスチェック
curl http://localhost:3004/health

# データが正しくインポートされたか確認
pnpm run prisma:studio
```

## ロールバック手順

Supabase への移行に問題がある場合、以下の手順でローカル PostgreSQL に戻すことができます。

### 1. docker-compose.yml を元に戻す

```bash
# GitでPostgreSQLの設定を復元
git checkout HEAD~1 -- docker-compose.yml
```

### 2. 環境変数を元に戻す

`.env.development` を更新：

```env
# ローカルPostgreSQL接続設定
DATABASE_URL="postgresql://mycats:mycats_dev_password@localhost:5433/mycats_development"
```

### 3. Docker サービスを再起動

```bash
# PostgreSQLコンテナを起動
docker-compose up -d postgres

# バックエンドを再起動
docker-compose restart backend
```

### 4. バックアップからデータを復元

```bash
# バックアップファイルから復元
docker exec -i mycats_postgres psql -U mycats -d mycats_development < backup_20260205_120000.sql
```

## トラブルシューティング

### タイムアウトエラー: Connection Pooler (port 6543)

**現象**: Transaction Pooler 経由の接続でタイムアウトが発生

**原因**: Supabase の Connection Pooler は pgBouncer を使用しており、特定の操作（マイグレーション、トランザクション）に制限があります。

**解決策**:
- マイグレーション実行時は `DIRECT_URL` (port 5432) を使用
- 通常のクエリは `DATABASE_URL` (port 6543) を使用
- Prisma スキーマで `directUrl` フィールドを設定済みであることを確認

### マイグレーション失敗: "relation already exists"

**現象**: Prisma マイグレーションが既存のテーブルと競合

**解決策**:

```bash
# 既存のマイグレーション履歴を確認
pnpm run prisma:status

# マイグレーション履歴をリセット（注意: データは保持）
pnpm exec dotenv -e ./.env.development -- prisma migrate resolve --applied <migration_name>
```

### CSV インポート失敗: ファイルが見つからない

**現象**: `❌ CSVファイルが見つかりません`

**解決策**:

```bash
# 環境変数でパスを明示的に指定
export PEDIGREE_CSV_PATH=/absolute/path/to/pedigree_data_utf8.csv
pnpm exec dotenv -e ./.env.development -- tsx scripts/migrate_csv_to_supabase.ts
```

### 本番環境で誤って実行してしまった

**現象**: `❌ 本番環境ではこのスクリプトを実行できません`

**理由**: データ保護のため、`NODE_ENV=production` の環境では移行スクリプトの実行が禁止されています。

**対処法**:
- 本番環境へのデータ移行は、開発環境で十分にテストした後、手動で慎重に行ってください
- または、環境変数 `NODE_ENV` を一時的に変更（推奨しません）

## 参考資料

- [Supabase 接続設定ガイド](./SUPABASE_CONNECTION_GUIDE.md)
- [Prisma マイグレーションドキュメント](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase Database 公式ドキュメント](https://supabase.com/docs/guides/database)
