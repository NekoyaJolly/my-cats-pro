/**
 * アップロード結果インターフェース
 */
export interface UploadResult {
  /** 操作成功フラグ */
  success: boolean;
  /** 公開URL */
  url: string;
  /** ファイルサイズ（バイト） */
  size: number;
}

/**
 * Signed URL 生成結果インターフェース
 */
export interface SignedUrlResult {
  /** アップロード用 Signed URL */
  uploadUrl: string;
  /** GCS 内のファイルキー */
  fileKey: string;
  /** アップロード後の公開URL */
  publicUrl: string;
}
