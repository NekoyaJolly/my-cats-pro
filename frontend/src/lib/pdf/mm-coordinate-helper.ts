import { rgb } from 'pdf-lib';
import type { PDFFont, PDFPage, RGB } from 'pdf-lib';

export const MM_TO_PT = 2.83465 as const;

export const PEDIGREE_PAGE_WIDTH_MM = 339 as const;
export const PEDIGREE_PAGE_HEIGHT_MM = 239 as const;

export const PEDIGREE_PAGE_SIZE_PT: readonly [number, number] = [
  PEDIGREE_PAGE_WIDTH_MM * MM_TO_PT,
  PEDIGREE_PAGE_HEIGHT_MM * MM_TO_PT,
];

export const mm = (value: number): number => value * MM_TO_PT;

export interface MmDrawTextOptions {
  x: number;
  y: number;
  fontSize: number;
  font: PDFFont;
  color?: RGB;
  maxWidthMm?: number;
  lineHeightMm?: number;
}

/**
 * 用紙の左上を原点(0,0)、X は右方向、Y は下方向を正とする mm 座標で文字を描画する。
 * pdf-lib の内部座標系（左下原点・pt）に変換して委譲する。
 */
export const drawTextMm = (
  page: PDFPage,
  text: string,
  options: MmDrawTextOptions,
): void => {
  const { x, y, fontSize, font, color, maxWidthMm, lineHeightMm } = options;
  const pageHeightPt = page.getHeight();

  const lines = maxWidthMm
    ? wrapTextByWidth(text, font, fontSize, mm(maxWidthMm))
    : [text];

  const lineHeightPt = lineHeightMm ? mm(lineHeightMm) : fontSize * 1.2;

  lines.forEach((line, index) => {
    const topPt = mm(y) + lineHeightPt * index;
    const baselineY = pageHeightPt - topPt - fontSize;
    page.drawText(line, {
      x: mm(x),
      y: baselineY,
      size: fontSize,
      font,
      color,
    });
  });
};

export interface MmDrawLineOptions {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thicknessMm?: number;
  color?: RGB;
}

export const drawLineMm = (page: PDFPage, options: MmDrawLineOptions): void => {
  const pageHeightPt = page.getHeight();
  page.drawLine({
    start: { x: mm(options.x1), y: pageHeightPt - mm(options.y1) },
    end: { x: mm(options.x2), y: pageHeightPt - mm(options.y2) },
    thickness: options.thicknessMm ? mm(options.thicknessMm) : 0.5,
    color: options.color,
  });
};

export interface MmDrawRectangleOptions {
  x: number;
  y: number;
  widthMm: number;
  heightMm: number;
  borderThicknessMm?: number;
  borderColor?: RGB;
  color?: RGB;
}

export const drawRectangleMm = (
  page: PDFPage,
  options: MmDrawRectangleOptions,
): void => {
  const pageHeightPt = page.getHeight();
  page.drawRectangle({
    x: mm(options.x),
    y: pageHeightPt - mm(options.y) - mm(options.heightMm),
    width: mm(options.widthMm),
    height: mm(options.heightMm),
    borderWidth: options.borderThicknessMm ? mm(options.borderThicknessMm) : undefined,
    borderColor: options.borderColor,
    color: options.color,
  });
};

export interface MmGridOverlayOptions {
  widthMm: number;
  heightMm: number;
  majorStepMm?: number;
  minorStepMm?: number;
  labelFont: PDFFont;
  labelFontSize?: number;
}

/**
 * 用紙上に mm 方眼グリッドと座標ラベルを描画する。
 * 座標調整の際に印刷して現物と重ね、
 * 「この名前を右に +X mm、下に +Y mm」を目視で確定するためのデバッグ機能。
 * 薄いグレーで主要目盛(例: 10mm)、さらに薄い色で補助目盛(例: 5mm)を引く。
 */
export const drawMmGridOverlay = (
  page: PDFPage,
  options: MmGridOverlayOptions,
): void => {
  const major = options.majorStepMm ?? 10;
  const minor = options.minorStepMm ?? 5;
  const labelFontSize = options.labelFontSize ?? 5;
  const { widthMm, heightMm, labelFont } = options;

  const minorColor = rgb(0.88, 0.88, 0.94);
  const majorColor = rgb(0.7, 0.7, 0.82);
  const labelColor = rgb(0.45, 0.45, 0.6);

  for (let x = 0; x <= widthMm; x += minor) {
    drawLineMm(page, {
      x1: x, y1: 0, x2: x, y2: heightMm,
      thicknessMm: 0.05,
      color: x % major === 0 ? majorColor : minorColor,
    });
  }
  for (let y = 0; y <= heightMm; y += minor) {
    drawLineMm(page, {
      x1: 0, y1: y, x2: widthMm, y2: y,
      thicknessMm: 0.05,
      color: y % major === 0 ? majorColor : minorColor,
    });
  }

  for (let x = 0; x <= widthMm; x += major) {
    drawTextMm(page, String(x), {
      x: x + 0.5, y: 1, fontSize: labelFontSize, font: labelFont, color: labelColor,
    });
  }
  for (let y = major; y <= heightMm; y += major) {
    drawTextMm(page, String(y), {
      x: 1, y: y - 1, fontSize: labelFontSize, font: labelFont, color: labelColor,
    });
  }
};

/**
 * 指定幅に収まるように文字列を行分割する。
 * CJK も含めて pdf-lib の widthOfTextAtSize を使用するため、日本語フォント埋め込み後に正確に計測される。
 */
const wrapTextByWidth = (
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidthPt: number,
): string[] => {
  if (!text) return [''];
  const lines: string[] = [];
  let current = '';
  for (const char of Array.from(text)) {
    const candidate = current + char;
    const width = font.widthOfTextAtSize(candidate, fontSize);
    if (width > maxWidthPt && current.length > 0) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
};
