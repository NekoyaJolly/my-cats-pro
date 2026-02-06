This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: backend/prisma/schema.prisma, backend/src/breeding/**, backend/src/graduation/**, frontend/src/app/breeding/**, frontend/src/app/kittens/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
backend/
  prisma/
    schema.prisma
  src/
    breeding/
      dto/
        birth-plan.dto.ts
        breeding-query.dto.ts
        breeding-schedule.dto.ts
        create-breeding-ng-rule.dto.ts
        create-breeding.dto.ts
        index.ts
        kitten-disposition.dto.ts
        pregnancy-check.dto.ts
        update-breeding-ng-rule.dto.ts
        update-breeding.dto.ts
      types/
        breeding.types.ts
      breeding.controller.spec.ts
      breeding.controller.ts
      breeding.module.ts
      breeding.service.spec.ts
      breeding.service.ts
    graduation/
      dto/
        index.ts
        transfer-cat.dto.ts
      graduation.controller.spec.ts
      graduation.controller.ts
      graduation.module.ts
      graduation.service.spec.ts
      graduation.service.ts
frontend/
  src/
    app/
      breeding/
        components/
          BirthInfoModal.tsx
          BirthPlanTab.tsx
          BreedingScheduleTab.tsx
          CompleteConfirmModal.tsx
          FemaleSelectionModal.tsx
          index.ts
          MaleSelectionModal.tsx
          NewRuleModal.tsx
          NgRulesModal.tsx
          PregnancyCheckTab.tsx
          RaisingTab.tsx
          ShippingTab.tsx
          WeightTab.tsx
        hooks/
          index.ts
          useBreedingSchedule.ts
          useNgPairing.ts
        page.tsx
        types.ts
        utils.ts
      kittens/
        page.tsx
```

# Files

## File: backend/src/breeding/dto/birth-plan.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BirthStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsDateString, IsUUID, IsInt, Min } from "class-validator";

export class CreateBirthPlanDto {
  @ApiProperty({ description: "出産予定の母親猫ID" })
  @IsUUID()
  motherId: string;

  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsUUID()
  fatherId?: string;

  @ApiPropertyOptional({ description: "交配日" })
  @IsOptional()
  @IsDateString()
  matingDate?: string;

  @ApiProperty({ description: "出産予定日" })
  @IsDateString()
  expectedBirthDate: string;

  @ApiPropertyOptional({ description: "実際の出産日" })
  @IsOptional()
  @IsDateString()
  actualBirthDate?: string;

  @ApiProperty({ description: "出産状態", enum: BirthStatus })
  @IsEnum(BirthStatus)
  status: BirthStatus;

  @ApiPropertyOptional({ description: "予想される子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedKittens?: number;

  @ApiPropertyOptional({ description: "実際の子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualKittens?: number;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBirthPlanDto {
  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsUUID()
  fatherId?: string;

  @ApiPropertyOptional({ description: "交配日" })
  @IsOptional()
  @IsDateString()
  matingDate?: string;

  @ApiPropertyOptional({ description: "出産予定日" })
  @IsOptional()
  @IsDateString()
  expectedBirthDate?: string;

  @ApiPropertyOptional({ description: "実際の出産日" })
  @IsOptional()
  @IsDateString()
  actualBirthDate?: string;

  @ApiPropertyOptional({ description: "出産状態", enum: BirthStatus })
  @IsOptional()
  @IsEnum(BirthStatus)
  status?: BirthStatus;

  @ApiPropertyOptional({ description: "予想される子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedKittens?: number;

  @ApiPropertyOptional({ description: "実際の子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualKittens?: number;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BirthPlanQueryDto {
  @ApiPropertyOptional({ description: "母親の猫ID" })
  @IsOptional()
  @IsUUID()
  motherId?: string;

  @ApiPropertyOptional({ description: "出産状態", enum: BirthStatus })
  @IsOptional()
  @IsEnum(BirthStatus)
  status?: BirthStatus;

  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
```

## File: backend/src/breeding/dto/breeding-query.dto.ts
```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";

export class BreedingQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ description: "メス猫ID" })
  @IsOptional()
  @IsUUID()
  femaleId?: string;

  @ApiPropertyOptional({ description: "オス猫ID" })
  @IsOptional()
  @IsUUID()
  maleId?: string;

  @ApiPropertyOptional({ description: "開始日(YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "終了日(YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: "createdAt" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: "desc", enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc";
}
```

## File: backend/src/breeding/dto/breeding-schedule.dto.ts
```typescript
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
```

## File: backend/src/breeding/dto/create-breeding-ng-rule.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BreedingNgRuleType } from "@prisma/client";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateBreedingNgRuleDto {
  @ApiProperty({ description: "ルール名", example: "近親交配防止" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: "説明", example: "血統書付き同士の交配を避ける" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BreedingNgRuleType, example: BreedingNgRuleType.TAG_COMBINATION })
  @IsEnum(BreedingNgRuleType)
  type!: BreedingNgRuleType;

  @ApiPropertyOptional({ description: "有効フラグ", default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: "オス側のタグ条件", type: [String] })
  @ValidateIf((dto: CreateBreedingNgRuleDto) => dto.type === BreedingNgRuleType.TAG_COMBINATION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  maleConditions?: string[];

  @ApiPropertyOptional({ description: "メス側のタグ条件", type: [String] })
  @ValidateIf((dto: CreateBreedingNgRuleDto) => dto.type === BreedingNgRuleType.TAG_COMBINATION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  femaleConditions?: string[];

  @ApiPropertyOptional({ description: "禁止するオス猫の名前", type: [String] })
  @ValidateIf((dto: CreateBreedingNgRuleDto) => dto.type === BreedingNgRuleType.INDIVIDUAL_PROHIBITION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  maleNames?: string[];

  @ApiPropertyOptional({ description: "禁止するメス猫の名前", type: [String] })
  @ValidateIf((dto: CreateBreedingNgRuleDto) => dto.type === BreedingNgRuleType.INDIVIDUAL_PROHIBITION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  femaleNames?: string[];

  @ApiPropertyOptional({ description: "世代制限 (親等)", minimum: 1 })
  @ValidateIf((dto: CreateBreedingNgRuleDto) => dto.type === BreedingNgRuleType.GENERATION_LIMIT)
  @IsOptional()
  @IsInt()
  @Min(1)
  generationLimit?: number;
}
```

## File: backend/src/breeding/dto/create-breeding.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateBreedingDto {
  @ApiProperty({
    description: "メス猫のID",
    example: "11111111-1111-1111-1111-111111111111",
  })
  @IsUUID()
  femaleId: string;

  @ApiProperty({
    description: "オス猫のID",
    example: "22222222-2222-2222-2222-222222222222",
  })
  @IsUUID()
  maleId: string;

  @ApiProperty({ description: "交配日", example: "2025-08-01" })
  @IsDateString()
  breedingDate: string;

  @ApiPropertyOptional({
    description: "出産予定日 (YYYY-MM-DD)",
    example: "2025-10-01",
  })
  @IsOptional()
  @IsDateString()
  expectedDueDate?: string;

  @ApiPropertyOptional({ description: "メモ", example: "初回の交配。" })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

## File: backend/src/breeding/dto/index.ts
```typescript
export * from "./create-breeding.dto";
export * from "./update-breeding.dto";
export * from "./breeding-query.dto";
export * from "./create-breeding-ng-rule.dto";
export * from "./update-breeding-ng-rule.dto";
export * from "./pregnancy-check.dto";
export * from "./birth-plan.dto";
export * from "./kitten-disposition.dto";
export * from "./breeding-schedule.dto";
```

## File: backend/src/breeding/dto/kitten-disposition.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DispositionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsUUID, IsDateString, IsObject, ValidateNested, IsNumber } from "class-validator";

class SaleInfoDto {
  @ApiProperty({ description: "譲渡先（個人名/業者名）" })
  @IsString()
  buyer: string;

  @ApiProperty({ description: "譲渡金額" })
  @IsNumber()
  price: number;

  @ApiProperty({ description: "譲渡日" })
  @IsDateString()
  saleDate: string;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateKittenDispositionDto {
  @ApiProperty({ description: "出産記録ID" })
  @IsUUID()
  birthRecordId: string;

  @ApiPropertyOptional({ description: "子猫ID（養成の場合のみ）" })
  @IsOptional()
  @IsUUID()
  kittenId?: string;

  @ApiProperty({ description: "子猫名" })
  @IsString()
  name: string;

  @ApiProperty({ description: "性別" })
  @IsString()
  gender: string;

  @ApiProperty({ description: "処遇タイプ", enum: DispositionType })
  @IsEnum(DispositionType)
  disposition: DispositionType;

  @ApiPropertyOptional({ description: "養成開始日（養成の場合）" })
  @IsOptional()
  @IsDateString()
  trainingStartDate?: string;

  @ApiPropertyOptional({ description: "譲渡情報（出荷の場合）" })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SaleInfoDto)
  saleInfo?: SaleInfoDto;

  @ApiPropertyOptional({ description: "死亡日（死亡の場合）" })
  @IsOptional()
  @IsDateString()
  deathDate?: string;

  @ApiPropertyOptional({ description: "死亡理由（死亡の場合）" })
  @IsOptional()
  @IsString()
  deathReason?: string;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateKittenDispositionDto {
  @ApiPropertyOptional({ description: "子猫ID（養成の場合のみ）" })
  @IsOptional()
  @IsUUID()
  kittenId?: string;

  @ApiPropertyOptional({ description: "子猫名" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: "性別" })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: "処遇タイプ" })
  @IsOptional()
  @IsEnum(DispositionType)
  disposition?: DispositionType;

  @ApiPropertyOptional({ description: "養成開始日（養成の場合）" })
  @IsOptional()
  @IsDateString()
  trainingStartDate?: string;

  @ApiPropertyOptional({ description: "譲渡情報（出荷の場合）" })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SaleInfoDto)
  saleInfo?: SaleInfoDto;

  @ApiPropertyOptional({ description: "死亡日（死亡の場合）" })
  @IsOptional()
  @IsDateString()
  deathDate?: string;

  @ApiPropertyOptional({ description: "死亡理由（死亡の場合）" })
  @IsOptional()
  @IsString()
  deathReason?: string;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

## File: backend/src/breeding/dto/pregnancy-check.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PregnancyStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, IsDateString, IsUUID, IsInt, Min } from "class-validator";

export class CreatePregnancyCheckDto {
  @ApiProperty({ description: "妊娠チェック対象の猫ID" })
  @IsUUID()
  motherId: string;

  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsUUID()
  fatherId?: string;

  @ApiPropertyOptional({ description: "交配日" })
  @IsOptional()
  @IsDateString()
  matingDate?: string;

  @ApiProperty({ description: "妊娠チェック日" })
  @IsDateString()
  checkDate: string;

  @ApiProperty({ description: "妊娠状態", enum: PregnancyStatus })
  @IsEnum(PregnancyStatus)
  status: PregnancyStatus;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePregnancyCheckDto {
  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsUUID()
  fatherId?: string;

  @ApiPropertyOptional({ description: "交配日" })
  @IsOptional()
  @IsDateString()
  matingDate?: string;

  @ApiPropertyOptional({ description: "妊娠チェック日" })
  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @ApiPropertyOptional({ description: "妊娠状態", enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PregnancyCheckQueryDto {
  @ApiPropertyOptional({ description: "母親の猫ID" })
  @IsOptional()
  @IsUUID()
  motherId?: string;

  @ApiPropertyOptional({ description: "妊娠状態", enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;

  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
```

## File: backend/src/breeding/dto/update-breeding-ng-rule.dto.ts
```typescript
import { PartialType } from "@nestjs/mapped-types";

import { CreateBreedingNgRuleDto } from "./create-breeding-ng-rule.dto";

export class UpdateBreedingNgRuleDto extends PartialType(CreateBreedingNgRuleDto) {}
```

## File: backend/src/breeding/dto/update-breeding.dto.ts
```typescript
import { PartialType } from "@nestjs/mapped-types";

import { CreateBreedingDto } from "./create-breeding.dto";

export class UpdateBreedingDto extends PartialType(CreateBreedingDto) {}
```

## File: backend/src/breeding/types/breeding.types.ts
```typescript
// Define enums locally
export type BreedingNgRuleType = 'TAG_COMBINATION' | 'INDIVIDUAL_PROHIBITION' | 'GENERATION_LIMIT';
export type PregnancyStatus = 'CONFIRMED' | 'SUSPECTED' | 'NEGATIVE' | 'ABORTED';
export type BirthStatus = 'EXPECTED' | 'BORN' | 'ABORTED' | 'STILLBORN';

export interface BreedingWhereInput {
  femaleId?: string;
  maleId?: string;
  breedingDate?: {
    gte?: Date;
    lte?: Date;
  };
}

// Type for the Prisma select operations
export type BreedingRecordWithRelations = {
  id: string;
  maleId: string;
  femaleId: string;
  breedingDate: Date;
  expectedDueDate: Date | null;
  actualDueDate: Date | null;
  numberOfKittens: number | null;
  notes: string | null;
  status: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
  male: { id: string; name: string | null } | null;
  female: { id: string; name: string | null } | null;
};

// Type for the Cat with gender property for validation
export interface CatWithGender {
  id: string;
  gender: string;
}

// API Response types
export interface BreedingListResponse {
  success: true;
  data: BreedingRecordWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BreedingCreateResponse {
  success: true;
  data: BreedingRecordWithRelations;
}

export interface BreedingSuccessResponse {
  success: true;
}

export interface BreedingNgRule {
  id: string;
  name: string;
  description: string | null;
  type: BreedingNgRuleType;
  maleConditions: string[];
  femaleConditions: string[];
  maleNames: string[];
  femaleNames: string[];
  generationLimit: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreedingNgRuleListResponse {
  success: true;
  data: BreedingNgRule[];
}

export interface BreedingNgRuleResponse {
  success: true;
  data: BreedingNgRule;
}

// Pregnancy Check types
export type PregnancyCheckWithRelations = {
  id: string;
  motherId: string;
  checkDate: Date;
  status: PregnancyStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  mother: { id: string; name: string | null } | null;
};

export interface PregnancyCheckListResponse {
  success: true;
  data: PregnancyCheckWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PregnancyCheckResponse {
  success: true;
  data: PregnancyCheckWithRelations;
}

// Birth Plan types
export type BirthPlanWithRelations = {
  id: string;
  motherId: string;
  expectedBirthDate: Date;
  actualBirthDate: Date | null;
  status: BirthStatus;
  expectedKittens: number | null;
  actualKittens: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  mother: { id: string; name: string | null } | null;
};

export interface BirthPlanListResponse {
  success: true;
  data: BirthPlanWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BirthPlanResponse {
  success: true;
  data: BirthPlanWithRelations;
}

// Breeding Schedule types
export type BreedingScheduleStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type BreedingScheduleWithRelations = {
  id: string;
  maleId: string;
  femaleId: string;
  startDate: Date;
  duration: number;
  status: BreedingScheduleStatus;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
  male: { id: string; name: string | null } | null;
  female: { id: string; name: string | null } | null;
  checks?: MatingCheckType[];
};

export type MatingCheckType = {
  id: string;
  scheduleId: string;
  checkDate: Date;
  count: number;
  createdAt: Date;
};

export interface BreedingScheduleListResponse {
  success: true;
  data: BreedingScheduleWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BreedingScheduleResponse {
  success: true;
  data: BreedingScheduleWithRelations;
}

export interface MatingCheckResponse {
  success: true;
  data: MatingCheckType;
}
```

## File: backend/src/breeding/breeding.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { BreedingController } from './breeding.controller';
import { BreedingService } from './breeding.service';

describe('BreedingController', () => {
  let controller: BreedingController;
  let service: BreedingService;

  const mockBreedingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findNgRules: jest.fn(),
    createNgRule: jest.fn(),
    updateNgRule: jest.fn(),
    removeNgRule: jest.fn(),
    findAllPregnancyChecks: jest.fn(),
    createPregnancyCheck: jest.fn(),
    updatePregnancyCheck: jest.fn(),
    removePregnancyCheck: jest.fn(),
    findAllBirthPlans: jest.fn(),
    createBirthPlan: jest.fn(),
    updateBirthPlan: jest.fn(),
    removeBirthPlan: jest.fn(),
    findAllKittenDispositions: jest.fn(),
    createKittenDisposition: jest.fn(),
    updateKittenDisposition: jest.fn(),
    removeKittenDisposition: jest.fn(),
    completeBirthRecord: jest.fn(),
    findAllBreedingSchedules: jest.fn(),
    createBreedingSchedule: jest.fn(),
    updateBreedingSchedule: jest.fn(),
    removeBreedingSchedule: jest.fn(),
    findMatingChecksBySchedule: jest.fn(),
    createMatingCheck: jest.fn(),
    updateMatingCheck: jest.fn(),
    removeMatingCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [BreedingController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: BreedingService,
          useValue: mockBreedingService,
        },
      ],
    }).compile();

    controller = module.get<BreedingController>(BreedingController);
    service = module.get<BreedingService>(BreedingService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a breeding record', async () => {
      const createDto = {
        femaleId: 'mother-1',
        maleId: 'father-1',
        breedingDate: '2024-01-15',
      };
      const mockBreeding = { id: '1', ...createDto };

      mockBreedingService.create.mockResolvedValue(mockBreeding);

      const result = await controller.create(createDto, undefined);

      expect(result).toEqual(mockBreeding);
      expect(service.create).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('findAll', () => {
    it('should return paginated breeding records', async () => {
      const mockResponse = {
        data: [{ id: '1', fatherId: 'father-1' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockBreedingService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });


});
```

## File: backend/src/breeding/breeding.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus, UseGuards 
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";


import { BreedingService } from "./breeding.service";
import {
  BreedingQueryDto,
  CreateBreedingDto,
  // UpdateBreedingDto, // Unused - keeping import for future use
  CreateBreedingNgRuleDto,
  UpdateBreedingNgRuleDto,
  CreatePregnancyCheckDto,
  UpdatePregnancyCheckDto,
  PregnancyCheckQueryDto,
  CreateBirthPlanDto,
  UpdateBirthPlanDto,
  BirthPlanQueryDto,
  CreateBreedingScheduleDto,
  UpdateBreedingScheduleDto,
  BreedingScheduleQueryDto,
  CreateMatingCheckDto,
  UpdateMatingCheckDto,
} from "./dto";
import { CreateKittenDispositionDto, UpdateKittenDispositionDto } from "./dto/kitten-disposition.dto";

@ApiTags("Breeding")
@Controller("breeding")
export class BreedingController {
  constructor(private readonly breedingService: BreedingService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: "交配記録一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAll(@Query() query: BreedingQueryDto) {
    return this.breedingService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "交配記録の新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  create(
    @Body() dto: CreateBreedingDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.create(dto, user?.userId);
  }

  // NOTE: parameterized routes for the main breeding resource are defined
  // later in the file so that static subpaths (e.g. "pregnancy-checks",
  // "birth-plans") are registered first. This prevents Express from
  // matching those static paths as an ":id" and returning 404.

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("ng-rules")
  @ApiOperation({ summary: "NGペアルール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findNgRules() {
    return this.breedingService.findNgRules();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("ng-rules")
  @ApiOperation({ summary: "NGペアルールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createNgRule(@Body() dto: CreateBreedingNgRuleDto) {
    return this.breedingService.createNgRule(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("ng-rules/:id")
  @ApiOperation({ summary: "NGペアルールの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateNgRule(@Param("id") id: string, @Body() dto: UpdateBreedingNgRuleDto) {
    return this.breedingService.updateNgRule(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("ng-rules/:id")
  @ApiOperation({ summary: "NGペアルールの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeNgRule(@Param("id") id: string) {
    return this.breedingService.removeNgRule(id);
  }

  // Pregnancy Check endpoints
  @Get("test")
  @ApiOperation({ summary: "テスト" })
  @ApiResponse({ status: HttpStatus.OK })
  test() {
    return { message: "test" };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("pregnancy-checks")
  @ApiOperation({ summary: "妊娠チェック一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAllPregnancyChecks(@Query() query: PregnancyCheckQueryDto) {
    return this.breedingService.findAllPregnancyChecks(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("pregnancy-checks")
  @ApiOperation({ summary: "妊娠チェックの新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createPregnancyCheck(
    @Body() dto: CreatePregnancyCheckDto,
    @GetUser() user?: RequestUser,
  ) {
    console.log('[DEBUG] createPregnancyCheck - Received DTO:', JSON.stringify(dto, null, 2));
    console.log('[DEBUG] motherId type:', typeof dto.motherId, 'value:', dto.motherId);
    console.log('[DEBUG] fatherId type:', typeof dto.fatherId, 'value:', dto.fatherId);
    return this.breedingService.createPregnancyCheck(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("pregnancy-checks/:id")
  @ApiOperation({ summary: "妊娠チェックの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updatePregnancyCheck(@Param("id") id: string, @Body() dto: UpdatePregnancyCheckDto) {
    return this.breedingService.updatePregnancyCheck(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("pregnancy-checks/:id")
  @ApiOperation({ summary: "妊娠チェックの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removePregnancyCheck(@Param("id") id: string) {
    return this.breedingService.removePregnancyCheck(id);
  }

  // Birth Plan endpoints
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("birth-plans")
  @ApiOperation({ summary: "出産計画一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAllBirthPlans(@Query() query: BirthPlanQueryDto) {
    return this.breedingService.findAllBirthPlans(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("birth-plans")
  @ApiOperation({ summary: "出産計画の新規作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createBirthPlan(
    @Body() dto: CreateBirthPlanDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.createBirthPlan(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("birth-plans/:id")
  @ApiOperation({ summary: "出産計画の更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateBirthPlan(@Param("id") id: string, @Body() dto: UpdateBirthPlanDto) {
    return this.breedingService.updateBirthPlan(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("birth-plans/:id")
  @ApiOperation({ summary: "出産計画の削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeBirthPlan(@Param("id") id: string) {
    return this.breedingService.removeBirthPlan(id);
  }

  // ========== Kitten Disposition Endpoints ==========

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("kitten-dispositions/:birthRecordId")
  @ApiOperation({ summary: "出産記録の子猫処遇一覧取得" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "birthRecordId" })
  findAllKittenDispositions(@Param("birthRecordId") birthRecordId: string) {
    return this.breedingService.findAllKittenDispositions(birthRecordId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("kitten-dispositions")
  @ApiOperation({ summary: "子猫処遇の登録" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createKittenDisposition(
    @Body() dto: CreateKittenDispositionDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.createKittenDisposition(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("kitten-dispositions/:id")
  @ApiOperation({ summary: "子猫処遇の更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateKittenDisposition(@Param("id") id: string, @Body() dto: UpdateKittenDispositionDto) {
    return this.breedingService.updateKittenDisposition(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("kitten-dispositions/:id")
  @ApiOperation({ summary: "子猫処遇の削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeKittenDisposition(@Param("id") id: string) {
    return this.breedingService.removeKittenDisposition(id);
  }

  @Post("birth-plans/:id/complete")
  @ApiOperation({ summary: "出産記録の完了" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  completeBirthRecord(@Param("id") id: string) {
    return this.breedingService.completeBirthRecord(id);
  }

  // ========== Breeding Schedule Endpoints ==========

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("schedules")
  @ApiOperation({ summary: "交配スケジュール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  findAllBreedingSchedules(@Query() query: BreedingScheduleQueryDto) {
    return this.breedingService.findAllBreedingSchedules(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("schedules")
  @ApiOperation({ summary: "交配スケジュールの作成" })
  @ApiResponse({ status: HttpStatus.CREATED })
  createBreedingSchedule(
    @Body() dto: CreateBreedingScheduleDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.breedingService.createBreedingSchedule(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id")
  @ApiOperation({ summary: "交配スケジュールの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateBreedingSchedule(@Param("id") id: string, @Body() dto: UpdateBreedingScheduleDto) {
    return this.breedingService.updateBreedingSchedule(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("schedules/:id")
  @ApiOperation({ summary: "交配スケジュールの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeBreedingSchedule(@Param("id") id: string) {
    return this.breedingService.removeBreedingSchedule(id);
  }

  // ========== Mating Check Endpoints ==========

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("schedules/:scheduleId/checks")
  @ApiOperation({ summary: "交配チェック一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "scheduleId" })
  findMatingChecks(@Param("scheduleId") scheduleId: string) {
    return this.breedingService.findMatingChecksBySchedule(scheduleId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("schedules/:scheduleId/checks")
  @ApiOperation({ summary: "交配チェックの追加" })
  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiParam({ name: "scheduleId" })
  createMatingCheck(
    @Param("scheduleId") scheduleId: string,
    @Body() dto: CreateMatingCheckDto,
  ) {
    return this.breedingService.createMatingCheck(scheduleId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("mating-checks/:id")
  @ApiOperation({ summary: "交配チェックの更新" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  updateMatingCheck(@Param("id") id: string, @Body() dto: UpdateMatingCheckDto) {
    return this.breedingService.updateMatingCheck(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("mating-checks/:id")
  @ApiOperation({ summary: "交配チェックの削除" })
  @ApiResponse({ status: HttpStatus.OK })
  @ApiParam({ name: "id" })
  removeMatingCheck(@Param("id") id: string) {
    return this.breedingService.removeMatingCheck(id);
  }

  // Parameterized routes for the main breeding resource.
  // These are intentionally placed after static subpaths such as
  // "pregnancy-checks" and "birth-plans" so that Express does not
  // interpret those paths as an ":id" and cause 404s.
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Patch(":id")
  // @ApiOperation({ summary: "交配記録の更新" })
  // @ApiResponse({ status: HttpStatus.OK })
  // @ApiParam({ name: "id" })
  // update(@Param("id") id: string, @Body() dto: UpdateBreedingDto) {
  //   return this.breedingService.update(id, dto);
  // }

  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Delete(":id")
  // @ApiOperation({ summary: "交配記録の削除" })
  // @ApiResponse({ status: HttpStatus.OK })
  // @ApiParam({ name: "id" })
  // remove(@Param("id") id: string) {
  //   return this.breedingService.remove(id);
  // }
}
```

## File: backend/src/breeding/breeding.module.ts
```typescript
import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { BreedingController } from "./breeding.controller";
import { BreedingService } from "./breeding.service";

@Module({
  imports: [PrismaModule],
  controllers: [BreedingController],
  providers: [BreedingService],
})
export class BreedingModule {}
```

## File: backend/src/breeding/breeding.service.spec.ts
```typescript
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { BreedingService } from './breeding.service';



describe('BreedingService', () => {
  let service: BreedingService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    breeding: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    breedingRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    breedingNgRule: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((args) => Promise.all(args)),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BreedingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<BreedingService>(BreedingService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a breeding record successfully', async () => {
      const createDto = {
        femaleId: 'mother-1',
        maleId: 'father-1',
        breedingDate: '2024-01-15',
      };

      const mockFather = { id: 'father-1', gender: 'MALE' };
      const mockMother = { id: 'mother-1', gender: 'FEMALE' };
      const mockBreeding = {
        id: '1',
        femaleId: createDto.femaleId,
        maleId: createDto.maleId,
        breedingDate: new Date(createDto.breedingDate),
      };

      mockPrismaService.cat.findUnique
        .mockResolvedValueOnce(mockMother) // First call for female
        .mockResolvedValueOnce(mockFather); // Second call for male
      mockPrismaService.breedingNgRule.findMany.mockResolvedValue([]);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1', email: 'test@test.com' });
      mockPrismaService.breedingRecord.create.mockResolvedValue(mockBreeding);

      const result = await service.create(createDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBreeding);
      expect(mockPrismaService.breedingRecord.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid father', async () => {
      const createDto = {
        femaleId: 'mother-1',
        maleId: 'invalid-father',
        breedingDate: '2024-01-15',
      };

      mockPrismaService.cat.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated breeding records', async () => {
      const mockBreedings = [
        {
          id: '1',
          femaleId: 'mother-1',
          maleId: 'father-1',
          breedingDate: new Date(),
        },
      ];

      mockPrismaService.breedingRecord.count.mockResolvedValue(1);
      mockPrismaService.breedingRecord.findMany.mockResolvedValue(mockBreedings);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockBreedings);
      expect(result.meta.total).toBe(1);
    });
  });


});
```

## File: backend/src/breeding/breeding.service.ts
```typescript
import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  BreedingQueryDto,
  CreateBreedingDto,
  UpdateBreedingDto,
  CreateBreedingNgRuleDto,
  UpdateBreedingNgRuleDto,
  CreatePregnancyCheckDto,
  UpdatePregnancyCheckDto,
  PregnancyCheckQueryDto,
  CreateBirthPlanDto,
  UpdateBirthPlanDto,
  BirthPlanQueryDto,
  CreateKittenDispositionDto,
  UpdateKittenDispositionDto,
  CreateBreedingScheduleDto,
  UpdateBreedingScheduleDto,
  BreedingScheduleQueryDto,
  CreateMatingCheckDto,
  UpdateMatingCheckDto,
} from "./dto";
import {
  BreedingWhereInput,
  CatWithGender,
  BreedingListResponse,
  BreedingCreateResponse,
  BreedingSuccessResponse,
  BreedingNgRuleListResponse,
  BreedingNgRuleResponse,
  PregnancyCheckListResponse,
  PregnancyCheckResponse,
  BirthPlanListResponse,
  BirthPlanResponse,
  BreedingScheduleListResponse,
  BreedingScheduleResponse,
  MatingCheckResponse,
} from "./types/breeding.types";

@Injectable()
export class BreedingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BreedingQueryDto): Promise<BreedingListResponse> {
    const {
      page = 1,
      limit = 20,
      femaleId,
      maleId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const where: BreedingWhereInput = {};
    if (femaleId) where.femaleId = femaleId;
    if (maleId) where.maleId = maleId;
    if (dateFrom || dateTo) {
      where.breedingDate = {};
      if (dateFrom) where.breedingDate.gte = new Date(dateFrom);
      if (dateTo) where.breedingDate.lte = new Date(dateTo);
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.breedingRecord.count({ where }),
      this.prisma.breedingRecord.findMany({
        where,
        include: {
          male: { select: { id: true, name: true } },
          female: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateBreedingDto, userId?: string): Promise<BreedingCreateResponse> {
    // Validate parents existence
    const [female, male] = await Promise.all([
      this.prisma.cat.findUnique({ 
        where: { id: dto.femaleId },
        select: { id: true, gender: true }
      }),
      this.prisma.cat.findUnique({ 
        where: { id: dto.maleId },
        select: { id: true, gender: true }
      }),
    ]);

    if (!female) throw new NotFoundException("femaleId not found");
    if (!male) throw new NotFoundException("maleId not found");

    // Basic gender check (optional but useful)
    if ((female as CatWithGender).gender === "MALE") {
      throw new BadRequestException("femaleId must refer to a FEMALE cat");
    }
    if ((male as CatWithGender).gender === "FEMALE") {
      throw new BadRequestException("maleId must refer to a MALE cat");
    }

    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const recordedById = userId ?? firstUser?.id;
    if (!recordedById) {
      throw new BadRequestException('記録者情報が取得できませんでした');
    }

    const result = await this.prisma.breedingRecord.create({
      data: {
        femaleId: dto.femaleId,
        maleId: dto.maleId,
        breedingDate: new Date(dto.breedingDate),
        expectedDueDate: dto.expectedDueDate
          ? new Date(dto.expectedDueDate)
          : undefined,
        notes: dto.notes,
        recordedBy: recordedById,
      },
      include: {
        male: { select: { id: true, name: true } },
        female: { select: { id: true, name: true } },
      },
    });
    return { success: true, data: result };
  }

  async update(id: string, dto: UpdateBreedingDto): Promise<BreedingSuccessResponse> {
    await this.prisma.breedingRecord.update({
      where: { id },
      data: {
        femaleId: dto.femaleId,
        maleId: dto.maleId,
        breedingDate: dto.breedingDate ? new Date(dto.breedingDate) : undefined,
        expectedDueDate: dto.expectedDueDate
          ? new Date(dto.expectedDueDate)
          : undefined,
        notes: dto.notes,
      },
    });
    return { success: true };
  }

  async remove(id: string): Promise<BreedingSuccessResponse> {
    await this.prisma.breedingRecord.delete({ where: { id } });
    return { success: true };
  }

  async findNgRules(): Promise<BreedingNgRuleListResponse> {
    const rules = await this.prisma.breedingNgRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: rules };
  }

  async createNgRule(dto: CreateBreedingNgRuleDto): Promise<BreedingNgRuleResponse> {
    const rule = await this.prisma.breedingNgRule.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        active: dto.active ?? true,
        maleConditions: dto.maleConditions ?? [],
        femaleConditions: dto.femaleConditions ?? [],
        maleNames: dto.maleNames ?? [],
        femaleNames: dto.femaleNames ?? [],
        generationLimit: dto.generationLimit,
      },
    });

    return { success: true, data: rule };
  }

  async updateNgRule(id: string, dto: UpdateBreedingNgRuleDto): Promise<BreedingNgRuleResponse> {
    const data: Prisma.BreedingNgRuleUpdateInput = {
      name: dto.name,
      description: dto.description,
      type: dto.type,
      active: dto.active,
      generationLimit: dto.generationLimit,
    };

    if (dto.maleConditions !== undefined) {
      data.maleConditions = { set: dto.maleConditions };
    }

    if (dto.femaleConditions !== undefined) {
      data.femaleConditions = { set: dto.femaleConditions };
    }

    if (dto.maleNames !== undefined) {
      data.maleNames = { set: dto.maleNames };
    }

    if (dto.femaleNames !== undefined) {
      data.femaleNames = { set: dto.femaleNames };
    }

    const rule = await this.prisma.breedingNgRule.update({
      where: { id },
      data,
    });

    return { success: true, data: rule };
  }

  async removeNgRule(id: string): Promise<BreedingSuccessResponse> {
    await this.prisma.breedingNgRule.delete({ where: { id } });
    return { success: true };
  }

  // Pregnancy Check methods
  async findAllPregnancyChecks(query: PregnancyCheckQueryDto): Promise<PregnancyCheckListResponse> {
    const {
      page = 1,
      limit = 20,
      motherId,
      status,
    } = query;

    const where: Prisma.PregnancyCheckWhereInput = {};
    if (motherId) where.motherId = motherId;
    if (status) where.status = status;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pregnancyCheck.count({ where }),
      this.prisma.pregnancyCheck.findMany({
        where,
        include: {
          mother: { select: { id: true, name: true } },
        },
        orderBy: { checkDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createPregnancyCheck(dto: CreatePregnancyCheckDto, userId?: string): Promise<PregnancyCheckResponse> {
    // Validate mother exists and is female
    const mother = await this.prisma.cat.findUnique({
      where: { id: dto.motherId },
      select: { id: true, gender: true, name: true }
    });

    if (!mother) throw new NotFoundException("Mother cat not found");
    if (mother.gender === "MALE") {
      throw new BadRequestException("Mother must be a female cat");
    }

    // Validate father if provided
    if (dto.fatherId) {
      const father = await this.prisma.cat.findUnique({
        where: { id: dto.fatherId },
        select: { id: true, gender: true }
      });

      if (!father) throw new NotFoundException("Father cat not found");
      if (father.gender !== "MALE") {
        throw new BadRequestException("Father must be a male cat");
      }
    }

    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const recordedById = userId ?? firstUser?.id;
    if (!recordedById) {
      throw new BadRequestException('記録者情報が取得できませんでした');
    }

    const result = await this.prisma.pregnancyCheck.create({
      data: {
        motherId: dto.motherId,
        fatherId: dto.fatherId,
        matingDate: dto.matingDate ? new Date(dto.matingDate) : null,
        checkDate: new Date(dto.checkDate),
        status: dto.status,
        notes: dto.notes,
        recordedBy: recordedById,
      },
      include: {
        mother: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: result };
  }

  async updatePregnancyCheck(id: string, dto: UpdatePregnancyCheckDto): Promise<BreedingSuccessResponse> {
    // Validate father if provided
    if (dto.fatherId) {
      const father = await this.prisma.cat.findUnique({
        where: { id: dto.fatherId },
        select: { id: true, gender: true }
      });

      if (!father) throw new NotFoundException("Father cat not found");
      if (father.gender !== "MALE") {
        throw new BadRequestException("Father must be a male cat");
      }
    }

    await this.prisma.pregnancyCheck.update({
      where: { id },
      data: {
        fatherId: dto.fatherId,
        matingDate: dto.matingDate ? new Date(dto.matingDate) : undefined,
        checkDate: dto.checkDate ? new Date(dto.checkDate) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
    });
    return { success: true };
  }

  async removePregnancyCheck(id: string): Promise<BreedingSuccessResponse> {
    try {
      await this.prisma.pregnancyCheck.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete pregnancy check ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      throw new BadRequestException(
        `妊娠確認の削除に失敗しました: ${errorMessage}`
      );
    }
  }

  // Birth Plan methods
  async findAllBirthPlans(query: BirthPlanQueryDto): Promise<BirthPlanListResponse> {
    const {
      page = 1,
      limit = 20,
      motherId,
      status,
    } = query;

    const where: Prisma.BirthPlanWhereInput = {};
    if (motherId) where.motherId = motherId;
    if (status) where.status = status;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.birthPlan.count({ where }),
      this.prisma.birthPlan.findMany({
        where,
        include: {
          mother: { select: { id: true, name: true } },
          kittenDispositions: true,
        },
        orderBy: { expectedBirthDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createBirthPlan(dto: CreateBirthPlanDto, userId?: string): Promise<BirthPlanResponse> {
    // Validate mother exists and is female
    const mother = await this.prisma.cat.findUnique({
      where: { id: dto.motherId },
      select: { id: true, gender: true, name: true }
    });

    if (!mother) throw new NotFoundException("Mother cat not found");
    if (mother.gender === "MALE") {
      throw new BadRequestException("Mother must be a female cat");
    }

    // Validate father if provided
    if (dto.fatherId) {
      const father = await this.prisma.cat.findUnique({
        where: { id: dto.fatherId },
        select: { id: true, gender: true }
      });

      if (!father) throw new NotFoundException("Father cat not found");
      if (father.gender !== "MALE") {
        throw new BadRequestException("Father must be a male cat");
      }
    }

    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const recordedById = userId ?? firstUser?.id;

    if (!recordedById) {
      throw new BadRequestException("No user found to record the birth plan");
    }

    const result = await this.prisma.birthPlan.create({
      data: {
        motherId: dto.motherId,
        fatherId: dto.fatherId || undefined,
        matingDate: dto.matingDate ? new Date(dto.matingDate) : undefined,
        expectedBirthDate: new Date(dto.expectedBirthDate),
        actualBirthDate: dto.actualBirthDate ? new Date(dto.actualBirthDate) : undefined,
        status: dto.status,
        expectedKittens: dto.expectedKittens || undefined,
        actualKittens: dto.actualKittens || undefined,
        notes: dto.notes || undefined,
        recordedBy: recordedById,
      },
      include: {
        mother: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: result };
  }

  async updateBirthPlan(id: string, dto: UpdateBirthPlanDto): Promise<BreedingSuccessResponse> {
    try {
      // Validate father if provided
      if (dto.fatherId) {
        const father = await this.prisma.cat.findUnique({
          where: { id: dto.fatherId },
          select: { id: true, gender: true }
        });

        if (!father) throw new NotFoundException("Father cat not found");
        if (father.gender !== "MALE") {
          throw new BadRequestException("Father must be a male cat");
        }
      }

      await this.prisma.birthPlan.update({
        where: { id },
        data: {
          fatherId: dto.fatherId,
          matingDate: dto.matingDate ? new Date(dto.matingDate) : undefined,
          expectedBirthDate: dto.expectedBirthDate ? new Date(dto.expectedBirthDate) : undefined,
          actualBirthDate: dto.actualBirthDate ? new Date(dto.actualBirthDate) : undefined,
          status: dto.status,
          expectedKittens: dto.expectedKittens,
          actualKittens: dto.actualKittens,
          notes: dto.notes,
        },
      });
      return { success: true };
    } catch (error) {
      console.error(`Failed to update birth plan ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      throw new BadRequestException(
        `出産予定の更新に失敗しました: ${errorMessage}`
      );
    }
  }

  async removeBirthPlan(id: string): Promise<BreedingSuccessResponse> {
    try {
      // Check if birth plan has any kitten dispositions
      const kittenDispositionsCount = await this.prisma.kittenDisposition.count({
        where: { birthRecordId: id }
      });

      if (kittenDispositionsCount > 0) {
        throw new BadRequestException(
          'この出産予定には子猫処遇記録が関連付けられているため、削除できません。子猫処遇記録を先に削除してください。'
        );
      }

      await this.prisma.birthPlan.delete({ where: { id } });
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete birth plan ${id}:`, error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : '不明なエラー';
      throw new BadRequestException(
        `出産予定の削除に失敗しました: ${errorMessage}`
      );
    }
  }

  // ========== Kitten Disposition Methods ==========

  async findAllKittenDispositions(birthRecordId: string) {
    const dispositions = await this.prisma.kittenDisposition.findMany({
      where: { birthRecordId },
      include: {
        kitten: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return { success: true, data: dispositions };
  }

  async createKittenDisposition(dto: CreateKittenDispositionDto, _userId?: string) {
    const { birthRecordId, kittenId, name, gender, disposition, trainingStartDate, saleInfo, deathDate, deathReason, notes } = dto;

    // Validate birthRecord exists
    const birthRecord = await this.prisma.birthPlan.findUnique({
      where: { id: birthRecordId },
    });
    if (!birthRecord) throw new NotFoundException("Birth record not found");

    const result = await this.prisma.kittenDisposition.create({
      data: {
        birthRecordId,
        kittenId,
        name,
        gender,
        disposition,
        trainingStartDate: trainingStartDate ? new Date(trainingStartDate) : undefined,
        saleInfo: saleInfo ? (saleInfo as object) : undefined,
        deathDate: deathDate ? new Date(deathDate) : undefined,
        deathReason,
        notes,
      },
      include: {
        kitten: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: result };
  }

  async updateKittenDisposition(id: string, dto: UpdateKittenDispositionDto) {
    const { kittenId, name, gender, disposition, trainingStartDate, saleInfo, deathDate, deathReason, notes } = dto;

    await this.prisma.kittenDisposition.update({
      where: { id },
      data: {
        kittenId,
        name,
        gender,
        disposition,
        trainingStartDate: trainingStartDate ? new Date(trainingStartDate) : undefined,
        saleInfo: saleInfo ? (saleInfo as object) : undefined,
        deathDate: deathDate ? new Date(deathDate) : undefined,
        deathReason,
        notes,
      },
    });

    return { success: true };
  }

  async removeKittenDisposition(id: string) {
    await this.prisma.kittenDisposition.delete({ where: { id } });
    return { success: true };
  }

  async completeBirthRecord(id: string) {
    await this.prisma.birthPlan.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });
    return { success: true };
  }

  // ========== Breeding Schedule Methods ==========

  async findAllBreedingSchedules(query: BreedingScheduleQueryDto): Promise<BreedingScheduleListResponse> {
    const {
      page = 1,
      limit = 50,
      maleId,
      femaleId,
      status,
      dateFrom,
      dateTo,
    } = query;

    const where: Prisma.BreedingScheduleWhereInput = {};
    if (maleId) where.maleId = maleId;
    if (femaleId) where.femaleId = femaleId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.startDate = {};
      if (dateFrom) where.startDate.gte = new Date(dateFrom);
      if (dateTo) where.startDate.lte = new Date(dateTo);
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.breedingSchedule.count({ where }),
      this.prisma.breedingSchedule.findMany({
        where,
        include: {
          male: { select: { id: true, name: true } },
          female: { select: { id: true, name: true } },
          checks: {
            orderBy: { checkDate: 'asc' },
          },
        },
        orderBy: { startDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createBreedingSchedule(dto: CreateBreedingScheduleDto, userId?: string): Promise<BreedingScheduleResponse> {
    // オス猫の存在確認
    const male = await this.prisma.cat.findUnique({
      where: { id: dto.maleId },
      select: { id: true, gender: true, name: true }
    });
    if (!male) throw new NotFoundException("オス猫が見つかりません");
    if (male.gender !== "MALE") {
      throw new BadRequestException("maleId はオス猫を指定してください");
    }

    // メス猫の存在確認
    const female = await this.prisma.cat.findUnique({
      where: { id: dto.femaleId },
      select: { id: true, gender: true, name: true }
    });
    if (!female) throw new NotFoundException("メス猫が見つかりません");
    if (female.gender !== "FEMALE") {
      throw new BadRequestException("femaleId はメス猫を指定してください");
    }

    // 記録者の確認
    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const recordedById = userId ?? firstUser?.id;
    if (!recordedById) {
      throw new BadRequestException('記録者情報が取得できませんでした');
    }

    const result = await this.prisma.breedingSchedule.create({
      data: {
        maleId: dto.maleId,
        femaleId: dto.femaleId,
        startDate: new Date(dto.startDate),
        duration: dto.duration,
        status: dto.status ?? 'SCHEDULED',
        notes: dto.notes,
        recordedBy: recordedById,
      },
      include: {
        male: { select: { id: true, name: true } },
        female: { select: { id: true, name: true } },
        checks: true,
      },
    });

    return { success: true, data: result };
  }

  async updateBreedingSchedule(id: string, dto: UpdateBreedingScheduleDto): Promise<BreedingSuccessResponse> {
    // スケジュールの存在確認
    const existing = await this.prisma.breedingSchedule.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("スケジュールが見つかりません");

    // オス猫の確認（変更時のみ）
    if (dto.maleId && dto.maleId !== existing.maleId) {
      const male = await this.prisma.cat.findUnique({
        where: { id: dto.maleId },
        select: { id: true, gender: true }
      });
      if (!male) throw new NotFoundException("オス猫が見つかりません");
      if (male.gender !== "MALE") {
        throw new BadRequestException("maleId はオス猫を指定してください");
      }
    }

    // メス猫の確認（変更時のみ）
    if (dto.femaleId && dto.femaleId !== existing.femaleId) {
      const female = await this.prisma.cat.findUnique({
        where: { id: dto.femaleId },
        select: { id: true, gender: true }
      });
      if (!female) throw new NotFoundException("メス猫が見つかりません");
      if (female.gender !== "FEMALE") {
        throw new BadRequestException("femaleId はメス猫を指定してください");
      }
    }

    await this.prisma.breedingSchedule.update({
      where: { id },
      data: {
        maleId: dto.maleId,
        femaleId: dto.femaleId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        duration: dto.duration,
        status: dto.status,
        notes: dto.notes,
      },
    });

    return { success: true };
  }

  async removeBreedingSchedule(id: string): Promise<BreedingSuccessResponse> {
    const existing = await this.prisma.breedingSchedule.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("スケジュールが見つかりません");

    // MatingCheck は onDelete: Cascade で自動削除される
    await this.prisma.breedingSchedule.delete({ where: { id } });
    return { success: true };
  }

  // ========== Mating Check Methods ==========

  async findMatingChecksBySchedule(scheduleId: string) {
    const schedule = await this.prisma.breedingSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException("スケジュールが見つかりません");

    const checks = await this.prisma.matingCheck.findMany({
      where: { scheduleId },
      orderBy: { checkDate: 'asc' },
    });

    return { success: true, data: checks };
  }

  async createMatingCheck(scheduleId: string, dto: CreateMatingCheckDto): Promise<MatingCheckResponse> {
    const schedule = await this.prisma.breedingSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException("スケジュールが見つかりません");

    const result = await this.prisma.matingCheck.create({
      data: {
        scheduleId,
        checkDate: new Date(dto.checkDate),
        count: dto.count ?? 1,
      },
    });

    return { success: true, data: result };
  }

  async updateMatingCheck(id: string, dto: UpdateMatingCheckDto): Promise<BreedingSuccessResponse> {
    const existing = await this.prisma.matingCheck.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("交配チェックが見つかりません");

    await this.prisma.matingCheck.update({
      where: { id },
      data: {
        checkDate: dto.checkDate ? new Date(dto.checkDate) : undefined,
        count: dto.count,
      },
    });

    return { success: true };
  }

  async removeMatingCheck(id: string): Promise<BreedingSuccessResponse> {
    const existing = await this.prisma.matingCheck.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException("交配チェックが見つかりません");

    await this.prisma.matingCheck.delete({ where: { id } });
    return { success: true };
  }
}
```

## File: backend/src/graduation/dto/index.ts
```typescript
export * from './transfer-cat.dto';
```

## File: backend/src/graduation/dto/transfer-cat.dto.ts
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional } from 'class-validator';

export class TransferCatDto {
  @ApiProperty({
    description: '譲渡日',
    example: '2025-11-11',
  })
  @IsDateString()
  transferDate: string;

  @ApiProperty({
    description: '譲渡先',
    example: '山田家',
  })
  @IsString()
  destination: string;

  @ApiProperty({
    description: '備考',
    example: '譲渡先は愛情深い家庭です',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

## File: backend/src/graduation/graduation.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';

describe('GraduationController', () => {
  let controller: GraduationController;
  let service: GraduationService;

  const mockGraduationService = {
    transferCat: jest.fn(),
    findAllGraduations: jest.fn(),
    findOneGraduation: jest.fn(),
    cancelGraduation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [GraduationController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: GraduationService,
          useValue: mockGraduationService,
        },
      ],
    }).compile();

    controller = module.get<GraduationController>(GraduationController);
    service = module.get<GraduationService>(GraduationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transferCat', () => {
    it('should transfer a cat', async () => {
      const catId = 'cat-1';
      const transferDto = {
        transferDate: '2024-01-15',
        destination: 'New Home',
      };
      const mockRecord = { success: true, data: { id: '1', catId, ...transferDto } };

      mockGraduationService.transferCat.mockResolvedValue(mockRecord);

      const result = await controller.transferCat(catId, transferDto);

      expect(result).toEqual(mockRecord);
      expect(service.transferCat).toHaveBeenCalledWith(catId, transferDto);
    });
  });

  describe('findAllGraduations', () => {
    it('should return graduation records', async () => {
      const mockResponse = {
        data: [{ id: '1', catId: 'cat-1' }],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      };

      mockGraduationService.findAllGraduations.mockResolvedValue(mockResponse);

      const result = await controller.findAllGraduations('1', '50');

      expect(result).toEqual(mockResponse);
      expect(service.findAllGraduations).toHaveBeenCalledWith(1, 50);
    });
  });

  describe('findOneGraduation', () => {
    it('should return a graduation record', async () => {
      const mockGraduation = { id: '1', catId: 'cat-1', transferDate: new Date() };

      mockGraduationService.findOneGraduation.mockResolvedValue(mockGraduation);

      const result = await controller.findOneGraduation('1');

      expect(result).toEqual(mockGraduation);
      expect(service.findOneGraduation).toHaveBeenCalledWith('1');
    });
  });

  describe('cancelGraduation', () => {
    it('should cancel a graduation', async () => {
      const mockResponse = { success: true, message: 'Graduation cancelled' };

      mockGraduationService.cancelGraduation.mockResolvedValue(mockResponse);

      const result = await controller.cancelGraduation('1');

      expect(result).toEqual(mockResponse);
      expect(service.cancelGraduation).toHaveBeenCalledWith('1');
    });
  });
});
```

## File: backend/src/graduation/graduation.controller.ts
```typescript
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { TransferCatDto } from './dto';
import { GraduationService } from './graduation.service';

@ApiTags('Graduation')
@Controller('graduations')
export class GraduationController {
  constructor(private readonly graduationService: GraduationService) {}

  /**
   * 猫を譲渡（卒業）する
   */
  @Post('cats/:id/transfer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '猫を譲渡（卒業）する' })
  @ApiParam({ name: 'id', description: '猫ID' })
  @ApiResponse({ status: 201, description: '譲渡成功' })
  @ApiResponse({ status: 404, description: '猫が見つかりません' })
  @ApiResponse({ status: 400, description: 'すでに卒業済みです' })
  async transferCat(@Param('id') id: string, @Body() dto: TransferCatDto) {
    return this.graduationService.transferCat(id, dto);
  }

  /**
   * 卒業猫一覧取得
   */
  @Get()
  @ApiOperation({ summary: '卒業猫一覧取得' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: '卒業猫一覧' })
  async findAllGraduations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.graduationService.findAllGraduations(pageNum, limitNum);
  }

  /**
   * 卒業猫詳細取得
   */
  @Get(':id')
  @ApiOperation({ summary: '卒業猫詳細取得' })
  @ApiParam({ name: 'id', description: '卒業ID' })
  @ApiResponse({ status: 200, description: '卒業猫詳細' })
  @ApiResponse({ status: 404, description: '卒業記録が見つかりません' })
  async findOneGraduation(@Param('id') id: string) {
    return this.graduationService.findOneGraduation(id);
  }

  /**
   * 卒業取り消し（緊急時用）
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '卒業取り消し（緊急時用）' })
  @ApiParam({ name: 'id', description: '卒業ID' })
  @ApiResponse({ status: 200, description: '卒業取り消し成功' })
  @ApiResponse({ status: 404, description: '卒業記録が見つかりません' })
  async cancelGraduation(@Param('id') id: string) {
    return this.graduationService.cancelGraduation(id);
  }
}
```

## File: backend/src/graduation/graduation.module.ts
```typescript
import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { GraduationController } from './graduation.controller';
import { GraduationService } from './graduation.service';

@Module({
  imports: [PrismaModule],
  controllers: [GraduationController],
  providers: [GraduationService],
  exports: [GraduationService],
})
export class GraduationModule {}
```

## File: backend/src/graduation/graduation.service.spec.ts
```typescript
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { GraduationService } from './graduation.service';


describe('GraduationService', () => {
  let service: GraduationService;
  let _prismaService: PrismaService;

  const mockPrismaService: any = {
    cat: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    graduation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GraduationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GraduationService>(GraduationService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transferCat', () => {
    it('should transfer a cat successfully', async () => {
      const catId = 'cat-1';
      const transferDto = {
        transferDate: '2024-01-15',
        destination: 'New Home',
        notes: 'Good home',
      };

      const mockCat = {
        id: 'cat-1',
        name: 'Test Cat',
        isInHouse: true,
        isGraduated: false,
      };

      const mockGraduation = {
        id: '1',
        catId: 'cat-1',
        transferDate: new Date(transferDto.transferDate),
        destination: transferDto.destination,
        notes: transferDto.notes,
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.graduation.create.mockResolvedValue(mockGraduation);
      mockPrismaService.cat.update.mockResolvedValue({ ...mockCat, isGraduated: true, isInHouse: false });

      const result = await service.transferCat(catId, transferDto);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const catId = 'invalid-cat';
      const transferDto = {
        transferDate: '2024-01-15',
        destination: 'New Home',
      };

      mockPrismaService.cat.findUnique.mockResolvedValue(null);

      await expect(service.transferCat(catId, transferDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllGraduations', () => {
    it('should return paginated graduation records', async () => {
      const mockRecords = [
        {
          id: '1',
          catId: 'cat-1',
          transferDate: new Date(),
          destination: 'New Home',
          cat: {
            id: 'cat-1',
            name: 'Test Cat',
            gender: 'MALE',
            birthDate: new Date(),
          },
        },
      ];

      mockPrismaService.graduation.findMany.mockResolvedValue(mockRecords);
      mockPrismaService.graduation.count.mockResolvedValue(1);

      const result = await service.findAllGraduations(1, 50);

      expect(result.data).toEqual(mockRecords);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOneGraduation', () => {
    it('should return a graduation record', async () => {
      const mockGraduation = {
        id: '1',
        catId: 'cat-1',
        transferDate: new Date(),
        destination: 'New Home',
      };

      mockPrismaService.graduation.findUnique.mockResolvedValue(mockGraduation);

      const result = await service.findOneGraduation('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockGraduation);
    });

    it('should throw NotFoundException for invalid graduation', async () => {
      mockPrismaService.graduation.findUnique.mockResolvedValue(null);

      await expect(service.findOneGraduation('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelGraduation', () => {
    it('should cancel a graduation successfully', async () => {
      const mockGraduation = {
        id: '1',
        catId: 'cat-1',
      };

      const mockCat = {
        id: 'cat-1',
        isGraduated: true,
        isInHouse: false,
      };

      mockPrismaService.graduation.findUnique.mockResolvedValue(mockGraduation);
      mockPrismaService.cat.findUnique.mockResolvedValue(mockCat);
      mockPrismaService.graduation.delete.mockResolvedValue(mockGraduation);
      mockPrismaService.cat.update.mockResolvedValue({ ...mockCat, isGraduated: false, isInHouse: true });

      const result = await service.cancelGraduation('1');

      expect(result.success).toBe(true);
    });
  });
});
```

## File: backend/src/graduation/graduation.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { TransferCatDto } from './dto';

@Injectable()
export class GraduationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 猫を譲渡（卒業）する
   * 1. 猫データのスナップショットを作成
   * 2. Graduationレコード作成
   * 3. Catのフラグ更新（isGraduated=true, isInHouse=false）
   */
  async transferCat(catId: string, dto: TransferCatDto, userId?: string) {
    // 猫が存在するか確認
    const cat = await this.prisma.cat.findUnique({
      where: { id: catId },
      include: {
        breed: true,
        coatColor: true,
        father: true,
        mother: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${catId} not found`);
    }

    // すでに卒業済みかチェック
    if (cat.isGraduated) {
      throw new BadRequestException('This cat has already been graduated');
    }

    // トランザクションで処理
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Graduationレコード作成
      const graduation = await tx.graduation.create({
        data: {
          catId: cat.id,
          transferDate: new Date(dto.transferDate),
          destination: dto.destination,
          notes: dto.notes,
          transferredBy: userId,
          catSnapshot: cat, // 猫の全データをスナップショット
        },
      });

      // 2. Catのフラグ更新
      await tx.cat.update({
        where: { id: catId },
        data: {
          isGraduated: true,
          isInHouse: false,
        },
      });

      return graduation;
    });

    return {
      success: true,
      data: result,
    };
  }

  /**
   * 卒業猫一覧取得
   */
  async findAllGraduations(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [graduations, total] = await Promise.all([
      this.prisma.graduation.findMany({
        skip,
        take: limit,
        orderBy: {
          transferDate: 'desc',
        },
        include: {
          cat: {
            select: {
              id: true,
              name: true,
              gender: true,
              birthDate: true,
            },
          },
        },
      }),
      this.prisma.graduation.count(),
    ]);

    return {
      success: true,
      data: graduations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 卒業猫詳細取得
   */
  async findOneGraduation(id: string) {
    const graduation = await this.prisma.graduation.findUnique({
      where: { id },
      include: {
        cat: true,
      },
    });

    if (!graduation) {
      throw new NotFoundException(`Graduation with ID ${id} not found`);
    }

    return {
      success: true,
      data: graduation,
    };
  }

  /**
   * 卒業取り消し（緊急時用）
   */
  async cancelGraduation(id: string) {
    const graduation = await this.prisma.graduation.findUnique({
      where: { id },
    });

    if (!graduation) {
      throw new NotFoundException(`Graduation with ID ${id} not found`);
    }

    // トランザクションで削除とフラグ復元
    await this.prisma.$transaction(async (tx) => {
      // Graduationレコード削除
      await tx.graduation.delete({
        where: { id },
      });

      // Catのフラグ復元
      await tx.cat.update({
        where: { id: graduation.catId },
        data: {
          isGraduated: false,
          isInHouse: true,
        },
      });
    });

    return {
      success: true,
      message: 'Graduation cancelled successfully',
    };
  }
}
```

## File: frontend/src/app/breeding/components/index.ts
```typescript
export { BreedingScheduleTab } from './BreedingScheduleTab';
export type { BreedingScheduleTabProps } from './BreedingScheduleTab';

export { PregnancyCheckTab } from './PregnancyCheckTab';
export type { PregnancyCheckTabProps } from './PregnancyCheckTab';

export { BirthPlanTab } from './BirthPlanTab';
export type { BirthPlanTabProps } from './BirthPlanTab';

export { RaisingTab } from './RaisingTab';
export type { RaisingTabProps } from './RaisingTab';

export { WeightTab } from './WeightTab';
export type { WeightTabProps } from './WeightTab';

export { ShippingTab } from './ShippingTab';
export type { ShippingTabProps } from './ShippingTab';

export { MaleSelectionModal } from './MaleSelectionModal';
export type { MaleSelectionModalProps } from './MaleSelectionModal';

export { FemaleSelectionModal } from './FemaleSelectionModal';
export type { FemaleSelectionModalProps } from './FemaleSelectionModal';

export { BirthInfoModal } from './BirthInfoModal';
export type { BirthInfoModalProps } from './BirthInfoModal';

export { NgRulesModal } from './NgRulesModal';
export type { NgRulesModalProps } from './NgRulesModal';

export { NewRuleModal } from './NewRuleModal';
export type { NewRuleModalProps } from './NewRuleModal';

export { CompleteConfirmModal } from './CompleteConfirmModal';
export type { CompleteConfirmModalProps } from './CompleteConfirmModal';
```

## File: frontend/src/app/breeding/hooks/index.ts
```typescript
export { useBreedingSchedule } from './useBreedingSchedule';
export type { UseBreedingScheduleReturn } from './useBreedingSchedule';
export { useNgPairing } from './useNgPairing';
export type { UseNgPairingParams, UseNgPairingReturn } from './useNgPairing';

// API フックの再エクスポート（使いやすさのため）
export {
  useGetBreedingSchedules,
  useCreateBreedingSchedule,
  useUpdateBreedingSchedule,
  useDeleteBreedingSchedule,
  useGetMatingChecks,
  useCreateMatingCheck,
  useUpdateMatingCheck,
  useDeleteMatingCheck,
  breedingScheduleKeys,
  matingCheckKeys,
} from '@/lib/api/hooks/use-breeding';

export type {
  BreedingSchedule,
  BreedingScheduleStatus,
  BreedingScheduleListResponse,
  CreateBreedingScheduleRequest,
  UpdateBreedingScheduleRequest,
  BreedingScheduleQueryParams,
  MatingCheck,
  CreateMatingCheckRequest,
  UpdateMatingCheckRequest,
} from '@/lib/api/hooks/use-breeding';
```

## File: frontend/src/app/breeding/hooks/useBreedingSchedule.ts
```typescript
/**
 * 交配スケジュール状態管理フック
 * 
 * localStorage によるローカルキャッシュと API 同期の両方をサポート。
 * - オンライン時: API からデータを取得し、localStorage にキャッシュ
 * - オフライン時: localStorage からデータを読み込み
 * - 新規作成/更新/削除: API 経由で実行し、成功時に localStorage を更新
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Cat } from '@/lib/api/hooks/use-cats';
import {
  useGetBreedingSchedules,
  useCreateBreedingSchedule,
  useUpdateBreedingSchedule,
  useDeleteBreedingSchedule,
  useCreateMatingCheck,
  type BreedingSchedule,
  type CreateBreedingScheduleRequest,
  type UpdateBreedingScheduleRequest,
  type CreateMatingCheckRequest,
} from '@/lib/api/hooks/use-breeding';
import type { BreedingScheduleEntry } from '../types';
import { STORAGE_KEYS } from '../types';

export interface UseBreedingScheduleReturn {
  // 状態
  breedingSchedule: Record<string, BreedingScheduleEntry>;
  matingChecks: Record<string, number>;
  activeMales: Cat[];
  selectedYear: number;
  selectedMonth: number;
  defaultDuration: number;
  
  // API 状態
  isLoading: boolean;
  isSyncing: boolean;
  
  // アクション
  setBreedingSchedule: React.Dispatch<React.SetStateAction<Record<string, BreedingScheduleEntry>>>;
  setMatingChecks: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setActiveMales: React.Dispatch<React.SetStateAction<Cat[]>>;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  setDefaultDuration: React.Dispatch<React.SetStateAction<number>>;
  
  // ヘルパー関数
  addMale: (male: Cat) => void;
  removeMale: (maleId: string) => void;
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
  addMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  clearScheduleData: () => void;
  
  // API 同期関数
  createScheduleOnServer: (entry: BreedingScheduleEntry) => Promise<void>;
  updateScheduleOnServer: (scheduleId: string, updates: UpdateBreedingScheduleRequest) => Promise<void>;
  deleteScheduleOnServer: (scheduleId: string) => Promise<void>;
  syncFromServer: () => Promise<void>;
}

/**
 * サーバーのスケジュールデータをローカル形式に変換
 */
function convertServerScheduleToLocal(
  schedule: BreedingSchedule
): Record<string, BreedingScheduleEntry> {
  const result: Record<string, BreedingScheduleEntry> = {};
  const startDate = new Date(schedule.startDate);
  
  for (let i = 0; i < schedule.duration; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    const scheduleKey = `${schedule.maleId}-${dateStr}`;
    
    result[scheduleKey] = {
      maleId: schedule.maleId,
      maleName: schedule.male?.name ?? '',
      femaleId: schedule.femaleId,
      femaleName: schedule.female?.name ?? '',
      date: dateStr,
      duration: schedule.duration,
      dayIndex: i,
      isHistory: schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED',
      result: schedule.status === 'COMPLETED' ? '成功' : schedule.status === 'CANCELLED' ? '失敗' : undefined,
      // サーバー側の ID を保持（更新/削除時に使用）
      serverId: schedule.id,
    };
  }
  
  return result;
}

/**
 * サーバーの交配チェックデータをローカル形式に変換
 */
function convertServerChecksToLocal(
  schedules: BreedingSchedule[]
): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const schedule of schedules) {
    if (!schedule.checks) continue;
    
    for (const check of schedule.checks) {
      const checkDate = new Date(check.checkDate).toISOString().split('T')[0];
      const key = `${schedule.maleId}-${schedule.femaleId}-${checkDate}`;
      result[key] = (result[key] || 0) + check.count;
    }
  }
  
  return result;
}

export function useBreedingSchedule(): UseBreedingScheduleReturn {
  // hydration guard: 初回マウント時に localStorage から読み込むまで保存を抑制
  const hydratedRef = useRef(false);
  const mountCountRef = useRef(0);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [breedingSchedule, setBreedingSchedule] = useState<Record<string, BreedingScheduleEntry>>({});
  const [activeMales, setActiveMales] = useState<Cat[]>([]);
  const [defaultDuration, setDefaultDuration] = useState<number>(1);
  const [matingChecks, setMatingChecks] = useState<Record<string, number>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  // API フック
  const schedulesQuery = useGetBreedingSchedules({}, { enabled: true });
  const createScheduleMutation = useCreateBreedingSchedule();
  const updateScheduleMutation = useUpdateBreedingSchedule();
  const deleteScheduleMutation = useDeleteBreedingSchedule();
  const createMatingCheckMutation = useCreateMatingCheck();

  // localStorageからデータを読み込む
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedActiveMales = localStorage.getItem(STORAGE_KEYS.ACTIVE_MALES);
        if (storedActiveMales) {
          const parsed = JSON.parse(storedActiveMales) as Cat[];
          setActiveMales(parsed);
        }

        const storedDefaultDuration = localStorage.getItem(STORAGE_KEYS.DEFAULT_DURATION);
        if (storedDefaultDuration) {
          const parsed = parseInt(storedDefaultDuration, 10);
          setDefaultDuration(parsed);
        }

        const storedYear = localStorage.getItem(STORAGE_KEYS.SELECTED_YEAR);
        if (storedYear) {
          const parsed = parseInt(storedYear, 10);
          setSelectedYear(parsed);
        }

        const storedMonth = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH);
        if (storedMonth) {
          const parsed = parseInt(storedMonth, 10);
          setSelectedMonth(parsed);
        }

        // スケジュールと交配チェックは API から取得するが、
        // オフライン時のフォールバックとして localStorage からも読み込む
        const storedBreedingSchedule = localStorage.getItem(STORAGE_KEYS.BREEDING_SCHEDULE);
        if (storedBreedingSchedule) {
          const parsed = JSON.parse(storedBreedingSchedule) as Record<string, BreedingScheduleEntry>;
          setBreedingSchedule(parsed);
        }

        const storedMatingChecks = localStorage.getItem(STORAGE_KEYS.MATING_CHECKS);
        if (storedMatingChecks) {
          const parsed = JSON.parse(storedMatingChecks) as Record<string, number>;
          setMatingChecks(parsed);
        }
      } catch (error) {
        console.warn('Failed to load breeding data from localStorage:', error);
      }
    };

    loadFromStorage();
    
    // setTimeoutでhydratedRefをtrueにする
    setTimeout(() => {
      hydratedRef.current = true;
    }, 0);
  }, []);

  // API からデータを取得してローカル状態を更新
  useEffect(() => {
    if (!schedulesQuery.data?.data) return;
    
    const serverSchedules = schedulesQuery.data.data;
    
    // サーバーデータをローカル形式に変換
    let mergedSchedule: Record<string, BreedingScheduleEntry> = {};
    for (const schedule of serverSchedules) {
      const localEntries = convertServerScheduleToLocal(schedule);
      mergedSchedule = { ...mergedSchedule, ...localEntries };
    }
    
    // ローカルの serverId がないエントリ（まだサーバーに保存されていない）を保持
    setBreedingSchedule(prev => {
      const localOnlyEntries: Record<string, BreedingScheduleEntry> = {};
      for (const [key, entry] of Object.entries(prev)) {
        if (!entry.serverId) {
          localOnlyEntries[key] = entry;
        }
      }
      return { ...mergedSchedule, ...localOnlyEntries };
    });
    
    // 交配チェックも同期
    const serverChecks = convertServerChecksToLocal(serverSchedules);
    setMatingChecks(prev => ({ ...prev, ...serverChecks }));
    
  }, [schedulesQuery.data]);

  // コンポーネントのマウント/アンマウントを追跡
  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      hydratedRef.current = false;
    };
  }, []);

  // localStorageにデータを保存する
  useEffect(() => {
    const saveToStorage = () => {
      if (!hydratedRef.current) return;

      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MALES, JSON.stringify(activeMales));
        localStorage.setItem(STORAGE_KEYS.DEFAULT_DURATION, defaultDuration.toString());
        localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, selectedYear.toString());
        localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, selectedMonth.toString());
        if (Object.keys(breedingSchedule).length > 0) {
          localStorage.setItem(STORAGE_KEYS.BREEDING_SCHEDULE, JSON.stringify(breedingSchedule));
        }
        localStorage.setItem(STORAGE_KEYS.MATING_CHECKS, JSON.stringify(matingChecks));
      } catch (error) {
        console.warn('Failed to save breeding data to localStorage:', error);
      }
    };

    saveToStorage();
  }, [activeMales, defaultDuration, selectedYear, selectedMonth, breedingSchedule, matingChecks]);

  // オス猫追加
  const addMale = useCallback((male: Cat) => {
    setActiveMales((prev) => [...prev, male]);
  }, []);

  // オス猫削除
  const removeMale = useCallback((maleId: string) => {
    setActiveMales((prev) => prev.filter((m) => m.id !== maleId));
  }, []);

  // 交配チェック回数を取得
  const getMatingCheckCount = useCallback((maleId: string, femaleId: string, date: string): number => {
    const key = `${maleId}-${femaleId}-${date}`;
    return matingChecks[key] || 0;
  }, [matingChecks]);

  // 交配チェックを追加（ローカル + API）
  const addMatingCheck = useCallback((maleId: string, femaleId: string, date: string) => {
    const key = `${maleId}-${femaleId}-${date}`;
    
    // ローカル状態を即座に更新
    setMatingChecks((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
    
    // 対応するスケジュールの serverId を探す
    const scheduleKey = `${maleId}-${date}`;
    const scheduleEntry = breedingSchedule[scheduleKey];
    
    if (scheduleEntry?.serverId) {
      // サーバーに交配チェックを追加
      const payload: CreateMatingCheckRequest = {
        checkDate: date,
        count: 1,
      };
      
      createMatingCheckMutation.mutate({
        scheduleId: scheduleEntry.serverId,
        payload,
      });
    }
  }, [breedingSchedule, createMatingCheckMutation]);

  // スケジュールデータをクリア
  const clearScheduleData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.BREEDING_SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.MATING_CHECKS);
    setBreedingSchedule({});
    setMatingChecks({});
  }, []);

  // サーバーにスケジュールを作成
  const createScheduleOnServer = useCallback(async (entry: BreedingScheduleEntry) => {
    const payload: CreateBreedingScheduleRequest = {
      maleId: entry.maleId,
      femaleId: entry.femaleId,
      startDate: entry.date,
      duration: entry.duration,
      status: 'SCHEDULED',
    };
    
    try {
      setIsSyncing(true);
      await createScheduleMutation.mutateAsync(payload);
      // 成功時は schedulesQuery が自動的に再取得される
    } finally {
      setIsSyncing(false);
    }
  }, [createScheduleMutation]);

  // サーバーのスケジュールを更新
  const updateScheduleOnServer = useCallback(async (scheduleId: string, updates: UpdateBreedingScheduleRequest) => {
    try {
      setIsSyncing(true);
      await updateScheduleMutation.mutateAsync({ id: scheduleId, payload: updates });
    } finally {
      setIsSyncing(false);
    }
  }, [updateScheduleMutation]);

  // サーバーのスケジュールを削除
  const deleteScheduleOnServer = useCallback(async (scheduleId: string) => {
    try {
      setIsSyncing(true);
      await deleteScheduleMutation.mutateAsync(scheduleId);
    } finally {
      setIsSyncing(false);
    }
  }, [deleteScheduleMutation]);

  // サーバーからデータを再取得
  const syncFromServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      await schedulesQuery.refetch();
    } finally {
      setIsSyncing(false);
    }
  }, [schedulesQuery]);

  // ローディング状態
  const isLoading = useMemo(() => {
    return schedulesQuery.isLoading || 
           createScheduleMutation.isPending || 
           updateScheduleMutation.isPending || 
           deleteScheduleMutation.isPending;
  }, [
    schedulesQuery.isLoading,
    createScheduleMutation.isPending,
    updateScheduleMutation.isPending,
    deleteScheduleMutation.isPending,
  ]);

  return {
    breedingSchedule,
    matingChecks,
    activeMales,
    selectedYear,
    selectedMonth,
    defaultDuration,
    isLoading,
    isSyncing,
    setBreedingSchedule,
    setMatingChecks,
    setActiveMales,
    setSelectedYear,
    setSelectedMonth,
    setDefaultDuration,
    addMale,
    removeMale,
    getMatingCheckCount,
    addMatingCheck,
    clearScheduleData,
    createScheduleOnServer,
    updateScheduleOnServer,
    deleteScheduleOnServer,
    syncFromServer,
  };
}
```

## File: frontend/src/app/breeding/hooks/useNgPairing.ts
```typescript
/**
 * NGペアリング判定フック
 */

import { useCallback } from 'react';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { NgPairingRule } from '../types';

export interface UseNgPairingParams {
  activeMales: Cat[];
  allCats: Cat[];
  ngPairingRules: NgPairingRule[];
}

export interface UseNgPairingReturn {
  isNGPairing: (maleId: string, femaleId: string) => boolean;
  findMatchingRule: (maleId: string, femaleId: string) => NgPairingRule | undefined;
}

export function useNgPairing({
  activeMales,
  allCats,
  ngPairingRules,
}: UseNgPairingParams): UseNgPairingReturn {
  
  const isNGPairing = useCallback((maleId: string, femaleId: string): boolean => {
    const male = activeMales.find((m) => m.id === maleId);
    const female = allCats.find((f) => f.id === femaleId);
    
    if (!male || !female) return false;
    
    const maleTags = male.tags?.map((catTag) => catTag.tag.name) ?? [];
    const femaleTags = female.tags?.map((catTag) => catTag.tag.name) ?? [];
    
    return ngPairingRules.some((rule) => {
      if (!rule.active) return false;
      
      if (rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions) {
        const maleMatches = rule.maleConditions.some((condition) => maleTags.includes(condition));
        const femaleMatches = rule.femaleConditions.some((condition) => femaleTags.includes(condition));
        return maleMatches && femaleMatches;
      }
      
      if (rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames) {
        return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
      }
      
      // generation_limit の実装（将来的にpedigree機能連携）
      if (rule.type === 'GENERATION_LIMIT') {
        return false;
      }
      
      return false;
    });
  }, [activeMales, allCats, ngPairingRules]);

  const findMatchingRule = useCallback((maleId: string, femaleId: string): NgPairingRule | undefined => {
    const male = activeMales.find((m) => m.id === maleId);
    const female = allCats.find((f) => f.id === femaleId);
    
    if (!male || !female) return undefined;
    
    const maleTags = male.tags?.map((catTag) => catTag.tag.name) ?? [];
    const femaleTags = female.tags?.map((catTag) => catTag.tag.name) ?? [];
    
    return ngPairingRules.find((rule) => {
      if (!rule.active) return false;
      
      if (rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions) {
        const maleMatches = rule.maleConditions.some((condition) => maleTags.includes(condition));
        const femaleMatches = rule.femaleConditions.some((condition) => femaleTags.includes(condition));
        return maleMatches && femaleMatches;
      }
      
      if (rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames) {
        return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
      }
      
      return false;
    });
  }, [activeMales, allCats, ngPairingRules]);

  return {
    isNGPairing,
    findMatchingRule,
  };
}
```

## File: frontend/src/app/breeding/types.ts
```typescript
/**
 * 交配管理ページで使用する型定義
 */

import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BreedingNgRuleType } from '@/lib/api/hooks/use-breeding';

/**
 * 交配スケジュールエントリ
 */
export interface BreedingScheduleEntry {
  maleId: string;
  maleName: string;
  femaleId: string;
  femaleName: string;
  date: string;
  duration: number;
  dayIndex: number;
  isHistory: boolean;
  result?: string;
  /** サーバー側のスケジュール ID（API 同期用） */
  serverId?: string;
}

/**
 * NGペアリングルール
 */
export interface NgPairingRule {
  id: string;
  name: string;
  type: BreedingNgRuleType;
  maleConditions?: string[];
  femaleConditions?: string[];
  maleNames?: string[];
  femaleNames?: string[];
  generationLimit?: number | null;
  description?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 新規ルール作成用の状態
 */
export interface NewRuleState {
  name: string;
  type: BreedingNgRuleType;
  maleConditions: string[];
  femaleConditions: string[];
  maleNames: string[];
  femaleNames: string[];
  generationLimit: number | null;
  description: string;
}

/**
 * 月のカレンダー日付
 */
export interface MonthDate {
  date: number;
  dateString: string;
  dayOfWeek: number;
}

/**
 * localStorageキー
 */
export const STORAGE_KEYS = {
  ACTIVE_MALES: 'breeding_active_males',
  DEFAULT_DURATION: 'breeding_default_duration',
  SELECTED_YEAR: 'breeding_selected_year',
  SELECTED_MONTH: 'breeding_selected_month',
  BREEDING_SCHEDULE: 'breeding_schedule',
  MATING_CHECKS: 'breeding_mating_checks',
} as const;

/**
 * 子育て中の母猫情報
 */
export interface MotherWithKittens {
  mother: Cat;
  kittens: Cat[];
}
```

## File: frontend/src/app/breeding/utils.ts
```typescript
/**
 * 交配管理ページで使用するユーティリティ関数
 */

import type { MonthDate } from './types';

/**
 * 指定された年月のカレンダー日付を生成
 */
export const generateMonthDates = (year: number, month: number): MonthDate[] => {
  const dates: MonthDate[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    dates.push({
      date: day,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dayOfWeek: date.getDay(),
    });
  }
  return dates;
};

/**
 * 年齢を月単位で計算
 */
export const calculateAgeInMonths = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  
  // もし今月の日付が誕生日の日付より前なら、1ヶ月引く
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
};

/**
 * 生まれた日を0日として、生後日数を計算
 */
export const calculateAgeInDays = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  
  // ミリ秒の差を日数に変換（生まれた日を0日とする）
  const diffInMs = now.getTime() - birth.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffInDays);
};

/**
 * 日付文字列をフォーマット
 */
export const formatDateJP = (dateString: string): string => {
  if (!dateString) return '不明';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
};
```

## File: frontend/src/app/breeding/components/BirthPlanTab.tsx
```typescript
'use client';

import {
  Card,
  Text,
  Group,
  Flex,
  Stack,
  ActionIcon,
} from '@mantine/core';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface BirthPlanTabProps {
  birthPlans: BirthPlan[];
  allCats: Cat[];
  onBirthConfirm: (item: BirthPlan) => void;
  onBirthCancel: (item: BirthPlan) => void;
}

export function BirthPlanTab({
  birthPlans,
  allCats,
  onBirthConfirm,
  onBirthCancel,
}: BirthPlanTabProps) {
  // EXPECTED ステータスのみ表示
  const expectedPlans = birthPlans.filter((item) => item.status === 'EXPECTED');

  return (
    <Stack gap="sm">
      {expectedPlans.map((item) => {
        // 父猫の名前を取得（fatherIdから）
        const fatherName = item.fatherId 
          ? allCats.find((cat) => cat.id === item.fatherId)?.name || '不明'
          : '不明';
        
        return (
          <Card key={item.id} shadow="sm" padding="sm" radius="md" withBorder>
            <Flex justify="space-between" align="center" wrap="nowrap">
              <Group gap="md" wrap="nowrap">
                <Text fw={600} size="sm">
                  {item.mother?.name || '不明'} ({fatherName})
                </Text>
                <Group gap={4} wrap="nowrap">
                  <Text size="sm" c="dimmed">
                    交配日: {item.matingDate ? new Date(item.matingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '不明'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    出産予定日: {new Date(item.expectedBirthDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                  </Text>
                </Group>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon
                  color="green"
                  variant="light"
                  size="md"
                  onClick={() => onBirthConfirm(item)}
                  title="出産確認"
                >
                  ○
                </ActionIcon>
                <ActionIcon
                  color="red"
                  variant="light"
                  size="md"
                  onClick={() => onBirthCancel(item)}
                  title="出産なし"
                >
                  ×
                </ActionIcon>
              </Group>
            </Flex>
          </Card>
        );
      })}
      {expectedPlans.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          現在出産予定の猫はいません
        </Text>
      )}
    </Stack>
  );
}
```

## File: frontend/src/app/breeding/components/BreedingScheduleTab.tsx
```typescript
'use client';

import {
  Box,
  Card,
  Text,
  Button,
  Group,
  Flex,
  Badge,
  Table,
  Select,
  ActionIcon,
  ScrollArea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { ContextMenuProvider } from '@/components/context-menu';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BreedingScheduleEntry } from '../types';
import { generateMonthDates } from '../utils';

export interface BreedingScheduleTabProps {
  // 状態
  isFullscreen: boolean;
  selectedYear: number;
  selectedMonth: number;
  activeMales: Cat[];
  breedingSchedule: Record<string, BreedingScheduleEntry>;
  selectedMaleForEdit: string | null;
  
  // アクション
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onOpenMaleModal: () => void;
  onMaleSelect: (maleId: string, date: string) => void;
  onMaleNameClick: (maleId: string) => void;
  onRemoveMale: (maleId: string) => void;
  onSaveMaleEdit: () => void;
  onMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  onMatingResult: (maleId: string, femaleId: string, femaleName: string, date: string, result: 'success' | 'failure') => void;
  onScheduleContextAction: (action: string, entity: BreedingScheduleEntry) => void;
  onClearData: () => void;
  
  // ヘルパー
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
}

export function BreedingScheduleTab({
  isFullscreen,
  selectedYear,
  selectedMonth,
  activeMales,
  breedingSchedule,
  selectedMaleForEdit,
  onYearChange,
  onMonthChange,
  onOpenMaleModal,
  onMaleSelect,
  onMaleNameClick,
  onRemoveMale,
  onSaveMaleEdit,
  onMatingCheck,
  onMatingResult,
  onScheduleContextAction,
  onClearData,
  getMatingCheckCount,
}: BreedingScheduleTabProps) {
  const monthDates = generateMonthDates(selectedYear, selectedMonth);

  const handleClearData = () => {
    if (window.confirm('交配管理表のデータをクリアしますか？\n（妊娠確認中・出産予定などのデータは削除されません）')) {
      onClearData();
      notifications.show({
        title: 'クリア完了',
        message: '交配管理表のデータをクリアしました',
        color: 'teal',
      });
    }
  };

  return (
    <Card 
      shadow="sm" 
      padding={isFullscreen ? "xs" : "md"} 
      radius="md" 
      withBorder 
      mb="md"
      style={{ height: isFullscreen ? 'calc(100vh - 180px)' : 'auto' }}
    >
      <Group gap="xs" mb="md" align="flex-end">
        <Select
          value={selectedYear.toString()}
          onChange={(value) => onYearChange(parseInt(value || '2024'))}
          data={['2024', '2025', '2026'].map(year => ({ value: year, label: year }))}
          size={isFullscreen ? "xs" : "sm"}
          styles={{ input: { width: '80px' } }}
        />
        <Text size="sm" pb={isFullscreen ? 4 : 8}>年</Text>
        <Select
          value={selectedMonth.toString()}
          onChange={(value) => onMonthChange(parseInt(value || '8'))}
          data={Array.from({ length: 12 }, (_, i) => ({
            value: (i + 1).toString(),
            label: String(i + 1).padStart(2, '0')
          }))}
          size={isFullscreen ? "xs" : "sm"}
          styles={{ input: { width: '70px' } }}
        />
        <Text size="sm" pb={isFullscreen ? 4 : 8}>月</Text>
        <ActionButton
          action="create"
          onClick={onOpenMaleModal}
          isSectionAction
        >
          オス追加
        </ActionButton>
        <ActionButton
          action="cancel"
          onClick={handleClearData}
          isSectionAction
          title="localStorageに保存された交配管理表のデータをクリア"
        >
          データクリア
        </ActionButton>
      </Group>
      
      <ScrollArea 
        style={{ 
          height: isFullscreen ? 'calc(100% - 80px)' : '600px',
          width: '100%'
        }}
      >
        <Table
          style={{ 
            fontSize: isFullscreen ? '11px' : '14px',
            minWidth: isFullscreen ? '1200px' : '800px',
            position: 'relative'
          }}
        >
          <Table.Thead 
            style={{ 
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--surface)',
              zIndex: 10,
              borderBottom: '2px solid var(--border-subtle)'
            }}
          >
            <Table.Tr>
              <Table.Th 
                style={{ 
                  width: isFullscreen ? 60 : 80,
                  minWidth: isFullscreen ? 60 : 80,
                  maxWidth: isFullscreen ? 60 : 80,
                  position: 'sticky',
                  left: 0,
                  backgroundColor: 'var(--surface)',
                  zIndex: 11,
                  borderRight: '2px solid var(--border-subtle)'
                }}
              >
                <Flex align="center" gap={4} justify="center">
                  <Text size={isFullscreen ? "xs" : "sm"} fw={600}>
                    日付
                  </Text>
                </Flex>
              </Table.Th>
              {activeMales.map((male) => (
                <Table.Th 
                  key={male.id} 
                  style={{ 
                    minWidth: isFullscreen ? 100 : 120,
                    borderRight: '1px solid var(--border-subtle)'
                  }}
                >
                  <Box
                    onClick={() => onMaleNameClick(male.id)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <Text fw={600} size={isFullscreen ? "xs" : "sm"} ta="center">
                      {male.name}
                    </Text>
                  </Box>
                  {selectedMaleForEdit === male.id && (
                    <Group gap="xs" justify="center" mt="xs">
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => onRemoveMale(male.id)}
                      >
                        削除
                      </Button>
                      <Button
                        size="xs"
                        onClick={onSaveMaleEdit}
                      >
                        保存
                      </Button>
                    </Group>
                  )}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {monthDates.map(({ date, dateString, dayOfWeek }) => (
              <Table.Tr key={date}>
                <Table.Td
                  style={{
                    width: isFullscreen ? 60 : 80,
                    minWidth: isFullscreen ? 60 : 80,
                    maxWidth: isFullscreen ? 60 : 80,
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--surface)',
                    zIndex: 5,
                    borderRight: '1px solid var(--border-subtle)'
                  }}
                >
                  <Flex align="center" gap={4} justify="center">
                    <Text 
                      size={isFullscreen ? "xs" : "sm"} 
                      fw={dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400}
                      c={dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : undefined}
                    >
                      {date}日
                    </Text>
                    <Text 
                      size={isFullscreen ? "8px" : "xs"} 
                      c={dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : 'dimmed'}
                    >
                      ({['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]})
                    </Text>
                  </Flex>
                </Table.Td>
                {activeMales.map((male) => {
                  const scheduleKey = `${male.id}-${dateString}`;
                  const schedule = breedingSchedule[scheduleKey];
                  
                  // 次の日も同じ交配期間かチェック
                  const nextDate = new Date(selectedYear, selectedMonth, date + 1);
                  const nextDateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                  const nextScheduleKey = `${male.id}-${nextDateString}`;
                  const nextSchedule = breedingSchedule[nextScheduleKey];
                  const hasNextSameMating = schedule && nextSchedule && 
                    schedule.femaleName === nextSchedule.femaleName && 
                    !schedule.isHistory && !nextSchedule.isHistory;
                  
                  return (
                    <Table.Td 
                      key={male.id} 
                      style={{ 
                        textAlign: 'center',
                        borderRight: hasNextSameMating ? 'none' : '1px solid var(--border-subtle)',
                        backgroundColor: schedule && !schedule.isHistory ? '#fffacd' : 'transparent'
                      }}
                    >
                      {schedule ? (
                        <ScheduleCell
                          schedule={schedule}
                          maleId={male.id}
                          dateString={dateString}
                          isFullscreen={isFullscreen}
                          getMatingCheckCount={getMatingCheckCount}
                          onMatingCheck={onMatingCheck}
                          onMatingResult={onMatingResult}
                          onScheduleContextAction={onScheduleContextAction}
                        />
                      ) : (
                        <Button
                          variant="subtle"
                          size={isFullscreen ? "xs" : "sm"}
                          onClick={() => onMaleSelect(male.id, dateString)}
                          style={{ 
                            width: '100%',
                            height: isFullscreen ? '24px' : '32px'
                          }}
                        >
                          +
                        </Button>
                      )}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

// スケジュールセル内部コンポーネント
interface ScheduleCellProps {
  schedule: BreedingScheduleEntry;
  maleId: string;
  dateString: string;
  isFullscreen: boolean;
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
  onMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  onMatingResult: (maleId: string, femaleId: string, femaleName: string, date: string, result: 'success' | 'failure') => void;
  onScheduleContextAction: (action: string, entity: BreedingScheduleEntry) => void;
}

function ScheduleCell({
  schedule,
  maleId,
  dateString,
  isFullscreen,
  getMatingCheckCount,
  onMatingCheck,
  onMatingResult,
  onScheduleContextAction,
}: ScheduleCellProps) {
  const checkCount = getMatingCheckCount(maleId, schedule.femaleId, dateString);

  if (schedule.isHistory) {
    // 履歴：名前とチェックマークを一行表示
    return (
      <ContextMenuProvider
        entity={schedule}
        actions={['edit', 'delete']}
        onAction={(action) => onScheduleContextAction(action, schedule)}
      >
        <Box 
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: '100%', 
            minHeight: isFullscreen ? '28px' : '32px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            opacity: 0.6, 
            cursor: 'pointer' 
          }}
          title="ダブルクリックまたは右クリックで操作"
        >
          <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
            {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
              <Badge size={isFullscreen ? "xs" : "sm"} color="gray" variant="light">
                {schedule.femaleName}
              </Badge>
            )}
            <Box
              style={{
                flex: 1,
                minHeight: isFullscreen ? '20px' : '24px',
                padding: '2px 4px',
                borderRadius: '3px',
                border: '1px dashed #d3d3d3',
                backgroundColor: checkCount > 0 ? '#f8f8f8' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {checkCount > 0 ? (
                <Text size={isFullscreen ? "8px" : "xs"} c="dimmed" ta="center" lh={1}>
                  {'✓'.repeat(checkCount)}
                </Text>
              ) : (
                <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.3 }} lh={1}>
                  -
                </Text>
              )}
            </Box>
          </Flex>
        </Box>
      </ContextMenuProvider>
    );
  }

  // 現在のスケジュール
  return (
    <ContextMenuProvider
      entity={schedule}
      actions={['edit', 'delete']}
      onAction={(action) => onScheduleContextAction(action, schedule)}
    >
      <Box 
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%', 
          minHeight: isFullscreen ? '28px' : '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          cursor: 'pointer' 
        }}
        title="ダブルクリックまたは右クリックで操作"
      >
        <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
          {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
            <Badge size={isFullscreen ? "xs" : "sm"} color="pink">
              {schedule.femaleName}
            </Badge>
          )}
          
          {schedule.dayIndex === schedule.duration - 1 ? (
            <Group gap={2}>
              <ActionIcon
                size={isFullscreen ? "xs" : "sm"}
                variant="light"
                color="green"
                onClick={(e) => {
                  e.stopPropagation();
                  onMatingResult(maleId, schedule.femaleId, schedule.femaleName, schedule.date, 'success');
                }}
                title="交配成功"
              >
                ○
              </ActionIcon>
              <ActionIcon
                size={isFullscreen ? "xs" : "sm"}
                variant="light"
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onMatingResult(maleId, schedule.femaleId, schedule.femaleName, schedule.date, 'failure');
                }}
                title="交配失敗"
              >
                ×
              </ActionIcon>
            </Group>
          ) : (
            <Box
              style={{
                flex: 1,
                minHeight: isFullscreen ? '16px' : '18px',
                cursor: 'pointer',
                padding: '1px 4px',
                borderRadius: '3px',
                border: '1px dashed var(--border-subtle)',
                backgroundColor: checkCount > 0 ? '#f0f9f0' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onMatingCheck(maleId, schedule.femaleId, dateString);
              }}
              title="クリックして交配記録を追加"
            >
              {checkCount > 0 ? (
                <Text size={isFullscreen ? "8px" : "xs"} c="green" ta="center" lh={1}>
                  {'✓'.repeat(checkCount)}
                </Text>
              ) : (
                <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.5 }} lh={1}>
                  +
                </Text>
              )}
            </Box>
          )}
        </Flex>
      </Box>
    </ContextMenuProvider>
  );
}
```

## File: frontend/src/app/breeding/components/PregnancyCheckTab.tsx
```typescript
'use client';

import {
  Card,
  Text,
  Group,
  Flex,
  Stack,
  ActionIcon,
} from '@mantine/core';
import type { PregnancyCheck } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface PregnancyCheckTabProps {
  pregnancyChecks: PregnancyCheck[];
  allCats: Cat[];
  onPregnancyCheck: (item: PregnancyCheck, isPregnant: boolean) => void;
}

export function PregnancyCheckTab({
  pregnancyChecks,
  allCats,
  onPregnancyCheck,
}: PregnancyCheckTabProps) {
  return (
    <Stack gap="sm">
      {pregnancyChecks.map((item) => {
        // 父猫の名前を取得（fatherIdから）
        const fatherName = item.fatherId 
          ? allCats.find((cat) => cat.id === item.fatherId)?.name || '不明'
          : '不明';
        
        // 確認予定日を計算（交配日の25日後）
        const scheduledCheckDate = item.matingDate 
          ? (() => {
              const date = new Date(item.matingDate);
              date.setDate(date.getDate() + 25);
              return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
            })()
          : '不明';
        
        return (
          <Card key={item.id} shadow="sm" padding="sm" radius="md" withBorder>
            <Flex justify="space-between" align="center" wrap="nowrap">
              <Group gap="md" wrap="nowrap">
                <Text fw={600} size="sm">
                  {item.mother?.name || '不明'} ({fatherName})
                </Text>
                <Group gap={4} wrap="nowrap">
                  <Text size="sm" c="dimmed">
                    交配日: {item.matingDate ? new Date(item.matingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '不明'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    妊娠確認予定日: {scheduledCheckDate}
                  </Text>
                </Group>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon
                  color="green"
                  variant="light"
                  size="md"
                  onClick={() => onPregnancyCheck(item, true)}
                  title="妊娠確定"
                >
                  ○
                </ActionIcon>
                <ActionIcon
                  color="red"
                  variant="light"
                  size="md"
                  onClick={() => onPregnancyCheck(item, false)}
                  title="非妊娠"
                >
                  ×
                </ActionIcon>
              </Group>
            </Flex>
          </Card>
        );
      })}
      {pregnancyChecks.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          現在妊娠確認中の猫はいません
        </Text>
      )}
    </Stack>
  );
}
```

## File: frontend/src/app/breeding/components/WeightTab.tsx
```typescript
'use client';

import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import WeightRecordTable from '@/components/kittens/WeightRecordTable';
import { WeightRecordModal } from '@/components/kittens/WeightRecordModal';
import BulkWeightRecordModal from '@/components/kittens/BulkWeightRecordModal';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';
import { calculateAgeInDays } from '../utils';

interface MotherWithKittens {
  id: string;
  name: string;
  fatherName: string;
  kittens: {
    id: string;
    name: string;
    color: string;
    gender: 'オス' | 'メス';
  }[];
  deliveryDate: string;
  daysOld: number;
}

export interface WeightTabProps {
  /**
   * 登録されているすべての猫一覧（母猫・父猫・子猫を含む）
   */
  allCats: Cat[];
  /**
   * 出産予定および出産済みの計画一覧（母猫や子猫の情報を含む）
   */
  birthPlans: BirthPlan[];
  /**
   * 体重記録や関連データを読み込み中かどうか
   */
  isLoading: boolean;
  /**
   * 体重記録の登録・更新後にデータを再取得するためのコールバック
   */
  onRefetch: () => void;
}

/**
 * 体重管理タブコンポーネント
 * 子猫の体重記録を管理する
 */
export function WeightTab({
  allCats,
  birthPlans,
  isLoading,
  onRefetch,
}: WeightTabProps) {
  // 体重記録モーダル
  const [weightModalOpened, { open: openWeightModal, close: closeWeightModal }] = useDisclosure(false);
  const [selectedKittenForWeight, setSelectedKittenForWeight] = useState<{ id: string; name: string } | null>(null);

  // 一括体重記録モーダル
  const [bulkWeightModalOpened, { open: openBulkWeightModal, close: closeBulkWeightModal }] = useDisclosure(false);

  // 子猫を持つ母猫をフィルタリング
  const mothersWithKittens: MotherWithKittens[] = allCats
    .filter((cat) => {
      // 未完了の出産記録を持つ母猫を確認
      const activeBirthPlan = birthPlans.find(
        (bp) => bp.motherId === cat.id && bp.status === 'BORN' && !bp.completedAt
      );
      
      if (!activeBirthPlan) return false;
      
      // 生後90日以内の子猫がいる母猫を抽出
      const hasYoungKittens = allCats.some((kitten) => {
        if (kitten.motherId !== cat.id) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });
      
      return hasYoungKittens;
    })
    .map((mother) => {
      // この母猫の子猫を取得
      const kittens = allCats.filter((kitten) => {
        if (kitten.motherId !== mother.id) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });

      // 父猫を取得
      const birthPlan = birthPlans.find(
        (bp) => bp.motherId === mother.id && bp.status === 'BORN'
      );
      const father = birthPlan?.fatherId
        ? allCats.find((c) => c.id === birthPlan.fatherId)
        : null;

      // 出産日を取得
      const oldestKitten = kittens.length > 0
        ? kittens.reduce((oldest, k) =>
            new Date(k.birthDate) < new Date(oldest.birthDate) ? k : oldest
          )
        : null;

      const deliveryDate = oldestKitten
        ? new Date(oldestKitten.birthDate).toLocaleDateString('ja-JP')
        : '';

      const daysOld = oldestKitten
        ? calculateAgeInDays(oldestKitten.birthDate)
        : 0;

      return {
        id: mother.id,
        name: mother.name,
        fatherName: father?.name ?? '不明',
        kittens: kittens.map((k) => ({
          id: k.id,
          name: k.name,
          color: k.coatColor?.name ?? '未確認',
          gender: k.gender === 'MALE' ? 'オス' as const : 'メス' as const,
        })),
        deliveryDate,
        daysOld,
      };
    });

  const handleRecordWeight = (kitten: { id: string; name: string }) => {
    setSelectedKittenForWeight(kitten);
    openWeightModal();
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <WeightRecordTable
        motherCats={mothersWithKittens}
        onRecordWeight={handleRecordWeight}
        onBulkRecord={openBulkWeightModal}
      />

      {/* 体重記録モーダル */}
      {selectedKittenForWeight && (
        <WeightRecordModal
          opened={weightModalOpened}
          onClose={closeWeightModal}
          catId={selectedKittenForWeight.id}
          catName={selectedKittenForWeight.name}
          onSuccess={onRefetch}
        />
      )}

      {/* 一括体重記録モーダル */}
      <BulkWeightRecordModal
        opened={bulkWeightModalOpened}
        onClose={closeBulkWeightModal}
        motherGroups={mothersWithKittens.map((mother) => ({
          motherId: mother.id,
          motherName: mother.name,
          fatherName: mother.fatherName,
          deliveryDate: mother.deliveryDate,
          kittens: mother.kittens.map((k) => ({
            id: k.id,
            name: k.name,
            gender: k.gender,
            color: k.color,
          })),
        }))}
        onSuccess={onRefetch}
      />
    </>
  );
}
```

## File: backend/prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Tenant {
  id          String            @id @default(uuid())
  name        String
  slug        String            @unique
  isActive    Boolean           @default(true) @map("is_active")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  invitations InvitationToken[]
  settings    TenantSettings?
  users       User[]
  pedigreePrintSetting PedigreePrintSetting?

  @@index([slug])
  @@index([isActive])
  @@map("tenants")
}

model TenantSettings {
  id               String   @id @default(uuid())
  tenantId         String   @unique @map("tenant_id")
  tagColorDefaults Json?    @map("tag_color_defaults")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_settings")
}

model InvitationToken {
  id        String    @id @default(uuid())
  email     String
  token     String    @unique
  role      UserRole
  tenantId  String    @map("tenant_id")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")
  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([token])
  @@index([tenantId])
  @@index([expiresAt])
  @@map("invitation_tokens")
}

model User {
  id                   String             @id @default(uuid())
  clerkId              String             @unique @map("clerk_id")
  email                String             @unique
  firstName            String?            @map("first_name")
  lastName             String?            @map("last_name")
  role                 UserRole           @default(USER)
  isActive             Boolean            @default(true) @map("is_active")
  passwordHash         String?            @map("password_hash")
  refreshToken         String?            @map("refresh_token")
  failedLoginAttempts  Int                @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime?          @map("locked_until")
  lastLoginAt          DateTime?          @map("last_login_at")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")
  resetPasswordExpires DateTime?          @map("reset_password_expires")
  resetPasswordToken   String?            @map("reset_password_token")
  tenantId             String?            @map("tenant_id")
  birthPlans           BirthPlan[]
  breedingRecords      BreedingRecord[]
  breedingSchedules    BreedingSchedule[]
  careRecords          CareRecord[]
  displayPreference    DisplayPreference?
  loginAttempts        LoginAttempt[]
  medicalRecords       MedicalRecord[]
  pregnancyChecks      PregnancyCheck[]
  schedules            Schedule[]
  staff                Staff?
  tenant               Tenant?            @relation(fields: [tenantId], references: [id])
  weightRecords        WeightRecord[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@index([lastLoginAt])
  @@index([tenantId])
  @@index([role, isActive])
  @@index([isActive, lastLoginAt])
  @@index([tenantId, role])
  @@map("users")
}

model DisplayPreference {
  id                     String          @id @default(uuid())
  userId                 String          @unique @map("user_id")
  breedNameMode          DisplayNameMode @default(CANONICAL) @map("breed_name_mode")
  coatColorNameMode      DisplayNameMode @default(CANONICAL) @map("coat_color_name_mode")
  breedNameOverrides     Json?           @map("breed_name_overrides")
  coatColorNameOverrides Json?           @map("coat_color_name_overrides")
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")
  user                   User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("display_preferences")
}

model LoginAttempt {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  email     String
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  success   Boolean
  reason    String?
  createdAt DateTime @default(now()) @map("created_at")
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
  @@index([success])
  @@index([createdAt])
  @@index([email, createdAt])
  @@index([userId, createdAt])
  @@index([success, createdAt])
  @@map("login_attempts")
}

model Breed {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("breeds")
}

model CoatColor {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("coat_colors")
}

model Gender {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@map("genders")
}

model Cat {
  id                    String                 @id @default(uuid())
  registrationNumber    String?                @unique @map("registration_number")
  name                  String
  breedId               String?                @map("breed_id")
  birthDate             DateTime               @map("birth_date")
  description           String?                @map("notes")
  fatherId              String?                @map("father_id")
  motherId              String?                @map("mother_id")
  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")
  pedigreeId            String?                @map("pedigree_id")
  gender                String
  coatColorId           String?                @map("coat_color_id")
  isInHouse             Boolean                @default(true) @map("is_in_house")
  microchipNumber       String?                @unique @map("microchip_number")
  isGraduated           Boolean                @default(false) @map("is_graduated")
  birthPlans            BirthPlan[]            @relation("BirthPlanMother")
  femaleBreedingRecords BreedingRecord[]       @relation("FemaleBreeding")
  maleBreedingRecords   BreedingRecord[]       @relation("MaleBreeding")
  maleBreedingSchedules BreedingSchedule[]     @relation("BreedingScheduleMale")
  femaleBreedingSchedules BreedingSchedule[]   @relation("BreedingScheduleFemale")
  careRecords           CareRecord[]
  tags                  CatTag[]
  breed                 Breed?                 @relation(fields: [breedId], references: [id])
  coatColor             CoatColor?             @relation(fields: [coatColorId], references: [id])
  father                Cat?                   @relation("CatFather", fields: [fatherId], references: [id])
  fatherOf              Cat[]                  @relation("CatFather")
  mother                Cat?                   @relation("CatMother", fields: [motherId], references: [id])
  motherOf              Cat[]                  @relation("CatMother")
  pedigree              Pedigree?              @relation("CatPedigree", fields: [pedigreeId], references: [pedigreeId])
  galleryEntries        GalleryEntry[]         @relation("GalleryEntryCat")
  graduation            Graduation?
  kittenDispositions    KittenDisposition[]
  medicalRecords        MedicalRecord[]
  pregnancyChecks       PregnancyCheck[]       @relation("PregnancyCheckMother")
  scheduleCats          ScheduleCat[]
  schedules             Schedule[]
  tagHistory            TagAssignmentHistory[]
  weightRecords         WeightRecord[]

  @@index([breedId])
  @@index([coatColorId])
  @@index([fatherId])
  @@index([motherId])
  @@index([birthDate])
  @@index([name])
  @@index([gender])
  @@index([isInHouse])
  @@index([isGraduated])
  @@index([registrationNumber])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedId, name])
  @@index([isInHouse, isGraduated])
  @@index([birthDate, gender])
  @@map("cats")
}

model BreedingRecord {
  id              String         @id @default(uuid())
  maleId          String         @map("male_id")
  femaleId        String         @map("female_id")
  breedingDate    DateTime       @map("breeding_date")
  expectedDueDate DateTime?      @map("expected_due_date")
  actualDueDate   DateTime?      @map("actual_due_date")
  numberOfKittens Int?           @map("number_of_kittens")
  notes           String?
  status          BreedingStatus @default(PLANNED)
  recordedBy      String         @map("recorded_by")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  female          Cat            @relation("FemaleBreeding", fields: [femaleId], references: [id])
  male            Cat            @relation("MaleBreeding", fields: [maleId], references: [id])
  recorder        User           @relation(fields: [recordedBy], references: [id])

  @@index([maleId])
  @@index([femaleId])
  @@index([breedingDate])
  @@index([status])
  @@index([recordedBy])
  @@index([maleId, femaleId])
  @@index([maleId, breedingDate])
  @@index([femaleId, breedingDate])
  @@index([breedingDate, status])
  @@map("breeding_records")
}

model BreedingNgRule {
  id               String             @id @default(uuid())
  name             String
  description      String?
  type             BreedingNgRuleType @default(TAG_COMBINATION)
  maleConditions   String[]           @default([]) @map("male_conditions")
  femaleConditions String[]           @default([]) @map("female_conditions")
  maleNames        String[]           @default([]) @map("male_names")
  femaleNames      String[]           @default([]) @map("female_names")
  generationLimit  Int?               @map("generation_limit")
  active           Boolean            @default(true)
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  @@map("breeding_ng_rules")
}

// 交配スケジュール - 交配期間の管理
model BreedingSchedule {
  id         String                  @id @default(uuid())
  maleId     String                  @map("male_id")
  femaleId   String                  @map("female_id")
  startDate  DateTime                @map("start_date")
  duration   Int                     // 日数
  status     BreedingScheduleStatus  @default(SCHEDULED)
  notes      String?
  recordedBy String                  @map("recorded_by")
  createdAt  DateTime                @default(now()) @map("created_at")
  updatedAt  DateTime                @updatedAt @map("updated_at")

  male       Cat                     @relation("BreedingScheduleMale", fields: [maleId], references: [id])
  female     Cat                     @relation("BreedingScheduleFemale", fields: [femaleId], references: [id])
  recorder   User                    @relation(fields: [recordedBy], references: [id])
  checks     MatingCheck[]

  @@index([maleId])
  @@index([femaleId])
  @@index([startDate])
  @@index([status])
  @@index([maleId, startDate])
  @@index([femaleId, startDate])
  @@map("breeding_schedules")
}

// 交配チェック - 交配確認回数の記録
model MatingCheck {
  id         String           @id @default(uuid())
  scheduleId String           @map("schedule_id")
  checkDate  DateTime         @map("check_date")
  count      Int              @default(1)
  createdAt  DateTime         @default(now()) @map("created_at")

  schedule   BreedingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@index([checkDate])
  @@map("mating_checks")
}

enum BreedingScheduleStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model PregnancyCheck {
  id         String          @id @default(uuid())
  checkDate  DateTime        @map("check_date")
  status     PregnancyStatus @default(SUSPECTED)
  notes      String?
  recordedBy String          @map("recorded_by")
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")
  motherId   String          @map("mother_id")
  fatherId   String?         @map("father_id")
  matingDate DateTime?       @map("mating_date")
  mother     Cat             @relation("PregnancyCheckMother", fields: [motherId], references: [id])
  recorder   User            @relation(fields: [recordedBy], references: [id])

  @@index([motherId])
  @@index([fatherId])
  @@index([checkDate])
  @@index([status])
  @@index([recordedBy])
  @@index([motherId, checkDate])
  @@index([status, checkDate])
  @@map("pregnancy_checks")
}

model BirthPlan {
  id                 String              @id @default(uuid())
  status             BirthStatus         @default(EXPECTED)
  notes              String?
  recordedBy         String              @map("recorded_by")
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  actualBirthDate    DateTime?           @map("actual_birth_date")
  actualKittens      Int?                @map("actual_kittens")
  expectedBirthDate  DateTime            @map("expected_birth_date")
  expectedKittens    Int?                @map("expected_kittens")
  motherId           String              @map("mother_id")
  fatherId           String?             @map("father_id")
  matingDate         DateTime?           @map("mating_date")
  completedAt        DateTime?           @map("completed_at")
  mother             Cat                 @relation("BirthPlanMother", fields: [motherId], references: [id])
  recorder           User                @relation(fields: [recordedBy], references: [id])
  kittenDispositions KittenDisposition[]

  @@index([motherId])
  @@index([fatherId])
  @@index([expectedBirthDate])
  @@index([status])
  @@index([recordedBy])
  @@index([actualBirthDate])
  @@index([motherId, expectedBirthDate])
  @@index([status, expectedBirthDate])
  @@index([expectedBirthDate, status])
  @@map("birth_plans")
}

model KittenDisposition {
  id                String          @id @default(uuid())
  birthRecordId     String          @map("birth_record_id")
  kittenId          String?         @map("kitten_id")
  name              String
  gender            String
  disposition       DispositionType
  trainingStartDate DateTime?       @map("training_start_date")
  saleInfo          Json?           @map("sale_info")
  deathDate         DateTime?       @map("death_date")
  deathReason       String?         @map("death_reason")
  notes             String?
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  birthRecord       BirthPlan       @relation(fields: [birthRecordId], references: [id], onDelete: Cascade)
  kitten            Cat?            @relation(fields: [kittenId], references: [id])

  @@index([birthRecordId])
  @@index([kittenId])
  @@map("kitten_dispositions")
}

model CareRecord {
  id           String    @id @default(uuid())
  catId        String    @map("cat_id")
  careType     CareType  @map("care_type")
  description  String
  careDate     DateTime  @map("care_date")
  nextDueDate  DateTime? @map("next_due_date")
  cost         Float?
  veterinarian String?
  notes        String?
  recordedBy   String    @map("recorded_by")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  cat          Cat       @relation(fields: [catId], references: [id])
  recorder     User      @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([careDate])
  @@index([careType])
  @@index([recordedBy])
  @@index([nextDueDate])
  @@index([catId, careDate])
  @@index([catId, careType])
  @@index([careType, careDate])
  @@index([nextDueDate, careType])
  @@map("care_records")
}

// 体重記録モデル - 子猫の体重推移を追跡
model WeightRecord {
  id         String   @id @default(uuid())
  catId      String   @map("cat_id")
  weight     Float    // グラム単位
  recordedAt DateTime @default(now()) @map("recorded_at")
  notes      String?
  recordedBy String   @map("recorded_by")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  recorder   User     @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([recordedAt])
  @@index([catId, recordedAt])
  @@map("weight_records")
}

model Schedule {
  id             String             @id @default(uuid())
  title          String
  description    String?
  scheduleDate   DateTime           @map("schedule_date")
  scheduleType   ScheduleType       @map("schedule_type")
  status         ScheduleStatus     @default(PENDING)
  priority       Priority           @default(MEDIUM)
  catId          String?            @map("cat_id")
  assignedTo     String             @map("assigned_to")
  createdAt      DateTime           @default(now()) @map("created_at")
  updatedAt      DateTime           @updatedAt @map("updated_at")
  careType       CareType?          @map("care_type")
  endDate        DateTime?          @map("end_date")
  name           String             @map("name")
  recurrenceRule String?            @map("recurrence_rule")
  timezone       String?            @map("timezone")
  medicalRecords MedicalRecord[]
  scheduleCats   ScheduleCat[]
  reminders      ScheduleReminder[]
  tags           ScheduleTag[]
  assignee       User               @relation(fields: [assignedTo], references: [id])
  cat            Cat?               @relation(fields: [catId], references: [id])

  @@index([scheduleDate])
  @@index([endDate])
  @@index([status])
  @@index([catId])
  @@index([assignedTo])
  @@index([careType])
  @@index([scheduleType])
  @@index([priority])
  @@index([scheduleDate, status])
  @@index([catId, scheduleDate])
  @@index([assignedTo, scheduleDate])
  @@index([scheduleType, scheduleDate])
  @@index([status, priority])
  @@map("schedules")
}

model ScheduleReminder {
  id              String                   @id @default(uuid())
  scheduleId      String                   @map("schedule_id")
  timingType      ReminderTimingType       @map("timing_type")
  remindAt        DateTime?                @map("remind_at")
  offsetValue     Int?                     @map("offset_value")
  offsetUnit      ReminderOffsetUnit?      @map("offset_unit")
  relativeTo      ReminderRelativeTo?      @map("relative_to")
  channel         ReminderChannel          @map("channel")
  repeatFrequency ReminderRepeatFrequency? @map("repeat_frequency")
  repeatInterval  Int?                     @map("repeat_interval")
  repeatCount     Int?                     @map("repeat_count")
  repeatUntil     DateTime?                @map("repeat_until")
  notes           String?
  isActive        Boolean                  @default(true) @map("is_active")
  createdAt       DateTime                 @default(now()) @map("created_at")
  updatedAt       DateTime                 @updatedAt @map("updated_at")
  schedule        Schedule                 @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@map("schedule_reminders")
}

model CareTag {
  id           String        @id @default(uuid())
  slug         String        @unique
  label        String
  level        Int           @default(1)
  parentId     String?       @map("parent_id")
  description  String?
  isActive     Boolean       @default(true) @map("is_active")
  priority     Int?
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  parent       CareTag?      @relation("CareTagHierarchy", fields: [parentId], references: [id])
  children     CareTag[]     @relation("CareTagHierarchy")
  scheduleTags ScheduleTag[]

  @@index([parentId])
  @@index([level])
  @@map("care_tags")
}

model ScheduleTag {
  scheduleId String   @map("schedule_id")
  careTagId  String   @map("care_tag_id")
  createdAt  DateTime @default(now()) @map("created_at")
  careTag    CareTag  @relation(fields: [careTagId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, careTagId])
  @@map("schedule_tags")
}

model ScheduleCat {
  scheduleId String   @map("schedule_id")
  catId      String   @map("cat_id")
  createdAt  DateTime @default(now()) @map("created_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, catId])
  @@map("schedule_cats")
}

model MedicalVisitType {
  id           String          @id @default(uuid())
  key          String?         @unique
  name         String
  description  String?
  displayOrder Int             @default(0) @map("display_order")
  isActive     Boolean         @default(true) @map("is_active")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  records      MedicalRecord[]

  @@index([displayOrder])
  @@map("medical_visit_types")
}

model MedicalRecord {
  id             String                    @id @default(uuid())
  catId          String                    @map("cat_id")
  scheduleId     String?                   @map("schedule_id")
  recordedBy     String                    @map("recorded_by")
  visitDate      DateTime                  @map("visit_date")
  symptomDetails Json?                     @map("symptom_details")
  diagnosis      String?                   @map("diagnosis")
  treatmentPlan  String?                   @map("treatment_plan")
  medications    Json?                     @map("medications")
  followUpDate   DateTime?                 @map("follow_up_date")
  status         MedicalRecordStatus       @default(TREATING)
  notes          String?
  createdAt      DateTime                  @default(now()) @map("created_at")
  updatedAt      DateTime                  @updatedAt @map("updated_at")
  diseaseName    String?                   @map("disease_name")
  symptom        String?                   @map("symptom")
  hospitalName   String?                   @map("hospital_name")
  visitTypeId    String?                   @map("visit_type_id")
  attachments    MedicalRecordAttachment[]
  tags           MedicalRecordTag[]
  cat            Cat                       @relation(fields: [catId], references: [id])
  recorder       User                      @relation(fields: [recordedBy], references: [id])
  schedule       Schedule?                 @relation(fields: [scheduleId], references: [id])
  visitType      MedicalVisitType?         @relation(fields: [visitTypeId], references: [id])

  @@index([catId])
  @@index([visitDate])
  @@index([scheduleId])
  @@index([visitTypeId])
  @@index([status])
  @@index([recordedBy])
  @@index([catId, visitDate])
  @@index([visitTypeId, visitDate])
  @@index([status, visitDate])
  @@map("medical_records")
}

model MedicalRecordAttachment {
  id              String        @id @default(uuid())
  medicalRecordId String        @map("medical_record_id")
  url             String
  fileName        String?       @map("file_name")
  fileType        String?       @map("file_type")
  fileSize        Int?          @map("file_size")
  capturedAt      DateTime?     @map("captured_at")
  description     String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)

  @@index([medicalRecordId])
  @@map("medical_record_attachments")
}

model MedicalRecordTag {
  medicalRecordId String        @map("medical_record_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  tagId           String        @map("tag_id")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  tag             Tag           @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([medicalRecordId, tagId])
  @@map("medical_record_tags")
}

model TagCategory {
  id           String     @id @default(uuid())
  key          String     @unique
  name         String
  description  String?
  color        String?    @default("#3B82F6")
  displayOrder Int        @default(0) @map("display_order")
  scopes       String[]   @default([])
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  textColor    String?    @default("#111827") @map("text_color")
  groups       TagGroup[]

  @@map("tag_categories")
}

model TagGroup {
  id           String      @id @default(uuid())
  categoryId   String      @map("category_id")
  name         String
  description  String?
  displayOrder Int         @default(0) @map("display_order")
  isActive     Boolean     @default(true) @map("is_active")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")
  color        String?     @default("#3B82F6")
  textColor    String?     @default("#111827") @map("text_color")
  category     TagCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  tags         Tag[]

  @@unique([categoryId, name])
  @@map("tag_groups")
}

model Tag {
  id                String                 @id @default(uuid())
  name              String
  color             String                 @default("#3B82F6")
  description       String?
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  displayOrder      Int                    @default(0) @map("display_order")
  allowsManual      Boolean                @default(true) @map("allows_manual")
  allowsAutomation  Boolean                @default(true) @map("allows_automation")
  metadata          Json?
  isActive          Boolean                @default(true) @map("is_active")
  groupId           String                 @map("group_id")
  textColor         String                 @default("#FFFFFF") @map("text_color")
  cats              CatTag[]
  medicalRecordTags MedicalRecordTag[]
  history           TagAssignmentHistory[]
  group             TagGroup               @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([groupId, name])
  @@index([groupId])
  @@map("tags")
}

model Pedigree {
  id               String     @id @default(uuid())
  pedigreeId       String     @unique @map("pedigree_id")
  title            String?    @map("title")
  catName          String?    @map("cat_name")
  catName2         String?    @map("cat_name2")
  breedCode        Int?       @map("breed_code")
  genderCode       Int?       @map("gender_code")
  eyeColor         String?    @map("eye_color")
  coatColorCode    Int?       @map("coat_color_code")
  birthDate        String?    @map("birth_date")
  breederName      String?    @map("breeder_name")
  ownerName        String?    @map("owner_name")
  registrationDate String?    @map("registration_date")
  brotherCount     Int?       @map("brother_count")
  sisterCount      Int?       @map("sister_count")
  notes            String?    @map("notes")
  notes2           String?    @map("notes2")
  otherNo          String?    @map("other_no")
  fatherTitle      String?    @map("father_title")
  fatherCatName    String?    @map("father_cat_name")
  fatherCatName2   String?    @map("father_cat_name2")
  fatherCoatColor  String?    @map("father_coat_color")
  fatherEyeColor   String?    @map("father_eye_color")
  fatherJCU        String?    @map("father_jcu")
  fatherOtherCode  String?    @map("father_other_code")
  motherTitle      String?    @map("mother_title")
  motherCatName    String?    @map("mother_cat_name")
  motherCatName2   String?    @map("mother_cat_name2")
  motherCoatColor  String?    @map("mother_coat_color")
  motherEyeColor   String?    @map("mother_eye_color")
  motherJCU        String?    @map("mother_jcu")
  motherOtherCode  String?    @map("mother_other_code")
  ffTitle          String?    @map("ff_title")
  ffCatName        String?    @map("ff_cat_name")
  ffCatColor       String?    @map("ff_cat_color")
  fmTitle          String?    @map("fm_title")
  fmCatName        String?    @map("fm_cat_name")
  fmCatColor       String?    @map("fm_cat_color")
  mfTitle          String?    @map("mf_title")
  mfCatName        String?    @map("mf_cat_name")
  mfCatColor       String?    @map("mf_cat_color")
  mmTitle          String?    @map("mm_title")
  mmCatName        String?    @map("mm_cat_name")
  mmCatColor       String?    @map("mm_cat_color")
  fffTitle         String?    @map("fff_title")
  fffCatName       String?    @map("fff_cat_name")
  fffCatColor      String?    @map("fff_cat_color")
  ffmTitle         String?    @map("ffm_title")
  ffmCatName       String?    @map("ffm_cat_name")
  ffmCatColor      String?    @map("ffm_cat_color")
  fmfTitle         String?    @map("fmf_title")
  fmfCatName       String?    @map("fmf_cat_name")
  fmfCatColor      String?    @map("fmf_cat_color")
  fmmTitle         String?    @map("fmm_title")
  fmmCatName       String?    @map("fmm_cat_name")
  fmmCatColor      String?    @map("fmm_cat_color")
  mffTitle         String?    @map("mff_title")
  mffCatName       String?    @map("mff_cat_name")
  mffCatColor      String?    @map("mff_cat_color")
  mfmTitle         String?    @map("mfm_title")
  mfmCatName       String?    @map("mfm_cat_name")
  mfmCatColor      String?    @map("mfm_cat_color")
  mmfTitle         String?    @map("mmf_title")
  mmfCatName       String?    @map("mmf_cat_name")
  mmfCatColor      String?    @map("mmf_cat_color")
  mmmTitle         String?    @map("mmm_title")
  mmmCatName       String?    @map("mmm_cat_name")
  mmmCatColor      String?    @map("mmm_cat_color")
  oldCode          String?    @map("old_code")
  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")
  fffjcu           String?    @map("fffjcu")
  ffjcu            String?    @map("ffjcu")
  ffmjcu           String?    @map("ffmjcu")
  fmfjcu           String?    @map("fmfjcu")
  fmjcu            String?    @map("fmjcu")
  fmmjcu           String?    @map("fmmjcu")
  mffjcu           String?    @map("mffjcu")
  mfjcu            String?    @map("mfjcu")
  mfmjcu           String?    @map("mfmjcu")
  mmfjcu           String?    @map("mmfjcu")
  mmjcu            String?    @map("mmjcu")
  mmmjcu           String?    @map("mmmjcu")
  cats             Cat[]      @relation("CatPedigree")
  breed            Breed?     @relation(fields: [breedCode], references: [code])
  coatColor        CoatColor? @relation(fields: [coatColorCode], references: [code])
  gender           Gender?    @relation(fields: [genderCode], references: [code])

  @@index([breedCode])
  @@index([genderCode])
  @@index([coatColorCode])
  @@index([catName])
  @@index([pedigreeId])
  @@index([catName2])
  @@index([eyeColor])
  @@index([breederName])
  @@index([ownerName])
  @@index([birthDate])
  @@index([registrationDate])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedCode, catName])
  @@map("pedigrees")
}

model CatTag {
  catId     String   @map("cat_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  cat       Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([catId, tagId])
  @@map("cat_tags")
}

model TagAutomationRule {
  id          String                   @id @default(uuid())
  key         String                   @unique
  name        String
  description String?
  triggerType TagAutomationTriggerType @map("trigger_type")
  eventType   TagAutomationEventType   @map("event_type")
  scope       String?                  @map("scope")
  isActive    Boolean                  @default(true) @map("is_active")
  priority    Int                      @default(0)
  config      Json?                    @map("config")
  createdAt   DateTime                 @default(now()) @map("created_at")
  updatedAt   DateTime                 @updatedAt @map("updated_at")
  history     TagAssignmentHistory[]
  runs        TagAutomationRun[]

  @@map("tag_automation_rules")
}

model TagAutomationRun {
  id           String                 @id @default(uuid())
  ruleId       String                 @map("rule_id")
  eventPayload Json?                  @map("event_payload")
  status       TagAutomationRunStatus @default(PENDING) @map("status")
  startedAt    DateTime?              @map("started_at")
  completedAt  DateTime?              @map("completed_at")
  errorMessage String?                @map("error_message")
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  history      TagAssignmentHistory[]
  rule         TagAutomationRule      @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@index([ruleId])
  @@map("tag_automation_runs")
}

model TagAssignmentHistory {
  id              String              @id @default(uuid())
  catId           String              @map("cat_id")
  tagId           String              @map("tag_id")
  ruleId          String?             @map("rule_id")
  automationRunId String?             @map("automation_run_id")
  action          TagAssignmentAction @default(ASSIGNED)
  source          TagAssignmentSource @default(MANUAL)
  reason          String?
  metadata        Json?
  createdAt       DateTime            @default(now()) @map("created_at")
  automationRun   TagAutomationRun?   @relation(fields: [automationRunId], references: [id])
  cat             Cat                 @relation(fields: [catId], references: [id], onDelete: Cascade)
  rule            TagAutomationRule?  @relation(fields: [ruleId], references: [id])
  tag             Tag                 @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@index([catId])
  @@index([tagId])
  @@index([ruleId])
  @@index([automationRunId])
  @@map("tag_assignment_history")
}

model Staff {
  id               String              @id @default(uuid())
  userId           String?             @unique @map("user_id")
  name             String
  email            String?             @unique
  role             String              @default("スタッフ")
  color            String              @default("#4dabf7")
  isActive         Boolean             @default(true) @map("is_active")
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  workTimeTemplate Json?               @map("work_time_template")
  workingDays      Json?               @map("working_days")
  shifts           Shift[]
  user             User?               @relation(fields: [userId], references: [id])
  availabilities   StaffAvailability[]

  @@index([userId])
  @@index([name])
  @@index([email])
  @@index([isActive])
  @@index([isActive, role])
  @@map("staff")
}

model ShiftTemplate {
  id           String   @id @default(uuid())
  name         String
  startTime    String   @map("start_time")
  endTime      String   @map("end_time")
  duration     Int
  color        String   @default("#4dabf7")
  breakTime    Int      @default(0) @map("break_time")
  isActive     Boolean  @default(true) @map("is_active")
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  shifts       Shift[]

  @@index([name])
  @@index([displayOrder])
  @@map("shift_templates")
}

model Shift {
  id              String         @id @default(uuid())
  staffId         String         @map("staff_id")
  shiftDate       DateTime       @map("shift_date")
  displayName     String?        @map("display_name")
  templateId      String?        @map("template_id")
  startTime       DateTime?      @map("start_time")
  endTime         DateTime?      @map("end_time")
  breakDuration   Int?           @map("break_duration")
  status          ShiftStatus    @default(SCHEDULED)
  notes           String?
  actualStartTime DateTime?      @map("actual_start_time")
  actualEndTime   DateTime?      @map("actual_end_time")
  metadata        Json?
  mode            ShiftMode      @default(SIMPLE)
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  tasks           ShiftTask[]
  staff           Staff          @relation(fields: [staffId], references: [id], onDelete: Cascade)
  template        ShiftTemplate? @relation(fields: [templateId], references: [id])

  @@index([staffId])
  @@index([templateId])
  @@index([shiftDate])
  @@index([status])
  @@index([mode])
  @@index([staffId, shiftDate])
  @@index([shiftDate, status])
  @@index([status, shiftDate])
  @@map("shifts")
}

model ShiftTask {
  id          String     @id @default(uuid())
  shiftId     String     @map("shift_id")
  taskType    String     @map("task_type")
  description String
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  startTime   DateTime?  @map("start_time")
  endTime     DateTime?  @map("end_time")
  notes       String?
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  shift       Shift      @relation(fields: [shiftId], references: [id], onDelete: Cascade)

  @@index([shiftId])
  @@index([status])
  @@map("shift_tasks")
}

model StaffAvailability {
  id          String   @id @default(uuid())
  staffId     String   @map("staff_id")
  dayOfWeek   Int      @map("day_of_week")
  startTime   String   @map("start_time")
  endTime     String   @map("end_time")
  isAvailable Boolean  @default(true) @map("is_available")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  staff       Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
  @@index([dayOfWeek])
  @@index([isAvailable])
  @@index([staffId, dayOfWeek])
  @@index([dayOfWeek, isAvailable])
  @@map("staff_availabilities")
}

model ShiftSettings {
  id                       String    @id @default(uuid())
  organizationId           String?   @map("organization_id")
  defaultMode              ShiftMode @default(SIMPLE) @map("default_mode")
  enabledModes             String[]  @default(["SIMPLE", "DETAILED"]) @map("enabled_modes")
  simpleRequireDisplayName Boolean   @default(false) @map("simple_require_display_name")
  detailedRequireTime      Boolean   @default(true) @map("detailed_require_time")
  detailedRequireTemplate  Boolean   @default(false) @map("detailed_require_template")
  detailedEnableTasks      Boolean   @default(true) @map("detailed_enable_tasks")
  detailedEnableActual     Boolean   @default(true) @map("detailed_enable_actual")
  customFields             Json?     @map("custom_fields")
  createdAt                DateTime  @default(now()) @map("created_at")
  updatedAt                DateTime  @updatedAt @map("updated_at")

  @@map("shift_settings")
}

model Graduation {
  id            String   @id @default(uuid())
  catId         String   @unique @map("cat_id")
  transferDate  DateTime @map("transfer_date")
  destination   String
  notes         String?
  catSnapshot   Json     @map("cat_snapshot")
  transferredBy String?  @map("transferred_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  cat           Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)

  @@index([transferDate])
  @@index([catId])
  @@map("graduations")
}

model GalleryEntry {
  id            String          @id @default(uuid())
  category      GalleryCategory
  name          String
  gender        String
  coatColor     String?         @map("coat_color")
  breed         String?
  catId         String?         @map("cat_id")
  transferDate  DateTime?       @map("transfer_date")
  destination   String?
  externalLink  String?         @map("external_link")
  transferredBy String?         @map("transferred_by")
  catSnapshot   Json?           @map("cat_snapshot")
  notes         String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cat           Cat?            @relation("GalleryEntryCat", fields: [catId], references: [id])
  media         GalleryMedia[]

  @@index([category])
  @@index([catId])
  @@index([createdAt])
  @@index([category, createdAt])
  @@map("gallery_entries")
}

model GalleryMedia {
  id             String       @id @default(uuid())
  galleryEntryId String       @map("gallery_entry_id")
  type           MediaType
  url            String
  thumbnailUrl   String?      @map("thumbnail_url")
  order          Int          @default(0)
  createdAt      DateTime     @default(now()) @map("created_at")
  galleryEntry   GalleryEntry @relation(fields: [galleryEntryId], references: [id], onDelete: Cascade)

  @@index([galleryEntryId])
  @@index([order])
  @@map("gallery_media")
}

// ==========================================
// Pedigree Print Settings
// ==========================================

model PedigreePrintSetting {
  id        String   @id @default(uuid())
  tenantId  String?  @map("tenant_id")
  globalKey String?  @unique @map("global_key")
  settings  Json
  version   Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId])
  @@map("pedigree_print_settings")
}

// ==========================================
// Print Template Management
// ==========================================

model PrintTemplate {
  id                String                @id @default(uuid())
  tenantId          String?               @map("tenant_id") // null = 共通テンプレート
  name              String
  description       String?
  category          PrintTemplateCategory @default(PEDIGREE)
  paperWidth        Int                   @map("paper_width")    // mm単位
  paperHeight       Int                   @map("paper_height")   // mm単位
  backgroundUrl     String?               @map("background_url")
  backgroundOpacity Int                   @default(100) @map("background_opacity") // 0-100%
  positions         Json                  // フィールド座標設定
  fontSizes         Json?                 @map("font_sizes")     // フォントサイズ設定
  isActive          Boolean               @default(true) @map("is_active")
  isDefault         Boolean               @default(false) @map("is_default")
  displayOrder      Int                   @default(0) @map("display_order")
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([category])
  @@index([isActive])
  @@index([name])
  @@index([tenantId, category, isActive])
  @@map("print_templates")
}

enum PrintTemplateCategory {
  PEDIGREE           // 血統書
  KITTEN_TRANSFER    // 子猫譲渡証明書
  HEALTH_CERTIFICATE // 健康診断書
  VACCINATION_RECORD // ワクチン接種記録
  BREEDING_RECORD    // 繁殖記録
  CONTRACT           // 契約書
  INVOICE            // 請求書/領収書
  CUSTOM             // カスタム書類
}

enum DisplayNameMode {
  CANONICAL
  CODE_AND_NAME
  CUSTOM
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TENANT_ADMIN
}

enum BreedingStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum PregnancyStatus {
  CONFIRMED
  SUSPECTED
  NEGATIVE
  ABORTED
}

enum BirthStatus {
  EXPECTED
  BORN
  ABORTED
  STILLBORN
}

enum DispositionType {
  TRAINING
  SALE
  DECEASED
}

enum BreedingNgRuleType {
  TAG_COMBINATION
  INDIVIDUAL_PROHIBITION
  GENERATION_LIMIT
}

enum CareType {
  VACCINATION
  HEALTH_CHECK
  GROOMING
  DENTAL_CARE
  MEDICATION
  SURGERY
  OTHER
}

enum ScheduleType {
  BREEDING
  CARE
  APPOINTMENT
  REMINDER
  MAINTENANCE
}

enum ScheduleStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ReminderTimingType {
  ABSOLUTE
  RELATIVE
}

enum ReminderOffsetUnit {
  MINUTE
  HOUR
  DAY
  WEEK
  MONTH
}

enum ReminderRelativeTo {
  START_DATE
  END_DATE
  CUSTOM_DATE
}

enum ReminderChannel {
  IN_APP
  EMAIL
  SMS
  PUSH
}

enum ReminderRepeatFrequency {
  NONE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}

enum MedicalRecordStatus {
  TREATING
  COMPLETED
}

enum TagAssignmentAction {
  ASSIGNED
  UNASSIGNED
}

enum TagAssignmentSource {
  MANUAL
  AUTOMATION
  SYSTEM
}

enum TagAutomationTriggerType {
  EVENT
  SCHEDULE
  MANUAL
}

enum TagAutomationEventType {
  BREEDING_PLANNED
  BREEDING_CONFIRMED
  PREGNANCY_CONFIRMED
  KITTEN_REGISTERED
  AGE_THRESHOLD
  CUSTOM
  PAGE_ACTION
  TAG_ASSIGNED
}

enum TagAutomationRunStatus {
  PENDING
  COMPLETED
  FAILED
}

enum ShiftMode {
  SIMPLE
  DETAILED
  CUSTOM
}

enum ShiftStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ABSENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum GalleryCategory {
  KITTEN
  FATHER
  MOTHER
  GRADUATION
}

enum MediaType {
  IMAGE
  YOUTUBE
}
```

## File: frontend/src/app/breeding/components/RaisingTab.tsx
```typescript
'use client';

import { Fragment } from 'react';
import {
  Card,
  Text,
  Group,
  Table,
  Badge,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconHomePlus,
  IconHeartHandshake,
  IconCloud,
} from '@tabler/icons-react';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { TagDisplay } from '@/components/TagSelector';
import type { BirthPlan, KittenDisposition } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { TagCategoryView } from '@/lib/api/hooks/use-tags';
import { calculateAgeInDays } from '../utils';

export interface RaisingTabProps {
  allCats: Cat[];
  birthPlans: BirthPlan[];
  tagCategories: TagCategoryView[];
  expandedRaisingCats: Set<string>;
  isLoading: boolean;
  onToggleExpand: (motherId: string) => void;
  onComplete: (birthPlan: BirthPlan) => void;
  onOpenManagementModal: (motherId: string) => void;
}

interface MotherWithKittens {
  mother: Cat;
  kittens: Cat[];
  birthPlan: BirthPlan | undefined;
}

export function RaisingTab({
  allCats,
  birthPlans,
  tagCategories,
  expandedRaisingCats,
  isLoading,
  onToggleExpand,
  onComplete,
  onOpenManagementModal,
}: RaisingTabProps) {
  if (isLoading) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text ta="center" c="dimmed" py="xl">読み込み中...</Text>
      </Card>
    );
  }

  // 子猫を持つ母猫をフィルタリング（完了していない出産記録のみ）
  const mothersWithKittens: MotherWithKittens[] = allCats
    .filter((cat) => {
      // この母猫の未完了の出産記録を確認
      const activeBirthPlan = birthPlans.find(
        (bp) => bp.motherId === cat.id && bp.status === 'BORN' && !bp.completedAt
      );
      
      if (!activeBirthPlan) return false;
      
      // 生後90日以内の子猫がいる母猫を抽出
      const hasYoungKittens = allCats.some((kitten) => {
        if (kitten.motherId !== cat.id) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });
      
      return hasYoungKittens;
    })
    .map((mother) => {
      // この母猫の子猫を取得
      const kittens = allCats.filter((kitten) => {
        if (kitten.motherId !== mother.id) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });

      // この母猫のBirthPlanを取得
      const birthPlan = birthPlans.find(
        (bp) => bp.motherId === mother.id && bp.status === 'BORN' && !bp.completedAt
      );
      
      return { mother, kittens, birthPlan };
    });

  /**
   * 子猫の行先情報を取得
   */
  const getKittenDisposition = (kittenId: string, birthPlan: BirthPlan | undefined): KittenDisposition | undefined => {
    return birthPlan?.kittenDispositions?.find((d) => d.kittenId === kittenId);
  };

  /**
   * 行先アイコンを表示
   */
  const renderDispositionIcon = (disposition: KittenDisposition) => {
    switch (disposition.disposition) {
      case 'TRAINING':
        return (
          <Tooltip label="養成">
            <Box component="span">
              <IconHomePlus size={16} color="var(--mantine-color-blue-6)" />
            </Box>
          </Tooltip>
        );
      case 'SALE':
        return (
          <Tooltip label="出荷">
            <Box component="span">
              <IconHeartHandshake size={16} color="var(--mantine-color-green-6)" />
            </Box>
          </Tooltip>
        );
      case 'DECEASED':
        return (
          <Tooltip label="死亡">
            <Box component="span">
              <IconCloud size={16} color="var(--mantine-color-gray-5)" />
            </Box>
          </Tooltip>
        );
      default:
        return null;
    }
  };

  if (mothersWithKittens.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text ta="center" c="dimmed" py="xl">
          現在子育て中の母猫はいません
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '40px' }}></Table.Th>
            <Table.Th>母猫名</Table.Th>
            <Table.Th>父猫名</Table.Th>
            <Table.Th>出産日</Table.Th>
            <Table.Th>生後</Table.Th>
            <Table.Th>子猫数</Table.Th>
            <Table.Th>行先完了</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mothersWithKittens.map(({ mother, kittens, birthPlan }) => {
            const isExpanded = expandedRaisingCats.has(mother.id);
            const oldestKitten = kittens.length > 0 ? kittens.reduce((oldest, k) => 
              new Date(k.birthDate) < new Date(oldest.birthDate) ? k : oldest
            ) : null;
            
            const ageInDays = oldestKitten 
              ? calculateAgeInDays(oldestKitten.birthDate)
              : 0;

            // 出産数と死亡数を計算
            const totalBorn = birthPlan?.actualKittens || kittens.length;
            const alive = kittens.length;
            const dead = totalBorn - alive;

            // 行先確定済みの子猫数を計算
            const disposedCount = kittens.filter(
              (k) => getKittenDisposition(k.id, birthPlan)
            ).length;
            const allDisposed = disposedCount === kittens.length && kittens.length > 0;

            return (
              <Fragment key={mother.id}>
                {/* 母猫の行 */}
                <Table.Tr
                  style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f8f9fa' : undefined }}
                  onClick={() => onToggleExpand(mother.id)}
                >
                  <Table.Td>
                    {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>{mother.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    {birthPlan?.fatherId
                      ? allCats.find((c) => c.id === birthPlan.fatherId)?.name || '不明'
                      : '不明'
                    }
                  </Table.Td>
                  <Table.Td>
                    {oldestKitten 
                      ? new Date(oldestKitten.birthDate).toLocaleDateString('ja-JP')
                      : '-'
                    }
                  </Table.Td>
                  <Table.Td>
                    {ageInDays}日
                  </Table.Td>
                  <Table.Td>
                    {alive}頭（{totalBorn}-{dead}）
                    {disposedCount > 0 && (
                      <Text size="xs" c="dimmed" component="span" ml={4}>
                        行先{disposedCount}/{kittens.length}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {birthPlan && !birthPlan.completedAt ? (
                      allDisposed ? (
                        <ActionButton
                          action="confirm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onComplete(birthPlan);
                          }}
                        >
                          完了
                        </ActionButton>
                      ) : (
                        <Text size="xs" c="dimmed">行先未確定</Text>
                      )
                    ) : birthPlan?.completedAt ? (
                      <Badge color="green" size="sm">完了済</Badge>
                    ) : (
                      <Text size="sm" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                </Table.Tr>

                {/* 子猫の詳細行 */}
                {isExpanded && kittens.map((kitten) => {
                  const disposition = getKittenDisposition(kitten.id, birthPlan);
                  const hasDisposition = !!disposition;

                  return (
                    <Table.Tr
                      key={kitten.id}
                      style={{
                        backgroundColor: hasDisposition ? 'var(--mantine-color-gray-2)' : '#f8f9fa',
                        opacity: hasDisposition ? 0.6 : 1,
                      }}
                    >
                      <Table.Td></Table.Td>
                      <Table.Td colSpan={1}>
                        <Group gap="xs">
                          <Text
                            size="sm"
                            pl="md"
                            c={hasDisposition ? 'dimmed' : undefined}
                            td={hasDisposition ? 'line-through' : undefined}
                          >
                            {kitten.name}
                          </Text>
                          {disposition && renderDispositionIcon(disposition)}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={hasDisposition ? 'dimmed' : undefined}>
                          {kitten.gender === 'MALE' ? 'オス' : 'メス'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={hasDisposition ? 'dimmed' : undefined}>
                          {kitten.coatColor?.name || '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={hasDisposition ? 'dimmed' : undefined}>
                          {calculateAgeInDays(kitten.birthDate)}日
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {kitten.tags && kitten.tags.length > 0 && (
                            <TagDisplay 
                              tagIds={kitten.tags.map(t => t.tag.id)} 
                              size="xs" 
                              categories={tagCategories}
                              tagMetadata={Object.fromEntries(
                                kitten.tags.map(t => [t.tag.id, t.tag.metadata || {}])
                              )}
                            />
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        {!hasDisposition && (
                          <ActionIconButton
                            action="edit"
                            customIcon={<IconHomePlus size={18} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenManagementModal(mother.id);
                            }}
                            title="行先管理"
                            aria-label="行先管理"
                          />
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
```

## File: frontend/src/app/breeding/components/ShippingTab.tsx
```typescript
'use client';

import {
  Card,
  Text,
  Group,
  Table,
  Badge,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconHomePlus,
  IconHeartHandshake,
  IconChevronRight,
} from '@tabler/icons-react';
import { ActionIconButton } from '@/components/ActionButton';
import { useGetWeightRecords } from '@/lib/api/hooks/use-weight-records';
import {
  useCreateKittenDisposition,
  type BirthPlan,
  type DispositionType,
} from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import { GenderBadge } from '@/components/GenderBadge';
import { notifications } from '@mantine/notifications';
import { calculateAgeInDays } from '../utils';

/** 出荷準備対象となる体重閾値（グラム） */
const SHIPPING_WEIGHT_THRESHOLD = 500;

export interface ShippingTabProps {
  allCats: Cat[];
  birthPlans: BirthPlan[];
  isLoading: boolean;
  onRefetch: () => void;
}

interface KittenWithWeight {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  color: string;
  motherId: string;
  motherName: string;
  fatherName: string;
  birthDate: string;
  birthPlanId: string;
}

/**
 * 出荷準備タブコンポーネント
 * 体重500g超えの子猫を表示し、行先を設定する
 */
export function ShippingTab({
  allCats,
  birthPlans,
  isLoading,
  onRefetch,
}: ShippingTabProps) {
  // 出産記録がある子猫を取得
  const kittensForShipping: KittenWithWeight[] = [];

  birthPlans
    .filter((bp) => bp.status === 'BORN' && !bp.completedAt)
    .forEach((birthPlan) => {
      const mother = allCats.find((c) => c.id === birthPlan.motherId);
      const father = birthPlan.fatherId
        ? allCats.find((c) => c.id === birthPlan.fatherId)
        : null;

      // この母猫の子猫を取得（生後90日以内）
      const kittens = allCats.filter((kitten) => {
        if (kitten.motherId !== birthPlan.motherId) return false;
        
        const ageInDays = calculateAgeInDays(kitten.birthDate);
        
        return ageInDays <= 90;
      });

      kittens.forEach((kitten) => {
        // 既に行先が設定されている子猫はスキップ
        const existingDisposition = birthPlan.kittenDispositions?.find(
          (d) => d.kittenId === kitten.id
        );

        if (existingDisposition) return;

        kittensForShipping.push({
          id: kitten.id,
          name: kitten.name,
          gender: kitten.gender as 'MALE' | 'FEMALE',
          color: kitten.coatColor?.name ?? '未確認',
          motherId: birthPlan.motherId,
          motherName: mother?.name ?? '不明',
          fatherName: father?.name ?? '不明',
          birthDate: kitten.birthDate,
          birthPlanId: birthPlan.id,
        });
      });
    });

  if (isLoading) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      </Card>
    );
  }

  if (kittensForShipping.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text ta="center" c="dimmed" py="xl">
          出荷準備対象の子猫はいません
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Text size="sm" c="dimmed" mb="md">
        生後90日以内で行先未確定の子猫を表示します。体重{SHIPPING_WEIGHT_THRESHOLD}g超えの子猫のみ行先を設定できます。
      </Text>

      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>子猫名</Table.Th>
            <Table.Th>性別</Table.Th>
            <Table.Th>色柄</Table.Th>
            <Table.Th>母猫</Table.Th>
            <Table.Th>最新体重</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>行先</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {kittensForShipping.map((kitten) => (
            <KittenShippingRow
              key={kitten.id}
              kitten={kitten}
              onRefetch={onRefetch}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}

/**
 * 子猫の出荷準備行コンポーネント
 */
interface KittenShippingRowProps {
  kitten: KittenWithWeight;
  onRefetch: () => void;
}

function KittenShippingRow({ kitten, onRefetch }: KittenShippingRowProps) {
  const { data: weightData, isLoading: isWeightLoading } = useGetWeightRecords({
    catId: kitten.id,
    limit: 1,
    sortOrder: 'desc',
  });

  const createDispositionMutation = useCreateKittenDisposition();

  const latestWeight = weightData?.data?.[0]?.weight ?? null;
  const isAboveThreshold = latestWeight !== null && latestWeight >= SHIPPING_WEIGHT_THRESHOLD;

  // 500g未満の場合は表示しない
  if (!isWeightLoading && !isAboveThreshold) {
    return null;
  }

  const handleSetDisposition = (disposition: DispositionType) => {
    // TODO: 将来的には、SALEの場合はモーダルを開いて購入者情報を入力させる
    // 現在は仮データで作成し、後で編集する想定
    createDispositionMutation.mutate(
      {
        birthRecordId: kitten.birthPlanId,
        kittenId: kitten.id,
        name: kitten.name,
        gender: kitten.gender,
        disposition,
        ...(disposition === 'TRAINING' && {
          trainingStartDate: new Date().toISOString().split('T')[0],
        }),
        ...(disposition === 'SALE' && {
          saleInfo: {
            buyer: '',
            price: 0,
            saleDate: new Date().toISOString().split('T')[0],
          },
        }),
        ...(disposition === 'DECEASED' && {
          deathDate: new Date().toISOString().split('T')[0],
        }),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: '行先を登録しました',
            message: `${kitten.name}の行先を登録しました`,
            color: 'green',
          });
          onRefetch();
        },
        onError: (error) => {
          // 行先登録に失敗した場合はユーザーにエラーを通知する
          notifications.show({
            title: '行先の登録に失敗しました',
            message: error instanceof Error 
              ? `エラー: ${error.message}` 
              : '行先の登録中にエラーが発生しました。時間をおいて再度お試しください。',
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <IconChevronRight size={12} color="var(--mantine-color-gray-4)" />
          <Text size="sm">{kitten.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <GenderBadge gender={kitten.gender === 'MALE' ? 'オス' : 'メス'} size="sm" />
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">{kitten.color}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{kitten.motherName}</Text>
      </Table.Td>
      <Table.Td>
        {isWeightLoading ? (
          <Loader size="xs" />
        ) : latestWeight !== null ? (
          <Badge
            size="sm"
            color={isAboveThreshold ? 'green' : 'gray'}
            variant="light"
          >
            {latestWeight}g
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">未記録</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="center">
          <ActionIconButton
            action="confirm"
            customIcon={<IconHomePlus size={18} />}
            onClick={() => handleSetDisposition('TRAINING')}
            loading={createDispositionMutation.isPending}
            title="養成"
            aria-label="養成に設定"
          />
          <ActionIconButton
            action="confirm"
            customIcon={<IconHeartHandshake size={18} />}
            onClick={() => handleSetDisposition('SALE')}
            loading={createDispositionMutation.isPending}
            title="出荷"
            aria-label="出荷に設定"
          />
          <ActionIconButton
            action="delete"
            customIcon={<span>🌈</span>}
            onClick={() => handleSetDisposition('DECEASED')}
            loading={createDispositionMutation.isPending}
            title="死亡"
            aria-label="死亡に設定"
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
```

## File: frontend/src/app/breeding/components/BirthInfoModal.tsx
```typescript
'use client';

import {
  TextInput,
  NumberInput,
  Group,
  Button,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { IconBabyCarriage, IconRainbow } from '@tabler/icons-react';
import { UnifiedModal } from '@/components/common';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface BirthInfoModalProps {
  opened: boolean;
  onClose: () => void;
  selectedBirthPlan: BirthPlan | null;
  allCats: Cat[];
  birthCount: number;
  deathCount: number;
  birthDate: string;
  onBirthCountChange: (count: number) => void;
  onDeathCountChange: (count: number) => void;
  onBirthDateChange: (date: string) => void;
  onSubmit: () => void;
  onDetailSubmit: () => void;
  isLoading: boolean;
}

export function BirthInfoModal({
  opened,
  onClose,
  selectedBirthPlan,
  allCats,
  birthCount,
  deathCount,
  birthDate,
  onBirthCountChange,
  onDeathCountChange,
  onBirthDateChange,
  onSubmit,
  onDetailSubmit,
  isLoading,
}: BirthInfoModalProps) {
  const handleClose = () => {
    onClose();
  };

  // 父猫の名前を取得
  const fatherName = selectedBirthPlan?.fatherId 
    ? allCats.find((cat) => cat.id === selectedBirthPlan.fatherId)?.name || '不明'
    : '不明';

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="出産情報の入力"
      size="md"
    >
      {/* 両親の名前 */}
      <TextInput
        label="両親"
        value={selectedBirthPlan ? `${selectedBirthPlan.mother?.name || '不明'} (${fatherName})` : ''}
        readOnly
      />

      <Divider label="出産情報" labelPosition="center" />

      {/* 出産日 */}
      <TextInput
        label="出産日"
        type="date"
        value={birthDate}
        onChange={(e) => onBirthDateChange(e.target.value)}
      />

      {/* 出産頭数 */}
      <Group gap="sm" align="flex-end">
        <NumberInput
          label="出産頭数"
          value={birthCount}
          onChange={(value) => onBirthCountChange(typeof value === 'number' ? value : 0)}
          min={0}
          style={{ flex: 1 }}
        />
        <ActionIcon
          size="lg"
          variant="light"
          color="blue"
          onClick={() => onBirthCountChange(birthCount + 1)}
          title="1頭追加"
        >
          <IconBabyCarriage size={20} />
        </ActionIcon>
      </Group>

      {/* 死亡数 */}
      <Group gap="sm" align="flex-end">
        <NumberInput
          label="死亡数"
          value={deathCount}
          onChange={(value) => onDeathCountChange(typeof value === 'number' ? value : 0)}
          min={0}
          style={{ flex: 1 }}
        />
        <ActionIcon
          size="lg"
          variant="light"
          color="grape"
          onClick={() => onDeathCountChange(deathCount + 1)}
          title="1頭追加"
        >
          <IconRainbow size={20} />
        </ActionIcon>
      </Group>

      <Divider />

      {/* アクションボタン */}
      <Group justify="flex-end" gap="sm" mt="md">
        <Button
          variant="outline"
          onClick={onDetailSubmit}
        >
          詳細登録
        </Button>
        <Button
          onClick={onSubmit}
          loading={isLoading}
        >
          登録
        </Button>
      </Group>
    </UnifiedModal>
  );
}
```

## File: frontend/src/app/breeding/components/CompleteConfirmModal.tsx
```typescript
'use client';

import {
  Text,
  Group,
  Button,
} from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';

export interface CompleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  selectedBirthPlan: BirthPlan | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CompleteConfirmModal({
  opened,
  onClose,
  selectedBirthPlan,
  onConfirm,
  isLoading,
}: CompleteConfirmModalProps) {
  const sections: ModalSection[] = [
    {
      content: (
        <>
          <Text size="sm">
        {selectedBirthPlan?.mother?.name || '不明'}の出産記録を完了します。
        完了後は子育て中タブから削除され、母猫詳細ページの出産記録に格納されます。
      </Text>
          <Text size="sm" c="dimmed">
            この操作は元に戻せません。
          </Text>
        </>
      ),
    },
    {
      content: (
        <Group justify="flex-end" gap="sm" mt="md">
        <Button
          variant="outline"
          onClick={onClose}
        >
          キャンセル
        </Button>
        <Button
          color="blue"
          onClick={onConfirm}
          loading={isLoading}
        >
            完了する
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="出産記録を完了しますか？"
      centered
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/breeding/components/FemaleSelectionModal.tsx
```typescript
'use client';

import { ChangeEvent } from 'react';
import {
  Stack,
  Text,
  Card,
  Flex,
  Box,
  Group,
  Badge,
  Button,
  NumberInput,
  Checkbox,
  Divider,
} from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface FemaleSelectionModalProps {
  opened: boolean;
  onClose: () => void;
  selectedMale: Cat | null;
  availableFemales: Cat[];
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  onSetDefaultDuration: (duration: number, setAsDefault: boolean) => void;
  onSelectFemale: (femaleId: string) => void;
  isNGPairing: (maleId: string, femaleId: string) => boolean;
}

export function FemaleSelectionModal({
  opened,
  onClose,
  selectedMale,
  availableFemales,
  selectedDuration,
  onDurationChange,
  onSetDefaultDuration,
  onSelectFemale,
  isNGPairing,
}: FemaleSelectionModalProps) {
  const sections: ModalSection[] = [
    {
      content: (
        <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">
          {selectedMale?.name} との交配相手を選択してください
        </Text>
        
        <Stack gap="xs">
          <NumberInput
            label="交配期間"
            description="交配を行う日数を設定してください"
            value={selectedDuration}
            onChange={(value) => onDurationChange(typeof value === 'number' ? value : 1)}
            min={1}
            max={7}
            suffix="日間"
          />
          <Checkbox
            label="この期間をデフォルトに設定"
            size="sm"
            onChange={(event: ChangeEvent<HTMLInputElement>) => 
              onSetDefaultDuration(selectedDuration, event.currentTarget.checked)
            }
          />
        </Stack>

        <Divider label="メス猫一覧" labelPosition="center" />

        {availableFemales.map((female) => {
          const isNG = selectedMale ? isNGPairing(selectedMale.id, female.id) : false;
          return (
            <Card 
              key={female.id} 
              shadow="sm" 
              padding="sm" 
              radius="md" 
              withBorder
              style={{ borderColor: isNG ? '#ff6b6b' : undefined }}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Group gap="xs">
                    <Text fw={600}>{female.name}</Text>
                    {isNG && <Badge color="red" size="xs">NG</Badge>}
                  </Group>
                  <Text size="sm" c="dimmed">{female.breed?.name ?? '不明'}</Text>
                  <Group gap="xs">
                    {female.tags?.map((catTag) => (
                      <Badge key={catTag.tag.id} variant="outline" size="xs">
                        {catTag.tag.name}
                      </Badge>
                    )) ?? []}
                  </Group>
                </Box>
                <Button
                  size="sm"
                  color={isNG ? "red" : undefined}
                  variant={isNG ? "outline" : "filled"}
                  onClick={() => onSelectFemale(female.id)}
                >
                  {isNG ? '警告選択' : '選択'}
                </Button>
              </Flex>
            </Card>
          );
        })}
        {availableFemales.length === 0 && (
          <Text ta="center" c="dimmed">
            現在交配可能なメス猫がいません
          </Text>
        )}
      </Stack>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="交配するメス猫を選択"
      size="md"
      addContentPadding={false}
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/breeding/components/MaleSelectionModal.tsx
```typescript
'use client';

import {
  Stack,
  Text,
  Card,
  Flex,
  Box,
  Group,
  Badge,
  Button,
} from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { Cat } from '@/lib/api/hooks/use-cats';
import { calculateAgeInMonths } from '../utils';

export interface MaleSelectionModalProps {
  opened: boolean;
  onClose: () => void;
  allCats: Cat[];
  activeMales: Cat[];
  onAddMale: (male: Cat) => void;
}

export function MaleSelectionModal({
  opened,
  onClose,
  allCats,
  activeMales,
  onAddMale,
}: MaleSelectionModalProps) {
  // 追加可能なオス猫をフィルタリング（在舎、10ヶ月以上、まだ追加されていない）
  const availableMales = allCats.filter((cat) => 
    cat.gender === 'MALE' && 
    cat.isInHouse && 
    calculateAgeInMonths(cat.birthDate) >= 10 &&
    !activeMales.some((am) => am.id === cat.id)
  );

  const sections: ModalSection[] = [
    {
      content: (
        <Stack gap="sm" p="md">
          <Text size="sm" c="dimmed">
            スケジュールに追加するオス猫を選択してください
          </Text>
          
          {availableMales.map((male) => (
          <Card key={male.id} shadow="sm" padding="sm" radius="md" withBorder>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fw={600}>{male.name}</Text>
                <Text size="sm" c="dimmed">{male.breed?.name ?? '不明'}</Text>
                <Group gap="xs">
                  {male.tags?.map((catTag, index) => (
                    <Badge key={`${catTag.tag.id}-${index}`} variant="outline" size="xs">
                      {catTag.tag.name}
                    </Badge>
                  )) ?? []}
                </Group>
              </Box>
              <Button
                size="sm"
                onClick={() => {
                  onAddMale(male);
                  onClose();
                }}
              >
                追加
              </Button>
            </Flex>
          </Card>
          ))}
          {availableMales.length === 0 && (
            <Text ta="center" c="dimmed">
              追加可能なオス猫がいません
            </Text>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="オス猫をスケジュールに追加"
      size="md"
      addContentPadding={false}
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/breeding/components/NewRuleModal.tsx
```typescript
'use client';

import {
  Stack,
  TextInput,
  NumberInput,
  MultiSelect,
  Radio,
  Group,
  Button,
} from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { BreedingNgRuleType } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { NewRuleState } from '../types';

export interface NewRuleModalProps {
  opened: boolean;
  onClose: () => void;
  newRule: NewRuleState;
  onRuleChange: (rule: NewRuleState) => void;
  availableTags: string[];
  allCats: Cat[];
  onSubmit: () => void;
  isLoading: boolean;
}

export function NewRuleModal({
  opened,
  onClose,
  newRule,
  onRuleChange,
  availableTags,
  allCats,
  onSubmit,
  isLoading,
}: NewRuleModalProps) {
  const handleClose = () => {
    onRuleChange({
      name: '',
      type: 'TAG_COMBINATION',
      maleNames: [],
      femaleNames: [],
      maleConditions: [],
      femaleConditions: [],
      generationLimit: 3,
      description: '',
    });
    onClose();
  };

  const sections: ModalSection[] = [
    {
      content: (
        <TextInput
        label="ルール名"
        placeholder="例: 同血統禁止"
        value={newRule.name}
          onChange={(e) => onRuleChange({ ...newRule, name: e.target.value })}
          required
        />
      ),
    },
    {
      label: "ルール設定",
      content: (
        <>
          <Radio.Group
        label="ルールタイプ"
        value={newRule.type}
        onChange={(value) => onRuleChange({ ...newRule, type: value as BreedingNgRuleType })}
      >
        <Stack gap="xs" mt="xs">
          <Radio value="TAG_COMBINATION" label="タグ組合せ禁止" />
          <Radio value="INDIVIDUAL_PROHIBITION" label="個体間禁止" />
          <Radio value="GENERATION_LIMIT" label="世代制限" />
        </Stack>
      </Radio.Group>

      {newRule.type === 'TAG_COMBINATION' && (
        <>
          <MultiSelect
            label="オス猫の条件タグ"
            placeholder="禁止するオス猫のタグを選択"
            data={availableTags}
            value={newRule.maleConditions}
            onChange={(values) => onRuleChange({ ...newRule, maleConditions: values })}
            searchable
          />
          <MultiSelect
            label="メス猫の条件タグ"
            placeholder="禁止するメス猫のタグを選択"
            data={availableTags}
            value={newRule.femaleConditions}
            onChange={(values) => onRuleChange({ ...newRule, femaleConditions: values })}
            searchable
          />
        </>
      )}

      {newRule.type === 'INDIVIDUAL_PROHIBITION' && (
        <>
          <MultiSelect
            label="禁止するオス猫"
            placeholder="オス猫を選択"
            data={allCats
              .filter((cat) => cat.gender === 'MALE' && cat.isInHouse)
              .map((cat) => ({ value: cat.name, label: cat.name }))}
            value={newRule.maleNames}
            onChange={(values) => onRuleChange({ ...newRule, maleNames: values })}
            searchable
          />
          <MultiSelect
            label="禁止するメス猫"
            placeholder="メス猫を選択"
            data={allCats
              .filter((cat) => cat.gender === 'FEMALE' && cat.isInHouse)
              .map((cat) => ({ value: cat.name, label: cat.name }))}
            value={newRule.femaleNames}
            onChange={(values) => onRuleChange({ ...newRule, femaleNames: values })}
            searchable
          />
        </>
      )}

      {newRule.type === 'GENERATION_LIMIT' && (
        <NumberInput
          label="世代制限"
          placeholder="例: 3"
          value={newRule.generationLimit ?? 3}
          onChange={(value) => onRuleChange({ ...newRule, generationLimit: typeof value === 'number' ? value : 3 })}
          min={1}
          max={10}
        />
      )}

      <TextInput
        label="説明（任意）"
        placeholder="このルールの詳細説明"
          value={newRule.description}
          onChange={(e) => onRuleChange({ ...newRule, description: e.target.value })}
        />
        </>
      ),
    },
    {
      content: (
        <Group justify="flex-end" gap="sm" mt="md">
        <Button
          variant="outline"
          onClick={handleClose}
        >
          キャンセル
        </Button>
        <Button
          onClick={onSubmit}
          loading={isLoading}
        >
            作成
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={handleClose}
      title="新規NGルール作成"
      size="lg"
      centered
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/breeding/components/NgRulesModal.tsx
```typescript
'use client';

import {
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Button,
  ActionIcon,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { NgPairingRule } from '../types';

export interface NgRulesModalProps {
  opened: boolean;
  onClose: () => void;
  ngPairingRules: NgPairingRule[];
  isLoading: boolean;
  error: string | null;
  onOpenNewRuleModal: () => void;
  onDeleteRule: (rule: NgPairingRule) => void;
}

export function NgRulesModal({
  opened,
  onClose,
  ngPairingRules,
  isLoading,
  error,
  onOpenNewRuleModal,
  onDeleteRule,
}: NgRulesModalProps) {
  const sections: ModalSection[] = [
    {
      content: (
        <Text size="sm" c="dimmed">
        交配を禁止するルールを設定できます。設定したルールに該当する組み合わせを選択すると警告が表示されます。
        </Text>
      ),
    },
    {
      content: (
        <Button
        leftSection={<IconPlus size={16} />}
        onClick={onOpenNewRuleModal}
        variant="light"
        fullWidth
      >
        新しいルールを追加
      </Button>
      ),
    },
    {
      label: "登録済みルール",
      content: (
        <>
          {isLoading ? (
        <Text size="sm" c="dimmed" ta="center">
          読み込み中...
        </Text>
      ) : error ? (
        <Text size="sm" c="red" ta="center">
          {error}
        </Text>
      ) : ngPairingRules.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center">
          登録されているルールはありません
        </Text>
      ) : (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            登録済みルール ({ngPairingRules.length}件)
          </Text>
          {ngPairingRules.map((rule) => (
            <Card key={rule.id} p="sm" withBorder>
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {rule.name}
                    </Text>
                    <Badge 
                      size="sm" 
                      variant={rule.active ? 'filled' : 'outline'}
                      color={rule.active ? 'blue' : 'gray'}
                    >
                      {rule.active ? '有効' : '無効'}
                    </Badge>
                    <Badge size="sm" variant="light">
                      {rule.type === 'TAG_COMBINATION' ? 'タグ組合せ' : 
                       rule.type === 'INDIVIDUAL_PROHIBITION' ? '個体禁止' : 
                       rule.type === 'GENERATION_LIMIT' ? '世代制限' : rule.type}
                    </Badge>
                  </Group>
                  {rule.description && (
                    <Text size="xs" c="dimmed">
                      {rule.description}
                    </Text>
                  )}
                  {rule.type === 'INDIVIDUAL_PROHIBITION' && (
                    <Group gap="xs">
                      {rule.maleNames && rule.maleNames.length > 0 && (
                        <Text size="xs" c="dimmed">
                          オス: {rule.maleNames.join(', ')}
                        </Text>
                      )}
                      {rule.femaleNames && rule.femaleNames.length > 0 && (
                        <Text size="xs" c="dimmed">
                          メス: {rule.femaleNames.join(', ')}
                        </Text>
                      )}
                    </Group>
                  )}
                  {rule.type === 'GENERATION_LIMIT' && rule.generationLimit && (
                    <Text size="xs" c="dimmed">
                      世代制限: {rule.generationLimit}世代
                    </Text>
                  )}
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDeleteRule(rule)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
            ))}
          </Stack>
        )}
        </>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="交配NG設定"
      size="xl"
      centered
      sections={sections}
    />
  );
}
```

## File: frontend/src/app/breeding/page.tsx
```typescript
'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Group,
} from '@mantine/core';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { 
  IconHeart, 
  IconCalendar,
  IconPaw,
  IconBabyCarriage,
  IconScale,
  IconTruck,
  IconSettings,
} from '@tabler/icons-react';

import { BreedingScheduleEditModal } from '@/components/breeding/breeding-schedule-edit-modal';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { TabsSection } from '@/components/TabsSection';
import { useContextMenu } from '@/components/context-menu';
import { ActionButton } from '@/components/ActionButton';

import {
  useGetBreedingNgRules,
  useCreateBreedingNgRule,
  useDeleteBreedingNgRule,
  type CreateBreedingNgRuleRequest,
  useGetPregnancyChecks,
  useCreatePregnancyCheck,
  useDeletePregnancyCheck,
  type PregnancyCheck,
  useGetBirthPlans,
  useCreateBirthPlan,
  useDeleteBirthPlan,
  useUpdateBirthPlan,
  type BirthPlan,
  useCompleteBirthRecord,
} from '@/lib/api/hooks/use-breeding';
import { useGetCats, useCreateCat, type Cat, type CreateCatRequest } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';

// 分割したコンポーネント
import {
  BreedingScheduleTab,
  PregnancyCheckTab,
  BirthPlanTab,
  RaisingTab,
  WeightTab,
  ShippingTab,
  MaleSelectionModal,
  FemaleSelectionModal,
  BirthInfoModal,
  NgRulesModal,
  NewRuleModal,
  CompleteConfirmModal,
} from './components';

// カスタムフック
import { useBreedingSchedule } from './hooks';
import { useNgPairing } from './hooks/useNgPairing';

// 型定義
import type { BreedingScheduleEntry, NgPairingRule, NewRuleState } from './types';
import { calculateAgeInMonths } from './utils';

export default function BreedingPage() {
  const { setPageHeader } = usePageHeader();
  
  // カスタムフックから状態を取得
  const {
    breedingSchedule,
    activeMales,
    selectedYear,
    selectedMonth,
    defaultDuration,
    setBreedingSchedule,
    setSelectedYear,
    setSelectedMonth,
    setDefaultDuration,
    addMale,
    removeMale,
    getMatingCheckCount,
    addMatingCheck,
    clearScheduleData,
  } = useBreedingSchedule();

  const [activeTab, setActiveTab] = useState('schedule');
  const [isFullscreen] = useState(false);
  const [selectedMaleForEdit, setSelectedMaleForEdit] = useState<string | null>(null);

  const [selectedMale, setSelectedMale] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [availableFemales, setAvailableFemales] = useState<Cat[]>([]);
  
  // モーダル状態
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [maleModalOpened, { open: openMaleModal, close: closeMaleModal }] = useDisclosure(false);
  const [rulesModalOpened, { open: openRulesModal, close: closeRulesModal }] = useDisclosure(false);
  const [newRuleModalOpened, { open: openNewRuleModal, close: closeNewRuleModal }] = useDisclosure(false);
  const [birthInfoModalOpened, { open: openBirthInfoModal, close: closeBirthInfoModal }] = useDisclosure(false);
  const [scheduleEditModalOpened, { open: openScheduleEditModal, close: closeScheduleEditModal }] = useDisclosure(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<BreedingScheduleEntry | null>(null);
  const [managementModalOpened, { open: openManagementModal, close: closeManagementModal }] = useDisclosure(false);
  const [selectedMotherIdForModal, setSelectedMotherIdForModal] = useState<string | undefined>();
  const [completeConfirmModalOpened, { open: openCompleteConfirmModal, close: closeCompleteConfirmModal }] = useDisclosure(false);
  const [selectedBirthPlanForComplete, setSelectedBirthPlanForComplete] = useState<BirthPlan | null>(null);

  // 出産情報モーダルの状態
  const [selectedBirthPlan, setSelectedBirthPlan] = useState<BirthPlan | null>(null);
  const [birthCount, setBirthCount] = useState<number>(0);
  const [deathCount, setDeathCount] = useState<number>(0);
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedRaisingCats, setExpandedRaisingCats] = useState<Set<string>>(new Set());

  // NGルール状態
  const [ngPairingRules, setNgPairingRules] = useState<NgPairingRule[]>([]);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<NewRuleState>({
    name: '',
    type: 'TAG_COMBINATION',
    maleNames: [],
    femaleNames: [],
    maleConditions: [],
    femaleConditions: [],
    generationLimit: 3,
    description: '',
  });

  // コンテキストメニュー
  const {
    handleAction: handleScheduleContextAction,
  } = useContextMenu<BreedingScheduleEntry>({
    edit: (schedule) => {
      if (schedule) {
        setSelectedScheduleForEdit(schedule);
        openScheduleEditModal();
      }
    },
    delete: (schedule) => {
      if (schedule) {
        setSelectedScheduleForEdit(schedule);
        handleDeleteSchedule();
      }
    },
  });

  // API hooks
  const catsQuery = useGetCats({ limit: 1000 }, { enabled: true });
  const { data: catsResponse } = catsQuery;
  const tagCategoriesQuery = useGetTagCategories();
  const ngRulesQuery = useGetBreedingNgRules();
  const { data: ngRulesResponse, isLoading: isNgRulesLoading, isFetching: isNgRulesFetching, error: ngRulesError } = ngRulesQuery;

  const pregnancyChecksQuery = useGetPregnancyChecks();
  const { data: pregnancyChecksResponse } = pregnancyChecksQuery;
  const createPregnancyCheckMutation = useCreatePregnancyCheck();
  const deletePregnancyCheckMutation = useDeletePregnancyCheck();

  const birthPlansQuery = useGetBirthPlans();
  const { data: birthPlansResponse } = birthPlansQuery;
  const createBirthPlanMutation = useCreateBirthPlan();
  const deleteBirthPlanMutation = useDeleteBirthPlan();
  const updateBirthPlanMutation = useUpdateBirthPlan();
  const createCatMutation = useCreateCat();
  const completeBirthRecordMutation = useCompleteBirthRecord();

  const createNgRuleMutation = useCreateBreedingNgRule();
  const deleteNgRuleMutation = useDeleteBreedingNgRule();

  // NGペアリングフック
  const { isNGPairing, findMatchingRule } = useNgPairing({
    activeMales,
    allCats: catsResponse?.data ?? [],
    ngPairingRules,
  });

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      '交配管理',
      <Group gap="sm">
        <ActionButton
          action="view"
          customIcon={<IconSettings size={18} />}
          onClick={openRulesModal}
        >
          NG設定
        </ActionButton>
      </Group>
    );

    return () => {
      setPageHeader(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // NGルールの読み込み
  useEffect(() => {
    if (!ngRulesResponse) return;
  const remoteRules = (ngRulesResponse.data ?? []) as NgPairingRule[];
  setNgPairingRules(remoteRules.map(rule => ({ ...rule })));
  }, [ngRulesResponse]);

  useEffect(() => {
    if (ngRulesError) {
      setRulesError(ngRulesError instanceof Error ? ngRulesError.message : 'NGルールの取得に失敗しました');
    } else {
      setRulesError(null);
    }
  }, [ngRulesError]);

  // 利用可能なタグ一覧
  const availableTags: string[] = [...new Set(
    (catsResponse?.data ?? [])
      .flatMap((cat: Cat) => cat.tags?.map((catTag) => catTag.tag.name).filter((name: string) => name) ?? [])
      .filter((name: string) => name)
  )];

  // オス猫追加
  const handleAddMale = (maleData: Cat) => {
    addMale(maleData);
    closeMaleModal();
  };

  // オス猫削除
  const handleRemoveMale = (maleId: string) => {
    removeMale(maleId);
    setSelectedMaleForEdit(null);
  };

  // オス猫選択時に交配可能メス一覧を表示
  const handleMaleSelect = (maleId: string, date: string) => {
    setSelectedMale(maleId);
    setSelectedDate(date);
    setSelectedDuration(defaultDuration);
    
    const available = (catsResponse?.data ?? []).filter((cat: Cat) => 
      cat.gender === 'FEMALE' &&
      cat.isInHouse &&
      calculateAgeInMonths(cat.birthDate) >= 11
    );
    setAvailableFemales(available);
    openModal();
  };

  // デフォルト期間を更新
  const handleSetDefaultDuration = (duration: number, setAsDefault: boolean) => {
    if (setAsDefault) {
      setDefaultDuration(duration);
    }
  };

  // 交配結果処理
  const handleMatingResult = (maleId: string, femaleId: string, femaleName: string, matingDate: string, result: 'success' | 'failure') => {
    const male = activeMales.find((m: Cat) => m.id === maleId);
    
    if (result === 'success') {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + 21);
      
      const payload = {
        motherId: femaleId,
        fatherId: maleId,
        matingDate: matingDate,
        checkDate: checkDate.toISOString().split('T')[0],
        status: 'SUSPECTED' as const,
        notes: `${male?.name || ''}との交配による妊娠疑い`,
      };
      
      createPregnancyCheckMutation.mutate(payload, {
        onSuccess: async () => {
          setBreedingSchedule((prev: Record<string, BreedingScheduleEntry>) => {
            const newSchedule = { ...prev };
            Object.keys(newSchedule).forEach(key => {
              if (key.includes(maleId) && newSchedule[key].femaleName === femaleName && !newSchedule[key].isHistory) {
                newSchedule[key] = {
                  ...newSchedule[key],
                  isHistory: true,
                  result: ''
                };
              }
            });
            return newSchedule;
          });
          
          await pregnancyChecksQuery.refetch();
        },
        onError: (error: Error) => {
          let errorMessage = '妊娠確認中リストへの登録に失敗しました';
          if (error.message) {
            errorMessage = error.message;
          }
          
          notifications.show({
            title: '登録失敗',
            message: errorMessage,
            color: 'red',
            autoClose: 15000,
          });
        }
      });
    } else {
      setBreedingSchedule((prev: Record<string, BreedingScheduleEntry>) => {
        const newSchedule = { ...prev };
        Object.keys(newSchedule).forEach(key => {
          if (key.includes(maleId) && newSchedule[key].femaleName === femaleName && !newSchedule[key].isHistory) {
            newSchedule[key] = {
              ...newSchedule[key],
              isHistory: true,
              result: ''
            };
          }
        });
        return newSchedule;
      });
    }
  };

  // 交配期間とメス猫の更新
  const handleUpdateScheduleDuration = (newDuration: number, newFemaleId?: string) => {
    if (!selectedScheduleForEdit) return;

    const { maleId, femaleId, date, duration: oldDuration, dayIndex } = selectedScheduleForEdit;
    
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayIndex);
    
    let newFemaleName = selectedScheduleForEdit.femaleName;
    let finalFemaleId = femaleId;
    
    if (newFemaleId && newFemaleId !== femaleId) {
      const newFemale = catsResponse?.data?.find((f: Cat) => f.id === newFemaleId);
      if (newFemale) {
        newFemaleName = newFemale.name;
        finalFemaleId = newFemaleId;
      }
    }
    
    const newSchedule: Record<string, BreedingScheduleEntry> = {};
    
    for (let i = 0; i < newDuration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const scheduleKey = `${maleId}-${dateStr}`;
      newSchedule[scheduleKey] = {
        ...selectedScheduleForEdit,
        femaleId: finalFemaleId,
        femaleName: newFemaleName,
        date: dateStr,
        duration: newDuration,
        dayIndex: i,
      };
    }
    
    setBreedingSchedule((prev) => {
      const updated = { ...prev };
      
      for (let i = 0; i < oldDuration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduleKey = `${maleId}-${dateStr}`;
        delete updated[scheduleKey];
      }
      
      return { ...updated, ...newSchedule };
    });

    const message = newFemaleId && newFemaleId !== femaleId
      ? `交配期間を${newDuration}日間に変更し、メス猫を${newFemaleName}に変更しました`
      : `交配期間を${newDuration}日間に変更しました`;

    notifications.show({
      title: '更新成功',
      message,
      color: 'green',
    });
  };

  // スケジュールの削除
  const handleDeleteSchedule = () => {
    if (!selectedScheduleForEdit) return;

    const { maleId, date, duration, dayIndex } = selectedScheduleForEdit;
    
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayIndex);
    
    setBreedingSchedule((prev) => {
      const updated = { ...prev };
      
      for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduleKey = `${maleId}-${dateStr}`;
        delete updated[scheduleKey];
      }
      
      return updated;
    });

    notifications.show({
      title: '削除成功',
      message: 'スケジュールを削除しました',
      color: 'green',
    });
  };

  // メス猫をスケジュールに追加
  const handleAddFemaleToSchedule = (femaleId: string) => {
    const female = catsResponse?.data?.find((f: Cat) => f.id === femaleId);
    const male = activeMales.find((m: Cat) => m.id === selectedMale);
    
    if (female && male && selectedDate && selectedMale) {
      const startDate = new Date(selectedDate);
      const scheduleDates: string[] = [];
      for (let i = 0; i < selectedDuration; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        scheduleDates.push(date.toISOString().split('T')[0]);
      }
      
      // 他のオス猫のスケジュールで同じメス猫が同じ日付に入っているかチェック
      const duplicateMales: string[] = [];
      activeMales.forEach((otherMale: Cat) => {
        if (otherMale.id === selectedMale) return;
        
        scheduleDates.forEach(dateStr => {
          const scheduleKey = `${otherMale.id}-${dateStr}`;
          const schedule = breedingSchedule[scheduleKey];
          if (schedule && schedule.femaleId === femaleId && !schedule.isHistory) {
            if (!duplicateMales.includes(otherMale.name)) {
              duplicateMales.push(otherMale.name);
            }
          }
        });
      });
      
      if (duplicateMales.length > 0) {
        const confirmed = window.confirm(
          `警告: ${female.name}は既に以下のオス猫のスケジュールに入っています：\n${duplicateMales.join(', ')}\n\n本当にこのメス猫を追加しますか？`
        );
        
        if (!confirmed) {
          closeModal();
          return;
        }
      }
      
      // NGペアチェック
      if (isNGPairing(selectedMale, femaleId)) {
        const ngRule = findMatchingRule(selectedMale, femaleId);
        
        const confirmed = window.confirm(
          `警告: このペアは「${ngRule?.name}」ルールに該当します。\n${ngRule?.description ?? '詳細が設定されていません。'}\n\n本当に交配を予定しますか？`
        );
        
        if (!confirmed) {
          closeModal();
          return;
        }
      }
      
      // 各日付にスケジュールを追加
      const newSchedules: Record<string, BreedingScheduleEntry> = {};
      scheduleDates.forEach((dateStr, index) => {
        const scheduleKey = `${selectedMale}-${dateStr}`;
        
        const existingPair = breedingSchedule[scheduleKey];
        if (existingPair && index === 0) {
          const success = window.confirm(`前回のペア（${male.name} × ${existingPair.femaleName}）は成功しましたか？`);
          
          if (success) {
            const checkDate = new Date(selectedDate);
            checkDate.setDate(checkDate.getDate() + 21);
            
            createPregnancyCheckMutation.mutate({
              motherId: femaleId,
              checkDate: checkDate.toISOString().split('T')[0],
              status: 'SUSPECTED',
              notes: `${male.name}との交配による妊娠疑い`,
            });
          }
          
          newSchedules[scheduleKey] = {
            ...existingPair,
            isHistory: true,
            result: success ? '成功' : '失敗',
          };
        } else if (!existingPair) {
          newSchedules[scheduleKey] = {
            maleId: selectedMale,
            maleName: male.name,
            femaleId: femaleId,
            femaleName: female.name,
            date: dateStr,
            duration: selectedDuration,
            dayIndex: index,
            isHistory: false,
          };
        }
      });
      
      setBreedingSchedule(prev => ({ ...prev, ...newSchedules }));
    }
    
    closeModal();
  };

  // 妊娠確認
  const handlePregnancyCheck = (checkItem: PregnancyCheck, isPregnant: boolean) => {
    if (isPregnant) {
      const expectedDate = new Date(checkItem.matingDate || checkItem.checkDate);
      expectedDate.setDate(expectedDate.getDate() + 63);
      
      createBirthPlanMutation.mutate({
        motherId: checkItem.motherId,
        fatherId: checkItem.fatherId ?? undefined,
        matingDate: checkItem.matingDate ?? undefined,
        expectedBirthDate: expectedDate.toISOString().split('T')[0],
        status: 'EXPECTED',
        notes: '妊娠確認による出産予定',
      }, {
        onSuccess: async () => {
          await deletePregnancyCheckMutation.mutateAsync(checkItem.id);
          await Promise.all([
            pregnancyChecksQuery.refetch(),
            birthPlansQuery.refetch(),
          ]);
        }
      });
    } else {
      deletePregnancyCheckMutation.mutate(checkItem.id, {
        onSuccess: () => {
          pregnancyChecksQuery.refetch();
        }
      });
    }
  };

  // 出産確認
  const handleBirthConfirm = (item: BirthPlan) => {
    setSelectedBirthPlan(item);
    setBirthCount(0);
    setDeathCount(0);
    setBirthDate(new Date().toISOString().split('T')[0]);
    openBirthInfoModal();
  };

  // 出産キャンセル
  const handleBirthCancel = (item: BirthPlan) => {
    deleteBirthPlanMutation.mutate(item.id);
  };

  // 出産情報登録
  const handleBirthInfoSubmit = async () => {
    if (!selectedBirthPlan) return;
    
    try {
      const birthDateStr = birthDate;
      const aliveCount = birthCount - deathCount;
      
      await updateBirthPlanMutation.mutateAsync({
        id: selectedBirthPlan.id,
        payload: {
          status: 'BORN',
          actualBirthDate: birthDateStr,
          actualKittens: birthCount,
        },
      });
      
      const createPromises: Promise<unknown>[] = [];
      const motherName = selectedBirthPlan.mother?.name || '不明';
      
      for (let i = 0; i < aliveCount; i++) {
        const catData: CreateCatRequest = {
          name: `${motherName}${i + 1}号`,
          gender: 'MALE',
          birthDate: birthDateStr,
          motherId: selectedBirthPlan.motherId,
          fatherId: selectedBirthPlan.fatherId || undefined,
          isInHouse: true,
        };
        
        createPromises.push(createCatMutation.mutateAsync(catData));
      }
      
      await Promise.all(createPromises);
      
      await Promise.all([
        catsQuery.refetch(),
        birthPlansQuery.refetch(),
      ]);
      
      notifications.show({
        title: '出産登録完了',
        message: `${motherName}の出産情報を登録しました（出産: ${birthCount}頭、生存: ${aliveCount}頭、死亡: ${deathCount}頭）`,
        color: 'green',
      });
      
      closeBirthInfoModal();
      setSelectedBirthPlan(null);
      setBirthCount(0);
      setDeathCount(0);
      setBirthDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      notifications.show({
        title: 'エラー',
        message: error instanceof Error ? error.message : '出産情報の登録に失敗しました',
        color: 'red',
      });
    }
  };

  // NGルール削除
  const handleDeleteRule = (rule: NgPairingRule) => {
    if (confirm(`ルール「${rule.name}」を削除しますか？`)) {
      deleteNgRuleMutation.mutate(rule.id, {
        onSuccess: () => {
          notifications.show({
            title: 'ルール削除成功',
            message: `${rule.name}を削除しました`,
            color: 'green',
          });
        },
        onError: (error) => {
          notifications.show({
            title: 'エラー',
            message: error instanceof Error ? error.message : 'ルールの削除に失敗しました',
            color: 'red',
          });
        },
      });
    }
  };

  // NGルール作成
  const handleCreateRule = () => {
    if (!newRule.name.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'ルール名を入力してください',
        color: 'red',
      });
      return;
    }

    const ruleData: CreateBreedingNgRuleRequest = {
      name: newRule.name.trim(),
      type: newRule.type,
      description: newRule.description.trim() || undefined,
      maleNames: newRule.maleNames,
      femaleNames: newRule.femaleNames,
      maleConditions: newRule.maleConditions,
      femaleConditions: newRule.femaleConditions,
      generationLimit: newRule.type === 'GENERATION_LIMIT' ? (newRule.generationLimit ?? undefined) : undefined,
      active: true,
    };

    createNgRuleMutation.mutate(ruleData, {
      onSuccess: () => {
        notifications.show({
          title: 'ルール作成成功',
          message: `${newRule.name}を作成しました`,
          color: 'green',
        });
        closeNewRuleModal();
    setNewRule({
          name: '',
      type: 'TAG_COMBINATION',
      maleNames: [],
      femaleNames: [],
      maleConditions: [],
      femaleConditions: [],
      generationLimit: 3,
      description: '',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : 'ルールの作成に失敗しました',
          color: 'red',
        });
      },
    });
  };

  // 子育て中タブの展開切り替え
  const handleToggleExpand = (motherId: string) => {
    const newExpanded = new Set(expandedRaisingCats);
    if (newExpanded.has(motherId)) {
      newExpanded.delete(motherId);
    } else {
      newExpanded.add(motherId);
    }
    setExpandedRaisingCats(newExpanded);
  };

  // 出産記録完了
  const handleComplete = (birthPlan: BirthPlan) => {
    setSelectedBirthPlanForComplete(birthPlan);
    openCompleteConfirmModal();
  };

  // 出産記録完了確定
  const handleCompleteConfirm = () => {
    if (selectedBirthPlanForComplete) {
      completeBirthRecordMutation.mutate(selectedBirthPlanForComplete.id, {
        onSuccess: () => {
          closeCompleteConfirmModal();
          setSelectedBirthPlanForComplete(null);
        },
      });
    }
  };

  // 子猫管理モーダルを開く
  const handleOpenManagementModal = (motherId: string) => {
    setSelectedMotherIdForModal(motherId);
    openManagementModal();
  };

  // 子育て中タブの母猫数を計算
  const mothersWithKittensCount = (catsResponse?.data || []).filter((cat: Cat) => {
    const hasYoungKittens = (catsResponse?.data || []).some((kitten: Cat) => {
      if (kitten.motherId !== cat.id) return false;
      
      const birthDateObj = new Date(kitten.birthDate);
      const now = new Date();
      const ageInMonths = (now.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      return ageInMonths <= 3;
    });
    
    return hasYoungKittens;
  }).length;

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
  backgroundColor: 'var(--background-base)',
        position: isFullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: isFullscreen ? 9999 : 'auto',
        overflow: isFullscreen ? 'hidden' : 'auto',
      }}
    >
      <Container 
        size={isFullscreen ? "100%" : "xl"} 
        style={{ 
          height: isFullscreen ? 'calc(100vh - 80px)' : 'auto',
          overflow: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        <TabsSection
          value={activeTab}
          onChange={setActiveTab}
          mb="md"
          tabs={[
            {
              value: 'schedule',
              label: '交配管理',
              icon: <IconCalendar size={16} />,
            },
            {
              value: 'pregnancy',
              label: '妊娠確認',
              icon: <IconHeart size={16} />,
              count: pregnancyChecksResponse?.data?.length || 0,
              badgeColor: 'pink',
            },
            {
              value: 'birth',
              label: '出産予定',
              icon: <IconPaw size={16} />,
              count: birthPlansResponse?.data?.filter((item: BirthPlan) => item.status === 'EXPECTED').length || 0,
              badgeColor: 'orange',
            },
            {
              value: 'raising',
              label: '子育て中',
              icon: <IconBabyCarriage size={16} />,
              count: mothersWithKittensCount || 0,
              badgeColor: 'grape',
            },
            {
              value: 'weight',
              label: '体重管理',
              icon: <IconScale size={16} />,
              badgeColor: 'cyan',
            },
            {
              value: 'shipping',
              label: '出荷準備',
              icon: <IconTruck size={16} />,
              badgeColor: 'green',
            },
          ]}
        >
          <>
            {activeTab === 'schedule' && (
              <Box pt="md">
                <BreedingScheduleTab
                  isFullscreen={isFullscreen}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  activeMales={activeMales}
                  breedingSchedule={breedingSchedule}
                  selectedMaleForEdit={selectedMaleForEdit}
                  onYearChange={setSelectedYear}
                  onMonthChange={setSelectedMonth}
                  onOpenMaleModal={openMaleModal}
                  onMaleSelect={handleMaleSelect}
                  onMaleNameClick={(maleId) => setSelectedMaleForEdit(selectedMaleForEdit === maleId ? null : maleId)}
                  onRemoveMale={handleRemoveMale}
                  onSaveMaleEdit={() => setSelectedMaleForEdit(null)}
                  onMatingCheck={addMatingCheck}
                  onMatingResult={handleMatingResult}
                  onScheduleContextAction={handleScheduleContextAction}
                  onClearData={clearScheduleData}
                  getMatingCheckCount={getMatingCheckCount}
                />
              </Box>
            )}

            {activeTab === 'pregnancy' && (
              <Box pt="md">
                <PregnancyCheckTab
                  pregnancyChecks={pregnancyChecksResponse?.data || []}
                  allCats={catsResponse?.data || []}
                  onPregnancyCheck={handlePregnancyCheck}
                />
              </Box>
            )}

            {activeTab === 'birth' && (
              <Box pt="md">
                <BirthPlanTab
                  birthPlans={birthPlansResponse?.data || []}
                  allCats={catsResponse?.data || []}
                  onBirthConfirm={handleBirthConfirm}
                  onBirthCancel={handleBirthCancel}
                />
              </Box>
            )}

            {activeTab === 'raising' && (
              <Box pt="md">
                <RaisingTab
                  allCats={catsResponse?.data || []}
                  birthPlans={birthPlansResponse?.data || []}
                  tagCategories={tagCategoriesQuery.data?.data || []}
                  expandedRaisingCats={expandedRaisingCats}
                  isLoading={catsQuery.isLoading}
                  onToggleExpand={handleToggleExpand}
                  onComplete={handleComplete}
                  onOpenManagementModal={handleOpenManagementModal}
                />
              </Box>
            )}

            {activeTab === 'weight' && (
              <Box pt="md">
                <WeightTab
                  allCats={catsResponse?.data || []}
                  birthPlans={birthPlansResponse?.data || []}
                  isLoading={catsQuery.isLoading}
                  onRefetch={() => {
                    if (catsQuery.refetch) catsQuery.refetch();
                  }}
                />
              </Box>
            )}

            {activeTab === 'shipping' && (
              <Box pt="md">
                <ShippingTab
                  allCats={catsResponse?.data || []}
                  birthPlans={birthPlansResponse?.data || []}
                  isLoading={catsQuery.isLoading}
                  onRefetch={() => {
                    if (catsQuery.refetch) catsQuery.refetch();
                    if (birthPlansQuery.refetch) birthPlansQuery.refetch();
                  }}
                />
              </Box>
            )}
          </>
        </TabsSection>
      </Container>

      {/* モーダル群 */}
      <FemaleSelectionModal
        opened={modalOpened}
        onClose={closeModal}
        selectedMale={activeMales.find((m) => m.id === selectedMale) || null}
        availableFemales={availableFemales}
        selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration}
        onSetDefaultDuration={handleSetDefaultDuration}
        onSelectFemale={handleAddFemaleToSchedule}
        isNGPairing={isNGPairing}
      />

      <MaleSelectionModal
        opened={maleModalOpened}
        onClose={closeMaleModal}
        allCats={catsResponse?.data || []}
        activeMales={activeMales}
        onAddMale={handleAddMale}
      />

      <BirthInfoModal
        opened={birthInfoModalOpened}
        onClose={() => {
          closeBirthInfoModal();
          setSelectedBirthPlan(null);
          setBirthCount(0);
          setDeathCount(0);
          setBirthDate(new Date().toISOString().split('T')[0]);
        }}
        selectedBirthPlan={selectedBirthPlan}
        allCats={catsResponse?.data || []}
        birthCount={birthCount}
        deathCount={deathCount}
        birthDate={birthDate}
        onBirthCountChange={setBirthCount}
        onDeathCountChange={setDeathCount}
        onBirthDateChange={setBirthDate}
        onSubmit={handleBirthInfoSubmit}
        onDetailSubmit={() => {
                console.log('詳細登録:', {
                  birthPlan: selectedBirthPlan,
                  birthCount,
                  deathCount,
                });
              }}
        isLoading={updateBirthPlanMutation.isPending || createCatMutation.isPending}
      />

      <BreedingScheduleEditModal
        opened={scheduleEditModalOpened}
        onClose={closeScheduleEditModal}
        schedule={selectedScheduleForEdit}
        availableFemales={(catsResponse?.data ?? []).filter((cat: Cat) => 
          cat.gender === 'FEMALE' &&
          cat.isInHouse &&
          calculateAgeInMonths(cat.birthDate) >= 11
        )}
        onSave={handleUpdateScheduleDuration}
        onDelete={handleDeleteSchedule}
      />

      <KittenManagementModal
        opened={managementModalOpened}
        onClose={closeManagementModal}
        motherId={selectedMotherIdForModal}
        onSuccess={() => {
          if (catsQuery.refetch) catsQuery.refetch();
          if (birthPlansQuery.refetch) birthPlansQuery.refetch();
        }}
      />

      <CompleteConfirmModal
        opened={completeConfirmModalOpened}
        onClose={closeCompleteConfirmModal}
        selectedBirthPlan={selectedBirthPlanForComplete}
        onConfirm={handleCompleteConfirm}
        isLoading={completeBirthRecordMutation.isPending}
      />

      <NgRulesModal
        opened={rulesModalOpened}
        onClose={closeRulesModal}
        ngPairingRules={ngPairingRules}
        isLoading={isNgRulesLoading || isNgRulesFetching}
        error={rulesError}
        onOpenNewRuleModal={openNewRuleModal}
        onDeleteRule={handleDeleteRule}
      />

      <NewRuleModal
        opened={newRuleModalOpened}
        onClose={closeNewRuleModal}
        newRule={newRule}
        onRuleChange={setNewRule}
        availableTags={availableTags}
        allCats={catsResponse?.data || []}
        onSubmit={handleCreateRule}
        isLoading={createNgRuleMutation.isPending}
      />
    </Box>
  );
}
```

## File: frontend/src/app/kittens/page.tsx
```typescript
'use client';

import { Box, Title, Text } from '@mantine/core';

export default function KittensPage() {
  return (
  <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)', padding: '2rem' }}>
      <Title order={1} c="blue" mb="md">子猫管理</Title>
      <Text>生まれた子猫の記録や管理を行うページです（今後実装予定）。</Text>
    </Box>
  );
}
```
