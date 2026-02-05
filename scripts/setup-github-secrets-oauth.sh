#!/bin/bash
set -e

REPO_OWNER="NekoyaJolly"
REPO_NAME="my-cats-pro"
REPO="$REPO_OWNER/$REPO_NAME"
OAUTH_TOKEN_FILE=".oauth-token.json"
FOLDER_ID_FILE=".folder_id"

echo "🔐 Setting up GitHub Secrets (OAuth2) for repository: $REPO"
echo ""

# 前提条件チェック
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "🔑 Please authenticate with GitHub CLI..."
  gh auth login
fi

if [ ! -f "$OAUTH_TOKEN_FILE" ]; then
  echo "❌ Error: $OAUTH_TOKEN_FILE not found"
  echo "Please run get-oauth-refresh-token.sh first"
  exit 1
fi

if [ ! -f "$FOLDER_ID_FILE" ]; then
  echo "❌ Error: $FOLDER_ID_FILE not found"
  echo "Please run get-drive-folder-id.sh first"
  exit 1
fi

FOLDER_ID=$(cat "$FOLDER_ID_FILE")

echo "📋 Configuration:"
echo "   Repository: $REPO"
echo "   OAuth token file: $OAUTH_TOKEN_FILE"
echo "   Folder ID: $FOLDER_ID"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

# 既存のサービスアカウント用シークレットを削除（存在する場合）
echo ""
echo "🗑️  Removing old service account secrets (if any)..."
gh secret delete GOOGLE_DRIVE_CREDENTIALS --repo="$REPO" 2>/dev/null || true

# OAuth トークンを設定
echo "🔑 Setting secret: GOOGLE_OAUTH_CREDENTIALS"
gh secret set GOOGLE_OAUTH_CREDENTIALS \
  --repo="$REPO" \
  < "$OAUTH_TOKEN_FILE"

# フォルダID
echo "📁 Setting secret: GOOGLE_DRIVE_FOLDER_ID"
echo "$FOLDER_ID" | gh secret set GOOGLE_DRIVE_FOLDER_ID \
  --repo="$REPO"

echo ""
echo "✅ GitHub Secrets setup completed!"
echo ""
echo "Secrets set:"
echo "  ✓ GOOGLE_OAUTH_CREDENTIALS"
echo "  ✓ GOOGLE_DRIVE_FOLDER_ID"
echo ""
echo "🎉 All done! Your workflow is ready to use."
