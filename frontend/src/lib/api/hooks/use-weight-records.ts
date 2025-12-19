/**
 * 体重記録APIフック (TanStack Query)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiRequest } from '../client';
import { createDomainQueryKeys } from './query-key-factory';
import { notifications } from '@mantine/notifications';

/**
 * 体重記録の型定義
 */
export interface WeightRecord {
  id: string;
  catId: string;
  weight: number;
  recordedAt: string;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  recorder?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

/**
 * 体重記録サマリー
 */
export interface WeightRecordSummary {
  latestWeight: number | null;
  previousWeight: number | null;
  weightChange: number | null;
  latestRecordedAt: string | null;
  recordCount: number;
}

/**
 * 体重記録一覧取得パラメータ
 */
export interface GetWeightRecordsParams {
  catId: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 体重記録一覧レスポンス
 */
export interface GetWeightRecordsResponse {
  data: WeightRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary?: WeightRecordSummary;
}

/**
 * 体重記録作成リクエスト
 */
export interface CreateWeightRecordRequest {
  weight: number;
  recordedAt?: string;
  notes?: string;
}

/**
 * 体重記録更新リクエスト
 */
export interface UpdateWeightRecordRequest {
  weight?: number;
  recordedAt?: string;
  notes?: string;
}

/**
 * 一括体重記録リクエスト
 */
export interface BulkWeightRecordItem {
  catId: string;
  weight: number;
  notes?: string;
}

export interface CreateBulkWeightRecordsRequest {
  recordedAt: string;
  records: BulkWeightRecordItem[];
}

/**
 * 一括体重記録レスポンス
 */
export interface CreateBulkWeightRecordsResponse {
  success: boolean;
  created: number;
  records: WeightRecord[];
}

/**
 * クエリキー定義
 */
const baseWeightRecordKeys = createDomainQueryKeys<string, GetWeightRecordsParams>('weightRecords');

export const weightRecordKeys = {
  ...baseWeightRecordKeys,
  byCat: (catId: string, params?: Omit<GetWeightRecordsParams, 'catId'>) =>
    [...baseWeightRecordKeys.all, 'byCat', catId, params ?? {}] as const,
};

/**
 * 猫の体重記録一覧を取得するフック
 */
export function useGetWeightRecords(
  params: GetWeightRecordsParams,
  options?: Omit<UseQueryOptions<GetWeightRecordsResponse>, 'queryKey' | 'queryFn'>,
) {
  const { catId, ...queryParams } = params;

  // クエリパラメータを構築
  const queryString = new URLSearchParams();
  if (queryParams.page) queryString.set('page', String(queryParams.page));
  if (queryParams.limit) queryString.set('limit', String(queryParams.limit));
  if (queryParams.startDate) queryString.set('startDate', queryParams.startDate);
  if (queryParams.endDate) queryString.set('endDate', queryParams.endDate);
  if (queryParams.sortOrder) queryString.set('sortOrder', queryParams.sortOrder);

  const urlPath = `/cats/${catId}/weight-records${queryString.toString() ? `?${queryString.toString()}` : ''}`;

  return useQuery({
    queryKey: weightRecordKeys.byCat(catId, queryParams),
    queryFn: async () => {
      const response = await apiRequest<WeightRecord[]>(urlPath);
      return {
        data: response.data ?? [],
        meta: (response.meta as GetWeightRecordsResponse['meta'] | undefined) ?? {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
        summary: (response as unknown as { summary?: WeightRecordSummary }).summary,
      };
    },
    enabled: !!catId,
    ...options,
  });
}

/**
 * 体重記録を作成するフック
 */
export function useCreateWeightRecord(catId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWeightRecordRequest) => {
      const response = await apiRequest<WeightRecord>(`/cats/${catId}/weight-records`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // キャッシュを無効化して再フェッチ
      void queryClient.invalidateQueries({ queryKey: weightRecordKeys.byCat(catId) });

      notifications.show({
        title: '成功',
        message: '体重記録を追加しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '体重記録の追加に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 体重記録を更新するフック
 */
export function useUpdateWeightRecord(catId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, data }: { recordId: string; data: UpdateWeightRecordRequest }) => {
      const response = await apiRequest<WeightRecord>(`/cats/weight-records/${recordId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      // キャッシュを無効化して再フェッチ
      void queryClient.invalidateQueries({ queryKey: weightRecordKeys.byCat(catId) });

      notifications.show({
        title: '成功',
        message: '体重記録を更新しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '体重記録の更新に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 体重記録を削除するフック
 */
export function useDeleteWeightRecord(catId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      await apiRequest(`/cats/weight-records/${recordId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // キャッシュを無効化して再フェッチ
      void queryClient.invalidateQueries({ queryKey: weightRecordKeys.byCat(catId) });

      notifications.show({
        title: '成功',
        message: '体重記録を削除しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '体重記録の削除に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 複数の猫の体重を一括登録するフック
 */
export function useCreateBulkWeightRecords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBulkWeightRecordsRequest) => {
      const response = await apiRequest<CreateBulkWeightRecordsResponse>('/cats/weight-records/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      // 関連する全ての猫のキャッシュを無効化
      void queryClient.invalidateQueries({ queryKey: weightRecordKeys.all });

      notifications.show({
        title: '成功',
        message: `${data?.created ?? 0}件の体重記録を追加しました`,
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '体重記録の一括追加に失敗しました',
        color: 'red',
      });
    },
  });
}

