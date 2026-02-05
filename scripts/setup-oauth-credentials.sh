#!/bin/bash
set -e

# OAuth2認証でGoogle Driveにアクセスするためのセットアップスクリプト
# サービスアカウントではなく、ユーザー自身のアカウントでアップロードするため

PROJECT_ID="my-cats-pro"

echo "🔐 Setting up OAuth2 credentials for Google Drive..."
echo ""

# 1. プロジェクトの設定
echo "📋 Setting project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 2. OAuth同意画面の設定を確認
echo ""
echo "⚠️  Please ensure OAuth consent screen is configured:"
echo "   1. Go to: https://console.cloud.google.com/apis/credentials/consent"
echo "   2. Select 'External' user type"
echo "   3. Fill in required information"
echo "   4. Add yourself as a test user"
echo ""
read -p "Press Enter when OAuth consent screen is configured..."

# 3. OAuth2クライアントIDの作成
echo ""
echo "🔑 Creating OAuth2 Client ID..."
echo ""
echo "Please go to: https://console.cloud.google.com/apis/credentials"
echo ""
echo "1. Click '+ CREATE CREDENTIALS' → 'OAuth client ID'"
echo "2. Application type: 'Desktop app'"
echo "3. Name: 'GitHub Actions Drive Uploader'"
echo "4. Click 'Create'"
echo "5. Download the JSON file"
echo "6. Rename it to 'oauth-credentials.json' and place it in this directory"
echo ""
read -p "Press Enter when you have the oauth-credentials.json file..."

if [ ! -f "oauth-credentials.json" ]; then
  echo "❌ Error: oauth-credentials.json not found"
  exit 1
fi

echo ""
echo "✅ OAuth credentials file found!"
echo ""
echo "Now run: ./scripts/get-oauth-refresh-token.sh"
