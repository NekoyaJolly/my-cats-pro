import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, IsNumber, Min, Max } from 'class-validator';

/**
 * アップロード用 Signed URL 生成リクエスト DTO
 */
export class GenerateUploadUrlDto {
  @ApiProperty({ description: 'ファイル名', example: 'kitten-photo-1.jpg' })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'コンテンツタイプ',
    enum: ['image/jpeg', 'image/png', 'image/webp'],
    example: 'image/jpeg',
  })
  @IsIn(['image/jpeg', 'image/png', 'image/webp'], {
    message: '対応形式は JPEG, PNG, WebP のみです',
  })
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';

  @ApiProperty({
    description: 'ファイルサイズ（バイト）',
    example: 1024000,
    minimum: 1,
    maximum: 10485760,
  })
  @IsNumber()
  @Min(1, { message: 'ファイルサイズは1バイト以上である必要があります' })
  @Max(10 * 1024 * 1024, { message: 'ファイルサイズは10MB以下である必要があります' })
  fileSize: number;
}
