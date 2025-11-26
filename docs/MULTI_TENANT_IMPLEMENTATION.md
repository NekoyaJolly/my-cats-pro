# マルチテナント基礎実装ドキュメント

## 概要

my-cats-pro プロジェクトのマルチテナント機能実装ガイド。NestJS + Prisma + PostgreSQL を用いて、テナント/ユーザー管理の基礎機能を提供します。

## 実装された機能

### 1. データモデル

#### Tenant（テナント）
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users       User[]
  invitations InvitationToken[]
}
```

- **slug**: URL識別子として使用（例: `https://app.example.com/tenant-slug`）
- **isActive**: テナントの有効/無効状態を管理

#### InvitationToken（招待トークン）
```prisma
model InvitationToken {
  id        String    @id @default(uuid())
  email     String
  token     String    @unique
  role      UserRole
  tenantId  String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

- **token**: 32バイトのランダムトークン（セキュアな招待リンク用）
- **expiresAt**: 有効期限（デフォルト7日間）
- **usedAt**: 使用済みマーク（1回限りの使用を保証）

#### User（ユーザー）拡張
```prisma
model User {
  // 既存フィールド...
  tenantId String? @map("tenant_id")
  
  tenant Tenant? @relation(fields: [tenantId], references: [id], onDelete: SetNull)
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TENANT_ADMIN  // 新規追加
}
```

### 2. JWT 認証の拡張

#### JwtPayload
```typescript
export interface JwtPayload {
  sub: string;        // user id
  email?: string;
  role?: UserRole;
  tenantId?: string;  // テナントID追加
  jti?: string;
  iat?: number;
  exp?: number;
}
```

#### RequestUser
```typescript
export interface RequestUser {
  userId: string;
  email?: string;
  role?: UserRole;
  tenantId?: string;  // テナントID追加
  firstName?: string;
  lastName?: string;
}
```

### 3. Guard とデコレータ

#### TenantScopedGuard
テナントスコープを検証するガード。リクエストのテナントIDとユーザーのテナントIDが一致することを確認します。

```typescript
@UseGuards(JwtAuthGuard, RoleGuard, TenantScopedGuard)
@Roles('TENANT_ADMIN')
@Post(':tenantId/users/invite')
async inviteUser(@Param('tenantId') tenantId: string, @Body() dto: InviteUserDto) {
  // TENANT_ADMIN のみ、自分のテナントにアクセス可能
}
```

**動作ルール:**
- `SUPER_ADMIN` は全テナントにアクセス可能
- その他のロールは自分の `tenantId` と一致するテナントのみアクセス可能
- テナントIDは `params.tenantId` または `body.tenantId` から取得（paramsが優先）

#### Public デコレータ
認証不要のエンドポイント（招待完了APIなど）に使用します。

```typescript
@Public()
@Post('complete-invitation')
async completeInvitation(@Body() dto: CompleteInvitationDto) {
  // 認証不要
}
```

### 4. API エンドポイント

#### POST /tenants/invite-admin
SuperAdminがテナント管理者を招待します。

**権限:** `SUPER_ADMIN` のみ

**リクエスト:**
```json
{
  "email": "admin@example.com",
  "tenantName": "Sample Tenant",
  "tenantSlug": "sample-tenant"  // オプション（自動生成可能）
}
```

**レスポンス:**
```json
{
  "success": true,
  "tenantId": "uuid",
  "invitationToken": "random-token",
  "message": "招待メールを送信しました"
}
```

#### POST /tenants/:tenantId/users/invite
テナント管理者がユーザーを招待します。

**権限:** `TENANT_ADMIN` のみ、自分のテナント内

**リクエスト:**
```json
{
  "email": "user@example.com",
  "role": "USER"
}
```

**レスポンス:**
```json
{
  "success": true,
  "invitationToken": "random-token",
  "message": "招待メールを送信しました"
}
```

#### POST /tenants/complete-invitation
招待トークンでユーザー登録を完了します。

**権限:** なし（Public）

**リクエスト:**
```json
{
  "token": "invitation-token",
  "password": "SecurePassword123!",
  "firstName": "太郎",
  "lastName": "山田"
}
```

**レスポンス:**
```json
{
  "success": true,
  "userId": "uuid",
  "tenantId": "uuid",
  "access_token": "jwt-token",
  "message": "ユーザー登録が完了しました"
}
```

## セキュリティ

### 1. トークン生成
- `randomBytes(32).toString('hex')` による64文字のランダムトークン
- 推測攻撃に強い十分なエントロピー

### 2. トークン検証
- 有効期限チェック（デフォルト7日間）
- 使用済みチェック（1回限りの使用）
- テナント有効性チェック

### 3. アクセス制御
- ロールベースアクセス制御（RBAC）
- テナントスコープの厳格な検証
- JWT による認証

### 4. パスワード
- Argon2 によるハッシュ化
- 強度検証（最低8文字、大小英字・数字・記号を含む）

## データベースマイグレーション

### マイグレーション適用
```bash
# バックエンドディレクトリで実行
pnpm prisma migrate dev --name add_multi_tenant_support

