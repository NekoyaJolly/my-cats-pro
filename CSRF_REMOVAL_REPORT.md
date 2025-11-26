# CSRF撤去とシードユーザー確認 - 実装完了レポート

## 実施日時
2025-11-26

## タスク概要
本プロジェクトからCSRF（Cross-Site Request Forgery）保護を完全に撤去し、JWT認証ベースのシンプルな認証フローに移行しました。また、開発・検証環境でのログインテストを容易にするため、シードユーザーのドキュメントとテストを整備しました。

---

## ✅ 完了した作業

### 1. CSRF関連の完全撤去

#### 削除したファイル
- `backend/src/common/middleware/csrf.middleware.ts`
- `backend/src/common/controllers/csrf.controller.ts`
- `backend/src/common/services/csrf-token.service.ts`
- `backend/src/common/errors/csrf-validation.error.ts`
- `backend/test/csrf.e2e-spec.ts`
- `backend/test/utils/csrf-helper.ts`

#### 変更したファイル
- `backend/src/app.module.ts`: CsrfMiddleware, CsrfController, CsrfTokenService の import と登録を削除
- `backend/package.json`: `csurf` と `@types/csurf` 依存関係を削除
- `backend/src/common/filters/enhanced-global-exception.filter.ts`: CSRF検証ロジックを削除
- 全E2Eテストファイル: CsrfHelper 使用を直接 request() 呼び出しに置き換え

#### 影響範囲
- **認証エンドポイント**: `/api/v1/auth/login`, `/api/v1/auth/register` などはCSRFトークンなしでアクセス可能
- **保護されたエンドポイント**: `Authorization: Bearer <token>` ヘッダーでJWT認証
- **セキュリティ**: CORS, Helmet, レート制限などは維持

### 2. E2Eテストの全面更新

#### 更新したテストファイル（全10ファイル）
1. `auth-jwt.e2e-spec.ts`
2. `auth-register.e2e-spec.ts`
3. `auth-password-reset.e2e-spec.ts`
4. `auth-breeding.e2e-spec.ts`
5. `breeding-ng-rules.e2e-spec.ts`
6. `breeds-coat-colors.e2e-spec.ts`
7. `care-and-tags.e2e-spec.ts`
8. `care-tags.e2e-spec.ts`
9. `cats.e2e-spec.ts`
10. `pedigree.e2e-spec.ts`

#### 変更内容
- CsrfHelper 依存を削除
- すべてのPOST/PUT/PATCH/DELETEリクエストを直接 `request(app.getHttpServer()).method(url).send(data)` に変更
- CSRFトークン取得とヘッダー設定のコードを削除

### 3. シードユーザードキュメントの整備

#### 新規作成ファイル
- `backend/SEED_USER_GUIDE.md`: 詳細なシードユーザーガイド
  - デフォルト認証情報（`admin@example.com` / `Passw0rd!`）
  - シード実行手順
  - ログイン確認方法（E2E, cURL, フロントエンド）
  - カスタムシードユーザーの作成方法
  - トラブルシューティング

- `backend/test/auth-seed-user.e2e-spec.ts`: シードユーザーログインテスト
  - デフォルトシードユーザーでのログイン成功テスト
  - JWTトークンを使った保護エンドポイントアクセステスト
  - 誤ったパスワードでの401エラーテスト

#### 更新したドキュメント
- `README.md`: 「🔐 認証とセキュリティ」セクションを追加
  - CSRF保護撤去の背景と理由
  - シードユーザー情報
  - ログイン確認方法の概要

### 4. ビルドとリント検証

#### 実行・確認済み
- ✅ `pnpm install --no-frozen-lockfile`: 依存関係更新
- ✅ `pnpm prisma:generate`: Prisma Clientの再生成
- ✅ `pnpm run build`: ビルド成功
- ✅ `pnpm run lint`: リント合格（警告なし）
- ✅ コードレビュー実施と指摘事項の修正完了

---

## 📋 未完了の作業（ローカル環境で実行推奨）

### 1. データベースセットアップとシード実行

```bash
# バックエンドディレクトリで実行
cd backend

# 環境変数設定（.envファイルに DATABASE_URL を設定）
# 例: DATABASE_URL="postgresql://user:password@localhost:5432/mycats"

# マイグレーション実行
pnpm prisma:deploy

# シードデータ投入
pnpm seed

# 期待される出力:
# Seed complete ✅
# Admin: { email: 'admin@example.com', password: 'Passw0rd!', id: '...', action: 'created' }
```

### 2. バックエンドの起動確認

```bash
cd backend
pnpm start:dev

# 期待される出力:
# [Nest] ... Application successfully started
```

### 3. ログインエンドポイントのテスト

```bash
# CSRFトークンなしでログインできることを確認
curl -X POST http://localhost:3004/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Passw0rd!"}'

# 期待されるレスポンス:
# {
#   "success": true,
#   "data": {
#     "access_token": "eyJ...",
#     "user": { ... }
#   }
# }

# 保護されたエンドポイントへのアクセステスト
TOKEN="<上記で取得したaccess_token>"
curl -X GET http://localhost:3004/api/v1/cats \
  -H "Authorization: Bearer $TOKEN"

# 期待されるレスポンス: 200 OK
```

### 4. E2Eテストの実行

```bash
cd backend

# データベースをリセットしてE2Eテストを実行
pnpm test:e2e

# 特定のテストのみ実行する場合
npx jest test/auth-seed-user.e2e-spec.ts --config ./test/jest-e2e.json
```

