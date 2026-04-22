import type { PDFDocument, PDFFont } from 'pdf-lib';

export interface EmbeddedFonts {
  regular: PDFFont;
  bold: PDFFont;
}

export interface FontLoaderOptions {
  regularUrl?: string;
  boldUrl?: string;
}

const DEFAULT_REGULAR_URL = '/fonts/NotoSans-Regular.ttf';
const DEFAULT_BOLD_URL = '/fonts/NotoSans-Bold.ttf';

/**
 * public/fonts 配下の Noto Sans (Latin) を PDFDocument に埋め込む。
 * 血統書の印字内容は英字+数字のみのため Latin 専用フォントで十分。
 * fontkit.register は呼び出し側（PDF 生成エントリ）で 1 度だけ実行すること。
 * subset=true で使用グリフのみを埋め込み、PDF サイズを最小化する。
 */
export const embedPedigreeFonts = async (
  pdfDoc: PDFDocument,
  options: FontLoaderOptions = {},
): Promise<EmbeddedFonts> => {
  const regularUrl = options.regularUrl ?? DEFAULT_REGULAR_URL;
  const boldUrl = options.boldUrl ?? DEFAULT_BOLD_URL;

  const [regularBytes, boldBytes] = await Promise.all([
    fetchFontBytes(regularUrl),
    fetchFontBytes(boldUrl),
  ]);

  const [regular, bold] = await Promise.all([
    pdfDoc.embedFont(regularBytes, { subset: true }),
    pdfDoc.embedFont(boldBytes, { subset: true }),
  ]);

  return { regular, bold };
};

const fetchFontBytes = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`フォントの取得に失敗しました: ${url} (${response.status})`);
  }
  return response.arrayBuffer();
};
