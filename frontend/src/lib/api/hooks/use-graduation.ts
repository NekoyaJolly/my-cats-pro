import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Cat } from './use-cats';
import { getPublicApiBaseUrl } from '@/lib/api/public-api-base-url';

// Graduation型定義
export interface Graduation {
  id: string;
  catId: string;
  transferDate: string;
  destination: string;
  notes?: string;
  catSnapshot: Cat; // 譲渡時点の猫データ
  transferredBy?: string;
  createdAt: string;
  updatedAt: string;
  cat?: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
  };
}

export interface GraduationsResponse {
  success: boolean;
  data: Graduation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GraduationDetailResponse {
  success: boolean;
  data: Graduation;
}

export interface TransferCatDto {
  transferDate: string; // ISO 8601 date string
  destination: string;
  notes?: string;
}

export interface TransferCatResponse {
  success: boolean;
  data: Graduation;
}

/**
 * 猫を譲渡（卒業）する
 */
export function useTransferCat() {
  const queryClient = useQueryClient();

  return useMutation<TransferCatResponse, Error, { catId: string; data: TransferCatDto }>({
    mutationFn: async ({ catId, data }) => {
      const apiBaseUrl = getPublicApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/graduations/cats/${catId}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Failed to transfer cat');
      }

      return response.json() as Promise<TransferCatResponse>;
    },
    onSuccess: () => {
      // キャッシュを無効化
      queryClient.invalidateQueries({ queryKey: ['cats'] });
      queryClient.invalidateQueries({ queryKey: ['graduations'] });
    },
  });
}

/**
 * 卒業猫一覧取得
 */
export function useGetGraduations(page = 1, limit = 50) {
  return useQuery<GraduationsResponse, Error>({
    queryKey: ['graduations', page, limit],
    queryFn: async () => {
      const apiBaseUrl = getPublicApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/graduations?page=${page}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch graduations');
      }

      return response.json() as Promise<GraduationsResponse>;
    },
  });
}

/**
 * 卒業猫詳細取得
 */
export function useGetGraduationDetail(id: string | null) {
  return useQuery<GraduationDetailResponse, Error>({
    queryKey: ['graduation', id],
    queryFn: async () => {
      if (!id) throw new Error('Graduation ID is required');

      const apiBaseUrl = getPublicApiBaseUrl();

      const response = await fetch(`${apiBaseUrl}/graduations/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch graduation detail');
      }

      return response.json() as Promise<GraduationDetailResponse>;
    },
    enabled: !!id, // idがnullの場合はクエリを実行しない
  });
}

/**
 * 卒業取り消し（緊急時用）
 */
export function useCancelGraduation() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (graduationId: string) => {
      const apiBaseUrl = getPublicApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/graduations/${graduationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json() as { message?: string };
        throw new Error(errorData.message || 'Failed to cancel graduation');
      }

      return response.json() as Promise<{ success: boolean; message: string }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cats'] });
      queryClient.invalidateQueries({ queryKey: ['graduations'] });
    },
  });
}
