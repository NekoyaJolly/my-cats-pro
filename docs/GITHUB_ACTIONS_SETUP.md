# GitHub Actions セットアップガイド

このドキュメントでは、GitHub ActionsでCloud Runへの自動デプロイを設定する手順を説明します。

## 📋 前提条件

- GitHub リポジトリに push 権限がある
- Google Cloud プロジェクトへの管理者権限がある
- gcloud CLI がインストールされている

## 🔐 ステップ1: サービスアカウントの作成

### 1-1. サービスアカウントを作成

```bash
# プロジェクトIDを設定
export PROJECT_ID=my-cats-pro

# サービスアカウント作成
gcloud iam service-accounts create github-actions-deployer \
  --description="Service account for GitHub Actions deployment" \
  --display-name="GitHub Actions Deployer" \
  --project=$PROJECT_ID
```

### 1-2. 必要な権限を付与

```bash
# サービスアカウントのメールアドレスを取得
export SA_EMAIL="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Cloud Build Editor（ビルド実行）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

# Cloud Run Admin（サービス管理）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Service Account User（サービスアカウント使用）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Storage Admin（Cloud Buildのログ用）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

# Artifact Registry Writer（イメージ保存）
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"
```

### 1-3. キーファイルを生成

```bash
# キーファイルを生成（JSON形式）
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

# キーファイルの内容を表示（コピーしておく）
cat ~/github-actions-key.json
```

⚠️ **重要**: このキーファイルは一度しか表示されません。安全に保管してください。

## 🔑 ステップ2: GitHub Secretsの設定

### 2-1. GitHubリポジトリのSecretsページを開く

1. GitHubのリポジトリページを開く
2. **Settings** → **Secrets and variables** → **Actions** へ移動
3. **New repository secret** をクリック

### 2-2. シークレットを追加

#### `GCP_SA_KEY`
- Name: `GCP_SA_KEY`
- Secret: 先ほど生成したJSONキーファイルの**全内容**をコピー&ペースト

```json
{
  "type": "service_account",
  "project_id": "my-cats-pro",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions-deployer@my-cats-pro.iam.gserviceaccount.com",
  ...
}
```

## 🧪 ステップ3: ワークフローのテスト

### 3-1. 最初のプッシュ

```bash
git add .github/workflows/deploy-production.yml
git commit -m "ci: Add GitHub Actions deployment workflow"
git push origin main
```

### 3-2. GitHub Actionsの実行を確認

1. GitHubリポジトリの **Actions** タブを開く
2. 「Deploy to Production」ワークフローが実行されているか確認
3. 各ステップのログを確認

## ✅ ワークフローの流れ

```
┌─────────────────────┐
│  1. Validate        │  ← コードの静的チェック
│  - Linting          │
│  - Type checking    │
│  - Prisma validation│
│  - Build test       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2. Docker Build    │  ← Dockerイメージのビルドテスト
│  - Backend image    │
│  - Frontend image   │
│  - Verify contents  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. Deploy          │  ← Cloud Runへのデプロイ
│  - Cloud Build      │
│  - Health check     │
│  - Summary report   │
└─────────────────────┘
```

## 🎯 ワークフローの特徴

### ✅ 事前検証
- Prismaの依存関係チェック
- 予約環境変数のチェック
- TypeScriptの型チェック
- ビルドテスト

### ✅ Dockerビルドテスト
- イメージのビルド可能性を確認
- Prismaファイルの存在確認
- キャッシュを活用して高速化

### ✅ 自動デプロイ
- Cloud Buildを使用した本番デプロイ
- デプロイ後のヘルスチェック
- サービスURLの自動取得

### ✅ デプロイレポート
- GitHub Actionsのサマリーに結果を表示
- サービスURLを一目で確認
- 便利なコマンドも提供

## 🔧 トラブルシューティング

### エラー: `Permission denied`
**原因**: サービスアカウントの権限不足  
**解決**: ステップ1-2の権限付与を再確認

### エラー: `Invalid credentials`
**原因**: `GCP_SA_KEY` の設定ミス  
**解決**: JSONキーの全内容が正しくコピーされているか確認

### エラー: `Cloud Build failed`
**原因**: cloudbuild.yamlの設定エラー  
**解決**: Cloud Buildのログを確認

### Dockerビルドが遅い
**原因**: キャッシュが効いていない  
**解決**: GitHub Actionsのキャッシュが正常に動作しているか確認

## 📝 手動実行

緊急時や特定のコミットをデプロイしたい場合：

1. GitHubリポジトリの **Actions** タブを開く
2. 「Deploy to Production」を選択
3. **Run workflow** をクリック
4. ブランチを選択して **Run workflow** を実行

## 🚀 次のステップ

### 本番環境のURLを更新

初回デプロイ後、実際のCloud RunのURLを取得：

```bash
# バックエンドURL
gcloud run services describe mycats-pro-backend \
  --region asia-northeast1 \
  --format 'value(status.url)'

# フロントエンドURL
gcloud run services describe mycats-pro-frontend \
  --region asia-northeast1 \
  --format 'value(status.url)'
```

取得したURLを `cloudbuild.yaml` の以下の部分に設定：

```yaml
substitutions:
  _NEXT_PUBLIC_API_URL: 'https://mycats-pro-backend-xxx-an.a.run.app/api/v1'
  _CORS_ORIGIN: 'https://mycats-pro-frontend-xxx-an.a.run.app'
```

コミットしてプッシュ：

```bash
git add cloudbuild.yaml
git commit -m "chore: Update production URLs"
git push origin main
```

### ステージング環境の追加（推奨）

`.github/workflows/deploy-staging.yml` を作成して、developブランチへのプッシュで自動的にステージング環境にデプロイするように設定できます。

### プルリクエストでのプレビュー

プルリクエストごとに一時的な環境を作成し、レビュー時にテストできるようにすることも可能です。

## 🔒 セキュリティのベストプラクティス

1. ✅ サービスアカウントキーは絶対にコミットしない
2. ✅ 最小権限の原則（必要な権限のみ付与）
3. ✅ キーのローテーション（定期的に新しいキーを生成）
4. ✅ Secrets Scanningを有効化
5. ✅ ブランチ保護ルールを設定

## 📚 参考資料

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Build](https://cloud.google.com/build/docs)
- [Cloud Run Deployment](https://cloud.google.com/run/docs/deploying)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
