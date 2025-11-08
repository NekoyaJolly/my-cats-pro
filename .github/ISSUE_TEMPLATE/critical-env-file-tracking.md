---
name: 🔴 Critical - .env.development がGit追跡対象に含まれている
about: 開発環境設定ファイルが機密情報を含んだままバージョン管理されている
title: '[CRITICAL] Remove .env.development from version control'
labels: 'security, critical, config'
assignees: ''
---

## 🚨 問題の概要

`.env.development` ファイルがGitで追跡されており、データベース認証情報、JWT秘密鍵、管理者パスワードなどの機密情報が含まれている。

## 🔍 現状

```bash
$ git ls-files | grep -E "\.env$|\.env\." | grep -v ".example"
.env.development
```

## 🎯 影響範囲

- **重要度**: 🔴 Critical
- **カテゴリ**: セキュリティ / 設定管理
- **影響**: 
  - Git履歴に機密情報が永続化
  - 誰でもリポジトリをクローンすれば機密情報にアクセス可能
  - 攻撃者が認証情報を使用して不正アクセスを試みる可能性

## 📋 含まれている機密情報

```env
DATABASE_URL="postgresql://mycats:mycats_dev_password@localhost:5433/mycats_development?schema=public"
JWT_SECRET="development-jwt-secret-at-least-32-characters-long-for-security-please-change-in-production"
JWT_REFRESH_SECRET="development-refresh-secret-at-least-32-characters-long-please-change-in-production"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="Passw0rd!"
```

## ✅ 対応タスク

### 即座の対応

- [ ] ファイルをGit追跡から除外
- [ ] `.gitignore` に明示的に追加（念のため）

### Git履歴のクリーンアップ（推奨）

- [ ] BFG Repo-Cleaner または git-filter-repo を使用してGit履歴から完全削除
- [ ] 全開発者にリポジトリの再クローンを依頼

### 秘密情報のローテーション

- [ ] JWT_SECRET を新しい値に変更
- [ ] JWT_REFRESH_SECRET を新しい値に変更
- [ ] データベースパスワードを変更（可能な場合）
- [ ] ADMIN_PASSWORD を変更
- [ ] 本番環境の秘密情報が異なることを確認

### 再発防止策

- [ ] pre-commit フックで `.env*` ファイルのコミットを防止

## 📚 参考資料

- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- 調査レポート: `PRODUCTION_DEPLOYMENT_ISSUES.md`
