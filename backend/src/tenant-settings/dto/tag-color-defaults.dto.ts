import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * カラー設定（背景色とテキスト色）
 */
export class ColorSettingDto {
  @ApiProperty({
    description: '背景カラー（16進数カラーコード）',
    example: '#6366F1',
  })
  @IsHexColor()
  color: string;

  @ApiProperty({
    description: 'テキストカラー（16進数カラーコード）',
    example: '#111827',
  })
  @IsHexColor()
  textColor: string;
}

/**
 * カラー設定（部分更新用）
 */
export class PartialColorSettingDto {
  @ApiProperty({
    description: '背景カラー（16進数カラーコード）',
    example: '#6366F1',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiProperty({
    description: 'テキストカラー（16進数カラーコード）',
    example: '#111827',
    required: false,
  })
  @IsOptional()
  @IsHexColor()
  textColor?: string;
}

/**
 * タグカラーデフォルト設定DTO
 */
export class TagColorDefaultsDto {
  @ApiProperty({
    description: 'カテゴリのデフォルトカラー設定',
    type: ColorSettingDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSettingDto)
  category?: ColorSettingDto;

  @ApiProperty({
    description: 'グループのデフォルトカラー設定',
    type: ColorSettingDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSettingDto)
  group?: ColorSettingDto;

  @ApiProperty({
    description: 'タグのデフォルトカラー設定',
    type: ColorSettingDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorSettingDto)
  tag?: ColorSettingDto;
}

/**
 * タグカラーデフォルト設定更新DTO
 * 部分更新をサポート
 */
export class UpdateTagColorDefaultsDto {
  @ApiProperty({
    description: 'カテゴリのデフォルトカラー設定（部分更新可能）',
    type: PartialColorSettingDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialColorSettingDto)
  category?: PartialColorSettingDto;

  @ApiProperty({
    description: 'グループのデフォルトカラー設定（部分更新可能）',
    type: PartialColorSettingDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialColorSettingDto)
  group?: PartialColorSettingDto;

  @ApiProperty({
    description: 'タグのデフォルトカラー設定（部分更新可能）',
    type: PartialColorSettingDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialColorSettingDto)
  tag?: PartialColorSettingDto;
}
