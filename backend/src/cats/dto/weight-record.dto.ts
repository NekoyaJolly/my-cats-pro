import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
} from "class-validator";

/**
 * 体重記録作成 DTO
 */
export class CreateWeightRecordDto {
  @ApiProperty({
    description: "体重（グラム単位）",
    example: 350,
    minimum: 1,
    maximum: 50000,
  })
  @IsNumber()
  @Min(1, { message: "体重は1g以上で入力してください" })
  @Max(50000, { message: "体重は50000g以下で入力してください" })
  @Type(() => Number)
  weight!: number;

  @ApiPropertyOptional({
    description: "記録日時（省略時は現在日時）",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString({}, { message: "記録日時は有効な日付形式で入力してください" })
  recordedAt?: string;

  @ApiPropertyOptional({
    description: "メモ",
    example: "ミルクをよく飲んでいる",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 体重記録更新 DTO
 */
export class UpdateWeightRecordDto {
  @ApiPropertyOptional({
    description: "体重（グラム単位）",
    example: 380,
    minimum: 1,
    maximum: 50000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: "体重は1g以上で入力してください" })
  @Max(50000, { message: "体重は50000g以下で入力してください" })
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({
    description: "記録日時",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString({}, { message: "記録日時は有効な日付形式で入力してください" })
  recordedAt?: string;

  @ApiPropertyOptional({
    description: "メモ",
    example: "順調に成長中",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 体重記録クエリ DTO
 */
export class WeightRecordQueryDto {
  @ApiPropertyOptional({
    description: "ページ番号",
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: "1ページあたりの件数",
    example: 50,
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: "開始日（この日以降の記録を取得）",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString({}, { message: "開始日は有効な日付形式で入力してください" })
  startDate?: string;

  @ApiPropertyOptional({
    description: "終了日（この日以前の記録を取得）",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString({}, { message: "終了日は有効な日付形式で入力してください" })
  endDate?: string;

  @ApiPropertyOptional({
    description: "ソート順",
    example: "desc",
    default: "desc",
  })
  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

/**
 * 一括体重記録の個別レコード DTO
 */
export class BulkWeightRecordItemDto {
  @ApiProperty({
    description: "猫ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID("4", { message: "猫IDは有効なUUID形式で入力してください" })
  catId!: string;

  @ApiProperty({
    description: "体重（グラム単位）",
    example: 350,
    minimum: 1,
    maximum: 50000,
  })
  @IsNumber()
  @Min(1, { message: "体重は1g以上で入力してください" })
  @Max(50000, { message: "体重は50000g以下で入力してください" })
  @Type(() => Number)
  weight!: number;

  @ApiPropertyOptional({
    description: "メモ",
    example: "元気",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 一括体重記録作成 DTO
 */
export class CreateBulkWeightRecordsDto {
  @ApiProperty({
    description: "記録日時（全レコード共通）",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsDateString({}, { message: "記録日時は有効な日付形式で入力してください" })
  recordedAt!: string;

  @ApiProperty({
    description: "体重記録の配列",
    type: [BulkWeightRecordItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: "少なくとも1件の体重記録が必要です" })
  @ValidateNested({ each: true })
  @Type(() => BulkWeightRecordItemDto)
  records!: BulkWeightRecordItemDto[];
}

/**
 * 一括体重記録レスポンス型
 */
export interface BulkWeightRecordsResponse {
  success: boolean;
  created: number;
  records: WeightRecordResponse[];
}

/**
 * 体重記録レスポンス型（型定義のみ、バリデーションなし）
 */
export interface WeightRecordResponse {
  id: string;
  catId: string;
  weight: number;
  recordedAt: string;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  recorder?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

/**
 * 体重記録一覧レスポンス型
 */
export interface WeightRecordsListResponse {
  data: WeightRecordResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary?: {
    latestWeight: number | null;
    previousWeight: number | null;
    weightChange: number | null;
    latestRecordedAt: string | null;
    recordCount: number;
  };
}

