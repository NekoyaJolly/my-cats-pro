#!/bin/bash

###############################################
# MyCats Pro - 開発環境セットアップスクリプト
# Docker環境でフロントエンド、バックエンド、DBを起動します
###############################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🐱 MyCats Pro 開発環境セットアップを開始します..."
echo "📁 プロジェクトルート: $PROJECT_ROOT"
echo ""

# カラー出力
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 環境変数ファイルの確認
echo -e "${BLUE}1. 環境変数ファイルを確認中...${NC}"

if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env が存在しません。作成します...${NC}"
    cp "$PROJECT_ROOT/.env.development" "$PROJECT_ROOT/backend/.env"
    echo -e "${GREEN}✓ backend/.env を作成しました${NC}"
else
    echo -e "${GREEN}✓ backend/.env が存在します${NC}"
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.local が存在しません。作成します...${NC}"
    cat > "$PROJECT_ROOT/frontend/.env.local" << 'EOF'
# フロントエンド環境変数 (開発環境)
NEXT_PUBLIC_API_URL=http://localhost:3004
NEXT_PUBLIC_ENV=development
EOF
    echo -e "${GREEN}✓ frontend/.env.local を作成しました${NC}"
else
    echo -e "${GREEN}✓ frontend/.env.local が存在します${NC}"
fi

echo ""

# 2. Docker Composeでデータベースを起動
echo -e "${BLUE}2. Docker Compose でデータベースを起動中...${NC}"
cd "$PROJECT_ROOT"

# 既存のコンテナを停止（あれば）
if [ "$(docker ps -a -q -f name=mycats_postgres)" ]; then
    echo "既存の mycats_postgres コンテナを停止します..."
    docker-compose down
fi

# データベースを起動
docker-compose up -d postgres

echo "PostgreSQL の起動を待機中..."
sleep 5

# ヘルスチェック
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec mycats_postgres pg_isready -U mycats -d mycats_development > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL が起動しました${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "PostgreSQL の起動を待機中... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ PostgreSQL の起動に失敗しました${NC}"
    exit 1
fi

echo ""

# 3. 依存関係のインストール
echo -e "${BLUE}3. 依存関係をインストール中...${NC}"

if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "ルートの依存関係をインストール..."
    cd "$PROJECT_ROOT"
    pnpm install
fi

if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
    echo "バックエンドの依存関係をインストール..."
    cd "$PROJECT_ROOT/backend"
    pnpm install
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
    echo "フロントエンドの依存関係をインストール..."
    cd "$PROJECT_ROOT/frontend"
    pnpm install
fi

echo -e "${GREEN}✓ 依存関係のインストールが完了しました${NC}"
echo ""

# 4. Prisma の初期化
echo -e "${BLUE}4. Prisma を初期化中...${NC}"
cd "$PROJECT_ROOT/backend"

# Prisma Client を生成
echo "Prisma Client を生成..."
pnpm prisma:generate

# マイグレーションを実行
echo "データベースマイグレーションを実行..."
pnpm prisma:migrate

# シードデータを投入（オプション）
if [ -f "$PROJECT_ROOT/backend/src/prisma/seed.ts" ]; then
    echo "シードデータを投入..."
    pnpm run seed || echo -e "${YELLOW}⚠️  シードの実行に失敗しました（既にデータが存在する可能性があります）${NC}"
fi

echo -e "${GREEN}✓ Prisma の初期化が完了しました${NC}"
echo ""

# 5. 完了メッセージ
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 セットアップが完了しました！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 次のステップ:"
echo ""
echo "  【バックエンドを起動】"
echo "  $ cd backend"
echo "  $ pnpm run start:dev"
echo ""
echo "  【フロントエンドを起動（別のターミナルで）】"
echo "  $ cd frontend"
echo "  $ pnpm run dev"
echo ""
echo "  【データベースを停止】"
echo "  $ docker-compose down"
echo ""
echo "  【データベースを含めて完全に削除】"
echo "  $ docker-compose down -v"
echo ""
echo "🌐 アクセス URL:"
echo "  - フロントエンド: http://localhost:3000"
echo "  - バックエンドAPI: http://localhost:3004"
echo "  - pgAdmin: http://localhost:5050"
echo ""
echo "📊 データベース接続情報:"
echo "  - Host: localhost"
echo "  - Port: 5433"
echo "  - Database: mycats_development"
echo "  - User: mycats"
echo "  - Password: mycats_dev_password"
echo ""
