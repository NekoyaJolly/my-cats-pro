# 🔧 MyCats Pro - トラブルシューティングガイド

このドキュメントでは、MyCats Proの開発中によく遭遇する問題とその解決方法を説明します。

## 📋 目次

- [データベース接続エラー](#データベース接続エラー)
- [Prismaエラー](#prismaエラー)
- [ポート競合](#ポート競合)
- [依存関係のエラー](#依存関係のエラー)
- [Docker関連の問題](#docker関連の問題)
- [環境変数の問題](#環境変数の問題)
- [ビルドエラー](#ビルドエラー)

---

## データベース接続エラー

### 問題: `P1010: User was denied access on the database`

**症状:**
```
Error: P1010: User `mycats` was denied access on the database `mycats_development.not available`
```

**原因:**
- PostgreSQLユーザー `mycats` が存在しない
- Docker Composeの環境変数がデータベース初期化時に反映されなかった

**解決方法:**

#### 方法1: Dockerコンテナを完全にリセット

```bash
# 1. コンテナとボリュームを削除
docker-compose down -v

# 2. 再度セットアップ
bash scripts/setup-dev-docker.sh
```

#### 方法2: 手動でユーザーを作成

```bash
# 1. postgresユーザーでデータベースに接続
docker exec -it mycats_postgres psql -U postgres

# 2. ユーザーとデータベースを作成
CREATE USER mycats WITH SUPERUSER PASSWORD 'mycats_dev_password';
CREATE DATABASE mycats_development OWNER mycats;
\q

# 3. 接続テスト
docker exec -it mycats_postgres psql -U mycats -d mycats_development
```

### 問題: `Connection refused` または `ECONNREFUSED`

**症状:**
```
Error: connect ECONNREFUSED 127.0.0.1:5433
```

**原因:**
- PostgreSQLコンテナが起動していない
- ポート設定が間違っている

**解決方法:**

```bash
# 1. コンテナの状態を確認
docker ps | grep mycats_postgres

# 2. コンテナが起動していない場合
docker-compose up -d postgres

# 3. ヘルスチェック
docker exec mycats_postgres pg_isready -U mycats -d mycats_development

# 4. ログを確認
docker logs mycats_postgres
```

---

## Prismaエラー

### 問題: Prisma Clientが生成されていない

**症状:**
```
Cannot find module '@prisma/client'
```

**解決方法:**

```bash
cd backend

# Prisma Clientを生成
pnpm prisma:generate

# または
pnpm prisma generate
```

### 問題: マイグレーションの競合

**症状:**
```
Migration `xxx` failed to apply cleanly to the shadow database
```

**解決方法:**

```bash
cd backend

# 開発環境の場合: マイグレーションをリセット
pnpm prisma migrate reset

# 本番環境の場合: migrate deployを使用
pnpm prisma migrate deploy
```

### 問題: スキーマとデータベースの不整合

**症状:**
```
The database schema is not in sync with the Prisma schema
```

**解決方法:**

```bash
cd backend

# マイグレーション状態を確認
pnpm prisma migrate status

# 未適用のマイグレーションを適用
pnpm prisma migrate deploy

# または開発環境では
pnpm prisma migrate dev
```

---

## ポート競合

### 問題: ポートが既に使用されている

**症状:**
```
Error: listen EADDRINUSE: address already in use :::3000
Error: listen EADDRINUSE: address already in use :::3004
Error: port 5433 is already allocated
```

**解決方法:**

#### バックエンド/フロントエンドのポート (3000, 3004)

```bash
# 使用しているプロセスを確認
lsof -i :3000
lsof -i :3004

# プロセスIDを確認してkill
kill -9 <PID>

# または一括でポートを開放
bash scripts/kill-backend.sh
```

#### PostgreSQLのポート (5433)

```bash
# 使用しているプロセスを確認
lsof -i :5433

# Dockerコンテナが原因の場合
docker-compose down

# 他のプロセスが使用している場合
kill -9 <PID>
```

---

## 依存関係のエラー

### 問題: `node_modules`が壊れている

**症状:**
```
Error: Cannot find module 'xxx'
Module not found: Can't resolve 'xxx'
```

**解決方法:**

```bash
# ルートディレクトリで実行
rm -rf node_modules pnpm-lock.yaml
rm -rf backend/node_modules
rm -rf frontend/node_modules

# 再インストール
pnpm install
```

### 問題: pnpmのバージョンが古い

**症状:**
```
ERR_PNPM_UNSUPPORTED_ENGINE
```

**解決方法:**

```bash
# pnpmを最新にアップデート
npm install -g pnpm@latest

# バージョン確認
pnpm --version  # 9.x以上を推奨
```

---

## Docker関連の問題

### 問題: Dockerコンテナが起動しない

**解決方法:**

```bash
# 1. 既存のコンテナを削除
docker-compose down

# 2. ログを確認
docker-compose logs postgres

# 3. イメージを再ビルド
docker-compose build --no-cache

# 4. 再起動
docker-compose up -d postgres
```

### 問題: Docker volumeのデータが壊れている

**解決方法:**

```bash
# 1. すべてのコンテナとボリュームを削除
docker-compose down -v

# 2. 未使用のボリュームを削除
docker volume prune

# 3. 再セットアップ
bash scripts/setup-dev-docker.sh
```

### 問題: pgAdminにログインできない

**デフォルト認証情報:**
```
Email: admin@example.com
Password: admin
```

**サーバー接続設定:**
```
Host: postgres (または host.docker.internal)
Port: 5432
Database: mycats_development
Username: mycats
Password: mycats_dev_password
```

---

## 環境変数の問題

### 問題: 環境変数が読み込まれない

**原因:**
- `.env`ファイルが存在しない
- 環境変数の形式が間違っている

**解決方法:**

```bash
# バックエンドの環境変数を確認
cat backend/.env

# 存在しない場合はテンプレートからコピー
cp .env.development backend/.env

# フロントエンドの環境変数を確認
cat frontend/.env.local

# 存在しない場合は作成
cp frontend/.env.example frontend/.env.local
```

### 問題: DATABASE_URLが正しくない

**正しい形式:**
```bash
# Docker Compose使用時
DATABASE_URL="postgresql://mycats:mycats_dev_password@localhost:5433/mycats_development?schema=public"

# ローカルPostgreSQL使用時
DATABASE_URL="postgresql://postgres:password@localhost:5432/mycats_development?schema=public"
```

**確認方法:**
```bash
# バックエンドで環境変数を確認
cd backend
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

---

## ビルドエラー

### 問題: TypeScriptのコンパイルエラー

**解決方法:**

```bash
# バックエンド
cd backend
pnpm run build

# フロントエンド
cd frontend
pnpm run build

# エラー内容を確認して型定義を修正
```

### 問題: Next.jsのビルドエラー

**症状:**
```
Error: Build failed
Type error: xxx
```

**解決方法:**

```bash
cd frontend

# .nextディレクトリを削除
rm -rf .next

# 再ビルド
pnpm run build
```

---

## 一般的なトラブルシューティング手順

### 1. 環境診断スクリプトを実行

```bash
bash scripts/diagnose.sh
```

### 2. ヘルスチェック

```bash
# バックエンドのヘルスチェック
curl http://localhost:3004/health

# データベース接続チェック
docker exec mycats_postgres pg_isready -U mycats -d mycats_development

# Dockerコンテナの状態確認
docker ps
docker-compose ps
```

### 3. ログの確認

```bash
# Dockerログ
docker logs mycats_postgres
docker logs mycats_pgadmin

# バックエンドログ（実行中のターミナルで確認）
# フロントエンドログ（ブラウザの開発者ツールで確認）
```

### 4. 完全リセット（最終手段）

```bash
# 1. すべてのプロセスを停止
docker-compose down -v
pkill -f "node.*backend"
pkill -f "node.*frontend"

# 2. 依存関係を削除
rm -rf node_modules backend/node_modules frontend/node_modules
rm -rf .next backend/dist

# 3. 再セットアップ
bash scripts/setup-dev-docker.sh
```

---

## パフォーマンス問題

### 1. APIレスポンスが遅い

**診断:**

```bash
# レスポンス時間測定
curl -w "\n\nTotal time: %{time_total}s\n" -o /dev/null -s "http://localhost:3004/api/v1/cats"

# データベースクエリ分析（要pg_stat_statements拡張）
psql $DATABASE_URL -c "SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"
```

**最適化:**

```bash
# インデックス確認
psql $DATABASE_URL -c "\d+ cats"

# 不足しているインデックスを追加
# 例: cats テーブルの owner_id にインデックスを作成
psql $DATABASE_URL -c "CREATE INDEX idx_cats_owner_id ON cats(owner_id);"
```

### 2. フロントエンドが重い

**最適化手順:**

```bash
# バンドルサイズ分析
cd frontend
pnpm run build
# ビルド出力でページサイズを確認

# Next.js Bundle Analyzer（要インストール）
# pnpm add -D @next/bundle-analyzer
```

### 3. メモリリーク

**診断:**

```bash
# メモリ使用量監視
free -h
ps aux --sort=-%mem | head -10

# Node.jsプロセスのメモリ確認
ps -p <PID> -o pid,vsz,rss,comm
```

---

## 本番環境の問題

### 1. アプリケーションが起動しない

**診断手順:**

```bash
# ログの確認（systemd使用時）
journalctl -u mycats-api -n 50 --no-pager

# 環境変数の確認
env | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV|PORT)"

# ポートの確認
netstat -tlnp | grep :3004
# または
lsof -i :3004

# ディスク容量の確認
df -h
```

**解決方法:**

```bash
# プロセス確認
ps aux | grep node

# 手動起動してエラー確認
cd /path/to/mycats
NODE_ENV=production node backend/dist/main.js

# サービス再起動（systemd使用時）
sudo systemctl restart mycats-api
sudo systemctl status mycats-api
```

### 2. 502 Bad Gateway エラー

**原因と解決:**

```bash
# 1. バックエンドサービス確認
curl -f http://localhost:3004/health
# または
curl -v http://localhost:3004/api/v1/health

# 2. Nginxエラーログ確認
sudo tail -f /var/log/nginx/error.log

# 3. プロキシ設定確認
sudo nginx -t
sudo systemctl reload nginx

# 4. バックエンドプロセス確認
ps aux | grep "node.*backend"
```

### 3. データベース接続プール枯渇

**診断:**

```bash
# 接続数確認
psql $DATABASE_URL -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"

# 最大接続数確認
psql $DATABASE_URL -c "SHOW max_connections;"

# アクティブな接続詳細
psql $DATABASE_URL -c "SELECT pid, usename, application_name, client_addr, state, query FROM pg_stat_activity WHERE state != 'idle';"
```

**解決:**

```bash
# 1. アプリケーション再起動
sudo systemctl restart mycats-api

# 2. 必要に応じてデッドロック解除
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < now() - interval '5 minutes';"

# 3. PostgreSQL再起動（最終手段）
sudo systemctl restart postgresql
```

---

## 🆘 緊急時対応

### システム完全停止時

1. **即座にロールバック**:

   ```bash
   # 前の安定バージョンに戻す
   git checkout <previous_stable_commit>
   pnpm install --frozen-lockfile
   pnpm run build
   sudo systemctl restart mycats-api
   ```

2. **データベースバックアップから復旧**:

   ```bash
   # バックアップリスト確認
   ls -lh /path/to/backups/

   # 復旧実行
   psql $DATABASE_URL < /path/to/backups/backup_latest.sql
   ```

3. **ステータスページ更新**:
   - 利用者への通知
   - 復旧予定時間の共有

### 連絡先・エスカレーション

- **緊急時対応**: GitHub Issues
- **技術サポート**: [開発チーム連絡先]
- **セキュリティインシデント**: [セキュリティ担当連絡先]

---

## よくある質問 (FAQ)

### Q: データベースのデータを完全に削除するには?

```bash
docker-compose down -v
```

### Q: シードデータを再投入するには?

```bash
cd backend
pnpm run seed
```

### Q: マイグレーションをやり直すには?

```bash
cd backend
pnpm prisma migrate reset
```

### Q: Prisma Studioでデータを確認するには?

```bash
cd backend
pnpm prisma:studio
```

### Q: Docker Composeのログをリアルタイムで見るには?

```bash
docker-compose logs -f postgres
```

### Q: 本番環境のログはどこで確認できますか?

```bash
# アプリケーションログ（systemd使用時）
journalctl -u mycats-api -f

# Nginxログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQLログ
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## 関連ドキュメント

- **本番デプロイ**: [docs/production-deployment.md](docs/production-deployment.md)
- **運用手順書**: [docs/operations.md](docs/operations.md)
- **セキュリティ**: [docs/security-auth.md](docs/security-auth.md)
- **データベース**: [docs/DATABASE_DEPLOYMENT_GUIDE.md](docs/DATABASE_DEPLOYMENT_GUIDE.md)

---

## サポート

問題が解決しない場合は、以下の情報を含めて [GitHub Issues](https://github.com/NekoyaJolly/mycats-pro/issues) に報告してください:

- エラーメッセージの全文
- 実行したコマンド
- 環境情報（OS、Node.jsバージョン、Docker バージョン）
- `docker-compose ps` の出力（Docker使用時）
- `docker logs mycats_postgres` の出力（Docker使用時）
- `journalctl -u mycats-api -n 50` の出力（本番環境）

---

**最終更新**: 2025年11月13日  
**バージョン**: 2.0（本番環境・パフォーマンス対応追加）
