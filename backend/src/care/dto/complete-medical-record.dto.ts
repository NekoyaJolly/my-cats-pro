import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * 医療記録完了DTO
 * 完了処理時の追加情報を受け取る
 */
export class CompleteMedicalRecordDto {
  @ApiPropertyOptional({
    description: "完了日（省略時は現在日時）",
    example: "2025-08-15",
  })
  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @ApiPropertyOptional({
    description: "完了時の備考",
    example: "症状が改善し、治療を終了",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  completionNotes?: string;
}

