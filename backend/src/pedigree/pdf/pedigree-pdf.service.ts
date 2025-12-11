import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PdfPrinter = require('pdfmake');
import type { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';

/**
 * 血統書PDF生成サービス
 * WCA（World Cats Association）公式フォーマットでPDFを生成
 */
@Injectable()
export class PedigreePdfService {
  private printer: PdfPrinter;

  constructor(private readonly prisma: PrismaService) {
    // フォント設定（Phase 1: デフォルトフォント使用）
    const fonts: TFontDictionary = {
      Roboto: {
        normal: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
        italics: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64'),
      },
    };

    this.printer = new PdfPrinter(fonts);
  }

  /**
   * 血統書IDからPDFを生成
   * @param pedigreeId 血統書ID
   * @returns PDFバッファ
   */
  async generatePdf(
    pedigreeId: string,
  ): Promise<Buffer> {
    // 血統書データを取得
    const pedigree = await this.prisma.pedigree.findFirst({
      where: {
        pedigreeId,
      },
    });

    if (!pedigree) {
      throw new NotFoundException(
        `Pedigree with ID ${pedigreeId} not found`,
      );
    }

    // マスタデータを取得
    let breedName = '';
    let genderName = '';
    let coatColorName = '';

    if (pedigree.breedCode) {
      const breed = await this.prisma.breed.findFirst({
        where: { code: pedigree.breedCode },
      });
      breedName = breed?.name || '';
    }

    if (pedigree.genderCode) {
      const gender = await this.prisma.gender.findFirst({
        where: { code: pedigree.genderCode },
      });
      genderName = gender?.name || '';
    }

    if (pedigree.coatColorCode) {
      const coatColor = await this.prisma.coatColor.findFirst({
        where: { code: pedigree.coatColorCode },
      });
      coatColorName = coatColor?.name || '';
    }

    // PDFドキュメント定義（Phase 1: シンプル版）
    const docDefinition: TDocumentDefinitions = {
      pageSize: {
        width: 339 * 2.83465, // mm to points (1mm = 2.83465pt)
        height: 228 * 2.83465,
      },
      pageOrientation: 'landscape',
      pageMargins: [28, 28, 28, 28], // 10mm = 28.3465pt

      content: [
        // ヘッダー
        {
          text: 'CERTIFIED PEDIGREE',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        {
          text: 'WORLD CATS ASSOCIATION',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 0, 0, 20],
        },

        // 基本情報
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: `Breed: ${breedName}`, style: 'label' },
                { text: `Sex: ${genderName}`, style: 'label' },
                { text: `Date of birth: ${pedigree.birthDate || ''}`, style: 'label' },
                { text: `Eye color: ${pedigree.eyeColor || ''}`, style: 'label' },
                { text: `Color: ${coatColorName}`, style: 'label' },
              ],
            },
            {
              width: 'auto',
              text: `WCA NO.\n${pedigree.pedigreeId}`,
              style: 'wcaNumber',
              alignment: 'center',
            },
            {
              width: '*',
              stack: [
                { text: `Owner: ${pedigree.ownerName || ''}`, style: 'label' },
                { text: `Breeder: ${pedigree.breederName || ''}`, style: 'label' },
                { text: `Date of registration: ${pedigree.registrationDate || ''}`, style: 'label' },
                {
                  text: `Litters: M ${(pedigree.brotherCount || 0) + (pedigree.sisterCount || 0)}`,
                  style: 'label',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // 家系図（Phase 1: テキストベース簡易版）
        {
          text: 'FAMILY TREE',
          style: 'sectionHeader',
          margin: [0, 10, 0, 10],
        },
        {
          text: `Father: ${pedigree.fatherCatName || 'N/A'}`,
          style: 'familyTreeText',
        },
        {
          text: `Mother: ${pedigree.motherCatName || 'N/A'}`,
          style: 'familyTreeText',
        },

        // フッター情報
        {
          text: '\n\nWe hereby certify that this cat was registered in the stud Book\nof the WORLD CATS ASSOCIATION and belief the above descriptions\nand all true and correct.',
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
      ],

      styles: {
        header: {
          fontSize: 20,
          bold: true,
        },
        subheader: {
          fontSize: 12,
        },
        label: {
          fontSize: 10,
          margin: [0, 2, 0, 2],
        },
        wcaNumber: {
          fontSize: 14,
          bold: true,
          margin: [20, 0, 20, 0],
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
        },
        familyTreeText: {
          fontSize: 10,
          margin: [0, 2, 0, 2],
        },
        footer: {
          fontSize: 8,
          italics: true,
        },
      },
    };

    // PDFを生成
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
        reject(error);
      }
    });
  }

  /**
   * PDFをBase64形式で取得（プレビュー用）
   * @param pedigreeId 血統書ID
   * @returns Base64エンコードされたPDF文字列
   */
  async generateBase64(
    pedigreeId: string,
  ): Promise<string> {
    const pdfBuffer = await this.generatePdf(pedigreeId);
    return pdfBuffer.toString('base64');
  }
}
