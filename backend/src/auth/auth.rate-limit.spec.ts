import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule, ThrottlerStorage, ThrottlerStorageService } from '@nestjs/throttler';
import request from 'supertest';

import { EnhancedThrottlerGuard } from '../common/guards/enhanced-throttler.guard';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController rate limiting (integration)', () => {
  let app: INestApplication;
  let server: any;
  let storageService: ThrottlerStorageService;

  const expectSuccessStatus = (status: number) => {
    expect([HttpStatus.OK, HttpStatus.CREATED]).toContain(status);
  };

  const baseUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'USER' as const,
    firstName: 'Taro',
    lastName: 'Neko',
  };

  const mockAuthService: Record<string, jest.Mock> = {
    login: jest.fn(async (email: string) => ({
      success: true,
      data: {
        access_token: 'access-token',
        user: {
          ...baseUser,
          email,
        },
      },
    })),
    register: jest.fn(async () => ({
      success: true,
      data: { refresh_token: 'refresh-token' },
    })),
    getStoredRefreshToken: jest.fn(async () => 'stored-refresh-token'),
    refreshUsingToken: jest.fn(async () => ({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      user: baseUser,
    })),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
    setPassword: jest.fn(),
    logout: jest.fn(),
  };

  const resetStorage = () => {
    if (!storageService) return;
    const memoryStorage = storageService as unknown as {
      storage?: Record<string, { totalHits: number; expiresAt: number }>;
      timeoutIds?: NodeJS.Timeout[];
    };
    if (memoryStorage.storage) {
      Object.keys(memoryStorage.storage).forEach((key) => delete memoryStorage.storage?.[key]);
    }
    if (memoryStorage.timeoutIds) {
      while (memoryStorage.timeoutIds.length > 0) {
        const timeoutId = memoryStorage.timeoutIds.pop();
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    }
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        ThrottlerModule.forRoot({
          throttlers: [
            {
              name: 'default',
              ttl: 60_000,
              limit: 100,
            },
          ],
        }),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: APP_GUARD,
          useClass: EnhancedThrottlerGuard,
        },
        {
          provide: ThrottlerStorage,
          useFactory: () => {
            const storage: Record<string, any> = {};
            const timeoutIds: NodeJS.Timeout[] = [];
            const storageService = {
              get: async (key: string) => storage[key],
              set: async (key: string, value: any, ttl?: number) => {
                storage[key] = value;
                if (ttl) {
                  const id = setTimeout(() => delete storage[key], ttl);
                  timeoutIds.push(id);
                }
              },
              increment: async (key: string, ttl: number) => {
                const record = storage[key] || { totalHits: 0, expiresAt: Date.now() + ttl };
                record.totalHits += 1;
                storage[key] = record;
                const timeToExpire = Math.ceil((record.expiresAt - Date.now()) / 1000);
                return {
                  totalHits: record.totalHits,
                  timeToExpire: Math.max(0, timeToExpire),
                };
              },
              delete: async (key: string) => { delete storage[key]; },
              // expose internals for test helpers
              storage,
              timeoutIds,
            };
            return storageService;
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer();
    storageService = app.get(ThrottlerStorage) as ThrottlerStorageService;
  });

  afterEach(() => {
    jest.clearAllMocks();
    resetStorage();
  });

  afterAll(async () => {
    resetStorage();
    if (app) {
      await app.close();
    }
  });

  const pickHeader = (headers: Record<string, string | string[] | undefined>, key: string): string | undefined => (
    headers[key] ?? headers[`${key}-default`]
  ) as string | undefined;

  it('returns 429 with Japanese message and headers after exceeding login limit', async () => {
    for (let i = 0; i < 20; i += 1) {
      const response = await request(server)
        .post('/auth/login')
        .send({ email: 'limit-user@example.com', password: 'Password1!' });

      expectSuccessStatus(response.status);
    }

    const exceeded = await request(server)
      .post('/auth/login')
      .send({ email: 'limit-user@example.com', password: 'Password1!' });

    expect(exceeded.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(exceeded.body.message).toBe('リクエストが集中しています。しばらく待ってから再試行してください。');
    expect(pickHeader(exceeded.headers, 'x-ratelimit-limit')).toBe('20');
    expect(pickHeader(exceeded.headers, 'x-ratelimit-remaining')).toBe('0');
    expect(pickHeader(exceeded.headers, 'x-ratelimit-reset')).toBeDefined();
    expect(pickHeader(exceeded.headers, 'retry-after')).toBeDefined();
  });

  it('returns 429 with headers after exceeding register limit', async () => {
    for (let i = 0; i < 5; i += 1) {
      const response = await request(server)
        .post('/auth/register')
        .send({ email: `tester_${i}@example.com`, password: 'Password1!' });

      expectSuccessStatus(response.status);
    }

    const exceeded = await request(server)
      .post('/auth/register')
      .send({ email: 'tester_9@example.com', password: 'Password1!' });

    expect(exceeded.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(exceeded.body.message).toBe('リクエストが集中しています。しばらく待ってから再試行してください。');
    expect(pickHeader(exceeded.headers, 'x-ratelimit-limit')).toBe('5');
    expect(pickHeader(exceeded.headers, 'x-ratelimit-remaining')).toBe('0');
    expect(pickHeader(exceeded.headers, 'x-ratelimit-reset')).toBeDefined();
    expect(pickHeader(exceeded.headers, 'retry-after')).toBeDefined();
  });
});
