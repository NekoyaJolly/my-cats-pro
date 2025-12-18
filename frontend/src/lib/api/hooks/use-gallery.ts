/**
 * ギャラリーAPI用フック (TanStack Query)
 * カテゴリ別（Kittens / Fathers / Mothers / Graduations）のギャラリー管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createDomainQueryKeys } from './query-key-factory';
import { notifications } from '@mantine/notifications';
import { getPublicApiBaseUrl } from '@/lib/api/public-api-base-url';

const apiBaseUrl = getPublicApiBaseUrl();

// ============================================================================
// 型定義
// ============================================================================

/**
 * ギャラリーカテゴリ
 */
export type GalleryCategory = 'KITTEN' | 'FATHER' | 'MOTHER' | 'GRADUATION';

/**
 * メディアタイプ
 */
export type GalleryMediaType = 'IMAGE' | 'YOUTUBE';

/**
 * ギャラリーメディア
 */
export interface GalleryMedia {
  id: string;
  type: GalleryMediaType;
  url: string;
  thumbnailUrl?: string;
  order: number;
  createdAt: string;
}

/**
 * ギャラリーエントリ
 */
export interface GalleryEntry {
  id: string;
  category: GalleryCategory;
  name: string;
  gender: string;
  coatColor?: string;
  breed?: string;
  catId?: string;
  transferDate?: string;
  destination?: string;
  externalLink?: string;
  notes?: string;
  media: GalleryMedia[];
  createdAt: string;
  updatedAt: string;
}

/**
 * ギャラリー一覧レスポンス
 */
export interface GalleryResponse {
  success: boolean;
  data: GalleryEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * ギャラリーエントリ作成DTO
 */
export interface CreateGalleryEntryDto {
  category: GalleryCategory;
  name: string;
  gender: string;
  coatColor?: string;
  breed?: string;
  catId?: string;
  transferDate?: string;
  destination?: string;
  externalLink?: string;
  notes?: string;
  media?: {
    type: GalleryMediaType;
    url: string;
    thumbnailUrl?: string;
    order?: number;
  }[];
}

/**
 * ギャラリーエントリ更新DTO
 */
export type UpdateGalleryEntryDto = Partial<CreateGalleryEntryDto>;

/**
 * メディア追加DTO
 */
export interface AddMediaDto {
  type: GalleryMediaType;
  url: string;
  thumbnailUrl?: string;
}

/**
 * 取得パラメータ
 */
export interface GetGalleryParams {
  category?: GalleryCategory;
  page?: number;
  limit?: number;
}

// ============================================================================
// クエリキー
// ============================================================================

const galleryKeys = createDomainQueryKeys<string, GetGalleryParams>('gallery');

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * Response からエラーメッセージを安全に抽出
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
      typeof (json as { message?: string }).message === 'string'
    ) {
      return (json as { message: string }).message;
    }
    return defaultMessage;
  } catch {
    return defaultMessage;
  }
}

// ============================================================================
// フック
// ============================================================================

/**
 * ギャラリー一覧取得
 *
 * @param category - フィルタするカテゴリ（省略時は全件）
 * @param page - ページ番号（デフォルト: 1）
 * @param limit - 1ページあたりの件数（デフォルト: 20）
 */
export function useGalleryEntries(
  category?: GalleryCategory,
  page: number = 1,
  limit: number = 20
) {
  return useQuery<GalleryResponse>({
    queryKey: galleryKeys.list({ category, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await fetch(`${apiBaseUrl}/gallery?${params.toString()}`);
      if (!res.ok) {
        const message = await extractErrorMessage(
          res,
          'ギャラリーの取得に失敗しました'
        );
        throw new Error(message);
      }
      return res.json() as Promise<GalleryResponse>;
    },
    // Kittens は更新頻度が高いため短め、他カテゴリは長めのキャッシュ
    staleTime: category === 'KITTEN' ? 5 * 60 * 1000 : 60 * 60 * 1000,
  });
}

/**
 * ギャラリー詳細取得
 *
 * @param id - エントリID（null時は無効化）
 */
export function useGalleryEntry(id: string | null) {
  return useQuery<{ success: boolean; data: GalleryEntry }>({
    queryKey: galleryKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('IDが必要です');
      const res = await fetch(`${apiBaseUrl}/gallery/${id}`);
      if (!res.ok) {
        const message = await extractErrorMessage(
          res,
          'ギャラリーの取得に失敗しました'
        );
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean; data: GalleryEntry }>;
    },
    enabled: !!id,
  });
}

