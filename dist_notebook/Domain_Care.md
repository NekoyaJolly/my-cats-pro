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
- Only files matching these patterns are included: backend/prisma/schema.prisma, backend/src/care/**, frontend/src/app/care/**, frontend/src/app/medical-records/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
backend/
  prisma/
    schema.prisma
  src/
    care/
      dto/
        care-query.dto.ts
        care-schedule-response.dto.ts
        complete-care.dto.ts
        create-care-schedule.dto.ts
        create-medical-record.dto.ts
        index.ts
        medical-record-query.dto.ts
        medical-record-response.dto.ts
      care.controller.spec.ts
      care.controller.ts
      care.module.ts
      care.service.spec.ts
      care.service.ts
      json-value.utils.spec.ts
      json-value.utils.ts
      recurrence.utils.spec.ts
      recurrence.utils.ts
frontend/
  src/
    app/
      care/
        page.tsx
      medical-records/
        page.tsx
```

# Files

## File: backend/src/care/dto/care-query.dto.ts
```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CareType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";

export class CareQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "猫ID",
    example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60",
  })
  @IsOptional()
  @IsUUID()
  catId?: string;

  @ApiPropertyOptional({
    description: "ケア種別",
    enum: CareType,
    example: CareType.VACCINATION,
  })
  @IsOptional()
  @IsEnum(CareType)
  careType?: CareType;

  @ApiPropertyOptional({
    description: "開始日 (YYYY-MM-DD)",
    example: "2025-08-01",
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "終了日 (YYYY-MM-DD)",
    example: "2025-08-31",
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
```

## File: backend/src/care/dto/care-schedule-response.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CareType,
  Priority,
  ReminderChannel,
  ReminderOffsetUnit,
  ReminderRelativeTo,
  ReminderRepeatFrequency,
  ReminderTimingType,
  ScheduleStatus,
  ScheduleType,
} from "@prisma/client";

class CareScheduleCatDto {
  @ApiProperty({ example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  id!: string;

  @ApiProperty({ example: "レオ" })
  name!: string;
}

class CareScheduleReminderDto {
  @ApiProperty({ example: "f1e2d3c4-b5a6-7890-1234-56789abcdef0" })
  id!: string;

  @ApiProperty({ enum: ReminderTimingType, example: ReminderTimingType.ABSOLUTE })
  timingType!: ReminderTimingType;

  @ApiPropertyOptional({ example: "2025-08-01T09:00:00.000Z" })
  remindAt!: string | null;

  @ApiPropertyOptional({ example: 2 })
  offsetValue!: number | null;

  @ApiPropertyOptional({ enum: ReminderOffsetUnit, example: ReminderOffsetUnit.DAY })
  offsetUnit!: ReminderOffsetUnit | null;

  @ApiPropertyOptional({ enum: ReminderRelativeTo, example: ReminderRelativeTo.START_DATE })
  relativeTo!: ReminderRelativeTo | null;

  @ApiProperty({ enum: ReminderChannel, example: ReminderChannel.IN_APP })
  channel!: ReminderChannel;

  @ApiPropertyOptional({
    enum: ReminderRepeatFrequency,
    example: ReminderRepeatFrequency.NONE,
  })
  repeatFrequency!: ReminderRepeatFrequency | null;

  @ApiPropertyOptional({ example: 1 })
  repeatInterval!: number | null;

  @ApiPropertyOptional({ example: 5 })
  repeatCount!: number | null;

  @ApiPropertyOptional({ example: "2025-12-31T00:00:00.000Z" })
  repeatUntil!: string | null;

  @ApiPropertyOptional({ example: "前日9時に通知" })
  notes!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

class CareScheduleTagDto {
  @ApiProperty({ example: "a1b2c3d4-5678-90ab-cdef-1234567890ab" })
  id!: string;

  @ApiProperty({ example: "vaccination" })
  slug!: string;

  @ApiProperty({ example: "ワクチン" })
  label!: string;

  @ApiProperty({ example: 1 })
  level!: number;

  @ApiPropertyOptional({ example: "parent-tag-id" })
  parentId!: string | null;
}

export class CareScheduleItemDto {
  @ApiProperty({ example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  id!: string;

  @ApiProperty({ example: "年次健康診断" })
  name!: string;

  @ApiProperty({ example: "年次健康診断" })
  title!: string;

  @ApiProperty({ example: "毎年の定期健診" })
  description!: string | null;

  @ApiProperty({ example: "2025-09-01T00:00:00.000Z" })
  scheduleDate!: string;

  @ApiPropertyOptional({ example: "2025-09-01T01:00:00.000Z" })
  endDate!: string | null;

  @ApiPropertyOptional({ example: "Asia/Tokyo" })
  timezone!: string | null;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.CARE })
  scheduleType!: ScheduleType;

  @ApiProperty({ enum: ScheduleStatus, example: ScheduleStatus.PENDING })
  status!: ScheduleStatus;

  @ApiProperty({ enum: CareType, example: CareType.HEALTH_CHECK, nullable: true })
  careType!: CareType | null;

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  priority!: Priority;

  @ApiPropertyOptional({ example: "FREQ=YEARLY;INTERVAL=1" })
  recurrenceRule!: string | null;

  @ApiProperty({ example: "f3a2c1d7-1234-5678-90ab-cdef12345678" })
  assignedTo!: string;

  @ApiProperty({ type: CareScheduleCatDto, nullable: true })
  cat!: CareScheduleCatDto | null;

  @ApiProperty({ type: [CareScheduleCatDto], description: "対象猫の配列" })
  cats!: CareScheduleCatDto[];

  @ApiProperty({ type: [CareScheduleReminderDto] })
  reminders!: CareScheduleReminderDto[];

  @ApiProperty({ type: [CareScheduleTagDto] })
  tags!: CareScheduleTagDto[];

  @ApiProperty({ example: "2025-08-01T00:00:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2025-08-15T12:34:56.000Z" })
  updatedAt!: string;
}

export class CareScheduleMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class CareScheduleResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: CareScheduleItemDto })
  data!: CareScheduleItemDto;
}

export class CareScheduleListResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: [CareScheduleItemDto] })
  data!: CareScheduleItemDto[];

  @ApiProperty({ type: CareScheduleMetaDto })
  meta!: CareScheduleMetaDto;
}

export class CareCompleteResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({
    example: {
      scheduleId: "a6f7e52f-4a3b-4a76-9870-1234567890ab",
      recordId: "bcdef123-4567-890a-bcde-f1234567890a",
      medicalRecordId: "f1234567-89ab-cdef-0123-456789abcdef",
    },
  })
  data!: {
    scheduleId: string;
    recordId: string;
    medicalRecordId?: string | null;
  };
}

export type CareScheduleMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CareScheduleData = {
  id: string;
  name: string;
  title: string;
  description: string | null;
  scheduleDate: string;
  endDate: string | null;
  timezone: string | null;
  scheduleType: ScheduleType;
  status: ScheduleStatus;
  careType: CareType | null;
  priority: Priority;
  recurrenceRule: string | null;
  assignedTo: string;
  cat: { id: string; name: string } | null;
  cats: { id: string; name: string }[];
  reminders: {
    id: string;
    timingType: ReminderTimingType;
    remindAt: string | null;
    offsetValue: number | null;
    offsetUnit: ReminderOffsetUnit | null;
    relativeTo: ReminderRelativeTo | null;
    channel: ReminderChannel;
    repeatFrequency: ReminderRepeatFrequency | null;
    repeatInterval: number | null;
    repeatCount: number | null;
    repeatUntil: string | null;
    notes: string | null;
    isActive: boolean;
  }[];
  tags: {
    id: string;
    slug: string;
    label: string;
    level: number;
    parentId: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type CareScheduleResponse = {
  success: true;
  data: CareScheduleData;
};

export type CareScheduleListResponse = {
  success: true;
  data: CareScheduleData[];
  meta: CareScheduleMeta;
};
```

## File: backend/src/care/dto/complete-care.dto.ts
```typescript
import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { CreateMedicalRecordDto } from "./create-medical-record.dto";

class CompleteCareMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}

export class CompleteCareDto {
  @ApiPropertyOptional({
    description: "完了日 (YYYY-MM-DD)",
    example: "2025-08-10",
  })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiPropertyOptional({
    description: "次回予定日 (YYYY-MM-DD)",
    example: "2026-08-10",
  })
  @IsOptional()
  @IsDateString()
  nextScheduledDate?: string;

  @ApiPropertyOptional({
    description: "メモ",
    example: "体調良好。次回はワクチンA。",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: () => CompleteCareMedicalRecordDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteCareMedicalRecordDto)
  medicalRecord?: CompleteCareMedicalRecordDto;
}
```

## File: backend/src/care/dto/create-care-schedule.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CareType,
  Priority,
  ReminderChannel,
  ReminderOffsetUnit,
  ReminderRelativeTo,
  ReminderRepeatFrequency,
  ReminderTimingType,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

class ScheduleReminderDto {
  @ApiProperty({ enum: ReminderTimingType })
  @IsEnum(ReminderTimingType)
  timingType!: ReminderTimingType;

  @ApiPropertyOptional({
    description: "指定日時 (ISO8601)",
    example: "2025-08-01T09:00:00.000Z",
  })
  @ValidateIf((o: ScheduleReminderDto) => o.timingType === ReminderTimingType.ABSOLUTE)
  @IsDateString()
  remindAt?: string;

  @ApiPropertyOptional({ description: "相対リマインドの値", example: 2 })
  @ValidateIf((o: ScheduleReminderDto) => o.timingType === ReminderTimingType.RELATIVE)
  @IsInt()
  @Min(0)
  offsetValue?: number;

  @ApiPropertyOptional({ enum: ReminderOffsetUnit, example: ReminderOffsetUnit.DAY })
  @ValidateIf((o: ScheduleReminderDto) => o.timingType === ReminderTimingType.RELATIVE)
  @IsEnum(ReminderOffsetUnit)
  offsetUnit?: ReminderOffsetUnit;

  @ApiPropertyOptional({ enum: ReminderRelativeTo, example: ReminderRelativeTo.START_DATE })
  @ValidateIf((o: ScheduleReminderDto) => o.timingType === ReminderTimingType.RELATIVE)
  @IsEnum(ReminderRelativeTo)
  relativeTo?: ReminderRelativeTo;

  @ApiProperty({ enum: ReminderChannel, example: ReminderChannel.IN_APP })
  @IsEnum(ReminderChannel)
  channel!: ReminderChannel;

  @ApiPropertyOptional({
    enum: ReminderRepeatFrequency,
    example: ReminderRepeatFrequency.NONE,
  })
  @IsOptional()
  @IsEnum(ReminderRepeatFrequency)
  repeatFrequency?: ReminderRepeatFrequency;

  @ApiPropertyOptional({ description: "繰り返し間隔", example: 1 })
  @ValidateIf((o: ScheduleReminderDto) =>
    Boolean(o.repeatFrequency && o.repeatFrequency !== ReminderRepeatFrequency.NONE),
  )
  @IsInt()
  @IsPositive()
  repeatInterval?: number;

  @ApiPropertyOptional({ description: "繰り返し回数", example: 5 })
  @ValidateIf((o: ScheduleReminderDto) =>
    Boolean(o.repeatFrequency && o.repeatFrequency !== ReminderRepeatFrequency.NONE),
  )
  @IsInt()
  @IsPositive()
  repeatCount?: number;

  @ApiPropertyOptional({ description: "繰り返し終了日時", example: "2025-12-31T00:00:00.000Z" })
  @ValidateIf((o: ScheduleReminderDto) =>
    Boolean(o.repeatFrequency && o.repeatFrequency !== ReminderRepeatFrequency.NONE),
  )
  @IsDateString()
  repeatUntil?: string;

  @ApiPropertyOptional({ description: "備考", example: "前日9時に通知" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;

  @ApiPropertyOptional({ description: "有効フラグ", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCareScheduleDto {
  @ApiProperty({
    description: "対象猫IDの配列",
    example: ["e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60"],
    type: [String],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  catIds: string[];

  @ApiProperty({ description: "ケア名", example: "年次健康診断" })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    description: "ケア種別",
    enum: CareType,
    example: CareType.HEALTH_CHECK,
  })
  @IsEnum(CareType)
  careType: CareType;

  @ApiProperty({ description: "予定日 (ISO8601)", example: "2025-09-01" })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: "終了日時 (ISO8601)", example: "2025-09-01T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: "タイムゾーン", example: "Asia/Tokyo" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  timezone?: string;

  @ApiPropertyOptional({
    description: "ケア名/詳細",
    example: "健康診断 (年1回)",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: "RRULE形式などの繰り返しルール",
    example: "FREQ=YEARLY;INTERVAL=1",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  recurrenceRule?: string;

  @ApiPropertyOptional({
    type: [ScheduleReminderDto],
    description: "リマインダー設定",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleReminderDto)
  reminders?: ScheduleReminderDto[];

  @ApiPropertyOptional({
    description: "関連ケアタグID (最大3階層)",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  careTagIds?: string[];
}

export type ScheduleReminderInput = ScheduleReminderDto;
```

## File: backend/src/care/dto/create-medical-record.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MedicalRecordStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

class MedicalRecordMedicationDto {
  @ApiProperty({ example: "抗生物質" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: "朝晩 1 錠" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  dosage?: string;
}

class MedicalRecordSymptomDto {
  @ApiProperty({ example: "くしゃみ" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string;

  @ApiPropertyOptional({ example: "1週間ほど続いている" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

class MedicalRecordAttachmentInputDto {
  @ApiProperty({ example: "https://cdn.example.com/xray.png" })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({ example: "胸部レントゲン" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: "xray.png" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({ example: "image/png" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileType?: string;

  @ApiPropertyOptional({ example: 204800 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  fileSize?: number;

  @ApiPropertyOptional({ example: "2025-08-10T09:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  capturedAt?: string;
}

export class CreateMedicalRecordDto {
  @ApiProperty({ description: "猫ID", example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  @IsUUID()
  catId!: string;

  @ApiPropertyOptional({ description: "スケジュールID", example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @ApiProperty({ description: "受診日", example: "2025-08-10" })
  @IsDateString()
  visitDate!: string;

  @ApiPropertyOptional({ description: "受診種別ID", example: "c4a52a14-8d93-4b87-9f8c-7a6c2ef81234" })
  @IsOptional()
  @IsUUID()
  visitTypeId?: string;

  @ApiPropertyOptional({ example: "ねこクリニック東京" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  hospitalName?: string;

  @ApiPropertyOptional({ example: "くしゃみが止まらない" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  symptom?: string;

  @ApiPropertyOptional({ type: [MedicalRecordSymptomDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalRecordSymptomDto)
  symptomDetails?: MedicalRecordSymptomDto[];

  @ApiPropertyOptional({ example: "猫風邪" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  diseaseName?: string;

  @ApiPropertyOptional({ example: "猫風邪の兆候" })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: "抗生物質を5日間投与" })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({ type: [MedicalRecordMedicationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalRecordMedicationDto)
  medications?: MedicalRecordMedicationDto[];

  @ApiPropertyOptional({ example: "2025-08-13" })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ example: "TREATING", enum: MedicalRecordStatus, default: MedicalRecordStatus.TREATING })
  @IsOptional()
  @IsEnum(MedicalRecordStatus)
  status?: MedicalRecordStatus;

  @ApiPropertyOptional({ example: "食欲も戻りつつあり" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "関連タグID", type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    description: "添付ファイル",
    type: [MedicalRecordAttachmentInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalRecordAttachmentInputDto)
  attachments?: MedicalRecordAttachmentInputDto[];
}

export type MedicalRecordMedicationInput = MedicalRecordMedicationDto;
export type MedicalRecordSymptomInput = MedicalRecordSymptomDto;
export type MedicalRecordAttachmentInput = MedicalRecordAttachmentInputDto;
```

## File: backend/src/care/dto/index.ts
```typescript
export * from "./care-query.dto";
export * from "./care-schedule-response.dto";
export * from "./complete-care.dto";
export * from "./create-care-schedule.dto";
export * from "./create-medical-record.dto";
export * from "./medical-record-query.dto";
export * from "./medical-record-response.dto";
```

## File: backend/src/care/dto/medical-record-query.dto.ts
```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { MedicalRecordStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";

export class MedicalRecordQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ description: "猫ID", example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  @IsOptional()
  @IsUUID()
  catId?: string;

  @ApiPropertyOptional({ description: "スケジュールID", example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @ApiPropertyOptional({ description: "受診種別ID", example: "c4a52a14-8d93-4b87-9f8c-7a6c2ef81234" })
  @IsOptional()
  @IsUUID()
  visitTypeId?: string;

  @ApiPropertyOptional({ enum: MedicalRecordStatus, example: MedicalRecordStatus.TREATING })
  @IsOptional()
  @IsEnum(MedicalRecordStatus)
  status?: MedicalRecordStatus;

  @ApiPropertyOptional({ description: "受診開始日", example: "2025-08-01" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "受診終了日", example: "2025-08-31" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
```

## File: backend/src/care/dto/medical-record-response.dto.ts
```typescript
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MedicalRecordStatus } from "@prisma/client";

class MedicalRecordCatDto {
  @ApiProperty({ example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  id!: string;

  @ApiProperty({ example: "ミケ" })
  name!: string;
}

class MedicalRecordScheduleDto {
  @ApiProperty({ example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  id!: string;

  @ApiProperty({ example: "ワクチン接種" })
  name!: string;
}

class MedicalRecordVisitTypeDto {
  @ApiProperty({ example: "c4a52a14-8d93-4b87-9f8c-7a6c2ef81234" })
  id!: string;

  @ApiPropertyOptional({ example: "CHECKUP" })
  key!: string | null;

  @ApiProperty({ example: "健康診断" })
  name!: string;

  @ApiPropertyOptional({ example: "定期的な健康診断" })
  description!: string | null;

  @ApiProperty({ example: 1 })
  displayOrder!: number;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

class MedicalRecordTagDto {
  @ApiProperty({ example: "tag-123" })
  id!: string;

  @ApiProperty({ example: "ワクチン" })
  name!: string;

  @ApiPropertyOptional({ example: "#3B82F6" })
  color!: string | null;

  @ApiPropertyOptional({ example: "#FFFFFF" })
  textColor!: string | null;

  @ApiProperty({ example: "group-123" })
  groupId!: string;

  @ApiPropertyOptional({ example: "医療" })
  groupName!: string | null;

  @ApiPropertyOptional({ example: "category-456" })
  categoryId!: string | null;

  @ApiPropertyOptional({ example: "医療タグ" })
  categoryName!: string | null;
}

class MedicalRecordAttachmentDto {
  @ApiProperty({ example: "https://cdn.example.com/xray.png" })
  url!: string;

  @ApiPropertyOptional({ example: "胸部レントゲン" })
  description!: string | null;

  @ApiPropertyOptional({ example: "xray.png" })
  fileName!: string | null;

  @ApiPropertyOptional({ example: "image/png" })
  fileType!: string | null;

  @ApiPropertyOptional({ example: 204800 })
  fileSize!: number | null;

  @ApiPropertyOptional({ example: "2025-08-10T09:30:00.000Z" })
  capturedAt!: string | null;
}

class MedicalRecordMedicationDto {
  @ApiProperty({ example: "抗生物質" })
  name!: string;

  @ApiPropertyOptional({ example: "朝晩1錠" })
  dosage!: string | null;
}

class MedicalRecordSymptomDto {
  @ApiProperty({ example: "くしゃみ" })
  label!: string;

  @ApiPropertyOptional({ example: "1週間継続" })
  note!: string | null;
}

export class MedicalRecordItemDto {
  @ApiProperty({ example: "bcdef123-4567-890a-bcde-f1234567890a" })
  id!: string;

  @ApiProperty({ example: "2025-08-10T00:00:00.000Z" })
  visitDate!: string;

  @ApiProperty({ type: MedicalRecordVisitTypeDto, nullable: true })
  visitType!: MedicalRecordVisitTypeDto | null;

  @ApiPropertyOptional({ example: "ねこクリニック東京" })
  hospitalName!: string | null;

  @ApiPropertyOptional({ example: "くしゃみが止まらない" })
  symptom!: string | null;

  @ApiPropertyOptional({ type: [MedicalRecordSymptomDto] })
  symptomDetails!: MedicalRecordSymptomDto[];

  @ApiPropertyOptional({ example: "猫風邪" })
  diseaseName!: string | null;

  @ApiPropertyOptional({ example: "猫風邪の兆候" })
  diagnosis!: string | null;

  @ApiPropertyOptional({ example: "抗生物質を5日間投与" })
  treatmentPlan!: string | null;

  @ApiPropertyOptional({ type: [MedicalRecordMedicationDto] })
  medications!: MedicalRecordMedicationDto[];

  @ApiPropertyOptional({ example: "2025-08-13T00:00:00.000Z" })
  followUpDate!: string | null;

  @ApiProperty({ enum: MedicalRecordStatus, example: MedicalRecordStatus.TREATING })
  status!: MedicalRecordStatus;

  @ApiPropertyOptional({ example: "食欲は戻ってきた" })
  notes!: string | null;

  @ApiProperty({ type: MedicalRecordCatDto })
  cat!: MedicalRecordCatDto;

  @ApiPropertyOptional({ type: MedicalRecordScheduleDto, nullable: true })
  schedule!: MedicalRecordScheduleDto | null;

  @ApiProperty({ type: [MedicalRecordTagDto] })
  tags!: MedicalRecordTagDto[];

  @ApiProperty({ type: [MedicalRecordAttachmentDto] })
  attachments!: MedicalRecordAttachmentDto[];

  @ApiProperty({ example: "f3a2c1d7-1234-5678-90ab-cdef12345678" })
  recordedBy!: string;

  @ApiProperty({ example: "2025-08-10T09:30:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2025-08-15T12:34:56.000Z" })
  updatedAt!: string;
}

export class MedicalRecordMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class MedicalRecordResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: MedicalRecordItemDto })
  data!: MedicalRecordItemDto;
}

export class MedicalRecordListResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: [MedicalRecordItemDto] })
  data!: MedicalRecordItemDto[];

  @ApiProperty({ type: MedicalRecordMetaDto })
  meta!: MedicalRecordMetaDto;
}

export type MedicalRecordMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MedicalRecordData = {
  id: string;
  visitDate: string;
  visitType: {
    id: string;
    key: string | null;
    name: string;
    description: string | null;
    displayOrder: number;
    isActive: boolean;
  } | null;
  hospitalName: string | null;
  symptom: string | null;
  symptomDetails: { label: string; note: string | null }[];
  diseaseName: string | null;
  diagnosis: string | null;
  treatmentPlan: string | null;
  medications: { name: string; dosage: string | null }[];
  followUpDate: string | null;
  status: MedicalRecordStatus;
  notes: string | null;
  cat: { id: string; name: string };
  schedule: { id: string; name: string } | null;
  tags: {
    id: string;
    name: string;
    color: string | null;
    textColor: string | null;
    groupId: string;
    groupName: string | null;
    categoryId: string | null;
    categoryName: string | null;
  }[];
  attachments: {
    url: string;
    description: string | null;
    fileName: string | null;
    fileType: string | null;
    fileSize: number | null;
    capturedAt: string | null;
  }[];
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MedicalRecordResponse = {
  success: true;
  data: MedicalRecordData;
};

export type MedicalRecordListResponse = {
  success: true;
  data: MedicalRecordData[];
  meta: MedicalRecordMeta;
};
```

## File: backend/src/care/care.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { CareController } from './care.controller';
import { CareService } from './care.service';

describe('CareController', () => {
  let controller: CareController;
  let service: CareService;

  const mockCareService = {
    addSchedule: jest.fn(),
    findSchedules: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    complete: jest.fn(),
    addMedicalRecord: jest.fn(),
    findMedicalRecords: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [CareController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: CareService,
          useValue: mockCareService,
        },
      ],
    }).compile();

    controller = module.get<CareController>(CareController);
    service = module.get<CareService>(CareService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addSchedule', () => {
    it('should create a care schedule', async () => {
      const createDto = {
        catIds: ['cat-1'],
        name: 'Vaccine',
        scheduledDate: '2024-12-01',
        careType: 'HEALTH_CHECK' as const,
      };
      const mockSchedule = { id: '1', ...createDto };

      mockCareService.addSchedule.mockResolvedValue(mockSchedule);

      const result = await controller.addSchedule(createDto, undefined);

      expect(result).toEqual(mockSchedule);
      expect(service.addSchedule).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('findSchedules', () => {
    it('should return paginated schedules', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Vaccine' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCareService.findSchedules.mockResolvedValue(mockResponse);

      const result = await controller.findSchedules({});

      expect(result).toEqual(mockResponse);
      expect(service.findSchedules).toHaveBeenCalledWith({});
    });
  });

  describe('complete', () => {
    it('should complete a care schedule', async () => {
      const completeDto = { notes: 'Completed successfully' };
      const mockSchedule = { success: true, data: { scheduleId: '1', recordId: 'record-1' } };

      mockCareService.complete.mockResolvedValue(mockSchedule);

      const result = await controller.complete('1', completeDto, undefined);

      expect(result).toEqual(mockSchedule);
      expect(service.complete).toHaveBeenCalledWith('1', completeDto, undefined);
    });
  });

  describe('addMedicalRecord', () => {
    it('should create a medical record', async () => {
      const createDto = {
        catId: 'cat-1',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
      };
      const mockRecord = { id: '1', ...createDto };

      mockCareService.addMedicalRecord.mockResolvedValue(mockRecord);

      const result = await controller.addMedicalRecord(createDto, undefined);

      expect(result).toEqual(mockRecord);
      expect(service.addMedicalRecord).toHaveBeenCalledWith(createDto, undefined);
    });
  });

  describe('findMedicalRecords', () => {
    it('should return paginated medical records', async () => {
      const mockResponse = {
        data: [{ id: '1', diagnosis: 'Healthy' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCareService.findMedicalRecords.mockResolvedValue(mockResponse);

      const result = await controller.findMedicalRecords({});

      expect(result).toEqual(mockResponse);
      expect(service.findMedicalRecords).toHaveBeenCalledWith({});
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule', async () => {
      const mockResponse = { success: true, message: 'Schedule deleted' };

      mockCareService.deleteSchedule.mockResolvedValue(mockResponse);

      const result = await controller.deleteSchedule('1');

      expect(result).toEqual(mockResponse);
      expect(service.deleteSchedule).toHaveBeenCalledWith('1');
    });
  });
});
```

## File: backend/src/care/care.controller.ts
```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Put,
  Post,
  Query, UseGuards 
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import type { RequestUser } from "../auth/auth.types";
import { GetUser } from "../auth/get-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { CareService } from "./care.service";
import {
  CareCompleteResponseDto,
  CareQueryDto,
  CareScheduleListResponseDto,
  CareScheduleResponseDto,
  CompleteCareDto,
  CreateCareScheduleDto,
  CreateMedicalRecordDto,
  MedicalRecordListResponseDto,
  MedicalRecordQueryDto,
  MedicalRecordResponseDto,
} from "./dto";

@ApiTags("Care")
@Controller("care")
export class CareController {
  constructor(private readonly careService: CareService) {}

  @Get("schedules")
  @ApiOperation({ summary: "ケアスケジュール一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, type: CareScheduleListResponseDto })
  findSchedules(@Query() query: CareQueryDto) {
    return this.careService.findSchedules(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("schedules")
  @ApiOperation({ summary: "ケアスケジュールの追加" })
  @ApiResponse({ status: HttpStatus.CREATED, type: CareScheduleResponseDto })
  addSchedule(
    @Body() dto: CreateCareScheduleDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.addSchedule(dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id/complete")
  @Put("schedules/:id/complete")
  @ApiOperation({ summary: "ケア完了処理（PATCH/PUT対応）" })
  @ApiResponse({ status: HttpStatus.OK, type: CareCompleteResponseDto })
  @ApiParam({ name: "id" })
  complete(
    @Param("id") id: string,
    @Body() dto: CompleteCareDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.complete(id, dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch("schedules/:id")
  @ApiOperation({ summary: "ケアスケジュールの更新" })
  @ApiResponse({ status: HttpStatus.OK, type: CareScheduleResponseDto })
  @ApiParam({ name: "id", description: "スケジュールID" })
  updateSchedule(
    @Param("id") id: string,
    @Body() dto: CreateCareScheduleDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.updateSchedule(id, dto, user?.userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("schedules/:id")
  @ApiOperation({ summary: "ケアスケジュールの削除" })
  @ApiResponse({ status: HttpStatus.OK, description: "削除成功" })
  @ApiParam({ name: "id", description: "スケジュールID" })
  deleteSchedule(@Param("id") id: string) {
    return this.careService.deleteSchedule(id);
  }

  @Get("medical-records")
  @ApiOperation({ summary: "医療記録一覧の取得" })
  @ApiResponse({ status: HttpStatus.OK, type: MedicalRecordListResponseDto })
  findMedicalRecords(@Query() query: MedicalRecordQueryDto) {
    return this.careService.findMedicalRecords(query);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("medical-records")
  @ApiOperation({ summary: "医療記録の追加" })
  @ApiResponse({ status: HttpStatus.CREATED, type: MedicalRecordResponseDto })
  addMedicalRecord(
    @Body() dto: CreateMedicalRecordDto,
    @GetUser() user?: RequestUser,
  ) {
    return this.careService.addMedicalRecord(dto, user?.userId);
  }
}
```

## File: backend/src/care/care.module.ts
```typescript
import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { CareController } from "./care.controller";
import { CareService } from "./care.service";

@Module({
  imports: [PrismaModule],
  controllers: [CareController],
  providers: [CareService],
})
export class CareModule {}
```

## File: backend/src/care/care.service.spec.ts
```typescript
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CareService } from './care.service';


describe('CareService', () => {
  let service: CareService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    careSchedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    schedule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    medicalRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    careRecord: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      findUnique: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((args: any): any => {
      if (Array.isArray(args)) {
        return Promise.all(args);
      }
      return args(mockPrismaService);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CareService>(CareService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findSchedules', () => {
    it('should return paginated care schedules', async () => {
      const mockSchedules = [
        {
          id: '1',
          catId: 'cat-1',
          name: 'Vaccine',
          status: 'PENDING',
          scheduledDate: new Date(),
          reminders: [],
          tags: [],
        },
      ];

      mockPrismaService.schedule.count.mockResolvedValue(1);
      mockPrismaService.schedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.findSchedules({});

      expect(result.data).toBeDefined();
      expect(result.meta.total).toBe(1);
    });

    it('should filter schedules by catId', async () => {
      const mockSchedules = [
        {
          id: '1',
          catId: 'cat-1',
          name: 'Vaccine',
          scheduledDate: new Date(),
          reminders: [],
          tags: [],
        },
      ];

      mockPrismaService.schedule.count.mockResolvedValue(1);
      mockPrismaService.schedule.findMany.mockResolvedValue(mockSchedules);

      const result = await service.findSchedules({ catId: 'cat-1' });

      expect(result.data).toBeDefined();
    });
  });

  describe('addSchedule', () => {
    it('should create a care schedule successfully', async () => {
      const createDto = {
        name: 'Vaccine',
        catIds: ['cat-1'],
        scheduledDate: '2024-12-01',
        careType: 'HEALTH_CHECK' as const,
      };

      const mockSchedule = {
        id: '1',
        name: createDto.name,
        scheduledDate: new Date(createDto.scheduledDate),
        careType: createDto.careType,
        status: 'PENDING',
        createdAt: new Date(),
        reminders: [],
        tags: [],
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.schedule.create.mockResolvedValue(mockSchedule);

      const result = await service.addSchedule(createDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.schedule.create).toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('should complete a care schedule successfully', async () => {
      const mockSchedule = {
        id: '1',
        catId: 'cat-1',
        scheduleType: 'CARE',
        careType: 'HEALTH_CHECK',
      };

      const mockCareRecord = {
        id: 'record-1',
        scheduleId: '1',
        catId: 'cat-1',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.schedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.careRecord.create.mockResolvedValue(mockCareRecord);
      mockPrismaService.schedule.update.mockResolvedValue({ ...mockSchedule, status: 'COMPLETED' });

      const result = await service.complete('1', {});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(service.complete('invalid', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMedicalRecord', () => {
    it('should create a medical record successfully', async () => {
      const createDto = {
        catId: 'cat-1',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
        treatment: 'Regular checkup',
        veterinarian: 'Dr. Smith',
      };

      const mockRecord = {
        id: '1',
        catId: createDto.catId,
        visitDate: new Date(createDto.visitDate),
        diagnosis: createDto.diagnosis,
        treatment: createDto.treatment,
        veterinarian: createDto.veterinarian,
        createdAt: new Date(),
        updatedAt: new Date(),
        recordedBy: 'user-1',
        status: 'COMPLETED',
        cat: { id: 'cat-1', name: 'Test Cat' },
        schedule: null,
        tags: [],
        attachments: [],
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      mockPrismaService.cat.findUnique.mockResolvedValue({ id: 'cat-1', name: 'Test Cat' });
      mockPrismaService.medicalRecord.create.mockResolvedValue(mockRecord);

      const result = await service.addMedicalRecord(createDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.data.cat.id).toBe('cat-1');
      expect(mockPrismaService.medicalRecord.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid cat', async () => {
      const createDto = {
        catId: 'invalid-cat',
        visitDate: '2024-01-15',
        diagnosis: 'Healthy',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({ id: 'user-1' });
      // Mock Prisma to throw a foreign key constraint error
      mockPrismaService.medicalRecord.create.mockRejectedValue(
        new Error('Foreign key constraint failed on the field: `catId`')
      );

      await expect(service.addMedicalRecord(createDto)).rejects.toThrow();
    });
  });

  describe('findMedicalRecords', () => {
    it('should return paginated medical records', async () => {
      const mockRecords = [
        {
          id: '1',
          catId: 'cat-1',
          visitDate: new Date(),
          diagnosis: 'Healthy',
          createdAt: new Date(),
          updatedAt: new Date(),
          recordedBy: 'user-1',
          status: 'COMPLETED',
          cat: { id: 'cat-1', name: 'Test Cat' },
          schedule: null,
          tags: [],
          attachments: [],
        },
      ];

      mockPrismaService.medicalRecord.count.mockResolvedValue(1);
      mockPrismaService.medicalRecord.findMany.mockResolvedValue(mockRecords);

      const result = await service.findMedicalRecords({});

      expect(result.meta.total).toBe(1);
      expect(result.data).toBeDefined();
      expect(result.data[0].cat.id).toBe('cat-1');
    });
  });

  describe('deleteSchedule', () => {
    it('should delete a schedule successfully', async () => {
      const mockSchedule = { id: '1', name: 'Vaccine' };

      mockPrismaService.schedule.findUnique.mockResolvedValue(mockSchedule);
      mockPrismaService.schedule.delete.mockResolvedValue(mockSchedule);

      const result = await service.deleteSchedule('1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.schedule.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException for invalid schedule', async () => {
      mockPrismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(service.deleteSchedule('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
```

## File: backend/src/care/care.service.ts
```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CareType,
  MedicalRecordStatus,
  Priority,
  Prisma,
  ReminderRepeatFrequency,
  ScheduleStatus,
  ScheduleType,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";


import {
  CareQueryDto,
  CompleteCareDto,
  CreateCareScheduleDto,
  CreateMedicalRecordDto,
  MedicalRecordQueryDto,
} from "./dto";
import type {
  CareScheduleListResponse,
  CareScheduleMeta,
  CareScheduleResponse,
} from "./dto/care-schedule-response.dto";
import type { ScheduleReminderInput } from "./dto/create-care-schedule.dto";
import type { MedicalRecordAttachmentInput } from "./dto/create-medical-record.dto";
import type {
  MedicalRecordData,
  MedicalRecordListResponse,
  MedicalRecordMeta,
  MedicalRecordResponse,
} from "./dto/medical-record-response.dto";
import {
  parseSymptomDetails,
  parseMedications,
  mapDtoToSymptomDetails,
  mapDtoToMedications,
  serializeSymptomDetails,
  serializeMedications,
} from "./json-value.utils";
import {
  parseRRule,
  calculateNextScheduleDate,
} from "./recurrence.utils";

const scheduleListInclude = {
  cat: { select: { id: true, name: true } },
  scheduleCats: { include: { cat: { select: { id: true, name: true } } } },
  reminders: true,
  tags: { include: { careTag: true } },
} as const;

const scheduleMinimalInclude = {
  cat: { select: { id: true, name: true } },
  tags: { select: { careTagId: true } },
} as const;

const medicalRecordInclude = {
  cat: { select: { id: true, name: true } },
  schedule: { select: { id: true, name: true } },
  visitType: true,
  tags: {
    include: {
      tag: {
        include: {
          group: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  },
  attachments: true,
} as const;

type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: typeof scheduleListInclude;
}>;

type ScheduleCatRelation = {
  cat: { id: string; name: string };
};

// Properly typed MedicalRecord with relations
type MedicalRecordWithRelations = Prisma.MedicalRecordGetPayload<{
  include: typeof medicalRecordInclude;
}>;

type PrismaExecutor = Prisma.TransactionClient | PrismaService;

type MedicalRecordCreateInput = Partial<CreateMedicalRecordDto> & {
  catId?: string;
  scheduleId?: string;
  visitDate?: string;
  visitTypeId?: string;
};

// Extended types for scheduleCats relation
type ScheduleCreateWithCats = Omit<Prisma.ScheduleUncheckedCreateInput, 'scheduleCats'> & {
  scheduleCats?: {
    create?: Array<{
      cat: {
        connect: {
          id: string;
        };
      };
    }>;
  };
};

type ScheduleUpdateWithCats = Omit<Prisma.ScheduleUncheckedUpdateInput, 'scheduleCats'> & {
  scheduleCats?: {
    deleteMany?: Record<string, never>;
    create?: Array<{
      cat: {
        connect: {
          id: string;
        };
      };
    }>;
  };
};

const toIsoString = (value?: Date | null): string | null =>
  value ? value.toISOString() : null;

@Injectable()
export class CareService {
  constructor(private readonly prisma: PrismaService) {}

  async findSchedules(query: CareQueryDto): Promise<CareScheduleListResponse> {
    const { page = 1, limit = 20, catId, careType, dateFrom, dateTo } = query;
    const where: Prisma.ScheduleWhereInput = {
      scheduleType: ScheduleType.CARE,
    };
    if (catId) where.catId = catId;
    if (careType) {
      Object.assign(where, { careType });
    }
    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.scheduleDate = dateFilter;
    }

    const [total, schedules] = await this.prisma.$transaction([
      this.prisma.schedule.count({ where }),
      this.prisma.schedule.findMany({
        where,
        include: scheduleListInclude,
        orderBy: { scheduleDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const meta: CareScheduleMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      data: schedules.map((schedule) => this.mapScheduleToResponse(schedule as ScheduleWithRelations)),
      meta,
    };
  }

  async addSchedule(
    dto: CreateCareScheduleDto,
    userId?: string,
  ): Promise<CareScheduleResponse> {
    const assignedUserId = await this.resolveUserId(userId);

    const reminderCreates = (dto.reminders ?? []).map((reminder) =>
      this.buildReminderCreateInput(reminder),
    );

    // 最初の猫IDを旧catIdフィールドに設定（後方互換性のため）
    const primaryCatId = dto.catIds?.[0];

    const createData: ScheduleCreateWithCats = {
      catId: primaryCatId,
      name: dto.name,
      title: dto.name,
      description: dto.description,
      scheduleType: ScheduleType.CARE,
      scheduleDate: new Date(dto.scheduledDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      timezone: dto.timezone,
      careType: dto.careType ?? null,
      status: ScheduleStatus.PENDING,
      priority: dto.priority ?? Priority.MEDIUM,
      recurrenceRule: dto.recurrenceRule,
      assignedTo: assignedUserId,
      reminders: reminderCreates.length
        ? { create: reminderCreates }
        : undefined,
      tags: dto.careTagIds?.length
        ? {
            create: dto.careTagIds.map((careTagId) => ({
              careTag: { connect: { id: careTagId } },
            })),
          }
        : undefined,
      scheduleCats: dto.catIds?.length
        ? {
            create: dto.catIds.map((catId) => ({
              cat: { connect: { id: catId } },
            })),
          }
        : undefined,
    };

    const schedule = await this.prisma.schedule.create({
      data: createData as unknown as Prisma.ScheduleCreateInput,
      include: scheduleListInclude,
    });

    return {
      success: true,
      data: this.mapScheduleToResponse(schedule as ScheduleWithRelations),
    };
  }

  async complete(
    id: string,
    dto: CompleteCareDto,
    userId?: string,
  ): Promise<{
    success: true;
    data: { scheduleId: string; recordId: string; medicalRecordId?: string | null };
  }> {
    const recorderId = await this.resolveUserId(userId);

    const existing = await this.prisma.schedule.findUnique({
      where: { id },
      include: scheduleMinimalInclude,
    });

    if (!existing) {
      throw new NotFoundException("スケジュールが見つかりません");
    }

    const completedDate = dto.completedDate ? new Date(dto.completedDate) : new Date();
    const hospitalName = this.normalizeOptionalText(dto.medicalRecord?.hospitalName);

    // 次回予定日の決定: 明示的に指定がなければRRULEから自動計算
    const followUpDate = this.calculateFollowUpDate(dto, existing, completedDate);

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.schedule.update({
        where: { id },
        data: { status: ScheduleStatus.COMPLETED },
      });

      // 次回予定が存在する場合、新規スケジュールを作成
      if (followUpDate) {
        await this.createFollowUpSchedule(tx, existing, updated.assignedTo, followUpDate, dto.notes);
      }

      const careRecord = await tx.careRecord.create({
        data: {
          catId: existing.catId ?? '',
          careType: (existing.careType as CareType | null) ?? CareType.OTHER,
          description: existing.name,
          careDate: completedDate,
          nextDueDate: followUpDate,
          notes: dto.notes,
          veterinarian: hospitalName,
          recordedBy: recorderId,
        },
      });

      let medicalRecordId: string | null = null;
      if (dto.medicalRecord) {
        const catId = existing.catId ?? '';
        const record = await this.createMedicalRecordEntity(tx, dto.medicalRecord, recorderId, {
          catId: catId,
          scheduleId: existing.id,
        });
        medicalRecordId = record.id;
      }

      return { updated, careRecord, medicalRecordId };
    });

    return {
      success: true,
      data: {
        scheduleId: result.updated.id,
        recordId: result.careRecord.id,
        medicalRecordId: result.medicalRecordId,
      },
    };
  }

  async findMedicalRecords(
    query: MedicalRecordQueryDto,
  ): Promise<MedicalRecordListResponse> {
    const {
      page = 1,
      limit = 20,
      catId,
      scheduleId,
      visitTypeId,
      status,
      dateFrom,
      dateTo,
    } = query;

    const where: Prisma.MedicalRecordWhereInput = {};
    if (catId) where.catId = catId;
    if (scheduleId) where.scheduleId = scheduleId;
    if (visitTypeId) where.visitTypeId = visitTypeId;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.visitDate = dateFilter;
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.medicalRecord.count({ where }),
      this.prisma.medicalRecord.findMany({
        where,
        include: medicalRecordInclude,
        orderBy: { visitDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const meta: MedicalRecordMeta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      data: records.map((record) => this.mapMedicalRecordToResponse(record)),
      meta,
    };
  }

  async updateSchedule(
    id: string,
    dto: CreateCareScheduleDto,
    userId?: string,
  ): Promise<CareScheduleResponse> {
    const assignedUserId = await this.resolveUserId(userId);

    const existing = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Schedule not found");
    }

    const reminderCreates = (dto.reminders ?? []).map((reminder) =>
      this.buildReminderCreateInput(reminder),
    );

    const primaryCatId = dto.catIds?.[0];

    const updateData: ScheduleUpdateWithCats = {
      catId: primaryCatId,
      name: dto.name,
      title: dto.name,
      description: dto.description,
      scheduleDate: new Date(dto.scheduledDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      timezone: dto.timezone,
      careType: dto.careType ?? null,
      priority: dto.priority ?? Priority.MEDIUM,
      recurrenceRule: dto.recurrenceRule,
      assignedTo: assignedUserId,
      reminders: {
        deleteMany: {},
        create: reminderCreates,
      },
      tags: {
        deleteMany: {},
        create: dto.careTagIds?.length
          ? dto.careTagIds.map((careTagId) => ({
              careTag: { connect: { id: careTagId } },
            }))
          : undefined,
      },
      scheduleCats: {
        deleteMany: {},
        create: dto.catIds?.length
          ? dto.catIds.map((catId) => ({
              cat: { connect: { id: catId } },
            }))
          : undefined,
      },
    };

    const schedule = await this.prisma.schedule.update({
      where: { id },
      data: updateData as unknown as Prisma.ScheduleUpdateInput,
      include: scheduleListInclude,
    });

    return {
      success: true,
      data: this.mapScheduleToResponse(schedule as ScheduleWithRelations),
    };
  }

  async deleteSchedule(id: string): Promise<{ success: true; message: string }> {
    const existing = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Schedule not found");
    }

    await this.prisma.schedule.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Schedule deleted successfully",
    };
  }

  async addMedicalRecord(
    dto: CreateMedicalRecordDto,
    userId?: string,
  ): Promise<MedicalRecordResponse> {
    const recorderId = await this.resolveUserId(userId);
    const record = await this.createMedicalRecordEntity(this.prisma, dto, recorderId);

    return {
      success: true,
      data: this.mapMedicalRecordToResponse(record),
    };
  }

  private async resolveUserId(userId?: string): Promise<string> {
    if (userId) {
      return userId;
    }

    const user = await this.prisma.user.findFirst({ select: { id: true } });
    if (!user) {
      throw new NotFoundException("Assignee user not found");
    }
    return user.id;
  }

  private buildReminderCreateInput(
    reminder: ScheduleReminderInput,
  ): Prisma.ScheduleReminderUncheckedCreateWithoutScheduleInput {
    return {
      timingType: reminder.timingType,
      remindAt: reminder.remindAt ? new Date(reminder.remindAt) : undefined,
      offsetValue: reminder.offsetValue ?? null,
      offsetUnit: reminder.offsetUnit ?? null,
      relativeTo: reminder.relativeTo ?? null,
      channel: reminder.channel,
      repeatFrequency: reminder.repeatFrequency ?? ReminderRepeatFrequency.NONE,
      repeatInterval: reminder.repeatInterval ?? null,
      repeatCount: reminder.repeatCount ?? null,
      repeatUntil: reminder.repeatUntil ? new Date(reminder.repeatUntil) : undefined,
      notes: reminder.notes ?? null,
      isActive: reminder.isActive ?? true,
    };
  }

  private mapScheduleToResponse(
    schedule: ScheduleWithRelations,
  ): CareScheduleResponse["data"] {
    const sortedReminders = [...schedule.reminders].sort((a, b) => {
      const aTime = a.remindAt?.getTime() ?? 0;
      const bTime = b.remindAt?.getTime() ?? 0;
      if (aTime !== bTime) return aTime - bTime;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const reminders = sortedReminders.map((reminder) => ({
      id: reminder.id,
      timingType: reminder.timingType,
      remindAt: toIsoString(reminder.remindAt),
      offsetValue: reminder.offsetValue ?? null,
      offsetUnit: reminder.offsetUnit ?? null,
      relativeTo: reminder.relativeTo ?? null,
      channel: reminder.channel,
      repeatFrequency: reminder.repeatFrequency ?? ReminderRepeatFrequency.NONE,
      repeatInterval: reminder.repeatInterval ?? null,
      repeatCount: reminder.repeatCount ?? null,
      repeatUntil: toIsoString(reminder.repeatUntil),
      notes: reminder.notes ?? null,
      isActive: reminder.isActive,
    }));

    const tags = schedule.tags
      .map(({ careTag }) => ({
        id: careTag.id,
        slug: careTag.slug,
        label: careTag.label,
        level: careTag.level,
        parentId: careTag.parentId ?? null,
      }))
      .sort((a, b) => a.level - b.level);

    return {
      id: schedule.id,
      name: schedule.name ?? schedule.title,
      title: schedule.title,
      description: schedule.description ?? null,
      scheduleDate: toIsoString(schedule.scheduleDate)!,
      endDate: toIsoString(schedule.endDate),
      timezone: schedule.timezone ?? null,
      scheduleType: schedule.scheduleType,
      status: schedule.status,
      careType: (schedule.careType as CareType | null) ?? null,
      priority: schedule.priority ?? Priority.MEDIUM,
      recurrenceRule: schedule.recurrenceRule ?? null,
      assignedTo: schedule.assignedTo,
      cat: schedule.cat ? { id: schedule.cat.id, name: schedule.cat.name } : null,
      cats: Array.isArray(schedule.scheduleCats)
        ? (schedule.scheduleCats as ScheduleCatRelation[]).map((sc) => ({
            id: sc.cat.id,
            name: sc.cat.name,
          }))
        : [],
      reminders,
      tags,
      createdAt: toIsoString(schedule.createdAt)!,
      updatedAt: toIsoString(schedule.updatedAt)!,
    };
  }

  private mapMedicalRecordToResponse(
    record: MedicalRecordWithRelations,
  ): MedicalRecordData {
    // 型安全なJSON変換ユーティリティを使用
    const symptomDetails = parseSymptomDetails(record.symptomDetails);
    const medications = parseMedications(record.medications);

    const visitType = record.visitType
      ? {
          id: record.visitType.id,
          key: record.visitType.key ?? null,
          name: record.visitType.name,
          description: record.visitType.description ?? null,
          displayOrder: record.visitType.displayOrder,
          isActive: record.visitType.isActive,
        }
      : null;

    const tags = record.tags
      .map((medicalRecordTag) => {
        const tag = medicalRecordTag.tag;
        if (!tag) {
          return null;
        }
        const group = tag.group ?? null;
        const category = group?.category ?? null;
        return {
          id: tag.id,
          name: tag.name,
          color: tag.color ?? null,
          textColor: tag.textColor ?? null,
          groupId: tag.groupId,
          groupName: group?.name ?? null,
          categoryId: group?.categoryId ?? null,
          categoryName: category?.name ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));

    const attachments = record.attachments.map((attachment) => ({
      url: attachment.url,
      description: attachment.description ?? null,
      fileName: attachment.fileName ?? null,
      fileType: attachment.fileType ?? null,
      fileSize: attachment.fileSize ?? null,
      capturedAt: toIsoString(attachment.capturedAt),
    }));

    return {
      id: record.id,
      visitDate: toIsoString(record.visitDate)!,
      visitType,
      hospitalName: record.hospitalName ?? null,
      symptom: record.symptom ?? null,
      symptomDetails,
      diseaseName: record.diseaseName ?? null,
      diagnosis: record.diagnosis ?? null,
      treatmentPlan: record.treatmentPlan ?? null,
      medications,
      followUpDate: toIsoString(record.followUpDate),
      status: record.status,
      notes: record.notes ?? null,
      cat: { id: record.cat.id, name: record.cat.name },
      schedule: record.schedule
        ? { id: record.schedule.id, name: record.schedule.name }
        : null,
      tags,
      attachments,
      recordedBy: record.recordedBy,
      createdAt: toIsoString(record.createdAt)!,
      updatedAt: toIsoString(record.updatedAt)!,
    };
  }

  private async createMedicalRecordEntity(
    executor: PrismaExecutor,
    dto: MedicalRecordCreateInput,
    recorderId: string,
    defaults: { catId?: string; scheduleId?: string; visitTypeId?: string } = {},
  ): Promise<MedicalRecordWithRelations> {
    const catId = dto.catId ?? defaults.catId;
    if (!catId) {
      throw new NotFoundException("猫IDは必須です");
    }

    // 型安全なユーティリティを使用してDTOを変換
    const symptomDetails = mapDtoToSymptomDetails(dto.symptomDetails);
    const medications = mapDtoToMedications(dto.medications);

    const attachments = dto.attachments ?? [];
    const hospitalName = this.normalizeOptionalText(dto.hospitalName);

    const record = await executor.medicalRecord.create({
      data: {
        catId,
        scheduleId: dto.scheduleId ?? defaults.scheduleId,
        recordedBy: recorderId,
        visitDate: new Date(dto.visitDate ?? dto.followUpDate ?? new Date()),
        visitTypeId: dto.visitTypeId ?? defaults.visitTypeId,
        hospitalName,
        symptom: dto.symptom,
        symptomDetails: serializeSymptomDetails(symptomDetails),
        diagnosis: dto.diagnosis,
        treatmentPlan: dto.treatmentPlan,
        medications: serializeMedications(medications),
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        status: dto.status ?? MedicalRecordStatus.TREATING,
        notes: dto.notes,
        tags: dto.tagIds?.length
          ? {
              create: dto.tagIds.map((tagId) => ({
                tagId: tagId,
              })),
            }
          : undefined,
        attachments: attachments.length
          ? {
              create: attachments.map((attachment: MedicalRecordAttachmentInput) => ({
                url: attachment.url,
                description: attachment.description,
                fileName: attachment.fileName,
                fileType: attachment.fileType,
                fileSize: attachment.fileSize,
                capturedAt: attachment.capturedAt ? new Date(attachment.capturedAt) : undefined,
              })),
            }
          : undefined,
      },
      include: medicalRecordInclude,
    });

    return record;
  }

  private normalizeOptionalText(value?: string | null): string | undefined {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  /**
   * 次回予定日を計算する
   * - 明示的な指定があればそれを使用
   * - なければRRULEから自動計算
   */
  private calculateFollowUpDate(
    dto: CompleteCareDto,
    existing: {
      recurrenceRule: string | null;
      scheduleDate: Date;
    },
    completedDate: Date,
  ): Date | undefined {
    // 明示的に次回予定日が指定されている場合はそれを使用
    if (dto.nextScheduledDate) {
      return new Date(dto.nextScheduledDate);
    }

    // RRULEが存在する場合、次回予定日を自動計算
    const parsedRule = parseRRule(existing.recurrenceRule);
    if (!parsedRule) {
      return undefined;
    }

    // 基準日: 完了日またはスケジュール日のうち新しい方
    const baseDate = completedDate > existing.scheduleDate ? completedDate : existing.scheduleDate;
    const nextDate = calculateNextScheduleDate(parsedRule, baseDate);

    return nextDate ?? undefined;
  }

  /**
   * フォローアップスケジュールを作成する
   */
  private async createFollowUpSchedule(
    tx: Prisma.TransactionClient,
    existing: {
      catId: string | null;
      name: string;
      description: string | null;
      timezone: string | null;
      careType: CareType | null;
      priority: Priority;
      recurrenceRule: string | null;
      tags: Array<{ careTagId: string }>;
    },
    assignedTo: string,
    followUpDate: Date,
    notes?: string,
  ): Promise<void> {
    await tx.schedule.create({
      data: {
        catId: existing.catId ?? undefined,
        name: existing.name,
        title: existing.name,
        description: notes ?? existing.description ?? undefined,
        scheduleType: ScheduleType.CARE,
        scheduleDate: followUpDate,
        timezone: existing.timezone ?? undefined,
        careType: existing.careType,
        status: ScheduleStatus.PENDING,
        priority: existing.priority ?? Priority.MEDIUM,
        recurrenceRule: existing.recurrenceRule ?? undefined,
        assignedTo: assignedTo,
        tags: existing.tags.length
          ? {
              create: existing.tags.map(({ careTagId }) => ({
                careTag: { connect: { id: careTagId } },
              })),
            }
          : undefined,
      },
    });
  }
}
```

## File: backend/src/care/json-value.utils.spec.ts
```typescript
/**
 * json-value.utils.ts の単体テスト
 */

