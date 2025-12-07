# JWT Auth Guard Test Fixes - Implementation Report

## 問題の概要

### 発生していた問題

1. **auth.rate-limit.spec.ts のクラッシュ**
   - テストセットアップエラーが発生し、`beforeAll` で `app` が未定義のまま `afterAll` で `app.close()` が呼ばれて TypeError が発生
   - `EnhancedThrottlerGuard` の依存関係（`ThrottlerStorage`）が提供されていなかったため、テストモジュールのコンパイルが失敗

2. **コントローラーテストの大量失敗**
   - グローバル `APP_GUARD` として `EnhancedThrottlerGuard` が登録されているが、ユニットテストでその依存関係を提供していないため、多数のコントローラーテストが失敗
   - `JwtAuthGuard` が `ConfigService` を必要とするが、テストモジュールで提供されていない

3. **CI での PostgreSQL 警告**
   - "role 'root' does not exist" エラーが発生していたが、調査の結果、CI ワークフロー設定は既に正しく `POSTGRES_USER: postgres` と設定されていることを確認

## 実装した修正

### 1. auth.rate-limit.spec.ts の修正

**ファイル**: `backend/src/auth/auth.rate-limit.spec.ts`

#### 変更内容:

1. **ConfigModule の追加**
   ```typescript
   import { ConfigModule } from '@nestjs/config';
   ```
   - `JwtAuthGuard` が依存する `ConfigService` を提供するため

2. **afterAll のガード追加**
   ```typescript
   afterAll(async () => {
     resetStorage();
     if (app) {
       await app.close();
     }
   });
   ```
   - `app` が未定義の場合にクラッシュしないよう保護

3. **ThrottlerStorage のモック実装**
   ```typescript
   {
     provide: ThrottlerStorage,
     useFactory: () => {
       const storage: Record<string, any> = {};
       const timeoutIds: NodeJS.Timeout[] = [];
       const storageService = {
         get: async (key: string) => storage[key],
         set: async (key: string, value: any, ttl?: number) => {
           storage[key] = value;
           if (ttl) {
             const id = setTimeout(() => delete storage[key], ttl);
             timeoutIds.push(id);
           }
         },
         increment: async (key: string, ttl: number) => {
           const record = storage[key] || { totalHits: 0, expiresAt: Date.now() + ttl };
           record.totalHits += 1;
           storage[key] = record;
           const timeToExpire = Math.ceil((record.expiresAt - Date.now()) / 1000);
           return {
             totalHits: record.totalHits,
             timeToExpire: Math.max(0, timeToExpire),
           };
         },
         delete: async (key: string) => { delete storage[key]; },
         storage,
         timeoutIds,
       };
       return storageService;
     },
   }
   ```
   - `increment` メソッドを含む完全な in-memory ストレージ実装
   - レート制限のテストが正常に実行可能

### 2. テスト共通ユーティリティの作成

**ファイル**: `backend/src/test-utils/test-module-setup.ts` (新規作成)

#### 内容:

```typescript
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CanActivate } from '@nestjs/common';

/**
 * No-op guard for unit tests that don't need real rate limiting or authentication
 * コントローラーのユニットテストで使用するダミーガード
 */
export class NoopGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

/**
 * Get common module imports for test modules
 * テストモジュール用の共通インポート
 */
export function getTestModuleImports() {
  return [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ];
}

/**
 * Get common providers for test modules
 * テストモジュール用の共通プロバイダー
 */
export function getTestModuleProviders() {
  return [
    {
      provide: APP_GUARD,
      useClass: NoopGuard,
    },
  ];
}
```

#### 目的:
- ユニットテストで実際のレート制限や認証が不要な場合に使用する no-op ガード
- すべてのリクエストを許可し、テストをシンプルに保つ
- `ConfigModule` を提供して `JwtAuthGuard` の依存関係を満たす

### 3. コントローラーテストの更新

以下のコントローラーテストファイルを更新:

