import { PartialType, OmitType } from "@nestjs/swagger";

import { CreateMedicalRecordDto } from "./create-medical-record.dto";

/**
 * 医療記録更新DTO
 * catId は更新不可、その他のフィールドはすべてオプショナル
 */
export class UpdateMedicalRecordDto extends PartialType(
  OmitType(CreateMedicalRecordDto, ["catId"] as const),
) {}

