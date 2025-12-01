import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { InviteTenantAdminDto, InviteUserDto, CompleteInvitationDto } from './dto/invitation.dto';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let _prisma: PrismaService;
  let _passwordService: PasswordService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    invitationToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockPasswordService = {
    validatePasswordStrength: jest.fn(),
    hashPassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    _prisma = module.get<PrismaService>(PrismaService);
    _passwordService = module.get<PasswordService>(PasswordService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('inviteTenantAdmin', () => {
    const dto: InviteTenantAdminDto = {
      email: 'admin@example.com',
      tenantName: 'Test Tenant',
      tenantSlug: 'test-tenant',
    };

    it('テナントと招待トークンを正常に作成', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          tenant: {
            create: jest.fn().mockResolvedValue({
              id: 'tenant-1',
              name: dto.tenantName,
              slug: dto.tenantSlug,
            }),
          },
          invitationToken: {
            create: jest.fn().mockResolvedValue({
              id: 'invitation-1',
              token: 'test-token',
              email: dto.email,
            }),
          },
        });
      });

      const result = await service.inviteTenantAdmin(dto);

      expect(result.success).toBe(true);
      expect(result.tenantId).toBeDefined();
      expect(result.invitationToken).toBeDefined();
    });

    it('メールアドレスが既に使用されている場合エラー', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });

      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(ConflictException);
      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(
        'このメールアドレスは既に使用されています',
      );
    });

    it('スラッグが既に使用されている場合エラー', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });

      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(ConflictException);
      await expect(service.inviteTenantAdmin(dto)).rejects.toThrow(
        'このスラッグは既に使用されています',
      );
    });
  });

  describe('inviteUser', () => {
    const tenantId = 'tenant-1';
    const dto: InviteUserDto = {
      email: 'user@example.com',
      role: UserRole.USER,
    };

    it('ユーザー招待トークンを正常に作成', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        isActive: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.invitationToken.create.mockResolvedValue({
        id: 'invitation-1',
        token: 'test-token',
      });

      const result = await service.inviteUser(tenantId, dto);

      expect(result.success).toBe(true);
      expect(result.invitationToken).toBeDefined();
    });

    it('テナントが存在しない場合エラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(NotFoundException);
      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(
        'テナントが見つかりません',
      );
    });

    it('テナントが無効化されている場合エラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        isActive: false,
      });

      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(BadRequestException);
      await expect(service.inviteUser(tenantId, dto)).rejects.toThrow(
        'このテナントは無効化されています',
      );
    });

    it('TENANT_ADMINを招待しようとするとエラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: tenantId,
        isActive: true,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const adminDto = { ...dto, role: UserRole.TENANT_ADMIN };

      await expect(service.inviteUser(tenantId, adminDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeInvitation', () => {
    const dto: CompleteInvitationDto = {
      token: 'valid-token',
      password: 'SecurePassword123!',
      firstName: 'Test',
      lastName: 'User',
    };

    it('招待完了とユーザー作成に成功', async () => {
      const invitation = {
        id: 'invitation-1',
        email: 'user@example.com',
        role: UserRole.USER,
        tenantId: 'tenant-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 86400000), // 24時間後
        tenant: { id: 'tenant-1', isActive: true },
      };

      mockPrismaService.invitationToken.findUnique.mockResolvedValue(invitation);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPasswordService.validatePasswordStrength.mockReturnValue({ isValid: true, errors: [] });
      mockPasswordService.hashPassword.mockResolvedValue('hashed-password');
      mockJwtService.signAsync.mockResolvedValue('test-jwt-token');
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'user-1',
              email: invitation.email,
              tenantId: invitation.tenantId,
            }),
          },
          invitationToken: {
            update: jest.fn(),
          },
        });
      });

      const result = await service.completeInvitation(dto);

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.tenantId).toBe('tenant-1');
      expect(result.access_token).toBe('test-jwt-token');
    });

    it('無効なトークンの場合エラー', async () => {
      mockPrismaService.invitationToken.findUnique.mockResolvedValue(null);

      await expect(service.completeInvitation(dto)).rejects.toThrow(BadRequestException);
      await expect(service.completeInvitation(dto)).rejects.toThrow('無効な招待トークンです');
    });

    it('既に使用済みのトークンの場合エラー', async () => {
      mockPrismaService.invitationToken.findUnique.mockResolvedValue({
        usedAt: new Date(),
      });

      await expect(service.completeInvitation(dto)).rejects.toThrow(BadRequestException);
      await expect(service.completeInvitation(dto)).rejects.toThrow(
        'この招待トークンは既に使用されています',
      );
    });

    it('期限切れのトークンの場合エラー', async () => {
      mockPrismaService.invitationToken.findUnique.mockResolvedValue({
        usedAt: null,
        expiresAt: new Date(Date.now() - 86400000), // 24時間前
        tenant: { isActive: true },
      });

      await expect(service.completeInvitation(dto)).rejects.toThrow(BadRequestException);
      await expect(service.completeInvitation(dto)).rejects.toThrow(
        '招待トークンの有効期限が切れています',
      );
    });
  });

  describe('listTenants', () => {
    it('全テナントの一覧を正常に取得', async () => {
      const mockTenants = [
        {
          id: 'tenant-1',
          name: 'Test Tenant 1',
          slug: 'test-tenant-1',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tenant-2',
          name: 'Test Tenant 2',
          slug: 'test-tenant-2',
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.tenant.findMany.mockResolvedValue(mockTenants);

      const result = await service.listTenants();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTenants);
      expect(result.count).toBe(2);
      expect(mockPrismaService.tenant.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('テナントが存在しない場合は空の配列を返す', async () => {
      mockPrismaService.tenant.findMany.mockResolvedValue([]);

      const result = await service.listTenants();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('createTenant', () => {
    it('明示的なスラッグでテナントを正常に作成', async () => {
      const dto: CreateTenantDto = {
        name: 'Test Tenant',
        slug: 'test-tenant',
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-1',
        name: dto.name,
        slug: dto.slug,
      });

      const result = await service.createTenant(dto);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tenant-1');
      expect(result.data.name).toBe(dto.name);
      expect(result.data.slug).toBe(dto.slug);
      expect(mockPrismaService.tenant.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          slug: dto.slug,
          isActive: true,
        },
      });
    });

    it('自動生成されたスラッグでテナントを正常に作成', async () => {
      const dto: CreateTenantDto = {
        name: 'My New Tenant',
        // slug は未指定
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-2',
        name: dto.name,
        slug: 'my-new-tenant',
      });

      const result = await service.createTenant(dto);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('tenant-2');
      expect(result.data.name).toBe(dto.name);
      expect(result.data.slug).toBe('my-new-tenant');
    });

    it('日本語のみのテナント名（スラッグ生成不可）の場合エラー', async () => {
      const dto: CreateTenantDto = {
        name: 'サンプルテナント',
        // slug は未指定 → 日本語から生成できない
      };

      await expect(service.createTenant(dto)).rejects.toThrow(BadRequestException);
      await expect(service.createTenant(dto)).rejects.toThrow(
        'テナント名からスラッグを生成できませんでした',
      );
    });

    it('スラッグが既に使用されている場合エラー', async () => {
      const dto: CreateTenantDto = {
        name: 'Another Tenant',
        slug: 'existing-slug',
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue({
        id: 'existing-tenant',
        slug: 'existing-slug',
      });

      await expect(service.createTenant(dto)).rejects.toThrow(ConflictException);
      await expect(service.createTenant(dto)).rejects.toThrow(
        'このスラッグは既に使用されています',
      );
    });

    it('レスポンス構造が正しい形式であること', async () => {
      const dto: CreateTenantDto = {
        name: 'Response Test',
        slug: 'response-test',
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(null);
      mockPrismaService.tenant.create.mockResolvedValue({
        id: 'tenant-3',
        name: dto.name,
        slug: dto.slug,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createTenant(dto);

      // レスポンス構造を検証
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('name');
      expect(result.data).toHaveProperty('slug');
      // 余分なプロパティは含まれないことを確認
      expect(Object.keys(result.data)).toHaveLength(3);
    });
  });

  describe('getTenantById', () => {
    const tenantId = 'tenant-1';

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

    it('SUPER_ADMIN は指定 ID のテナントを正常に取得できる', async () => {
      const mockTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 5 },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.getTenantById(tenantId, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTenant);
      expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      });
    });

    it('TENANT_ADMIN は自テナントの情報を取得できる', async () => {
      const mockTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { users: 3 },
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.getTenantById(tenantId, tenantAdminUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTenant);
    });

    it('TENANT_ADMIN は他のテナントの情報にはアクセスできない', async () => {
      await expect(
        service.getTenantById('tenant-2', tenantAdminUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getTenantById('tenant-2', tenantAdminUser),
      ).rejects.toThrow('他のテナントの情報にはアクセスできません');
    });

    it('テナントに所属していない TENANT_ADMIN はエラー', async () => {
      const noTenantAdminUser: RequestUser = {
        userId: 'tenant-admin-2',
        email: 'tenantadmin2@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: undefined,
      };

      await expect(
        service.getTenantById(tenantId, noTenantAdminUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.getTenantById(tenantId, noTenantAdminUser),
      ).rejects.toThrow('テナントに所属していません');
    });

    it('テナントが見つからない場合は NotFoundException をスロー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.getTenantById(tenantId, superAdminUser)).rejects.toThrow(NotFoundException);
      await expect(service.getTenantById(tenantId, superAdminUser)).rejects.toThrow('テナントが見つかりません');
    });
  });

  describe('updateTenant', () => {
    const tenantId = 'tenant-1';
    
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

    beforeEach(() => {
      mockPrismaService.tenant.findUnique.mockReset();
      mockPrismaService.tenant.update.mockReset();
    });

    it('SUPER_ADMIN がテナント名を正常に更新できる', async () => {
      const existingTenant = {
        id: tenantId,
        name: 'Original Name',
        slug: 'original-slug',
        isActive: true,
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(existingTenant);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existingTenant,
        name: 'Updated Name',
        updatedAt: new Date(),
      });

      const result = await service.updateTenant(tenantId, { name: 'Updated Name' }, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Updated Name');
      expect(mockPrismaService.tenant.update).toHaveBeenCalledWith({
        where: { id: tenantId },
        data: { name: 'Updated Name' },
        select: expect.any(Object),
      });
    });

    it('スラッグ変更時に重複チェックを行う', async () => {
      const existingTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
      };

      mockPrismaService.tenant.findUnique
        .mockResolvedValueOnce(existingTenant) // 対象テナント
        .mockResolvedValueOnce({ id: 'other-tenant', slug: 'new-slug' }); // 重複スラッグ

      await expect(
        service.updateTenant(tenantId, { slug: 'new-slug' }, superAdminUser)
      ).rejects.toThrow(ConflictException);
    });

    it('テナントが見つからない場合はエラー', async () => {
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTenant(tenantId, { name: 'Updated' }, superAdminUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('TENANT_ADMIN は更新できない', async () => {
      await expect(
        service.updateTenant(tenantId, { name: 'Updated' }, tenantAdminUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('isActive を false に更新できる', async () => {
      const existingTenant = {
        id: tenantId,
        name: 'Test Tenant',
        slug: 'test-tenant',
        isActive: true,
      };

      mockPrismaService.tenant.findUnique.mockResolvedValue(existingTenant);
      mockPrismaService.tenant.update.mockResolvedValue({
        ...existingTenant,
        isActive: false,
        updatedAt: new Date(),
      });

      const result = await service.updateTenant(tenantId, { isActive: false }, superAdminUser);

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
    });
  });
});
