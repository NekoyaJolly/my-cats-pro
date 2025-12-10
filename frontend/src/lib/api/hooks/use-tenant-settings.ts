import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../client';
import { createDomainQueryKeys } from './query-key-factory';

// テナント設定用のクエリキーファクトリ
const tenantSettingsKeys = createDomainQueryKeys('tenant-settings', {
  extras: {
    tagColorDefaults: () => [] as const,
  },
});

/**
 * カラー設定（背景色とテキスト色）
 */
export interface ColorSetting {
  color: string;
  textColor: string;
}

/**
 * タグカラーデフォルト設定
 */
export interface TagColorDefaults {
  category?: ColorSetting;
  group?: ColorSetting;
  tag?: ColorSetting;
}

/**
 * タグカラーデフォルト設定更新リクエスト
 * 部分更新をサポート
 */
export interface UpdateTagColorDefaultsRequest {
  category?: Partial<ColorSetting>;
  group?: Partial<ColorSetting>;
  tag?: Partial<ColorSetting>;
}

/**
 * テナントのタグカラーデフォルト設定を取得
 */
export function useGetTagColorDefaults() {
  return useQuery<TagColorDefaults>({
    queryKey: tenantSettingsKeys.extras!.tagColorDefaults(),
    queryFn: async () => {
      const response = await api.get<TagColorDefaults>('/tenant-settings/tag-color-defaults');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
  });
}

/**
 * テナントのタグカラーデフォルト設定を更新
 */
export function useUpdateTagColorDefaults() {
  const queryClient = useQueryClient();

  return useMutation<TagColorDefaults, Error, UpdateTagColorDefaultsRequest>({
    mutationFn: async (request: UpdateTagColorDefaultsRequest) => {
      const response = await api.put<TagColorDefaults>(
        '/tenant-settings/tag-color-defaults',
        request
      );
      return response.data;
    },
    onSuccess: (data) => {
      // キャッシュを更新
      queryClient.setQueryData(
        tenantSettingsKeys.extras!.tagColorDefaults(),
        data
      );
    },
  });
}
