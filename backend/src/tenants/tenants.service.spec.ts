import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from '../auth/password.service';

import { TenantsService } from './tenants.service';
import { InviteTenantAdminDto, InviteUserDto, CompleteInvitationDto } from './dto/invitation.dto';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: PrismaService;
  let passwordService: PasswordService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
      create: jest.fn(),
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
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
    prisma = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);

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
});
