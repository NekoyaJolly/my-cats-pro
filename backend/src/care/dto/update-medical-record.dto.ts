import { PartialType } from "@nestjs/swagger";

import { CreateMedicalRecordDto } from "./create-medical-record.dto";

/**
 * 医療記録更新DTO
 *
 * 作成DTOの全フィールドを任意指定として受け付ける部分更新用DTO。
 */
export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}
