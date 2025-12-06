import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

/**
 * アップロード完了確認リクエスト DTO
 */
export class ConfirmUploadDto {
  @ApiProperty({
    description: 'アップロード時に発行されたファイルキー',
    example: 'gallery/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  @IsString()
  fileKey: string;

  @ApiProperty({
    description: '紐付けるギャラリーエントリID（任意）',
    required: false,
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: '有効なUUIDを指定してください' })
  galleryEntryId?: string;
}
