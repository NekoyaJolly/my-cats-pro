This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: backend/prisma/schema.prisma, backend/src/pedigree/**, frontend/src/app/pedigrees/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
backend/
  prisma/
    schema.prisma
  src/
    pedigree/
      dto/
        create-pedigree.dto.ts
        index.ts
        pedigree-query.dto.ts
        update-pedigree.dto.ts
      pdf/
        pedigree-pdf.service.ts
        positions.json
        print-settings.service.ts
        血統書見本.png
      types/
        pedigree.types.ts
      pedigree.controller.spec.ts
      pedigree.controller.ts
      pedigree.module.ts
      pedigree.service.spec.ts
      pedigree.service.ts
frontend/
  src/
    app/
      pedigrees/
        [id]/
          family-tree/
            client.tsx
            page.tsx
          client.tsx
          layout.tsx
          page.tsx
        new/
          page.tsx
        page.tsx
```

# Files

## File: backend/src/pedigree/dto/create-pedigree.dto.ts
```typescript
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
```

## File: backend/src/pedigree/dto/index.ts
```typescript
export * from "./create-pedigree.dto";
export * from "./update-pedigree.dto";
export * from "./pedigree-query.dto";
```

## File: backend/src/pedigree/dto/pedigree-query.dto.ts
```typescript
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString, IsInt, IsIn } from "class-validator";

export class PedigreeQueryDto {
  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "検索キーワード" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "品種ID" })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: "毛色ID" })
  @IsOptional()
  @IsString()
  coatColorId?: string;

  @ApiPropertyOptional({ description: "性別 (1: オス, 2: メス)" })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: "キャッテリー名" })
  @IsOptional()
  @IsString()
  catName2?: string;

  @ApiPropertyOptional({ description: "目の色" })
  @IsOptional()
  @IsString()
  eyeColor?: string;

  @ApiPropertyOptional({ description: "ソート項目", default: "createdAt" })
  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "catName", "birthDate", "pedigreeIssueDate"])
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ description: "ソート順", default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
```

## File: backend/src/pedigree/dto/update-pedigree.dto.ts
```typescript
import { PartialType } from "@nestjs/mapped-types";

import { CreatePedigreeDto } from "./create-pedigree.dto";

export class UpdatePedigreeDto extends PartialType(CreatePedigreeDto) {}
```

## File: backend/src/pedigree/pdf/pedigree-pdf.service.ts
```typescript
import * as fsModule from 'fs';
import * as path from 'path';

import { Injectable, NotFoundException } from '@nestjs/common';
import type { Pedigree } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- pdfmakeはCommonJSモジュールのためrequireが必要
import PdfPrinter = require('pdfmake');
import type { TDocumentDefinitions, TFontDictionary, Content } from 'pdfmake/interfaces';

import { PrismaService } from '../../prisma/prisma.service';

import { Position, PositionsConfig, PrintSettingsService } from './print-settings.service';

/**
 * 血統書PDF生成サービス（フォーム印字モード）
 *
 * 既存のWCA血統書用紙に「値のみ」を印刷する
 * - 用紙サイズ: 339mm × 228mm（横長）
 * - 背景・罫線・ラベルは印刷しない
 * - 値を絶対座標で配置
 * - 座標はDBに保存された印刷設定を毎回読み込み（再起動不要で調整可能）
 */
@Injectable()
export class PedigreePdfService {
  private printer: PdfPrinter;

  // mm to points 変換係数（1mm = 2.83465pt）
  private readonly MM_TO_PT = 2.83465;

  // ページ設定
  private readonly PAGE_WIDTH = 339; // mm
  private readonly PAGE_HEIGHT = 228; // mm

