import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from 'nestjs-pino';

import { AuthModule } from "./auth/auth.module";
import { BreedingModule } from "./breeding/breeding.module";
import { BreedsModule } from "./breeds/breeds.module";
import { CareModule } from "./care/care.module";
import { CatsModule } from "./cats/cats.module";
import { CoatColorsModule } from "./coat-colors/coat-colors.module";
import { envSchema } from "./common/config/env.validation";
import { MasterDataController } from "./common/controllers/master-data.controller";
import { EnhancedThrottlerGuard } from "./common/guards/enhanced-throttler.guard";
import { CookieParserMiddleware } from "./common/middleware/cookie-parser.middleware";
import { CorsMiddleware } from "./common/middleware/cors.middleware";
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { DisplayPreferencesModule } from "./display-preferences/display-preferences.module";
import { GraduationModule } from "./graduation/graduation.module";
import { HealthModule } from "./health/health.module";
import { PedigreeModule } from "./pedigree/pedigree.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { ShiftModule } from './shift/shift.module';
import { StaffModule } from './staff/staff.module';
import { TagsModule } from "./tags/tags.module";
import { TenantsModule } from "./tenants/tenants.module";
import { UploadModule } from "./upload/upload.module";
import { UsersModule } from "./users/users.module";

type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

const ALLOWED_LEVELS: readonly LogLevel[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

const sanitizeBindings = (input: unknown): { pid?: number; host?: string } => {
  if (!input || typeof input !== "object") {
    return {};
  }

  const record = input as Record<string, unknown>;
  const pid = typeof record.pid === "number" ? record.pid : undefined;
  const hostname = typeof record.hostname === "string" ? record.hostname : undefined;

  return {
    ...(pid !== undefined ? { pid } : {}),
    ...(hostname ? { host: hostname } : {}),
  };
};

const sanitizeLevel = (value: unknown): LogLevel => {
  if (typeof value === "string" && (ALLOWED_LEVELS as readonly string[]).includes(value)) {
    return value as LogLevel;
  }
  return 'info';
};

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        transport: process.env.NODE_ENV === 'production' ? undefined : {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true },
        },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        formatters: {
          bindings: (value) => sanitizeBindings(value),
          level: (label) => ({ level: sanitizeLevel(label) }),
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    EventEmitterModule.forRoot({
      // イベントの非同期処理を有効化
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute in milliseconds
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    CatsModule,
    PedigreeModule,
    BreedsModule,
    CoatColorsModule,
  BreedingModule,
  DisplayPreferencesModule,
    CareModule,
    ScheduleModule,
    UploadModule,
    TagsModule,
    HealthModule,
    StaffModule,
    ShiftModule,
    GraduationModule,
  ],
  controllers: [MasterDataController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: EnhancedThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware, RequestIdMiddleware, SecurityMiddleware, CookieParserMiddleware)
      .forRoutes('*');
  }
}
