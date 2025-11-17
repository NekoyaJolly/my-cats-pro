import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, MiddlewareConsumer, Module, NestModule, ValidationPipe, Controller, Get, Post, RequestMethod } from '@nestjs/common';
import supertest, { SuperAgentTest } from 'supertest';
import { CSRF_COOKIE_NAME } from '../src/common/middleware/csrf.middleware';
import { CsrfController } from '../src/common/controllers/csrf.controller';
import { CsrfTokenService } from '../src/common/services/csrf-token.service';
import { CsrfMiddleware } from '../src/common/middleware/csrf.middleware';
import { CookieParserMiddleware } from '../src/common/middleware/cookie-parser.middleware';

@Controller('protected')
class ProtectedController {
  @Post('echo')
  postEcho() {
    return {
      success: true,
    };
  }
}

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}

@Module({
  controllers: [CsrfController, ProtectedController, HealthController],
  providers: [CsrfTokenService, CsrfMiddleware],
})
class CsrfTestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CookieParserMiddleware, CsrfMiddleware).forRoutes('*');
  }
}

const API_PREFIX = '/api/v1';
const CSRF_ENDPOINT = `${API_PREFIX}/csrf-token`;
const PROTECTED_ENDPOINT = `${API_PREFIX}/protected/echo`;
const HEALTH_ENDPOINT = '/health';

describe('CSRF Protection (e2e)', () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CsrfTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.setGlobalPrefix('api/v1', {
      exclude: [{ path: 'health', method: RequestMethod.ALL }],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    agent = supertest.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET requests', () => {
    it('should allow GET requests without CSRF token', async () => {
      return supertest(app.getHttpServer())
        .get(HEALTH_ENDPOINT)
        .expect(200);
    });

    it('should allow access to CSRF token endpoint', async () => {
      const response = await supertest(app.getHttpServer())
        .get(CSRF_ENDPOINT)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('csrfToken');
      expect(typeof response.body.data.csrfToken).toBe('string');
    });
  });

  describe('POST requests without CSRF protection', () => {
    it('should reject protected POST without CSRF token', async () => {
      const response = await supertest(app.getHttpServer())
        .post(PROTECTED_ENDPOINT)
        .send({});

      expect(response.status).toBe(403);
    });

    it('should accept protected POST when CSRF token is provided', async () => {
      const tokenResponse = await agent
        .get(CSRF_ENDPOINT)
        .expect(200);

      const csrfToken = tokenResponse.body.data?.csrfToken;
      expect(typeof csrfToken).toBe('string');

      const response = await agent
        .post(PROTECTED_ENDPOINT)
        .set('X-CSRF-Token', csrfToken)
        .send({});

      expect(response.status).toBe(201);
    });
  });

  describe('CSRF token lifecycle', () => {
    it('should generate different tokens for different sessions', async () => {
      const response1 = await agent
        .get(CSRF_ENDPOINT)
        .expect(200);

      const response2 = await agent
        .get(CSRF_ENDPOINT)
        .expect(200);

      const token1 = response1.body.data.csrfToken;
      const token2 = response2.body.data.csrfToken;

      expect(typeof token1).toBe('string');
      expect(typeof token2).toBe('string');
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
      expect(token1).not.toEqual(token2);
    });
  });

  describe('Health check endpoint', () => {
    it('should always allow health checks without CSRF token', async () => {
      return supertest(app.getHttpServer())
        .get(HEALTH_ENDPOINT)
        .expect(200);
    });
  });

  describe('CSRF cookie attributes', () => {
    it('should issue an HttpOnly, SameSite=Strict cookie when issuing tokens', async () => {
      const response = await supertest(app.getHttpServer())
        .get(CSRF_ENDPOINT)
        .expect(200);

      const setCookieHeader = response.get('Set-Cookie');
      expect(Array.isArray(setCookieHeader)).toBe(true);
      const csrfCookie = setCookieHeader?.find((cookie) => cookie.includes(CSRF_COOKIE_NAME));
      expect(csrfCookie).toBeDefined();
      expect(csrfCookie).toContain('HttpOnly');
      expect(csrfCookie).toContain('SameSite=Strict');
    });
  });
});
