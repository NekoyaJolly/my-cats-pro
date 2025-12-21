import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';

/**
 * テナント管理モジュール
 * 
 * マルチテナント環境でのテナント作成とユーザー招待機能を提供します。
 */
@Module({
  imports: [PrismaModule, AuthModule, EmailModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
