#!/bin/bash
set -e

PROJECT_ID="my-cats-pro"
SERVICE_ACCOUNT_NAME="github-actions-uploader"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="gdrive-credentials.json"

echo "🚀 Setting up Google Cloud for GitHub Actions integration..."

# 1. プロジェクトの設定
echo "📋 Setting project: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 2. Google Drive APIの有効化
echo "🔌 Enabling Google Drive API..."
gcloud services enable drive.googleapis.com

# 3. サービスアカウントの作成（既に存在する場合はスキップ）
echo "👤 Creating service account: $SERVICE_ACCOUNT_NAME"
if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL >/dev/null 2>&1; then
  echo "⚠️  Service account already exists, skipping creation"
else
  gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="GitHub Actions Google Drive Uploader" \
    --description="Service account for uploading files from GitHub Actions to Google Drive"
fi

# 4. JSONキーの作成
echo "🔑 Creating JSON key..."
if [ -f "$KEY_FILE" ]; then
  echo "⚠️  Key file already exists. Removing old key..."
  rm "$KEY_FILE"
fi

gcloud iam service-accounts keys create $KEY_FILE \
  --iam-account=$SERVICE_ACCOUNT_EMAIL

echo ""
echo "✅ Google Cloud setup completed!"
echo ""
echo "📄 Service Account Email: $SERVICE_ACCOUNT_EMAIL"
echo "🔑 JSON Key saved to: $KEY_FILE"
echo ""
echo "⚠️  IMPORTANT: Please share your Google Drive folder with this email address:"
echo "   $SERVICE_ACCOUNT_EMAIL"
echo ""
echo "Next steps:"
echo "1. Go to Google Drive and create/open the folder 'my_cats_pro'"
echo "2. Right-click → Share → Add: $SERVICE_ACCOUNT_EMAIL (Editor access)"
echo "3. Copy the folder ID from the URL"
echo "4. Run the GitHub Secrets setup script"
