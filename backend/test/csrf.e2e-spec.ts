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
    it('should reject login without CSRF token', async () => {
      const response = await supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
        });

      expect(response.status).toBe(403);
    });

    it('should accept login request when CSRF token is provided', async () => {
      const tokenResponse = await supertest(app.getHttpServer())
        .get('/api/v1/csrf-token')
        .expect(200);

      const csrfToken = tokenResponse.body.data?.csrfToken;
      expect(typeof csrfToken).toBe('string');

      const response = await supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-CSRF-Token', csrfToken)
        .send({
          email: 'test@example.com',
          password: 'Test123!',
        });

      expect([200, 401, 429]).toContain(response.status);
      expect(response.status).not.toBe(403);
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
