#!/bin/bash
set -e

# 既存のOAuthトークンファイルからrclone設定を生成し、GitHub Secretsに登録するスクリプト

OAUTH_TOKEN_FILE=".oauth-token.json"
OAUTH_CREDS_FILE="oauth-credentials.json"
REPO_OWNER="NekoyaJolly"
REPO_NAME="my-cats-pro"
REPO="$REPO_OWNER/$REPO_NAME"

echo "🔐 Setting up rclone secrets for repository: $REPO"
echo ""

if [ ! -f "$OAUTH_TOKEN_FILE" ] || [ ! -f "$OAUTH_CREDS_FILE" ]; then
  echo "❌ Error: OAuth token/credentials files not found."
  echo "Please run setup-oauth-credentials.sh and get-oauth-refresh-token.sh first."
  exit 1
fi

echo "📦 Generating rclone config..."

# Pythonを使ってJSONパースとConfig生成を行う
python3 << 'EOF'
import json
import base64
import os

with open('.oauth-token.json', 'r') as f:
    token_data = json.load(f)

with open('oauth-credentials.json', 'r') as f:
    creds_data = json.load(f)

# installed or web ?
client_config = creds_data.get('installed') or creds_data.get('web')
client_id = client_config.get('client_id')
client_secret = client_config.get('client_secret')
refresh_token = token_data.get('refresh_token')
access_token = token_data.get('access_token') # まだ有効なら使う

# Token JSON for rclone
# rclone expects: {"access_token":"...","token_type":"Bearer","refresh_token":"...","expiry":"..."}
# We recreate a minimal valid token json structure
token_json = json.dumps({
    "access_token": "dummy", # will be refreshed
    "token_type": "Bearer",
    "refresh_token": refresh_token,
    "expiry": "2000-01-01T00:00:00.000000+00:00"
})

rclone_config = f"""[gdrive]
type = drive
client_id = {client_id}
client_secret = {client_secret}
scope = drive.file
token = {token_json}
"""

print("\n--- Generated rclone.conf content ---")
print(rclone_config)
print("-------------------------------------")

# Base64 encode
encoded_conf = base64.b64encode(rclone_config.encode('utf-8')).decode('utf-8')

# Save to tmp file for gh cli
with open('.rclone_conf_b64', 'w') as f:
    f.write(encoded_conf)

EOF

echo "🔑 Uploading secrets to GitHub..."

RCLONE_CONF_B64=$(cat .rclone_conf_b64)

echo "$RCLONE_CONF_B64" | gh secret set RCLONE_CONF --repo="$REPO"

# Clean up
rm .rclone_conf_b64

echo ""
echo "✅ Secrets set:"
echo "  ✓ RCLONE_CONF"
echo ""
echo "🎉 Rclone setup complete!"
