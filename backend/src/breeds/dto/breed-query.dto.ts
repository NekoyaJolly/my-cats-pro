import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, IsIn, Min, Max } from "class-validator";

export class BreedQueryDto {
  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 50, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ description: "検索キーワード" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "ソート項目", default: "name" })
  @IsOptional()
  @IsString()
  @IsIn(["name", "nameEn", "createdAt", "updatedAt", "code"])
  sortBy?: string = "name";

  @ApiPropertyOptional({ description: "ソート順", default: "asc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";
}
