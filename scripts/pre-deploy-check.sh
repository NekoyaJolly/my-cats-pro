#!/bin/bash
# デプロイ前の検証スクリプト

set -e

echo "🔍 デプロイ前チェックを開始..."

# 1. Prismaがdependenciesにあるか確認
echo "✓ Prismaの依存関係チェック..."
if grep -q '"prisma":' backend/package.json | grep -A5 '"dependencies"'; then
  echo "  ✅ prisma は dependencies に含まれています"
else
  echo "  ❌ エラー: prisma が dependencies に含まれていません"
  exit 1
fi

# 2. Dockerfileでprismaディレクトリがコピーされているか
echo "✓ Dockerfileのprismaコピーチェック..."
if grep -q "COPY backend/prisma ./prisma/" Dockerfile.backend; then
  echo "  ✅ prismaディレクトリが正しくコピーされています"
else
  echo "  ❌ エラー: prismaディレクトリがコピーされていません"
  exit 1
fi

# 3. cloudbuild.yamlでPORT環境変数を設定していないか
echo "✓ PORT環境変数チェック..."
if grep -q "PORT=" cloudbuild.yaml; then
  echo "  ❌ エラー: cloudbuild.yamlにPORT環境変数が設定されています"
  echo "  Cloud RunはPORTを自動設定するため削除してください"
  exit 1
else
  echo "  ✅ PORT環境変数は設定されていません（正しい）"
fi

# 4. 必要なシークレットが定義されているか
echo "✓ Secret Manager設定チェック..."
REQUIRED_SECRETS=("DATABASE_URL" "JWT_SECRET" "JWT_REFRESH_SECRET")
for secret in "${REQUIRED_SECRETS[@]}"; do
  if gcloud secrets describe "$secret" &>/dev/null; then
    echo "  ✅ シークレット $secret が存在します"
  else
    echo "  ⚠️  警告: シークレット $secret が見つかりません"
  fi
done

# 5. Cloud SQLインスタンスの存在確認
echo "✓ Cloud SQLインスタンスチェック..."
if gcloud sql instances describe mycats-prod-db --format="value(name)" &>/dev/null; then
  echo "  ✅ Cloud SQLインスタンスが存在します"
else
  echo "  ❌ エラー: Cloud SQLインスタンス mycats-prod-db が見つかりません"
  exit 1
fi

echo ""
echo "✨ すべてのチェックが完了しました！"
echo "📦 デプロイ可能です: gcloud builds submit --config cloudbuild.yaml ."
