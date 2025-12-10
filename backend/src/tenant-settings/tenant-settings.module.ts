import { Module } from '@nestjs/common';
import { TenantSettingsController } from './tenant-settings.controller';
import { TenantSettingsService } from './tenant-settings.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * テナント設定モジュール
 * 
 * テナント単位の各種設定を管理する機能を提供します。
 */
@Module({
  imports: [PrismaModule],
  controllers: [TenantSettingsController],
  providers: [TenantSettingsService],
  exports: [TenantSettingsService],
})
export class TenantSettingsModule {}