1. `backend/src/breeding/breeding.controller.spec.ts`
2. `backend/src/breeds/breeds.controller.spec.ts`
3. `backend/src/care/care.controller.spec.ts`
4. `backend/src/cats/cats.controller.spec.ts`
5. `backend/src/coat-colors/coat-colors.controller.spec.ts`
6. `backend/src/display-preferences/display-preferences.controller.spec.ts`
7. `backend/src/graduation/graduation.controller.spec.ts`
8. `backend/src/pedigree/pedigree.controller.spec.ts`
9. `backend/src/shift/shift.controller.spec.ts`
10. `backend/src/staff/staff.controller.spec.ts`

#### 変更パターン:

**Before:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { SomeController } from './some.controller';

const module: TestingModule = await Test.createTestingModule({
  controllers: [SomeController],
  providers: [
    { provide: SomeService, useValue: mockService },
  ],
}).compile();
```

**After:**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';
import { SomeController } from './some.controller';

const module: TestingModule = await Test.createTestingModule({
  imports: getTestModuleImports(),
  controllers: [SomeController],
  providers: [
    ...getTestModuleProviders(),
    { provide: SomeService, useValue: mockService },
  ],
}).compile();
```

## 検証結果

### テスト実行結果

```bash
$ npx jest --no-coverage

Test Suites: 33 passed, 33 total
Tests:       272 passed, 272 total
Snapshots:   0 total
Time:        11.016 s
```

✅ すべてのテストが成功

### Lint チェック

```bash
$ npm run lint
✅ No issues found
```

### ビルドチェック

```bash
$ npm run build
✅ Build successful
```

### 型チェック

```bash
$ npm run type-check
✅ No type errors
```

## 設計上の決定事項

### 1. テストの分離戦略

- **Integration tests** (`auth.rate-limit.spec.ts`):
  - 実際の `EnhancedThrottlerGuard` を使用
  - 完全な `ThrottlerStorage` モックを提供
  - レート制限の動作を実際にテスト

- **Unit tests** (controller specs):
  - No-op ガードを使用
  - 認証やレート制限のロジックはテストしない
  - コントローラーのビジネスロジックに集中

### 2. 再利用性の向上

`test-utils/test-module-setup.ts` を作成することで:
- テストコードの重複を削減
- 一貫したテストセットアップを保証
- 将来的なテスト設定の変更が容易

### 3. 最小限の変更

- グローバル jest setup は作成せず、明示的なインポートを使用
- 既存のテストロジックは変更せず、設定のみを更新
- プロダクションコードには一切変更なし

## CI/CD への影響

### PostgreSQL 設定

調査の結果、`.github/workflows/ci-cd.yml` は既に正しく設定されていることを確認:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: testdb
```

追加の変更は不要。

### 期待される CI の改善

1. **テスト失敗の解消**: 41個の失敗していたテストがすべて成功するようになる
2. **ビルド時間の短縮**: テストセットアップエラーによる無駄な再試行が削減
3. **明確なエラーメッセージ**: テストが実際に失敗した場合、本当の原因が明確になる

## まとめ

### 実装した主要な改善点

1. ✅ `auth.rate-limit.spec.ts` のクラッシュを修正
2. ✅ 10個のコントローラーテストを修正
3. ✅ 再利用可能なテストユーティリティを作成
4. ✅ すべてのテスト（272個）が成功
5. ✅ Lint、ビルド、型チェックがすべて成功

### ベストプラクティスの適用

- 統合テストとユニットテストを適切に分離
- テストコードの重複を削減
- 型安全性を維持
- 最小限の変更で最大の効果

### 今後のメンテナンス

新しいコントローラーテストを追加する場合:

```typescript
import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

const module: TestingModule = await Test.createTestingModule({
  imports: getTestModuleImports(),
  controllers: [NewController],
  providers: [
    ...getTestModuleProviders(),
    // your service mocks here
  ],
}).compile();
```

このパターンに従うことで、同じ問題を防ぐことができます。