# または本番環境
pnpm prisma migrate deploy
```

### 既存データの移行
既存のユーザーは `tenantId` が `null` のまま残ります。必要に応じて：

1. SuperAdmin 用のシステムテナントを作成
2. 既存ユーザーを適切なテナントに割り当て

```sql
-- システムテナントの作成
INSERT INTO tenants (id, name, slug, is_active)
VALUES ('system-tenant-id', 'System', 'system', true);

-- 既存 SUPER_ADMIN をシステムテナントに割り当て
UPDATE users
SET tenant_id = 'system-tenant-id'
WHERE role = 'SUPER_ADMIN';
```

## 使用例

### 1. テナント管理者の招待フロー

```typescript
// 1. SuperAdmin がテナント管理者を招待
const response = await fetch('/tenants/invite-admin', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${superAdminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@newtenant.com',
    tenantName: 'New Tenant',
  }),
});

const { invitationToken } = await response.json();

// 2. 招待メール送信（TODO: 実装予定）
// sendEmail(email, invitationToken);

// 3. 招待者がトークンでサインアップ
await fetch('/tenants/complete-invitation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: invitationToken,
    password: 'SecurePassword123!',
    firstName: '太郎',
    lastName: '山田',
  }),
});
```

### 2. ユーザー招待フロー

```typescript
// 1. テナント管理者がユーザーを招待
const response = await fetch(`/tenants/${tenantId}/users/invite`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tenantAdminToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    role: 'USER',
  }),
});

// 2. 以降は同じフロー
```

## テスト

### ユニットテスト
```bash
pnpm test -- --testPathPattern="tenant"
```

### E2Eテスト
```bash
pnpm test:e2e -- tenants.e2e-spec.ts
```

**カバレッジ:**
- TenantScopedGuard: 認証、ロール、テナントスコープの検証
- TenantsService: 招待作成、検証、ユーザー作成
- E2E: 完全な招待フロー

## 今後の拡張

### 1. メール送信
現在は開発環境でコンソールにトークンを出力していますが、本番環境ではメール送信サービスと統合する必要があります。

```typescript
// TODO: メール送信実装
await this.mailService.sendInvitationEmail(email, token);
```

### 2. 多テナント所属
現在は1ユーザー1テナントですが、将来的には中間テーブルで多対多の関係に拡張可能です。

```prisma
model UserTenant {
  userId   String
  tenantId String
  role     UserRole
  
  user   User   @relation(fields: [userId], references: [id])
  tenant Tenant @relation(fields: [tenantId], references: [id])
  
  @@id([userId, tenantId])
}
```

### 3. テナント管理UI
- テナント一覧・詳細・編集
- ユーザー一覧・管理
- 招待履歴の表示

### 4. 招待トークンの再送
有効期限切れの場合、新しいトークンを生成して再送する機能。

### 5. 監査ログ
テナント作成、ユーザー招待、ロール変更などの重要なイベントをログに記録。

## トラブルシューティング

### マイグレーションエラー
```
Error: Can't reach database server
```
→ PostgreSQL が起動していることを確認してください。

### 既存ユーザーとの競合
```
ConflictException: このメールアドレスは既に使用されています
```
→ 招待前にメールアドレスの重複をチェックしてください。

### トークンエラー
```
BadRequestException: 無効な招待トークンです
```
→ トークンの有効期限、使用済み状態を確認してください。

## 参考資料

- [NestJS Guards](https://docs.nestjs.com/guards)
- [Prisma Multi-tenant patterns](https://www.prisma.io/docs/guides/database/multi-tenant)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
