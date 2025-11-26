import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * シードユーザーでのログイン確認E2Eテスト
 * 
 * このテストは、seed.ts で作成されたデフォルトのadminユーザーで
 * ログインできることを確認します。
 * 
 * 前提条件:
 * - データベースが初期化済み（migrate + seed実行済み）
 * - デフォルトシードユーザー: admin@example.com / Passw0rd!
 */
describe('Auth with Seed User (e2e)', () => {
  let app: INestApplication;

  // デフォルトのシードユーザー情報
  const SEED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
  const SEED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Passw0rd!';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login with seed user', () => {
    it('should login successfully with default seed admin user without CSRF token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: SEED_ADMIN_EMAIL,
          password: SEED_ADMIN_PASSWORD,
        });

      // CSRFトークンなしでログインできることを確認
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('user');
      
      const { user, access_token } = res.body.data;
      
      // トークンが存在することを確認
      expect(typeof access_token).toBe('string');
      expect(access_token.length).toBeGreaterThan(0);
      
      // ユーザー情報の確認
      expect(user.email).toBe(SEED_ADMIN_EMAIL.toLowerCase());
      expect(user.role).toBeDefined();
    });

    it('should access protected endpoints with JWT token from seed user login', async () => {
      // まずログインしてトークンを取得
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: SEED_ADMIN_EMAIL,
          password: SEED_ADMIN_PASSWORD,
        });

      expect(loginRes.status).toBe(201);
      const token = loginRes.body.data.access_token;
      expect(token).toBeDefined();

      // 保護されたエンドポイント（/api/v1/cats）にアクセス
      const protectedRes = await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${token}`);

      // 認証が成功し、リソースにアクセスできることを確認
      expect(protectedRes.status).toBe(200);
      expect(protectedRes.body).toHaveProperty('success');
    });

    it('should return 401 for login with incorrect password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: SEED_ADMIN_EMAIL,
          password: 'WrongPassword123!',
        });

      expect(res.status).toBe(401);
    });
  });
});
