/**
 * 画像リサイズ設定
 */
export interface ImageResizeOptions {
  /** 最大幅（ピクセル） */
  maxWidth?: number;
  /** 最大高さ（ピクセル） */
  maxHeight?: number;
  /** 圧縮品質（0-1） */
  quality?: number;
  /** 出力フォーマット */
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: Required<ImageResizeOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.85,
  format: 'image/jpeg',
};

/**
 * 画像をリサイズしてBlobを返す
 * - アスペクト比を維持
 * - 1200px / 85%品質で最適化
 *
 * @param file - リサイズ対象の画像ファイル
 * @param options - リサイズオプション
 * @returns リサイズ後の Blob
 */
export async function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(img.src);

      let { width, height } = img;

      // アスペクト比を維持してリサイズ
      if (width > opts.maxWidth || height > opts.maxHeight) {
        const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context の取得に失敗しました'));
        return;
      }

      // 高品質リサイズ
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('画像の変換に失敗しました'));
          }
        },
        opts.format,
        opts.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('画像の読み込みに失敗しました'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * ファイルサイズを人間が読める形式に変換
 *
 * @param bytes - バイト数
 * @returns フォーマット済みサイズ文字列
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * 画像ファイルかどうかを判定
 *
 * @param file - 判定対象のファイル
 * @returns 対応形式の画像ファイルの場合 true
 */
export function isImageFile(file: File): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

/**
 * 対応している画像形式
 */
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * 最大ファイルサイズ（10MB）
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
