# Google Drive Integration Setup Guide

このガイドでは、GitHub ActionsからGoogle Driveへファイルを自動アップロードする機能のセットアップ方法を説明します。

## 前提条件

- Google Cloud CLIがインストールされていること
- GitHub CLIがインストールされていること
- Google Cloudプロジェクト `my-cats-pro` へのアクセス権限
- リポジトリへの管理者権限

### 必要なCLIのインストール

#### Google Cloud CLI
```bash
# macOS
brew install google-cloud-sdk

# その他のOS
# https://cloud.google.com/sdk/docs/install を参照
```

#### GitHub CLI
```bash
# macOS
brew install gh

# その他のOS
# https://cli.github.com/ を参照
```

## セットアップ手順

### Step 1: Google Cloud認証

```bash
# Google Cloudにログイン
gcloud auth login

# プロジェクトの確認
gcloud config set project my-cats-pro
```

### Step 2: GCPリソースのセットアップ

```bash
# スクリプトに実行権限を付与
chmod +x scripts/setup-gcp.sh

# GCP設定を実行
./scripts/setup-gcp.sh
```

このスクリプトは以下を実行します：
- Google Drive APIの有効化
- サービスアカウントの作成
- 認証用JSONキーの生成

**重要**: 出力されるサービスアカウントのメールアドレスをメモしてください。

### Step 3: Google Driveフォルダの共有

1. [Google Drive](https://drive.google.com/) を開く
2. `my_cats_pro` という名前のフォルダを作成（既存の場合はスキップ）
3. フォルダを右クリック → **共有**
4. Step 2で出力されたサービスアカウントのメールアドレスを追加
   - 形式: `github-actions-uploader@my-cats-pro.iam.gserviceaccount.com`
   - 権限: **編集者**
5. **送信** をクリック

### Step 4: フォルダIDの取得

```bash
# スクリプトに実行権限を付与
chmod +x scripts/get-drive-folder-id.sh

# フォルダIDを取得
./scripts/get-drive-folder-id.sh
```

成功すると、フォルダIDが `.folder_id` ファイルに保存されます。

### Step 5: GitHub Secretsの設定

```bash
# GitHub CLIで認証（初回のみ）
gh auth login

# スクリプトに実行権限を付与
chmod +x scripts/setup-github-secrets.sh

# GitHub Secretsを設定
./scripts/setup-github-secrets.sh
```

これにより、以下のシークレットが設定されます：
- `GOOGLE_DRIVE_CREDENTIALS`: サービスアカウントのJSONキー
- `GOOGLE_DRIVE_FOLDER_ID`: Google DriveフォルダのID

### Step 6: 動作確認

1. mainブランチに何か変更をpush
2. [Actions](https://github.com/NekoyaJolly/my-cats-pro/actions) タブで実行状況を確認
3. Google Driveの `my_cats_pro` フォルダに新しいドキュメントが追加されているか確認

## トラブルシューティング

### "Permission denied" エラー

Google Driveフォルダがサービスアカウントと共有されていることを確認してください。

```bash
# フォルダIDを再確認
./scripts/get-drive-folder-id.sh
```

### "API not enabled" エラー

Google Drive APIが有効化されているか確認：

```bash
gcloud services list --enabled | grep drive
```

有効化されていない場合：

```bash
gcloud services enable drive.googleapis.com
```

### JSONキーファイルが見つからない

セットアップスクリプトを再実行：

```bash
./scripts/setup-gcp.sh
```

## セキュリティに関する注意事項

⚠️ **重要**: 以下のファイルは絶対にGitにコミットしないでください：

- `gdrive-credentials.json`
- `.folder_id`

これらは既に `.gitignore` に追加されています。

## クリーンアップ

セットアップ完了後、ローカルの認証情報を削除できます：

```bash
rm gdrive-credentials.json
rm .folder_id
```

（GitHub Secretsには既に保存されているため、ローカルファイルは不要です）

## 参考リンク

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Drive API Documentation](https://developers.google.com/drive)
- [GitHub Actions Secrets](https://github.com/NekoyaJolly/my-cats-pro/settings/secrets/actions)
