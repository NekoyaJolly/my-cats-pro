import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsObject,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

/** 印刷テンプレートカテゴリ */
export enum PrintTemplateCategory {
  PEDIGREE = 'PEDIGREE',
  KITTEN_TRANSFER = 'KITTEN_TRANSFER',
  HEALTH_CERTIFICATE = 'HEALTH_CERTIFICATE',
  VACCINATION_RECORD = 'VACCINATION_RECORD',
  BREEDING_RECORD = 'BREEDING_RECORD',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  CUSTOM = 'CUSTOM',
}

/** カテゴリの日本語ラベル */
export const PrintTemplateCategoryLabels: Record<PrintTemplateCategory, string> = {
  [PrintTemplateCategory.PEDIGREE]: '血統書',
  [PrintTemplateCategory.KITTEN_TRANSFER]: '子猫譲渡証明書',
  [PrintTemplateCategory.HEALTH_CERTIFICATE]: '健康診断書',
  [PrintTemplateCategory.VACCINATION_RECORD]: 'ワクチン接種記録',
  [PrintTemplateCategory.BREEDING_RECORD]: '繁殖記録',
  [PrintTemplateCategory.CONTRACT]: '契約書',
  [PrintTemplateCategory.INVOICE]: '請求書/領収書',
  [PrintTemplateCategory.CUSTOM]: 'カスタム書類',
};

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

  @IsEnum(PrintTemplateCategory)
  category: PrintTemplateCategory;

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
  @IsEnum(PrintTemplateCategory)
  category?: PrintTemplateCategory;

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
  @IsEnum(PrintTemplateCategory)
  category?: PrintTemplateCategory;

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

/** レスポンス型 */
export interface PrintTemplateResponse {
  id: string;
  tenantId: string | null;
  name: string;
  description: string | null;
  category: PrintTemplateCategory;
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
