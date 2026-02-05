#!/bin/bash
set -e

REPO_OWNER="NekoyaJolly"
REPO_NAME="my-cats-pro"
REPO="$REPO_OWNER/$REPO_NAME"
KEY_FILE="gdrive-credentials.json"
FOLDER_ID_FILE=".folder_id"

echo "🔐 Setting up GitHub Secrets for repository: $REPO"
echo ""

# 前提条件チェック
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) is not installed"
  echo "Please install it from: https://cli.github.com/"
  exit 1
fi

# GitHub CLI認証チェック
if ! gh auth status >/dev/null 2>&1; then
  echo "🔑 Please authenticate with GitHub CLI..."
  gh auth login
fi

# JSONキーファイルの確認
if [ ! -f "$KEY_FILE" ]; then
  echo "❌ Error: $KEY_FILE not found"
  echo "Please run setup-gcp.sh first"
  exit 1
fi

# フォルダIDファイルの確認
if [ ! -f "$FOLDER_ID_FILE" ]; then
  echo "❌ Error: $FOLDER_ID_FILE not found"
  echo "Please run get-drive-folder-id.sh first"
  exit 1
fi

FOLDER_ID=$(cat "$FOLDER_ID_FILE")

echo "📋 Configuration:"
echo "   Repository: $REPO"
echo "   Credentials file: $KEY_FILE"
echo "   Folder ID: $FOLDER_ID"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled"
  exit 0
fi

# Secret 1: Google Drive Credentials
echo ""
echo "🔑 Setting secret: GOOGLE_DRIVE_CREDENTIALS"
gh secret set GOOGLE_DRIVE_CREDENTIALS \
  --repo="$REPO" \
  < "$KEY_FILE"

# Secret 2: Google Drive Folder ID
echo "📁 Setting secret: GOOGLE_DRIVE_FOLDER_ID"
echo "$FOLDER_ID" | gh secret set GOOGLE_DRIVE_FOLDER_ID \
  --repo="$REPO"

echo ""
echo "✅ GitHub Secrets setup completed!"
echo ""
echo "Secrets set:"
echo "  ✓ GOOGLE_DRIVE_CREDENTIALS"
echo "  ✓ GOOGLE_DRIVE_FOLDER_ID"
echo ""
echo "🎉 All done! Your workflow is ready to use."
echo ""
echo "To verify, go to:"
echo "https://github.com/$REPO/settings/secrets/actions"
