import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UserRole } from '@prisma/client';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './utils/create-test-app';

describe('Users promote-to-superadmin-once (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // テスト用のユニークなメールアドレス生成
  const testEmailPrefix = `promote_test_${Date.now()}`;
  const testEmail1 = `${testEmailPrefix}_1@example.com`;
  const testEmail2 = `${testEmailPrefix}_2@example.com`;
  const testPassword = 'SecurePass123!';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
    prisma = app.get<PrismaService>(PrismaService);

    // テスト前に既存の SUPER_ADMIN を削除（クリーン状態から開始）
    await prisma.user.updateMany({
      where: { role: UserRole.SUPER_ADMIN },
      data: { role: UserRole.USER },
    });
  });

  afterAll(async () => {
    // テストユーザーをクリーンアップ
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testEmail1, testEmail2],
        },
      },
    });

    await app.close();
  });

  describe('POST /api/v1/users/promote-to-superadmin-once', () => {
    it('未認証ユーザーはアクセスできない（401）', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/promote-to-superadmin-once')
        .expect(401);
    });

    it('SUPER_ADMIN が存在しない場合、認証済みユーザーは昇格できる', async () => {
      // ユーザー1を登録
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail1,
          password: testPassword,
        })
        .expect((res) => {
          if (![200, 201].includes(res.status)) {
            throw new Error(`Registration failed: ${res.status}`);
          }
        });

      // ユーザー1でログイン
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail1,
          password: testPassword,
        });

      const accessToken = loginResponse.body.data?.access_token;
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // 昇格リクエスト
      const promoteResponse = await request(app.getHttpServer())
        .post('/api/v1/users/promote-to-superadmin-once')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(promoteResponse.body.success).toBe(true);
      expect(promoteResponse.body.data.role).toBe(UserRole.SUPER_ADMIN);
      expect(promoteResponse.body.data.email).toBe(testEmail1);

      // DB でロールが更新されていることを確認
      const updatedUser = await prisma.user.findUnique({
        where: { email: testEmail1 },
      });
      expect(updatedUser?.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('SUPER_ADMIN が既に存在する場合、別のユーザーは昇格できない（403）', async () => {
      // ユーザー2を登録
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail2,
          password: testPassword,
        })
        .expect((res) => {
          if (![200, 201].includes(res.status)) {
            throw new Error(`Registration failed: ${res.status}`);
          }
        });

      // ユーザー2でログイン
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail2,
          password: testPassword,
        });

      const accessToken = loginResponse.body.data?.access_token;
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // 昇格リクエスト（すでに SUPER_ADMIN が存在するので 403）
      const promoteResponse = await request(app.getHttpServer())
        .post('/api/v1/users/promote-to-superadmin-once')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(promoteResponse.body.message).toContain('SUPER_ADMIN');
    });

    it('昇格済みユーザーは再度昇格リクエストを送ると 403 を受ける', async () => {
      // ユーザー1（すでに SUPER_ADMIN）でログイン
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail1,
          password: testPassword,
        });

      const accessToken = loginResponse.body.data?.access_token;
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // 再度昇格リクエスト（すでに SUPER_ADMIN が存在するので 403）
      await request(app.getHttpServer())
        .post('/api/v1/users/promote-to-superadmin-once')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('昇格後のユーザーは SUPER_ADMIN 専用 API にアクセスできる', async () => {
      // ユーザー1（SUPER_ADMIN）でログイン
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail1,
          password: testPassword,
        });

      const accessToken = loginResponse.body.data?.access_token;
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      // SUPER_ADMIN 専用のテナント一覧 API にアクセス
      const tenantsResponse = await request(app.getHttpServer())
        .get('/api/v1/tenants')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(tenantsResponse.body.success).toBe(true);
    });
  });
});