import { Prisma } from "@prisma/client";

import {
  parseSymptomDetails,
  parseMedications,
  mapDtoToSymptomDetails,
  mapDtoToMedications,
  serializeSymptomDetails,
  serializeMedications,
} from "./json-value.utils";

describe("JsonValueUtils", () => {
  describe("parseSymptomDetails", () => {
    it("nullの場合は空配列を返す", () => {
      expect(parseSymptomDetails(null)).toEqual([]);
      expect(parseSymptomDetails(undefined)).toEqual([]);
    });

    it("配列でない場合は空配列を返す", () => {
      expect(parseSymptomDetails("string" as Prisma.JsonValue)).toEqual([]);
      expect(parseSymptomDetails({ key: "value" } as Prisma.JsonValue)).toEqual([]);
    });

    it("有効な症状詳細配列を解析できる", () => {
      const input = [
        { label: "くしゃみ", note: "1週間続いている" },
        { label: "食欲低下", note: null },
      ] as Prisma.JsonValue;

      const result = parseSymptomDetails(input);

      expect(result).toEqual([
        { label: "くしゃみ", note: "1週間続いている" },
        { label: "食欲低下", note: null },
      ]);
    });

    it("不正なオブジェクトをフィルタリングする", () => {
      const input = [
        { label: "くしゃみ", note: "test" },
        { invalid: "item" }, // labelがない
        null,
        "string",
        { label: 123 }, // labelが文字列でない
      ] as Prisma.JsonValue;

      const result = parseSymptomDetails(input);

      expect(result).toEqual([{ label: "くしゃみ", note: "test" }]);
    });

    it("noteがundefinedの場合はnullに変換する", () => {
      const input = [{ label: "症状1" }] as Prisma.JsonValue;

      const result = parseSymptomDetails(input);

      expect(result[0].note).toBeNull();
    });
  });

  describe("parseMedications", () => {
    it("nullの場合は空配列を返す", () => {
      expect(parseMedications(null)).toEqual([]);
      expect(parseMedications(undefined)).toEqual([]);
    });

    it("有効な投薬情報配列を解析できる", () => {
      const input = [
        { name: "抗生物質", dosage: "朝晩1錠" },
        { name: "胃薬", dosage: null },
      ] as Prisma.JsonValue;

      const result = parseMedications(input);

      expect(result).toEqual([
        { name: "抗生物質", dosage: "朝晩1錠" },
        { name: "胃薬", dosage: null },
      ]);
    });

    it("不正なオブジェクトをフィルタリングする", () => {
      const input = [
        { name: "薬A", dosage: "test" },
        { invalid: "item" }, // nameがない
        null,
      ] as Prisma.JsonValue;

      const result = parseMedications(input);

      expect(result).toEqual([{ name: "薬A", dosage: "test" }]);
    });
  });

  describe("mapDtoToSymptomDetails", () => {
    it("undefinedの場合は空配列を返す", () => {
      expect(mapDtoToSymptomDetails(undefined)).toEqual([]);
    });

    it("空配列の場合は空配列を返す", () => {
      expect(mapDtoToSymptomDetails([])).toEqual([]);
    });

    it("DTO形式を正しく変換する", () => {
      const input = [
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下" }, // noteなし
      ];

      const result = mapDtoToSymptomDetails(input);

      expect(result).toEqual([
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下", note: null },
      ]);
    });
  });

  describe("mapDtoToMedications", () => {
    it("undefinedの場合は空配列を返す", () => {
      expect(mapDtoToMedications(undefined)).toEqual([]);
    });

    it("DTO形式を正しく変換する", () => {
      const input = [
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B" }, // dosageなし
      ];

      const result = mapDtoToMedications(input);

      expect(result).toEqual([
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B", dosage: null },
      ]);
    });
  });

  describe("serializeSymptomDetails", () => {
    it("undefinedの場合はDbNullを返す", () => {
      const result = serializeSymptomDetails(undefined);

      expect(result).toBe(Prisma.DbNull);
    });

    it("空配列の場合はDbNullを返す", () => {
      const result = serializeSymptomDetails([]);

      expect(result).toBe(Prisma.DbNull);
    });

    it("データがある場合はJsonArrayを返す", () => {
      const input = [
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下", note: null },
      ];

      const result = serializeSymptomDetails(input);

      expect(result).toEqual([
        { label: "くしゃみ", note: "test" },
        { label: "食欲低下", note: null },
      ]);
    });
  });

  describe("serializeMedications", () => {
    it("undefinedの場合はDbNullを返す", () => {
      const result = serializeMedications(undefined);

      expect(result).toBe(Prisma.DbNull);
    });

    it("空配列の場合はDbNullを返す", () => {
      const result = serializeMedications([]);

      expect(result).toBe(Prisma.DbNull);
    });

    it("データがある場合はJsonArrayを返す", () => {
      const input = [
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B", dosage: null },
      ];

      const result = serializeMedications(input);

      expect(result).toEqual([
        { name: "薬A", dosage: "1日2回" },
        { name: "薬B", dosage: null },
      ]);
    });
  });
});
```

## File: backend/src/care/json-value.utils.ts
```typescript
/**
 * Prisma JsonValue の型安全なバリデーション・変換ユーティリティ
 *
 * symptomDetails, medications などのJSONフィールドを型安全に扱う
 */

