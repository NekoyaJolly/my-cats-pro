#!/usr/bin/env bash
# デプロイバージョン確認スクリプト
# 
# 使用方法:
#   ./scripts/verify-deployment.sh [staging|production]
# 
# 例:
#   ./scripts/verify-deployment.sh production
#   ./scripts/verify-deployment.sh staging

set -euo pipefail

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -ne 1 ]; then
    echo -e "${RED}エラー: 環境を指定してください${NC}"
    echo "使用方法: $0 [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# URLの設定
case "$ENVIRONMENT" in
    staging)
        BASE_URL="https://mycats-pro-frontend-staging-687406216678.asia-northeast1.run.app"
        ;;
    production)
        BASE_URL="https://nekoya.co.jp"
        ;;
    *)
        echo -e "${RED}エラー: 無効な環境: $ENVIRONMENT${NC}"
        echo "有効な環境: staging, production"
        exit 1
        ;;
esac

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}デプロイバージョン確認 - ${ENVIRONMENT}${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# デバッグエンドポイントにアクセス
DEBUG_URL="${BASE_URL}/api/debug-version"
echo -e "${YELLOW}📡 デバッグエンドポイントにアクセス中...${NC}"
echo -e "   URL: ${DEBUG_URL}"
echo ""

# curlでデータを取得（-f でHTTPエラーを検出、-S で進捗表示を抑制しつつエラーは表示）
HTTP_CODE=$(curl -fsSL -w "%{http_code}" -o /tmp/debug-response.json "${DEBUG_URL}" 2>/tmp/curl-error.txt || echo "000")

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ エンドポイントへのアクセスに失敗しました${NC}"
    echo -e "   HTTP Status: ${HTTP_CODE}"
    echo -e "   URL: ${DEBUG_URL}"
    if [ -s /tmp/curl-error.txt ]; then
        echo -e "${YELLOW}   エラー詳細:${NC}"
        cat /tmp/curl-error.txt
    fi
    rm -f /tmp/debug-response.json /tmp/curl-error.txt
    exit 1
fi

RESPONSE=$(cat /tmp/debug-response.json)
rm -f /tmp/debug-response.json /tmp/curl-error.txt

# jqが利用可能かチェック
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq がインストールされていません。生のJSONを表示します:${NC}"
    echo "${RESPONSE}"
    exit 0
fi

# JSONをパース
echo -e "${GREEN}✅ レスポンス取得成功${NC}"
echo ""

# 情報を抽出
TIMESTAMP=$(echo "${RESPONSE}" | jq -r '.timestamp')
GIT_COMMIT=$(echo "${RESPONSE}" | jq -r '.gitCommit')
BUILD_TIME=$(echo "${RESPONSE}" | jq -r '.buildTime')
EXPECTED_COMMIT=$(echo "${RESPONSE}" | jq -r '.expectedCommit')
MESSAGE=$(echo "${RESPONSE}" | jq -r '.message')
NODE_ENV=$(echo "${RESPONSE}" | jq -r '.nodeEnv')
API_URL=$(echo "${RESPONSE}" | jq -r '.nextPublicApiUrl')

# 結果を表示
echo -e "${BLUE}📊 デプロイ情報:${NC}"
echo "  タイムスタンプ    : ${TIMESTAMP}"
echo "  Gitコミット       : ${GIT_COMMIT}"
echo "  ビルド時刻        : ${BUILD_TIME}"
echo "  期待コミット      : ${EXPECTED_COMMIT}"
echo "  メッセージ        : ${MESSAGE}"
echo "  実行環境          : ${NODE_ENV}"
echo "  API URL          : ${API_URL}"
echo ""

# コミットハッシュの比較
echo -e "${BLUE}🔍 バージョン検証:${NC}"

if [ "$GIT_COMMIT" = "unknown" ]; then
    echo -e "${RED}❌ Gitコミットハッシュが取得できていません${NC}"
    echo -e "${YELLOW}   原因: ビルド時に GITHUB_SHA 環境変数が渡されていない可能性があります${NC}"
    exit 1
elif [ "$GIT_COMMIT" = "$EXPECTED_COMMIT" ]; then
    echo -e "${GREEN}✅ 期待されるコミットがデプロイされています${NC}"
    echo -e "   コミット: ${GIT_COMMIT}"
elif [ ${#GIT_COMMIT} -eq 40 ]; then
    echo -e "${YELLOW}⚠️  デプロイされているコミットが期待と異なります${NC}"
    echo -e "   期待: ${EXPECTED_COMMIT}"
    echo -e "   実際: ${GIT_COMMIT}"
    echo ""
    echo -e "${YELLOW}   これは正常な場合があります:${NC}"
    echo -e "   - 新しいコミットをデプロイした場合"
    echo -e "   - expectedCommit の更新が必要な場合"
else
    echo -e "${RED}❌ 無効なコミットハッシュ形式: ${GIT_COMMIT}${NC}"
    exit 1
fi

# ビルド時刻のチェック
echo ""
if [ "$BUILD_TIME" = "unknown" ]; then
    echo -e "${RED}❌ ビルド時刻が取得できていません${NC}"
    echo -e "${YELLOW}   原因: ビルド時に BUILD_TIME 環境変数が渡されていない可能性があります${NC}"
    exit 1
else
    echo -e "${GREEN}✅ ビルド時刻が記録されています: ${BUILD_TIME}${NC}"
fi

# 環境変数のチェック
echo ""
if [ "$NODE_ENV" != "production" ] && [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}⚠️  NODE_ENV が production ではありません: ${NODE_ENV}${NC}"
elif [ "$NODE_ENV" = "production" ] && [ "$ENVIRONMENT" = "staging" ]; then
    echo -e "${YELLOW}⚠️  Staging環境で NODE_ENV が production になっています${NC}"
else
    echo -e "${GREEN}✅ NODE_ENV が正しく設定されています: ${NODE_ENV}${NC}"
fi

# API URLのチェック
echo ""
case "$ENVIRONMENT" in
    staging)
        if [[ "$API_URL" == *"staging"* ]]; then
            echo -e "${GREEN}✅ API URL がステージング環境を指しています${NC}"
        else
            echo -e "${YELLOW}⚠️  API URL がステージング環境を指していない可能性があります${NC}"
            echo -e "   URL: ${API_URL}"
        fi
        ;;
    production)
        if [[ "$API_URL" == "https://api.nekoya.co.jp"* ]]; then
            echo -e "${GREEN}✅ API URL が本番環境を指しています${NC}"
        else
            echo -e "${YELLOW}⚠️  API URL が本番環境を指していない可能性があります${NC}"
            echo -e "   期待: https://api.nekoya.co.jp/api/v1"
            echo -e "   実際: ${API_URL}"
        fi
        ;;
esac

echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}検証完了${NC}"
echo -e "${BLUE}================================================${NC}"

# 生のJSONも表示（デバッグ用）
echo ""
echo -e "${BLUE}📄 生のJSON:${NC}"
echo "${RESPONSE}" | jq '.'
