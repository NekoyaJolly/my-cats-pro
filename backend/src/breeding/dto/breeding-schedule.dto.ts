/**
 * 交配スケジュール用 DTO
 */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

// Prisma の enum と同期
export enum BreedingScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * 交配スケジュール作成 DTO
 */
export class CreateBreedingScheduleDto {
  @ApiProperty({ description: 'オス猫ID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  maleId: string;

  @ApiProperty({ description: 'メス猫ID' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  femaleId: string;

  @ApiProperty({ description: '開始日 (ISO8601)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: '期間（日数）', minimum: 1, maximum: 14 })
  @IsInt()
  @Min(1)
  @Max(14)
  duration: number;

  @ApiPropertyOptional({ description: 'ステータス', enum: BreedingScheduleStatus })
  @IsOptional()
  @IsEnum(BreedingScheduleStatus)
  status?: BreedingScheduleStatus;

  @ApiPropertyOptional({ description: 'メモ' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 交配スケジュール更新 DTO
 */
export class UpdateBreedingScheduleDto extends PartialType(CreateBreedingScheduleDto) {}

/**
 * 交配スケジュールクエリ DTO
 */
export class BreedingScheduleQueryDto {
  @ApiPropertyOptional({ description: 'ページ番号', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '1ページあたりの件数', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: 'オス猫IDでフィルタ' })
  @IsOptional()
  @IsString()
  maleId?: string;

  @ApiPropertyOptional({ description: 'メス猫IDでフィルタ' })
  @IsOptional()
  @IsString()
  femaleId?: string;

  @ApiPropertyOptional({ description: 'ステータスでフィルタ', enum: BreedingScheduleStatus })
  @IsOptional()
  @IsEnum(BreedingScheduleStatus)
  status?: BreedingScheduleStatus;

  @ApiPropertyOptional({ description: '開始日（from）' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: '開始日（to）' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

/**
 * 交配チェック作成 DTO
 */
export class CreateMatingCheckDto {
  @ApiProperty({ description: 'チェック日 (ISO8601)' })
  @IsDateString()
  checkDate: string;

  @ApiPropertyOptional({ description: 'チェック回数', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count?: number;
}

/**
 * 交配チェック更新 DTO
 */
export class UpdateMatingCheckDto extends PartialType(CreateMatingCheckDto) {}

