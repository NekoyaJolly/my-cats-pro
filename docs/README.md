# mycats-pro ドキュメント

このディレクトリには、mycats-pro プロジェクトの包括的なドキュメントが含まれています。

## 📋 目次

### 🚀 デプロイとバージョン管理（最新）

**新規ユーザーはここから始めてください:**

1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⭐ おすすめ
   - デプロイバージョン管理のクイックリファレンス
   - よく使うコマンド一覧
   - トラブルシューティングのショートカット

2. **[DEPLOYMENT_VERSION_SOLUTION_SUMMARY.md](./DEPLOYMENT_VERSION_SOLUTION_SUMMARY.md)**
   - デプロイバージョン問題の完全な実装サマリー
   - 原因分析と解決策
   - 使用方法と期待される成果

3. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**
   - 本番・ステージング環境へのデプロイ手順
   - 環境別の設定
   - ベストプラクティス

4. **[DEPLOYMENT_VERSION_ISSUE.md](./DEPLOYMENT_VERSION_ISSUE.md)**
   - 技術的な詳細分析
   - 根本原因の調査結果
   - 実装の詳細説明

5. **[DOCKER_BUILD_OPTIMIZATION.md](./DOCKER_BUILD_OPTIMIZATION.md)**
   - ビルドパフォーマンスの最適化ガイド
   - 代替アプローチの比較
   - 段階的な改善計画

### 🏗️ システム設計とアーキテクチャ

- **[system-design.md](./system-design.md)** - システム全体の設計思想
- **[api-specification.md](./api-specification.md)** - API 仕様書
- **[naming_convention_guidelines_v2.md](./naming_convention_guidelines_v2.md)** - 命名規則ガイドライン

### 🗄️ データベース

- **[DATABASE_PRODUCTION_SCHEMA.md](./DATABASE_PRODUCTION_SCHEMA.md)** - 本番環境のスキーマ定義
- **[DATABASE_DEPLOYMENT_GUIDE.md](./DATABASE_DEPLOYMENT_GUIDE.md)** - データベースデプロイガイド
- **[SUPABASE_CONNECTION_GUIDE.md](./SUPABASE_CONNECTION_GUIDE.md)** - Supabase 接続ガイド
- **[MIGRATION_FROM_LOCAL_POSTGRES.md](./MIGRATION_FROM_LOCAL_POSTGRES.md)** - ローカル PostgreSQL からの移行

### 🔐 セキュリティと認証

- **[SUPER_ADMIN_SETUP.md](./SUPER_ADMIN_SETUP.md)** - スーパー管理者のセットアップ

### 🎨 UI/UX デザイン

- **[ui-button-design-guide.md](./ui-button-design-guide.md)** - ボタンデザインガイド
- **[PEDIGREE_PDF_DESIGN.md](./PEDIGREE_PDF_DESIGN.md)** - 血統書 PDF デザイン

### 🔄 CI/CD とデプロイメント

- **[CICD_DEPLOYMENT_FLOW.md](./CICD_DEPLOYMENT_FLOW.md)** - CI/CD フロー全体像
- **[production-deployment.md](./production-deployment.md)** - 本番デプロイ手順
- **[production-final-validation.md](./production-final-validation.md)** - 本番環境の最終検証

### 📧 統合サービス

- **[EMAIL_INTEGRATION_GUIDE.md](./EMAIL_INTEGRATION_GUIDE.md)** - メール送信統合ガイド
- **[GOOGLE_DRIVE_INTEGRATION_SETUP.md](./GOOGLE_DRIVE_INTEGRATION_SETUP.md)** - Google Drive 統合

### 🛡️ 品質保証

- **[mycats_pro_再発防止ガード機構_実装パッケージ.md](./mycats_pro_再発防止ガード機構_実装パッケージ.md)** - エラー防止機構

### 🔧 開発ツール

- **[Vertical_Review_Agent_Pronpt](./Vertical_Review_Agent_Pronpt)** - 縦割りレビューエージェント用プロンプト
- **[Vertical_Review_To_Copilot_Agent](./Vertical_Review_To_Copilot_Agent)** - Copilot エージェント向け指示

### 📊 図表とダイアグラム

- **[diagrams/](./diagrams/)** - システム図、ER 図など
- **[deployment/](./deployment/)** - デプロイメント関連の資料

---

## 🎯 用途別ドキュメントガイド

### 初めてプロジェクトに参加する場合

1. [system-design.md](./system-design.md) - システム全体を理解
2. [api-specification.md](./api-specification.md) - API 構造を把握
3. [naming_convention_guidelines_v2.md](./naming_convention_guidelines_v2.md) - 命名規則を学習
4. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - デプロイ方法を確認

### デプロイを実施する場合

1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) ⭐ - クイックリファレンスで手順確認
2. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 詳細な手順を参照
3. [production-deployment.md](./production-deployment.md) - 本番デプロイの注意点
4. [production-final-validation.md](./production-final-validation.md) - デプロイ後の検証

### トラブルシューティング

1. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - よくある問題と解決策
2. [DEPLOYMENT_VERSION_ISSUE.md](./DEPLOYMENT_VERSION_ISSUE.md) - バージョン関連の問題
3. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 詳細なトラブルシューティング

### データベース変更を行う場合

1. [DATABASE_PRODUCTION_SCHEMA.md](./DATABASE_PRODUCTION_SCHEMA.md) - 現在のスキーマ
2. [DATABASE_DEPLOYMENT_GUIDE.md](./DATABASE_DEPLOYMENT_GUIDE.md) - マイグレーション手順
3. [SUPABASE_CONNECTION_GUIDE.md](./SUPABASE_CONNECTION_GUIDE.md) - 接続設定

### パフォーマンス最適化

1. [DOCKER_BUILD_OPTIMIZATION.md](./DOCKER_BUILD_OPTIMIZATION.md) - ビルド最適化
2. [system-design.md](./system-design.md) - システムアーキテクチャの最適化

---

## 📝 ドキュメント作成・更新のガイドライン

### 新しいドキュメントを追加する場合

1. **適切なカテゴリを選択**: 上記の目次に従って配置
2. **わかりやすいファイル名**: `UPPERCASE_SNAKE_CASE.md` を使用
3. **目次を更新**: このREADMEの該当セクションにリンクを追加
4. **日付を記載**: ドキュメント末尾に作成日・更新日を記載

### ドキュメントの構造

```markdown
# タイトル

## 概要
簡潔な説明

## 目次
- セクション1
- セクション2

## 詳細
...

---
作成日: YYYY-MM-DD
最終更新: YYYY-MM-DD
```

### 言語

- **日本語**: ドキュメントの本文
- **英語**: コード例、コマンド、技術用語

---

## 🔄 更新履歴

### 2026-02-13
- デプロイバージョン管理関連のドキュメントを追加
  - QUICK_REFERENCE.md
  - DEPLOYMENT_VERSION_SOLUTION_SUMMARY.md
  - DEPLOYMENT_GUIDE.md
  - DEPLOYMENT_VERSION_ISSUE.md
  - DOCKER_BUILD_OPTIMIZATION.md

### これ以前
- 既存のシステムドキュメント群

---

## 📞 サポート

ドキュメントに関する質問や追加リクエストは、GitHub Issues で作成してください。

- **カテゴリ**: Documentation
- **ラベル**: `documentation`, `question`
- **テンプレート**: Issue テンプレートを使用

---

**プロジェクト**: mycats-pro (Nekoya Management System)  
**管理者**: Nekoya co.ltd  
**最終更新**: 2026-02-13
