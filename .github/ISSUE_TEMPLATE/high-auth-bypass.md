---
name: 🟠 High - AUTH_DISABLED バイパス機構が本番コードに残存
about: 認証バイパス機能が本番環境で誤って有効化されるリスク
title: '[HIGH] Remove or strengthen AUTH_DISABLED bypass mechanism'
labels: 'security, high, authentication'
assignees: ''
---

## 🚨 問題の概要

開発用の認証バイパス機構（AUTH_DISABLED）が本番コードに残存しており、設定ミスにより本番環境で認証が完全にバイパスされるリスクがある。

## 🔍 影響を受けるファイル

- `backend/src/auth/jwt-auth.guard.ts`
- `frontend/src/middleware.ts`

## 🎯 影響範囲

- **重要度**: 🟠 High
- **カテゴリ**: セキュリティ / 認証
- **影響**: 
  - 環境変数の設定ミスで全エンドポイントが保護なしになる
  - デプロイ時に誤って `AUTH_DISABLED=1` を設定してしまう可能性
  - 人的エラーによる重大なセキュリティ侵害

## 📋 現在の実装

**バックエンド (jwt-auth.guard.ts)**:
```typescript
async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.AUTH_DISABLED === "1") {
        const req = context.switchToHttp().getRequest();
        if (!req.user) {
            req.user = {
                userId: "dev-admin",
                email: "dev-admin@example.com",
                role: "ADMIN",
            };
        }
        return true;
    }
    // ... 通常の認証処理
}
```

**フロントエンド (middleware.ts)**:
フロントエンドには本番環境チェックがあるが、バックエンドには無い。

## ✅ 対応タスク

### オプション1: 完全削除（推奨）

- [ ] `jwt-auth.guard.ts` から AUTH_DISABLED チェックを完全に削除
- [ ] `frontend/src/middleware.ts` から AUTH_DISABLED チェックを完全に削除
- [ ] 開発環境でも正規の認証フローを使用
- [ ] テストデータとして開発用アカウントを用意

### オプション2: 厳格化（次善策）

- [ ] バックエンドの環境検証に AUTH_DISABLED チェックを追加
  ```typescript
  // backend/src/common/environment.validation.ts
  if (process.env.NODE_ENV === 'production' && process.env.AUTH_DISABLED === "1") {
    throw new Error("AUTH_DISABLED cannot be enabled in production environment");
  }
  ```

- [ ] CI/CDパイプラインで AUTH_DISABLED チェックを追加
  ```yaml
  - name: Verify AUTH_DISABLED is not set
    run: |
      if [ "$AUTH_DISABLED" = "1" ]; then
        echo "❌ AUTH_DISABLED is enabled - not allowed"
        exit 1
      fi
  ```

- [ ] 起動時に警告ログを出力
  ```typescript
  if (process.env.AUTH_DISABLED === "1") {
    logger.warn("⚠️  AUTH_DISABLED is enabled - authentication bypass is active");
    logger.warn("⚠️  This should NEVER be used in production");
  }
  ```

### 共通タスク

- [ ] README と環境変数ドキュメントを更新
- [ ] 開発者ガイドラインに注意事項を追加
- [ ] `.env.example` ファイルに警告コメントを追加

## 📚 参考資料

- OWASP: [Broken Authentication](https://owasp.org/www-project-top-ten/2017/A2_2017-Broken_Authentication)
- 調査レポート: `PRODUCTION_DEPLOYMENT_ISSUES.md` - Issue #2

## ⚠️ セキュリティ上の注意

このフラグが有効な状態でデプロイされると：
- 全てのAPIエンドポイントが認証なしでアクセス可能
- 任意のユーザーが管理者権限で操作可能
- データの不正アクセス・改ざん・削除が可能
