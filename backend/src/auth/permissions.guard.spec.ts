import { ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { PERMISSIONS } from './permissions';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let originalAuthDisabled: string | undefined;

  beforeEach(async () => {
    originalAuthDisabled = process.env.AUTH_DISABLED;
    delete process.env.AUTH_DISABLED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);

    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    if (typeof originalAuthDisabled === 'string') {
      process.env.AUTH_DISABLED = originalAuthDisabled;
    } else {
      delete process.env.AUTH_DISABLED;
    }

    jest.restoreAllMocks();
  });

  const createMockExecutionContext = (
    user?: { userId: string; role?: UserRole; permissions?: string[] },
  ): ExecutionContext => {
    const context: Partial<ExecutionContext> = {
      switchToHttp: () => ({
        getRequest: <T = { user?: unknown }>() => ({ user }) as T,
        getResponse: <T = Record<string, never>>() => ({}) as T,
        getNext: <T = Record<string, never>>() => ({}) as T,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    };

    return context as ExecutionContext;
  };

  /** reflector を isPublic=false, requiredPermissions=permissions でモックする */
  const mockMetadata = (permissions?: string[]) => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(permissions);
  };

  it('定義されていること', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('権限が要求されていないエンドポイントは許可する', () => {
      mockMetadata(undefined);
      const context = createMockExecutionContext({ userId: 'u1', role: UserRole.USER, permissions: [] });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('SUPER_ADMIN は要求権限を持っていなくても許可する', () => {
      mockMetadata([PERMISSIONS.TENANTS_MANAGE]);
      const context = createMockExecutionContext({
        userId: 'u1',
        role: UserRole.SUPER_ADMIN,
        permissions: [],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('必要な権限をすべて持つユーザーは許可する', () => {
      mockMetadata([PERMISSIONS.USERS_MANAGE]);
      const context = createMockExecutionContext({
        userId: 'u1',
        role: UserRole.TENANT_ADMIN,
        permissions: [PERMISSIONS.USERS_MANAGE, PERMISSIONS.CATS_WRITE],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('権限が不足しているユーザーは日本語メッセージ付きの403を返す', () => {
      mockMetadata([PERMISSIONS.USERS_MANAGE]);
      const context = createMockExecutionContext({
        userId: 'u1',
        role: UserRole.ADMIN,
        permissions: [PERMISSIONS.CATS_WRITE],
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);

      // reflector のモックは1回分ずつ消費されるため再設定する
      mockMetadata([PERMISSIONS.USERS_MANAGE]);
      expect(() => guard.canActivate(context)).toThrow(/ユーザー管理/);
    });

    it('ユーザー情報がない場合は403を返す', () => {
      mockMetadata([PERMISSIONS.CATS_WRITE]);
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('AUTH_DISABLED の場合は権限チェックをスキップする', () => {
      process.env.AUTH_DISABLED = '1';
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);
      const context = createMockExecutionContext(undefined);

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