import { Prisma } from "@prisma/client";

/**
 * 症状詳細の型定義
 */
export interface SymptomDetail {
  label: string;
  note: string | null;
}

/**
 * 投薬情報の型定義
 */
export interface MedicationDetail {
  name: string;
  dosage: string | null;
}

/**
 * 未知のオブジェクトが SymptomDetail の構造を持つかチェック
 */
function isSymptomDetailLike(value: unknown): value is SymptomDetail {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.label === "string" &&
    (obj.note === null || obj.note === undefined || typeof obj.note === "string")
  );
}

/**
 * 未知のオブジェクトが MedicationDetail の構造を持つかチェック
 */
function isMedicationDetailLike(value: unknown): value is MedicationDetail {
  if (!value || typeof value !== "object") {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.name === "string" &&
    (obj.dosage === null || obj.dosage === undefined || typeof obj.dosage === "string")
  );
}

/**
 * Prisma JsonValue を SymptomDetail[] に型安全に変換
 *
 * @param data Prismaから取得したJsonValue
 * @returns 検証済みの SymptomDetail 配列
 */
export function parseSymptomDetails(
  data: Prisma.JsonValue | null | undefined,
): SymptomDetail[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const result: SymptomDetail[] = [];
  for (const item of data) {
    if (isSymptomDetailLike(item)) {
      result.push({
        label: item.label,
        note: typeof item.note === "string" ? item.note : null,
      });
    }
  }
  return result;
}

