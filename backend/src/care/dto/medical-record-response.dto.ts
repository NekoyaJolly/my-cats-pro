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
