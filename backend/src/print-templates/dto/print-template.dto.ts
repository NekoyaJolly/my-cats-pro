import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';

// ==========================================
// カテゴリ DTO
// ==========================================

/** デフォルトフィールド定義 */
export class DefaultFieldDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  dataSourceType?: string;

  @IsOptional()
  @IsString()
  dataSourceField?: string;
}

/** カテゴリ作成DTO */
export class CreatePrintDocCategoryDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultFieldDto)
  defaultFields?: DefaultFieldDto[];

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

/** カテゴリ更新DTO */
export class UpdatePrintDocCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DefaultFieldDto)
  defaultFields?: DefaultFieldDto[];

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/** カテゴリレスポンス型 */
export interface PrintDocCategoryResponse {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  description: string | null;
  defaultFields: DefaultFieldDto[] | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// テンプレート DTO
// ==========================================

/** テンプレート作成DTO */
export class CreatePrintTemplateDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsInt()
  @Min(50)
  @Max(500)
  paperWidth: number; // mm単位

  @IsInt()
  @Min(50)
  @Max(500)
  paperHeight: number; // mm単位

  @IsOptional()
  @IsString()
  backgroundUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  backgroundOpacity?: number;

  @IsObject()
  positions: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fontSizes?: Record<string, number>;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

/** テンプレート更新DTO */
export class UpdatePrintTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(500)
  paperWidth?: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(500)
  paperHeight?: number;

  @IsOptional()
  @IsString()
  backgroundUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  backgroundOpacity?: number;

  @IsOptional()
  @IsObject()
  positions?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  fontSizes?: Record<string, number>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;
}

/** クエリパラメータDTO */
export class QueryPrintTemplatesDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeGlobal?: boolean; // テナント指定時、共通テンプレートも含めるか
}

/** テンプレート複製DTO */
export class DuplicatePrintTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}

/** テンプレートレスポンス型 */
export interface PrintTemplateResponse {
  id: string;
  tenantId: string | null;
  name: string;
  description: string | null;
  category: string;
  categoryId: string | null;
  paperWidth: number;
  paperHeight: number;
  backgroundUrl: string | null;
  backgroundOpacity: number;
  positions: Record<string, unknown>;
  fontSizes: Record<string, number> | null;
  isActive: boolean;
  isDefault: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// データソース定義
// ==========================================

/** データソースフィールド情報 */
export interface DataSourceFieldInfo {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
}

/** データソース情報 */
export interface DataSourceInfo {
  type: string;
  label: string;
  description: string;
  fields: DataSourceFieldInfo[];
}
