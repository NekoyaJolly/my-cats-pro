# MyCats Pro - 改善実装アクションプラン

**作成日:** 2025-11-11  
**プロジェクト:** MyCats Pro (猫生体管理システム)  
**目的:** コードベースレビューで特定された改善項目の具体的な実装計画

---

## 📋 目次

1. [優先度別タスク一覧](#優先度別タスク一覧)
2. [フェーズ1: セキュリティ強化](#フェーズ1-セキュリティ強化)
3. [フェーズ2: データベース最適化](#フェーズ2-データベース最適化)
4. [フェーズ3: フロントエンド改善](#フェーズ3-フロントエンド改善)
5. [フェーズ4: テスト・ドキュメント](#フェーズ4-テストドキュメント)
6. [実装チェックリスト](#実装チェックリスト)

---

## 優先度別タスク一覧

### 🔴 CRITICAL - 即時対応 (1-2週間)

| # | タスク | 所要時間 | 担当 | ステータス |
|---|--------|----------|------|-----------|
| C1 | CSRF保護の実装 | 4h | Backend | ⏳ 未着手 |
| C2 | 環境変数の安全な管理 | 8h | DevOps | ⏳ 未着手 |

### 🟠 HIGH - 高優先度 (2-4週間)

| # | タスク | 所要時間 | 担当 | ステータス |
|---|--------|----------|------|-----------|
| H1 | APIレート制限の強化 | 4h | Backend | ⏳ 未着手 |
| H2 | データベースインデックス最適化 | 4h | Backend | ⏳ 未着手 |
| H3 | フロントエンド型安全性強化 | 16h | Frontend | ⏳ 未着手 |

### 🟡 MEDIUM - 中優先度 (1-3ヶ月)

| # | タスク | 所要時間 | 担当 | ステータス |
|---|--------|----------|------|-----------|
| M1 | アクセシビリティ改善 | 32h | Frontend | ⏳ 未着手 |
| M2 | テストカバレッジ向上 | 64h | All | ⏳ 未着手 |
| M3 | パフォーマンス最適化 | 32h | All | ⏳ 未着手 |

### 🟢 LOW - 低優先度 (3-6ヶ月)

| # | タスク | 所要時間 | 担当 | ステータス |
|---|--------|----------|------|-----------|
| L1 | ドキュメント拡充 | 16h | All | ⏳ 未着手 |
| L2 | 監視・ロギング強化 | 16h | DevOps | ⏳ 未着手 |

---

## フェーズ1: セキュリティ強化

### C1: CSRF保護の実装

**目的:** クロスサイトリクエストフォージェリ攻撃からの保護

**実装手順:**

#### 1. バックエンド: CSRF トークン生成

```bash
# パッケージインストール
cd backend
pnpm add csurf @types/csurf
```

```typescript
// backend/src/main.ts
import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Cookie parserは既に設定済み
  app.use(cookieParser());
  
  // CSRF保護を追加
  app.use(csurf({ 
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    }
  }));
  
  // CSRFトークンエンドポイント
  app.getHttpAdapter().get('/api/v1/csrf-token', (req: any, res: any) => {
    res.json({ csrfToken: req.csrfToken() });
  });
}
```

#### 2. フロントエンド: CSRF トークンの取得と送信

```typescript
// frontend/src/lib/api/csrf.ts
let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  const response = await fetch(`${API_BASE_URL}/csrf-token`, {
    credentials: 'include',
  });
  const data = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}
```

```typescript
// frontend/src/lib/api/client.ts
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  
  // POST, PUT, DELETE にCSRFトークンを追加
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || '')) {
    const token = await getCsrfToken();
    headers.set('X-CSRF-Token', token);
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  return response.json();
}
```

#### 3. テスト

```typescript
// backend/test/csrf.e2e-spec.ts
describe('CSRF Protection (e2e)', () => {
  it('should reject POST request without CSRF token', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/cats')
      .send({ name: 'Test Cat' })
      .expect(403);
  });
  
  it('should accept POST request with valid CSRF token', async () => {
    const csrfRes = await request(app.getHttpServer())
      .get('/api/v1/csrf-token')
      .expect(200);
    
    const csrfToken = csrfRes.body.csrfToken;
    
    return request(app.getHttpServer())
      .post('/api/v1/cats')
      .set('X-CSRF-Token', csrfToken)
      .send({ name: 'Test Cat' })
      .expect(201);
  });
});
```

**完了基準:**
- [ ] CSRFトークンエンドポイントの実装
- [ ] すべてのPOST/PUT/DELETE リクエストでトークン検証
- [ ] フロントエンドでのトークン自動付与
- [ ] E2Eテストの追加
- [ ] ドキュメント更新

---

### C2: 環境変数の安全な管理

**目的:** 機密情報の安全な管理と誤った公開の防止

**実装手順:**

#### 1. 環境変数バリデーションの強化

```typescript
// backend/src/common/config/env.validation.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().min(1000).max(65535),
  CORS_ORIGIN: z.string().min(1).when('NODE_ENV', {
    is: 'production',
    then: z.string().min(1),
  }),
  
  // Security
  ARGON2_MEMORY_COST: z.coerce.number().default(65536),
  ARGON2_TIME_COST: z.coerce.number().default(3),
  ARGON2_PARALLELISM: z.coerce.number().default(4),
  
  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}
```

#### 2. .env.example の最小化

```bash
# .env.example (本番環境用テンプレート)
# セキュリティ上の理由から、実際の値は含めない
# 各自で安全に生成・設定すること

# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"

# JWT (32文字以上のランダム文字列を生成して設定)
JWT_SECRET="<generate-random-32-char-string>"
JWT_REFRESH_SECRET="<generate-random-32-char-string>"

# Server
NODE_ENV="production"
PORT=3004
CORS_ORIGIN="https://your-domain.com"
```

#### 3. シークレット生成スクリプト

```typescript
// scripts/generate-secrets.ts
import { randomBytes } from 'crypto';

function generateSecret(length: number = 32): string {
  return randomBytes(length).toString('base64');
}

console.log('Generated secrets for .env file:\n');
console.log(`JWT_SECRET="${generateSecret()}"`);
console.log(`JWT_REFRESH_SECRET="${generateSecret()}"`);
console.log('\n⚠️  Store these values securely and never commit to Git!');
```

#### 4. .gitignore の確認

```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production
.env.development

# Keep only .env.example
!.env.example
```

**完了基準:**
- [ ] Zodによる環境変数バリデーション実装
- [ ] .env.example の最小化
- [ ] シークレット生成スクリプトの作成
- [ ] .gitignore の確認・更新
- [ ] ドキュメント（SETUP_GUIDE.md）の更新

---

### H1: APIレート制限の強化

**目的:** DDoS攻撃とブルートフォース攻撃からの保護

**実装手順:**

#### 1. エンドポイント別レート制限の設定

```typescript
// backend/src/common/guards/rate-limit.config.ts
export const RateLimitConfig = {
  // 認証エンドポイント: 厳格な制限
  auth: {
    login: { ttl: 60000, limit: 3 },      // 1分間に3回
    register: { ttl: 300000, limit: 5 },   // 5分間に5回
    resetPassword: { ttl: 300000, limit: 3 }, // 5分間に3回
  },
  
  // API エンドポイント: 通常の制限
  api: {
    read: { ttl: 60000, limit: 100 },     // 1分間に100回（GET）
    write: { ttl: 60000, limit: 30 },     // 1分間に30回（POST/PUT/DELETE）
  },
  
  // ファイルアップロード: 厳格な制限
  upload: {
    ttl: 300000, limit: 10,               // 5分間に10回
  },
};
```

#### 2. カスタムレート制限デコレータ

```typescript
// backend/src/common/decorators/rate-limit.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  ttl: number;
  limit: number;
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
```

#### 3. コントローラーへの適用

```typescript
// backend/src/auth/auth.controller.ts
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { RateLimitConfig } from '../common/guards/rate-limit.config';

@Controller('auth')
export class AuthController {
  @Post('login')
  @RateLimit(RateLimitConfig.auth.login)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  
  @Post('register')
  @RateLimit(RateLimitConfig.auth.register)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
```

#### 4. レート制限ガードの実装

```typescript
// backend/src/common/guards/enhanced-throttler.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class EnhancedThrottlerGuard extends ThrottlerGuard {
  constructor(
    protected readonly options: any,
    protected readonly storageService: any,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // IPアドレスとユーザーIDを組み合わせてトラッキング
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.user?.id || 'anonymous';
    return `${ip}-${userId}`;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    // ヘルスチェックエンドポイントは除外
    const request = context.switchToHttp().getRequest();
    return request.url === '/health';
  }
}
```

**完了基準:**
- [ ] エンドポイント別レート制限設定の定義
- [ ] カスタムレート制限デコレータの実装
- [ ] 全エンドポイントへの適用
- [ ] 拡張Throttlerガードの実装
- [ ] レート制限超過時のエラーメッセージ改善
- [ ] テストの追加

---

## フェーズ2: データベース最適化

### H2: データベースインデックス最適化

**目的:** クエリパフォーマンスの向上とレスポンス時間の短縮

**実装手順:**

#### 1. インデックス戦略の定義

```prisma
// backend/prisma/schema.prisma

// 猫テーブル: 検索頻度の高いフィールドにインデックス
model Cat {
  id        String   @id @default(uuid())
  name      String
  birthDate DateTime @map("birth_date")
  gender    String
  breedId   String   @map("breed_id")
  ownerId   String?  @map("owner_id")
  deletedAt DateTime? @map("deleted_at")
  
  // シングルカラムインデックス
  @@index([name])           // 名前検索
  @@index([birthDate])      // 誕生日検索
  @@index([gender])         // 性別フィルター
  @@index([deletedAt])      // ソフトデリートフィルター
  
  // 複合インデックス
  @@index([breedId, name])  // 品種別名前検索
  @@index([ownerId, deletedAt]) // オーナー別アクティブ猫
  
  @@map("cats")
}

// 血統テーブル: リレーション検索の最適化
model Pedigree {
  id               String   @id @default(uuid())
  pedigreeId       String   @unique @map("pedigree_id")
  catName          String   @map("cat_name")
  fatherPedigreeId String?  @map("father_pedigree_id")
  motherPedigreeId String?  @map("mother_pedigree_id")
  
  // リレーション検索用インデックス
  @@index([fatherPedigreeId])
  @@index([motherPedigreeId])
  @@index([catName])
  
  @@map("pedigrees")
}

// 交配記録テーブル
model BreedingRecord {
  id           String   @id @default(uuid())
  maleId       String   @map("male_id")
  femaleId     String   @map("female_id")
  breedingDate DateTime @map("breeding_date")
  status       String
  
  @@index([maleId])
  @@index([femaleId])
  @@index([breedingDate])
  @@index([status])
  @@index([maleId, femaleId, breedingDate]) // 複合検索
  
  @@map("breeding_records")
}

// ケア記録テーブル
model CareRecord {
  id       String   @id @default(uuid())
  catId    String   @map("cat_id")
  careType String   @map("care_type")
  careDate DateTime @map("care_date")
  
  @@index([catId])
  @@index([careType])
  @@index([careDate])
  @@index([catId, careDate]) // 猫別の時系列検索
  
  @@map("care_records")
}

// スケジュールテーブル
model Schedule {
  id           String   @id @default(uuid())
  catId        String?  @map("cat_id")
  scheduleDate DateTime @map("schedule_date")
  type         String
  status       String
  
  @@index([scheduleDate])
  @@index([type])
  @@index([status])
  @@index([catId, scheduleDate]) // 猫別スケジュール
  
  @@map("schedules")
}
```

#### 2. マイグレーションの作成と適用

```bash
# 開発環境
cd backend
pnpm prisma migrate dev --name add_performance_indexes

# 本番環境（デプロイ前にテスト）
pnpm prisma migrate deploy
```

#### 3. インデックスパフォーマンスの検証

```sql
-- PostgreSQLでインデックス使用状況を確認
-- backend/prisma/seed/verify-indexes.sql

-- インデックス一覧
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- インデックス使用統計
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 未使用インデックスの検出
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexname NOT LIKE '%_pkey';
```

#### 4. N+1クエリ問題の解消

```typescript
// backend/src/cats/cats.service.ts

// ❌ N+1問題のある実装
async findAllBad() {
  const cats = await this.prisma.cat.findMany();
  
  // 各猫ごとにbreedを取得（N+1）
  for (const cat of cats) {
    cat.breed = await this.prisma.breed.findUnique({
      where: { id: cat.breedId }
    });
  }
  
  return cats;
}

// ✅ 最適化された実装
async findAll(query: FindCatsDto) {
  return this.prisma.cat.findMany({
    where: {
      deletedAt: null,
      ...(query.name && { name: { contains: query.name } }),
      ...(query.breedId && { breedId: query.breedId }),
    },
    include: {
      breed: true,        // リレーションを一度に取得
      coatColor: true,
      tags: true,
    },
    orderBy: {
      [query.sortBy || 'createdAt']: query.order || 'desc',
    },
    take: query.limit || 20,
    skip: (query.page - 1) * (query.limit || 20),
  });
}

// さらに最適化: select で必要なフィールドのみ取得
async findAllOptimized(query: FindCatsDto) {
  return this.prisma.cat.findMany({
    where: { /* ... */ },
    select: {
      id: true,
      name: true,
      birthDate: true,
      breed: {
        select: {
          id: true,
          name: true,
        },
      },
      coatColor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
```

**完了基準:**
- [ ] Prismaスキーマへのインデックス追加
- [ ] マイグレーションの作成と適用
- [ ] インデックス使用状況の確認
- [ ] N+1クエリ問題の解消
- [ ] クエリパフォーマンステストの実施
- [ ] ドキュメント更新

---

## フェーズ3: フロントエンド改善

### H3: フロントエンド型安全性強化

**目的:** TypeScriptの型安全性を最大限活用し、ランタイムエラーを削減

**実装手順:**

#### 1. ESLint設定の厳格化

```javascript
// frontend/eslint.config.mjs
export default [
  {
    name: 'frontend-typescript-strict',
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // 段階的に厳格化
      '@typescript-eslint/no-explicit-any': 'error', // anyを禁止
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      
      // 型アサーションの制限
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' }
      ],
      
      // null/undefined チェック
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
    }
  },
];
```

#### 2. Zodスキーマによる型生成

```typescript
// frontend/src/lib/schemas/cat.schema.ts
import { z } from 'zod';

export const catSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, '名前は必須です').max(100),
  birthDate: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE']),
  breedId: z.string().uuid(),
  coatColorId: z.string().uuid(),
  microchipId: z.string().optional(),
  notes: z.string().optional(),
});

export const createCatSchema = catSchema.omit({ id: true });
export const updateCatSchema = catSchema.partial().required({ id: true });

export type Cat = z.infer<typeof catSchema>;
export type CreateCatInput = z.infer<typeof createCatSchema>;
export type UpdateCatInput = z.infer<typeof updateCatSchema>;

// フォーム用のスキーマ（エラーメッセージ付き）
export const catFormSchema = z.object({
  name: z
    .string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください'),
  birthDate: z
    .date({ required_error: '誕生日は必須です' })
    .max(new Date(), '未来の日付は選択できません'),
  gender: z
    .enum(['MALE', 'FEMALE'], { required_error: '性別を選択してください' }),
  breedId: z
    .string({ required_error: '品種を選択してください' })
    .uuid('無効な品種IDです'),
  coatColorId: z
    .string({ required_error: '毛色を選択してください' })
    .uuid('無効な毛色IDです'),
  microchipId: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{15}$/.test(val),
      'マイクロチップIDは15桁の数字で入力してください'
    ),
  notes: z.string().max(1000, 'メモは1000文字以内で入力してください').optional(),
});

export type CatFormData = z.infer<typeof catFormSchema>;
```

#### 3. React Hook Form + Zod の統合

```typescript
// frontend/src/app/cats/components/CatForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { catFormSchema, type CatFormData } from '@/lib/schemas/cat.schema';

export function CatForm({ onSubmit, defaultValues }: CatFormProps) {
  const form = useForm<CatFormData>({
    resolver: zodResolver(catFormSchema),
    defaultValues,
  });
  
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      // エラーハンドリング
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        {...form.register('name')}
        label="名前"
        error={form.formState.errors.name?.message}
        required
      />
      
      <DateInput
        {...form.register('birthDate')}
        label="誕生日"
        error={form.formState.errors.birthDate?.message}
        required
      />
      
      {/* その他のフィールド */}
      
      <Button type="submit" loading={form.formState.isSubmitting}>
        登録
      </Button>
    </form>
  );
}
```

#### 4. APIクライアントの型安全化

```typescript
// frontend/src/lib/api/typed-client.ts
import type { paths } from './generated/schema';

type ExtractResponse<T> = T extends { 200: { content: { 'application/json': infer R } } }
  ? R
  : never;

type ApiEndpoint = keyof paths;
type ApiMethod<E extends ApiEndpoint> = keyof paths[E];
type ApiResponse<E extends ApiEndpoint, M extends ApiMethod<E>> = 
  ExtractResponse<paths[E][M]['responses']>;

// 型安全なAPIクライアント
export async function typedGet<E extends ApiEndpoint>(
  endpoint: E
): Promise<ApiResponse<E, 'get'>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }
  return response.json();
}

// 使用例
const cats = await typedGet('/api/v1/cats'); // 型推論が効く
```

**完了基準:**
- [ ] ESLint設定の厳格化
- [ ] Zodスキーマの全モデル定義
- [ ] React Hook Form + Zod の統合
- [ ] 既存コンポーネントのリファクタリング
- [ ] 型エラーの解消
- [ ] テストの追加

---

### M1: アクセシビリティ改善

**目的:** WCAG 2.1 レベルAA準拠

**実装手順:**

#### 1. セマンティックHTMLの使用

```tsx
// ❌ アクセシビリティの低い実装
<div onClick={handleClick}>クリック</div>

// ✅ セマンティックなボタン要素
<button onClick={handleClick}>クリック</button>

// ❌ 非セマンティックなリスト
<div>
  {items.map(item => <div>{item.name}</div>)}
</div>

// ✅ セマンティックなリスト
<ul role="list">
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>
```

#### 2. ARIAラベルの追加

```tsx
// frontend/src/components/cats/CatCard.tsx
export function CatCard({ cat, onEdit, onDelete }: CatCardProps) {
  return (
    <article aria-labelledby={`cat-name-${cat.id}`}>
      <h3 id={`cat-name-${cat.id}`}>{cat.name}</h3>
      
      <button
        onClick={() => onEdit(cat)}
        aria-label={`${cat.name}を編集`}
      >
        <IconEdit size={16} aria-hidden="true" />
        編集
      </button>
      
      <button
        onClick={() => onDelete(cat)}
        aria-label={`${cat.name}を削除`}
      >
        <IconTrash size={16} aria-hidden="true" />
        削除
      </button>
    </article>
  );
}
```

#### 3. キーボードナビゲーション

```tsx
// frontend/src/components/common/Modal.tsx
import { useFocusTrap, useHotkeys } from '@mantine/hooks';

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  
  // ESCキーで閉じる
  useHotkeys([['Escape', onClose]]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={focusTrapRef}
    >
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}
```

#### 4. カラーコントラスト改善

```typescript
// frontend/src/styles/accessibility.ts
export const a11yColors = {
  // WCAG AA準拠: 最小コントラスト比 4.5:1
  text: {
    primary: '#1a1a1a',      // 背景: #ffffff, コントラスト: 17.9:1
    secondary: '#4a4a4a',    // 背景: #ffffff, コントラスト: 10.2:1
    disabled: '#9e9e9e',     // 背景: #ffffff, コントラスト: 4.6:1
  },
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    hover: '#e0e0e0',
  },
  error: {
    main: '#d32f2f',         // コントラスト: 5.0:1
    background: '#ffebee',
  },
  success: {
    main: '#2e7d32',         // コントラスト: 5.9:1
    background: '#e8f5e9',
  },
};
```

#### 5. アクセシビリティテスト

```typescript
// frontend/src/__tests__/accessibility/cat-form.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { CatForm } from '@/app/cats/components/CatForm';

expect.extend(toHaveNoViolations);

describe('CatForm Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<CatForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should be keyboard navigable', () => {
    render(<CatForm onSubmit={jest.fn()} />);
    
    const nameInput = screen.getByLabelText('名前');
    nameInput.focus();
    expect(document.activeElement).toBe(nameInput);
    
    // Tab キーで次のフィールドに移動
    userEvent.tab();
    expect(document.activeElement).toBe(screen.getByLabelText('誕生日'));
  });
});
```

**完了基準:**
- [ ] セマンティックHTML への変換
- [ ] ARIAラベルの全コンポーネント追加
- [ ] キーボードナビゲーション実装
- [ ] カラーコントラスト改善
- [ ] アクセシビリティテスト追加
- [ ] axe-core による自動テスト
- [ ] スクリーンリーダーテスト

---

## フェーズ4: テスト・ドキュメント

### M2: テストカバレッジ向上

**目的:** コードカバレッジ 70%以上の達成

**実装手順:**

#### 1. バックエンドユニットテスト

```typescript
// backend/src/cats/cats.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CatsService } from './cats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CatsService', () => {
  let service: CatsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: PrismaService,
          useValue: {
            cat: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new cat', async () => {
      const mockCat = {
        id: '1',
        name: 'Fluffy',
        birthDate: new Date(),
        breedId: 'breed-1',
      };

      jest.spyOn(prisma.cat, 'create').mockResolvedValue(mockCat as any);

      const result = await service.create({
        name: 'Fluffy',
        birthDate: new Date(),
        breedId: 'breed-1',
      });

      expect(result).toEqual(mockCat);
      expect(prisma.cat.create).toHaveBeenCalledTimes(1);
    });

    it('should throw error if breed does not exist', async () => {
      jest.spyOn(prisma.cat, 'create').mockRejectedValue(
        new Error('Foreign key constraint failed')
      );

      await expect(
        service.create({
          name: 'Fluffy',
          birthDate: new Date(),
          breedId: 'invalid-breed',
        })
      ).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated cats', async () => {
      const mockCats = [
        { id: '1', name: 'Cat 1' },
        { id: '2', name: 'Cat 2' },
      ];

      jest.spyOn(prisma.cat, 'findMany').mockResolvedValue(mockCats as any);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result).toEqual(mockCats);
      expect(prisma.cat.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
        })
      );
    });
  });
});
```

#### 2. フロントエンドコンポーネントテスト

```tsx
// frontend/src/app/cats/components/CatForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CatForm } from './CatForm';

describe('CatForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render all form fields', () => {
    render(<CatForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('誕生日')).toBeInTheDocument();
    expect(screen.getByLabelText('性別')).toBeInTheDocument();
    expect(screen.getByLabelText('品種')).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<CatForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: '登録' });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('名前は必須です')).toBeInTheDocument();
      expect(screen.getByText('誕生日は必須です')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    render(<CatForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText('名前'), 'Fluffy');
    await userEvent.type(screen.getByLabelText('誕生日'), '2024-01-01');
    await userEvent.click(screen.getByLabelText('オス'));
    await userEvent.selectOptions(screen.getByLabelText('品種'), 'breed-1');

    await userEvent.click(screen.getByRole('button', { name: '登録' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Fluffy',
        birthDate: expect.any(Date),
        gender: 'MALE',
        breedId: 'breed-1',
      });
    });
  });
});
```

#### 3. カバレッジレポート設定

```json
// backend/package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/**/*.spec.ts",
      "!src/**/*.e2e-spec.ts",
      "!src/main.ts",
      "!src/scripts/**"
    ]
  }
}
```

```json
// frontend/package.json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    },
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.test.{ts,tsx}",
      "!src/**/*.stories.{ts,tsx}",
      "!src/app/layout.tsx",
      "!src/app/**/page.tsx"
    ]
  }
}
```

**完了基準:**
- [ ] バックエンドサービス層のユニットテスト（カバレッジ 70%以上）
- [ ] フロントエンドコンポーネントテスト（カバレッジ 70%以上）
- [ ] 統合テストの追加
- [ ] テストドキュメントの作成
- [ ] CI/CDパイプラインへのカバレッジチェック追加

---

## 実装チェックリスト

### セキュリティ

- [ ] C1: CSRF保護の実装
- [ ] C2: 環境変数の安全な管理
- [ ] H1: APIレート制限の強化
- [ ] セキュリティヘッダーの強化
- [ ] パスワードリセットトークン有効期限の短縮

### データベース

- [ ] H2: データベースインデックス最適化
- [ ] N+1クエリ問題の解消
- [ ] ソフトデリートの実装
- [ ] マイグレーション戦略の文書化

### フロントエンド

- [ ] H3: 型安全性強化（ESLint厳格化）
- [ ] Zodスキーマの実装
- [ ] React Hook Form + Zod 統合
- [ ] M1: アクセシビリティ改善
- [ ] パフォーマンス最適化（画像、コード分割）

### テスト

- [ ] M2: バックエンドユニットテスト
- [ ] フロントエンドコンポーネントテスト
- [ ] E2Eテストの拡充
- [ ] カバレッジ70%達成

### ドキュメント

- [ ] L1: API使用例の追加
- [ ] TSDoc/JSDocコメントの追加
- [ ] CHANGELOG.mdの作成
- [ ] セットアップガイドの更新

---

## 進捗追跡

### Week 1-2: CRITICAL Items

| 日付 | タスク | ステータス | メモ |
|------|--------|-----------|------|
| 2025-11-11 | C1開始 | ⏳ 未着手 | |
| | C2開始 | ⏳ 未着手 | |
| | H1開始 | ⏳ 未着手 | |

### Week 3-4: HIGH Items

| 日付 | タスク | ステータス | メモ |
|------|--------|-----------|------|
| | H2開始 | ⏳ 未着手 | |
| | H3開始 | ⏳ 未着手 | |

### Week 5-8: MEDIUM Items

| 日付 | タスク | ステータス | メモ |
|------|--------|-----------|------|
| | M1開始 | ⏳ 未着手 | |
| | M2開始 | ⏳ 未着手 | |
| | M3開始 | ⏳ 未着手 | |

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-11  
**Status:** In Progress
