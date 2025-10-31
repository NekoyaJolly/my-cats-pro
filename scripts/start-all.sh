#!/bin/bash

###############################################
# MyCats Pro - 開発サーバー起動スクリプト
# バックエンドとフロントエンドを同時に起動します
###############################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# カラー出力
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🐱 MyCats Pro 開発サーバーを起動します...${NC}"
echo ""

# Dockerコンテナの状態を確認
if ! docker ps | grep -q mycats_postgres; then
    echo -e "${YELLOW}⚠️  データベースが起動していません。起動します...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose up -d postgres
    
    echo "PostgreSQL の起動を待機中..."
    sleep 5
    
    # ヘルスチェック
    MAX_RETRIES=15
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if docker exec mycats_postgres pg_isready -U mycats -d mycats_development > /dev/null 2>&1; then
            echo -e "${GREEN}✓ PostgreSQL が起動しました${NC}"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        sleep 2
    done
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}サーバーを起動しています...${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 ログを確認するには:"
echo "  - バックエンド: backend/のターミナル"
echo "  - フロントエンド: frontend/のターミナル"
echo ""
echo "🌐 アクセス URL:"
echo "  - フロントエンド: http://localhost:3000"
echo "  - バックエンドAPI: http://localhost:3004"
echo ""
echo "⏹️  停止するには: Ctrl+C を押してください"
echo ""

# バックエンドとフロントエンドを同時に起動
cd "$PROJECT_ROOT"

# 並列実行（どちらかが終了したら両方終了）
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# バックエンドを起動
(
    cd backend
    echo -e "${BLUE}[Backend] Starting...${NC}"
    pnpm run start:dev
) &

# フロントエンドを起動
(
    cd frontend
    echo -e "${BLUE}[Frontend] Starting...${NC}"
    pnpm run dev
) &

# 両方のプロセスを待機
wait
