import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { TenantScopedGuard } from './tenant-scoped.guard';

describe('TenantScopedGuard', () => {
  let guard: TenantScopedGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new TenantScopedGuard(reflector);
  });

  const createMockExecutionContext = (
    user?: { role?: string; tenantId?: string },
    params?: Record<string, string>,
    body?: Record<string, unknown>,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params, body }),
      }),
    } as ExecutionContext;
  };

  describe('認証されていないユーザー', () => {
    it('認証が必要エラーを投げる', () => {
      const context = createMockExecutionContext();
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('認証が必要です');
    });
  });

  describe('SUPER_ADMIN ユーザー', () => {
    it('すべてのテナントにアクセス可能', () => {
      const context = createMockExecutionContext(
        { role: 'SUPER_ADMIN', tenantId: 'tenant-1' },
        { tenantId: 'tenant-2' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('テナントIDが指定されていなくてもアクセス可能', () => {
      const context = createMockExecutionContext(
        { role: 'SUPER_ADMIN', tenantId: 'tenant-1' },
        {},
      );
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('TENANT_ADMIN または USER', () => {
    it('自分のテナントにアクセス可能（params経由）', () => {
      const context = createMockExecutionContext(
        { role: 'TENANT_ADMIN', tenantId: 'tenant-1' },
        { tenantId: 'tenant-1' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('自分のテナントにアクセス可能（body経由）', () => {
      const context = createMockExecutionContext(
        { role: 'USER', tenantId: 'tenant-1' },
        {},
        { tenantId: 'tenant-1' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('他のテナントにはアクセス不可', () => {
      const context = createMockExecutionContext(
        { role: 'TENANT_ADMIN', tenantId: 'tenant-1' },
        { tenantId: 'tenant-2' },
      );
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'このテナントへのアクセス権限がありません',
      );
    });

    it('テナントIDが指定されていない場合はエラー', () => {
      const context = createMockExecutionContext(
        { role: 'TENANT_ADMIN', tenantId: 'tenant-1' },
        {},
      );
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'テナントIDが指定されていません',
      );
    });
  });

  describe('paramsとbodyの優先順位', () => {
    it('paramsが優先される', () => {
      const context = createMockExecutionContext(
        { role: 'USER', tenantId: 'tenant-1' },
        { tenantId: 'tenant-1' },
        { tenantId: 'tenant-2' },
      );
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
