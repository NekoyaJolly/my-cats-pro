import { OmitType, PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength, ValidateIf } from "class-validator";

import { CreateCatDto } from "./create-cat.dto";

// 親情報は null（解除）を許容するため、基底の string 型定義から除外して再定義する
export class UpdateCatDto extends PartialType(
  OmitType(CreateCatDto, ["fatherId", "motherId", "fatherName", "motherName"] as const),
) {
  @IsOptional()
  @IsIn(["MALE", "FEMALE", "NEUTER", "SPAY"])
  gender?: "MALE" | "FEMALE" | "NEUTER" | "SPAY";

  // 親情報は null を「解除」として受け付けるため、PartialType の定義を上書きする
  @ApiPropertyOptional({ description: "父猫のID（null で関連を解除）" })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  fatherId?: string | null;

  @ApiPropertyOptional({ description: "母猫のID（null で関連を解除）" })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  motherId?: string | null;

  @ApiPropertyOptional({ description: "父猫の名前（null でクリア）" })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @MaxLength(200)
  fatherName?: string | null;

  @ApiPropertyOptional({ description: "母猫の名前（null でクリア）" })
  @IsOptional()
  @ValidateIf((_object, value) => value !== null)
  @IsString()
  @MaxLength(200)
  motherName?: string | null;
}
