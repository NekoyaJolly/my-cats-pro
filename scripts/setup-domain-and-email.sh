#!/usr/bin/env bash
#
# GCP Load Balancer + カスタムドメイン + メール送信機能セットアップ
# このスクリプトを実行する前に、お名前.comでドメインを取得し、Resendアカウントを作成してください
#
# 実行手順:
# 1. chmod +x scripts/setup-domain-and-email.sh
# 2. ./scripts/setup-domain-and-email.sh

set -euo pipefail

# カラー出力
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_ID="my-cats-pro"

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  カスタムドメイン + メール送信機能セットアップ"
echo "  Project: $PROJECT_ID"
echo "  Domain: nekoya.co.jp"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

# ステップ1: GCP Load Balancerをセットアップ
echo -e "${GREEN}[ステップ 1/3]${NC} GCP Load Balancerをセットアップします"
echo ""
echo "以下のスクリプトを実行します:"
echo "  ./scripts/setup-custom-domain.sh"
echo ""
read -p "実行しますか? (y/N): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    bash ./scripts/setup-custom-domain.sh
else
    echo -e "${YELLOW}スキップしました${NC}"
fi

# ステップ2: Resend APIキーの登録
echo ""
echo -e "${GREEN}[ステップ 2/3]${NC} Resend APIキーをSecret Managerに登録します"
echo ""
echo "事前準備:"
echo "  1. https://resend.com にサインアップ"
echo "  2. ドメイン nekoya.co.jp を追加"
echo "  3. APIキーを作成 (Sending access)"
echo ""
read -p "APIキーを取得しましたか? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Resend APIキーを取得してから再度実行してください${NC}"
    echo "詳細: docs/EMAIL_INTEGRATION_GUIDE.md"
    exit 1
fi

echo ""
read -p "Resend APIキーを入力してください: " -s RESEND_API_KEY
echo ""

# 本番環境用のシークレットを作成
echo "シークレットを作成中..."

# Resend APIキー
if gcloud secrets describe RESEND_API_KEY_production --project=$PROJECT_ID &>/dev/null; then
    echo "RESEND_API_KEY_production は既に存在します。バージョンを追加します。"
    echo -n "$RESEND_API_KEY" | gcloud secrets versions add RESEND_API_KEY_production \
        --data-file=- \
        --project=$PROJECT_ID
else
    gcloud secrets create RESEND_API_KEY_production \
        --replication-policy="automatic" \
        --project=$PROJECT_ID
    
    echo -n "$RESEND_API_KEY" | gcloud secrets versions add RESEND_API_KEY_production \
        --data-file=- \
        --project=$PROJECT_ID
fi

echo -e "${GREEN}✓${NC} RESEND_API_KEY_production を登録しました"

# 権限付与
echo "Cloud Runサービスアカウントに権限を付与中..."
gcloud secrets add-iam-policy-binding RESEND_API_KEY_production \
    --member="serviceAccount:cloud-run-backend@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID

echo -e "${GREEN}✓${NC} 権限を付与しました"

# ステップ3: Cloud Runサービスの更新
echo ""
echo -e "${GREEN}[ステップ 3/3]${NC} Cloud Runサービスを更新します"
echo ""
echo "バックエンドサービスに以下の環境変数を追加します:"
echo "  - RESEND_API_KEY (Secret)"
echo "  - EMAIL_FROM=noreply@nekoya.co.jp"
echo "  - EMAIL_FROM_NAME=MyCats Pro"
echo "  - CORS_ORIGIN=https://nekoya.co.jp,https://www.nekoya.co.jp"
echo ""
read -p "実行しますか? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}スキップしました${NC}"
    echo ""
    echo "手動で以下のコマンドを実行してください:"
    echo ""
    echo "gcloud run services update mycats-pro-backend \\"
    echo "  --region=asia-northeast1 \\"
    echo "  --update-secrets=RESEND_API_KEY=RESEND_API_KEY_production:latest \\"
    echo "  --set-env-vars=\"EMAIL_FROM=noreply@nekoya.co.jp,EMAIL_FROM_NAME=MyCats Pro,CORS_ORIGIN=https://nekoya.co.jp,https://www.nekoya.co.jp\" \\"
    echo "  --project=$PROJECT_ID"
    exit 0
fi

gcloud run services update mycats-pro-backend \
    --region=asia-northeast1 \
    --update-secrets=RESEND_API_KEY=RESEND_API_KEY_production:latest \
    --set-env-vars="EMAIL_FROM=noreply@nekoya.co.jp,EMAIL_FROM_NAME=MyCats Pro,CORS_ORIGIN=https://nekoya.co.jp,https://www.nekoya.co.jp" \
    --project=$PROJECT_ID

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  セットアップ完了! 🎉${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "次のステップ:"
echo ""
echo "1. SSL証明書のプロビジョニングを確認"
echo "   gcloud compute ssl-certificates describe mycats-ssl-cert --global"
echo ""
echo "2. メール送信テスト"
echo "   curl -X POST https://api.nekoya.co.jp/api/v1/auth/test-email \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"email\":\"your-email@example.com\"}'"
echo ""
echo "3. ドメインアクセステスト"
echo "   https://nekoya.co.jp"
echo "   https://api.nekoya.co.jp/api/v1/health"
echo ""