---

## 🎯 マルチテナント基礎実装（将来の拡張）

時間制約により、マルチテナント実装は今回のスコープから除外しました。将来の実装に向けた推奨アプローチを以下に示します。

### 推奨実装手順

#### Phase 1: データモデルの設計

```prisma
// prisma/schema.prisma に追加

model Tenant {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  invitations InvitationToken[]
  
  @@map("tenants")
}

model InvitationToken {
  id          String   @id @default(uuid())
  email       String
  token       String   @unique
  role        UserRole
  tenantId    String   @map("tenant_id")
  expiresAt   DateTime @map("expires_at")
  usedAt      DateTime? @map("used_at")
  createdAt   DateTime @default(now())
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  
  @@index([email])
  @@index([token])
  @@index([tenantId])
  @@map("invitation_tokens")
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TENANT_ADMIN  // 追加
}

// User モデルに追加
model User {
  // 既存フィールド...
  tenantId    String?  @map("tenant_id")
  tenant      Tenant?  @relation(fields: [tenantId], references: [id], onDelete: SetNull)
  
  @@index([tenantId])
}
```

#### Phase 2: JWT ペイロードの拡張

```typescript
// backend/src/auth/auth.types.ts

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: UserRole;
  tenantId?: string;  // 追加
  iat?: number;
  exp?: number;
}
```

#### Phase 3: デコレータとガードの実装

```typescript
// backend/src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// backend/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// backend/src/common/guards/tenant-scoped.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantScopedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenantId = request.params.tenantId || request.body.tenantId;
    
    // SUPER_ADMIN は全テナントにアクセス可能
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }
    
    // テナントIDが一致しない場合はアクセス拒否
    if (user.tenantId !== tenantId) {
      throw new ForbiddenException('テナントへのアクセス権限がありません');
    }
    
    return true;
  }
}
```

#### Phase 4: 招待フロー API（スケルトン）

```typescript
// backend/src/tenants/tenants.controller.ts

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // SuperAdmin がテナント管理者を招待
  @Post('invite-admin')
  @Roles('SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async inviteTenantAdmin(@Body() dto: InviteTenantAdminDto) {
    return this.tenantsService.inviteTenantAdmin(dto);
  }

  // テナント管理者がユーザーを招待
  @Post(':tenantId/users/invite')
  @Roles('TENANT_ADMIN')
  @UseGuards(RolesGuard, TenantScopedGuard)
  async inviteUser(
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.tenantsService.inviteUser(tenantId, dto);
  }

  // 招待完了（トークンでユーザー登録）
  @Post('complete-invitation')
  @Public() // 認証不要
  async completeInvitation(@Body() dto: CompleteInvitationDto) {
    return this.tenantsService.completeInvitation(dto);
  }
}
```

---

## 📊 変更統計

### コミット履歴
1. `Remove CSRF middleware, dependencies, and update all e2e tests` (18 files changed)
2. `Fix exception filter - remove CSRF validation logic` (2 files changed)
3. `Add seed user documentation and e2e test for login verification` (3 files changed)
4. `Fix code review issues: remove duplicate imports and undefined csrf variables` (3 files changed)

### 変更サマリー
- **削除**: 6ファイル（CSRF関連）
- **変更**: 13ファイル（app.module, exception filter, e2e tests）
- **追加**: 3ファイル（ドキュメント、シードユーザーテスト）
- **依存関係削除**: 2パッケージ（csurf, @types/csurf）

---

## 🔒 セキュリティへの影響と対策

### CSRF撤去によるリスク軽減策
1. **JWT認証**: ステートレスなトークンベース認証により、CSRFリスクを本質的に軽減
2. **CORS設定**: 信頼できるオリジンのみを許可
3. **Helmet**: セキュリティヘッダーを自動設定
4. **レート制限**: ブルートフォース攻撃を防止
5. **SameSite Cookie**: Refresh トークン用クッキーにSameSite属性を設定

### 本番環境での推奨事項
- デフォルトシードパスワードを強固なものに変更
- 環境変数 `ADMIN_EMAIL` と `ADMIN_PASSWORD` を使用
- JWT トークンの有効期限を適切に設定（デフォルト15分）
- HTTPS の強制使用
- ログイン試行回数の制限

---

## 📝 次のステップ

### 即時対応（ローカル環境で実施）
1. データベースのセットアップとシード実行
2. バックエンドの起動確認
3. ログインエンドポイントのテスト（cURLまたはPostman）
4. E2Eテストの実行

### 短期（1-2週間）
1. フロントエンドからの実際のログインフロー確認
2. 本番環境へのデプロイ前チェックリスト作成
3. セキュリティ監査の実施

### 中長期（1-3ヶ月）
1. マルチテナント機能の実装（上記Phase 1-4を参照）
2. ロールベースアクセス制御（RBAC）の強化
3. 監査ログ機能の追加
4. パスワードリセットフローの改善

---

## 🎉 まとめ

CSRF保護の完全撤去とシードユーザー確認機能の整備が完了しました。すべてのビルドとリントが成功し、コードレビューの指摘事項も修正済みです。

**主な成果:**
- ✅ CSRF関連コード・依存関係の完全削除
- ✅ 全E2Eテストの更新とクリーンアップ
- ✅ シードユーザーのドキュメントとテスト整備
- ✅ README への認証情報追加
- ✅ ビルド・リント成功

次は、ローカル環境でデータベースをセットアップし、実際のログインフローを確認することを推奨します。
