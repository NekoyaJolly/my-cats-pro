# デプロイ修正のテスト計画

## テスト目的
Cloud Build の substitution エラーが解消され、ステージング環境と本番環境へのデプロイが成功することを確認する。

## 前提条件
- GitHub リポジトリに以下のシークレットが設定されていること:
  - `GCP_SA_KEY`: GCP サービスアカウントキーの JSON
  - `GCP_PROJECT_ID`: GCP プロジェクト ID
- Cloud Secret Manager に以下のシークレットが存在すること:
  - `DATABASE_URL_staging`, `DATABASE_URL`
  - `JWT_SECRET_staging`, `JWT_SECRET`
  - `JWT_REFRESH_SECRET_staging`, `JWT_REFRESH_SECRET`
  - `CSRF_TOKEN_SECRET_staging`, `CSRF_TOKEN_SECRET`

## テストケース

### ケース1: ステージング環境へのデプロイ（推奨）

**手順:**
1. GitHub リポジトリの「Actions」タブを開く
2. 左サイドバーから「Deploy Only (Staging & Production)」を選択
3. 「Run workflow」ボタンをクリック
4. Environment ドロップダウンから「staging」を選択
5. 「Run workflow」をクリックして実行

**期待される結果:**
- ✅ Cloud Build が正常に起動
- ✅ 「INVALID_ARGUMENT: invalid value for 'build.substitutions'」エラーが発生しない
- ✅ Backend イメージのビルドと push が成功
- ✅ Frontend イメージのビルドと push が成功
- ✅ Backend が Cloud Run にデプロイされる
  - Secret Manager から `DATABASE_URL_staging` などを取得
- ✅ Frontend が Cloud Run にデプロイされる
- ✅ ヘルスチェックが成功（HTTP 200）

**確認項目:**
```bash
# Backend ヘルスチェック
curl -i https://mycats-pro-backend-staging-518939509282.asia-northeast1.run.app/health
# 期待: HTTP/2 200

# Frontend アクセス
curl -i https://mycats-pro-frontend-staging-518939509282.asia-northeast1.run.app
# 期待: HTTP/2 200
```

### ケース2: 本番環境へのデプロイ

⚠️ **注意**: このテストは staging が成功してから実行してください

**手順:**
1. GitHub リポジトリの「Actions」タブを開く
2. 左サイドバーから「Deploy Only (Staging & Production)」を選択
3. 「Run workflow」ボタンをクリック
4. Environment ドロップダウンから「production」を選択
5. 「Run workflow」をクリックして実行

**期待される結果:**
- ✅ Cloud Build が正常に起動
- ✅ Backend イメージのビルドと push が成功
- ✅ Frontend イメージのビルドと push が成功
- ✅ Backend が Cloud Run にデプロイされる
  - Secret Manager から `DATABASE_URL`（本番用）を取得
- ✅ Frontend が Cloud Run にデプロイされる
- ✅ ヘルスチェックが成功（HTTP 200）

**確認項目:**
```bash
# Backend ヘルスチェック
curl -i https://mycats-pro-backend-518939509282.asia-northeast1.run.app/health
# 期待: HTTP/2 200

# Frontend アクセス
curl -i https://mycats-pro-frontend-518939509282.asia-northeast1.run.app
# 期待: HTTP/2 200
```

### ケース3: ステージング → 本番の連続デプロイ

**手順:**
1. GitHub リポジトリの「Actions」タブを開く
2. 左サイドバーから「Deploy Only (Staging & Production)」を選択
3. 「Run workflow」ボタンをクリック
4. Environment ドロップダウンから「both」を選択
5. 「Run workflow」をクリックして実行

**期待される結果:**
- ✅ ステージング環境が先にデプロイされる
- ✅ ステージング環境のデプロイが成功後、本番環境のデプロイが開始
- ✅ 両環境とも正常にデプロイが完了
- ✅ 各環境で適切なシークレットが使用される
  - Staging: `DATABASE_URL_staging` 等
  - Production: `DATABASE_URL` 等

## エラーケースのテスト

### エラーケース1: 修正前のエラーが再現しないこと

**確認内容:**
Cloud Build のログに以下のエラーが **表示されない** ことを確認:
```
ERROR: (gcloud.builds.submit) INVALID_ARGUMENT: generic::invalid_argument: 
invalid value for 'build.substitutions': key in the template "DATABASE_URL_SECRET_NAME" 
is not a valid built-in substitution
```

### エラーケース2: Secret が存在しない場合

**期待される動作:**
Cloud Run デプロイ時に Secret Manager から取得できない場合、デプロイが失敗すること。
これは正常な動作であり、Secret を作成する必要がある。

## デバッグ手順

### Cloud Build ログの確認
1. Google Cloud Console を開く
2. Cloud Build > 履歴 に移動
3. 最新のビルドをクリック
4. ログを確認して以下をチェック:
   - ✅ Substitution variables が正しく認識されているか
   - ✅ Secret 名が正しく設定されているか
   - ✅ Docker イメージが正常にビルドされているか

### Cloud Run ログの確認
1. Google Cloud Console を開く
2. Cloud Run に移動
3. サービス（backend-staging, frontend-staging など）を選択
4. 「ログ」タブを開く
5. エラーがないか確認

### ローカルでの検証
```bash
# Cloud Build 設定の検証
gcloud builds submit --config=cloudbuild.yaml --dry-run

# Substitutions の確認
cat cloudbuild.yaml | grep -A 15 "^substitutions:"
```

## ロールバック手順

万が一デプロイに問題がある場合:

1. **前のリビジョンに戻す:**
```bash
# Cloud Run サービスのリビジョン一覧を取得
gcloud run revisions list --service=mycats-pro-backend-staging --region=asia-northeast1

# 特定のリビジョンにトラフィックを100%ルーティング
gcloud run services update-traffic mycats-pro-backend-staging \
  --region=asia-northeast1 \
  --to-revisions=<REVISION_NAME>=100
```

2. **コードを元に戻す:**
```bash
git revert <commit-hash>
git push origin main
```

## 成功判定基準

以下の全てが満たされた場合、テストは成功:
- ✅ ステージング環境への自動デプロイが成功
- ✅ 本番環境への自動デプロイが成功
- ✅ Cloud Build の substitution エラーが発生しない
- ✅ 各環境のヘルスチェックエンドポイントが HTTP 200 を返す
- ✅ 各環境で適切なシークレット（staging/production）が使用される
- ✅ 既存機能に影響がない（デザインや動作の変更なし）

## テスト完了後の報告

テストが完了したら、以下の情報を含めて報告してください:
- 実行した環境（staging/production/both）
- 実行日時
- 結果（成功/失敗）
- エラーが発生した場合はエラーメッセージとログ
- ヘルスチェックの結果（HTTP ステータスコード）

## 参考資料
- `DEPLOYMENT_FIX_GUIDE.md`: 修正内容の詳細
- `GCP_DEPLOYMENT_SETUP.md`: GCP 初期設定ガイド
- Cloud Build 公式ドキュメント: https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values
