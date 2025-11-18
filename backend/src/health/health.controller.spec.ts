import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
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
    });
  });
});
