import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DispositionType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, IsUUID, IsDateString, IsObject, ValidateNested } from "class-validator";

class SaleInfoDto {
  @ApiProperty({ description: "譲渡先（個人名/業者名）" })
  @IsString()
  buyer: string;

  @ApiProperty({ description: "譲渡金額" })
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
