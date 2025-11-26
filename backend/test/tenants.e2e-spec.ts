import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserRole } from '@prisma/client';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenants (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAdminToken: string;
  let tenantAdminToken: string;
  let createdTenantId: string;
  let invitationToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // テストデータのクリーンアップ
    await prisma.invitationToken.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'superadmin@test.com',
            'tenantadmin@test.com',
            'newuser@test.com',
          ],
        },
      },
    });
    await prisma.tenant.deleteMany({
      where: {
        slug: {
          in: ['test-tenant', 'test-tenant-2'],
        },
      },
    });

    // SuperAdmin ユーザーを作成
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@test.com',
        clerkId: 'test_superadmin',
        role: UserRole.SUPER_ADMIN,
        passwordHash: '$2a$10$TEST_HASH', // ダミーハッシュ
        isActive: true,
      },
    });

    // SuperAdmin としてログイン（簡易的なトークン生成）
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'superadmin2@test.com',
        password: 'SuperSecure123!',
      });

    // 作成したユーザーのロールを SUPER_ADMIN に変更
    await prisma.user.update({
      where: { email: 'superadmin2@test.com' },
      data: { role: UserRole.SUPER_ADMIN },
    });

    // 再度ログイン
    const loginResponse2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'superadmin2@test.com',
        password: 'SuperSecure123!',
      });

    superAdminToken = loginResponse2.body.data.access_token;
  });

  afterAll(async () => {
    // クリーンアップ
    await prisma.invitationToken.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'superadmin@test.com',
            'superadmin2@test.com',
            'tenantadmin@test.com',
            'newuser@test.com',
          ],
        },
      },
    });
    await prisma.tenant.deleteMany({
      where: {
        slug: {
          in: ['test-tenant', 'test-tenant-2'],
        },
      },
    });

    await app.close();
  });

  describe('POST /tenants/invite-admin', () => {
    it('SUPER_ADMIN がテナント管理者を招待できる', async () => {
      const response = await request(app.getHttpServer())
        .post('/tenants/invite-admin')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'tenantadmin@test.com',
          tenantName: 'Test Tenant',
          tenantSlug: 'test-tenant',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.tenantId).toBeDefined();
      expect(response.body.invitationToken).toBeDefined();

      createdTenantId = response.body.tenantId;
      invitationToken = response.body.invitationToken;
    });

    it('認証なしではアクセスできない', async () => {
      await request(app.getHttpServer())
        .post('/tenants/invite-admin')
        .send({
          email: 'test@test.com',
          tenantName: 'Test',
        })
        .expect(401);
    });
  });

  describe('POST /tenants/complete-invitation', () => {
    it('招待トークンでユーザー登録を完了できる', async () => {
      const response = await request(app.getHttpServer())
        .post('/tenants/complete-invitation')
        .send({
          token: invitationToken,
          password: 'SecurePassword123!',
          firstName: 'Tenant',
          lastName: 'Admin',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeDefined();
      expect(response.body.tenantId).toBe(createdTenantId);

      // 作成されたユーザーを確認
      const user = await prisma.user.findUnique({
        where: { email: 'tenantadmin@test.com' },
      });

      expect(user).toBeDefined();
      expect(user!.role).toBe(UserRole.TENANT_ADMIN);
      expect(user!.tenantId).toBe(createdTenantId);
    });

    it('無効なトークンではエラー', async () => {
      await request(app.getHttpServer())
        .post('/tenants/complete-invitation')
        .send({
          token: 'invalid-token',
          password: 'SecurePassword123!',
        })
        .expect(400);
    });

    it('既に使用済みのトークンではエラー', async () => {
      await request(app.getHttpServer())
        .post('/tenants/complete-invitation')
        .send({
          token: invitationToken,
          password: 'SecurePassword123!',
        })
        .expect(400);
    });
  });

  describe('POST /tenants/:tenantId/users/invite', () => {
    beforeAll(async () => {
      // TENANT_ADMIN でログイン
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'tenantadmin@test.com',
          password: 'SecurePassword123!',
        });

      tenantAdminToken = loginResponse.body.data.access_token;
    });

    it('TENANT_ADMIN が自分のテナントにユーザーを招待できる', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tenants/${createdTenantId}/users/invite`)
        .set('Authorization', `Bearer ${tenantAdminToken}`)
        .send({
          email: 'newuser@test.com',
          role: UserRole.USER,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.invitationToken).toBeDefined();
    });

    it('他のテナントには招待できない', async () => {
      // 別のテナントを作成
      const anotherTenant = await prisma.tenant.create({
        data: {
          name: 'Another Tenant',
          slug: 'test-tenant-2',
        },
      });

      await request(app.getHttpServer())
        .post(`/tenants/${anotherTenant.id}/users/invite`)
        .set('Authorization', `Bearer ${tenantAdminToken}`)
        .send({
          email: 'user@test.com',
          role: UserRole.USER,
        })
        .expect(403);
    });
  });
});
