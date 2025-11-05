import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsInt,
  MaxLength,
} from "class-validator";

/**
 * 血統書作成DTO（Access設計準拠）
 * 基本情報17項目 + 血統情報62項目
 */
export class CreatePedigreeDto {
  // ==================== 基本情報（17項目）====================
  @ApiProperty({ description: "血統書番号", example: "700545" })
  @IsString()
  @MaxLength(100)
  pedigreeId: string;

  @ApiPropertyOptional({ description: "タイトル", example: "Champion" })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ description: "猫の名前", example: "Jolly Tokuichi" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  catName?: string;

  @ApiPropertyOptional({ description: "キャッテリー名", example: "Jolly Tokuichi" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  catName2?: string;

  @ApiPropertyOptional({ description: "品種コード", example: 92 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  breedCode?: number;

  @ApiPropertyOptional({ description: "性別コード (1: オス, 2: メス)", example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  genderCode?: number;

  @ApiPropertyOptional({ description: "目の色", example: "Gold" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  eyeColor?: string;

  @ApiPropertyOptional({ description: "毛色コード", example: 190 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  coatColorCode?: number;

  @ApiPropertyOptional({ description: "生年月日", example: "2019-01-05" })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ description: "ブリーダー名", example: "Hayato Inami" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  breederName?: string;

  @ApiPropertyOptional({ description: "オーナー名", example: "Hayato Inami" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ownerName?: string;

  @ApiPropertyOptional({ description: "登録年月日", example: "2022-02-22" })
  @IsOptional()
  @IsString()
  registrationDate?: string;

  @ApiPropertyOptional({ description: "兄弟の人数", example: 2 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  brotherCount?: number;

  @ApiPropertyOptional({ description: "姉妹の人数", example: 2 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sisterCount?: number;

  @ApiPropertyOptional({ description: "備考" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: "備考２" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes2?: string;

  @ApiPropertyOptional({ description: "他団体No", example: "921901-700545" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  otherNo?: string;

  // ==================== 血統情報（62項目）====================
  
  // 第1世代: 父親（7項目）
  @ApiPropertyOptional({ description: "父親タイトル" })
  @IsOptional()
  @IsString()
  fatherTitle?: string;

  @ApiPropertyOptional({ description: "父親名" })
  @IsOptional()
  @IsString()
  fatherCatName?: string;

  @ApiPropertyOptional({ description: "父親キャッテリー名" })
  @IsOptional()
  @IsString()
  fatherCatName2?: string;

  @ApiPropertyOptional({ description: "父親毛色" })
  @IsOptional()
  @IsString()
  fatherCoatColor?: string;

  @ApiPropertyOptional({ description: "父親目の色" })
  @IsOptional()
  @IsString()
  fatherEyeColor?: string;

  @ApiPropertyOptional({ description: "父親JCU番号" })
  @IsOptional()
  @IsString()
  fatherJCU?: string;

  @ApiPropertyOptional({ description: "父親他団体コード" })
  @IsOptional()
  @IsString()
  fatherOtherCode?: string;

  // 第1世代: 母親（7項目）
  @ApiPropertyOptional({ description: "母親タイトル" })
  @IsOptional()
  @IsString()
  motherTitle?: string;

  @ApiPropertyOptional({ description: "母親名" })
  @IsOptional()
  @IsString()
  motherCatName?: string;

  @ApiPropertyOptional({ description: "母親キャッテリー名" })
  @IsOptional()
  @IsString()
  motherCatName2?: string;

  @ApiPropertyOptional({ description: "母親毛色" })
  @IsOptional()
  @IsString()
  motherCoatColor?: string;

  @ApiPropertyOptional({ description: "母親目の色" })
  @IsOptional()
  @IsString()
  motherEyeColor?: string;

  @ApiPropertyOptional({ description: "母親JCU番号" })
  @IsOptional()
  @IsString()
  motherJCU?: string;

  @ApiPropertyOptional({ description: "母親他団体コード" })
  @IsOptional()
  @IsString()
  motherOtherCode?: string;

  // 第2世代: 父方祖父（4項目）
  @ApiPropertyOptional({ description: "父方祖父タイトル" })
  @IsOptional()
  @IsString()
  ffTitle?: string;

  @ApiPropertyOptional({ description: "父方祖父名" })
  @IsOptional()
  @IsString()
  ffCatName?: string;

  @ApiPropertyOptional({ description: "父方祖父毛色" })
  @IsOptional()
  @IsString()
  ffCatColor?: string;

  @ApiPropertyOptional({ description: "父方祖父JCU" })
  @IsOptional()
  @IsString()
  ffjcu?: string;

  // 第2世代: 父方祖母（4項目）
  @ApiPropertyOptional({ description: "父方祖母タイトル" })
  @IsOptional()
  @IsString()
  fmTitle?: string;

  @ApiPropertyOptional({ description: "父方祖母名" })
  @IsOptional()
  @IsString()
  fmCatName?: string;

  @ApiPropertyOptional({ description: "父方祖母毛色" })
  @IsOptional()
  @IsString()
  fmCatColor?: string;

  @ApiPropertyOptional({ description: "父方祖母JCU" })
  @IsOptional()
  @IsString()
  fmjcu?: string;

  // 第2世代: 母方祖父（4項目）
  @ApiPropertyOptional({ description: "母方祖父タイトル" })
  @IsOptional()
  @IsString()
  mfTitle?: string;

  @ApiPropertyOptional({ description: "母方祖父名" })
  @IsOptional()
  @IsString()
  mfCatName?: string;

  @ApiPropertyOptional({ description: "母方祖父毛色" })
  @IsOptional()
  @IsString()
  mfCatColor?: string;

  @ApiPropertyOptional({ description: "母方祖父JCU" })
  @IsOptional()
  @IsString()
  mfjcu?: string;

  // 第2世代: 母方祖母（4項目）
  @ApiPropertyOptional({ description: "母方祖母タイトル" })
  @IsOptional()
  @IsString()
  mmTitle?: string;

  @ApiPropertyOptional({ description: "母方祖母名" })
  @IsOptional()
  @IsString()
  mmCatName?: string;

  @ApiPropertyOptional({ description: "母方祖母毛色" })
  @IsOptional()
  @IsString()
  mmCatColor?: string;

  @ApiPropertyOptional({ description: "母方祖母JCU" })
  @IsOptional()
  @IsString()
  mmjcu?: string;

  // 第3世代: 父父父（4項目）
  @ApiPropertyOptional({ description: "父父父タイトル" })
  @IsOptional()
  @IsString()
  fffTitle?: string;

  @ApiPropertyOptional({ description: "父父父名" })
  @IsOptional()
  @IsString()
  fffCatName?: string;

  @ApiPropertyOptional({ description: "父父父毛色" })
  @IsOptional()
  @IsString()
  fffCatColor?: string;

  @ApiPropertyOptional({ description: "父父父JCU" })
  @IsOptional()
  @IsString()
  fffjcu?: string;

  // 第3世代: 父父母（4項目）
  @ApiPropertyOptional({ description: "父父母タイトル" })
  @IsOptional()
  @IsString()
  ffmTitle?: string;

  @ApiPropertyOptional({ description: "父父母名" })
  @IsOptional()
  @IsString()
  ffmCatName?: string;

  @ApiPropertyOptional({ description: "父父母毛色" })
  @IsOptional()
  @IsString()
  ffmCatColor?: string;

  @ApiPropertyOptional({ description: "父父母JCU" })
  @IsOptional()
  @IsString()
  ffmjcu?: string;

  // 第3世代: 父母父（4項目）
  @ApiPropertyOptional({ description: "父母父タイトル" })
  @IsOptional()
  @IsString()
  fmfTitle?: string;

  @ApiPropertyOptional({ description: "父母父名" })
  @IsOptional()
  @IsString()
  fmfCatName?: string;

  @ApiPropertyOptional({ description: "父母父毛色" })
  @IsOptional()
  @IsString()
  fmfCatColor?: string;

  @ApiPropertyOptional({ description: "父母父JCU" })
  @IsOptional()
  @IsString()
  fmfjcu?: string;

  // 第3世代: 父母母（4項目）
  @ApiPropertyOptional({ description: "父母母タイトル" })
  @IsOptional()
  @IsString()
  fmmTitle?: string;

  @ApiPropertyOptional({ description: "父母母名" })
  @IsOptional()
  @IsString()
  fmmCatName?: string;

  @ApiPropertyOptional({ description: "父母母毛色" })
  @IsOptional()
  @IsString()
  fmmCatColor?: string;

  @ApiPropertyOptional({ description: "父母母JCU" })
  @IsOptional()
  @IsString()
  fmmjcu?: string;

  // 第3世代: 母父父（4項目）
  @ApiPropertyOptional({ description: "母父父タイトル" })
  @IsOptional()
  @IsString()
  mffTitle?: string;

  @ApiPropertyOptional({ description: "母父父名" })
  @IsOptional()
  @IsString()
  mffCatName?: string;

  @ApiPropertyOptional({ description: "母父父毛色" })
  @IsOptional()
  @IsString()
  mffCatColor?: string;

  @ApiPropertyOptional({ description: "母父父JCU" })
  @IsOptional()
  @IsString()
  mffjcu?: string;

  // 第3世代: 母父母（4項目）
  @ApiPropertyOptional({ description: "母父母タイトル" })
  @IsOptional()
  @IsString()
  mfmTitle?: string;

  @ApiPropertyOptional({ description: "母父母名" })
  @IsOptional()
  @IsString()
  mfmCatName?: string;

  @ApiPropertyOptional({ description: "母父母毛色" })
  @IsOptional()
  @IsString()
  mfmCatColor?: string;

  @ApiPropertyOptional({ description: "母父母JCU" })
  @IsOptional()
  @IsString()
  mfmjcu?: string;

  // 第3世代: 母母父（4項目）
  @ApiPropertyOptional({ description: "母母父タイトル" })
  @IsOptional()
  @IsString()
  mmfTitle?: string;

  @ApiPropertyOptional({ description: "母母父名" })
  @IsOptional()
  @IsString()
  mmfCatName?: string;

  @ApiPropertyOptional({ description: "母母父毛色" })
  @IsOptional()
  @IsString()
  mmfCatColor?: string;

  @ApiPropertyOptional({ description: "母母父JCU" })
  @IsOptional()
  @IsString()
  mmfjcu?: string;

  // 第3世代: 母母母（4項目）
  @ApiPropertyOptional({ description: "母母母タイトル" })
  @IsOptional()
  @IsString()
  mmmTitle?: string;

  @ApiPropertyOptional({ description: "母母母名" })
  @IsOptional()
  @IsString()
  mmmCatName?: string;

  @ApiPropertyOptional({ description: "母母母毛色" })
  @IsOptional()
  @IsString()
  mmmCatColor?: string;

  @ApiPropertyOptional({ description: "母母母JCU" })
  @IsOptional()
  @IsString()
  mmmjcu?: string;

  // その他
  @ApiPropertyOptional({ description: "旧コード" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  oldCode?: string;
}
