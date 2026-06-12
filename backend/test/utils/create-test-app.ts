import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import helmet from 'helmet';

import { TransformResponseInterceptor } from '../../src/common/interceptors/transform-response.interceptor';
import { PerformanceMonitoringInterceptor } from '../../src/common/interceptors/performance-monitoring.interceptor';
import { EnhancedGlobalExceptionFilter } from '../../src/common/filters/enhanced-global-exception.filter';

export async function createTestApp(moduleRef: TestingModule): Promise<INestApplication> {
  const app = moduleRef.createNestApplication();

  // 本番（main.ts）と同じセキュリティミドルウェア構成に揃える
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(
    new TransformResponseInterceptor(),
    new PerformanceMonitoringInterceptor(),
  );

  app.useGlobalFilters(new EnhancedGlobalExceptionFilter());

  app.setGlobalPrefix('api/v1');

  await app.init();

  return app;
}
