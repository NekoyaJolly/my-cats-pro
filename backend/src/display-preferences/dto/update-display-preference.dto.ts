import { ApiPropertyOptional } from "@nestjs/swagger";
import { DisplayNameMode } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";

export class LabelOverrideDto {
  @ApiPropertyOptional({ description: "対象コード", example: 26 })
  @IsInt()
  @Min(0)
  code!: number;

  @ApiPropertyOptional({ description: "表示名の上書き", example: "メインクーン" })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  label!: string;
}

export class UpdateDisplayPreferenceDto {
  @ApiPropertyOptional({ enum: DisplayNameMode, description: "品種マスタの表示モード" })
  @IsOptional()
  @IsEnum(DisplayNameMode)
  breedNameMode?: DisplayNameMode;

  @ApiPropertyOptional({ enum: DisplayNameMode, description: "毛色マスタの表示モード" })
  @IsOptional()
  @IsEnum(DisplayNameMode)
  coatColorNameMode?: DisplayNameMode;

  @ApiPropertyOptional({
    description: "品種コードごとの表示名上書き",
    type: () => [LabelOverrideDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelOverrideDto)
  breedLabelOverrides?: LabelOverrideDto[];

  @ApiPropertyOptional({
    description: "毛色コードごとの表示名上書き",
    type: () => [LabelOverrideDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabelOverrideDto)
  coatColorLabelOverrides?: LabelOverrideDto[];
}
