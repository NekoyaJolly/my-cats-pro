import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        role: UserRole.USER,
        isActive: true,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      },
      {
        id: 'user-2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        role: UserRole.USER,
        isActive: true,
        tenantId: 'tenant-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      },
    ];

    describe('SUPER_ADMIN として', () => {
      const superAdminUser: RequestUser = {
        userId: 'super-admin-1',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN,
        tenantId: undefined,
      };

      it('全ユーザーを取得できる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(superAdminUser);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUsers);
        expect(result.count).toBe(2);
        expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
          where: undefined,
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('tenantId でフィルタできる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(superAdminUser, 'tenant-1');

        expect(result.success).toBe(true);
        expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
          where: { tenantId: 'tenant-1' },
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });
    });

    describe('TENANT_ADMIN として', () => {
      const tenantAdminUser: RequestUser = {
        userId: 'tenant-admin-1',
        email: 'tenantadmin@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant-1',
      };

      it('自テナントのユーザーを取得できる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(tenantAdminUser);

        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockUsers);
        expect(result.count).toBe(2);
        expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
          where: { tenantId: 'tenant-1' },
          select: expect.any(Object),
          orderBy: { createdAt: 'desc' },
        });
      });

      it('自テナントの tenantId を指定しても取得できる', async () => {
        mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

        const result = await service.listUsers(tenantAdminUser, 'tenant-1');

        expect(result.success).toBe(true);
        expect(result.count).toBe(2);
      });

      it('他のテナント ID を指定するとエラー', async () => {
        await expect(
          service.listUsers(tenantAdminUser, 'tenant-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.listUsers(tenantAdminUser, 'tenant-2'),
        ).rejects.toThrow('他のテナントのユーザー一覧にはアクセスできません');
      });

      it('テナントに所属していない場合はエラー', async () => {
        const noTenantAdminUser: RequestUser = {
          userId: 'tenant-admin-2',
          email: 'tenantadmin2@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: undefined,
        };

        await expect(service.listUsers(noTenantAdminUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(noTenantAdminUser)).rejects.toThrow(
          'テナントに所属していません',
        );
      });
    });

    describe('権限のないロールとして', () => {
      it('USER ロールはアクセスできない', async () => {
        const regularUser: RequestUser = {
          userId: 'user-1',
          email: 'user@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        await expect(service.listUsers(regularUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(regularUser)).rejects.toThrow(
          'ユーザー一覧の取得権限がありません',
        );
      });

      it('ADMIN ロールはアクセスできない', async () => {
        const adminUser: RequestUser = {
          userId: 'admin-1',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          tenantId: 'tenant-1',
        };

        await expect(service.listUsers(adminUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(adminUser)).rejects.toThrow(
          'ユーザー一覧の取得権限がありません',
        );
      });

      it('ロールが未設定の場合はアクセスできない', async () => {
        const noRoleUser: RequestUser = {
          userId: 'user-no-role',
          email: 'norole@example.com',
          role: undefined,
          tenantId: 'tenant-1',
        };

        await expect(service.listUsers(noRoleUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.listUsers(noRoleUser)).rejects.toThrow(
          'ユーザーロールが設定されていません',
        );
      });
    });
  });

  describe('promoteToSuperAdminOnce', () => {
    const regularUser: RequestUser = {
      userId: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    describe('SUPER_ADMIN がまだ存在しない場合', () => {
      it('ユーザーを SUPER_ADMIN に昇格できる', async () => {
        mockPrismaService.user.count.mockResolvedValue(0);
        mockPrismaService.user.update.mockResolvedValue({
          id: regularUser.userId,
          email: regularUser.email,
          role: UserRole.SUPER_ADMIN,
        });

        const result = await service.promoteToSuperAdminOnce(regularUser);

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(regularUser.userId);
        expect(result.data.email).toBe(regularUser.email);
        expect(result.data.role).toBe(UserRole.SUPER_ADMIN);

        expect(mockPrismaService.user.count).toHaveBeenCalledWith({
          where: { role: UserRole.SUPER_ADMIN },
        });
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
          where: { id: regularUser.userId },
          data: { role: UserRole.SUPER_ADMIN },
          select: {
            id: true,
            email: true,
            role: true,
          },
        });
      });
    });

    describe('SUPER_ADMIN がすでに存在する場合', () => {
      it('ForbiddenException を投げる', async () => {
        mockPrismaService.user.count.mockResolvedValue(1);

        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          'SUPER_ADMINはすでに存在します',
        );
      });

      it('prisma.user.update が呼ばれないことを確認', async () => {
        mockPrismaService.user.count.mockResolvedValue(2);

        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          ForbiddenException,
        );

        expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      });
    });
  });
});
