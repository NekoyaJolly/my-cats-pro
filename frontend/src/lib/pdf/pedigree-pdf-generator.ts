import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import { embedJapaneseFonts, type FontLoaderOptions } from './font-loader';
import {
  PEDIGREE_PAGE_HEIGHT_MM,
  PEDIGREE_PAGE_SIZE_PT,
  PEDIGREE_PAGE_WIDTH_MM,
  drawMmGridOverlay,
  drawTextMm,
  type MmDrawTextOptions,
} from './mm-coordinate-helper';
import {
  DEFAULT_PEDIGREE_LAYOUT,
  type AncestorLayout,
  type PedigreeLayout,
  type TextFieldLayout,
} from './pedigree-layout';

export interface AncestorData {
  name?: string | null;
  color?: string | null;
  registrationNo?: string | null;
}

export interface PedigreeData {
  title?: string;
  catName: string;
  registrationNo?: string;
  breed?: string;
  color?: string;
  sex?: string;
  birthDate?: string;
  breeder?: string;
  owner?: string;

  sire?: AncestorData;
  dam?: AncestorData;

  sireFather?: AncestorData;
  sireMother?: AncestorData;
  damFather?: AncestorData;
  damMother?: AncestorData;

  sireFatherFather?: AncestorData;
  sireFatherMother?: AncestorData;
  sireMotherFather?: AncestorData;
  sireMotherMother?: AncestorData;
  damFatherFather?: AncestorData;
  damFatherMother?: AncestorData;
  damMotherFather?: AncestorData;
  damMotherMother?: AncestorData;
}

export interface GeneratePedigreePdfOptions {
  data: PedigreeData;
  layout?: PedigreeLayout;
  font?: FontLoaderOptions;
  /** 全体の座標を mm 単位で平行移動（印刷機の個体差調整用） */
  offsetXmm?: number;
  offsetYmm?: number;
  /** true の場合、5mm/10mm の方眼と座標ラベルを重ねて描画する（座標調整用） */
  debugGrid?: boolean;
}

/**
 * pdf-lib で 339mm × 239mm の血統書 PDF を生成する。
 * 返値はブラウザで Blob URL 化 / ダウンロード / <iframe> プレビューに使用できる Uint8Array。
 *
 * ◆ 印刷時の注意（Brother MFC-J6983CDW）
 *   - プリンタドライバで「用紙サイズ=ユーザー定義(339×239mm)」を事前登録
 *   - 「フチなし印刷=OFF」（フチなしは約 103% 拡大され座標がズレる）
 *   - 「倍率=100% / 実寸 / 拡大縮小なし」
 *   - Adobe Acrobat から印刷する場合は「実際のサイズ」を選択（「ページに合わせる」は禁止）
 */
export const generatePedigreePdf = async (
  options: GeneratePedigreePdfOptions,
): Promise<Uint8Array> => {
  const layout = options.layout ?? DEFAULT_PEDIGREE_LAYOUT;
  const data = options.data;
  const offsetX = options.offsetXmm ?? 0;
  const offsetY = options.offsetYmm ?? 0;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const fonts = await embedJapaneseFonts(pdfDoc, options.font);

  const page = pdfDoc.addPage([PEDIGREE_PAGE_SIZE_PT[0], PEDIGREE_PAGE_SIZE_PT[1]]);
  const black = rgb(0, 0, 0);

  if (options.debugGrid) {
    drawMmGridOverlay(page, {
      widthMm: PEDIGREE_PAGE_WIDTH_MM,
      heightMm: PEDIGREE_PAGE_HEIGHT_MM,
      labelFont: fonts.regular,
    });
  }

  const drawField = (value: string | undefined | null, field: TextFieldLayout): void => {
    if (!value) return;
    const drawOptions: MmDrawTextOptions = {
      x: field.x + offsetX,
      y: field.y + offsetY,
      fontSize: field.fontSize,
      font: field.bold ? fonts.bold : fonts.regular,
      color: black,
      maxWidthMm: field.maxWidthMm,
    };
    drawTextMm(page, value, drawOptions);
  };

  const drawAncestor = (
    ancestor: AncestorData | undefined,
    ancestorLayout: AncestorLayout,
  ): void => {
    if (!ancestor) return;
    drawField(ancestor.name, ancestorLayout.name);
    if (ancestorLayout.color) drawField(ancestor.color, ancestorLayout.color);
    if (ancestorLayout.registrationNo) {
      drawField(ancestor.registrationNo, ancestorLayout.registrationNo);
    }
  };

  drawField(data.title ?? '血 統 書', layout.title);
  drawField(data.catName, layout.catName);
  drawField(data.registrationNo, layout.registrationNo);
  drawField(data.breed, layout.breed);
  drawField(data.color, layout.color);
  drawField(data.sex, layout.sex);
  drawField(data.birthDate, layout.birthDate);
  drawField(data.breeder, layout.breeder);
  drawField(data.owner, layout.owner);

  drawAncestor(data.sire, layout.sire);
  drawAncestor(data.dam, layout.dam);

  drawAncestor(data.sireFather, layout.sireFather);
  drawAncestor(data.sireMother, layout.sireMother);
  drawAncestor(data.damFather, layout.damFather);
  drawAncestor(data.damMother, layout.damMother);

  drawAncestor(data.sireFatherFather, layout.sireFatherFather);
  drawAncestor(data.sireFatherMother, layout.sireFatherMother);
  drawAncestor(data.sireMotherFather, layout.sireMotherFather);
  drawAncestor(data.sireMotherMother, layout.sireMotherMother);
  drawAncestor(data.damFatherFather, layout.damFatherFather);
  drawAncestor(data.damFatherMother, layout.damFatherMother);
  drawAncestor(data.damMotherFather, layout.damMotherFather);
  drawAncestor(data.damMotherMother, layout.damMotherMother);

  return pdfDoc.save();
};

/**
 * 生成した PDF をブラウザでダウンロードさせる。
 */
export const downloadPedigreePdf = (
  bytes: Uint8Array,
  fileName = 'pedigree.pdf',
): void => {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
