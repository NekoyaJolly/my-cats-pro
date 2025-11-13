# MyCats Pro - Documentation Index

Welcome to the MyCats Pro documentation! This directory contains comprehensive technical documentation for the cat breeding and care management system.

---

## 📋 Documentation Categories

### 🔍 Code Review & Quality (NEW!)

**Recent comprehensive codebase review completed on 2025-11-11**

| Document | Description | Audience |
|----------|-------------|----------|
| [**EXECUTIVE_SUMMARY_JP.md**](./EXECUTIVE_SUMMARY_JP.md) | 📊 エグゼクティブサマリー（日本語）<br>総合評価、ROI分析、優先度別推奨事項 | Product Owners, Managers |
| [**CODEBASE_REVIEW_REPORT.md**](./CODEBASE_REVIEW_REPORT.md) | 📝 包括的技術レビュー<br>セキュリティ、API、DB、UI、コード品質の詳細分析 | Tech Leads, Architects |
| [**IMPROVEMENT_ACTION_PLAN.md**](./IMPROVEMENT_ACTION_PLAN.md) | 🎯 実装アクションプラン<br>優先度別タスク、コード例、実装手順 | Development Team |
| [**QUICK_REFERENCE_CHECKLIST.md**](./QUICK_REFERENCE_CHECKLIST.md) | ✅ 開発者向けクイックリファレンス<br>日常的なチェックリスト、ベストプラクティス | All Developers |

**Overall Assessment:** 74/100 (Good) - Nearly production-ready with minor security enhancements needed

**🔄 ドキュメント統合履歴（2025-11-13）:**
- `docs/troubleshooting.md` → `../TROUBLESHOOTING.md` に統合（本番環境・パフォーマンス対応追加）
- `frontend/README.md` をプロジェクト固有の内容に更新
- `frontend/src/app/# Code Citations.md` → `CodeCitations.md` にリネーム

---

### 🏗️ Architecture & Design

