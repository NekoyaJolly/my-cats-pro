# GitHub Secrets設定ガイド - デプロイメント用

このドキュメントでは、CI/CDパイプラインでのデプロイメントに必要なGitHub Secretsの設定方法を説明します。

## 🔑 必須シークレット

### 1. GCP_SA_KEY
**説明**: Google Cloud サービスアカウントのJSONキーファイルの全内容

**設定方法**:
1. Google Cloud Consoleでサービスアカウントキーを生成
   - [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - サービスアカウントを選択 → "Keys" タブ → "Add Key" → "Create new key"
   - JSON形式を選択してダウンロード

2. GitHubリポジトリのSecretsに追加
   - リポジトリの Settings > Secrets and variables > Actions
   - "New repository secret" をクリック
   - Name: `GCP_SA_KEY`
   - Value: ダウンロードしたJSONファイルの**全内容**をコピー&ペースト

**JSONの例**:
```json
{
  "type": "service_account",
  "project_id": "my-cats-pro",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "cloud-run-deployer@my-cats-pro.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**必要な権限**:
- Cloud Build Editor
- Cloud Run Admin
- Service Account User
- Artifact Registry Writer

### 2. GCP_PROJECT_ID
**説明**: Google Cloud プロジェクトのID

**設定方法**:
1. GitHubリポジトリのSecretsに追加
   - Name: `GCP_PROJECT_ID`
   - Value: `my-cats-pro` (プロジェクトIDに応じて変更)

## 🔍 設定の確認方法

### GitHub Actionsワークフローでの検証

デプロイメントジョブ（`deploy-staging`, `deploy-production`）は、実行前に自動的にシークレットの存在を確認します。

シークレットが設定されていない場合、以下のようなエラーメッセージが表示されます:

```
❌ Error: GCP_SA_KEY secret is not set
Please configure the GCP_SA_KEY secret in repository settings:
  Settings > Secrets and variables > Actions > New repository secret
  Name: GCP_SA_KEY
  Value: <Full JSON content of GCP service account key>
```

### ローカルでの確認

GitHub CLIを使用して、シークレットが設定されているか確認できます:

```bash
gh secret list
```

## ⚠️ よくあるエラーと解決方法

### エラー: "must specify exactly one of 'workload_identity_provider' or 'credentials_json'"

**原因**: `GCP_SA_KEY` シークレットが空、または設定されていない

**解決方法**:
1. GitHubリポジトリの Settings > Secrets and variables > Actions で `GCP_SA_KEY` が存在することを確認
2. シークレットの値が空でないことを確認（再設定が必要な場合があります）
3. JSONファイルの全内容が正しくコピーされているか確認（改行やスペースも含む）

### エラー: "Invalid credentials"

**原因**: サービスアカウントキーのJSON形式が不正、または権限不足

**解決方法**:
1. JSONファイルが正しい形式であることを確認
2. サービスアカウントに必要な権限が付与されているか確認
3. 新しいキーを生成して再設定

### エラー: "Project not found"

**原因**: `GCP_PROJECT_ID` が間違っている

**解決方法**:
1. Google Cloud ConsoleでプロジェクトIDを確認
2. `GCP_PROJECT_ID` シークレットの値を正しいプロジェクトIDに更新

## 📚 関連ドキュメント

- [GitHub Actions Secrets設定ガイド](./GITHUB_ACTIONS_SETUP.md)
- [CI/CD デプロイメントフロー](../docs/CICD_DEPLOYMENT_FLOW.md)
- [本番環境デプロイメントガイド](./CICD_PRODUCTION_GUIDE.md)

## 🔒 セキュリティベストプラクティス

1. **最小権限の原則**: サービスアカウントには必要最小限の権限のみを付与
2. **キーのローテーション**: 定期的にサービスアカウントキーを更新
3. **監査ログの確認**: Cloud Audit Logsで不審なアクティビティを監視
4. **環境ごとの分離**: staging と production で異なるサービスアカウントを使用することを推奨
