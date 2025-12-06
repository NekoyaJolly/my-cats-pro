import { Module } from '@nestjs/common';

import { GalleryUploadModule } from '../gallery-upload/gallery-upload.module';
import { PrismaModule } from '../prisma/prisma.module';

import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

/**
 * ギャラリーモジュール
 * ギャラリーエントリの CRUD 機能を提供
 */
@Module({
  imports: [PrismaModule, GalleryUploadModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class GalleryModule {}
