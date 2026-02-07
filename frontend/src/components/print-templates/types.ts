// 印刷テンプレート管理 — 共有型定義

/** フィールドのデータソース情報 */
export interface FieldDataSource {
    type: 'cat' | 'breeding' | 'medical' | 'pedigree' | 'tenant' | 'static';
    field?: string;
    staticValue?: string;
}

/** フィールド位置・スタイル情報 */
export interface FieldConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    align: 'left' | 'center' | 'right';
    fontWeight: 'normal' | 'bold';
    color: string;
    label: string;
    dataSource?: FieldDataSource;
}

/** 印刷テンプレート */
export interface PrintTemplate {
    id: string;
    tenantId: string | null;
    name: string;
    description: string | null;
    category: string;
    categoryId: string | null;
    paperWidth: number;
    paperHeight: number;
    backgroundUrl: string | null;
    backgroundOpacity: number;
    positions: Record<string, FieldConfig>;
    fontSizes: Record<string, number> | null;
    isActive: boolean;
    isDefault: boolean;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
}

/** デフォルトフィールド定義（カテゴリから） */
export interface DefaultFieldDef {
    key: string;
    label: string;
    dataSourceType?: string;
    dataSourceField?: string;
}

/** カテゴリ */
export interface PrintDocCategory {
    id: string;
    tenantId: string | null;
    name: string;
    slug: string;
    description: string | null;
    defaultFields: DefaultFieldDef[] | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/** データソースフィールド情報 */
export interface DataSourceFieldInfo {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
}

/** データソース情報 */
export interface DataSourceInfo {
    type: string;
    label: string;
    description: string;
    fields: DataSourceFieldInfo[];
}

/** テナント選択肢 */
export interface TenantOption {
    value: string;
    label: string;
}

/** プリセット用紙サイズ（mm） */
export const PAPER_PRESETS = [
    { label: 'A4 縦', width: 210, height: 297 },
    { label: 'A4 横', width: 297, height: 210 },
    { label: 'A5 縦', width: 148, height: 210 },
    { label: 'A5 横', width: 210, height: 148 },
    { label: 'B5 縦', width: 182, height: 257 },
    { label: 'B5 横', width: 257, height: 182 },
    { label: 'はがき 縦', width: 100, height: 148 },
    { label: 'はがき 横', width: 148, height: 100 },
    { label: 'カスタム', width: 0, height: 0, isCustom: true },
] as const;

/** HTML ビルド用ユーティリティ */
export function escapeHtml(text: string): string {
    return text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/** 印刷用 HTML を組み立てる */
export function buildPrintHtml(params: {
    template: PrintTemplate;
    fieldValues?: Record<string, string>;
}): string {
    const { template, fieldValues } = params;
    const safeTitle = escapeHtml(template.name);
    const pageWidthMm = template.paperWidth;
    const pageHeightMm = template.paperHeight;

    const fieldHtml = Object.entries(template.positions)
        .map(([fieldName, pos]) => {
            const text = fieldValues?.[fieldName] ?? pos.label ?? fieldName;
            const widthMm = pos.width ?? 50;
            const heightMm = pos.height ?? 15;

            return `
        <div
          class="field"
          style="
            left: ${pos.x}mm;
            top: ${pos.y}mm;
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            font-size: ${pos.fontSize ?? 12}px;
            text-align: ${pos.align ?? 'left'};
            font-weight: ${pos.fontWeight ?? 'normal'};
            color: ${escapeHtml(pos.color ?? '#333')};
          "
        >${escapeHtml(text)}</div>
      `.trim();
        })
        .join('\n');

    const backgroundImageStyle = template.backgroundUrl
        ? `background-image: url(${escapeHtml(template.backgroundUrl)});`
        : '';
    const showOverlay = !!template.backgroundUrl && template.backgroundOpacity < 100;
    const overlayAlpha = (100 - template.backgroundOpacity) / 100;

    return `
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle} - 印刷</title>
    <style>
      @page { size: ${pageWidthMm}mm ${pageHeightMm}mm; margin: 0; }
      html, body { margin: 0; padding: 0; width: ${pageWidthMm}mm; height: ${pageHeightMm}mm; }
      * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .paper {
        position: relative;
        width: ${pageWidthMm}mm;
        height: ${pageHeightMm}mm;
        background-color: #fff;
        background-size: cover;
        background-position: center;
        ${backgroundImageStyle}
        overflow: hidden;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, ${overlayAlpha});
        pointer-events: none;
      }
      .field {
        position: absolute;
        white-space: pre-wrap;
        overflow: hidden;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div class="paper">
      ${showOverlay ? '<div class="overlay"></div>' : ''}
      ${fieldHtml}
    </div>
  </body>
</html>
  `.trim();
}
