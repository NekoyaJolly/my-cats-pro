import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';

export enum ExportDataType {
  CATS = 'cats',
  PEDIGREES = 'pedigrees',
  MEDICAL_RECORDS = 'medical_records',
  CARE_SCHEDULES = 'care_schedules',
  TAGS = 'tags',
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
}

export class ExportRequestDto {
  @ApiProperty({ enum: ExportDataType, description: 'エクスポート対象データ種別' })
  @IsEnum(ExportDataType)
  dataType: ExportDataType;

  @ApiProperty({ enum: ExportFormat, description: 'エクスポート形式', default: ExportFormat.CSV })
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @ApiProperty({ description: '開始日（フィルタ用）', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: '終了日（フィルタ用）', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: '対象IDリスト（特定データのみエクスポート）', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  ids?: string[];
}
