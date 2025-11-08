---
name: 🟡 Medium - フロントエンド環境変数の例示ファイルが存在しない
about: フロントエンドのデプロイ時に必要な環境変数設定が不明確
title: '[MEDIUM] Create frontend/.env.example file'
labels: 'documentation, medium, config'
assignees: ''
---

## 🚨 問題の概要

フロントエンドディレクトリに `.env.example` ファイルが存在せず、必要な環境変数の設定が不明確。

## 🔍 現状

```bash
$ ls -la frontend/.env*
# 何も表示されない - .env.example が存在しない
```

バックエンドには `.env.example` が存在するが、フロントエンドには存在しない。

## 🎯 影響範囲

- **重要度**: 🟡 Medium
- **カテゴリ**: ドキュメンテーション / デプロイ
- **影響**: 
  - 新規開発者のオンボーディングが困難
  - デプロイ時に必要な環境変数が不明確
  - 設定ミスによるデプロイ失敗のリスク

## ✅ 対応タスク

### ファイル作成

- [ ] `frontend/.env.example` を作成
  ```env
  # Frontend Environment Variables Example
  
  # API エンドポイント（必須）
  # 本番環境: 実際のAPIドメインを設定
  # 開発環境: http://localhost:3004/api/v1
  NEXT_PUBLIC_API_URL=http://localhost:3004/api/v1
  
  # 環境識別子（必須）
  # development | production | test
  NEXT_PUBLIC_ENV=development
  
  # 認証バイパス（開発専用 - 本番では絶対に設定しないこと）
  # NEXT_PUBLIC_AUTH_DISABLED=0
  
  # Sentry DSN（オプション - エラー追跡）
  # NEXT_PUBLIC_SENTRY_DSN=
  
  # Feature Flags（オプション）
  # NEXT_PUBLIC_ENABLE_ANALYTICS=false
  # NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
  ```

### ドキュメント更新

- [ ] README.md のクイックスタート セクションを更新
  ```markdown
  ### フロントエンド環境変数の設定
  
  \`\`\`bash
  cd frontend
  cp .env.example .env.local
  # 必要に応じて .env.local を編集
  \`\`\`
  ```

- [ ] セットアップスクリプトに追加
  ```bash
  # scripts/setup-dev.sh に追加
  if [ ! -f frontend/.env.local ]; then
    echo "📝 Creating frontend/.env.local from example..."
    cp frontend/.env.example frontend/.env.local
  fi
  ```

### 検証

- [ ] 新規クローンした環境でセットアップ手順が動作することを確認
- [ ] すべての必要な環境変数が `.env.example` に含まれていることを確認
- [ ] コメントが分かりやすく、各変数の用途が明確であることを確認

## 📚 参考資料

- Next.js 環境変数: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
- 調査レポート: `PRODUCTION_DEPLOYMENT_ISSUES.md` - Issue #4

## 🔗 関連ファイル

- `backend/.env.example` - 参考として
- `.env.development.example` - ルートレベルの例示ファイル
- `.env.production.example` - 本番環境の例示ファイル
