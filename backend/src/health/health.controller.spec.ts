import { Test, TestingModule } from '@nestjs/testing';

import { RateLimiterService } from '../common/services/rate-limiter.service';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let rateLimiter: RateLimiterService;

  const mockRateLimiterService = {
    clearExpired: jest.fn(),
    resetByPrefix: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    rateLimiter = module.get<RateLimiterService>(RateLimiterService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check response', () => {
      const result = controller.check();

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('ok');
      expect(result.data.service).toBe('Cat Management System API');
      expect(result.data.timestamp).toBeDefined();
      expect(result.data.uptime).toBeDefined();
      expect(result.data.environment).toBeDefined();
      expect(rateLimiter.clearExpired).toHaveBeenCalled();
    });

    it('should reset rate limiter in test environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      controller.check();

      expect(rateLimiter.resetByPrefix).toHaveBeenCalledWith('register:');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not reset rate limiter in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      controller.check();

      expect(rateLimiter.resetByPrefix).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
