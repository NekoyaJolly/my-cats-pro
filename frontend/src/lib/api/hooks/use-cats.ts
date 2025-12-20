/**
 * 猫管理APIフック (TanStack Query)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient, apiRequest, type ApiPathParams, type ApiQueryParams, type ApiRequestBody, type ApiResponse } from '../client';
import { createDomainQueryKeys } from './query-key-factory';
import { notifications } from '@mantine/notifications';

/**
 * 猫情報の型定義
 */
export interface Cat {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
  birthDate: string;
  breedId: string | null;
  coatColorId: string | null;
  microchipNumber: string | null;
  registrationNumber: string | null;
  description: string | null;
  isInHouse: boolean;
  fatherId: string | null;
  motherId: string | null;
  createdAt: string;
  updatedAt: string;
  // リレーション（オプショナル）
  breed?: { id: string; name: string };
  coatColor?: { id: string; name: string };
  father?: Cat;
  mother?: Cat;
  tags?: Array<{ 
    tag: { 
      id: string; 
      name: string; 
      color: string;
      metadata?: Record<string, unknown>;
      group?: { 
        name: string;
        category?: { name: string };
      };
    } 
  }>;
}

/**
 * 猫一覧取得パラメータ
 */
export interface GetCatsParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
  breedId?: string;
  coatColorId?: string;
  isInHouse?: boolean;
}

type CatsListQuery = ApiQueryParams<'/cats', 'get'>;
type CatDetailPathParams = ApiPathParams<'/cats/{id}', 'get'>;

/**
 * 猫一覧レスポンス
 */
export interface GetCatsResponse {
  data: Cat[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * 猫作成/更新リクエスト
 */
export interface CreateCatRequest {
  name: string;
  gender: 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY';
  birthDate: string;
  breedId?: string | null;
  coatColorId?: string | null;
  microchipNumber?: string | null;
  registrationNumber?: string | null;
  description?: string | null;
  isInHouse?: boolean;
  fatherId?: string | null;
  motherId?: string | null;
  tagIds?: string[];
}

export type UpdateCatRequest = Partial<CreateCatRequest>;
export type UpdateCatVariables = UpdateCatRequest & { id?: string };

const resolveTargetCatId = (variables: UpdateCatVariables | undefined, fallbackId: string): string => {
  const targetId = variables?.id ?? fallbackId;
  if (!targetId) {
    throw new Error('猫IDが指定されていません');
  }
  return targetId;
};

/**
 * 子猫一覧取得パラメータ
 */
export interface GetKittensParams {
  motherId?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'birthDate' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 子猫グループ（母猫ごと）
 */
export interface KittenGroup {
  mother: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
    breed: { id: string; name: string } | null;
    coatColor: { id: string; name: string } | null;
  };
  father: {
    id: string;
    name: string;
    gender: string;
    breed: { id: string; name: string } | null;
    coatColor: { id: string; name: string } | null;
  } | null;
  kittens: Cat[];
  kittenCount: number;
  deliveryDate: string | null;
}

/**
 * 子猫一覧レスポンス
 */
export interface GetKittensResponse {
  data: KittenGroup[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    totalGroups: number;
  };
}

/**
 * 祖先（祖父母・曾祖父母）の情報
 */
export interface AncestorInfo {
  pedigreeId: string | null;
  catName: string | null;
  coatColor: string | null;
  title: string | null;
  jcu: string | null;
}

/**
 * 親情報（父または母）
 */
export interface ParentInfo {
  id: string | null;
  pedigreeId: string | null;
  name: string;
  gender: string | null;
  birthDate: string | null;
  breed: { id: string; name: string } | null;
  coatColor: { id: string; name: string } | string | null;
  father: AncestorInfo | null;
  mother: AncestorInfo | null;
}

/**
 * 兄弟姉妹情報
 */
export interface SiblingInfo {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  breed: { id: string; name: string } | null;
  coatColor: { id: string; name: string } | null;
  pedigreeId: string | null;
}

/**
 * 子猫情報
 */
export interface OffspringInfo {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  breed: { id: string; name: string } | null;
  coatColor: { id: string; name: string } | null;
  pedigreeId: string | null;
  otherParent: {
    id: string;
    name: string;
    gender: string;
    pedigreeId: string | null;
  } | null;
}

/**
 * 猫の家族情報レスポンス
 */
export interface CatFamilyResponse {
  cat: {
    id: string;
    name: string;
    gender: string;
    birthDate: string;
    pedigreeId: string | null;
    breed: { id: string; name: string } | null;
    coatColor: { id: string; name: string } | null;
  };
  father: ParentInfo | null;
  mother: ParentInfo | null;
  siblings: SiblingInfo[];
  offspring: OffspringInfo[];
}

/**
 * タブ別カウント情報（猫一覧ページ用）
 */
export interface TabCounts {
  /** 全成猫数（子猫除外） */
  total: number;
  /** オス成猫数 */
  male: number;
  /** メス成猫数 */
  female: number;
  /** 子猫数（生後3ヶ月以内 + 母猫あり） */
  kitten: number;
  /** 養成中タグ付き猫数 */
  raising: number;
  /** 卒業予定タグ付き猫数 */
  grad: number;
}

/**
 * 猫統計レスポンス
 */
export interface CatStatisticsResponse {
  /** 全猫数 */
  total: number;
  /** 性別分布 */
  genderDistribution: {
    MALE: number;
    FEMALE: number;
    NEUTER: number;
    SPAY: number;
  };
  /** 品種分布（上位10件） */
  breedDistribution: Array<{
    breed: { id: string; name: string } | null;
    count: number;
  }>;
  /** タブ別カウント（猫一覧ページ用） */
  tabCounts: TabCounts;
}

/**
 * クエリキー定義
 */
const baseCatKeys = createDomainQueryKeys<string, GetCatsParams>('cats');

export const catKeys = {
  ...baseCatKeys,
  statistics: () => [...baseCatKeys.all, 'statistics'] as const,
  breedingHistory: (id: string) => [...baseCatKeys.all, 'breeding-history', id] as const,
  careHistory: (id: string) => [...baseCatKeys.all, 'care-history', id] as const,
  kittens: (params?: GetKittensParams) => [...baseCatKeys.all, 'kittens', params ?? {}] as const,
  family: (id: string) => [...baseCatKeys.all, 'family', id] as const,
};

/**
 * 猫一覧を取得するフック
 */
export function useGetCats(
  params: GetCatsParams = {},
  options?: Omit<UseQueryOptions<GetCatsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.list(params),
    queryFn: () => apiClient.get('/cats', { query: params as CatsListQuery }).then(res => ({
      data: res.data as Cat[],
      meta: res.meta as { total: number; page: number; limit: number; totalPages: number },
    })),
    ...options,
  });
}