  constructor(
    private readonly prisma: PrismaService,
    private readonly printSettingsService: PrintSettingsService,
  ) {
    const fonts: TFontDictionary = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };
    this.printer = new PdfPrinter(fonts);
  }

  private resolvePdfAssetPath(fileName: string): string {
    const candidates = [
      path.join(__dirname, fileName),
      // nest start --watch 等で実行時の __dirname とアセット配置がズレる場合のフォールバック
      path.join(process.cwd(), 'src', 'pedigree', 'pdf', fileName),
      path.join(process.cwd(), 'backend', 'src', 'pedigree', 'pdf', fileName),
    ];

    for (const candidate of candidates) {
      if (fsModule.existsSync(candidate)) {
        return candidate;
      }
    }

    return candidates[0];
  }

  /**
   * DBから座標設定を読み込む（PrintSettingsService経由、毎回読み込み・キャッシュなし）
   */
  private async loadPositions(): Promise<PositionsConfig> {
    return this.printSettingsService.getSettings();
  }

  /**
   * 血統書IDからPDFを生成（フォーム印字モード）
   * @param debugMode trueの場合、背景に血統書テンプレート画像を半透明で表示（座標調整用）
   */
  async generatePdf(pedigreeId: string, debugMode = false): Promise<Buffer> {
    const pedigree = await this.prisma.pedigree.findFirst({
      where: { pedigreeId },
    });

    if (!pedigree) {
      throw new NotFoundException(`血統書ID「${pedigreeId}」のデータが見つかりません`);
    }

    const masterData = await this.fetchMasterData(pedigree);
    const docDefinition = await this.buildFormOverlayDocument(pedigree, masterData, debugMode);

    return this.createPdfBuffer(docDefinition);
  }

  /**
   * PDFをBase64形式で取得
   */
  async generateBase64(pedigreeId: string): Promise<string> {
    const pdfBuffer = await this.generatePdf(pedigreeId);
    return pdfBuffer.toString('base64');
  }

  /**
   * マスタデータを取得
   */
  private async fetchMasterData(
    pedigree: Pedigree,
  ): Promise<{ breedName: string; genderName: string; coatColorName: string }> {
    let breedName = '';
    let genderName = '';
    let coatColorName = '';

    if (pedigree.breedCode) {
      const breed = await this.prisma.breed.findFirst({
        where: { code: pedigree.breedCode },
      });
      breedName = breed?.name || String(pedigree.breedCode);
    }

    if (pedigree.genderCode) {
      const gender = await this.prisma.gender.findFirst({
        where: { code: pedigree.genderCode },
      });
      genderName = gender?.name || String(pedigree.genderCode);
    }

    if (pedigree.coatColorCode) {
      const coatColor = await this.prisma.coatColor.findFirst({
        where: { code: pedigree.coatColorCode },
      });
      coatColorName = coatColor?.name || String(pedigree.coatColorCode);
    }

    return { breedName, genderName, coatColorName };
  }

  /**
   * フォーム印字用ドキュメントを構築（値のみ配置）
   * @param debugMode trueの場合、背景画像を表示
   */
  private async buildFormOverlayDocument(
    pedigree: Pedigree,
    masterData: { breedName: string; genderName: string; coatColorName: string },
    debugMode = false,
  ): Promise<TDocumentDefinitions> {
    const config = await this.loadPositions();
    const content: Content[] = [];
    const fs = config.fontSizes;

    // デバッグモード: 背景画像を半透明で表示
    if (debugMode) {
      const templatePath = this.resolvePdfAssetPath('血統書見本.png');
      if (fsModule.existsSync(templatePath)) {
        const imageData = fsModule.readFileSync(templatePath);
        const base64Image = imageData.toString('base64');
        content.push({
          image: `data:image/png;base64,${base64Image}`,
          width: this.PAGE_WIDTH * this.MM_TO_PT,
          height: this.PAGE_HEIGHT * this.MM_TO_PT,
          absolutePosition: { x: 0, y: 0 },
          opacity: 0.3,
        } as Content);
      }
    }

    // === ヘッダー情報（左側）===
    content.push(this.absoluteText(masterData.breedName, config.breed, config.offsetX, config.offsetY, fs.headerInfo));
    content.push(this.absoluteText(masterData.genderName, config.sex, config.offsetX, config.offsetY, fs.headerInfo));
    content.push(this.absoluteText(this.formatDate(pedigree.birthDate), config.dateOfBirth, config.offsetX, config.offsetY, fs.headerInfo));
    content.push(this.absoluteText(pedigree.eyeColor || '', config.eyeColor, config.offsetX, config.offsetY, fs.headerInfo));
    content.push(this.absoluteText(masterData.coatColorName, config.color, config.offsetX, config.offsetY, fs.headerInfo));

    // === 中央エリア ===
    const catName = this.formatCatName(pedigree.title, pedigree.catName, pedigree.catName2);
    content.push(this.absoluteText(catName, config.catName, config.offsetX, config.offsetY, fs.catName, 'center'));
    content.push(this.absoluteText(pedigree.pedigreeId, config.wcaNo, config.offsetX, config.offsetY, fs.wcaNo, 'center'));

    // === ヘッダー情報（右側）===
    content.push(this.absoluteText(pedigree.ownerName || '', config.owner, config.offsetX, config.offsetY, fs.headerInfo, 'right'));
    content.push(this.absoluteText(pedigree.breederName || '', config.breeder, config.offsetX, config.offsetY, fs.headerInfo, 'right'));
    content.push(this.absoluteText(this.formatDate(pedigree.registrationDate), config.dateOfRegistration, config.offsetX, config.offsetY, fs.headerInfo));
    content.push(this.absoluteText(String(pedigree.brotherCount || ''), config.littersM, config.offsetX, config.offsetY, fs.headerInfo));
    content.push(this.absoluteText(String(pedigree.sisterCount || ''), config.littersF, config.offsetX, config.offsetY, fs.headerInfo));

    // === PARENTS: SIRE（父）===
    content.push(this.absoluteText(
      this.formatCatName(pedigree.fatherTitle, pedigree.fatherCatName, pedigree.fatherCatName2),
      config.sire.name, config.offsetX, config.offsetY, fs.parentName, 'left', true
    ));
    content.push(this.absoluteText(pedigree.fatherCoatColor || '', config.sire.color, config.offsetX, config.offsetY, fs.parentDetail));
    if (config.sire.eyeColor) {
      content.push(this.absoluteText(pedigree.fatherEyeColor || '', config.sire.eyeColor, config.offsetX, config.offsetY, fs.parentDetail));
    }
    content.push(this.absoluteText(pedigree.fatherJCU || '', config.sire.jcu, config.offsetX, config.offsetY, fs.parentDetail));

    // === PARENTS: DAM（母）===
    content.push(this.absoluteText(
      this.formatCatName(pedigree.motherTitle, pedigree.motherCatName, pedigree.motherCatName2),
      config.dam.name, config.offsetX, config.offsetY, fs.parentName, 'left', true
    ));
    content.push(this.absoluteText(pedigree.motherCoatColor || '', config.dam.color, config.offsetX, config.offsetY, fs.parentDetail));
    if (config.dam.eyeColor) {
      content.push(this.absoluteText(pedigree.motherEyeColor || '', config.dam.eyeColor, config.offsetX, config.offsetY, fs.parentDetail));
    }
    content.push(this.absoluteText(pedigree.motherJCU || '', config.dam.jcu, config.offsetX, config.offsetY, fs.parentDetail));

    // === GRAND PARENTS ===
    const gp = config.grandParents;
    // 3: ff（父の父）
    content.push(this.absoluteText(this.formatCatName(pedigree.ffTitle, pedigree.ffCatName, null), gp.ff.name, config.offsetX, config.offsetY, fs.grandParentName));
    content.push(this.absoluteText(pedigree.ffCatColor || '', gp.ff.color, config.offsetX, config.offsetY, fs.grandParentDetail));
    content.push(this.absoluteText(pedigree.ffjcu || '', gp.ff.jcu, config.offsetX, config.offsetY, fs.grandParentDetail));
    // 4: fm（父の母）
    content.push(this.absoluteText(this.formatCatName(pedigree.fmTitle, pedigree.fmCatName, null), gp.fm.name, config.offsetX, config.offsetY, fs.grandParentName));
    content.push(this.absoluteText(pedigree.fmCatColor || '', gp.fm.color, config.offsetX, config.offsetY, fs.grandParentDetail));
    content.push(this.absoluteText(pedigree.fmjcu || '', gp.fm.jcu, config.offsetX, config.offsetY, fs.grandParentDetail));
    // 5: mf（母の父）
    content.push(this.absoluteText(this.formatCatName(pedigree.mfTitle, pedigree.mfCatName, null), gp.mf.name, config.offsetX, config.offsetY, fs.grandParentName));
    content.push(this.absoluteText(pedigree.mfCatColor || '', gp.mf.color, config.offsetX, config.offsetY, fs.grandParentDetail));
    content.push(this.absoluteText(pedigree.mfjcu || '', gp.mf.jcu, config.offsetX, config.offsetY, fs.grandParentDetail));
    // 6: mm（母の母）
    content.push(this.absoluteText(this.formatCatName(pedigree.mmTitle, pedigree.mmCatName, null), gp.mm.name, config.offsetX, config.offsetY, fs.grandParentName));
    content.push(this.absoluteText(pedigree.mmCatColor || '', gp.mm.color, config.offsetX, config.offsetY, fs.grandParentDetail));
    content.push(this.absoluteText(pedigree.mmjcu || '', gp.mm.jcu, config.offsetX, config.offsetY, fs.grandParentDetail));

    // === GREAT GRAND PARENTS ===
    const ggp = config.greatGrandParents;
    // 7: fff
    content.push(this.absoluteText(this.formatCatName(pedigree.fffTitle, pedigree.fffCatName, null), ggp.fff.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.fffjcu || '', ggp.fff.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 8: ffm
    content.push(this.absoluteText(this.formatCatName(pedigree.ffmTitle, pedigree.ffmCatName, null), ggp.ffm.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.ffmjcu || '', ggp.ffm.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 9: fmf
    content.push(this.absoluteText(this.formatCatName(pedigree.fmfTitle, pedigree.fmfCatName, null), ggp.fmf.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.fmfjcu || '', ggp.fmf.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 10: fmm
    content.push(this.absoluteText(this.formatCatName(pedigree.fmmTitle, pedigree.fmmCatName, null), ggp.fmm.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.fmmjcu || '', ggp.fmm.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 11: mff
    content.push(this.absoluteText(this.formatCatName(pedigree.mffTitle, pedigree.mffCatName, null), ggp.mff.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.mffjcu || '', ggp.mff.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 12: mfm
    content.push(this.absoluteText(this.formatCatName(pedigree.mfmTitle, pedigree.mfmCatName, null), ggp.mfm.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.mfmjcu || '', ggp.mfm.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 13: mmf
    content.push(this.absoluteText(this.formatCatName(pedigree.mmfTitle, pedigree.mmfCatName, null), ggp.mmf.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.mmfjcu || '', ggp.mmf.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));
    // 14: mmm
    content.push(this.absoluteText(this.formatCatName(pedigree.mmmTitle, pedigree.mmmCatName, null), ggp.mmm.name, config.offsetX, config.offsetY, fs.greatGrandParent));
    content.push(this.absoluteText(pedigree.mmmjcu || '', ggp.mmm.jcu, config.offsetX, config.offsetY, fs.greatGrandParent));

    // === フッター ===
    if (pedigree.otherNo) {
      content.push(this.absoluteText(pedigree.otherNo, config.otherOrganizationsNo, config.offsetX, config.offsetY, fs.footer));
    }

    return {
      pageSize: {
        width: this.PAGE_WIDTH * this.MM_TO_PT,
        height: this.PAGE_HEIGHT * this.MM_TO_PT,
      },
      pageOrientation: 'landscape',
      pageMargins: [0, 0, 0, 0], // マージンなし（絶対座標で配置）
      defaultStyle: {
        font: 'Helvetica',
      },
      content,
    };
  }

  /**
   * 絶対座標でテキストを配置
   * alignプロパティで配置方法を指定可能（left/center/right）
   */
  private absoluteText(
    text: string,
    position: Position & { align?: 'left' | 'center' | 'right' },
    offsetX: number,
    offsetY: number,
    fontSize: number,
    _alignment: 'left' | 'center' | 'right' = 'left', // 互換性のため残す（position.alignを優先）
    bold = false,
  ): Content {
    const align = position.align || 'left';
    let x = (position.x + offsetX) * this.MM_TO_PT;
    const y = (position.y + offsetY) * this.MM_TO_PT;

    // 文字幅を推定してalignに応じて調整
    if (align !== 'left' && text) {
      const textWidth = this.estimateTextWidth(text, fontSize);
      if (align === 'center') {
        x -= textWidth / 2;
      } else if (align === 'right') {
        x -= textWidth;
      }
    }

    return {
      text: text || '',
      fontSize,
      bold,
      absolutePosition: { x, y },
    };
  }

  /**
   * 文字幅を推定（ポイント単位）
   * 英数字と日本語で係数を変えて計算
   */
  private estimateTextWidth(text: string, fontSize: number): number {
    let width = 0;
    for (const char of text) {
      // ASCII文字（英数字・記号）は狭い、それ以外（日本語等）は広い
      if (char.charCodeAt(0) < 128) {
        width += fontSize * 0.55; // 英数字の平均幅
      } else {
        width += fontSize * 1.0; // 日本語等の全角文字
      }
    }
    return width;
  }

  /**
   * Cat's Nameをフォーマット
   */
  private formatCatName(
    title: string | null,
    name: string | null,
    name2: string | null,
  ): string {
    const parts = [title, name, name2].filter(Boolean);
    return parts.join(' ') || '';
  }

  /**
   * 日付をフォーマット（YYYY.MM.DD形式）
   */
  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  /**
   * PDFバッファを生成
   */
  private createPdfBuffer(docDefinition: TDocumentDefinitions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        pdfDoc.on('error', (err: Error) => {
          reject(err);
        });

        pdfDoc.end();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
}
```

## File: backend/src/pedigree/pdf/positions.json
```json
{
  "offsetX": 0,
  "offsetY": 0,
  
  "breed": { "x": 50, "y": 50 },
  "sex": { "x": 50, "y": 60 },
  "dateOfBirth": { "x": 77, "y": 60 },
  "eyeColor": { "x": 50, "y": 69 },
  "color": { "x": 77, "y": 69 },
  
  "catName": { "x": 170, "y": 55, "align": "center" },
  "wcaNo": { "x": 170, "y": 69, "align": "center" },
  
  "owner": { "x": 320, "y": 50, "align": "right" },
  "breeder": { "x": 320, "y": 60, "align": "right" },
  "dateOfRegistration": { "x": 240, "y": 69 },
  "littersM": { "x": 277, "y": 69 },
  "littersF": { "x": 285, "y": 69 },
  
  "sire": {
    "name": { "x": 50, "y": 110 },
    "color": { "x": 50, "y": 127 },
    "eyeColor": { "x": 50, "y": 132 },
    "jcu": { "x": 50, "y": 137 }
  },
  "dam": {
    "name": { "x": 50, "y": 160 },
    "color": { "x": 50, "y": 177 },
    "eyeColor": { "x": 50, "y": 182 },
    "jcu": { "x": 50, "y": 188 }
  },
  
  "grandParents": {
    "ff": { "name": { "x": 140, "y": 101 }, "color": { "x": 140, "y": 106 }, "jcu": { "x": 140, "y": 111 } },
    "fm": { "name": { "x": 140, "y": 127 }, "color": { "x": 140, "y": 132 }, "jcu": { "x": 140, "y": 137 } },
    "mf": { "name": { "x": 140, "y": 152 }, "color": { "x": 140, "y": 157 }, "jcu": { "x": 140, "y": 162 } },
    "mm": { "name": { "x": 140, "y": 178 }, "color": { "x": 140, "y": 183 }, "jcu": { "x": 140, "y": 188 } }
  },
  
  "greatGrandParents": {
    "fff": { "name": { "x": 232, "y": 94 }, "jcu": { "x": 232, "y": 98 } },
    "ffm": { "name": { "x": 232, "y": 107 }, "jcu": { "x": 232, "y": 111 } },
    "fmf": { "name": { "x": 232, "y": 120 }, "jcu": { "x": 232, "y": 124 } },
    "fmm": { "name": { "x": 232, "y": 133 }, "jcu": { "x": 232, "y": 137 } },
    "mff": { "name": { "x": 232, "y": 146 }, "jcu": { "x": 232, "y": 150 } },
    "mfm": { "name": { "x": 232, "y": 158 }, "jcu": { "x": 232, "y": 162 } },
    "mmf": { "name": { "x": 232, "y": 171 }, "jcu": { "x": 232, "y": 175 } },
    "mmm": { "name": { "x": 232, "y": 184 }, "jcu": { "x": 232, "y": 188 } }
  },
  
  "otherOrganizationsNo": { "x": 85, "y": 210 },
  
  "fontSizes": {
    "catName": 13,
    "wcaNo": 12,
    "headerInfo": 11,
    "parentName": 12,
    "parentDetail": 11,
    "grandParentName": 11,
    "grandParentDetail": 11,
    "greatGrandParent": 10,
    "footer": 7
  }
}
```

## File: backend/src/pedigree/pdf/print-settings.service.ts
```typescript
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

// 座標設定の型定義
export interface Position {
  x: number;
  y: number;
  align?: "left" | "center" | "right";
}

export interface ParentPositions {
  name: Position;
  color: Position;
  eyeColor?: Position;
  jcu: Position;
}

export interface GrandParentPositions {
  name: Position;
  color: Position;
  jcu: Position;
}

export interface GreatGrandParentPositions {
  name: Position;
  jcu: Position;
}

export interface FontSizes {
  catName: number;
  wcaNo: number;
  headerInfo: number;
  parentName: number;
  parentDetail: number;
  grandParentName: number;
  grandParentDetail: number;
  greatGrandParent: number;
  footer: number;
}

export interface PositionsConfig {
  offsetX: number;
  offsetY: number;
  breed: Position;
  sex: Position;
  dateOfBirth: Position;
  eyeColor: Position;
  color: Position;
  catName: Position;
  wcaNo: Position;
  owner: Position;
  breeder: Position;
  dateOfRegistration: Position;
  littersM: Position;
  littersF: Position;
  sire: ParentPositions;
  dam: ParentPositions;
  grandParents: {
    ff: GrandParentPositions;
    fm: GrandParentPositions;
    mf: GrandParentPositions;
    mm: GrandParentPositions;
  };
  greatGrandParents: {
    fff: GreatGrandParentPositions;
    ffm: GreatGrandParentPositions;
    fmf: GreatGrandParentPositions;
    fmm: GreatGrandParentPositions;
    mff: GreatGrandParentPositions;
    mfm: GreatGrandParentPositions;
    mmf: GreatGrandParentPositions;
    mmm: GreatGrandParentPositions;
  };
  otherOrganizationsNo: Position;
  fontSizes: FontSizes;
}

@Injectable()
export class PrintSettingsService {
  private readonly logger = new Logger(PrintSettingsService.name);
  private readonly GLOBAL_KEY = "GLOBAL";

  private readonly defaultSettings: PositionsConfig = {
    offsetX: 0,
    offsetY: 0,
    breed: { x: 50, y: 50 },
    sex: { x: 50, y: 60 },
    dateOfBirth: { x: 77, y: 60 },
    eyeColor: { x: 50, y: 69 },
    color: { x: 77, y: 69 },
    catName: { x: 170, y: 55, align: "center" },
    wcaNo: { x: 170, y: 69, align: "center" },
    owner: { x: 320, y: 50, align: "right" },
    breeder: { x: 320, y: 60, align: "right" },
    dateOfRegistration: { x: 240, y: 69 },
    littersM: { x: 277, y: 69 },
    littersF: { x: 285, y: 69 },
    sire: {
      name: { x: 50, y: 110 },
      color: { x: 50, y: 127 },
      eyeColor: { x: 50, y: 132 },
      jcu: { x: 50, y: 137 },
    },
    dam: {
      name: { x: 50, y: 160 },
      color: { x: 50, y: 177 },
      eyeColor: { x: 50, y: 182 },
      jcu: { x: 50, y: 188 },
    },
    grandParents: {
      ff: { name: { x: 140, y: 101 }, color: { x: 140, y: 106 }, jcu: { x: 140, y: 111 } },
      fm: { name: { x: 140, y: 127 }, color: { x: 140, y: 132 }, jcu: { x: 140, y: 137 } },
      mf: { name: { x: 140, y: 152 }, color: { x: 140, y: 157 }, jcu: { x: 140, y: 162 } },
      mm: { name: { x: 140, y: 178 }, color: { x: 140, y: 183 }, jcu: { x: 140, y: 188 } },
    },
    greatGrandParents: {
      fff: { name: { x: 232, y: 94 }, jcu: { x: 232, y: 98 } },
      ffm: { name: { x: 232, y: 107 }, jcu: { x: 232, y: 111 } },
      fmf: { name: { x: 232, y: 120 }, jcu: { x: 232, y: 124 } },
      fmm: { name: { x: 232, y: 133 }, jcu: { x: 232, y: 137 } },
      mff: { name: { x: 232, y: 146 }, jcu: { x: 232, y: 150 } },
      mfm: { name: { x: 232, y: 158 }, jcu: { x: 232, y: 162 } },
      mmf: { name: { x: 232, y: 171 }, jcu: { x: 232, y: 175 } },
      mmm: { name: { x: 232, y: 184 }, jcu: { x: 232, y: 188 } },
    },
    otherOrganizationsNo: { x: 85, y: 210 },
    fontSizes: {
      catName: 13,
      wcaNo: 12,
      headerInfo: 11,
      parentName: 12,
      parentDetail: 11,
      grandParentName: 11,
      grandParentDetail: 11,
      greatGrandParent: 10,
      footer: 7,
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async getSettings(tenantId?: string): Promise<PositionsConfig> {
    try {
      const where = this.buildWhereClause(tenantId);
      const record = await this.prisma.pedigreePrintSetting.findUnique({ where });
      if (!record) {
        return this.defaultSettings;
      }
      return this.deserializeSettings(record.settings);
    } catch (error) {
      this.logger.error(
        "印刷設定の取得に失敗しました",
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new InternalServerErrorException("印刷設定の取得に失敗しました");
    }
  }

  async updateSettings(settings: PositionsConfig, tenantId?: string): Promise<PositionsConfig> {
    try {
      const where = this.buildWhereClause(tenantId);
      const settingsJson = this.serializeSettings(settings);
      await this.prisma.pedigreePrintSetting.upsert({
        where,
        create: {
          tenantId: tenantId ?? null,
          globalKey: tenantId ? null : this.GLOBAL_KEY,
          settings: settingsJson,
        },
        update: {
          settings: settingsJson,
          version: { increment: 1 },
        },
      });
      return settings;
    } catch (error) {
      this.logger.error(
        "印刷設定の保存に失敗しました",
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
      throw new InternalServerErrorException("印刷設定の保存に失敗しました");
    }
  }

  async resetToDefault(tenantId?: string): Promise<PositionsConfig> {
    return this.updateSettings(this.defaultSettings, tenantId);
  }

  /**
   * 印刷設定の構造を検証する
   * @param value 検証対象の値
   * @returns 有効な PositionsConfig であれば true
   */
  public isPositionsConfig(value: unknown): value is PositionsConfig {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return false;
    }
    const record = value as Record<string, unknown>;

    // 基本的な数値・オブジェクトフィールドのチェック
    if (typeof record.offsetX !== "number" || typeof record.offsetY !== "number") {
      return false;
    }
    if (typeof record.breed !== "object" || record.breed === null) {
      return false;
    }

    // PDF 生成時に必須となる主要なネスト構造の存在チェック
    const requiredObjectKeys = [
      "sex",
      "dateOfBirth",
      "catName",
      "sire",
      "dam",
      "grandParents",
      "greatGrandParents",
      "fontSizes",
    ] as const;

    for (const key of requiredObjectKeys) {
      const v = record[key as string];
      if (typeof v !== "object" || v === null) {
        return false;
      }
    }

    return true;
  }

  private buildWhereClause(tenantId?: string): Prisma.PedigreePrintSettingWhereUniqueInput {
    if (tenantId) {
      return { tenantId };
    }
    return { globalKey: this.GLOBAL_KEY };
  }

  private deserializeSettings(value: Prisma.JsonValue | null): PositionsConfig {
    if (!value || !this.isPositionsConfig(value)) {
      return this.defaultSettings;
    }
    // Prisma の JsonValue はプレーンオブジェクト互換のため、直接キャスト可能
    // TypeScript の型チェックを通過するため、unknown を経由してキャスト
    return value as unknown as PositionsConfig;
  }

  private serializeSettings(settings: PositionsConfig): Prisma.InputJsonValue {
    // Prisma の JsonValue/InputJsonValue はプレーンオブジェクト互換のため、そのまま保存する
    // TypeScript の型チェックを通過するため、unknown を経由してキャスト
    return settings as unknown as Prisma.InputJsonValue;
  }
}
```

## File: backend/src/pedigree/types/pedigree.types.ts
```typescript
import { Prisma } from "@prisma/client";

// Prisma の正規 where 型をそのまま利用し、柔軟なフィルタに対応
export type PedigreeWhereInput = Prisma.PedigreeWhereInput;

// Type for query building without any
export interface QueryFilterInput {
  [key: string]: string | undefined;
}

// Type for safe field mapping
export interface FieldMapping {
  [dtoField: string]: string; // Maps DTO field to database field
}

export const pedigreeWithRelationsInclude = Prisma.validator<Prisma.PedigreeInclude>()({
  breed: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  coatColor: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
  gender: {
    select: {
      id: true,
      code: true,
      name: true,
    },
  },
});

// Pedigree with relationships for responses
export type PedigreeWithRelations = Prisma.PedigreeGetPayload<{
  include: typeof pedigreeWithRelationsInclude;
}>;

// API Response types
export interface PedigreeCreateResponse {
  success: true;
  data: PedigreeWithRelations;
}

export interface PedigreeListResponse {
  success: true;
  data: PedigreeWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Type for family tree structure
// Pedigreeモデルは血統情報を文字列フィールドとして保持しているため、
// リレーションではなくフラットな構造
export type PedigreeTreeNode = Prisma.PedigreeGetPayload<{
  include: typeof pedigreeWithRelationsInclude;
}>;

export interface PedigreeSuccessResponse {
  success: true;
}
```

## File: backend/src/pedigree/pedigree.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';

import { getTestModuleImports, getTestModuleProviders } from '../test-utils/test-module-setup';

import { PedigreePdfService } from './pdf/pedigree-pdf.service';
import { PrintSettingsService } from './pdf/print-settings.service';
import { PedigreeController } from './pedigree.controller';
import { PedigreeService } from './pedigree.service';

describe('PedigreeController', () => {
  let controller: PedigreeController;
  let service: PedigreeService;

  const mockPedigreeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByCat: jest.fn(),
  };

  const mockPedigreePdfService = {
    generatePdf: jest.fn(),
  };

  const mockPrintSettingsService = {
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    resetToDefault: jest.fn(),
    isPositionsConfig: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: getTestModuleImports(),
      controllers: [PedigreeController],
      providers: [
        ...getTestModuleProviders(),
        {
          provide: PedigreeService,
          useValue: mockPedigreeService,
        },
        {
          provide: PedigreePdfService,
          useValue: mockPedigreePdfService,
        },
        {
          provide: PrintSettingsService,
          useValue: mockPrintSettingsService,
        },
      ],
    }).compile();

    controller = module.get<PedigreeController>(PedigreeController);
    service = module.get<PedigreeService>(PedigreeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pedigree record', async () => {
      const createDto = {
        pedigreeId: '700545',
        catName: 'Test Cat',
        breedCode: 92,
      };
      const mockPedigree = { id: '1', ...createDto };

      mockPedigreeService.create.mockResolvedValue(mockPedigree);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPedigree);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated pedigree records', async () => {
      const mockResponse = {
        data: [{ id: '1', registrationNumber: 'PED-001' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockPedigreeService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll({});

      expect(result).toEqual(mockResponse);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a pedigree record by id', async () => {
      const mockPedigree = { id: '1', registrationNumber: 'PED-001' };

      mockPedigreeService.findOne.mockResolvedValue(mockPedigree);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockPedigree);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a pedigree record', async () => {
      const updateDto = { catName: 'Updated Cat Name', title: 'Champion' };
      const mockPedigree = { id: '1', ...updateDto };

      mockPedigreeService.update.mockResolvedValue(mockPedigree);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(mockPedigree);
      expect(service.update).toHaveBeenCalledWith('1', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a pedigree record', async () => {
      mockPedigreeService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });

  describe('getPrintSettings', () => {
    it('should return print settings', async () => {
      const mockSettings = {
        offsetX: 0,
        offsetY: 0,
        breed: { x: 50, y: 50 },
        sex: { x: 50, y: 60 },
        dateOfBirth: { x: 77, y: 60 },
        catName: { x: 170, y: 55 },
        fontSizes: { catName: 13 },
      };

      mockPrintSettingsService.getSettings.mockResolvedValue(mockSettings);

      const result = await controller.getPrintSettings();

      expect(result).toEqual(mockSettings);
      expect(mockPrintSettingsService.getSettings).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockPrintSettingsService.getSettings.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getPrintSettings()).rejects.toThrow();
    });
  });

  describe('updatePrintSettings', () => {
    const validSettings = {
      offsetX: 10,
      offsetY: 20,
      breed: { x: 55, y: 55 },
      sex: { x: 55, y: 65 },
      dateOfBirth: { x: 80, y: 65 },
      eyeColor: { x: 55, y: 74 },
      color: { x: 80, y: 74 },
      catName: { x: 175, y: 60, align: 'center' as const },
      wcaNo: { x: 175, y: 74, align: 'center' as const },
      owner: { x: 325, y: 55, align: 'right' as const },
      breeder: { x: 325, y: 65, align: 'right' as const },
      dateOfRegistration: { x: 245, y: 74 },
      littersM: { x: 280, y: 74 },
      littersF: { x: 290, y: 74 },
      sire: {
        name: { x: 55, y: 115 },
        color: { x: 55, y: 132 },
        eyeColor: { x: 55, y: 137 },
        jcu: { x: 55, y: 142 },
      },
      dam: {
        name: { x: 55, y: 165 },
        color: { x: 55, y: 182 },
        eyeColor: { x: 55, y: 187 },
        jcu: { x: 55, y: 193 },
      },
      grandParents: {
        ff: { name: { x: 145, y: 106 }, color: { x: 145, y: 111 }, jcu: { x: 145, y: 116 } },
        fm: { name: { x: 145, y: 132 }, color: { x: 145, y: 137 }, jcu: { x: 145, y: 142 } },
        mf: { name: { x: 145, y: 157 }, color: { x: 145, y: 162 }, jcu: { x: 145, y: 167 } },
        mm: { name: { x: 145, y: 183 }, color: { x: 145, y: 188 }, jcu: { x: 145, y: 193 } },
      },
      greatGrandParents: {
        fff: { name: { x: 237, y: 99 }, jcu: { x: 237, y: 103 } },
        ffm: { name: { x: 237, y: 112 }, jcu: { x: 237, y: 116 } },
        fmf: { name: { x: 237, y: 125 }, jcu: { x: 237, y: 129 } },
        fmm: { name: { x: 237, y: 138 }, jcu: { x: 237, y: 142 } },
        mff: { name: { x: 237, y: 151 }, jcu: { x: 237, y: 155 } },
        mfm: { name: { x: 237, y: 163 }, jcu: { x: 237, y: 167 } },
        mmf: { name: { x: 237, y: 176 }, jcu: { x: 237, y: 180 } },
        mmm: { name: { x: 237, y: 189 }, jcu: { x: 237, y: 193 } },
      },
      otherOrganizationsNo: { x: 90, y: 215 },
      fontSizes: {
        catName: 14,
        wcaNo: 13,
        headerInfo: 12,
        parentName: 13,
        parentDetail: 12,
        grandParentName: 12,
        grandParentDetail: 12,
        greatGrandParent: 11,
        footer: 8,
      },
    };

    it('should update print settings with valid data', async () => {
      mockPrintSettingsService.isPositionsConfig.mockReturnValue(true);
      mockPrintSettingsService.updateSettings.mockResolvedValue(validSettings);

      const result = await controller.updatePrintSettings(validSettings);

      expect(result).toEqual(validSettings);
      expect(mockPrintSettingsService.isPositionsConfig).toHaveBeenCalledWith(validSettings);
      expect(mockPrintSettingsService.updateSettings).toHaveBeenCalledWith(validSettings);
    });

    it('should reject invalid settings (missing required fields)', async () => {
      const invalidSettings = {
        offsetX: 10,
        offsetY: 20,
        breed: { x: 55, y: 55 },
        // Missing required fields
      };

      mockPrintSettingsService.isPositionsConfig.mockReturnValue(false);

      await expect(controller.updatePrintSettings(invalidSettings as any)).rejects.toThrow(
        '無効な設定データです',
      );
      expect(mockPrintSettingsService.isPositionsConfig).toHaveBeenCalledWith(invalidSettings);
      expect(mockPrintSettingsService.updateSettings).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockPrintSettingsService.updateSettings.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.updatePrintSettings(validSettings)).rejects.toThrow();
    });
  });

  describe('resetPrintSettings', () => {
    it('should reset print settings to default', async () => {
      const defaultSettings = {
        offsetX: 0,
        offsetY: 0,
        breed: { x: 50, y: 50 },
        fontSizes: { catName: 13 },
      };

      mockPrintSettingsService.resetToDefault.mockResolvedValue(defaultSettings);

      const result = await controller.resetPrintSettings();

      expect(result).toEqual(defaultSettings);
      expect(mockPrintSettingsService.resetToDefault).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockPrintSettingsService.resetToDefault.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.resetPrintSettings()).rejects.toThrow();
    });
  });
});
```

## File: backend/src/pedigree/pedigree.controller.ts
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  Res,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Response } from 'express';

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RoleGuard } from "../auth/role.guard";
import { Roles } from "../auth/roles.decorator";
import { Public } from "../common/decorators/public.decorator";

import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from "./dto";
import { PedigreePdfService } from "./pdf/pedigree-pdf.service";
import { PrintSettingsService, PositionsConfig } from "./pdf/print-settings.service";
import { PedigreeService } from "./pedigree.service";


@ApiTags("Pedigrees")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("pedigrees")
export class PedigreeController {
  constructor(
    private readonly pedigreeService: PedigreeService,
    private readonly pedigreePdfService: PedigreePdfService,
    private readonly printSettingsService: PrintSettingsService,
  ) {}

  // TODO: 本番リリース前に削除 - @Public()は開発環境専用
  @Public()
  @Post()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを作成（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "血統書データが正常に作成されました",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  create(@Body() createPedigreeDto: CreatePedigreeDto) {
    return this.pedigreeService.create(createPedigreeDto);
  }

  @Get()
  @ApiOperation({ summary: "血統書データを検索・一覧取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データの一覧" })
  @ApiQuery({
    name: "page",
    required: false,
    description: "ページ番号",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "1ページあたりの件数",
    example: 10,
  })
  @ApiQuery({ name: "search", required: false, description: "検索キーワード" })
  @ApiQuery({ name: "breedId", required: false, description: "品種ID" })
  @ApiQuery({ name: "coatColorId", required: false, description: "毛色ID" })
  @ApiQuery({
    name: "gender",
    required: false,
    description: "性別 (1: オス, 2: メス)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    description: "ソート項目",
    example: "createdAt",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    description: "ソート順",
    example: "desc",
  })
  findAll(@Query() query: PedigreeQueryDto) {
    return this.pedigreeService.findAll(query);
  }

  @Get("next-id")
  @ApiOperation({ summary: "次の血統書番号を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "次の血統書番号" })
  getNextId() {
    return this.pedigreeService.getNextId();
  }

  // ===== 印刷設定 API（静的ルートなので :id より先に定義） =====

  @Get("print-settings")
  @Public()
  @ApiOperation({ summary: "印刷設定を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "現在の印刷設定" })
  async getPrintSettings() {
    return this.printSettingsService.getSettings();
  }

  @Patch("print-settings")
  @Public()
  @ApiOperation({ summary: "印刷設定を更新" })
  @ApiResponse({ status: HttpStatus.OK, description: "更新後の印刷設定" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "無効な設定データです" })
  async updatePrintSettings(@Body() settings: PositionsConfig) {
    // 入力データの構造を検証（サービスの検証メソッドを再利用）
    if (!this.printSettingsService.isPositionsConfig(settings)) {
      throw new BadRequestException("無効な設定データです");
    }
    return this.printSettingsService.updateSettings(settings);
  }

  @Post("print-settings/reset")
  @Public()
  @ApiOperation({ summary: "印刷設定をデフォルトにリセット" })
  @ApiResponse({ status: HttpStatus.OK, description: "リセット後の印刷設定" })
  async resetPrintSettings() {
    return this.printSettingsService.resetToDefault();
  }

  @Get("pedigree-id/:pedigreeId/pdf")
  // TODO: 本番リリース前に削除 - @Public()は開発環境専用
  @Public()
  @ApiOperation({ summary: "血統書PDFを生成してダウンロード" })
  @ApiResponse({ status: HttpStatus.OK, description: "PDF生成成功", type: 'application/pdf' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "pedigreeId", description: "血統書番号" })
  @ApiQuery({ name: "format", required: false, description: "出力形式 (pdf|base64)", example: "pdf" })
  @ApiQuery({ name: "debug", required: false, description: "デバッグモード（背景画像表示）", example: "false" })
  async generatePdf(
    @Param("pedigreeId") pedigreeId: string,
    @Query("format") format: string = "pdf",
    @Query("debug") debug: string = "false",
    @Res() res: Response,
  ) {
    const debugMode = debug === "true" || debug === "1";
    
    if (format === "base64") {
      const base64Data = await this.pedigreePdfService.generateBase64(pedigreeId);
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      return res.json({
        pedigreeId,
        format: "base64",
        data: base64Data,
        filename: `pedigree_${pedigreeId}_${today}.pdf`,
      });
    }

    const pdfBuffer = await this.pedigreePdfService.generatePdf(pedigreeId, debugMode);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `pedigree_${pedigreeId}_${today}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    // ブラウザ内プレビュー（PDFビューア）を優先し、印刷に進みやすくする
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  }

  @Get("pedigree-id/:pedigreeId")
  @ApiOperation({ summary: "血統書番号で血統書データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "pedigreeId", description: "血統書番号" })
  findByPedigreeId(@Param("pedigreeId") pedigreeId: string) {
    return this.pedigreeService.findByPedigreeId(pedigreeId);
  }

  @Get(":id")
  @ApiOperation({ summary: "IDで血統書データを取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "血統書データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  findOne(@Param("id") id: string) {
    return this.pedigreeService.findOne(id);
  }

  @Get(":id/family-tree")
  @ApiOperation({ summary: "血統書の家系図を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "家系図データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  getFamilyTree(@Param("id") id: string) {
    return this.pedigreeService.getFamilyTree(id);
  }

  @Get(":id/family")
  @ApiOperation({ summary: "血統書データの家系図を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "家系図データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  @ApiQuery({
    name: "generations",
    required: false,
    description: "取得する世代数",
    example: 3,
  })
  getFamily(
    @Param("id") id: string,
    @Query("generations") generations?: number,
  ) {
    return this.pedigreeService.getFamily(id, generations);
  }

  @Get(":id/descendants")
  @ApiOperation({ summary: "血統書データの子孫を取得" })
  @ApiResponse({ status: HttpStatus.OK, description: "子孫データ" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  getDescendants(@Param("id") id: string) {
    return this.pedigreeService.getDescendants(id);
  }

  // TODO: 本番リリース前に削除 - @Public()は開発環境専用
  @Public()
  @Patch(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを更新（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "血統書データが正常に更新されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "無効なデータです",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  update(
    @Param("id") id: string,
    @Body() updatePedigreeDto: UpdatePedigreeDto,
  ) {
    return this.pedigreeService.update(id, updatePedigreeDto);
  }

  @Delete(":id")
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "血統書データを削除（管理者のみ）" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "血統書データが正常に削除されました",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "血統書データが見つかりません",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "管理者権限が必要です",
  })
  @ApiParam({ name: "id", description: "血統書データのID" })
  remove(@Param("id") id: string) {
    return this.pedigreeService.remove(id);
  }
}
```

## File: backend/src/pedigree/pedigree.module.ts
```typescript
import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { PedigreePdfService } from "./pdf/pedigree-pdf.service";
import { PrintSettingsService } from "./pdf/print-settings.service";
import { PedigreeController } from "./pedigree.controller";
import { PedigreeService } from "./pedigree.service";

@Module({
  imports: [PrismaModule],
  controllers: [PedigreeController],
  providers: [PedigreeService, PedigreePdfService, PrintSettingsService],
  exports: [PedigreeService],
})
export class PedigreeModule {}
```

## File: backend/src/pedigree/pedigree.service.spec.ts
```typescript
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { PedigreeService } from './pedigree.service';


describe('PedigreeService', () => {
  let service: PedigreeService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    pedigree: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cat: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedigreeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PedigreeService>(PedigreeService);
    _prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a pedigree record successfully', async () => {
      const createDto = {
        pedigreeId: '700545',
        catName: 'Test Cat',
        breedCode: 92,
      };

      const mockPedigree = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
      };

      mockPrismaService.pedigree.create.mockResolvedValue(mockPedigree);

      const result = await service.create(createDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPedigree);
      expect(mockPrismaService.pedigree.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid pedigree id', async () => {
      const createDto = {
        pedigreeId: '',
      };

      mockPrismaService.pedigree.create.mockRejectedValue(new Error('Invalid pedigreeId'));

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return paginated pedigree records', async () => {
      const mockPedigrees = [
        {
          id: '1',
          catId: 'cat-1',
          registrationNumber: 'PED-001',
        },
      ];

      mockPrismaService.pedigree.findMany.mockResolvedValue(mockPedigrees);
      mockPrismaService.pedigree.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data).toEqual(mockPedigrees);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a pedigree record by id', async () => {
      const mockPedigree = {
        id: '1',
        catId: 'cat-1',
        registrationNumber: 'PED-001',
      };

      mockPrismaService.pedigree.findUnique.mockResolvedValue(mockPedigree);

      const result = await service.findOne('1');

      expect(result).toEqual(mockPedigree);
    });

    it('should throw NotFoundException when pedigree not found', async () => {
      mockPrismaService.pedigree.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a pedigree record successfully', async () => {
      const updateDto = { catName: 'Updated Cat Name', title: 'Champion' };
      const mockPedigree = {
        id: '1',
        pedigreeId: '700545',
        catName: 'Updated Cat Name',
        title: 'Champion',
      };

      mockPrismaService.pedigree.findUnique.mockResolvedValue({
        id: '1',
        pedigreeId: '700545',
      });
      mockPrismaService.pedigree.update.mockResolvedValue(mockPedigree);

      const result = await service.update('1', updateDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPedigree);
    });
  });

  describe('remove', () => {
    it('should delete a pedigree record successfully', async () => {
      const mockPedigree = { id: '1', catId: 'cat-1' };

      mockPrismaService.pedigree.findUnique.mockResolvedValue(mockPedigree);
      mockPrismaService.pedigree.delete.mockResolvedValue(mockPedigree);

      await service.remove('1');

      expect(mockPrismaService.pedigree.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
```

## File: backend/src/pedigree/pedigree.service.ts
```typescript
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from "./dto";
import {
  PedigreeWhereInput,
  PedigreeCreateResponse,
  PedigreeListResponse,
  PedigreeSuccessResponse,
  PedigreeTreeNode,
  pedigreeWithRelationsInclude,
} from "./types/pedigree.types";

@Injectable()
export class PedigreeService {
  constructor(private prisma: PrismaService) {}

  async create(createPedigreeDto: CreatePedigreeDto): Promise<PedigreeCreateResponse> {
    // Access設計準拠: 全79項目をそのまま保存
    const createData: Prisma.PedigreeCreateInput = {
      // 基本情報（17項目）
      pedigreeId: createPedigreeDto.pedigreeId,
      ...(createPedigreeDto.title && { title: createPedigreeDto.title }),
      ...(createPedigreeDto.catName && { catName: createPedigreeDto.catName }),
      ...(createPedigreeDto.catName2 && { catName2: createPedigreeDto.catName2 }),
      ...(createPedigreeDto.breedCode !== undefined && { breedCode: createPedigreeDto.breedCode }),
      ...(createPedigreeDto.genderCode !== undefined && { genderCode: createPedigreeDto.genderCode }),
      ...(createPedigreeDto.eyeColor && { eyeColor: createPedigreeDto.eyeColor }),
      ...(createPedigreeDto.coatColorCode !== undefined && { coatColorCode: createPedigreeDto.coatColorCode }),
      ...(createPedigreeDto.birthDate && { birthDate: createPedigreeDto.birthDate }),
      ...(createPedigreeDto.breederName && { breederName: createPedigreeDto.breederName }),
      ...(createPedigreeDto.ownerName && { ownerName: createPedigreeDto.ownerName }),
      ...(createPedigreeDto.registrationDate && { registrationDate: createPedigreeDto.registrationDate }),
      ...(createPedigreeDto.brotherCount !== undefined && { brotherCount: createPedigreeDto.brotherCount }),
      ...(createPedigreeDto.sisterCount !== undefined && { sisterCount: createPedigreeDto.sisterCount }),
      ...(createPedigreeDto.notes && { notes: createPedigreeDto.notes }),
      ...(createPedigreeDto.notes2 && { notes2: createPedigreeDto.notes2 }),
      ...(createPedigreeDto.otherNo && { otherNo: createPedigreeDto.otherNo }),
      
      // 血統情報（62項目）
      // 第1世代: 父親（7項目）
      ...(createPedigreeDto.fatherTitle && { fatherTitle: createPedigreeDto.fatherTitle }),
      ...(createPedigreeDto.fatherCatName && { fatherCatName: createPedigreeDto.fatherCatName }),
      ...(createPedigreeDto.fatherCatName2 && { fatherCatName2: createPedigreeDto.fatherCatName2 }),
      ...(createPedigreeDto.fatherCoatColor && { fatherCoatColor: createPedigreeDto.fatherCoatColor }),
      ...(createPedigreeDto.fatherEyeColor && { fatherEyeColor: createPedigreeDto.fatherEyeColor }),
      ...(createPedigreeDto.fatherJCU && { fatherJCU: createPedigreeDto.fatherJCU }),
      ...(createPedigreeDto.fatherOtherCode && { fatherOtherCode: createPedigreeDto.fatherOtherCode }),

      // 第1世代: 母親（7項目）
      ...(createPedigreeDto.motherTitle && { motherTitle: createPedigreeDto.motherTitle }),
      ...(createPedigreeDto.motherCatName && { motherCatName: createPedigreeDto.motherCatName }),
      ...(createPedigreeDto.motherCatName2 && { motherCatName2: createPedigreeDto.motherCatName2 }),
      ...(createPedigreeDto.motherCoatColor && { motherCoatColor: createPedigreeDto.motherCoatColor }),
      ...(createPedigreeDto.motherEyeColor && { motherEyeColor: createPedigreeDto.motherEyeColor }),
      ...(createPedigreeDto.motherJCU && { motherJCU: createPedigreeDto.motherJCU }),
      ...(createPedigreeDto.motherOtherCode && { motherOtherCode: createPedigreeDto.motherOtherCode }),

      // 第2世代: 祖父母（16項目）
      ...(createPedigreeDto.ffTitle && { ffTitle: createPedigreeDto.ffTitle }),
      ...(createPedigreeDto.ffCatName && { ffCatName: createPedigreeDto.ffCatName }),
      ...(createPedigreeDto.ffCatColor && { ffCatColor: createPedigreeDto.ffCatColor }),
      ...(createPedigreeDto.ffjcu && { ffjcu: createPedigreeDto.ffjcu }),

      ...(createPedigreeDto.fmTitle && { fmTitle: createPedigreeDto.fmTitle }),
      ...(createPedigreeDto.fmCatName && { fmCatName: createPedigreeDto.fmCatName }),
      ...(createPedigreeDto.fmCatColor && { fmCatColor: createPedigreeDto.fmCatColor }),
      ...(createPedigreeDto.fmjcu && { fmjcu: createPedigreeDto.fmjcu }),

      ...(createPedigreeDto.mfTitle && { mfTitle: createPedigreeDto.mfTitle }),
      ...(createPedigreeDto.mfCatName && { mfCatName: createPedigreeDto.mfCatName }),
      ...(createPedigreeDto.mfCatColor && { mfCatColor: createPedigreeDto.mfCatColor }),
      ...(createPedigreeDto.mfjcu && { mfjcu: createPedigreeDto.mfjcu }),

      ...(createPedigreeDto.mmTitle && { mmTitle: createPedigreeDto.mmTitle }),
      ...(createPedigreeDto.mmCatName && { mmCatName: createPedigreeDto.mmCatName }),
      ...(createPedigreeDto.mmCatColor && { mmCatColor: createPedigreeDto.mmCatColor }),
      ...(createPedigreeDto.mmjcu && { mmjcu: createPedigreeDto.mmjcu }),

      // 第3世代: 曾祖父母（32項目）
      ...(createPedigreeDto.fffTitle && { fffTitle: createPedigreeDto.fffTitle }),
      ...(createPedigreeDto.fffCatName && { fffCatName: createPedigreeDto.fffCatName }),
      ...(createPedigreeDto.fffCatColor && { fffCatColor: createPedigreeDto.fffCatColor }),
      ...(createPedigreeDto.fffjcu && { fffjcu: createPedigreeDto.fffjcu }),

      ...(createPedigreeDto.ffmTitle && { ffmTitle: createPedigreeDto.ffmTitle }),
      ...(createPedigreeDto.ffmCatName && { ffmCatName: createPedigreeDto.ffmCatName }),
      ...(createPedigreeDto.ffmCatColor && { ffmCatColor: createPedigreeDto.ffmCatColor }),
      ...(createPedigreeDto.ffmjcu && { ffmjcu: createPedigreeDto.ffmjcu }),

      ...(createPedigreeDto.fmfTitle && { fmfTitle: createPedigreeDto.fmfTitle }),
      ...(createPedigreeDto.fmfCatName && { fmfCatName: createPedigreeDto.fmfCatName }),
      ...(createPedigreeDto.fmfCatColor && { fmfCatColor: createPedigreeDto.fmfCatColor }),
      ...(createPedigreeDto.fmfjcu && { fmfjcu: createPedigreeDto.fmfjcu }),

      ...(createPedigreeDto.fmmTitle && { fmmTitle: createPedigreeDto.fmmTitle }),
      ...(createPedigreeDto.fmmCatName && { fmmCatName: createPedigreeDto.fmmCatName }),
      ...(createPedigreeDto.fmmCatColor && { fmmCatColor: createPedigreeDto.fmmCatColor }),
      ...(createPedigreeDto.fmmjcu && { fmmjcu: createPedigreeDto.fmmjcu }),

      ...(createPedigreeDto.mffTitle && { mffTitle: createPedigreeDto.mffTitle }),
      ...(createPedigreeDto.mffCatName && { mffCatName: createPedigreeDto.mffCatName }),
      ...(createPedigreeDto.mffCatColor && { mffCatColor: createPedigreeDto.mffCatColor }),
      ...(createPedigreeDto.mffjcu && { mffjcu: createPedigreeDto.mffjcu }),

      ...(createPedigreeDto.mfmTitle && { mfmTitle: createPedigreeDto.mfmTitle }),
      ...(createPedigreeDto.mfmCatName && { mfmCatName: createPedigreeDto.mfmCatName }),
      ...(createPedigreeDto.mfmCatColor && { mfmCatColor: createPedigreeDto.mfmCatColor }),
      ...(createPedigreeDto.mfmjcu && { mfmjcu: createPedigreeDto.mfmjcu }),

      ...(createPedigreeDto.mmfTitle && { mmfTitle: createPedigreeDto.mmfTitle }),
      ...(createPedigreeDto.mmfCatName && { mmfCatName: createPedigreeDto.mmfCatName }),
      ...(createPedigreeDto.mmfCatColor && { mmfCatColor: createPedigreeDto.mmfCatColor }),
      ...(createPedigreeDto.mmfjcu && { mmfjcu: createPedigreeDto.mmfjcu }),

      ...(createPedigreeDto.mmmTitle && { mmmTitle: createPedigreeDto.mmmTitle }),
      ...(createPedigreeDto.mmmCatName && { mmmCatName: createPedigreeDto.mmmCatName }),
      ...(createPedigreeDto.mmmCatColor && { mmmCatColor: createPedigreeDto.mmmCatColor }),
      ...(createPedigreeDto.mmmjcu && { mmmjcu: createPedigreeDto.mmmjcu }),

      ...(createPedigreeDto.oldCode && { oldCode: createPedigreeDto.oldCode }),
    };

    try {
      const result = await this.prisma.pedigree.create({
        data: createData,
        include: pedigreeWithRelationsInclude,
      });

      return { success: true, data: result };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('血統書番号は既に登録されています');
        }

        if (error.code === 'P2003') {
          throw new BadRequestException('関連マスタに存在しないコードが指定されています（品種/性別/毛色）');
        }
      }

      throw error;
    }

  }

  async findAll(query: PedigreeQueryDto): Promise<PedigreeListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      coatColorId,
      gender,
      catName2: _catName2,
      eyeColor,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: PedigreeWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { catName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { breederName: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedCode = parseInt(breedId, 10);
    if (coatColorId) where.coatColorCode = parseInt(coatColorId, 10);
    if (gender) where.genderCode = parseInt(gender, 10);
    if (eyeColor) where.eyeColor = eyeColor;
    if (_catName2) {
      where.catName2 = {
        contains: _catName2,
        mode: "insensitive",
      };
    }

    const [pedigrees, total] = await Promise.all([
      this.prisma.pedigree.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: pedigreeWithRelationsInclude,
      }),
      this.prisma.pedigree.count({ where }),
    ]);

    return {
      success: true,
      data: pedigrees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { id },
      include: pedigreeWithRelationsInclude,
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    return pedigree;
  }

  async findByPedigreeId(pedigreeId: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { pedigreeId },
      include: pedigreeWithRelationsInclude,
    });

    if (!pedigree) {
      throw new NotFoundException(
        `Pedigree with pedigree ID ${pedigreeId} not found`,
      );
    }

    return pedigree;
  }

  async update(id: string, updatePedigreeDto: UpdatePedigreeDto): Promise<PedigreeCreateResponse> {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    // Prisma の型に適合するようにデータを準備 (Access schema 79 fields)
    const updateData: Prisma.PedigreeUpdateInput = {
      // Basic information (17 fields)
      ...(updatePedigreeDto.pedigreeId && { pedigreeId: updatePedigreeDto.pedigreeId }),
      ...(updatePedigreeDto.title && { title: updatePedigreeDto.title }),
      ...(updatePedigreeDto.catName && { catName: updatePedigreeDto.catName }),
      ...(updatePedigreeDto.catName2 && { catName2: updatePedigreeDto.catName2 }),
      ...(updatePedigreeDto.breedCode !== undefined && { breedCode: updatePedigreeDto.breedCode }),
      ...(updatePedigreeDto.genderCode !== undefined && { genderCode: updatePedigreeDto.genderCode }),
      ...(updatePedigreeDto.eyeColor && { eyeColor: updatePedigreeDto.eyeColor }),
      ...(updatePedigreeDto.coatColorCode !== undefined && { coatColorCode: updatePedigreeDto.coatColorCode }),
      ...(updatePedigreeDto.birthDate && { birthDate: updatePedigreeDto.birthDate }),
      ...(updatePedigreeDto.breederName && { breederName: updatePedigreeDto.breederName }),
      ...(updatePedigreeDto.ownerName && { ownerName: updatePedigreeDto.ownerName }),
      ...(updatePedigreeDto.registrationDate && { registrationDate: updatePedigreeDto.registrationDate }),
      ...(updatePedigreeDto.brotherCount !== undefined && { brotherCount: updatePedigreeDto.brotherCount }),
      ...(updatePedigreeDto.sisterCount !== undefined && { sisterCount: updatePedigreeDto.sisterCount }),
      ...(updatePedigreeDto.notes && { notes: updatePedigreeDto.notes }),
      ...(updatePedigreeDto.notes2 && { notes2: updatePedigreeDto.notes2 }),
      ...(updatePedigreeDto.otherNo && { otherNo: updatePedigreeDto.otherNo }),

      // Generation 1 - Father (7 fields)
      ...(updatePedigreeDto.fatherTitle && { fatherTitle: updatePedigreeDto.fatherTitle }),
      ...(updatePedigreeDto.fatherCatName && { fatherCatName: updatePedigreeDto.fatherCatName }),
      ...(updatePedigreeDto.fatherCatName2 && { fatherCatName2: updatePedigreeDto.fatherCatName2 }),
      ...(updatePedigreeDto.fatherCoatColor && { fatherCoatColor: updatePedigreeDto.fatherCoatColor }),
      ...(updatePedigreeDto.fatherEyeColor && { fatherEyeColor: updatePedigreeDto.fatherEyeColor }),
      ...(updatePedigreeDto.fatherJCU && { fatherJCU: updatePedigreeDto.fatherJCU }),
      ...(updatePedigreeDto.fatherOtherCode && { fatherOtherCode: updatePedigreeDto.fatherOtherCode }),

      // Generation 1 - Mother (7 fields)
      ...(updatePedigreeDto.motherTitle && { motherTitle: updatePedigreeDto.motherTitle }),
      ...(updatePedigreeDto.motherCatName && { motherCatName: updatePedigreeDto.motherCatName }),
      ...(updatePedigreeDto.motherCatName2 && { motherCatName2: updatePedigreeDto.motherCatName2 }),
      ...(updatePedigreeDto.motherCoatColor && { motherCoatColor: updatePedigreeDto.motherCoatColor }),
      ...(updatePedigreeDto.motherEyeColor && { motherEyeColor: updatePedigreeDto.motherEyeColor }),
      ...(updatePedigreeDto.motherJCU && { motherJCU: updatePedigreeDto.motherJCU }),
      ...(updatePedigreeDto.motherOtherCode && { motherOtherCode: updatePedigreeDto.motherOtherCode }),

      // Generation 2 - Paternal Grandfather (FF) (4 fields)
      ...(updatePedigreeDto.ffTitle && { ffTitle: updatePedigreeDto.ffTitle }),
      ...(updatePedigreeDto.ffCatName && { ffCatName: updatePedigreeDto.ffCatName }),
      ...(updatePedigreeDto.ffCatColor && { ffCatColor: updatePedigreeDto.ffCatColor }),
      ...(updatePedigreeDto.ffjcu && { ffjcu: updatePedigreeDto.ffjcu }),

      // Generation 2 - Paternal Grandmother (FM) (4 fields)
      ...(updatePedigreeDto.fmTitle && { fmTitle: updatePedigreeDto.fmTitle }),
      ...(updatePedigreeDto.fmCatName && { fmCatName: updatePedigreeDto.fmCatName }),
      ...(updatePedigreeDto.fmCatColor && { fmCatColor: updatePedigreeDto.fmCatColor }),
      ...(updatePedigreeDto.fmjcu && { fmjcu: updatePedigreeDto.fmjcu }),

      // Generation 2 - Maternal Grandfather (MF) (4 fields)
      ...(updatePedigreeDto.mfTitle && { mfTitle: updatePedigreeDto.mfTitle }),
      ...(updatePedigreeDto.mfCatName && { mfCatName: updatePedigreeDto.mfCatName }),
      ...(updatePedigreeDto.mfCatColor && { mfCatColor: updatePedigreeDto.mfCatColor }),
      ...(updatePedigreeDto.mfjcu && { mfjcu: updatePedigreeDto.mfjcu }),

      // Generation 2 - Maternal Grandmother (MM) (4 fields)
      ...(updatePedigreeDto.mmTitle && { mmTitle: updatePedigreeDto.mmTitle }),
      ...(updatePedigreeDto.mmCatName && { mmCatName: updatePedigreeDto.mmCatName }),
      ...(updatePedigreeDto.mmCatColor && { mmCatColor: updatePedigreeDto.mmCatColor }),
      ...(updatePedigreeDto.mmjcu && { mmjcu: updatePedigreeDto.mmjcu }),

      // Generation 3 - Great-Grandfathers and Great-Grandmothers (32 fields)
      // FFF (Father's Father's Father)
      ...(updatePedigreeDto.fffTitle && { fffTitle: updatePedigreeDto.fffTitle }),
      ...(updatePedigreeDto.fffCatName && { fffCatName: updatePedigreeDto.fffCatName }),
      ...(updatePedigreeDto.fffCatColor && { fffCatColor: updatePedigreeDto.fffCatColor }),
      ...(updatePedigreeDto.fffjcu && { fffjcu: updatePedigreeDto.fffjcu }),

      // FFM (Father's Father's Mother)
      ...(updatePedigreeDto.ffmTitle && { ffmTitle: updatePedigreeDto.ffmTitle }),
      ...(updatePedigreeDto.ffmCatName && { ffmCatName: updatePedigreeDto.ffmCatName }),
      ...(updatePedigreeDto.ffmCatColor && { ffmCatColor: updatePedigreeDto.ffmCatColor }),
      ...(updatePedigreeDto.ffmjcu && { ffmjcu: updatePedigreeDto.ffmjcu }),

      // FMF (Father's Mother's Father)
      ...(updatePedigreeDto.fmfTitle && { fmfTitle: updatePedigreeDto.fmfTitle }),
      ...(updatePedigreeDto.fmfCatName && { fmfCatName: updatePedigreeDto.fmfCatName }),
      ...(updatePedigreeDto.fmfCatColor && { fmfCatColor: updatePedigreeDto.fmfCatColor }),
      ...(updatePedigreeDto.fmfjcu && { fmfjcu: updatePedigreeDto.fmfjcu }),

      // FMM (Father's Mother's Mother)
      ...(updatePedigreeDto.fmmTitle && { fmmTitle: updatePedigreeDto.fmmTitle }),
      ...(updatePedigreeDto.fmmCatName && { fmmCatName: updatePedigreeDto.fmmCatName }),
      ...(updatePedigreeDto.fmmCatColor && { fmmCatColor: updatePedigreeDto.fmmCatColor }),
      ...(updatePedigreeDto.fmmjcu && { fmmjcu: updatePedigreeDto.fmmjcu }),

      // MFF (Mother's Father's Father)
      ...(updatePedigreeDto.mffTitle && { mffTitle: updatePedigreeDto.mffTitle }),
      ...(updatePedigreeDto.mffCatName && { mffCatName: updatePedigreeDto.mffCatName }),
      ...(updatePedigreeDto.mffCatColor && { mffCatColor: updatePedigreeDto.mffCatColor }),
      ...(updatePedigreeDto.mffjcu && { mffjcu: updatePedigreeDto.mffjcu }),

      // MFM (Mother's Father's Mother)
      ...(updatePedigreeDto.mfmTitle && { mfmTitle: updatePedigreeDto.mfmTitle }),
      ...(updatePedigreeDto.mfmCatName && { mfmCatName: updatePedigreeDto.mfmCatName }),
      ...(updatePedigreeDto.mfmCatColor && { mfmCatColor: updatePedigreeDto.mfmCatColor }),
      ...(updatePedigreeDto.mfmjcu && { mfmjcu: updatePedigreeDto.mfmjcu }),

      // MMF (Mother's Mother's Father)
      ...(updatePedigreeDto.mmfTitle && { mmfTitle: updatePedigreeDto.mmfTitle }),
      ...(updatePedigreeDto.mmfCatName && { mmfCatName: updatePedigreeDto.mmfCatName }),
      ...(updatePedigreeDto.mmfCatColor && { mmfCatColor: updatePedigreeDto.mmfCatColor }),
      ...(updatePedigreeDto.mmfjcu && { mmfjcu: updatePedigreeDto.mmfjcu }),

      // MMM (Mother's Mother's Mother)
      ...(updatePedigreeDto.mmmTitle && { mmmTitle: updatePedigreeDto.mmmTitle }),
      ...(updatePedigreeDto.mmmCatName && { mmmCatName: updatePedigreeDto.mmmCatName }),
      ...(updatePedigreeDto.mmmCatColor && { mmmCatColor: updatePedigreeDto.mmmCatColor }),
      ...(updatePedigreeDto.mmmjcu && { mmmjcu: updatePedigreeDto.mmmjcu }),

      // Old Code (1 field)
      ...(updatePedigreeDto.oldCode && { oldCode: updatePedigreeDto.oldCode }),
    };

    const result = await this.prisma.pedigree.update({
      where: { id },
      data: updateData,
      include: pedigreeWithRelationsInclude,
    });

    return { success: true, data: result };
  }

  async remove(id: string): Promise<PedigreeSuccessResponse> {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    await this.prisma.pedigree.delete({
      where: { id },
    });

    return { success: true };
  }

  async getFamily(id: string, _generations: number = 3): Promise<PedigreeTreeNode> {
    // Pedigreeモデルは血統情報を文字列フィールドとして保持しているため、
    // リレーションではなく直接データを取得
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { id },
      include: pedigreeWithRelationsInclude,
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    // 血統情報は既にフィールドに含まれているため、そのまま返す
    return pedigree;
  }

  async getFamilyTree(id: string, generations: number = 3): Promise<PedigreeTreeNode> {
    return this.getFamily(id, generations);
  }

  async getDescendants(id: string) {
    const pedigree = await this.findOne(id);

    const nameConditions: Prisma.PedigreeWhereInput[] = [];

    if (pedigree.catName) {
      nameConditions.push({ fatherCatName: { equals: pedigree.catName } });
      nameConditions.push({ motherCatName: { equals: pedigree.catName } });
    }

    const descendants = nameConditions.length
      ? await this.prisma.pedigree.findMany({
          where: {
            OR: nameConditions,
          },
          include: pedigreeWithRelationsInclude,
        })
      : [];

    return {
      pedigree,
      children: descendants,
    };
  }

  async getNextId(): Promise<{ nextId: string }> {
    try {
      // 数値のみで構成されるpedigree_idの最大値を取得
      // PostgreSQL固有の正規表現演算子 ~ を使用
      const result = await this.prisma.$queryRaw<{ max_id: number }[]>`
        SELECT MAX(CAST(pedigree_id AS INTEGER)) as max_id 
        FROM pedigrees 
        WHERE pedigree_id ~ '^[0-9]+$'
      `;

      if (result && result[0] && result[0].max_id !== null) {
        // BigIntで返ってくる可能性があるため、NumberまたはString変換して処理
        const maxId = Number(result[0].max_id);
        return { nextId: (maxId + 1).toString() };
      }

      // データがない場合は初期値 "1" を返す
      return { nextId: "1" };
    } catch (error) {
      console.error("Failed to get next pedigree ID:", error);
      // エラー時は安全なデフォルト値を返す
      return { nextId: "1" };
    }
  }
}
```

## File: frontend/src/app/pedigrees/new/page.tsx
```typescript
import { redirect } from 'next/navigation';

/**
 * 旧血統書登録ページ - リダイレクト用
 * 
 * このページは `/pedigrees/new` へのアクセスを `/pedigrees?tab=register` にリダイレクトします。
 * 新しい統合UIでは、タブ切り替えで登録・編集・更新が可能です。
 */
export default function NewPedigreeRedirect() {
  redirect('/pedigrees?tab=register');
}
```

## File: frontend/src/app/pedigrees/[id]/family-tree/client.tsx
```typescript
'use client'

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Card,
  LoadingOverlay,
  Alert,
  Grid,
  Select,
} from '@mantine/core';
import { IconArrowLeft, IconDna } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet } from '../../../../lib/api';

interface FamilyTreeData {
  id: string;
  pedigreeId: string;
  catName: string;
  breedCode: number | null;
  gender: number | null;
  birthDate: string | null;
  coatColorCode: number | null;
  breed?: { name: string } | null;
  color?: { name: string } | null;
  father?: FamilyTreeData | null;
  mother?: FamilyTreeData | null;
}

export default function FamilyTreeClient() {
  const router = useRouter();
  const params = useParams();
  const pedigreeId = params.id as string;
  
  const [familyTree, setFamilyTree] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState('3');

  const generationOptions = [
    { value: '2', label: '2世代' },
    { value: '3', label: '3世代' },
    { value: '4', label: '4世代' },
    { value: '5', label: '5世代' },
  ];

  useEffect(() => {
    const fetchFamilyTree = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/pedigrees/${pedigreeId}/family-tree`, {
          generations: generations.toString()
        });
        
        if (!response.ok) {
          throw new Error('家系図データの取得に失敗しました');
        }

        const data = await response.json();
        setFamilyTree(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (pedigreeId) {
      fetchFamilyTree();
    }
  }, [pedigreeId, generations]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatGender = (gender: number | null) => {
    switch (gender) {
      case 1: return '雄';
      case 2: return '雌';
      default: return '不明';
    }
  };

  const getGenderColor = (gender: number | null) => {
    switch (gender) {
      case 1: return 'blue';
      case 2: return 'pink';
      default: return 'gray';
    }
  };

  const PedigreeCard: React.FC<{ 
    pedigree: FamilyTreeData | null;
    level: number;
    position?: 'father' | 'mother';
  }> = ({ pedigree, level: _level, position }) => {
    if (!pedigree) {
      return (
        <Card 
          p="sm" 
          style={{ 
            border: '2px dashed #dee2e6',
            minHeight: '120px',
            backgroundColor: 'var(--background-base)'
          }}
        >
          <Text c="dimmed" ta="center" mt="md">
            情報なし
          </Text>
        </Card>
      );
    }

    const borderColor = position === 'father' ? '#228be6' : position === 'mother' ? '#e64980' : '#868e96';
    
    return (
      <Card 
        p="sm" 
        style={{ 
          border: `2px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          minHeight: '120px'
        }}
        onClick={() => router.push(`/pedigrees/${pedigree.id}`)}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="sm" lineClamp={1}>
                {pedigree.catName || '名前なし'}
              </Text>
            </div>
            <Badge size="xs" color={getGenderColor(pedigree.gender)}>
              {formatGender(pedigree.gender)}
            </Badge>
          </Group>
          
          <div>
            <Text size="xs" fw={500} c="blue">
              {pedigree.pedigreeId}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(pedigree.birthDate)}
            </Text>
          </div>

          {pedigree.breed && (
            <Badge size="xs" variant="light">
              {pedigree.breed.name}
            </Badge>
          )}
        </Stack>
      </Card>
    );
  };

  const renderFamilyLevel = (pedigree: FamilyTreeData | null, currentLevel: number, maxLevel: number): React.ReactNode => {
    if (!pedigree || currentLevel > maxLevel) {
      return null;
    }

    return (
      <div key={`level-${currentLevel}-${pedigree.id}`}>
        <Grid gutter="md" mb="md">
          {/* 現在の個体 */}
          <Grid.Col span={12}>
            <Text fw={600} mb="sm" ta="center">
              {currentLevel === 0 ? '本猫' : `第${currentLevel}世代`}
            </Text>
            <Group justify="center">
              <div style={{ width: currentLevel === 0 ? '300px' : '250px' }}>
                <PedigreeCard pedigree={pedigree} level={currentLevel} />
              </div>
            </Group>
          </Grid.Col>

          {/* 両親 */}
          {(pedigree.father || pedigree.mother) && currentLevel < maxLevel && (
            <Grid.Col span={12}>
              <Text fw={600} mb="sm" ta="center">
                両親
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} mb="xs" ta="center" c="blue">
                    <Group justify="center" gap="xs">
                      <IconDna size={16} />
                      父親
                    </Group>
                  </Text>
                  <PedigreeCard pedigree={pedigree.father || null} level={currentLevel + 1} position="father" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} mb="xs" ta="center" c="pink">
                    <Group justify="center" gap="xs">
                      <IconDna size={16} />
                      母親
                    </Group>
                  </Text>
                  <PedigreeCard pedigree={pedigree.mother || null} level={currentLevel + 1} position="mother" />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          )}
        </Grid>

        {/* 祖父母以上の世代を再帰的に表示 */}
        {currentLevel < maxLevel - 1 && (pedigree.father || pedigree.mother) && (
          <div style={{ marginLeft: '20px', paddingLeft: '20px', borderLeft: '2px solid #dee2e6' }}>
            {pedigree.father && renderFamilyLevel(pedigree.father as FamilyTreeData, currentLevel + 1, maxLevel)}
            {pedigree.mother && renderFamilyLevel(pedigree.mother as FamilyTreeData, currentLevel + 1, maxLevel)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Container size="xl" py="md">
        <Paper p="md" style={{ position: 'relative', minHeight: '400px' }}>
          <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (error || !familyTree) {
    return (
      <Container size="xl" py="md">
        <Alert color="red" title="エラー">
          {error || '家系図データが見つかりませんでした'}
        </Alert>
        <Button mt="md" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            血統書詳細に戻る
          </Button>
          <Group>
            <Select
              label="表示世代数"
              data={generationOptions}
              value={generations}
              onChange={(value) => setGenerations(value || '3')}
              w={120}
            />
          </Group>
        </Group>

        <div>
          <Title order={1} mb="xs">
            {familyTree.catName}の家系図
          </Title>
          <Group>
            <Badge size="lg" color="blue">
              血統書番号: {familyTree.pedigreeId}
            </Badge>
            <Badge size="lg" color={getGenderColor(familyTree.gender)}>
              {formatGender(familyTree.gender)}
            </Badge>
            {familyTree.breed && (
              <Badge size="lg" variant="light">
                {familyTree.breed.name}
              </Badge>
            )}
          </Group>
        </div>

        {/* 家系図表示 */}
        <Paper p="md" shadow="sm" style={{ overflow: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {renderFamilyLevel(familyTree, 0, parseInt(generations))}
          </div>
        </Paper>

        {/* 説明 */}
  <Paper p="md" style={{ backgroundColor: 'var(--background-soft)' }}>
          <Text size="sm" c="dimmed">
            <strong>使い方:</strong> 各カードをクリックすると、その個体の詳細情報に移動できます。
            世代数を変更することで、表示する祖先の数を調整できます。
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
```

## File: frontend/src/app/pedigrees/[id]/family-tree/page.tsx
```typescript
import FamilyTreeClient from './client';

export default function FamilyTreePage() {
  return <FamilyTreeClient />;
}
```

## File: frontend/src/app/pedigrees/[id]/client.tsx
```typescript
'use client'

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Grid,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Card,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconCalendar, IconUser, IconDna, IconFileText } from '@tabler/icons-react';
import { useRouter, useParams } from 'next/navigation';
import { apiGet } from '../../../lib/api';

interface PedigreeDetail {
  id: string;
  pedigreeId: string;
  catId: string | null;
  title: string | null;
  catName: string;
  breedCode: number | null;
  gender: number | null;
  eyeColor: string | null;
  coatColorCode: number | null;
  birthDate: string | null;
  registrationDate: string | null;
  breederName: string | null;
  ownerName: string | null;
  brotherCount: number | null;
  sisterCount: number | null;
  notes: string | null;
  notes2: string | null;
  otherNo: string | null;
  oldCode: string | null;
  breed: { id: string; name: string; code: number } | null;
  color: { id: string; name: string; code: number } | null;
  fatherPedigree: {
    id: string;
    pedigreeId: string;
    catName: string;
    breedCode: number | null;
    coatColorCode: number | null;
  } | null;
  motherPedigree: {
    id: string;
    pedigreeId: string;
    catName: string;
    breedCode: number | null;
    coatColorCode: number | null;
  } | null;
  fatherOf: Array<{ id: string; pedigreeId: string; catName: string }>;
  motherOf: Array<{ id: string; pedigreeId: string; catName: string }>;
}

export default function PedigreeDetailClient() {
  const router = useRouter();
  const params = useParams();
  const pedigreeId = params.id as string;
  
  const [pedigree, setPedigree] = useState<PedigreeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedigree = async () => {
      try {
        setLoading(true);
        const response = await apiGet(`/pedigrees/${pedigreeId}`);
        
        if (!response.ok) {
          throw new Error('血統書データの取得に失敗しました');
        }

        const data = await response.json();
        setPedigree(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    if (pedigreeId) {
      fetchPedigree();
    }
  }, [pedigreeId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatGender = (gender: number | null) => {
    switch (gender) {
      case 1: return '雄';
      case 2: return '雌';
      default: return '不明';
    }
  };

  const getGenderColor = (gender: number | null) => {
    switch (gender) {
      case 1: return 'blue';
      case 2: return 'pink';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="md">
        <Paper p="md" style={{ position: 'relative', minHeight: '400px' }}>
          <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        </Paper>
      </Container>
    );
  }

  if (error || !pedigree) {
    return (
      <Container size="lg" py="md">
        <Alert color="red" title="エラー">
          {error || '血統書データが見つかりませんでした'}
        </Alert>
        <Button mt="md" leftSection={<IconArrowLeft size={16} />} onClick={() => router.back()}>
          戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between">
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
          >
            血統書一覧に戻る
          </Button>
          <Group>
            <Button
              variant="light"
              color="green"
              leftSection={<IconFileText size={16} />}
              onClick={() => router.push(`/pedigrees/${pedigree.id}/family-tree`)}
            >
              家系図を見る
            </Button>
          </Group>
        </Group>

        <Title order={1}>血統書詳細情報</Title>

        {/* 基本情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">基本情報</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Group>
                  <Text fw={600}>血統書番号:</Text>
                  <Badge size="lg" color="blue">{pedigree.pedigreeId}</Badge>
                </Group>
                <Group>
                  <Text fw={600}>猫名:</Text>
                  <Text size="lg" fw={500}>{pedigree.catName || '名前なし'}</Text>
                </Group>
                <Group>
                  <Text fw={600}>タイトル:</Text>
                  <Text>{pedigree.title || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={600}>性別:</Text>
                  <Badge color={getGenderColor(pedigree.gender)}>
                    {formatGender(pedigree.gender)}
                  </Badge>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Group>
                  <IconCalendar size={16} />
                  <Text fw={600}>生年月日:</Text>
                  <Text>{formatDate(pedigree.birthDate)}</Text>
                </Group>
                <Group>
                  <IconCalendar size={16} />
                  <Text fw={600}>登録年月日:</Text>
                  <Text>{formatDate(pedigree.registrationDate)}</Text>
                </Group>
                <Group>
                  <Text fw={600}>品種コード:</Text>
                  <Text>{pedigree.breedCode || '-'}</Text>
                  {pedigree.breed && (
                    <Badge variant="light">{pedigree.breed.name}</Badge>
                  )}
                </Group>
                <Group>
                  <Text fw={600}>毛色コード:</Text>
                  <Text>{pedigree.coatColorCode || '-'}</Text>
                  {pedigree.color && (
                    <Badge variant="light" color="orange">{pedigree.color.name}</Badge>
                  )}
                </Group>
                <Group>
                  <Text fw={600}>目色:</Text>
                  <Text>{pedigree.eyeColor || '-'}</Text>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 関係者情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">関係者情報</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group>
                <IconUser size={16} />
                <Text fw={600}>繁殖者:</Text>
                <Text>{pedigree.breederName || '-'}</Text>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group>
                <IconUser size={16} />
                <Text fw={600}>所有者:</Text>
                <Text>{pedigree.ownerName || '-'}</Text>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 家族情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">家族情報</Title>
          
          <Grid>
            {/* 兄弟姉妹情報 */}
            <Grid.Col span={12}>
              <Group>
                <Text fw={600}>兄弟:</Text>
                <Badge>{pedigree.brotherCount ?? 0}匹</Badge>
                <Text fw={600}>姉妹:</Text>
                <Badge>{pedigree.sisterCount ?? 0}匹</Badge>
              </Group>
            </Grid.Col>

            {/* 両親情報 */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card p="md" style={{ border: '2px solid #228be6' }}>
                <Group mb="xs">
                  <IconDna size={16} />
                  <Text fw={600} c="blue">父親</Text>
                </Group>
                {pedigree.fatherPedigree ? (
                  <Stack gap="xs">
                    <Text size="sm">
                      <Text span fw={500}>血統書番号:</Text> {pedigree.fatherPedigree.pedigreeId}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>猫名:</Text> {pedigree.fatherPedigree.catName}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>品種コード:</Text> {pedigree.fatherPedigree.breedCode || '-'}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        if (!pedigree.fatherPedigree) return;
                        router.push(`/pedigrees/${pedigree.fatherPedigree.id}`);
                      }}
                    >
                      詳細を見る
                    </Button>
                  </Stack>
                ) : (
                  <Text c="dimmed">情報なし</Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card p="md" style={{ border: '2px solid #e64980' }}>
                <Group mb="xs">
                  <IconDna size={16} />
                  <Text fw={600} c="pink">母親</Text>
                </Group>
                {pedigree.motherPedigree ? (
                  <Stack gap="xs">
                    <Text size="sm">
                      <Text span fw={500}>血統書番号:</Text> {pedigree.motherPedigree.pedigreeId}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>猫名:</Text> {pedigree.motherPedigree.catName}
                    </Text>
                    <Text size="sm">
                      <Text span fw={500}>品種コード:</Text> {pedigree.motherPedigree.breedCode || '-'}
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => {
                        if (!pedigree.motherPedigree) return;
                        router.push(`/pedigrees/${pedigree.motherPedigree.id}`);
                      }}
                    >
                      詳細を見る
                    </Button>
                  </Stack>
                ) : (
                  <Text c="dimmed">情報なし</Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* 子供情報 */}
        {(pedigree.fatherOf.length > 0 || pedigree.motherOf.length > 0) && (
          <Paper p="md" shadow="sm">
            <Title order={2} size="h3" mb="md">子供</Title>
            <Grid>
              {pedigree.fatherOf.length > 0 && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} mb="xs">父親として</Text>
                  <Stack gap="xs">
                    {pedigree.fatherOf.map((child) => (
                      <Card key={child.id} p="xs" style={{ border: '1px solid #dee2e6' }}>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>{child.catName}</Text>
                            <Text size="xs" c="dimmed">{child.pedigreeId}</Text>
                          </div>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => router.push(`/pedigrees/${child.id}`)}
                          >
                            詳細
                          </Button>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Grid.Col>
              )}
              
              {pedigree.motherOf.length > 0 && (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} mb="xs">母親として</Text>
                  <Stack gap="xs">
                    {pedigree.motherOf.map((child) => (
                      <Card key={child.id} p="xs" style={{ border: '1px solid #dee2e6' }}>
                        <Group justify="space-between">
                          <div>
                            <Text size="sm" fw={500}>{child.catName}</Text>
                            <Text size="xs" c="dimmed">{child.pedigreeId}</Text>
                          </div>
                          <Button
                            size="xs"
                            variant="light"
                            onClick={() => router.push(`/pedigrees/${child.id}`)}
                          >
                            詳細
                          </Button>
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </Grid.Col>
              )}
            </Grid>
          </Paper>
        )}

        {/* その他の情報 */}
        <Paper p="md" shadow="sm">
          <Title order={2} size="h3" mb="md">その他の情報</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Group>
                  <Text fw={600}>他団体No:</Text>
                  <Text>{pedigree.otherNo || '-'}</Text>
                </Group>
                <Group>
                  <Text fw={600}>旧コード:</Text>
                  <Text>{pedigree.oldCode || '-'}</Text>
                </Group>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <div>
                  <Text fw={600} mb="xs">摘要:</Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {pedigree.notes || '記載なし'}
                  </Text>
                </div>
                {pedigree.notes2 && (
                  <div>
                    <Text fw={600} mb="xs">摘要2:</Text>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {pedigree.notes2}
                    </Text>
                  </div>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}
```

## File: frontend/src/app/pedigrees/[id]/layout.tsx
```typescript
// Static export support - return empty array for dynamic routes
export function generateStaticParams() {
  return [];
}

export default function PedigreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

## File: frontend/src/app/pedigrees/[id]/page.tsx
```typescript
import PedigreeDetailClient from './client';

export default function PedigreeDetailPage() {
  return <PedigreeDetailClient />;
}
```

## File: backend/prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Tenant {
  id          String            @id @default(uuid())
  name        String
  slug        String            @unique
  isActive    Boolean           @default(true) @map("is_active")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")
  invitations InvitationToken[]
  settings    TenantSettings?
  users       User[]
  pedigreePrintSetting PedigreePrintSetting?

  @@index([slug])
  @@index([isActive])
  @@map("tenants")
}

model TenantSettings {
  id               String   @id @default(uuid())
  tenantId         String   @unique @map("tenant_id")
  tagColorDefaults Json?    @map("tag_color_defaults")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  tenant           Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("tenant_settings")
}

model InvitationToken {
  id        String    @id @default(uuid())
  email     String
  token     String    @unique
  role      UserRole
  tenantId  String    @map("tenant_id")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")
  tenant    Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([token])
  @@index([tenantId])
  @@index([expiresAt])
  @@map("invitation_tokens")
}

model User {
  id                   String             @id @default(uuid())
  clerkId              String             @unique @map("clerk_id")
  email                String             @unique
  firstName            String?            @map("first_name")
  lastName             String?            @map("last_name")
  role                 UserRole           @default(USER)
  isActive             Boolean            @default(true) @map("is_active")
  passwordHash         String?            @map("password_hash")
  refreshToken         String?            @map("refresh_token")
  failedLoginAttempts  Int                @default(0) @map("failed_login_attempts")
  lockedUntil          DateTime?          @map("locked_until")
  lastLoginAt          DateTime?          @map("last_login_at")
  createdAt            DateTime           @default(now()) @map("created_at")
  updatedAt            DateTime           @updatedAt @map("updated_at")
  resetPasswordExpires DateTime?          @map("reset_password_expires")
  resetPasswordToken   String?            @map("reset_password_token")
  tenantId             String?            @map("tenant_id")
  birthPlans           BirthPlan[]
  breedingRecords      BreedingRecord[]
  breedingSchedules    BreedingSchedule[]
  careRecords          CareRecord[]
  displayPreference    DisplayPreference?
  loginAttempts        LoginAttempt[]
  medicalRecords       MedicalRecord[]
  pregnancyChecks      PregnancyCheck[]
  schedules            Schedule[]
  staff                Staff?
  tenant               Tenant?            @relation(fields: [tenantId], references: [id])
  weightRecords        WeightRecord[]

  @@index([email])
  @@index([role])
  @@index([isActive])
  @@index([lastLoginAt])
  @@index([tenantId])
  @@index([role, isActive])
  @@index([isActive, lastLoginAt])
  @@index([tenantId, role])
  @@map("users")
}

model DisplayPreference {
  id                     String          @id @default(uuid())
  userId                 String          @unique @map("user_id")
  breedNameMode          DisplayNameMode @default(CANONICAL) @map("breed_name_mode")
  coatColorNameMode      DisplayNameMode @default(CANONICAL) @map("coat_color_name_mode")
  breedNameOverrides     Json?           @map("breed_name_overrides")
  coatColorNameOverrides Json?           @map("coat_color_name_overrides")
  createdAt              DateTime        @default(now()) @map("created_at")
  updatedAt              DateTime        @updatedAt @map("updated_at")
  user                   User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("display_preferences")
}

model LoginAttempt {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  email     String
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  success   Boolean
  reason    String?
  createdAt DateTime @default(now()) @map("created_at")
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([email])
  @@index([success])
  @@index([createdAt])
  @@index([email, createdAt])
  @@index([userId, createdAt])
  @@index([success, createdAt])
  @@map("login_attempts")
}

model Breed {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("breeds")
}

model CoatColor {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  cats        Cat[]
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("coat_colors")
}

model Gender {
  id          String     @id @default(uuid())
  code        Int        @unique
  name        String     @unique
  description String?
  isActive    Boolean    @default(true) @map("is_active")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  pedigrees   Pedigree[]

  @@index([code])
  @@index([name])
  @@map("genders")
}

model Cat {
  id                    String                 @id @default(uuid())
  registrationNumber    String?                @unique @map("registration_number")
  name                  String
  breedId               String?                @map("breed_id")
  birthDate             DateTime               @map("birth_date")
  description           String?                @map("notes")
  fatherId              String?                @map("father_id")
  motherId              String?                @map("mother_id")
  createdAt             DateTime               @default(now()) @map("created_at")
  updatedAt             DateTime               @updatedAt @map("updated_at")
  pedigreeId            String?                @map("pedigree_id")
  gender                String
  coatColorId           String?                @map("coat_color_id")
  isInHouse             Boolean                @default(true) @map("is_in_house")
  microchipNumber       String?                @unique @map("microchip_number")
  isGraduated           Boolean                @default(false) @map("is_graduated")
  birthPlans            BirthPlan[]            @relation("BirthPlanMother")
  femaleBreedingRecords BreedingRecord[]       @relation("FemaleBreeding")
  maleBreedingRecords   BreedingRecord[]       @relation("MaleBreeding")
  maleBreedingSchedules BreedingSchedule[]     @relation("BreedingScheduleMale")
  femaleBreedingSchedules BreedingSchedule[]   @relation("BreedingScheduleFemale")
  careRecords           CareRecord[]
  tags                  CatTag[]
  breed                 Breed?                 @relation(fields: [breedId], references: [id])
  coatColor             CoatColor?             @relation(fields: [coatColorId], references: [id])
  father                Cat?                   @relation("CatFather", fields: [fatherId], references: [id])
  fatherOf              Cat[]                  @relation("CatFather")
  mother                Cat?                   @relation("CatMother", fields: [motherId], references: [id])
  motherOf              Cat[]                  @relation("CatMother")
  pedigree              Pedigree?              @relation("CatPedigree", fields: [pedigreeId], references: [pedigreeId])
  galleryEntries        GalleryEntry[]         @relation("GalleryEntryCat")
  graduation            Graduation?
  kittenDispositions    KittenDisposition[]
  medicalRecords        MedicalRecord[]
  pregnancyChecks       PregnancyCheck[]       @relation("PregnancyCheckMother")
  scheduleCats          ScheduleCat[]
  schedules             Schedule[]
  tagHistory            TagAssignmentHistory[]
  weightRecords         WeightRecord[]

  @@index([breedId])
  @@index([coatColorId])
  @@index([fatherId])
  @@index([motherId])
  @@index([birthDate])
  @@index([name])
  @@index([gender])
  @@index([isInHouse])
  @@index([isGraduated])
  @@index([registrationNumber])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedId, name])
  @@index([isInHouse, isGraduated])
  @@index([birthDate, gender])
  @@map("cats")
}

model BreedingRecord {
  id              String         @id @default(uuid())
  maleId          String         @map("male_id")
  femaleId        String         @map("female_id")
  breedingDate    DateTime       @map("breeding_date")
  expectedDueDate DateTime?      @map("expected_due_date")
  actualDueDate   DateTime?      @map("actual_due_date")
  numberOfKittens Int?           @map("number_of_kittens")
  notes           String?
  status          BreedingStatus @default(PLANNED)
  recordedBy      String         @map("recorded_by")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  female          Cat            @relation("FemaleBreeding", fields: [femaleId], references: [id])
  male            Cat            @relation("MaleBreeding", fields: [maleId], references: [id])
  recorder        User           @relation(fields: [recordedBy], references: [id])

  @@index([maleId])
  @@index([femaleId])
  @@index([breedingDate])
  @@index([status])
  @@index([recordedBy])
  @@index([maleId, femaleId])
  @@index([maleId, breedingDate])
  @@index([femaleId, breedingDate])
  @@index([breedingDate, status])
  @@map("breeding_records")
}

model BreedingNgRule {
  id               String             @id @default(uuid())
  name             String
  description      String?
  type             BreedingNgRuleType @default(TAG_COMBINATION)
  maleConditions   String[]           @default([]) @map("male_conditions")
  femaleConditions String[]           @default([]) @map("female_conditions")
  maleNames        String[]           @default([]) @map("male_names")
  femaleNames      String[]           @default([]) @map("female_names")
  generationLimit  Int?               @map("generation_limit")
  active           Boolean            @default(true)
  createdAt        DateTime           @default(now()) @map("created_at")
  updatedAt        DateTime           @updatedAt @map("updated_at")

  @@map("breeding_ng_rules")
}

// 交配スケジュール - 交配期間の管理
model BreedingSchedule {
  id         String                  @id @default(uuid())
  maleId     String                  @map("male_id")
  femaleId   String                  @map("female_id")
  startDate  DateTime                @map("start_date")
  duration   Int                     // 日数
  status     BreedingScheduleStatus  @default(SCHEDULED)
  notes      String?
  recordedBy String                  @map("recorded_by")
  createdAt  DateTime                @default(now()) @map("created_at")
  updatedAt  DateTime                @updatedAt @map("updated_at")

  male       Cat                     @relation("BreedingScheduleMale", fields: [maleId], references: [id])
  female     Cat                     @relation("BreedingScheduleFemale", fields: [femaleId], references: [id])
  recorder   User                    @relation(fields: [recordedBy], references: [id])
  checks     MatingCheck[]

  @@index([maleId])
  @@index([femaleId])
  @@index([startDate])
  @@index([status])
  @@index([maleId, startDate])
  @@index([femaleId, startDate])
  @@map("breeding_schedules")
}

// 交配チェック - 交配確認回数の記録
model MatingCheck {
  id         String           @id @default(uuid())
  scheduleId String           @map("schedule_id")
  checkDate  DateTime         @map("check_date")
  count      Int              @default(1)
  createdAt  DateTime         @default(now()) @map("created_at")

  schedule   BreedingSchedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@index([checkDate])
  @@map("mating_checks")
}

enum BreedingScheduleStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model PregnancyCheck {
  id         String          @id @default(uuid())
  checkDate  DateTime        @map("check_date")
  status     PregnancyStatus @default(SUSPECTED)
  notes      String?
  recordedBy String          @map("recorded_by")
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")
  motherId   String          @map("mother_id")
  fatherId   String?         @map("father_id")
  matingDate DateTime?       @map("mating_date")
  mother     Cat             @relation("PregnancyCheckMother", fields: [motherId], references: [id])
  recorder   User            @relation(fields: [recordedBy], references: [id])

  @@index([motherId])
  @@index([fatherId])
  @@index([checkDate])
  @@index([status])
  @@index([recordedBy])
  @@index([motherId, checkDate])
  @@index([status, checkDate])
  @@map("pregnancy_checks")
}

model BirthPlan {
  id                 String              @id @default(uuid())
  status             BirthStatus         @default(EXPECTED)
  notes              String?
  recordedBy         String              @map("recorded_by")
  createdAt          DateTime            @default(now()) @map("created_at")
  updatedAt          DateTime            @updatedAt @map("updated_at")
  actualBirthDate    DateTime?           @map("actual_birth_date")
  actualKittens      Int?                @map("actual_kittens")
  expectedBirthDate  DateTime            @map("expected_birth_date")
  expectedKittens    Int?                @map("expected_kittens")
  motherId           String              @map("mother_id")
  fatherId           String?             @map("father_id")
  matingDate         DateTime?           @map("mating_date")
  completedAt        DateTime?           @map("completed_at")
  mother             Cat                 @relation("BirthPlanMother", fields: [motherId], references: [id])
  recorder           User                @relation(fields: [recordedBy], references: [id])
  kittenDispositions KittenDisposition[]

  @@index([motherId])
  @@index([fatherId])
  @@index([expectedBirthDate])
  @@index([status])
  @@index([recordedBy])
  @@index([actualBirthDate])
  @@index([motherId, expectedBirthDate])
  @@index([status, expectedBirthDate])
  @@index([expectedBirthDate, status])
  @@map("birth_plans")
}

model KittenDisposition {
  id                String          @id @default(uuid())
  birthRecordId     String          @map("birth_record_id")
  kittenId          String?         @map("kitten_id")
  name              String
  gender            String
  disposition       DispositionType
  trainingStartDate DateTime?       @map("training_start_date")
  saleInfo          Json?           @map("sale_info")
  deathDate         DateTime?       @map("death_date")
  deathReason       String?         @map("death_reason")
  notes             String?
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt @map("updated_at")
  birthRecord       BirthPlan       @relation(fields: [birthRecordId], references: [id], onDelete: Cascade)
  kitten            Cat?            @relation(fields: [kittenId], references: [id])

  @@index([birthRecordId])
  @@index([kittenId])
  @@map("kitten_dispositions")
}

model CareRecord {
  id           String    @id @default(uuid())
  catId        String    @map("cat_id")
  careType     CareType  @map("care_type")
  description  String
  careDate     DateTime  @map("care_date")
  nextDueDate  DateTime? @map("next_due_date")
  cost         Float?
  veterinarian String?
  notes        String?
  recordedBy   String    @map("recorded_by")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  cat          Cat       @relation(fields: [catId], references: [id])
  recorder     User      @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([careDate])
  @@index([careType])
  @@index([recordedBy])
  @@index([nextDueDate])
  @@index([catId, careDate])
  @@index([catId, careType])
  @@index([careType, careDate])
  @@index([nextDueDate, careType])
  @@map("care_records")
}

// 体重記録モデル - 子猫の体重推移を追跡
model WeightRecord {
  id         String   @id @default(uuid())
  catId      String   @map("cat_id")
  weight     Float    // グラム単位
  recordedAt DateTime @default(now()) @map("recorded_at")
  notes      String?
  recordedBy String   @map("recorded_by")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  recorder   User     @relation(fields: [recordedBy], references: [id])

  @@index([catId])
  @@index([recordedAt])
  @@index([catId, recordedAt])
  @@map("weight_records")
}

model Schedule {
  id             String             @id @default(uuid())
  title          String
  description    String?
  scheduleDate   DateTime           @map("schedule_date")
  scheduleType   ScheduleType       @map("schedule_type")
  status         ScheduleStatus     @default(PENDING)
  priority       Priority           @default(MEDIUM)
  catId          String?            @map("cat_id")
  assignedTo     String             @map("assigned_to")
  createdAt      DateTime           @default(now()) @map("created_at")
  updatedAt      DateTime           @updatedAt @map("updated_at")
  careType       CareType?          @map("care_type")
  endDate        DateTime?          @map("end_date")
  name           String             @map("name")
  recurrenceRule String?            @map("recurrence_rule")
  timezone       String?            @map("timezone")
  medicalRecords MedicalRecord[]
  scheduleCats   ScheduleCat[]
  reminders      ScheduleReminder[]
  tags           ScheduleTag[]
  assignee       User               @relation(fields: [assignedTo], references: [id])
  cat            Cat?               @relation(fields: [catId], references: [id])

  @@index([scheduleDate])
  @@index([endDate])
  @@index([status])
  @@index([catId])
  @@index([assignedTo])
  @@index([careType])
  @@index([scheduleType])
  @@index([priority])
  @@index([scheduleDate, status])
  @@index([catId, scheduleDate])
  @@index([assignedTo, scheduleDate])
  @@index([scheduleType, scheduleDate])
  @@index([status, priority])
  @@map("schedules")
}

model ScheduleReminder {
  id              String                   @id @default(uuid())
  scheduleId      String                   @map("schedule_id")
  timingType      ReminderTimingType       @map("timing_type")
  remindAt        DateTime?                @map("remind_at")
  offsetValue     Int?                     @map("offset_value")
  offsetUnit      ReminderOffsetUnit?      @map("offset_unit")
  relativeTo      ReminderRelativeTo?      @map("relative_to")
  channel         ReminderChannel          @map("channel")
  repeatFrequency ReminderRepeatFrequency? @map("repeat_frequency")
  repeatInterval  Int?                     @map("repeat_interval")
  repeatCount     Int?                     @map("repeat_count")
  repeatUntil     DateTime?                @map("repeat_until")
  notes           String?
  isActive        Boolean                  @default(true) @map("is_active")
  createdAt       DateTime                 @default(now()) @map("created_at")
  updatedAt       DateTime                 @updatedAt @map("updated_at")
  schedule        Schedule                 @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@index([scheduleId])
  @@map("schedule_reminders")
}

model CareTag {
  id           String        @id @default(uuid())
  slug         String        @unique
  label        String
  level        Int           @default(1)
  parentId     String?       @map("parent_id")
  description  String?
  isActive     Boolean       @default(true) @map("is_active")
  priority     Int?
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")
  parent       CareTag?      @relation("CareTagHierarchy", fields: [parentId], references: [id])
  children     CareTag[]     @relation("CareTagHierarchy")
  scheduleTags ScheduleTag[]

  @@index([parentId])
  @@index([level])
  @@map("care_tags")
}

model ScheduleTag {
  scheduleId String   @map("schedule_id")
  careTagId  String   @map("care_tag_id")
  createdAt  DateTime @default(now()) @map("created_at")
  careTag    CareTag  @relation(fields: [careTagId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, careTagId])
  @@map("schedule_tags")
}

model ScheduleCat {
  scheduleId String   @map("schedule_id")
  catId      String   @map("cat_id")
  createdAt  DateTime @default(now()) @map("created_at")
  cat        Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  schedule   Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)

  @@id([scheduleId, catId])
  @@map("schedule_cats")
}

model MedicalVisitType {
  id           String          @id @default(uuid())
  key          String?         @unique
  name         String
  description  String?
  displayOrder Int             @default(0) @map("display_order")
  isActive     Boolean         @default(true) @map("is_active")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  records      MedicalRecord[]

  @@index([displayOrder])
  @@map("medical_visit_types")
}

model MedicalRecord {
  id             String                    @id @default(uuid())
  catId          String                    @map("cat_id")
  scheduleId     String?                   @map("schedule_id")
  recordedBy     String                    @map("recorded_by")
  visitDate      DateTime                  @map("visit_date")
  symptomDetails Json?                     @map("symptom_details")
  diagnosis      String?                   @map("diagnosis")
  treatmentPlan  String?                   @map("treatment_plan")
  medications    Json?                     @map("medications")
  followUpDate   DateTime?                 @map("follow_up_date")
  status         MedicalRecordStatus       @default(TREATING)
  notes          String?
  createdAt      DateTime                  @default(now()) @map("created_at")
  updatedAt      DateTime                  @updatedAt @map("updated_at")
  diseaseName    String?                   @map("disease_name")
  symptom        String?                   @map("symptom")
  hospitalName   String?                   @map("hospital_name")
  visitTypeId    String?                   @map("visit_type_id")
  attachments    MedicalRecordAttachment[]
  tags           MedicalRecordTag[]
  cat            Cat                       @relation(fields: [catId], references: [id])
  recorder       User                      @relation(fields: [recordedBy], references: [id])
  schedule       Schedule?                 @relation(fields: [scheduleId], references: [id])
  visitType      MedicalVisitType?         @relation(fields: [visitTypeId], references: [id])

  @@index([catId])
  @@index([visitDate])
  @@index([scheduleId])
  @@index([visitTypeId])
  @@index([status])
  @@index([recordedBy])
  @@index([catId, visitDate])
  @@index([visitTypeId, visitDate])
  @@index([status, visitDate])
  @@map("medical_records")
}

model MedicalRecordAttachment {
  id              String        @id @default(uuid())
  medicalRecordId String        @map("medical_record_id")
  url             String
  fileName        String?       @map("file_name")
  fileType        String?       @map("file_type")
  fileSize        Int?          @map("file_size")
  capturedAt      DateTime?     @map("captured_at")
  description     String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)

  @@index([medicalRecordId])
  @@map("medical_record_attachments")
}

model MedicalRecordTag {
  medicalRecordId String        @map("medical_record_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  tagId           String        @map("tag_id")
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  tag             Tag           @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([medicalRecordId, tagId])
  @@map("medical_record_tags")
}

model TagCategory {
  id           String     @id @default(uuid())
  key          String     @unique
  name         String
  description  String?
  color        String?    @default("#3B82F6")
  displayOrder Int        @default(0) @map("display_order")
  scopes       String[]   @default([])
  isActive     Boolean    @default(true) @map("is_active")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  textColor    String?    @default("#111827") @map("text_color")
  groups       TagGroup[]

  @@map("tag_categories")
}

model TagGroup {
  id           String      @id @default(uuid())
  categoryId   String      @map("category_id")
  name         String
  description  String?
  displayOrder Int         @default(0) @map("display_order")
  isActive     Boolean     @default(true) @map("is_active")
  createdAt    DateTime    @default(now()) @map("created_at")
  updatedAt    DateTime    @updatedAt @map("updated_at")
  color        String?     @default("#3B82F6")
  textColor    String?     @default("#111827") @map("text_color")
  category     TagCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  tags         Tag[]

  @@unique([categoryId, name])
  @@map("tag_groups")
}

model Tag {
  id                String                 @id @default(uuid())
  name              String
  color             String                 @default("#3B82F6")
  description       String?
  createdAt         DateTime               @default(now()) @map("created_at")
  updatedAt         DateTime               @updatedAt @map("updated_at")
  displayOrder      Int                    @default(0) @map("display_order")
  allowsManual      Boolean                @default(true) @map("allows_manual")
  allowsAutomation  Boolean                @default(true) @map("allows_automation")
  metadata          Json?
  isActive          Boolean                @default(true) @map("is_active")
  groupId           String                 @map("group_id")
  textColor         String                 @default("#FFFFFF") @map("text_color")
  cats              CatTag[]
  medicalRecordTags MedicalRecordTag[]
  history           TagAssignmentHistory[]
  group             TagGroup               @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@unique([groupId, name])
  @@index([groupId])
  @@map("tags")
}

model Pedigree {
  id               String     @id @default(uuid())
  pedigreeId       String     @unique @map("pedigree_id")
  title            String?    @map("title")
  catName          String?    @map("cat_name")
  catName2         String?    @map("cat_name2")
  breedCode        Int?       @map("breed_code")
  genderCode       Int?       @map("gender_code")
  eyeColor         String?    @map("eye_color")
  coatColorCode    Int?       @map("coat_color_code")
  birthDate        String?    @map("birth_date")
  breederName      String?    @map("breeder_name")
  ownerName        String?    @map("owner_name")
  registrationDate String?    @map("registration_date")
  brotherCount     Int?       @map("brother_count")
  sisterCount      Int?       @map("sister_count")
  notes            String?    @map("notes")
  notes2           String?    @map("notes2")
  otherNo          String?    @map("other_no")
  fatherTitle      String?    @map("father_title")
  fatherCatName    String?    @map("father_cat_name")
  fatherCatName2   String?    @map("father_cat_name2")
  fatherCoatColor  String?    @map("father_coat_color")
  fatherEyeColor   String?    @map("father_eye_color")
  fatherJCU        String?    @map("father_jcu")
  fatherOtherCode  String?    @map("father_other_code")
  motherTitle      String?    @map("mother_title")
  motherCatName    String?    @map("mother_cat_name")
  motherCatName2   String?    @map("mother_cat_name2")
  motherCoatColor  String?    @map("mother_coat_color")
  motherEyeColor   String?    @map("mother_eye_color")
  motherJCU        String?    @map("mother_jcu")
  motherOtherCode  String?    @map("mother_other_code")
  ffTitle          String?    @map("ff_title")
  ffCatName        String?    @map("ff_cat_name")
  ffCatColor       String?    @map("ff_cat_color")
  fmTitle          String?    @map("fm_title")
  fmCatName        String?    @map("fm_cat_name")
  fmCatColor       String?    @map("fm_cat_color")
  mfTitle          String?    @map("mf_title")
  mfCatName        String?    @map("mf_cat_name")
  mfCatColor       String?    @map("mf_cat_color")
  mmTitle          String?    @map("mm_title")
  mmCatName        String?    @map("mm_cat_name")
  mmCatColor       String?    @map("mm_cat_color")
  fffTitle         String?    @map("fff_title")
  fffCatName       String?    @map("fff_cat_name")
  fffCatColor      String?    @map("fff_cat_color")
  ffmTitle         String?    @map("ffm_title")
  ffmCatName       String?    @map("ffm_cat_name")
  ffmCatColor      String?    @map("ffm_cat_color")
  fmfTitle         String?    @map("fmf_title")
  fmfCatName       String?    @map("fmf_cat_name")
  fmfCatColor      String?    @map("fmf_cat_color")
  fmmTitle         String?    @map("fmm_title")
  fmmCatName       String?    @map("fmm_cat_name")
  fmmCatColor      String?    @map("fmm_cat_color")
  mffTitle         String?    @map("mff_title")
  mffCatName       String?    @map("mff_cat_name")
  mffCatColor      String?    @map("mff_cat_color")
  mfmTitle         String?    @map("mfm_title")
  mfmCatName       String?    @map("mfm_cat_name")
  mfmCatColor      String?    @map("mfm_cat_color")
  mmfTitle         String?    @map("mmf_title")
  mmfCatName       String?    @map("mmf_cat_name")
  mmfCatColor      String?    @map("mmf_cat_color")
  mmmTitle         String?    @map("mmm_title")
  mmmCatName       String?    @map("mmm_cat_name")
  mmmCatColor      String?    @map("mmm_cat_color")
  oldCode          String?    @map("old_code")
  createdAt        DateTime   @default(now()) @map("created_at")
  updatedAt        DateTime   @updatedAt @map("updated_at")
  fffjcu           String?    @map("fffjcu")
  ffjcu            String?    @map("ffjcu")
  ffmjcu           String?    @map("ffmjcu")
  fmfjcu           String?    @map("fmfjcu")
  fmjcu            String?    @map("fmjcu")
  fmmjcu           String?    @map("fmmjcu")
  mffjcu           String?    @map("mffjcu")
  mfjcu            String?    @map("mfjcu")
  mfmjcu           String?    @map("mfmjcu")
  mmfjcu           String?    @map("mmfjcu")
  mmjcu            String?    @map("mmjcu")
  mmmjcu           String?    @map("mmmjcu")
  cats             Cat[]      @relation("CatPedigree")
  breed            Breed?     @relation(fields: [breedCode], references: [code])
  coatColor        CoatColor? @relation(fields: [coatColorCode], references: [code])
  gender           Gender?    @relation(fields: [genderCode], references: [code])

  @@index([breedCode])
  @@index([genderCode])
  @@index([coatColorCode])
  @@index([catName])
  @@index([pedigreeId])
  @@index([catName2])
  @@index([eyeColor])
  @@index([breederName])
  @@index([ownerName])
  @@index([birthDate])
  @@index([registrationDate])
  @@index([createdAt])
  @@index([updatedAt])
  @@index([breedCode, catName])
  @@map("pedigrees")
}

model CatTag {
  catId     String   @map("cat_id")
  tagId     String   @map("tag_id")
  createdAt DateTime @default(now()) @map("created_at")
  cat       Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([catId, tagId])
  @@map("cat_tags")
}

model TagAutomationRule {
  id          String                   @id @default(uuid())
  key         String                   @unique
  name        String
  description String?
  triggerType TagAutomationTriggerType @map("trigger_type")
  eventType   TagAutomationEventType   @map("event_type")
  scope       String?                  @map("scope")
  isActive    Boolean                  @default(true) @map("is_active")
  priority    Int                      @default(0)
  config      Json?                    @map("config")
  createdAt   DateTime                 @default(now()) @map("created_at")
  updatedAt   DateTime                 @updatedAt @map("updated_at")
  history     TagAssignmentHistory[]
  runs        TagAutomationRun[]

  @@map("tag_automation_rules")
}

model TagAutomationRun {
  id           String                 @id @default(uuid())
  ruleId       String                 @map("rule_id")
  eventPayload Json?                  @map("event_payload")
  status       TagAutomationRunStatus @default(PENDING) @map("status")
  startedAt    DateTime?              @map("started_at")
  completedAt  DateTime?              @map("completed_at")
  errorMessage String?                @map("error_message")
  createdAt    DateTime               @default(now()) @map("created_at")
  updatedAt    DateTime               @updatedAt @map("updated_at")
  history      TagAssignmentHistory[]
  rule         TagAutomationRule      @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@index([ruleId])
  @@map("tag_automation_runs")
}

model TagAssignmentHistory {
  id              String              @id @default(uuid())
  catId           String              @map("cat_id")
  tagId           String              @map("tag_id")
  ruleId          String?             @map("rule_id")
  automationRunId String?             @map("automation_run_id")
  action          TagAssignmentAction @default(ASSIGNED)
  source          TagAssignmentSource @default(MANUAL)
  reason          String?
  metadata        Json?
  createdAt       DateTime            @default(now()) @map("created_at")
  automationRun   TagAutomationRun?   @relation(fields: [automationRunId], references: [id])
  cat             Cat                 @relation(fields: [catId], references: [id], onDelete: Cascade)
  rule            TagAutomationRule?  @relation(fields: [ruleId], references: [id])
  tag             Tag                 @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@index([catId])
  @@index([tagId])
  @@index([ruleId])
  @@index([automationRunId])
  @@map("tag_assignment_history")
}

model Staff {
  id               String              @id @default(uuid())
  userId           String?             @unique @map("user_id")
  name             String
  email            String?             @unique
  role             String              @default("スタッフ")
  color            String              @default("#4dabf7")
  isActive         Boolean             @default(true) @map("is_active")
  createdAt        DateTime            @default(now()) @map("created_at")
  updatedAt        DateTime            @updatedAt @map("updated_at")
  workTimeTemplate Json?               @map("work_time_template")
  workingDays      Json?               @map("working_days")
  shifts           Shift[]
  user             User?               @relation(fields: [userId], references: [id])
  availabilities   StaffAvailability[]

  @@index([userId])
  @@index([name])
  @@index([email])
  @@index([isActive])
  @@index([isActive, role])
  @@map("staff")
}

model ShiftTemplate {
  id           String   @id @default(uuid())
  name         String
  startTime    String   @map("start_time")
  endTime      String   @map("end_time")
  duration     Int
  color        String   @default("#4dabf7")
  breakTime    Int      @default(0) @map("break_time")
  isActive     Boolean  @default(true) @map("is_active")
  displayOrder Int      @default(0) @map("display_order")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  shifts       Shift[]

  @@index([name])
  @@index([displayOrder])
  @@map("shift_templates")
}

model Shift {
  id              String         @id @default(uuid())
  staffId         String         @map("staff_id")
  shiftDate       DateTime       @map("shift_date")
  displayName     String?        @map("display_name")
  templateId      String?        @map("template_id")
  startTime       DateTime?      @map("start_time")
  endTime         DateTime?      @map("end_time")
  breakDuration   Int?           @map("break_duration")
  status          ShiftStatus    @default(SCHEDULED)
  notes           String?
  actualStartTime DateTime?      @map("actual_start_time")
  actualEndTime   DateTime?      @map("actual_end_time")
  metadata        Json?
  mode            ShiftMode      @default(SIMPLE)
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")
  tasks           ShiftTask[]
  staff           Staff          @relation(fields: [staffId], references: [id], onDelete: Cascade)
  template        ShiftTemplate? @relation(fields: [templateId], references: [id])

  @@index([staffId])
  @@index([templateId])
  @@index([shiftDate])
  @@index([status])
  @@index([mode])
  @@index([staffId, shiftDate])
  @@index([shiftDate, status])
  @@index([status, shiftDate])
  @@map("shifts")
}

model ShiftTask {
  id          String     @id @default(uuid())
  shiftId     String     @map("shift_id")
  taskType    String     @map("task_type")
  description String
  priority    Priority   @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  startTime   DateTime?  @map("start_time")
  endTime     DateTime?  @map("end_time")
  notes       String?
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  shift       Shift      @relation(fields: [shiftId], references: [id], onDelete: Cascade)

  @@index([shiftId])
  @@index([status])
  @@map("shift_tasks")
}

model StaffAvailability {
  id          String   @id @default(uuid())
  staffId     String   @map("staff_id")
  dayOfWeek   Int      @map("day_of_week")
  startTime   String   @map("start_time")
  endTime     String   @map("end_time")
  isAvailable Boolean  @default(true) @map("is_available")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  staff       Staff    @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
  @@index([dayOfWeek])
  @@index([isAvailable])
  @@index([staffId, dayOfWeek])
  @@index([dayOfWeek, isAvailable])
  @@map("staff_availabilities")
}

model ShiftSettings {
  id                       String    @id @default(uuid())
  organizationId           String?   @map("organization_id")
  defaultMode              ShiftMode @default(SIMPLE) @map("default_mode")
  enabledModes             String[]  @default(["SIMPLE", "DETAILED"]) @map("enabled_modes")
  simpleRequireDisplayName Boolean   @default(false) @map("simple_require_display_name")
  detailedRequireTime      Boolean   @default(true) @map("detailed_require_time")
  detailedRequireTemplate  Boolean   @default(false) @map("detailed_require_template")
  detailedEnableTasks      Boolean   @default(true) @map("detailed_enable_tasks")
  detailedEnableActual     Boolean   @default(true) @map("detailed_enable_actual")
  customFields             Json?     @map("custom_fields")
  createdAt                DateTime  @default(now()) @map("created_at")
  updatedAt                DateTime  @updatedAt @map("updated_at")

  @@map("shift_settings")
}

model Graduation {
  id            String   @id @default(uuid())
  catId         String   @unique @map("cat_id")
  transferDate  DateTime @map("transfer_date")
  destination   String
  notes         String?
  catSnapshot   Json     @map("cat_snapshot")
  transferredBy String?  @map("transferred_by")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
  cat           Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)

  @@index([transferDate])
  @@index([catId])
  @@map("graduations")
}

model GalleryEntry {
  id            String          @id @default(uuid())
  category      GalleryCategory
  name          String
  gender        String
  coatColor     String?         @map("coat_color")
  breed         String?
  catId         String?         @map("cat_id")
  transferDate  DateTime?       @map("transfer_date")
  destination   String?
  externalLink  String?         @map("external_link")
  transferredBy String?         @map("transferred_by")
  catSnapshot   Json?           @map("cat_snapshot")
  notes         String?
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  cat           Cat?            @relation("GalleryEntryCat", fields: [catId], references: [id])
  media         GalleryMedia[]

  @@index([category])
  @@index([catId])
  @@index([createdAt])
  @@index([category, createdAt])
  @@map("gallery_entries")
}

model GalleryMedia {
  id             String       @id @default(uuid())
  galleryEntryId String       @map("gallery_entry_id")
  type           MediaType
  url            String
  thumbnailUrl   String?      @map("thumbnail_url")
  order          Int          @default(0)
  createdAt      DateTime     @default(now()) @map("created_at")
  galleryEntry   GalleryEntry @relation(fields: [galleryEntryId], references: [id], onDelete: Cascade)

  @@index([galleryEntryId])
  @@index([order])
  @@map("gallery_media")
}

// ==========================================
// Pedigree Print Settings
// ==========================================

model PedigreePrintSetting {
  id        String   @id @default(uuid())
  tenantId  String?  @map("tenant_id")
  globalKey String?  @unique @map("global_key")
  settings  Json
  version   Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  tenant    Tenant?  @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId])
  @@map("pedigree_print_settings")
}

// ==========================================
// Print Template Management
// ==========================================

model PrintTemplate {
  id                String                @id @default(uuid())
  tenantId          String?               @map("tenant_id") // null = 共通テンプレート
  name              String
  description       String?
  category          PrintTemplateCategory @default(PEDIGREE)
  paperWidth        Int                   @map("paper_width")    // mm単位
  paperHeight       Int                   @map("paper_height")   // mm単位
  backgroundUrl     String?               @map("background_url")
  backgroundOpacity Int                   @default(100) @map("background_opacity") // 0-100%
  positions         Json                  // フィールド座標設定
  fontSizes         Json?                 @map("font_sizes")     // フォントサイズ設定
  isActive          Boolean               @default(true) @map("is_active")
  isDefault         Boolean               @default(false) @map("is_default")
  displayOrder      Int                   @default(0) @map("display_order")
  createdAt         DateTime              @default(now()) @map("created_at")
  updatedAt         DateTime              @updatedAt @map("updated_at")

  @@index([tenantId])
  @@index([category])
  @@index([isActive])
  @@index([name])
  @@index([tenantId, category, isActive])
  @@map("print_templates")
}

enum PrintTemplateCategory {
  PEDIGREE           // 血統書
  KITTEN_TRANSFER    // 子猫譲渡証明書
  HEALTH_CERTIFICATE // 健康診断書
  VACCINATION_RECORD // ワクチン接種記録
  BREEDING_RECORD    // 繁殖記録
  CONTRACT           // 契約書
  INVOICE            // 請求書/領収書
  CUSTOM             // カスタム書類
}

enum DisplayNameMode {
  CANONICAL
  CODE_AND_NAME
  CUSTOM
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
  TENANT_ADMIN
}

enum BreedingStatus {
  PLANNED
  IN_PROGRESS
  COMPLETED
  FAILED
}

enum PregnancyStatus {
  CONFIRMED
  SUSPECTED
  NEGATIVE
  ABORTED
}

enum BirthStatus {
  EXPECTED
  BORN
  ABORTED
  STILLBORN
}

enum DispositionType {
  TRAINING
  SALE
  DECEASED
}

enum BreedingNgRuleType {
  TAG_COMBINATION
  INDIVIDUAL_PROHIBITION
  GENERATION_LIMIT
}

enum CareType {
  VACCINATION
  HEALTH_CHECK
  GROOMING
  DENTAL_CARE
  MEDICATION
  SURGERY
  OTHER
}

enum ScheduleType {
  BREEDING
  CARE
  APPOINTMENT
  REMINDER
  MAINTENANCE
}

enum ScheduleStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ReminderTimingType {
  ABSOLUTE
  RELATIVE
}

enum ReminderOffsetUnit {
  MINUTE
  HOUR
  DAY
  WEEK
  MONTH
}

enum ReminderRelativeTo {
  START_DATE
  END_DATE
  CUSTOM_DATE
}

enum ReminderChannel {
  IN_APP
  EMAIL
  SMS
  PUSH
}

enum ReminderRepeatFrequency {
  NONE
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
  CUSTOM
}

enum MedicalRecordStatus {
  TREATING
  COMPLETED
}

enum TagAssignmentAction {
  ASSIGNED
  UNASSIGNED
}

enum TagAssignmentSource {
  MANUAL
  AUTOMATION
  SYSTEM
}

enum TagAutomationTriggerType {
  EVENT
  SCHEDULE
  MANUAL
}

enum TagAutomationEventType {
  BREEDING_PLANNED
  BREEDING_CONFIRMED
  PREGNANCY_CONFIRMED
  KITTEN_REGISTERED
  AGE_THRESHOLD
  CUSTOM
  PAGE_ACTION
  TAG_ASSIGNED
}

enum TagAutomationRunStatus {
  PENDING
  COMPLETED
  FAILED
}

enum ShiftMode {
  SIMPLE
  DETAILED
  CUSTOM
}

enum ShiftStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  ABSENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}

enum GalleryCategory {
  KITTEN
  FATHER
  MOTHER
  GRADUATION
}

enum MediaType {
  IMAGE
  YOUTUBE
}
```

## File: frontend/src/app/pedigrees/page.tsx
```typescript
'use client';

import { Container, Tabs } from '@mantine/core';
import { PedigreeRegistrationForm } from '@/components/pedigrees/PedigreeRegistrationForm';
import { PedigreeList } from '@/components/pedigrees/PedigreeList';
import { PedigreeFamilyTree } from '@/components/pedigrees/PedigreeFamilyTree';
import { PrintSettingsEditor } from '@/components/pedigrees/PrintSettingsEditor';
import { IconPlus, IconList, IconBinaryTree, IconSettings } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function PedigreesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'register';
  const treeIdParam = searchParams.get('id');
  const [selectedFamilyTreeId, setSelectedFamilyTreeId] = useState<string | null>(null);
  const { setPageTitle } = usePageHeader();

  useEffect(() => {
    setPageTitle('血統書管理');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  const handleFamilyTreeSelect = (id: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'tree');
    nextParams.set('id', id);
    nextParams.delete('copyFromId');
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);

    if (nextTab !== 'tree') {
      nextParams.delete('id');
    }

    if (nextTab !== 'register') {
      nextParams.delete('copyFromId');
    }

    router.push(`${pathname}?${nextParams.toString()}`);
  };

  useEffect(() => {
    if (tabParam === 'tree' && treeIdParam) {
      setSelectedFamilyTreeId(treeIdParam);
    }
  }, [tabParam, treeIdParam]);

  return (
    <Container size="xl" py="md">
      <Tabs value={tabParam} onChange={handleTabChange} mt="md">
        <Tabs.List grow>
          <Tabs.Tab value="register" leftSection={<IconPlus size={14} />}>
            作成
          </Tabs.Tab>
          <Tabs.Tab value="list" leftSection={<IconList size={14} />}>
            データ管理
          </Tabs.Tab>
          <Tabs.Tab value="tree" leftSection={<IconBinaryTree size={14} />}>
            Family Tree
          </Tabs.Tab>
          <Tabs.Tab value="print-settings" leftSection={<IconSettings size={14} />}>
            印刷設定
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="register" pt="md">
          <PedigreeRegistrationForm onSuccess={() => handleTabChange('list')} />
        </Tabs.Panel>

        <Tabs.Panel value="list" pt="md">
          <PedigreeList onSelectFamilyTree={handleFamilyTreeSelect} />
        </Tabs.Panel>

        <Tabs.Panel value="tree" pt="md">
          <PedigreeFamilyTree pedigreeId={selectedFamilyTreeId} />
        </Tabs.Panel>

        <Tabs.Panel value="print-settings" pt="md">
          <PrintSettingsEditor />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
```
