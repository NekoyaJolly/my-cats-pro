#!/usr/bin/env bash
#
# GCP Load Balancer & Custom Domain Setup Script
# このスクリプトは nekoya.co.jp ドメインをGCP Cloud Runサービスに紐付けます
#
# 前提条件:
# - gcloud CLI がインストール済み
# - 正しいGCPプロジェクトにログイン済み (my-cats-pro)
# - Cloud Run サービスがデプロイ済み

set -euo pipefail

# カラー出力用
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクト設定
PROJECT_ID="my-cats-pro"
REGION="asia-northeast1"
DOMAIN="nekoya.co.jp"
API_DOMAIN="api.nekoya.co.jp"
WWW_DOMAIN="www.nekoya.co.jp"

# Cloud Runサービス名
BACKEND_SERVICE="mycats-pro-backend"
FRONTEND_SERVICE="mycats-pro-frontend"

# リソース名
STATIC_IP_NAME="mycats-pro-lb-ip"
SSL_CERT_NAME="mycats-ssl-cert"
FRONTEND_NEG="mycats-frontend-neg"
BACKEND_NEG="mycats-backend-neg"
FRONTEND_BACKEND_SVC="mycats-frontend-backend"
BACKEND_BACKEND_SVC="mycats-backend-backend"
URL_MAP="mycats-lb-urlmap"
HTTPS_PROXY="mycats-https-proxy"
HTTP_PROXY="mycats-http-proxy"
HTTP_REDIRECT_MAP="mycats-http-redirect"
HTTPS_FWD_RULE="mycats-https-forwarding-rule"
HTTP_FWD_RULE="mycats-http-forwarding-rule"

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# プロジェクト確認
check_project() {
    log_info "現在のGCPプロジェクトを確認中..."
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
        log_warning "プロジェクトが $PROJECT_ID に設定されていません"
        log_info "プロジェクトを $PROJECT_ID に切り替えます"
        gcloud config set project "$PROJECT_ID"
    fi
    
    log_success "プロジェクト: $PROJECT_ID"
}

# Cloud Runサービスの存在確認
check_cloud_run_services() {
    log_info "Cloud Runサービスの存在を確認中..."
    
    if ! gcloud run services describe "$BACKEND_SERVICE" --region="$REGION" &>/dev/null; then
        log_error "バックエンドサービス $BACKEND_SERVICE が見つかりません"
        exit 1
    fi
    
    if ! gcloud run services describe "$FRONTEND_SERVICE" --region="$REGION" &>/dev/null; then
        log_error "フロントエンドサービス $FRONTEND_SERVICE が見つかりません"
        exit 1
    fi
    
    log_success "Cloud Runサービスが確認されました"
}

