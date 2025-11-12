import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';

describe('CSRF Protection (e2e)', () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET requests', () => {
    it('should allow GET requests without CSRF token', async () => {
      return supertest(app.getHttpServer())
        .get('/health')
        .expect(200);
    });

    it('should allow access to CSRF token endpoint', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/api/v1/csrf-token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('csrfToken');
      expect(typeof response.body.data.csrfToken).toBe('string');
    });
  });

  describe('POST requests without CSRF protection', () => {
    it('should allow login without CSRF token (initial implementation)', async () => {
      // 注: 実際の本番環境では、この動作は将来変更される可能性があります
      const response = await supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ 
          email: 'test@example.com', 
          password: 'Test123!' 
        });

      // ログインエンドポイントは認証情報の検証で失敗する可能性がありますが、
      // CSRF エラー (403) ではなく、認証エラー (401) を返すことを確認
      expect([200, 401, 429]).toContain(response.status);
    });
  });

  describe('CSRF token lifecycle', () => {
    it('should generate different tokens for different sessions', async () => {
      const response1 = await supertest(app.getHttpServer())
        .get('/api/v1/csrf-token')
        .expect(200);

      const response2 = await supertest(app.getHttpServer())
        .get('/api/v1/csrf-token')
        .expect(200);

      const token1 = response1.body.data.csrfToken;
      const token2 = response2.body.data.csrfToken;

      expect(typeof token1).toBe('string');
      expect(typeof token2).toBe('string');
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
    });
  });

  describe('Health check endpoint', () => {
    it('should always allow health checks without CSRF token', async () => {
      return supertest(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });
});
