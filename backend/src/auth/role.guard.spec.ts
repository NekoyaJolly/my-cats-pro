import { ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;
  let loggerWarnSpy: jest.SpyInstance;
  let originalAuthDisabled: string | undefined;

  beforeEach(async () => {
    originalAuthDisabled = process.env.AUTH_DISABLED;
    delete process.env.AUTH_DISABLED;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get<Reflector>(Reflector);

    // Logger の warn メソッドをモック
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
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
    user?: { userId: string; email?: string; role?: UserRole },
  ): ExecutionContext => {
    const context: Partial<ExecutionContext> = {
      switchToHttp: () => ({
        getRequest: <T = { user?: { userId: string; email?: string; role?: UserRole } }>() =>
          ({ user }) as T,
        getResponse: <T = Record<string, never>>() => ({}) as T,
        getNext: <T = Record<string, never>>() => ({}) as T,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    };

    return context as ExecutionContext;
  };

  it('定義されていること', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('ロールが要求されていない場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(undefined);

      const context = createMockExecutionContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが存在しない場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext(undefined);
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('ユーザーが ADMIN ロールを持っていて ADMIN が要求されている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-1',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが SUPER_ADMIN ロールを持っていて ADMIN または SUPER_ADMIN が要求されている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-2',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが USER ロールを持っていて ADMIN が要求されている場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-3',
        email: 'user@example.com',
        role: UserRole.USER,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('ユーザーにロールが設定されていない場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-4',
        email: 'noRole@example.com',
        role: undefined,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('TENANT_ADMIN ロールが要求され、ユーザーが TENANT_ADMIN を持っている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.TENANT_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-5',
        email: 'tenantadmin@example.com',
        role: UserRole.TENANT_ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe('ログ出力', () => {
    it('ユーザーが存在しない場合にログを出力する', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext(undefined);
      guard.canActivate(context);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'アクセス拒否: ユーザー情報がありません',
          reason: 'user_not_found',
        }),
      );
    });

    it('ロールが不足している場合にログを出力する', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-6',
        email: 'user@example.com',
        role: UserRole.USER,
      });
      guard.canActivate(context);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'アクセス拒否: ロールが不足しています',
          userId: 'user-6',
          userRole: UserRole.USER,
          reason: 'role_mismatch',
        }),
      );
    });

    it('アクセスが許可された場合はログを出力しない', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce([UserRole.ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-7',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      });
      guard.canActivate(context);

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });
  });
});
