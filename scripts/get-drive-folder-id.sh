#!/bin/bash
set -e

FOLDER_NAME="my_cats_pro"
KEY_FILE="gdrive-credentials.json"

if [ ! -f "$KEY_FILE" ]; then
  echo "❌ Error: $KEY_FILE not found"
  echo "Please run setup-gcp.sh first"
  exit 1
fi

echo "🔍 Searching for Google Drive folder: $FOLDER_NAME"
echo ""
echo "Installing required Python packages..."
pip3 install -q google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client

python3 << 'EOF'
from google.oauth2 import service_account
from googleapiclient.discovery import build
import sys

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
FOLDER_NAME = 'my_cats_pro'

try:
    credentials = service_account.Credentials.from_service_account_file(
        'gdrive-credentials.json', scopes=SCOPES)
    
    service = build('drive', 'v3', credentials=credentials)
    
    # フォルダを検索
    query = f"name='{FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    results = service.files().list(
        q=query,
        spaces='drive',
        fields='files(id, name, webViewLink, owners, permissions)',
        pageSize=10
    ).execute()
    
    items = results.get('files', [])
    
    if not items:
        print(f"\n❌ Folder '{FOLDER_NAME}' not found or not shared with this service account")
        print("\nPlease ensure:")
        print("1. The folder exists in Google Drive")
        print("2. The folder is shared with the service account email")
        sys.exit(1)
    
    if len(items) > 1:
        print(f"\n⚠️  Multiple folders named '{FOLDER_NAME}' found:")
        for idx, item in enumerate(items, 1):
            print(f"\n{idx}. {item['name']}")
            print(f"   ID: {item['id']}")
            print(f"   URL: {item['webViewLink']}")
    else:
        item = items[0]
        print(f"\n✅ Folder found!")
        print(f"\n📁 Name: {item['name']}")
        print(f"🆔 Folder ID: {item['id']}")
        print(f"🔗 URL: {item['webViewLink']}")
        print(f"\n💾 Save this Folder ID for GitHub Secrets setup:")
        print(f"   {item['id']}")
        
        # ファイルに保存
        with open('.folder_id', 'w') as f:
            f.write(item['id'])
        print(f"\n📝 Folder ID saved to .folder_id")

except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)
EOF