/**
 * ギャラリーエントリ作成
 */
export function useCreateGalleryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateGalleryEntryDto) => {
      const res = await fetch(`${apiBaseUrl}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const message = await extractErrorMessage(res, '登録に失敗しました');
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean; data: GalleryEntry }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      notifications.show({
        title: '登録完了',
        message: 'ギャラリーに追加しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: '登録失敗',
        message: error instanceof Error ? error.message : '登録に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * ギャラリーエントリ一括作成
 */
export function useBulkCreateGalleryEntries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries: CreateGalleryEntryDto[]) => {
      const res = await fetch(`${apiBaseUrl}/gallery/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
      if (!res.ok) {
        const message = await extractErrorMessage(
          res,
          '一括登録に失敗しました'
        );
        throw new Error(message);
      }
      return res.json() as Promise<{
        success: boolean;
        data: GalleryEntry[];
        count: number;
      }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      notifications.show({
        title: '一括登録完了',
        message: `${data.count}件のエントリを追加しました`,
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: '一括登録失敗',
        message:
          error instanceof Error ? error.message : '一括登録に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * ギャラリーエントリ更新
 */
export function useUpdateGalleryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateGalleryEntryDto;
    }) => {
      const res = await fetch(`${apiBaseUrl}/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const message = await extractErrorMessage(res, '更新に失敗しました');
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean; data: GalleryEntry }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      notifications.show({
        title: '更新完了',
        message: 'ギャラリー情報を更新しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: '更新失敗',
        message: error instanceof Error ? error.message : '更新に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * ギャラリーエントリ削除
 */
export function useDeleteGalleryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${apiBaseUrl}/gallery/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const message = await extractErrorMessage(res, '削除に失敗しました');
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      notifications.show({
        title: '削除完了',
        message: 'ギャラリーから削除しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: '削除失敗',
        message: error instanceof Error ? error.message : '削除に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * メディア追加
 */
export function useAddGalleryMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      media,
    }: {
      entryId: string;
      media: AddMediaDto;
    }) => {
      const res = await fetch(`${apiBaseUrl}/gallery/${entryId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media),
      });
      if (!res.ok) {
        const message = await extractErrorMessage(
          res,
          'メディア追加に失敗しました'
        );
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean; data: GalleryMedia }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      notifications.show({
        title: '追加完了',
        message: 'メディアを追加しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: '追加失敗',
        message:
          error instanceof Error ? error.message : 'メディア追加に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * メディア削除
 */
export function useDeleteGalleryMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch(`${apiBaseUrl}/gallery/media/${mediaId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const message = await extractErrorMessage(
          res,
          'メディア削除に失敗しました'
        );
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      notifications.show({
        title: '削除完了',
        message: 'メディアを削除しました',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: '削除失敗',
        message:
          error instanceof Error ? error.message : 'メディア削除に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * メディア順序更新
 */
export function useReorderGalleryMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      mediaIds,
    }: {
      entryId: string;
      mediaIds: string[];
    }) => {
      const res = await fetch(
        `${apiBaseUrl}/gallery/${entryId}/media/reorder`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mediaIds }),
        }
      );
      if (!res.ok) {
        const message = await extractErrorMessage(
          res,
          '順序変更に失敗しました'
        );
        throw new Error(message);
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
    },
    onError: (error) => {
      notifications.show({
        title: '順序変更失敗',
        message:
          error instanceof Error ? error.message : '順序変更に失敗しました',
        color: 'red',
      });
    },
  });
}