/**
 * Prisma JsonValue を MedicationDetail[] に型安全に変換
 *
 * @param data Prismaから取得したJsonValue
 * @returns 検証済みの MedicationDetail 配列
 */
export function parseMedications(
  data: Prisma.JsonValue | null | undefined,
): MedicationDetail[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const result: MedicationDetail[] = [];
  for (const item of data) {
    if (isMedicationDetailLike(item)) {
      result.push({
        name: item.name,
        dosage: typeof item.dosage === "string" ? item.dosage : null,
      });
    }
  }
  return result;
}

/**
 * SymptomDetail[] を Prisma JsonArray に変換
 *
 * @param details 症状詳細配列
 * @returns Prisma JsonArray または DbNull
 */
export function serializeSymptomDetails(
  details: SymptomDetail[] | undefined,
): Prisma.JsonArray | typeof Prisma.DbNull {
  if (!details || details.length === 0) {
    return Prisma.DbNull;
  }

  return details.map((detail) => ({
    label: detail.label,
    note: detail.note ?? null,
  })) as Prisma.JsonArray;
}

/**
 * MedicationDetail[] を Prisma JsonArray に変換
 *
 * @param medications 投薬情報配列
 * @returns Prisma JsonArray または DbNull
 */
export function serializeMedications(
  medications: MedicationDetail[] | undefined,
): Prisma.JsonArray | typeof Prisma.DbNull {
  if (!medications || medications.length === 0) {
    return Prisma.DbNull;
  }

  return medications.map((medication) => ({
    name: medication.name,
    dosage: medication.dosage ?? null,
  })) as Prisma.JsonArray;
}

/**
 * DTO形式の症状詳細を型安全に変換
 */
export function mapDtoToSymptomDetails(
  dtoDetails: Array<{ label: string; note?: string }> | undefined,
): SymptomDetail[] {
  if (!dtoDetails || dtoDetails.length === 0) {
    return [];
  }

  return dtoDetails.map((detail) => ({
    label: detail.label,
    note: detail.note ?? null,
  }));
}

/**
 * DTO形式の投薬情報を型安全に変換
 */
export function mapDtoToMedications(
  dtoMedications: Array<{ name: string; dosage?: string }> | undefined,
): MedicationDetail[] {
  if (!dtoMedications || dtoMedications.length === 0) {
    return [];
  }

  return dtoMedications.map((medication) => ({
    name: medication.name,
    dosage: medication.dosage ?? null,
  }));
}
```

## File: backend/src/care/recurrence.utils.spec.ts
```typescript
/**
 * recurrence.utils.ts の単体テスト
 */

import dayjs from "dayjs";

import {
  parseRRule,
  calculateNextScheduleDate,
  hasValidRecurrence,
  type ParsedRRule,
} from "./recurrence.utils";

