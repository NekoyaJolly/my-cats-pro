import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { ImportController } from './import.controller';
import { ImportService } from './import.service';

/**
 * インポートモジュール
 * 
 * CSV ファイルからのデータインポート機能を提供します
 */
@Module({
  imports: [PrismaModule],
  controllers: [ImportController],
  providers: [ImportService],
  exports: [ImportService],
})
export class ImportModule {}
