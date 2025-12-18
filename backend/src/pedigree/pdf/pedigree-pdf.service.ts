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
   * JSONファイルから座標設定を読み込む（毎回読み込み、キャッシュなし）
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