| Document | Description |
|----------|-------------|
| [**system-design.md**](./system-design.md) | システム設計書 - アーキテクチャ概要 |
| [**functional-blueprint.md**](./functional-blueprint.md) | 機能ブループリント - UI→API→DB連携 |
| [**api-specification.md**](./api-specification.md) | API仕様書 - REST APIエンドポイント詳細 |
| [**diagrams/**](./diagrams/) | システム構成図・プロジェクト全体図 |

### 🗄️ Database Documentation

| Document | Description |
|----------|-------------|
| [**DATABASE_PRODUCTION_SCHEMA.md**](./DATABASE_PRODUCTION_SCHEMA.md) | 本番環境データベーススキーマ詳細 |
| [**DATABASE_ER_DIAGRAM.md**](./DATABASE_ER_DIAGRAM.md) | ER図とリレーション設計 |
| [**DATABASE_DEPLOYMENT_GUIDE.md**](./DATABASE_DEPLOYMENT_GUIDE.md) | データベースデプロイメントガイド |
| [**DOCKER_DATA_MIGRATION.md**](./DOCKER_DATA_MIGRATION.md) | Dockerデータマイグレーション手順 |

### 🔒 Security & Operations

| Document | Description |
|----------|-------------|
| [**security-auth.md**](./security-auth.md) | セキュリティ・認証設計 |
| [**operations.md**](./operations.md) | 運用手順書 - デプロイ・監視・メンテナンス |
| [**production-deployment.md**](./production-deployment.md) | 本番環境デプロイガイド |

### 🎨 Frontend & UI

| Document | Description |
|----------|-------------|
| [**ui-button-design-guide.md**](./ui-button-design-guide.md) | UIボタン設計ガイド |
| [**naming_convention_guidelines_v2.md**](./naming_convention_guidelines_v2.md) | 命名規則ガイドライン v2 |

### 🔧 Development Guides

| Document | Description |
|----------|-------------|
| [**eslint-setup-guide.md**](./eslint-setup-guide.md) | ESLintセットアップガイド |
| [**eslint-typescript-integration-report.md**](./eslint-typescript-integration-report.md) | ESLint + TypeScript統合レポート |
| [**STAFF_CREATION_GUIDE.md**](./STAFF_CREATION_GUIDE.md) | スタッフ作成ガイド |
| [**SHIFT_MANAGEMENT_REFACTORING.md**](./SHIFT_MANAGEMENT_REFACTORING.md) | シフト管理リファクタリング |

### 🛠️ Troubleshooting

| Document | Description |
|----------|-------------|
| [**troubleshooting.md**](./troubleshooting.md) | トラブルシューティングガイド |

### 📝 Work Logs

| Directory | Description |
|-----------|-------------|
| [**worklogs/**](./worklogs/) | 作業ログ・進捗記録 |

---

## 🚀 Quick Start Guides

### For New Developers

1. Start with the main **[README.md](../README.md)** in the project root
2. Review **[QUICK_REFERENCE_CHECKLIST.md](./QUICK_REFERENCE_CHECKLIST.md)** for daily development guidelines
3. Read **[system-design.md](./system-design.md)** to understand the architecture
4. Check **[api-specification.md](./api-specification.md)** for API details

### For Technical Leads

1. Review **[CODEBASE_REVIEW_REPORT.md](./CODEBASE_REVIEW_REPORT.md)** for comprehensive technical assessment
2. Read **[IMPROVEMENT_ACTION_PLAN.md](./IMPROVEMENT_ACTION_PLAN.md)** for implementation priorities
3. Check **[system-design.md](./system-design.md)** for architecture decisions
4. Review **[operations.md](./operations.md)** for operational procedures

### For Product Owners

1. Start with **[EXECUTIVE_SUMMARY_JP.md](./EXECUTIVE_SUMMARY_JP.md)** for business overview
2. Review priority recommendations and ROI analysis
3. Understand production readiness assessment
4. Plan resource allocation based on the improvement roadmap

---

## 📊 Recent Code Review Summary

**Review Date:** 2025-11-11  
**Overall Score:** 74/100 (Good)

| Category | Score | Status |
|----------|-------|--------|
| Security | 18/25 | ⭐⭐⭐ Good |
| API Design | 20/20 | ⭐⭐⭐⭐ Excellent |
| Database | 16/20 | ⭐⭐⭐ Good |
| UI | 14/20 | ⭐⭐⭐ Good |
| Code Quality | 13/15 | ⭐⭐⭐⭐ Excellent |

**Key Findings:**
- ✅ Strong security foundation with modern best practices
- ✅ Excellent API design and documentation
- ✅ Comprehensive CI/CD pipeline
- ⚠️ CSRF protection needed (CRITICAL)
- ⚠️ Environment variable security improvements needed
- ⚠️ Database index optimization recommended

**Next Steps:**
1. Review [EXECUTIVE_SUMMARY_JP.md](./EXECUTIVE_SUMMARY_JP.md) for business context
2. Check [IMPROVEMENT_ACTION_PLAN.md](./IMPROVEMENT_ACTION_PLAN.md) for implementation details
3. Implement CRITICAL items before production (12 hours estimated)

---

## 🔗 Related Resources

### External Documentation

- **Next.js 15 Docs:** https://nextjs.org/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs
- **Mantine UI Docs:** https://mantine.dev
- **React 19 Docs:** https://react.dev

### Project Links

- **GitHub Repository:** https://github.com/NekoyaJolly/mycats-pro
- **API Documentation (Dev):** http://localhost:3004/api/docs
- **CI/CD Pipeline:** .github/workflows/ci-cd.yml

---

## 📝 Contributing to Documentation

### Adding New Documentation

1. Create your document in the appropriate category
2. Use clear, descriptive filenames (e.g., `FEATURE_NAME_GUIDE.md`)
3. Add an entry to this README.md index
4. Include a brief description of the document's purpose
5. Follow the existing documentation style and format

### Documentation Standards

- **Language:** Technical documents in English, summaries available in Japanese
- **Format:** Markdown (.md) files
- **Structure:** Clear headings, table of contents for longer docs
- **Code Examples:** Include practical, runnable code examples
- **Updates:** Keep documents current with code changes

---

## 🔄 Documentation Maintenance

This documentation is actively maintained. For questions, updates, or improvements:

1. Create an issue on GitHub
2. Submit a pull request with proposed changes
3. Contact the development team

**Last Updated:** 2025-11-11  
**Documentation Version:** 2.0  
**Next Review:** 2026-02-11 (3 months)

---

## 📞 Support

For questions about this documentation or the MyCats Pro project:

- **Technical Questions:** See [troubleshooting.md](./troubleshooting.md)
- **API Questions:** See [api-specification.md](./api-specification.md)
- **Security Questions:** See [security-auth.md](./security-auth.md)
- **Deployment Questions:** See [production-deployment.md](./production-deployment.md)

---

**Document Index Version:** 2.0  
**Created:** 2025-11-11  
**Maintained by:** MyCats Pro Development Team