describe("RecurrenceUtils", () => {
  describe("parseRRule", () => {
    it("nullまたはundefinedの場合、nullを返す", () => {
      expect(parseRRule(null)).toBeNull();
      expect(parseRRule(undefined)).toBeNull();
      expect(parseRRule("")).toBeNull();
    });

    it("無効なRRULE文字列の場合、nullを返す", () => {
      expect(parseRRule("INVALID")).toBeNull();
      expect(parseRRule("FREQ=INVALID")).toBeNull();
    });

    describe("DAILY", () => {
      it("基本的な毎日繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=DAILY;INTERVAL=1");

        expect(result).not.toBeNull();
        expect(result?.frequency).toBe("DAILY");
        expect(result?.interval).toBe(1);
      });

      it("2日ごとの繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=DAILY;INTERVAL=2");

        expect(result?.frequency).toBe("DAILY");
        expect(result?.interval).toBe(2);
      });
    });

    describe("WEEKLY", () => {
      it("基本的な毎週繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;INTERVAL=1");

        expect(result?.frequency).toBe("WEEKLY");
        expect(result?.interval).toBe(1);
        expect(result?.byDay).toBeNull();
      });

      it("曜日指定付きの毎週繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR");

        expect(result?.frequency).toBe("WEEKLY");
        expect(result?.byDay).toEqual([1, 3, 5]); // 月、水、金
      });

      it("単一曜日の繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;BYDAY=TU");

        expect(result?.byDay).toEqual([2]); // 火曜日
      });
    });

    describe("MONTHLY", () => {
      it("基本的な毎月繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=MONTHLY;INTERVAL=1");

        expect(result?.frequency).toBe("MONTHLY");
        expect(result?.byMonthDay).toBeNull();
      });

      it("日付指定付きの毎月繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=MONTHLY;BYMONTHDAY=15");

        expect(result?.frequency).toBe("MONTHLY");
        expect(result?.byMonthDay).toBe(15);
      });
    });

    describe("YEARLY", () => {
      it("毎年繰り返しを解析できる", () => {
        const result = parseRRule("FREQ=YEARLY;INTERVAL=1");

        expect(result?.frequency).toBe("YEARLY");
        expect(result?.interval).toBe(1);
      });
    });

    describe("終了条件", () => {
      it("COUNT指定を解析できる", () => {
        const result = parseRRule("FREQ=DAILY;COUNT=10");

        expect(result?.count).toBe(10);
      });

      it("UNTIL指定（YYYYMMDD形式）を解析できる", () => {
        const result = parseRRule("FREQ=WEEKLY;UNTIL=20251231");

        expect(result?.until).not.toBeNull();
        expect(result?.until?.getFullYear()).toBe(2025);
        expect(result?.until?.getMonth()).toBe(11); // 12月
        expect(result?.until?.getDate()).toBe(31);
      });

      it("UNTIL指定（ISO8601形式）を解析できる", () => {
        const result = parseRRule("FREQ=MONTHLY;UNTIL=20251231T235959Z");

        expect(result?.until).not.toBeNull();
      });
    });
  });

  describe("calculateNextScheduleDate", () => {
    const baseDate = new Date("2025-01-15T10:00:00.000Z");

    describe("DAILY", () => {
      it("次の日を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "DAILY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(next).not.toBeNull();
        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-16");
      });

      it("3日後を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "DAILY",
          interval: 3,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-18");
      });
    });

    describe("WEEKLY", () => {
      it("次の週を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "WEEKLY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-22");
      });

      it("曜日指定で次の該当曜日を計算できる（今週）", () => {
        // 2025-01-15は水曜日
        const rrule: ParsedRRule = {
          frequency: "WEEKLY",
          interval: 1,
          byDay: [4, 5], // 木、金
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        // 次は木曜日 (2025-01-16)
        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-16");
      });
    });

    describe("MONTHLY", () => {
      it("次の月を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "MONTHLY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-02-15");
      });

      it("日付指定で次の該当日を計算できる（今月）", () => {
        // 15日より後の20日
        const rrule: ParsedRRule = {
          frequency: "MONTHLY",
          interval: 1,
          byDay: null,
          byMonthDay: 20,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-01-20");
      });

      it("日付指定で次の該当日を計算できる（翌月）", () => {
        // 15日より前の10日 → 翌月
        const rrule: ParsedRRule = {
          frequency: "MONTHLY",
          interval: 1,
          byDay: null,
          byMonthDay: 10,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2025-02-10");
      });
    });

    describe("YEARLY", () => {
      it("次の年を計算できる", () => {
        const rrule: ParsedRRule = {
          frequency: "YEARLY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: null,
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(dayjs(next).format("YYYY-MM-DD")).toBe("2026-01-15");
      });
    });

    describe("終了条件", () => {
      it("UNTIL日を超える場合はnullを返す", () => {
        const rrule: ParsedRRule = {
          frequency: "DAILY",
          interval: 1,
          byDay: null,
          byMonthDay: null,
          count: null,
          until: new Date("2025-01-15T00:00:00.000Z"), // 基準日と同じ
        };

        const next = calculateNextScheduleDate(rrule, baseDate);

        expect(next).toBeNull();
      });
    });
  });

  describe("hasValidRecurrence", () => {
    it("有効なRRULEの場合はtrueを返す", () => {
      expect(hasValidRecurrence("FREQ=DAILY")).toBe(true);
      expect(hasValidRecurrence("FREQ=WEEKLY;BYDAY=MO")).toBe(true);
      expect(hasValidRecurrence("FREQ=MONTHLY;BYMONTHDAY=1")).toBe(true);
      expect(hasValidRecurrence("FREQ=YEARLY")).toBe(true);
    });

    it("無効なRRULEの場合はfalseを返す", () => {
      expect(hasValidRecurrence(null)).toBe(false);
      expect(hasValidRecurrence(undefined)).toBe(false);
      expect(hasValidRecurrence("")).toBe(false);
      expect(hasValidRecurrence("INVALID")).toBe(false);
    });
  });
});
```

## File: backend/src/care/recurrence.utils.ts
```typescript
/**
 * 繰り返しルール（RRULE）の解析とスケジュール生成ユーティリティ
 *
 * 対応タイプ: 毎日(DAILY)、毎週(WEEKLY)、毎月(MONTHLY)、毎年(YEARLY)
 */

import dayjs from "dayjs";

/**
 * RRULE頻度タイプ
 */
export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

/**
 * 解析されたRRULE情報
 */
export interface ParsedRRule {
  /** 繰り返し頻度 */
  frequency: RecurrenceFrequency;
  /** 繰り返し間隔（デフォルト: 1） */
  interval: number;
  /** 曜日指定（WEEKLY用）: 0=日曜〜6=土曜 */
  byDay: number[] | null;
  /** 日付指定（MONTHLY用）: 1〜31 */
  byMonthDay: number | null;
  /** 終了回数 */
  count: number | null;
  /** 終了日時 */
  until: Date | null;
}

/**
 * RRULEを解析する
 *
 * @param rule RRULE文字列（例: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE"）
 * @returns 解析結果。無効なルールの場合はnull
 */
export function parseRRule(rule: string | null | undefined): ParsedRRule | null {
  if (!rule || typeof rule !== "string") {
    return null;
  }

  const parts = rule.split(";");
  const params: Record<string, string> = {};

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      params[key.trim().toUpperCase()] = value.trim();
    }
  }

  const freqValue = params["FREQ"];
  if (!freqValue || !isValidFrequency(freqValue)) {
    return null;
  }

  const frequency = freqValue as RecurrenceFrequency;
  const interval = parseInt(params["INTERVAL"] || "1", 10);
  const count = params["COUNT"] ? parseInt(params["COUNT"], 10) : null;
  const until = params["UNTIL"] ? parseRRuleDate(params["UNTIL"]) : null;

  // BYDAY解析（曜日）
  let byDay: number[] | null = null;
  if (params["BYDAY"]) {
    byDay = parseByDay(params["BYDAY"]);
  }

  // BYMONTHDAY解析（月の日付）
  let byMonthDay: number | null = null;
  if (params["BYMONTHDAY"]) {
    const day = parseInt(params["BYMONTHDAY"], 10);
    if (day >= 1 && day <= 31) {
      byMonthDay = day;
    }
  }

  return {
    frequency,
    interval: Number.isNaN(interval) || interval < 1 ? 1 : interval,
    byDay,
    byMonthDay,
    count: count && !Number.isNaN(count) ? count : null,
    until,
  };
}

/**
 * 有効な頻度値かどうかをチェック
 */
function isValidFrequency(value: string): value is RecurrenceFrequency {
  return ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(value.toUpperCase());
}

/**
 * RRULEのBYDAY値を解析する
 *
 * @param byday 曜日文字列（例: "MO,WE,FR"）
 * @returns 曜日のインデックス配列（0=日曜〜6=土曜）
 */
function parseByDay(byday: string): number[] {
  const dayMap: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const days = byday.split(",").map((d) => d.trim().toUpperCase());
  const result: number[] = [];

  for (const day of days) {
    // 「-1MO」のような形式にも対応（最初の数字部分を除去）
    const cleanDay = day.replace(/^-?\d*/, "");
    if (dayMap[cleanDay] !== undefined) {
      result.push(dayMap[cleanDay]);
    }
  }

  return result.length > 0 ? result : [];
}

/**
 * RRULEの日付文字列を解析する
 *
 * @param dateStr RRULE日付（例: "20251231T235959Z" または "20251231"）
 * @returns Dateオブジェクト。無効な場合はnull
 */
