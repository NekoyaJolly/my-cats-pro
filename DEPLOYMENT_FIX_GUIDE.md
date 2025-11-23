# デプロイ修正ガイド

## 修正内容

### 問題
Cloud Build が `cloudbuild.yaml` 内で使用されている bash 変数を Cloud Build substitution 変数として誤認識し、デプロイが失敗していました。

エラーメッセージ:
```
ERROR: (gcloud.builds.submit) INVALID_ARGUMENT: generic::invalid_argument: 
invalid value for 'build.substitutions': key in the template "DATABASE_URL_SECRET_NAME" 
is not a valid built-in substitution
```

### 解決方法

1. **cloudbuild.yaml の修正**
   - bash スクリプト内で動的にシークレット名を決定していた処理を削除
   - これらの変数を Cloud Build の公式 substitution 変数として定義
   - 以下の変数を `substitutions:` セクションに追加:
     - `_DATABASE_URL_SECRET_NAME`
     - `_JWT_SECRET_NAME`
     - `_JWT_REFRESH_SECRET_NAME`
     - `_CSRF_TOKEN_SECRET_NAME`

2. **.github/workflows/ci-cd.yml の修正**
   - ステージング環境デプロイ時に、適切なシークレット名を substitutions として渡すように変更
   - 例: `_DATABASE_URL_SECRET_NAME=DATABASE_URL_staging`

3. **新しいデプロイ専用ワークフローの追加**
   - `.github/workflows/deploy-only.yml` を追加
   - テストをスキップして、デプロイのみを実行可能

## デプロイのテスト方法

### 方法1: デプロイ専用ワークフローを使用（推奨）

1. GitHub リポジトリの「Actions」タブに移動
2. 左側のワークフロー一覧から「Deploy Only (Staging & Production)」を選択
3. 「Run workflow」ボタンをクリック
4. デプロイ先を選択:
   - `staging`: ステージング環境のみ
   - `production`: 本番環境のみ
   - `both`: ステージング → 本番の順にデプロイ
5. 「Run workflow」を実行

### 方法2: 通常の CI/CD パイプラインを使用

main または develop ブランチにプッシュすると、以下が実行されます:
- `develop` ブランチ: ステージング環境へのデプロイ
- `main` ブランチ: ステージング環境 → 本番環境へのデプロイ

ただし、この方法では全てのテスト（セキュリティスキャン、Lint、ユニットテスト、E2Eテスト等）が実行されるため、時間がかかります。

## 修正されたファイル

- `cloudbuild.yaml`: Cloud Build 設定ファイル
- `.github/workflows/ci-cd.yml`: メインの CI/CD パイプライン
- `.github/workflows/deploy-only.yml`: デプロイ専用ワークフロー（新規）

## 確認事項

デプロイ成功後、以下を確認してください:

### ステージング環境
- Backend: https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/health
- Frontend: https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app

### 本番環境
- Backend: https://mycats-pro-backend-518939509282.asia-northeast1.run.app/health
- Frontend: https://mycats-pro-frontend-518939509282.asia-northeast1.run.app

ヘルスチェックエンドポイントが HTTP 200 を返すことを確認してください。

## トラブルシューティング

### シークレットが設定されていないエラー

```
❌ Error: GCP_SA_KEY secret is not set
```

このエラーが発生した場合:
1. リポジトリの「Settings」→「Secrets and variables」→「Actions」に移動
2. 以下のシークレットが設定されているか確認:
   - `GCP_SA_KEY`: GCP サービスアカウントキーの JSON 全体
   - `GCP_PROJECT_ID`: GCP プロジェクト ID

### Cloud Build タイムアウト

デプロイに時間がかかる場合がありますが、これは正常です。Cloud Build のログで進行状況を確認できます。

### ヘルスチェックが失敗する

デプロイ直後はサービスの起動に時間がかかる場合があります。数分待ってから再度確認してください。

## 関連ドキュメント

- `GCP_DEPLOYMENT_SETUP.md`: GCP デプロイメントの初期セットアップガイド
- `cloudbuild.yaml`: Cloud Build 設定ファイル
- `.github/workflows/ci-cd.yml`: CI/CD パイプライン設定