/**
 * 猫詳細を取得するフック
 */
export function useGetCat(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<Cat>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.detail(id),
  queryFn: () => apiClient.get('/cats/{id}', { pathParams: { id } as CatDetailPathParams }) as Promise<ApiResponse<Cat>>,
    enabled: !!id,
    ...options,
  });
}

/**
 * 猫統計を取得するフック
 */
export function useGetCatStatistics(
  options?: Omit<UseQueryOptions<CatStatisticsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.statistics(),
    queryFn: async () => {
      const response = await apiClient.get('/cats/statistics');
      
      // ApiResponse<T> 形式の戻り値を型安全に処理
      if (!response.success || !response.data) {
        throw new Error('統計情報の取得に失敗しました');
      }
      
      const data = response.data;
      
      // データ形式を検証し、必要なプロパティを持つことを確認
      if (typeof data === 'object' && data !== null && 'tabCounts' in data) {
        return data as CatStatisticsResponse;
      }
      
      // 古い形式の場合はデフォルト値を追加
      if (typeof data === 'object' && data !== null) {
        const legacyData = data as Record<string, unknown>;
        return {
          total: typeof legacyData.total === 'number' ? legacyData.total : 0,
          genderDistribution: typeof legacyData.genderDistribution === 'object' && legacyData.genderDistribution !== null
            ? legacyData.genderDistribution as CatStatisticsResponse['genderDistribution']
            : { MALE: 0, FEMALE: 0, NEUTER: 0, SPAY: 0 },
          breedDistribution: Array.isArray(legacyData.breedDistribution)
            ? legacyData.breedDistribution as CatStatisticsResponse['breedDistribution']
            : [],
          tabCounts: { total: 0, male: 0, female: 0, kitten: 0, raising: 0, grad: 0 },
        };
      }
      
      // フォールバック: 空のデフォルト値
      return {
        total: 0,
        genderDistribution: { MALE: 0, FEMALE: 0, NEUTER: 0, SPAY: 0 },
        breedDistribution: [],
        tabCounts: { total: 0, male: 0, female: 0, kitten: 0, raising: 0, grad: 0 },
      };
    },
    ...options,
  });
}

