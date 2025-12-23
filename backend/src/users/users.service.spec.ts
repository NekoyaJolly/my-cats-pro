import { 
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  // トランザクション内で使用されるモック
  const mockTxUser = {
    count: jest.fn(),
    update: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
    invitationToken: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: { user: typeof mockTxUser }) => Promise<unknown>) => {
      return callback({ user: mockTxUser });
    }),
  };

  const mockEmailService = {
    sendInvitationEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
    // トランザクションのモックもクリア
    mockTxUser.count.mockClear();
    mockTxUser.update.mockClear();
    mockPrismaService.tenant.findUnique.mockClear();
    mockPrismaService.user.findUnique.mockClear();
    mockPrismaService.user.findFirst.mockClear();
    mockPrismaService.invitationToken.create.mockClear();
    mockEmailService.sendInvitationEmail.mockClear();
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
        mockTxUser.count.mockResolvedValue(0);
        mockTxUser.update.mockResolvedValue({
          id: regularUser.userId,
          email: regularUser.email,
          role: UserRole.SUPER_ADMIN,
        });

        const result = await service.promoteToSuperAdminOnce(regularUser);

        expect(result.success).toBe(true);
        expect(result.data.id).toBe(regularUser.userId);
        expect(result.data.email).toBe(regularUser.email);
        expect(result.data.role).toBe(UserRole.SUPER_ADMIN);

        expect(mockTxUser.count).toHaveBeenCalledWith({
          where: { role: UserRole.SUPER_ADMIN },
        });
        expect(mockTxUser.update).toHaveBeenCalledWith({
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
        mockTxUser.count.mockResolvedValue(1);

        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          'SUPER_ADMINはすでに存在します',
        );
      });

      it('prisma.user.update が呼ばれないことを確認', async () => {
        mockTxUser.count.mockResolvedValue(2);

        await expect(service.promoteToSuperAdminOnce(regularUser)).rejects.toThrow(
          ForbiddenException,
        );

        expect(mockTxUser.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('inviteUser', () => {
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const mockTenant = {
      id: 'tenant-1',
      name: 'Test Tenant',
      slug: 'test-tenant',
      isActive: true,
    };

    const mockInvitation = {
      id: 'invitation-1',
      email: 'newuser@example.com',
      token: 'mock-token-123',
      role: UserRole.USER,
      tenantId: 'tenant-1',
      expiresAt: new Date(),
    };

    describe('SUPER_ADMIN として', () => {
      it('任意のテナントにユーザーを招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue(mockInvitation);

        const result = await service.inviteUser(superAdminUser, dto);

        expect(result.success).toBe(true);
        expect(result.tenantId).toBe('tenant-1');
        expect(result.message).toBe('招待メールを送信しました');
        expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
          where: { id: 'tenant-1' },
        });
        expect(mockPrismaService.invitationToken.create).toHaveBeenCalled();
        expect(mockEmailService.sendInvitationEmail).toHaveBeenCalledWith(
          'newuser@example.com',
          'mock-token-123',
          'Test Tenant',
          UserRole.USER,
        );
      });

      it('TENANT_ADMIN を招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newadmin@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue({
          ...mockInvitation,
          role: UserRole.TENANT_ADMIN,
        });

        const result = await service.inviteUser(superAdminUser, dto);

        expect(result.success).toBe(true);
      });
    });

    describe('TENANT_ADMIN として', () => {
      it('自テナントに ADMIN を招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newadmin@example.com',
          role: UserRole.ADMIN,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue({
          ...mockInvitation,
          role: UserRole.ADMIN,
        });

        const result = await service.inviteUser(tenantAdminUser, dto);

        expect(result.success).toBe(true);
        expect(result.tenantId).toBe('tenant-1');
      });

      it('自テナントに USER を招待できる', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue(null);
        mockPrismaService.invitationToken.create.mockResolvedValue(mockInvitation);

        const result = await service.inviteUser(tenantAdminUser, dto);

        expect(result.success).toBe(true);
      });

      it('TENANT_ADMIN を招待しようとすると 403', async () => {
        const dto: InviteUserDto = {
          email: 'newadmin@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: 'tenant-1',
        };

        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN を招待する権限がありません',
        );
      });

      it('SUPER_ADMIN を招待しようとすると 403', async () => {
        const dto: InviteUserDto = {
          email: 'newsuperadmin@example.com',
          role: UserRole.SUPER_ADMIN,
          tenantId: 'tenant-1',
        };

        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN を招待する権限がありません',
        );
      });

      it('他テナントに招待しようとすると 403', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-2',
        };

        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          ForbiddenException,
        );
        await expect(service.inviteUser(tenantAdminUser, dto)).rejects.toThrow(
          '他のテナントにユーザーを招待することはできません',
        );
      });
    });

    describe('共通エラーケース', () => {
      it('既存ユーザーがいる場合は 409', async () => {
        const dto: InviteUserDto = {
          email: 'existing@example.com',
          role: UserRole.USER,
          tenantId: 'tenant-1',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'existing-user',
          email: 'existing@example.com',
        });

        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          ConflictException,
        );
        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          'このメールアドレスは既に使用されています',
        );
      });

      it('テナントが存在しない場合は 404', async () => {
        const dto: InviteUserDto = {
          email: 'newuser@example.com',
          role: UserRole.USER,
          tenantId: 'non-existent-tenant',
        };

        mockPrismaService.tenant.findUnique.mockResolvedValue(null);

        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          NotFoundException,
        );
        await expect(service.inviteUser(superAdminUser, dto)).rejects.toThrow(
          '指定されたテナントが見つかりません',
        );
      });
    });
  });

  describe('updateUserRole', () => {
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockAdmin = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tenantId: 'tenant-1',
    };

    const mockSuperAdmin = {
      id: 'super-admin-2',
      email: 'superadmin2@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const mockTenantAdmin = {
      id: 'tenant-admin-2',
      email: 'tenantadmin2@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    describe('SUPER_ADMIN として', () => {
      it('ユーザーのロールを変更できる', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.update.mockResolvedValue({
          ...mockUser,
          role: UserRole.ADMIN,
        });

        const result = await service.updateUserRole(superAdminUser, 'user-1', dto);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(UserRole.ADMIN);
        expect(result.message).toBe('ロールを更新しました');
      });

      it('SUPER_ADMIN を降格しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockSuperAdmin);

        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow('SUPER_ADMIN を降格することはできません');
      });

      it('自分自身のロールを変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'super-admin-1',
          email: 'superadmin@example.com',
          role: UserRole.SUPER_ADMIN,
        });

        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(superAdminUser, 'super-admin-1', dto),
        ).rejects.toThrow('自分自身のロールを変更することはできません');
      });
    });

    describe('TENANT_ADMIN として', () => {
      it('自テナントの ADMIN を USER に変更できる', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.USER };

        mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);
        mockPrismaService.user.update.mockResolvedValue({
          ...mockAdmin,
          role: UserRole.USER,
        });

        const result = await service.updateUserRole(tenantAdminUser, 'admin-1', dto);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(UserRole.USER);
      });

      it('自テナントの USER を ADMIN に変更できる', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.update.mockResolvedValue({
          ...mockUser,
          role: UserRole.ADMIN,
        });

        const result = await service.updateUserRole(tenantAdminUser, 'user-1', dto);

        expect(result.success).toBe(true);
        expect(result.data.role).toBe(UserRole.ADMIN);
      });

      it('他テナントのユーザーを変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        const otherTenantUser = {
          ...mockUser,
          tenantId: 'tenant-2',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(otherTenantUser);

        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow('他のテナントのユーザーのロールを変更することはできません');
      });

      it('SUPER_ADMIN を変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        const superAdminInTenant = {
          ...mockSuperAdmin,
          tenantId: 'tenant-1',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(superAdminInTenant);

        await expect(
          service.updateUserRole(tenantAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'super-admin-2', dto),
        ).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN のロールを変更する権限がありません',
        );
      });

      it('TENANT_ADMIN を変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.USER };

        mockPrismaService.user.findUnique.mockResolvedValue(mockTenantAdmin);

        await expect(
          service.updateUserRole(tenantAdminUser, 'tenant-admin-2', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'tenant-admin-2', dto),
        ).rejects.toThrow(
          'SUPER_ADMIN または TENANT_ADMIN のロールを変更する権限がありません',
        );
      });

      it('SUPER_ADMIN に変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.SUPER_ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN に変更する権限がありません');
      });

      it('TENANT_ADMIN に変更しようとすると 403', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.TENANT_ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.updateUserRole(tenantAdminUser, 'user-1', dto),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN に変更する権限がありません');
      });
    });

    describe('共通エラーケース', () => {
      it('ユーザーが存在しない場合は 404', async () => {
        const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };

        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(
          service.updateUserRole(superAdminUser, 'non-existent-user', dto),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.updateUserRole(superAdminUser, 'non-existent-user', dto),
        ).rejects.toThrow('指定されたユーザーが見つかりません');
      });
    });
  });

  describe('getProfile', () => {
    const regularUser: RequestUser = {
      userId: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockUserProfile = {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Test',
      role: UserRole.USER,
    };

    it('ユーザーが存在する場合、プロフィール情報を正常に取得できる', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUserProfile);

      const result = await service.getProfile(regularUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserProfile);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    });

    it('ユーザーが存在しない場合、NotFoundException がスローされる', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(regularUser)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile(regularUser)).rejects.toThrow(
        'ユーザーが見つかりません',
      );
    });
  });

  describe('updateProfile', () => {
    const regularUser: RequestUser = {
      userId: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockUpdatedUser = {
      id: 'user-1',
      email: 'newemail@example.com',
      firstName: 'NewFirst',
      lastName: 'NewLast',
      role: UserRole.USER,
    };

    it('firstName, lastName, email を正常に更新できる', async () => {
      const dto = {
        firstName: 'NewFirst',
        lastName: 'NewLast',
        email: 'newemail@example.com',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateProfile(regularUser, dto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
      expect(result.message).toBe('プロフィールを更新しました');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: {
          firstName: 'NewFirst',
          lastName: 'NewLast',
          email: 'newemail@example.com',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    });

    it('firstName のみを更新できる', async () => {
      const dto = { firstName: 'NewFirst' };

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        firstName: 'NewFirst',
      });

      const result = await service.updateProfile(regularUser, dto);

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: { firstName: 'NewFirst' },
        select: expect.any(Object),
      });
    });

    it('空のDTOの場合、BadRequestException がスローされる', async () => {
      const dto = {};

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        '更新するフィールドがありません',
      );
    });

    it('既存のメールアドレスを指定した場合、ConflictException がスローされる', async () => {
      const dto = { email: 'existing@example.com' };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'other-user',
        email: 'existing@example.com',
      });

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        'このメールアドレスは既に使用されています',
      );
    });

    it('空のメールアドレスを指定した場合、BadRequestException がスローされる', async () => {
      const dto = { email: '' };

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        'メールアドレスは空にできません',
      );
    });

    it('空白のみのメールアドレスを指定した場合、BadRequestException がスローされる', async () => {
      const dto = { email: '   ' };

      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile(regularUser, dto)).rejects.toThrow(
        'メールアドレスは空にできません',
      );
    });

    it('メールアドレスが正規化される（trim + toLowerCase）', async () => {
      const dto = { email: '  Test@Example.COM  ' };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        email: 'test@example.com',
      });

      await service.updateProfile(regularUser, dto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: { email: 'test@example.com' },
        select: expect.any(Object),
      });
    });

    it('空文字列で firstName/lastName を削除できる', async () => {
      const dto = { firstName: '', lastName: '' };

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUpdatedUser,
        firstName: '',
        lastName: '',
      });

      const result = await service.updateProfile(regularUser, dto);

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: regularUser.userId },
        data: { firstName: '', lastName: '' },
        select: expect.any(Object),
      });
    });
  });

  describe('deleteUser', () => {
    const superAdminUser: RequestUser = {
      userId: 'super-admin-1',
      email: 'superadmin@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const tenantAdminUser: RequestUser = {
      userId: 'tenant-admin-1',
      email: 'tenantadmin@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    const mockUser = {
      id: 'user-1',
      email: 'user@example.com',
      role: UserRole.USER,
      tenantId: 'tenant-1',
    };

    const mockAdmin = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      tenantId: 'tenant-1',
    };

    const mockSuperAdmin = {
      id: 'super-admin-2',
      email: 'superadmin2@example.com',
      role: UserRole.SUPER_ADMIN,
      tenantId: undefined,
    };

    const mockTenantAdmin = {
      id: 'tenant-admin-2',
      email: 'tenantadmin2@example.com',
      role: UserRole.TENANT_ADMIN,
      tenantId: 'tenant-1',
    };

    describe('SUPER_ADMIN として', () => {
      it('自分自身を削除しようとした場合は拒否される', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: 'super-admin-1',
          email: 'superadmin@example.com',
          role: UserRole.SUPER_ADMIN,
          tenantId: undefined,
        });

        await expect(
          service.deleteUser(superAdminUser, 'super-admin-1'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(superAdminUser, 'super-admin-1'),
        ).rejects.toThrow('自分自身を削除することはできません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('他の SUPER_ADMIN を削除しようとした場合は拒否される', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockSuperAdmin);

        await expect(
          service.deleteUser(superAdminUser, 'super-admin-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(superAdminUser, 'super-admin-2'),
        ).rejects.toThrow('SUPER_ADMIN を削除することはできません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('TENANT_ADMIN を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockTenantAdmin);
        mockPrismaService.user.delete.mockResolvedValue(mockTenantAdmin);

        const result = await service.deleteUser(superAdminUser, 'tenant-admin-2');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'tenant-admin-2' },
        });
      });

      it('ADMIN を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);
        mockPrismaService.user.delete.mockResolvedValue(mockAdmin);

        const result = await service.deleteUser(superAdminUser, 'admin-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'admin-1' },
        });
      });

      it('USER を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.delete.mockResolvedValue(mockUser);

        const result = await service.deleteUser(superAdminUser, 'user-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'user-1' },
        });
      });
    });

    describe('TENANT_ADMIN として', () => {
      it('自テナントの ADMIN を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockAdmin);
        mockPrismaService.user.delete.mockResolvedValue(mockAdmin);

        const result = await service.deleteUser(tenantAdminUser, 'admin-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'admin-1' },
        });
      });

      it('自テナントの USER を削除できる', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaService.user.delete.mockResolvedValue(mockUser);

        const result = await service.deleteUser(tenantAdminUser, 'user-1');

        expect(result.success).toBe(true);
        expect(result.message).toBe('ユーザーを削除しました');
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
          where: { id: 'user-1' },
        });
      });

      it('SUPER_ADMIN を削除しようとした場合は拒否される', async () => {
        const superAdminInTenant = {
          ...mockSuperAdmin,
          tenantId: 'tenant-1',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(superAdminInTenant);

        await expect(
          service.deleteUser(tenantAdminUser, 'super-admin-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(tenantAdminUser, 'super-admin-2'),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN を削除する権限がありません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('TENANT_ADMIN を削除しようとした場合は拒否される', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(mockTenantAdmin);

        await expect(
          service.deleteUser(tenantAdminUser, 'tenant-admin-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(tenantAdminUser, 'tenant-admin-2'),
        ).rejects.toThrow('SUPER_ADMIN または TENANT_ADMIN を削除する権限がありません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('他テナントのユーザーを削除しようとした場合は拒否される', async () => {
        const otherTenantUser = {
          ...mockUser,
          tenantId: 'tenant-2',
        };
        mockPrismaService.user.findUnique.mockResolvedValue(otherTenantUser);

        await expect(
          service.deleteUser(tenantAdminUser, 'user-1'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(tenantAdminUser, 'user-1'),
        ).rejects.toThrow('他のテナントのユーザーを削除することはできません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });
    });

    describe('共通エラーケース', () => {
      it('存在しないユーザー ID を指定した場合はエラー', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null);

        await expect(
          service.deleteUser(superAdminUser, 'non-existent-user'),
        ).rejects.toThrow(NotFoundException);
        await expect(
          service.deleteUser(superAdminUser, 'non-existent-user'),
        ).rejects.toThrow('指定されたユーザーが見つかりません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('ロールが設定されていない場合はアクセス拒否', async () => {
        const userWithoutRole: RequestUser = {
          userId: 'user-1',
          email: 'user@example.com',
          role: undefined as any,
          tenantId: 'tenant-1',
        };

        await expect(
          service.deleteUser(userWithoutRole, 'user-2'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(userWithoutRole, 'user-2'),
        ).rejects.toThrow('ユーザーロールが設定されていません');

        expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });

      it('ADMIN または USER ロールの場合はアクセス拒否', async () => {
        const adminUser: RequestUser = {
          userId: 'admin-1',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          tenantId: 'tenant-1',
        };

        mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

        await expect(
          service.deleteUser(adminUser, 'user-1'),
        ).rejects.toThrow(ForbiddenException);
        await expect(
          service.deleteUser(adminUser, 'user-1'),
        ).rejects.toThrow('ユーザー削除の権限がありません');

        expect(mockPrismaService.user.delete).not.toHaveBeenCalled();
      });
    });
  });
});
