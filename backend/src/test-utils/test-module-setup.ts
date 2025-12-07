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
 * Common test module configuration for controller tests
 * コントローラーテスト用の共通モジュール設定
 * 
 * Usage:
 * ```typescript
 * import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';
 * 
 * const module: TestingModule = await Test.createTestingModule({
 *   imports: getTestModuleImports(),
 *   controllers: [YourController],
 *   providers: [
 *     ...getTestModuleProviders(),
 *     { provide: YourService, useValue: mockYourService },
 *   ],
 * }).compile();
 * ```
 */

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