/**
 * 猫を作成するフック
 */
export function useCreateCat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCatRequest) =>
      apiClient.post('/cats', {
        body: data as unknown as ApiRequestBody<'/cats', 'post'>,
      }) as Promise<ApiResponse<Cat>>,
  onSuccess: (_response) => {
      // キャッシュを無効化して再フェッチ
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: catKeys.statistics() });
      
      notifications.show({
        title: '成功',
        message: '猫情報を登録しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '猫情報の登録に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 猫情報を更新するフック
 */
export function useUpdateCat(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCatVariables) => {
      const targetId = resolveTargetCatId(data, id);

      const { id: _unusedId, ...payload } = data;

      return apiClient.patch('/cats/{id}', {
        pathParams: { id: targetId } as ApiPathParams<'/cats/{id}', 'patch'>,
        body: payload as unknown as ApiRequestBody<'/cats/{id}', 'patch'>,
      }) as Promise<ApiResponse<Cat>>;
    },
  onSuccess: (_response, variables) => {
      const targetId = resolveTargetCatId(variables, id);
      // 特定の猫の詳細キャッシュを更新
      void queryClient.invalidateQueries({ queryKey: catKeys.detail(targetId) });
      // 一覧のキャッシュも無効化
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: catKeys.statistics() });
      
      notifications.show({
        title: '成功',
        message: '猫情報を更新しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '猫情報の更新に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 猫を削除するフック
 */
export function useDeleteCat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete('/cats/{id}', {
      pathParams: { id } as ApiPathParams<'/cats/{id}', 'delete'>,
    }),
  onSuccess: (_response, id) => {
      // 削除した猫のキャッシュを削除
      void queryClient.removeQueries({ queryKey: catKeys.detail(id) });
      // 一覧のキャッシュも無効化
      void queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: catKeys.statistics() });
      
      notifications.show({
        title: '成功',
        message: '猫情報を削除しました',
        color: 'green',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'エラー',
        message: error.message || '猫情報の削除に失敗しました',
        color: 'red',
      });
    },
  });
}

/**
 * 猫の繁殖履歴を取得するフック
 */
export function useGetCatBreedingHistory(
  id: string,
  options?: Omit<UseQueryOptions<ApiResponse<unknown>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.breedingHistory(id),
    queryFn: () => apiClient.get('/cats/{id}/breeding-history', { pathParams: { id } }),
    enabled: !!id,
    ...options,
  });
}

/**
 * 子猫一覧を取得するフック（母猫ごとにグループ化）
 * 
 * NOTE: OpenAPI スキーマに /cats/kittens が追加されるまでは
 * apiRequest を直接使用してパスを指定しています。
 * スキーマ更新後は apiClient.get に移行してください。
 */
export function useGetKittens(
  params: GetKittensParams = {},
  options?: Omit<UseQueryOptions<GetKittensResponse>, 'queryKey' | 'queryFn'>,
) {
  // クエリパラメータを構築
  const queryString = new URLSearchParams();
  if (params.motherId) queryString.set('motherId', params.motherId);
  if (params.page) queryString.set('page', String(params.page));
  if (params.limit) queryString.set('limit', String(params.limit));
  if (params.search) queryString.set('search', params.search);
  if (params.sortBy) queryString.set('sortBy', params.sortBy);
  if (params.sortOrder) queryString.set('sortOrder', params.sortOrder);

  const urlPath = `/cats/kittens${queryString.toString() ? `?${queryString.toString()}` : ''}`;

  return useQuery({
    queryKey: catKeys.kittens(params),
    queryFn: async () => {
      // OpenAPI 型が生成されるまでは apiRequest を直接使用
      // apiRequest は { success, data, meta } 形式の ApiResponse<T> を返す
      const response = await apiRequest<KittenGroup[]>(urlPath);

      return {
        data: response.data ?? [],
        meta: (response.meta as GetKittensResponse['meta'] | undefined) ?? {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          totalGroups: 0,
        },
      };
    },
    ...options,
  });
}

/**
 * 猫の家族情報を取得するフック（血統タブ用）
 */
export function useGetCatFamily(
  id: string,
  options?: Omit<UseQueryOptions<CatFamilyResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: catKeys.family(id),
    queryFn: async () => {
      const response = await apiRequest<CatFamilyResponse>(`/cats/${id}/family`);
      if (!response.data) {
        throw new Error('家族情報が見つかりませんでした');
      }
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}
