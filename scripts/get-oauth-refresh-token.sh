#!/bin/bash
set -e

# OAuth2リフレッシュトークンを取得するスクリプト

CREDENTIALS_FILE="oauth-credentials.json"

if [ ! -f "$CREDENTIALS_FILE" ]; then
  echo "❌ Error: $CREDENTIALS_FILE not found"
  echo "Please run setup-oauth-credentials.sh first"
  exit 1
fi

echo "🔐 Getting OAuth2 refresh token..."
echo ""
echo "Installing required Python packages..."
pip3 install -q google-auth google-auth-oauthlib google-api-python-client

python3 << 'EOF'
import json
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/drive.file']

# OAuth2フローを実行
flow = InstalledAppFlow.from_client_secrets_file(
    'oauth-credentials.json', SCOPES)

# ローカルサーバーで認証（ブラウザが開きます）
print("\n🌐 A browser window will open for authentication...")
print("   Please sign in with your Google account.\n")

creds = flow.run_local_server(port=8080)

# リフレッシュトークンを取得
refresh_token = creds.refresh_token
client_id = creds.client_id
client_secret = creds.client_secret

print("\n✅ Authentication successful!")
print("\n" + "="*60)
print("📋 SAVE THESE VALUES AS GITHUB SECRETS:")
print("="*60)

# GitHub Secretsに保存する形式で出力
oauth_data = {
    "client_id": client_id,
    "client_secret": client_secret,
    "refresh_token": refresh_token,
    "type": "authorized_user"
}

# ファイルに保存
with open('.oauth-token.json', 'w') as f:
    json.dump(oauth_data, f, indent=2)

print("\n📝 OAuth token saved to .oauth-token.json")
print("\nNext step:")
print("  Run: ./scripts/setup-github-secrets-oauth.sh")
EOF
