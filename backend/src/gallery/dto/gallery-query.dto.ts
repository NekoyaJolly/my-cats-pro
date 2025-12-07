import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

import { GalleryCategoryDto } from './create-gallery-entry.dto';

/**
 * ギャラリー一覧取得用クエリ DTO
 */
export class GalleryQueryDto {
  @ApiPropertyOptional({ enum: GalleryCategoryDto, description: 'カテゴリフィルター' })
  @IsOptional()
  @IsEnum(GalleryCategoryDto)
  category?: GalleryCategoryDto;

  @ApiPropertyOptional({ default: 1, description: 'ページ番号' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, description: '1ページあたりの件数' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
