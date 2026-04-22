import type { PDFDocument, PDFFont } from 'pdf-lib';

export interface EmbeddedFonts {
  regular: PDFFont;
  bold: PDFFont;
}

export interface FontLoaderOptions {
  regularUrl?: string;
  boldUrl?: string;
}

const DEFAULT_REGULAR_URL = '/fonts/NotoSansJP-Regular.ttf';
const DEFAULT_BOLD_URL = '/fonts/NotoSansJP-Bold.ttf';

/**
 * public/fonts 配下の Noto Sans JP を PDFDocument に埋め込む。
 * fontkit.register は呼び出し側（PDF 生成エントリ）で 1 度だけ実行すること。
 * subset=true でファイルサイズを抑制しつつ、使用したグリフのみを埋め込む。
 */
export const embedJapaneseFonts = async (
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
