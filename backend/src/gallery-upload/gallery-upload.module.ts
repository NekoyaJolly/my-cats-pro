import { Module } from '@nestjs/common';

import { GalleryUploadController } from './gallery-upload.controller';
import { GalleryUploadService } from './gallery-upload.service';

/**
 * ギャラリー画像アップロードモジュール
 * Google Cloud Storage を使用した画像アップロード機能を提供
 */
@Module({
  controllers: [GalleryUploadController],
  providers: [GalleryUploadService],
  exports: [GalleryUploadService],
})
export class GalleryUploadModule {}
