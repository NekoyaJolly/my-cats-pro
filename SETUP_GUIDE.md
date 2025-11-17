# 🐱 MyCats Pro - 開発環境セットアップガイド

このガイドでは、Docker を使用した開発環境のセットアップ方法を説明します。

## 📋 前提条件

- Node.js 20.x 以上
- pnpm 8.x 以上
- Docker & Docker Compose
- Git

## 🚀 クイックスタート

### 1. 初回セットアップ

```bash
# セットアップスクリプトを実行可能にする
chmod +x scripts/setup-dev-docker.sh scripts/start-all.sh

# 開発環境をセットアップ（初回のみ）
./scripts/setup-dev-docker.sh
```

このスクリプトは以下を自動で行います：
- 環境変数ファイルの作成
- Docker Compose で PostgreSQL を起動
- 依存関係のインストール
- Prisma のマイグレーション実行
- シードデータの投入

### 2. サーバーを起動

**方法A: すべてを一度に起動**

```bash
./scripts/start-all.sh
```

バックエンドとフロントエンドが同時に起動します。

**方法B: 個別に起動**

```bash
# ターミナル1: バックエンド
cd backend
pnpm run start:dev

# ターミナル2: フロントエンド
cd frontend
pnpm run dev
```

### 3. アクセス

- 🌐 フロントエンド: http://localhost:3000
- 🔌 バックエンドAPI: http://localhost:3004
- 🗄️ pgAdmin: http://localhost:5050

## 📦 データの永続化

Docker の名前付きボリューム `postgres_data` を使用しているため、コンテナを停止してもデータは保持されます。

```bash
# コンテナを停止（データは保持される）
docker-compose down

# コンテナとデータを完全に削除
docker-compose down -v
```

## 🔧 データベース操作

### マイグレーション

```bash
cd backend

# 新しいマイグレーションを作成
pnpm prisma:migrate

# マイグレーションステータスを確認
pnpm prisma:status

# Prisma Studio でデータを確認
pnpm prisma:studio
```

### データベース接続情報

```
Host: localhost
Port: 5433
Database: mycats_development
User: mycats
Password: mycats_dev_password
```

## 🔄 環境のリセット

データベースを含めて完全にリセットする場合：

```bash
# 1. コンテナとボリュームを削除
docker-compose down -v

# 2. 再セットアップ
./scripts/setup-dev-docker.sh
```

## 🛠️ トラブルシューティング

### ポートが使用中の場合

```bash
# 5433 ポートを使用しているプロセスを確認
lsof -i :5433

# プロセスを停止
kill -9 <PID>
```

### データベース接続エラー

```bash
# PostgreSQL の状態を確認
docker ps | grep mycats_postgres

# ログを確認
docker logs mycats_postgres

# ヘルスチェック
docker exec mycats_postgres pg_isready -U mycats -d mycats_development
```

### 依存関係のエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules backend/node_modules frontend/node_modules
pnpm install
cd backend && pnpm install
cd ../frontend && pnpm install
```

## 📝 環境変数ファイル

### backend/.env

バックエンドの設定ファイル。Docker の PostgreSQL に接続します。

```bash
DATABASE_URL=postgresql://mycats:mycats_dev_password@localhost:5433/mycats_development
NODE_ENV=development
PORT=3004
# ... その他の設定
```

### frontend/.env.local

フロントエンドの設定ファイル。

```bash
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_ENV=development
```

## 🔐 本番環境への注意

### シークレット値の生成

JWT や CSRF 用のシークレットを作成する際は、以下のコマンドで安全な値を生成してください。

```bash
pnpm run generate-secrets
```

表示された値を `.env` にコピーし、Git には絶対にコミットしないようにしてください。

---

- `mycats_dev_password` などの開発用パスワードは**本番環境では使用しないでください**
- JWT_SECRET などは本番環境では強力なランダム文字列に変更してください
- 環境変数は `.env.production` を別途作成して管理してください

## 📚 その他のドキュメント

- [API仕様](docs/api-specification.md)
- [データベース設計](DATABASE_SCHEMA.md)
- [本番デプロイ](docs/production-deployment.md)