# ステップ1: 静的IPアドレスの予約
reserve_static_ip() {
    log_info "ステップ1: 静的IPアドレスを予約中..."
    
    if gcloud compute addresses describe "$STATIC_IP_NAME" --global &>/dev/null; then
        log_warning "静的IPアドレス $STATIC_IP_NAME は既に存在します"
        STATIC_IP=$(gcloud compute addresses describe "$STATIC_IP_NAME" --global --format="get(address)")
    else
        gcloud compute addresses create "$STATIC_IP_NAME" \
            --ip-version=IPV4 \
            --global
        
        STATIC_IP=$(gcloud compute addresses describe "$STATIC_IP_NAME" --global --format="get(address)")
        log_success "静的IPアドレスを予約しました: $STATIC_IP"
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  静的IPアドレス: ${YELLOW}$STATIC_IP${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "お名前.comのDNS設定で以下のAレコードを追加してください:"
    echo ""
    echo "  nekoya.co.jp.     A  3600  $STATIC_IP"
    echo "  www.nekoya.co.jp. A  3600  $STATIC_IP"
    echo "  api.nekoya.co.jp. A  3600  $STATIC_IP"
    echo ""
    read -p "DNS設定を完了したらEnterキーを押してください... " -r
}

# ステップ2: Serverless NEGの作成
create_serverless_negs() {
    log_info "ステップ2: Serverless NEGを作成中..."
    
    # フロントエンドNEG
    if gcloud compute network-endpoint-groups describe "$FRONTEND_NEG" --region="$REGION" &>/dev/null; then
        log_warning "フロントエンドNEG $FRONTEND_NEG は既に存在します"
    else
        gcloud compute network-endpoint-groups create "$FRONTEND_NEG" \
            --region="$REGION" \
            --network-endpoint-type=SERVERLESS \
            --cloud-run-service="$FRONTEND_SERVICE"
        log_success "フロントエンドNEGを作成しました"
    fi
    
    # バックエンドNEG
    if gcloud compute network-endpoint-groups describe "$BACKEND_NEG" --region="$REGION" &>/dev/null; then
        log_warning "バックエンドNEG $BACKEND_NEG は既に存在します"
    else
        gcloud compute network-endpoint-groups create "$BACKEND_NEG" \
            --region="$REGION" \
            --network-endpoint-type=SERVERLESS \
            --cloud-run-service="$BACKEND_SERVICE"
        log_success "バックエンドNEGを作成しました"
    fi
}

# ステップ3: バックエンドサービスの作成
create_backend_services() {
    log_info "ステップ3: バックエンドサービスを作成中..."
    
    # フロントエンドバックエンドサービス
    if gcloud compute backend-services describe "$FRONTEND_BACKEND_SVC" --global &>/dev/null; then
        log_warning "フロントエンドバックエンドサービス $FRONTEND_BACKEND_SVC は既に存在します"
    else
        gcloud compute backend-services create "$FRONTEND_BACKEND_SVC" \
            --global \
            --load-balancing-scheme=EXTERNAL_MANAGED
        
        gcloud compute backend-services add-backend "$FRONTEND_BACKEND_SVC" \
            --global \
            --network-endpoint-group="$FRONTEND_NEG" \
            --network-endpoint-group-region="$REGION"
        
        log_success "フロントエンドバックエンドサービスを作成しました"
    fi
    
    # バックエンドバックエンドサービス
    if gcloud compute backend-services describe "$BACKEND_BACKEND_SVC" --global &>/dev/null; then
        log_warning "バックエンドバックエンドサービス $BACKEND_BACKEND_SVC は既に存在します"
    else
        gcloud compute backend-services create "$BACKEND_BACKEND_SVC" \
            --global \
            --load-balancing-scheme=EXTERNAL_MANAGED
        
        gcloud compute backend-services add-backend "$BACKEND_BACKEND_SVC" \
            --global \
            --network-endpoint-group="$BACKEND_NEG" \
            --network-endpoint-group-region="$REGION"
        
        log_success "バックエンドバックエンドサービスを作成しました"
    fi
}

# ステップ4: URLマップの作成
create_url_map() {
    log_info "ステップ4: URLマップを作成中..."
    
    if gcloud compute url-maps describe "$URL_MAP" --global &>/dev/null; then
        log_warning "URLマップ $URL_MAP は既に存在します"
    else
        gcloud compute url-maps create "$URL_MAP" \
            --default-service="$FRONTEND_BACKEND_SVC"
        
        log_success "URLマップを作成しました"
    fi
    
    # パスマッチャーを追加 (api.nekoya.co.jp用)
    log_info "API用のホストルールを追加中..."
    
    # URLマップにホストルールを追加
    gcloud compute url-maps add-host-rule "$URL_MAP" \
        --hosts="$API_DOMAIN" \
        --path-matcher-name=api-matcher \
        --global 2>/dev/null || log_warning "ホストルールは既に存在する可能性があります"
    
    gcloud compute url-maps add-path-matcher "$URL_MAP" \
        --path-matcher-name=api-matcher \
        --default-service="$BACKEND_BACKEND_SVC" \
        --global 2>/dev/null || log_warning "パスマッチャーは既に存在する可能性があります"
    
    log_success "APIルーティングを設定しました"
}

# ステップ5: SSL証明書の作成
create_ssl_certificate() {
    log_info "ステップ5: Google Managed SSL証明書を作成中..."
    
    if gcloud compute ssl-certificates describe "$SSL_CERT_NAME" --global &>/dev/null; then
        log_warning "SSL証明書 $SSL_CERT_NAME は既に存在します"
        
        # 証明書の状態を確認
        CERT_STATUS=$(gcloud compute ssl-certificates describe "$SSL_CERT_NAME" --global --format="get(managed.status)")
        log_info "SSL証明書の状態: $CERT_STATUS"
    else
        gcloud compute ssl-certificates create "$SSL_CERT_NAME" \
            --domains="$DOMAIN,$WWW_DOMAIN,$API_DOMAIN" \
            --global
        
        log_success "SSL証明書を作成しました (プロビジョニングには15分〜24時間かかります)"
    fi
}

# ステップ6: HTTPSプロキシの作成
create_https_proxy() {
    log_info "ステップ6: HTTPSプロキシを作成中..."
    
    if gcloud compute target-https-proxies describe "$HTTPS_PROXY" --global &>/dev/null; then
        log_warning "HTTPSプロキシ $HTTPS_PROXY は既に存在します"
    else
        gcloud compute target-https-proxies create "$HTTPS_PROXY" \
            --url-map="$URL_MAP" \
            --ssl-certificates="$SSL_CERT_NAME"
        
        log_success "HTTPSプロキシを作成しました"
    fi
}

# ステップ7: HTTPS転送ルールの作成
create_https_forwarding_rule() {
    log_info "ステップ7: HTTPS転送ルールを作成中..."
    
    if gcloud compute forwarding-rules describe "$HTTPS_FWD_RULE" --global &>/dev/null; then
        log_warning "HTTPS転送ルール $HTTPS_FWD_RULE は既に存在します"
    else
        gcloud compute forwarding-rules create "$HTTPS_FWD_RULE" \
            --global \
            --load-balancing-scheme=EXTERNAL_MANAGED \
            --address="$STATIC_IP_NAME" \
            --target-https-proxy="$HTTPS_PROXY" \
            --ports=443
        
        log_success "HTTPS転送ルールを作成しました"
    fi
}

# ステップ8: HTTP → HTTPS リダイレクト
create_http_redirect() {
    log_info "ステップ8: HTTP → HTTPS リダイレクトを設定中..."
    
    # HTTPリダイレクト用URLマップ
    if gcloud compute url-maps describe "$HTTP_REDIRECT_MAP" --global &>/dev/null; then
        log_warning "HTTPリダイレクトマップ $HTTP_REDIRECT_MAP は既に存在します"
    else
        cat <<EOF | gcloud compute url-maps import "$HTTP_REDIRECT_MAP" --global --source=-
kind: compute#urlMap
name: $HTTP_REDIRECT_MAP
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF
        log_success "HTTPリダイレクトマップを作成しました"
    fi
    
    # HTTPプロキシ
    if gcloud compute target-http-proxies describe "$HTTP_PROXY" --global &>/dev/null; then
        log_warning "HTTPプロキシ $HTTP_PROXY は既に存在します"
    else
        gcloud compute target-http-proxies create "$HTTP_PROXY" \
            --url-map="$HTTP_REDIRECT_MAP"
        log_success "HTTPプロキシを作成しました"
    fi
    
    # HTTP転送ルール
    if gcloud compute forwarding-rules describe "$HTTP_FWD_RULE" --global &>/dev/null; then
        log_warning "HTTP転送ルール $HTTP_FWD_RULE は既に存在します"
    else
        gcloud compute forwarding-rules create "$HTTP_FWD_RULE" \
            --global \
            --load-balancing-scheme=EXTERNAL_MANAGED \
            --address="$STATIC_IP_NAME" \
            --target-http-proxy="$HTTP_PROXY" \
            --ports=80
        log_success "HTTP転送ルールを作成しました"
    fi
}

# SSL証明書の状態確認
check_ssl_status() {
    log_info "SSL証明書の状態を確認中..."
    
    CERT_STATUS=$(gcloud compute ssl-certificates describe "$SSL_CERT_NAME" --global --format="get(managed.status)")
    
    if [ "$CERT_STATUS" == "ACTIVE" ]; then
        log_success "SSL証明書がアクティブです ✅"
    else
        log_warning "SSL証明書の状態: $CERT_STATUS"
        log_info "DNS伝播後、15分〜24時間でACTIVEになります"
        echo ""
        echo "次のコマンドで状態を監視できます:"
        echo "  watch -n 60 'gcloud compute ssl-certificates describe $SSL_CERT_NAME --global --format=\"get(managed.status)\"'"
    fi
}

# CORS設定の更新案内
update_cors_instructions() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  次のステップ: Cloud Run環境変数の更新${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "バックエンドのCORS設定を更新してください:"
    echo ""
    echo "  gcloud run services update $BACKEND_SERVICE \\"
    echo "    --region=$REGION \\"
    echo "    --set-env-vars=\"CORS_ORIGIN=https://$DOMAIN,https://$WWW_DOMAIN\""
    echo ""
    echo "次回のデプロイ時に cloudbuild.yaml で以下を設定してください:"
    echo "  _NEXT_PUBLIC_API_URL=https://$API_DOMAIN/api/v1"
    echo "  _CORS_ORIGIN=https://$DOMAIN,https://$WWW_DOMAIN"
    echo ""
}

# メイン実行
main() {
    echo -e "${BLUE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  GCP Load Balancer & Custom Domain Setup"
    echo "  Domain: $DOMAIN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
    
    check_project
    check_cloud_run_services
    reserve_static_ip
    create_serverless_negs
    create_backend_services
    create_url_map
    create_ssl_certificate
    create_https_proxy
    create_https_forwarding_rule
    create_http_redirect
    check_ssl_status
    update_cors_instructions
    
    echo ""
    log_success "セットアップが完了しました! 🎉"
    echo ""
    echo "動作確認:"
    echo "  curl -I https://$DOMAIN"
    echo "  curl -I https://$API_DOMAIN/api/v1/health"
    echo ""
}

# スクリプト実行
main
