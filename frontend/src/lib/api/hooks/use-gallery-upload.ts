'use client';
// クライアントサイドでのファイルアップロード処理のため use client が必要

import { useState, useCallback } from 'react';
import {
  resizeImage,
  isImageFile,
  formatFileSize,
} from '@/lib/utils/image-resizer';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

/**
 * アップロード進捗状態
 */
export interface UploadProgress {
  /** ファイルキー（一時キーまたはGCSキー） */
  fileKey: string;
  /** 元のファイル名 */
  fileName: string;
  /** アップロード状態 */
  status:
    | 'pending'
    | 'resizing'
    | 'uploading'
    | 'confirming'
    | 'completed'
    | 'error';
  /** 進捗（0-100） */
  progress: number;
  /** エラーメッセージ */
  error?: string;
  /** アップロード完了後のURL */
  url?: string;
}

/**
 * Signed URL レスポンス
 */
interface SignedUrlResponse {
  success: boolean;
  data: {
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  };
}

/**
 * エラーレスポンス
 */
interface ErrorResponse {
  message?: string;
}

/**
 * Response からエラーメッセージを安全に抽出するヘルパー
 */
async function extractErrorMessage(
  response: Response,
  defaultMessage: string
): Promise<string> {
  try {
    const json: unknown = await response.json();
    if (
      typeof json === 'object' &&
      json !== null &&
      'message' in json &&
      typeof (json as ErrorResponse).message === 'string'
    ) {
      return (json as ErrorResponse).message ?? defaultMessage;
    }
    return defaultMessage;
  } catch {
    return defaultMessage;
  }
}

/**
 * ギャラリー画像アップロード用フック
 *
 * @example
 * ```tsx
 * const { uploads, uploadFile, clearUploads } = useGalleryUpload();
 *
 * const handleFileSelect = async (file: File) => {
 *   try {
 *     const url = await uploadFile(file);
 *     console.log('アップロード完了:', url);
 *   } catch (error) {
 *     console.error('アップロード失敗:', error);
 *   }
 * };
 * ```
 */
export function useGalleryUpload() {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(
    new Map()
  );

  /**
   * 指定されたキーのアップロード状態を更新
   */
  const updateUpload = useCallback(
    (fileKey: string, updates: Partial<UploadProgress>) => {
      setUploads((prev) => {
        const newMap = new Map(prev);
        const current = newMap.get(fileKey);
        if (current) {
          newMap.set(fileKey, { ...current, ...updates });
        }
        return newMap;
      });
    },
    []
  );

  /**
   * 単一ファイルをアップロード
   *
   * @param file - アップロードするファイル
   * @returns アップロード完了後の公開URL
   * @throws 非対応形式やアップロード失敗時にエラー
   */
  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (!isImageFile(file)) {
        throw new Error('JPEG、PNG、WebP形式の画像のみアップロードできます');
      }

      const tempKey = `temp-${Date.now()}-${file.name}`;

      // 初期状態を設定
      setUploads((prev) => {
        const newMap = new Map(prev);
        newMap.set(tempKey, {
          fileKey: tempKey,
          fileName: file.name,
          status: 'resizing',
          progress: 0,
        });
        return newMap;
      });

      try {
        // 1. 画像をリサイズ
        const resizedBlob = await resizeImage(file);
        updateUpload(tempKey, { status: 'uploading', progress: 20 });

        // 2. Signed URLを取得
        const signedUrlRes = await fetch(
          `${API_BASE_URL}/gallery/upload/signed-url`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              contentType: 'image/jpeg',
              fileSize: resizedBlob.size,
            }),
          }
        );

        if (!signedUrlRes.ok) {
          const errorMessage = await extractErrorMessage(
            signedUrlRes,
            'アップロードURLの取得に失敗しました'
          );
          throw new Error(errorMessage);
        }

        const signedUrlData: SignedUrlResponse =
          (await signedUrlRes.json()) as SignedUrlResponse;
        const { data } = signedUrlData;
        updateUpload(tempKey, { fileKey: data.fileKey, progress: 40 });

        // 3. GCSへ直接アップロード
        const uploadRes = await fetch(data.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'image/jpeg' },
          body: resizedBlob,
        });

        if (!uploadRes.ok) {
          throw new Error('画像のアップロードに失敗しました');
        }

        updateUpload(tempKey, { status: 'confirming', progress: 80 });

        // 4. アップロード完了を確認
        const confirmRes = await fetch(
          `${API_BASE_URL}/gallery/upload/confirm`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileKey: data.fileKey }),
          }
        );

        if (!confirmRes.ok) {
          const errorMessage = await extractErrorMessage(
            confirmRes,
            'アップロードの確認に失敗しました'
          );
          throw new Error(errorMessage);
        }

        // アップロード確認完了
        updateUpload(tempKey, {
          status: 'completed',
          progress: 100,
          url: data.publicUrl,
        });

        return data.publicUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'アップロードに失敗しました';
        updateUpload(tempKey, { status: 'error', error: errorMessage });
        throw error;
      }
    },
    [updateUpload]
  );

  /**
   * 複数ファイルを並列アップロード
   *
   * @param files - アップロードするファイル配列
   * @returns 成功したファイルの公開URL配列
   */
  const uploadMultiple = useCallback(
    async (files: File[]): Promise<string[]> => {
      const results = await Promise.allSettled(files.map(uploadFile));
      return results
        .filter(
          (r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled'
        )
        .map((r) => r.value);
    },
    [uploadFile]
  );

  /**
   * アップロード状態をクリア
   */
  const clearUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  /**
   * 特定のアップロードを削除
   */
  const removeUpload = useCallback((fileKey: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileKey);
      return newMap;
    });
  }, []);

  return {
    /** 現在のアップロード状態一覧 */
    uploads: Array.from(uploads.values()),
    /** 単一ファイルアップロード */
    uploadFile,
    /** 複数ファイル並列アップロード */
    uploadMultiple,
    /** すべてのアップロード状態をクリア */
    clearUploads,
    /** 特定のアップロードを削除 */
    removeUpload,
    /** ファイルサイズフォーマット関数（ユーティリティ） */
    formatFileSize,
  };
}
