import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';

/**
 * ギャラリーカテゴリ
 */
export enum GalleryCategoryDto {
  KITTEN = 'KITTEN',
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GRADUATION = 'GRADUATION',
}

/**
 * メディアタイプ
 */
export enum MediaTypeDto {
  IMAGE = 'IMAGE',
  YOUTUBE = 'YOUTUBE',
}

/**
 * メディア作成 DTO
 */
export class CreateMediaDto {
  @ApiProperty({ enum: MediaTypeDto, description: 'メディアタイプ' })
  @IsEnum(MediaTypeDto)
  type: MediaTypeDto;

  @ApiProperty({ description: 'メディアURL' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'サムネイルURL（YouTube用）' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: '表示順序' })
  @IsOptional()
  order?: number;
}

/**
 * ギャラリーエントリ作成 DTO
 */
export class CreateGalleryEntryDto {
  @ApiProperty({ enum: GalleryCategoryDto, description: 'カテゴリ' })
  @IsEnum(GalleryCategoryDto)
  category: GalleryCategoryDto;

  @ApiProperty({ description: '猫の名前' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '性別',
    enum: ['MALE', 'FEMALE', 'NEUTER', 'SPAY'],
  })
  @IsEnum(['MALE', 'FEMALE', 'NEUTER', 'SPAY'])
  gender: string;

  @ApiPropertyOptional({ description: '毛色' })
  @IsOptional()
  @IsString()
  coatColor?: string;

  @ApiPropertyOptional({ description: '品種' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ description: '在舎猫ID（参照用）' })
  @IsOptional()
  @IsUUID()
  catId?: string;

  @ApiPropertyOptional({ description: '譲渡日（卒業猫用）' })
  @IsOptional()
  @IsDateString()
  transferDate?: string;

  @ApiPropertyOptional({ description: '譲渡先（卒業猫用）' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ description: '外部リンク（卒業猫用）' })
  @IsOptional()
  @IsString()
  externalLink?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'メディア（画像・動画）',
    type: [CreateMediaDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[];
}
