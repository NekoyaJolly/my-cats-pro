# Docker環境でのデータ移行ガイド

このガイドでは、Windows開発環境からMac（Docker環境）へデータを移行する手順を説明します。

## 📋 概要

現在の在舎猫データをシードデータとしてエクスポートし、Mac上のDocker環境で自動的に読み込まれるようにします。

## 🔧 前提条件

- Windows環境でPostgreSQLが起動していること（ポート5433）
- `psql`コマンドが利用可能であること
- 在舎猫データが登録されていること

## 📝 手順

### 1. Windows環境でデータをエクスポート

PowerShellで以下のスクリプトを実行します：

```powershell
cd scripts
.\export-cats-seed.ps1
```

このスクリプトは以下を実行します：
- 在舎猫に関連する品種データをエクスポート
- 在舎猫に関連する毛色データをエクスポート
- 在舎猫データをエクスポート
- `backend/prisma/seed-cats-data.sql` にSQL文を生成

### 2. シードデータを確認

生成されたファイルを確認します：

```powershell
cat ..\backend\prisma\seed-cats-data.sql
```

### 3. シードデータをDocker初期化フォルダにコピー

```powershell
Copy-Item ..\backend\prisma\seed-cats-data.sql ..\database\init\02-seed-cats.sql
```

### 4. 変更をコミット

```powershell
git add database/init/02-seed-cats.sql
git add database/init/01-init.sh
git add scripts/export-cats-seed.ps1
git commit -m "feat(docker): 在舎猫データのシードデータを追加"
git push
```

## 🍎 Mac環境での起動

### 1. リポジトリをクローン/プル

```bash
git pull origin main
```

### 2. Docker環境を起動

```bash
# 既存のボリュームを削除（クリーンスタート）
docker-compose down -v

# Docker環境を起動
docker-compose up -d
```

### 3. Prismaマイグレーションを実行

```bash
cd backend
pnpm install
npx prisma migrate deploy
```

### 4. シードデータが正しく読み込まれたか確認

```bash
# psqlで確認
docker exec -it mycats_postgres psql -U mycats -d mycats_development

# SQL実行
SELECT COUNT(*) FROM cats WHERE "isInHouse" = true;
SELECT name, gender, "birthDate" FROM cats WHERE "isInHouse" = true ORDER BY name;
\q
```

### 5. アプリケーションを起動

```bash
# バックエンド
cd backend
pnpm run start:dev

# フロントエンド（別ターミナル）
cd frontend
pnpm run dev
```

## 📁 ファイル構成

```
mycats-pro/
├── database/
│   └── init/
│       ├── 01-init.sh           # PostgreSQL拡張機能とインデックスの設定
│       └── 02-seed-cats.sql     # 在舎猫データのシード（自動生成）
├── backend/
│   └── prisma/
│       ├── seed-cats-data.sql   # エクスポートされたデータ（一時ファイル）
│       └── schema.prisma
└── scripts/
    ├── export-cats-seed.ps1     # Windows用エクスポートスクリプト
    └── export-cats-seed.sh      # Mac/Linux用エクスポートスクリプト
```

## 🔄 データの更新

在舎猫データが変更された場合、再度エクスポートして更新します：

```powershell
# Windows
cd scripts
.\export-cats-seed.ps1
Copy-Item ..\backend\prisma\seed-cats-data.sql ..\database\init\02-seed-cats.sql -Force
git add database/init/02-seed-cats.sql
git commit -m "chore(docker): シードデータを更新"
git push
```

```bash
# Mac（Docker環境を再起動）
git pull
docker-compose down -v
docker-compose up -d
cd backend && npx prisma migrate deploy
```

## 🐛 トラブルシューティング

### エラー: `psql: command not found`

PostgreSQLクライアントツールをインストールしてください：

**Windows:**
```powershell
# Chocolateyを使用
choco install postgresql-client

# または、PostgreSQLの完全版をインストール
# https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql
```

### エラー: シードデータが読み込まれない

1. Docker初期化ログを確認：
```bash
docker-compose logs postgres
```

2. データベースを完全にリセット：
```bash
docker-compose down -v
docker volume rm mycats-pro_postgres_data
docker-compose up -d
```

### エラー: 接続できない

1. PostgreSQLが起動しているか確認：
```bash
docker-compose ps
```

2. ヘルスチェックを確認：
```bash
docker exec -it mycats_postgres pg_isready -U mycats
```

## 📚 参考情報

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