function parseRRuleDate(dateStr: string): Date | null {
  // YYYYMMDD形式
  if (/^\d{8}$/.test(dateStr)) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const date = new Date(year, month, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // YYYYMMDDTHHmmssZ形式
  if (/^\d{8}T\d{6}Z?$/.test(dateStr)) {
    const year = parseInt(dateStr.substring(0, 4), 10);
    const month = parseInt(dateStr.substring(4, 6), 10) - 1;
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = parseInt(dateStr.substring(9, 11), 10);
    const minute = parseInt(dateStr.substring(11, 13), 10);
    const second = parseInt(dateStr.substring(13, 15), 10);
    const date = new Date(Date.UTC(year, month, day, hour, minute, second));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // ISO8601形式を試行
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * RRULEに基づいて次回予定日を計算する
 *
 * @param rrule 解析済みRRULE
 * @param baseDate 基準日（通常は完了日またはスケジュール日）
 * @returns 次回予定日。終了条件を満たした場合はnull
 */
export function calculateNextScheduleDate(
  rrule: ParsedRRule,
  baseDate: Date,
): Date | null {
  const base = dayjs(baseDate);
  let next: dayjs.Dayjs;

  switch (rrule.frequency) {
    case "DAILY":
      next = base.add(rrule.interval, "day");
      break;

    case "WEEKLY":
      if (rrule.byDay && rrule.byDay.length > 0) {
        // 曜日指定がある場合、次の該当曜日を探す
        next = findNextDayOfWeek(base, rrule.byDay, rrule.interval);
      } else {
        next = base.add(rrule.interval, "week");
      }
      break;

    case "MONTHLY":
      if (rrule.byMonthDay !== null) {
        // 日付指定がある場合、次の指定日を探す
        next = findNextMonthDay(base, rrule.byMonthDay, rrule.interval);
      } else {
        next = base.add(rrule.interval, "month");
      }
      break;

    case "YEARLY":
      next = base.add(rrule.interval, "year");
      break;

    default:
      return null;
  }

  // 終了条件チェック
  if (rrule.until && next.isAfter(rrule.until)) {
    return null;
  }

  return next.toDate();
}

/**
 * 次の指定曜日を探す
 */
function findNextDayOfWeek(
  base: dayjs.Dayjs,
  targetDays: number[],
  weekInterval: number,
): dayjs.Dayjs {
  const currentDay = base.day();
  const sortedDays = [...targetDays].sort((a, b) => a - b);

  // 今週の残りの曜日から探す
  for (const day of sortedDays) {
    if (day > currentDay) {
      return base.day(day);
    }
  }

  // 次の週の最初の該当曜日
  const nextWeekBase = base.add(weekInterval, "week").startOf("week");
  return nextWeekBase.day(sortedDays[0]);
}

/**
 * 次の指定日を探す
 */
function findNextMonthDay(
  base: dayjs.Dayjs,
  targetDay: number,
  monthInterval: number,
): dayjs.Dayjs {
  const currentDay = base.date();

  // 今月の指定日がまだ来ていない場合
  if (currentDay < targetDay) {
    const daysInMonth = base.daysInMonth();
    const actualDay = Math.min(targetDay, daysInMonth);
    return base.date(actualDay);
  }

  // 次の月の指定日
  const nextMonth = base.add(monthInterval, "month");
  const daysInNextMonth = nextMonth.daysInMonth();
  const actualDay = Math.min(targetDay, daysInNextMonth);
  return nextMonth.date(actualDay);
}

/**
 * 繰り返しルールが有効かどうかを確認する
 */
export function hasValidRecurrence(rule: string | null | undefined): boolean {
  return parseRRule(rule) !== null;
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

## File: frontend/src/app/medical-records/page.tsx
```typescript
'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCalendarPlus, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
  type MedicalRecord,
  type GetMedicalRecordsParams,
  useCreateMedicalRecord,
  useGetMedicalRecords,
} from '@/lib/api/hooks/use-care';
import { useGetCats } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';
import { usePageHeader } from '@/lib/contexts/page-header-context';

import { ActionButton } from '@/components/ActionButton';
import { IconActionButton } from '@/components/buttons';
import { UnifiedModal } from '@/components/common';

const STATUS_LABELS = {
  TREATING: '治療中',
  COMPLETED: '完了',
} as const;

const STATUS_COLORS = {
  TREATING: 'yellow',
  COMPLETED: 'green',
} as const;

const PAGE_LIMIT = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return dayjs(value).format('YYYY年MM月DD日');
}

function truncateText(text: string | null | undefined, maxLength = 10): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

interface CreateMedicalRecordFormState {
  catId: string;
  visitDate: Date | null;
  hospitalName: string;
  symptomTags: string[]; // タグID配列
  diagnosis: string;
  treatmentPlan: string;
  status: string;
  followUpDate: Date | null;
  notes: string;
}

export default function MedicalRecordsPage() {
  const { setPageHeader } = usePageHeader();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [detailRecord, setDetailRecord] = useState<MedicalRecord | null>(null);

  const [createForm, setCreateForm] = useState<CreateMedicalRecordFormState>({
    catId: '',
    visitDate: new Date(),
    hospitalName: '',
    symptomTags: [],
    diagnosis: '',
    treatmentPlan: '',
    status: 'TREATING',
    followUpDate: null,
    notes: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const medicalRecordsParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: PAGE_LIMIT,
    };
    if (selectedCatId) {
      params.catId = selectedCatId;
    }
    return params as unknown as GetMedicalRecordsParams;
  }, [page, selectedCatId]);

  const medicalRecordsQuery = useGetMedicalRecords(medicalRecordsParams);
  const createMedicalRecordMutation = useCreateMedicalRecord();

  const catsQuery = useGetCats({ limit: 100 });
  const tagsQuery = useGetTagCategories();

  // 医療データページ用のタグを取得（健康カテゴリから症状タグを抽出）
  const medicalTags = useMemo(() => {
    const categories = tagsQuery.data?.data || [];
    const healthCategory = categories.find(cat => cat.key === 'health' || cat.name.includes('健康'));
    if (!healthCategory) return [];
    
    // 健康カテゴリ内の全タグを取得
    return healthCategory.tags || [];
  }, [tagsQuery.data]);

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      '医療データ',
      <ActionButton
        action="create"
        customIcon={<IconCalendarPlus size={18} />}
        onClick={openCreateModal}
      >
        新規医療記録
      </ActionButton>
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCreateForm = () => {
    setCreateForm({
      catId: '',
      visitDate: new Date(),
      hospitalName: '',
      symptomTags: [],
      diagnosis: '',
      treatmentPlan: '',
      status: 'TREATING',
      followUpDate: null,
      notes: '',
    });
    setCreateError(null);
  };

  const handleCreateSubmit = () => {
    const trimmedCatId = createForm.catId.trim();
    const trimmedHospitalName = createForm.hospitalName.trim();
    const trimmedDiagnosis = createForm.diagnosis.trim();
    const trimmedTreatmentPlan = createForm.treatmentPlan.trim();
    const trimmedNotes = createForm.notes.trim();

    if (!trimmedCatId) {
      setCreateError('対象猫は必須です。');
      return;
    }

    if (!createForm.visitDate) {
      setCreateError('受診日は必須です。');
      return;
    }

    setCreateError(null);

    createMedicalRecordMutation.mutate(
      {
        catId: trimmedCatId,
        visitDate: dayjs(createForm.visitDate).toISOString(),
        hospitalName: trimmedHospitalName || undefined,
        diagnosis: trimmedDiagnosis || undefined,
        treatmentPlan: trimmedTreatmentPlan || undefined,
        status: createForm.status as 'TREATING' | 'COMPLETED',
        followUpDate: createForm.followUpDate ? dayjs(createForm.followUpDate).toISOString() : undefined,
        notes: trimmedNotes || undefined,
      },
      {
        onSuccess: () => {
          resetCreateForm();
          closeCreateModal();
          void medicalRecordsQuery.refetch();
        },
      },
    );
  };

  const records = medicalRecordsQuery.data?.data ?? [];
  const meta = medicalRecordsQuery.data?.meta ?? {
    total: 0,
    totalPages: 1,
    page,
    limit: PAGE_LIMIT,
  };

  const isInitialLoading = medicalRecordsQuery.isLoading && records.length === 0;
  const isEmpty = !isInitialLoading && records.length === 0;

  return (
    <Container size="lg">
      <Card withBorder shadow="xs" radius="md">
        <LoadingOverlay visible={medicalRecordsQuery.isFetching && !medicalRecordsQuery.isLoading} zIndex={10} />
        <Stack gap="md">
          {medicalRecordsQuery.isError && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              医療記録の取得中にエラーが発生しました。時間をおいて再度お試しください。
            </Alert>
          )}

          {/* フィルター */}
          <Group grow>
            <Select
              placeholder="猫を選択"
              data={(catsQuery.data?.data ?? []).map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              value={selectedCatId}
              onChange={setSelectedCatId}
              clearable
            />
            <TextInput
              placeholder="検索キーワード"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
          </Group>

          {isInitialLoading ? (
            <Stack>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={72} radius="md" />
              ))}
            </Stack>
          ) : isEmpty ? (
            <Card padding="xl" radius="md" bg="gray.0">
              <Stack gap="sm" align="center">
                <IconAlertCircle size={28} color="var(--mantine-color-teal-6)" />
                <Text fw={600}>表示する医療記録はありません</Text>
                <Text size="sm" c="dimmed" ta="center">
                  医療記録を追加して、猫の健康状態を管理しましょう。
                </Text>
                <ActionButton
                  action="create"
                  onClick={openCreateModal}
                >
                  医療記録を登録する
                </ActionButton>
              </Stack>
            </Card>
          ) : (
            <>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '15%' }}>受診日</Table.Th>
                    <Table.Th style={{ width: '15%' }}>猫名</Table.Th>
                    <Table.Th style={{ width: '25%' }}>症状・診断</Table.Th>
                    <Table.Th style={{ width: '15%' }}>病院名</Table.Th>
                    <Table.Th style={{ width: '15%' }}>状態</Table.Th>
                    <Table.Th style={{ width: '15%', textAlign: 'center' }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {formatDate(record.visitDate)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {record.cat.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text size="sm" c={record.diagnosis ? undefined : 'dimmed'}>
                            {record.diagnosis ? truncateText(record.diagnosis, 12) : '診断なし'}
                          </Text>
                          {record.symptom && (
                            <Text size="xs" c="dimmed">
                              {truncateText(record.symptom, 12)}
                            </Text>
                          )}
                          {record.tags && record.tags.length > 0 && (
                            <Group gap={4}>
                              {record.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  size="xs"
                                  variant="dot"
                                  color={tag.color || 'blue'}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {record.tags.length > 2 && (
                                <Text size="xs" c="dimmed">
                                  +{record.tags.length - 2}
                                </Text>
                              )}
                            </Group>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={record.hospitalName ? undefined : 'dimmed'}>
                          {record.hospitalName || '未設定'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[record.status]} variant="light">
                          {STATUS_LABELS[record.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <IconActionButton
                            variant="view"
                            onClick={() => {
                              setDetailRecord(record);
                              openDetailModal();
                            }}
                          />
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {meta.totalPages > 1 && (
                <Group justify="center">
                  <Pagination
                    value={meta.page ?? page}
                    onChange={(value) => setPage(value)}
                    total={meta.totalPages}
                    siblings={1}
                  />
                </Group>
              )}
            </>
          )}
        </Stack>
      </Card>

      <UnifiedModal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        title="医療記録の詳細"
        size="lg"
        sections={[
          {
            label: '基本情報',
            content: detailRecord ? (
              <>
                <Group justify="space-between">
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      受診日
                    </Text>
                    <Text fw={500}>{formatDate(detailRecord.visitDate)}</Text>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      状態
                    </Text>
                    <Badge color={STATUS_COLORS[detailRecord.status]} variant="light">
                      {STATUS_LABELS[detailRecord.status]}
                    </Badge>
                  </Box>
                </Group>

                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    対象猫
                  </Text>
                  <Text fw={500}>{detailRecord.cat.name}</Text>
                </Box>

                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    病院名
                  </Text>
                  <Text fw={500}>{detailRecord.hospitalName || '未設定'}</Text>
                </Box>
              </>
            ) : null,
          },
          {
            label: '症状',
            content: detailRecord ? (
              <>
                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    症状
                  </Text>
                  <Text>{detailRecord.symptom || '記録なし'}</Text>
                </Box>

                {detailRecord.tags && detailRecord.tags.length > 0 && (
                  <Box>
                    <Text size="sm" c="dimmed" mb={8}>
                      症状タグ
                    </Text>
                    <Group gap="xs">
                      {detailRecord.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          color={tag.color || 'blue'}
                          variant="light"
                          size="lg"
                        >
                          {tag.categoryName && `${tag.categoryName} > `}
                          {tag.groupName && `${tag.groupName} > `}
                          {tag.name}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    病名
                  </Text>
                  <Text>{detailRecord.diseaseName || '記録なし'}</Text>
                </Box>

                {detailRecord.symptomDetails && detailRecord.symptomDetails.length > 0 && (
                  <Box>
                    <Text size="sm" c="dimmed" mb={8}>
                      症状詳細
                    </Text>
                    <Stack gap="xs">
                      {detailRecord.symptomDetails.map((symptom, index) => (
                        <Card key={index} withBorder padding="sm">
                          <Text fw={500} size="sm">{symptom.label}</Text>
                          {symptom.note && (
                            <Text size="sm" c="dimmed" mt={4}>{symptom.note}</Text>
                          )}
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            ) : null,
          },
          {
            label: '診断・治療',
            content: detailRecord ? (
              <>
                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    診断
                  </Text>
                  <Text>{detailRecord.diagnosis || '記録なし'}</Text>
                </Box>

                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    治療計画
                  </Text>
                  <Text>{detailRecord.treatmentPlan || '記録なし'}</Text>
                </Box>

                {detailRecord.medications && detailRecord.medications.length > 0 && (
                  <Box>
                    <Text size="sm" c="dimmed" mb={8}>
                      投薬
                    </Text>
                    <Stack gap="xs">
                      {detailRecord.medications.map((medication, index) => (
                        <Card key={index} withBorder padding="sm">
                          <Text fw={500} size="sm">{medication.name}</Text>
                          {medication.dosage && (
                            <Text size="sm" c="dimmed" mt={4}>{medication.dosage}</Text>
                          )}
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                )}

                <Group grow>
                  <Box>
                    <Text size="sm" c="dimmed" mb={4}>
                      次回予定日
                    </Text>
                    <Text>{formatDate(detailRecord.followUpDate)}</Text>
                  </Box>
                </Group>

                <Box>
                  <Text size="sm" c="dimmed" mb={4}>
                    備考
                  </Text>
                  <Text>{detailRecord.notes || 'なし'}</Text>
                </Box>

                <Group justify="space-between" mt="md">
                  <Text size="xs" c="dimmed">
                    記録者: {detailRecord.recordedBy}
                  </Text>
                  <Text size="xs" c="dimmed">
                    作成日: {dayjs(detailRecord.createdAt).format('YYYY/MM/DD HH:mm')}
                  </Text>
                </Group>
              </>
            ) : null,
          },
          {
            content: (
              <Group justify="flex-end">
                <ActionButton action="cancel" onClick={closeDetailModal}>
                  閉じる
                </ActionButton>
              </Group>
            ),
          },
        ]}
      />

      <UnifiedModal
        opened={createModalOpened}
        onClose={() => {
          closeCreateModal();
          resetCreateForm();
        }}
        title="医療記録を追加"
        size="lg"
        sections={[
          {
            label: '基本情報',
            content: (
              <>
                <Select
                  label="対象猫"
                  placeholder="猫を選択"
                  data={(catsQuery.data?.data ?? []).map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  value={createForm.catId}
                  onChange={(value) => setCreateForm((prev) => ({ ...prev, catId: value || '' }))}
                  required
                />

                <DatePickerInput
                  label="受診日"
                  placeholder="受診日を選択"
                  value={createForm.visitDate}
                  onChange={(value) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      visitDate: value ? new Date(value) : null,
                    }))
                  }
                  required
                />

                <TextInput
                  label="病院名"
                  placeholder="例: ねこクリニック東京"
                  value={createForm.hospitalName}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      hospitalName: event.target.value,
                    }))
                  }
                />
              </>
            ),
          },
          {
            label: '症状・診断',
            content: (
              <>
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    症状タグ
                  </Text>
                  {tagsQuery.isLoading ? (
                    <Skeleton height={40} />
                  ) : medicalTags.length > 0 ? (
                    <>
                      <Group gap="xs" mb="sm">
                        {medicalTags.map((tag) => {
                          const isSelected = createForm.symptomTags.includes(tag.id);
                          return (
                            <Button
                              key={tag.id}
                              variant={isSelected ? 'filled' : 'outline'}
                              color={isSelected ? tag.color || 'blue' : 'gray'}
                              size="xs"
                              rightSection={isSelected ? <IconX size={12} /> : undefined}
                              onClick={() => {
                                setCreateForm((prev) => ({
                                  ...prev,
                                  symptomTags: isSelected
                                    ? prev.symptomTags.filter((id) => id !== tag.id)
                                    : [...prev.symptomTags, tag.id],
                                }));
                              }}
                            >
                              {tag.name}
                            </Button>
                          );
                        })}
                      </Group>
                      {createForm.symptomTags.length > 0 && (
                        <Text size="xs" c="dimmed">
                          選択されたタグ: {createForm.symptomTags.map(id => {
                            const tag = medicalTags.find(t => t.id === id);
                            return tag?.name || id;
                          }).join(', ')}
                        </Text>
                      )}
                    </>
                  ) : (
                    <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                      タグ管理ページで「健康」カテゴリのタグを作成してください
                    </Alert>
                  )}
                </Box>

                <Textarea
                  label="診断結果"
                  placeholder="診断結果"
                  value={createForm.diagnosis}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
                  minRows={2}
                  autosize
                />
              </>
            ),
          },
          {
            label: '治療計画',
            content: (
              <>
                <Textarea
                  label="治療計画"
                  placeholder="治療内容や計画"
                  value={createForm.treatmentPlan}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, treatmentPlan: event.target.value }))}
                  minRows={2}
                  autosize
                />

                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    治療ステータス
                  </Text>
                  <SegmentedControl
                    value={createForm.status}
                    onChange={(value) => setCreateForm((prev) => ({ ...prev, status: value }))}
                    data={[
                      { label: '治療中', value: 'TREATING' },
                      { label: '完了', value: 'COMPLETED' },
                    ]}
                    fullWidth
                  />
                </Box>

                <DatePickerInput
                  label="次回予定日"
                  placeholder="次回の受診予定日"
                  value={createForm.followUpDate}
                  onChange={(value) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      followUpDate: value ? new Date(value) : null,
                    }))
                  }
                />

                <Textarea
                  label="備考"
                  placeholder="その他のメモ"
                  value={createForm.notes}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))}
                  minRows={3}
                  autosize
                />

                {createError && (
                  <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {createError}
                  </Alert>
                )}
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
                <ActionButton action="cancel" onClick={() => {
                  closeCreateModal();
                  resetCreateForm();
                }}>
                  キャンセル
                </ActionButton>
                <ActionButton action="save" onClick={handleCreateSubmit} loading={createMedicalRecordMutation.isPending}>
                  登録する
                </ActionButton>
              </Group>
            ),
          },
        ]}
      />
    </Container>
  );
}
```

## File: frontend/src/app/care/page.tsx
```typescript
'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Stack,
  Switch,
  TextInput,
  Table,
  Text,
  Textarea,
  Checkbox,
  Accordion,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCheck, IconPlus, IconX, IconCalendarPlus, IconLayoutGrid, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { UnifiedModal } from '@/components/common';

import {
  type CareSchedule,
  type CreateCareScheduleRequest,
  type GetCareSchedulesParams,
  useAddCareSchedule,
  useUpdateCareSchedule,
  useDeleteCareSchedule,
  useCompleteCareSchedule,
  useGetCareSchedules,
} from '@/lib/api/hooks/use-care';
import { useGetCats } from '@/lib/api/hooks/use-cats';
import {
  useGetTagCategories,
  type TagCategoryView,
  type TagView,
} from '@/lib/api/hooks/use-tags';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ContextMenuProvider, useContextMenu, OperationModalManager } from '@/components/context-menu';

import { ActionMenu } from '@/app/tenants/_components/ActionMenu';
import { ActionButton } from '@/components/ActionButton';
import { IconActionButton } from '@/components/buttons';

const STATUS_LABELS = {
  PENDING: '未着手',
  IN_PROGRESS: '進行中',
  COMPLETED: '完了',
  CANCELLED: 'キャンセル',
} as const;

const STATUS_COLORS = {
  PENDING: 'yellow',
  IN_PROGRESS: 'blue',
  COMPLETED: 'teal',
  CANCELLED: 'gray',
} as const;

const PAGE_LIMIT = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return dayjs(value).format('YYYY年MM月DD日');
}

function formatRecurrenceRule(rule: string | null | undefined): string {
  if (!rule) return '単発';
  
  if (rule.includes('FREQ=DAILY')) return '毎日';
  if (rule.includes('FREQ=WEEKLY')) {
    const dayMatch = rule.match(/BYDAY=([A-Z,]+)/);
    if (dayMatch) {
      const days = dayMatch[1].split(',');
      const dayNames: Record<string, string> = {
        'SU': '日', 'MO': '月', 'TU': '火', 'WE': '水',
        'TH': '木', 'FR': '金', 'SA': '土'
      };
      const japDays = days.map(d => dayNames[d] || d).join('・');
      return `毎週${japDays}曜日`;
    }
    return '毎週';
  }
  if (rule.includes('FREQ=MONTHLY')) {
    const dayMatch = rule.match(/BYMONTHDAY=(\d+)/);
    if (dayMatch) {
      return `毎月${dayMatch[1]}日`;
    }
    return '毎月';
  }
  if (rule.includes('FREQ=YEARLY')) return '毎年';
  return rule;
}

function truncateText(text: string | null | undefined, maxLength = 10): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function buildRecurrenceRule(schedule: CreateScheduleFormState['schedule']): string | undefined {
  if (!schedule || schedule.type === 'single') {
    return undefined;
  }

  switch (schedule.type) {
    case 'daily':
      return 'FREQ=DAILY;INTERVAL=1';
    
    case 'weekly':
      if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byday = schedule.daysOfWeek.map(d => days[d]).join(',');
        return `FREQ=WEEKLY;INTERVAL=1;BYDAY=${byday}`;
      }
      return 'FREQ=WEEKLY;INTERVAL=1';
    
    case 'monthly':
      if (schedule.dayOfMonth) {
        return `FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=${schedule.dayOfMonth}`;
      }
      return 'FREQ=MONTHLY;INTERVAL=1';
    
    case 'period':
      // 期間指定の場合はRRULEではなく終了日を使用
      return undefined;
    
    case 'birthday':
      // 生後○日目は個別にハンドリングが必要
      return undefined;
    
    default:
      return undefined;
  }
}


interface CreateScheduleFormState {
  name: string;
  category: 'Male' | 'Female' | 'Kitten' | 'Adult' | null;
  tags: string[];
  selectedCatIds: string[];
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'period' | 'birthday' | 'single';
    startDate?: string | null;
    endDate?: string | null;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    daysAfterBirth?: number;
  } | null;
  description: string;
}

interface CompleteScheduleFormState {
  completedDate: Date | null;
  nextScheduledDate: Date | null;
  notes: string;
}

export default function CarePage() {
  const { setPageHeader } = usePageHeader();
  
  const [page, setPage] = useState(1);
  const [selectedCareNames, setSelectedCareNames] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [addCardModalOpened, { open: openAddCardModal, close: closeAddCardModal }] = useDisclosure(false);
  const [completeModalOpened, { open: openCompleteModal, close: closeCompleteModal }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [detailSchedule, setDetailSchedule] = useState<CareSchedule | null>(null);

  const [createForm, setCreateForm] = useState<CreateScheduleFormState>({
    name: '',
    category: null,
    tags: [],
    selectedCatIds: [],
    schedule: null,
    description: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const [completeForm, setCompleteForm] = useState<CompleteScheduleFormState>({
    completedDate: new Date(),
    nextScheduledDate: null,
    notes: '',
  });
  const [targetSchedule, setTargetSchedule] = useState<CareSchedule | null>(null);

  const scheduleParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: PAGE_LIMIT,
    };
    return params as unknown as GetCareSchedulesParams;
  }, [page]);

  const scheduleQuery = useGetCareSchedules(scheduleParams);
  const addScheduleMutation = useAddCareSchedule();
  const updateScheduleMutation = useUpdateCareSchedule();
  const deleteScheduleMutation = useDeleteCareSchedule();
  const completeScheduleMutation = useCompleteCareSchedule();

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [editingSchedule, setEditingSchedule] = useState<CareSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<CareSchedule | null>(null);

  // コンテキストメニュー用の状態
  const {
    currentOperation,
    currentEntity,
    handleAction: handleScheduleContextAction,
    openOperation,
    closeOperation,
  } = useContextMenu<CareSchedule>({
    view: (schedule) => {
      if (schedule) {
        setDetailSchedule(schedule);
        openDetailModal();
      }
    },
    edit: (schedule) => {
      if (schedule) {
        setEditingSchedule(schedule);
        openEditModal();
      }
    },
    delete: (schedule) => {
      if (schedule) {
        openOperation('delete', schedule);
      }
    },
  });

  const handleOperationConfirm = () => {
    if (currentOperation === 'delete' && currentEntity) {
      setDeletingSchedule(currentEntity);
      deleteScheduleMutation.mutate(currentEntity.id, {
        onSuccess: () => {
          scheduleQuery.refetch();
          closeOperation();
        },
      });
    }
  };

  const catsQuery = useGetCats({ limit: 100 });

  const tagsQuery = useGetTagCategories();
  
  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'ケアスケジュール',
      <ActionMenu
        buttonLabel="ケアの登録"
        buttonIcon={IconPlus}
        action="create"
        items={[
          {
            id: 'schedule',
            label: 'ケア予定を追加',
            icon: <IconCalendarPlus size={16} />,
            onClick: openCreateModal,
          },
          {
            id: 'card',
            label: 'カードを追加',
            icon: <IconLayoutGrid size={16} />,
            onClick: openAddCardModal,
          }
        ]}
      />
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const allTags = useMemo(() => {
    try {
      // Return empty array if data is not available or not an array
      if (!tagsQuery.data?.data || !Array.isArray(tagsQuery.data.data)) {
        return [];
      }
      
      // Helper to validate tag has required properties
      const isValidTag = (tag: unknown): tag is TagView => {
        if (!tag || typeof tag !== 'object') return false;
        const t = tag as TagView;
        return typeof t.id === 'string' && typeof t.name === 'string' &&
               t.id.trim() !== '' && t.name.trim() !== '';
      };
      
      // Helper to validate category has required properties
      const isValidCategory = (category: unknown): category is TagCategoryView => {
        if (!category || typeof category !== 'object') return false;
        const c = category as TagCategoryView;
        return typeof c.name === 'string' && c.name.trim() !== '' && Array.isArray(c.tags);
      };
      
      // Use category.tags directly (already computed by useGetTagCategories)
      return tagsQuery.data.data
        .filter(isValidCategory)
        .flatMap((category: TagCategoryView) => 
          (category.tags || [])
            .filter(isValidTag)
            .map((tag: TagView) => ({
              value: tag.id,
              label: tag.name,
              // Temporarily remove group to test
              // group: category.name || 'その他',
            }))
        );
    } catch (error) {
      // Log error and return empty array to prevent crashes
      console.error('Error computing allTags:', error);
      return [];
    }
  }, [tagsQuery.data?.data]);

  // 絞り込まれた猫を計算
  const filteredCats = useMemo(() => {
    if (!catsQuery.data?.data) return [];
    let filtered = catsQuery.data.data;

    // カテゴリで絞り込み
    if (createForm.category) {
      filtered = filtered.filter((cat) => {
        if (createForm.category === 'Male') return cat.gender === 'MALE';
        if (createForm.category === 'Female') return cat.gender === 'FEMALE';
        if (createForm.category === 'Kitten') {
          // 生後1年未満をKittenとする
          const birthDate = dayjs(cat.birthDate);
          const oneYearAgo = dayjs().subtract(1, 'year');
          return birthDate.isAfter(oneYearAgo);
        }
        if (createForm.category === 'Adult') {
          // 生後1年以上をAdultとする
          const birthDate = dayjs(cat.birthDate);
          const oneYearAgo = dayjs().subtract(1, 'year');
          return birthDate.isBefore(oneYearAgo);
        }
        return true;
      });
    }

    // タグで絞り込み
    if (createForm.tags.length > 0) {
      filtered = filtered.filter((cat) =>
        createForm.tags.some((tagId) =>
          cat.tags?.some((catTag) => catTag.tag.id === tagId)
        )
      );
    }

    return filtered;
  }, [catsQuery.data?.data, createForm.category, createForm.tags]);

  const schedules = scheduleQuery.data?.data ?? [];
  const meta = scheduleQuery.data?.meta ?? {
    total: 0,
    totalPages: 1,
    page,
    limit: PAGE_LIMIT,
  };

  // 登録されているケア名を取得
  const availableCareNames = useMemo(() => {
    const allSchedules = scheduleQuery.data?.data ?? [];
    const uniqueNames = new Set<string>();
    allSchedules.forEach((schedule) => {
      if (schedule.name) {
        uniqueNames.add(schedule.name);
      }
    });
    return Array.from(uniqueNames).sort();
  }, [scheduleQuery.data?.data]);

  // 選択されたケア名ごとの統計を計算
  const selectedCareStats = useMemo(() => {
    const allSchedules = scheduleQuery.data?.data ?? [];
    return selectedCareNames.map((careName) => {
      const relatedSchedules = allSchedules.filter((schedule) => schedule.name === careName);
      const uniqueCats = new Set(relatedSchedules.map((schedule) => schedule.cat?.id).filter(Boolean));
      return {
        name: careName,
        catCount: uniqueCats.size,
      };
    });
  }, [selectedCareNames, scheduleQuery.data?.data]);

  // const handleRefresh = () => {
  //   void scheduleQuery.refetch();
  // };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      category: null,
      tags: [],
      selectedCatIds: [],
      schedule: null,
      description: '',
    });
    setSelectedTag(null);
    setCreateError(null);
  };

  const handleCreateSubmit = () => {
    const trimmedName = createForm.name.trim();
    const trimmedDescription = createForm.description.trim();

    if (!trimmedName) {
      setCreateError('ケア名は必須です。');
      return;
    }

    // TODO: スケジュールバリデーションを追加

    setCreateError(null);
    // TODO: 新しいAPIに合わせて送信処理を更新
    // 仮に複数猫に対応したAPIを使用
    const catIds = createForm.selectedCatIds.length > 0 ? createForm.selectedCatIds : filteredCats.map(cat => cat.id);
    
    const recurrenceRule = buildRecurrenceRule(createForm.schedule);
    
    addScheduleMutation.mutate(
      {
        name: trimmedName,
        catIds: catIds,
        careType: 'OTHER',
        scheduledDate: createForm.schedule?.startDate ? dayjs(createForm.schedule.startDate).toISOString() : dayjs().toISOString(),
        description: trimmedDescription || undefined,
        recurrenceRule: recurrenceRule,
      } as CreateCareScheduleRequest,
      {
        onSuccess: () => {
          resetCreateForm();
          closeCreateModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  /**
   * ケアスケジュールの完了モーダルを開く
   */
  const openCompleteScheduleModal = (schedule: CareSchedule) => {
    setTargetSchedule(schedule);
    setCompleteForm({
      completedDate: new Date(),
      nextScheduledDate: null,
      notes: '',
    });
    openCompleteModal();
  };

  const handleCompleteSubmit = () => {
    if (!targetSchedule) return;

    completeScheduleMutation.mutate(
      {
        id: targetSchedule.id,
        payload: {
          completedDate: dayjs(completeForm.completedDate ?? new Date()).toISOString(),
          nextScheduledDate: completeForm.nextScheduledDate
            ? dayjs(completeForm.nextScheduledDate).toISOString()
            : undefined,
          notes: completeForm.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setTargetSchedule(null);
          closeCompleteModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  const handleEditSchedule = (schedule: CareSchedule) => {
    setEditingSchedule(schedule);
    // フォームに既存データを設定
    setCreateForm({
      name: schedule.name,
      category: null,
      tags: schedule.tags?.map(t => t.id) ?? [],
      selectedCatIds: schedule.cats?.map(c => c.id) ?? [],
      schedule: {
        type: 'single',
        startDate: schedule.scheduleDate,
      },
      description: schedule.description ?? '',
    });
    openEditModal();
  };

  const handleUpdateSubmit = () => {
    if (!editingSchedule) return;

    const trimmedName = createForm.name.trim();
    const trimmedDescription = createForm.description.trim();

    if (!trimmedName) {
      setCreateError('ケア名は必須です。');
      return;
    }

    const catIds = createForm.selectedCatIds.length > 0 ? createForm.selectedCatIds : filteredCats.map(cat => cat.id);
    const recurrenceRule = buildRecurrenceRule(createForm.schedule);

    updateScheduleMutation.mutate(
      {
        id: editingSchedule.id,
        payload: {
          name: trimmedName,
          catIds: catIds,
          careType: 'OTHER',
          scheduledDate: createForm.schedule?.startDate ? dayjs(createForm.schedule.startDate).toISOString() : dayjs().toISOString(),
          description: trimmedDescription || undefined,
          recurrenceRule: recurrenceRule,
        } as CreateCareScheduleRequest,
      },
      {
        onSuccess: () => {
          setEditingSchedule(null);
          resetCreateForm();
          closeEditModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  const handleDeleteSchedule = (schedule: CareSchedule) => {
    setDeletingSchedule(schedule);
    openDeleteModal();
  };

  const handleConfirmDelete = () => {
    if (!deletingSchedule) return;

    deleteScheduleMutation.mutate(deletingSchedule.id, {
      onSuccess: () => {
        setDeletingSchedule(null);
        closeDeleteModal();
        void scheduleQuery.refetch();
      },
    });
  };

  const isInitialLoading = scheduleQuery.isLoading && schedules.length === 0;
  const isEmpty = !isInitialLoading && schedules.length === 0;

  return (
    <Container size="lg">
      {/* 選択されたケア名のカード表示 */}
      {selectedCareStats.length > 0 && (
        <Group grow mb="lg">
          {selectedCareStats.map((stat) => (
            <Card key={stat.name} shadow="xs" padding="md" radius="md" withBorder>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed" mb={4}>
                    {stat.name}
                  </Text>
                  <Text size="xl" fw={700}>
                    {stat.catCount}
                  </Text>
                  <Text size="xs" c="dimmed">
                    頭
                  </Text>
                </div>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    setSelectedCareNames((prev) => prev.filter((name) => name !== stat.name));
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Group>
      )}

      <Card withBorder shadow="xs" radius="md">
        <LoadingOverlay visible={scheduleQuery.isFetching && !scheduleQuery.isLoading} zIndex={10} />
        <Stack gap="md">
          {scheduleQuery.isError && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              ケアスケジュールの取得中にエラーが発生しました。時間をおいて再度お試しください。
            </Alert>
          )}

          {isInitialLoading ? (
            <Stack>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={72} radius="md" />
              ))}
            </Stack>
          ) : isEmpty ? (
            <Card padding="xl" radius="md" bg="gray.0">
              <Stack gap="sm" align="center">
                <IconCheck size={28} color="var(--mantine-color-teal-6)" />
                <Text fw={600}>表示するケア予定はありません</Text>
                <Text size="sm" c="dimmed" ta="center">
                  ケア予定を追加して、ケアの履歴を管理しましょう。
                </Text>
                <ActionButton
                  action="create"
                  onClick={openCreateModal}
                >
                  ケア予定を登録する
                </ActionButton>
              </Stack>
            </Card>
          ) : (
            <>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '15%' }}>ケア名</Table.Th>
                    <Table.Th style={{ width: '20%' }}>スケジュール</Table.Th>
                    <Table.Th style={{ width: '20%' }}>内容</Table.Th>
                    <Table.Th style={{ width: '12%' }}>対象</Table.Th>
                    <Table.Th style={{ width: '10%' }}>状態</Table.Th>
                    <Table.Th style={{ width: '23%', textAlign: 'center' }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {schedules.map((schedule) => (
                    <ContextMenuProvider
                      key={schedule.id}
                      entity={schedule}
                      entityType="ケアスケジュール"
                      actions={['view', 'edit', 'delete']}
                      onAction={handleScheduleContextAction}
                    >
                    <Table.Tr style={{ cursor: 'pointer' }} title="右クリックまたはダブルクリックで操作">
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {schedule.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {formatDate(schedule.scheduleDate)}
                          </Text>
                          {schedule.recurrenceRule && (
                            <Text size="xs" c="green">
                              {formatRecurrenceRule(schedule.recurrenceRule)}
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={schedule.description ? undefined : 'dimmed'}>
                          {schedule.description ? truncateText(schedule.description, 15) : 'なし'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {schedule.cats && schedule.cats.length > 0 ? `${schedule.cats.length}頭` : schedule.cat ? '1頭' : '未設定'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={schedule.status === 'PENDING' || schedule.status === 'IN_PROGRESS'}
                          size="sm"
                          onLabel="有効"
                          offLabel="無効"
                          disabled
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <IconActionButton
                            variant="confirm"
                            label="完了にする"
                            onClick={() => openCompleteScheduleModal(schedule)}
                            disabled={schedule.status === 'COMPLETED'}
                          />
                          <IconActionButton
                            variant="view"
                            onClick={() => {
                              setDetailSchedule(schedule);
                              openDetailModal();
                            }}
                          />
                          <IconActionButton
                            variant="edit"
                            onClick={() => handleEditSchedule(schedule)}
                          />
                          <IconActionButton
                            variant="delete"
                            onClick={() => handleDeleteSchedule(schedule)}
                          />
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                    </ContextMenuProvider>
                  ))}
                </Table.Tbody>
              </Table>

              {meta.totalPages > 1 && (
                <Group justify="center">
                  <Pagination
                    value={meta.page ?? page}
                    onChange={(value) => setPage(value)}
                    total={meta.totalPages}
                    siblings={1}
                  />
                </Group>
              )}
            </>
          )}
        </Stack>
      </Card>

      <UnifiedModal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        title="ケア予定の詳細"
        size="lg"
      >
        {detailSchedule && (
          <>
            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                対象猫
              </Text>
              {detailSchedule.cats && detailSchedule.cats.length > 0 ? (
                <Stack gap="xs">
                  {detailSchedule.cats.map((cat) => (
                    <Text key={cat.id} fw={500}>{cat.name}</Text>
                  ))}
                  <Text size="xs" c="dimmed">計 {detailSchedule.cats.length}頭</Text>
                </Stack>
              ) : (
                <Text fw={500}>{detailSchedule.cat?.name ?? '未設定'}</Text>
              )}
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                予定日
              </Text>
              <Text fw={500}>{formatDate(detailSchedule.scheduleDate)}</Text>
            </Box>

            {detailSchedule.recurrenceRule && (
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  繰り返し設定
                </Text>
                <Group gap="xs">
                  <IconRefresh size={16} color="var(--mantine-color-green-6)" />
                  <Text fw={500} c="green">
                    {formatRecurrenceRule(detailSchedule.recurrenceRule)}
                  </Text>
                </Group>
              </Box>
            )}

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                詳細内容
              </Text>
              <Text>{detailSchedule.description || 'メモは登録されていません'}</Text>
            </Box>

            {detailSchedule.tags && detailSchedule.tags.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb={8}>
                  タグ
                </Text>
                <Group gap="xs">
                  {detailSchedule.tags.map((tag) => (
                    <Badge key={tag.id} variant="dot">
                      {tag.label}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            <Divider />

            <Group justify="space-between">
              <Box>
                <Text size="sm" c="dimmed">
                  登録者
                </Text>
                <Text size="sm" fw={500}>
                  {detailSchedule.assignedTo || '未設定'}
                </Text>
              </Box>
              <Box>
                <Text size="sm" c="dimmed">
                  ステータス
                </Text>
                <Badge color={STATUS_COLORS[detailSchedule.status]} variant="light">
                  {STATUS_LABELS[detailSchedule.status]}
                </Badge>
              </Box>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                作成日: {dayjs(detailSchedule.createdAt).format('YYYY/MM/DD HH:mm')}
              </Text>
              {detailSchedule.updatedAt && (
                <Text size="xs" c="dimmed">
                  更新日: {dayjs(detailSchedule.updatedAt).format('YYYY/MM/DD HH:mm')}
                </Text>
              )}
            </Group>

            <Group justify="flex-end" mt="md">
              <ActionButton action="cancel" onClick={closeDetailModal}>
                閉じる
              </ActionButton>
            </Group>
          </>
        )}
      </UnifiedModal>

      <UnifiedModal 
        opened={createModalOpened} 
        onClose={() => {
          closeCreateModal();
          resetCreateForm();
        }} 
        title="ケア予定を追加" 
        size="lg"
        sections={[
          {
            label: '基本情報',
            content: (
              <>
                <TextInput
                  label="ケア名"
                  placeholder="例: 年次健康診断"
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                />

                <RadioGroup
                  label="カテゴリ"
                  value={createForm.category}
                  onChange={(value) => setCreateForm((prev) => ({ ...prev, category: value as 'Male' | 'Female' | 'Kitten' | 'Adult' }))}
                >
                  <Group mt="xs">
                    <Radio value="Male" label="Male" />
                    <Radio value="Female" label="Female" />
                    <Radio value="Kitten" label="Kitten" />
                    <Radio value="Adult" label="Adult" />
                  </Group>
                </RadioGroup>

                <div>
                  <Group grow align="flex-end" gap="xs">
                    <Select
                      label="タグ"
                      placeholder="タグを選択"
                      data={allTags || []}
                      value={selectedTag}
                      onChange={(value) => setSelectedTag(value)}
                    />
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={() => {
                        if (selectedTag && !(createForm.tags || []).includes(selectedTag)) {
                          setCreateForm((prev) => ({
                            ...prev,
                            tags: [...(prev.tags || []), selectedTag],
                          }));
                          setSelectedTag(null);
                        }
                      }}
                      disabled={!selectedTag}
                      w="auto"
                    >
                      追加
                    </Button>
                  </Group>
                  {(createForm.tags || []).length > 0 && (
                    <Group mt="xs" gap="xs">
                      {(createForm.tags || []).map((tagId) => {
                        const tag = allTags.find((t) => t.value === tagId);
                        return (
                          <Badge
                            key={tagId}
                            variant="light"
                            rightSection={
                              <ActionIcon
                                size="xs"
                                variant="transparent"
                                onClick={() =>
                                  setCreateForm((prev) => ({
                                    ...prev,
                                    tags: (prev.tags || []).filter((id) => id !== tagId),
                                  }))
                                }
                              >
                                <IconX size={12} />
                              </ActionIcon>
                            }
                          >
                            {tag?.label || tagId}
                          </Badge>
                        );
                      })}
                    </Group>
                  )}
                </div>
              </>
            ),
          },
          {
            label: '対象猫',
            content: (
              <>
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={500}>対象猫</Text>
                  <Text size="sm" c="dimmed">{filteredCats.length}頭</Text>
                </Group>

                <Accordion>
                  <Accordion.Item value="select-cats">
                    <Accordion.Control>更に選択する</Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        {filteredCats.length === 0 ? (
                          <Text size="sm" c="dimmed">絞り込まれた猫がありません</Text>
                        ) : (
                          filteredCats.map((cat) => (
                            <Checkbox
                              key={cat.id}
                              label={`${cat.name} (${cat.gender})`}
                              checked={createForm.selectedCatIds.includes(cat.id)}
                              onChange={(event) => {
                                const checked = event.currentTarget.checked;
                                setCreateForm((prev) => ({
                                  ...prev,
                                  selectedCatIds: checked
                                    ? [...prev.selectedCatIds, cat.id]
                                    : prev.selectedCatIds.filter((id) => id !== cat.id),
                                }));
                              }}
                            />
                          ))
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </>
            ),
          },
          {
            label: 'スケジュール設定',
            content: (
              <>
                <Select
                  label="スケジュールタイプ"
                  placeholder="スケジュールタイプを選択"
                  data={[
                    { value: 'daily', label: '毎日' },
                    { value: 'weekly', label: '毎週○曜日' },
                    { value: 'monthly', label: '毎月○日' },
                    { value: 'period', label: '○日〜○日（期間指定）' },
                    { value: 'birthday', label: '生後○日目' },
                    { value: 'single', label: '単日' },
                  ]}
                  value={createForm.schedule?.type || null}
                  onChange={(value) => setCreateForm((prev) => ({
                    ...prev,
                    schedule: value ? { type: value as 'daily' | 'weekly' | 'monthly' | 'period' | 'birthday' | 'single' } : null
                  }))}
                />

                {createForm.schedule?.type === 'weekly' && (
                  <Select
                    label="曜日"
                    placeholder="曜日を選択"
                    data={[
                      { value: '0', label: '日曜日' },
                      { value: '1', label: '月曜日' },
                      { value: '2', label: '火曜日' },
                      { value: '3', label: '水曜日' },
                      { value: '4', label: '木曜日' },
                      { value: '5', label: '金曜日' },
                      { value: '6', label: '土曜日' },
                    ]}
                    value={createForm.schedule.daysOfWeek?.[0]?.toString() || null}
                    onChange={(value) => setCreateForm((prev) => {
                      if (!prev.schedule) {
                        return prev;
                      }
                      return {
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          daysOfWeek: value ? [parseInt(value, 10)] : [],
                        },
                      };
                    })}
                  />
                )}

                {createForm.schedule?.type === 'monthly' && (
                  <Select
                    label="日付"
                    placeholder="日付を選択"
                    data={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: `${i + 1}日` }))}
                    value={createForm.schedule.dayOfMonth?.toString() || null}
                    onChange={(value) => setCreateForm((prev) => {
                      if (!prev.schedule) {
                        return prev;
                      }
                      return {
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          dayOfMonth: value ? parseInt(value, 10) : undefined,
                        },
                      };
                    })}
                  />
                )}

                {createForm.schedule?.type === 'period' && (
                  <Group grow>
                    <DatePickerInput
                      label="開始日"
                      value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
                      onChange={(value) => setCreateForm((prev) => ({
                        ...prev,
                        schedule: prev.schedule ? {
                          ...prev.schedule,
                          startDate: value
                        } : null
                      }))}
                    />
                    <DatePickerInput
                      label="終了日"
                      value={createForm.schedule.endDate ? new Date(createForm.schedule.endDate) : null}
                      onChange={(value) => setCreateForm((prev) => ({
                        ...prev,
                        schedule: prev.schedule ? {
                          ...prev.schedule,
                          endDate: value
                        } : null
                      }))}
                    />
                  </Group>
                )}

                {createForm.schedule?.type === 'birthday' && (
                  <TextInput
                    label="生後日数"
                    placeholder="例: 21"
                    type="number"
                    value={createForm.schedule.daysAfterBirth?.toString() || ''}
                    onChange={(event) => setCreateForm((prev) => {
                      if (!prev.schedule) {
                        return prev;
                      }
                      const value = parseInt(event.target.value, 10);
                      return {
                        ...prev,
                        schedule: {
                          ...prev.schedule,
                          daysAfterBirth: Number.isNaN(value) ? undefined : value,
                        },
                      };
                    })}
                  />
                )}

                {createForm.schedule?.type === 'single' && (
                  <DatePickerInput
                    label="日付"
                    value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
                    onChange={(value) => setCreateForm((prev) => ({
                      ...prev,
                      schedule: prev.schedule ? {
                        ...prev.schedule,
                        startDate: value
                      } : null
                    }))}
                  />
                )}

                <Textarea
                  label="備考"
                  placeholder="ケアの詳細やメモを入力（任意）"
                  value={createForm.description}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                  minRows={3}
                  autosize
                />

                {createError && (
                  <Alert color="red" icon={<IconAlertCircle size={16} />}>
                    {createError}
                  </Alert>
                )}
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
                <ActionButton action="cancel" onClick={() => {
                  closeCreateModal();
                  resetCreateForm();
                }}>
                  キャンセル
                </ActionButton>
                <ActionButton action="save" onClick={handleCreateSubmit} loading={addScheduleMutation.isPending}>
                  登録する
                </ActionButton>
              </Group>
            ),
          },
        ]}
      />

      {/* カードを追加モーダル */}
      <UnifiedModal
        opened={addCardModalOpened}
        onClose={closeAddCardModal}
        title="カードを追加"
        size="sm"
      >
        <Text size="sm" c="dimmed">
          統計カードとして表示するケア名を選択してください
        </Text>
        <Select
          placeholder="ケア名を選択"
          data={(availableCareNames || []).map((name) => ({ value: name, label: name }))}
          value={null}
          onChange={(value) => {
            if (value && !selectedCareNames.includes(value)) {
              setSelectedCareNames((prev) => [...prev, value]);
              closeAddCardModal();
            }
          }}
          searchable
        />

        <Divider />

        <Group justify="flex-end" mt="md">
          <ActionButton action="cancel" onClick={closeAddCardModal}>
            キャンセル
          </ActionButton>
        </Group>
      </UnifiedModal>

      <UnifiedModal 
        opened={completeModalOpened} 
        onClose={() => {
          closeCompleteModal();
          setTargetSchedule(null);
        }} 
        title={targetSchedule ? `${targetSchedule.cat?.name ?? '未設定'} - ${targetSchedule.name || targetSchedule.title} を完了` : 'ケア完了処理'} 
        size="lg"
        sections={targetSchedule ? [
          {
            label: 'ケア予定詳細',
            content: (
              <Card withBorder shadow="xs" radius="md">
                <Stack gap={4}>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      予定日: {formatDate(targetSchedule.scheduleDate)}
                    </Text>
                  </Group>
                  <Stack gap={2}>
                    <Text fw={600}>{targetSchedule.name || targetSchedule.title}</Text>
                    <Text size="sm">{targetSchedule.description ?? 'メモは登録されていません'}</Text>
                  </Stack>
                </Stack>
              </Card>
            ),
          },
          {
            label: '完了情報',
            content: (
              <>
                <DatePickerInput
                  label="完了日"
                  placeholder="完了日を選択"
                  value={completeForm.completedDate}
                  onChange={(value) =>
                    setCompleteForm((prev) => ({
                      ...prev,
                      completedDate: value ? new Date(value) : null,
                    }))
                  }
                  required
                />

                <DatePickerInput
                  label="次回予定日 (任意)"
                  placeholder="次回ケアを予定している場合は選択"
                  value={completeForm.nextScheduledDate}
                  onChange={(value) =>
                    setCompleteForm((prev) => ({
                      ...prev,
                      nextScheduledDate: value ? new Date(value) : null,
                    }))
                  }
                  minDate={completeForm.completedDate ?? undefined}
                />

                <Textarea
                  label="メモ"
                  placeholder="ケア内容の詳細、体調、次回の注意点など"
                  value={completeForm.notes}
                  onChange={(event) => setCompleteForm((prev) => ({ ...prev, notes: event.target.value }))}
                  autosize
                  minRows={3}
                />
              </>
            ),
          },
          {
            content: (
              <Group justify="flex-end">
                <ActionButton
                  action="cancel"
                  onClick={() => {
                    closeCompleteModal();
                    setTargetSchedule(null);
                  }}
                >
                  キャンセル
                </ActionButton>
                <ActionButton
                  action="confirm"
                  onClick={handleCompleteSubmit}
                  loading={completeScheduleMutation.isPending}
                >
                  完了として記録
                </ActionButton>
              </Group>
            ),
          },
        ] : [
          {
            content: (
              <Text size="sm" c="dimmed">
                対象のケア予定が見つかりませんでした。
              </Text>
            ),
          },
        ]}
      />

      {/* 編集モーダル */}
      <UnifiedModal
        opened={editModalOpened}
        onClose={() => {
          closeEditModal();
          setEditingSchedule(null);
          resetCreateForm();
        }}
        title="ケア予定を編集"
        size="lg"
      >
          <TextInput
            label="ケア名"
            placeholder="例: 年次健康診断"
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            required
          />

          <RadioGroup
            label="カテゴリ"
            value={createForm.category}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, category: value as 'Male' | 'Female' | 'Kitten' | 'Adult' }))}
          >
            <Group mt="xs">
              <Radio value="Male" label="Male" />
              <Radio value="Female" label="Female" />
              <Radio value="Kitten" label="Kitten" />
              <Radio value="Adult" label="Adult" />
            </Group>
          </RadioGroup>

          <div>
            <Group grow align="flex-end" gap="xs">
              <Select
                label="タグ"
                placeholder="タグを選択"
                data={allTags || []}
                value={selectedTag}
                onChange={(value) => setSelectedTag(value)}
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  if (selectedTag && !(createForm.tags || []).includes(selectedTag)) {
                    setCreateForm((prev) => ({
                      ...prev,
                      tags: [...(prev.tags || []), selectedTag],
                    }));
                    setSelectedTag(null);
                  }
                }}
                disabled={!selectedTag}
                w="auto"
              >
                追加
              </Button>
            </Group>
            {(createForm.tags || []).length > 0 && (
              <Group mt="xs" gap="xs">
                {(createForm.tags || []).map((tagId) => {
                  const tag = allTags.find((t) => t.value === tagId);
                  return (
                    <Badge
                      key={tagId}
                      variant="light"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              tags: (prev.tags || []).filter((id) => id !== tagId),
                            }))
                          }
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      }
                    >
                      {tag?.label || tagId}
                    </Badge>
                  );
                })}
              </Group>
            )}
          </div>

          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>対象猫</Text>
            <Text size="sm" c="dimmed">{filteredCats.length}頭</Text>
          </Group>

          <Accordion>
            <Accordion.Item value="select-cats">
              <Accordion.Control>更に選択する</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {filteredCats.length === 0 ? (
                    <Text size="sm" c="dimmed">絞り込まれた猫がありません</Text>
                  ) : (
                    filteredCats.map((cat) => (
                      <Checkbox
                        key={cat.id}
                        label={`${cat.name} (${cat.gender})`}
                        checked={createForm.selectedCatIds.includes(cat.id)}
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          setCreateForm((prev) => ({
                            ...prev,
                            selectedCatIds: checked
                              ? [...prev.selectedCatIds, cat.id]
                              : prev.selectedCatIds.filter((id) => id !== cat.id),
                          }));
                        }}
                      />
                    ))
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Select
            label="スケジュールタイプ"
            placeholder="スケジュールタイプを選択"
            data={[
              { value: 'daily', label: '毎日' },
              { value: 'weekly', label: '毎週○曜日' },
              { value: 'monthly', label: '毎月○日' },
              { value: 'period', label: '○日〜○日（期間指定）' },
              { value: 'birthday', label: '生後○日目' },
              { value: 'single', label: '単日' },
            ]}
            value={createForm.schedule?.type || null}
            onChange={(value) => setCreateForm((prev) => ({
              ...prev,
              schedule: value ? { type: value as 'daily' | 'weekly' | 'monthly' | 'period' | 'birthday' | 'single' } : null
            }))}
          />

          {createForm.schedule?.type === 'weekly' && (
            <Select
              label="曜日"
              placeholder="曜日を選択"
              data={[
                { value: '0', label: '日曜日' },
                { value: '1', label: '月曜日' },
                { value: '2', label: '火曜日' },
                { value: '3', label: '水曜日' },
                { value: '4', label: '木曜日' },
                { value: '5', label: '金曜日' },
                { value: '6', label: '土曜日' },
              ]}
              value={createForm.schedule.daysOfWeek?.[0]?.toString() || null}
              onChange={(value) => setCreateForm((prev) => {
                if (!prev.schedule) {
                  return prev;
                }
                return {
                  ...prev,
                  schedule: {
                    ...prev.schedule,
                    daysOfWeek: value ? [parseInt(value, 10)] : [],
                  },
                };
              })}
            />
          )}

          {createForm.schedule?.type === 'monthly' && (
            <Select
              label="日付"
              placeholder="日付を選択"
              data={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: `${i + 1}日` }))}
              value={createForm.schedule.dayOfMonth?.toString() || null}
              onChange={(value) => setCreateForm((prev) => {
                if (!prev.schedule) {
                  return prev;
                }
                return {
                  ...prev,
                  schedule: {
                    ...prev.schedule,
                    dayOfMonth: value ? parseInt(value, 10) : undefined,
                  },
                };
              })}
            />
          )}

          {createForm.schedule?.type === 'period' && (
            <Group grow>
              <DatePickerInput
                label="開始日"
                value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
                onChange={(value) => setCreateForm((prev) => ({
                  ...prev,
                  schedule: prev.schedule ? {
                    ...prev.schedule,
                    startDate: value
                  } : null
                }))}
              />
              <DatePickerInput
                label="終了日"
                value={createForm.schedule.endDate ? new Date(createForm.schedule.endDate) : null}
                onChange={(value) => setCreateForm((prev) => ({
                  ...prev,
                  schedule: prev.schedule ? {
                    ...prev.schedule,
                    endDate: value
                  } : null
                }))}
              />
            </Group>
          )}

          {createForm.schedule?.type === 'birthday' && (
            <TextInput
              label="生後日数"
              placeholder="例: 21"
              type="number"
              value={createForm.schedule.daysAfterBirth?.toString() || ''}
              onChange={(event) => setCreateForm((prev) => {
                if (!prev.schedule) {
                  return prev;
                }
                const value = parseInt(event.target.value, 10);
                return {
                  ...prev,
                  schedule: {
                    ...prev.schedule,
                    daysAfterBirth: Number.isNaN(value) ? undefined : value,
                  },
                };
              })}
            />
          )}

          {createForm.schedule?.type === 'single' && (
            <DatePickerInput
              label="日付"
              value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
              onChange={(value) => setCreateForm((prev) => ({
                ...prev,
                schedule: prev.schedule ? {
                  ...prev.schedule,
                  startDate: value
                } : null
              }))}
            />
          )}

          <Textarea
            label="備考"
            placeholder="ケアの詳細やメモを入力（任意）"
            value={createForm.description}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
            minRows={3}
            autosize
          />

          {createError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {createError}
            </Alert>
          )}

          <Divider />

          <Group justify="flex-end">
            <ActionButton
              action="cancel"
              onClick={() => {
                closeEditModal();
                setEditingSchedule(null);
                resetCreateForm();
              }}
            >
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleUpdateSubmit} loading={updateScheduleMutation.isPending}>
              更新
            </ActionButton>
          </Group>
      </UnifiedModal>

      {/* 削除確認モーダル */}
      <UnifiedModal
        opened={deleteModalOpened}
        onClose={() => {
          closeDeleteModal();
          setDeletingSchedule(null);
        }}
        title="ケア予定を削除"
        size="md"
      >
        {deletingSchedule && (
          <>
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              以下のケア予定を削除します。この操作は取り消せません。
            </Alert>

            <Box>
              <Text size="sm" c="dimmed">
                ケア名
              </Text>
              <Text fw={600}>{deletingSchedule.name}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed">
                対象猫
              </Text>
              <Text>{deletingSchedule.cats.length}頭</Text>
            </Box>

            <Divider />

            <Group justify="flex-end">
              <ActionButton
                action="cancel"
                onClick={() => {
                  closeDeleteModal();
                  setDeletingSchedule(null);
                }}
              >
                キャンセル
              </ActionButton>
              <ActionButton
                action="delete"
                onClick={handleConfirmDelete}
                loading={deleteScheduleMutation.isPending}
              >
                削除
              </ActionButton>
            </Group>
          </>
        )}
      </UnifiedModal>

      {/* コンテキストメニュー操作モーダル */}
      <OperationModalManager
        operationType={currentOperation}
        entity={currentEntity}
        entityType="ケアスケジュール"
        onClose={closeOperation}
        onConfirm={handleOperationConfirm}
      />
    </Container>
  );
}
```
