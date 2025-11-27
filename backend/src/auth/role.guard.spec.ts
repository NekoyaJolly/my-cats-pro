import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(async () => {
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
  });

  const createMockExecutionContext = (
    user?: { userId: string; email?: string; role?: UserRole },
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  it('定義されていること', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('ロールが要求されていない場合は true を返す', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext();
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('ユーザーが存在しない場合は false を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN]);

      const context = createMockExecutionContext(undefined);
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('ユーザーが ADMIN ロールを持っていて ADMIN が要求されている場合は true を返す', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

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
        .mockReturnValue([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

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
        .mockReturnValue([UserRole.ADMIN, UserRole.SUPER_ADMIN]);

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
        .mockReturnValue([UserRole.ADMIN]);

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
        .mockReturnValue([UserRole.TENANT_ADMIN]);

      const context = createMockExecutionContext({
        userId: 'user-5',
        email: 'tenantadmin@example.com',
        role: UserRole.TENANT_ADMIN,
      });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
