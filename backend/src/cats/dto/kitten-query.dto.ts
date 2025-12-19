import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  IsUUID,
  Min,
  Max,
} from "class-validator";

/**
 * 子猫一覧取得用クエリDTO
 * 生後6ヶ月未満の猫をフィルタリングし、母猫ごとにグループ化
 */
export class KittenQueryDto {
  @ApiPropertyOptional({ description: "母猫ID（指定時はその母猫の子猫のみ取得）" })
  @IsOptional()
  @IsUUID("4")
  motherId?: string;

  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: "検索キーワード（子猫名）" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "ソート項目", default: "birthDate" })
  @IsOptional()
  @IsString()
  @IsIn(["birthDate", "name", "createdAt"])
  sortBy?: string = "birthDate";

  @ApiPropertyOptional({ description: "ソート順", default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}

