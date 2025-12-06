import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { GenerateUploadUrlDto, ConfirmUploadDto } from './dto';
import { GalleryUploadService } from './gallery-upload.service';

/**
 * ギャラリー画像アップロード用コントローラー
 * Signed URL 方式でクライアントから直接 GCS へアップロードを行う
 */
@ApiTags('Gallery Upload')
@Controller('gallery/upload')
export class GalleryUploadController {
  constructor(private readonly uploadService: GalleryUploadService) {}

  /**
   * アップロード用 Signed URL を生成
   */
  @Post('signed-url')
  @ApiOperation({
    summary: 'アップロード用Signed URLを生成',
    description: 'クライアントがGCSへ直接アップロードするためのSigned URLを発行します。有効期限は15分です。',
  })
  @ApiResponse({
    status: 201,
    description: 'Signed URL生成成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            uploadUrl: { type: 'string', description: 'アップロード用Signed URL' },
            fileKey: { type: 'string', description: 'GCS内のファイルキー' },
            publicUrl: { type: 'string', description: 'アップロード後の公開URL' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'パラメータエラー' })
  async generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    const result = await this.uploadService.generateUploadUrl(dto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * アップロード完了を確認
   */
  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'アップロード完了を確認',
    description: 'クライアントがGCSへアップロード完了後に呼び出し、ファイルの存在を確認します。',
  })
  @ApiResponse({
    status: 200,
    description: '確認成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            url: { type: 'string', description: 'ファイルの公開URL' },
            size: { type: 'number', description: 'ファイルサイズ（バイト）' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'ファイルが見つからない' })
  async confirmUpload(@Body() dto: ConfirmUploadDto) {
    const result = await this.uploadService.confirmUpload(dto.fileKey);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * アップロード済みファイルを削除
   */
  @Delete(':fileKey')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'アップロード済みファイルを削除',
    description: '指定されたファイルキーのファイルをGCSから削除します。',
  })
  @ApiParam({
    name: 'fileKey',
    description: '削除するファイルのキー（URLエンコード済み）',
    example: 'gallery%2F550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  @ApiResponse({ status: 200, description: '削除成功' })
  async deleteFile(@Param('fileKey') fileKey: string) {
    await this.uploadService.deleteFile(decodeURIComponent(fileKey));
    return {
      success: true,
      message: 'ファイルを削除しました',
    };
  }
}
