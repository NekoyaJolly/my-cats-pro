'use client';

import { useMemo, useState } from 'react';

import {
  useGetTagCategories,
  useCreateTagCategory,
  useUpdateTagCategory,
  useDeleteTagCategory,
  useReorderTagCategories,
  useCreateTagGroup,
  useUpdateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  useReorderTags,
  type TagCategoryFilters,
} from '@/lib/api/hooks/use-tags';
import {
  useGetTagColorDefaults,
  useUpdateTagColorDefaults,
} from '@/lib/api/hooks/use-tenant-settings';

import type { TagFiltersState } from '../types';
import { sortCategories, sortGroups, sortTags } from '../utils';

/**
 * タグページのデータ取得・ミューテーション用フック
 */
export function useTagPageData() {
  // フィルタ状態
  const [filters, setFilters] = useState<TagFiltersState>({
    scopes: [],
    includeInactive: false,
  });

  // クエリフィルタを構築
  const queryFilters = useMemo<TagCategoryFilters | undefined>(() => {
    const payload: TagCategoryFilters = {};
    if (filters.scopes.length) {
      payload.scope = filters.scopes;
    }
    if (filters.includeInactive) {
      payload.includeInactive = true;
    }
    return Object.keys(payload).length ? payload : undefined;
  }, [filters]);

  // データ取得
  const { data, isLoading, isFetching } = useGetTagCategories(queryFilters, {
    placeholderData: (previousData) => previousData,
  });

  // カテゴリデータを整形
  const categories = useMemo(() => data?.data ?? [], [data]);
  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);

  // 利用可能なスコープを抽出
  const availableScopes = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((category) => {
      category.scopes.forEach((scope) => {
        if (scope) {
          set.add(scope);
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [categories]);

  // フラットなタグリストを生成
  const flatTags = useMemo(() => {
    return sortedCategories.flatMap((category) =>
      sortGroups(category.groups).flatMap((group) =>
        sortTags(group.tags).map((tag) => ({ category, group, tag })),
      ),
    );
  }, [sortedCategories]);

  // ミューテーション
  const createCategory = useCreateTagCategory();
  const updateCategory = useUpdateTagCategory();
  const deleteCategory = useDeleteTagCategory();
  const reorderCategoriesMutation = useReorderTagCategories();
  const createGroup = useCreateTagGroup();
  const updateGroup = useUpdateTagGroup();
  const deleteGroup = useDeleteTagGroup();
  const reorderGroupsMutation = useReorderTagGroups();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const reorderTagsMutation = useReorderTags();

  // テナントのデフォルトカラー設定
  const { data: colorDefaults } = useGetTagColorDefaults();
  const updateTagColorDefaults = useUpdateTagColorDefaults();

  // ミューテーション状態
  const isCategorySubmitting = createCategory.isPending || updateCategory.isPending;
  const isGroupSubmitting = createGroup.isPending || updateGroup.isPending;
  const isTagSubmitting = createTag.isPending || updateTag.isPending;
  const isAnyMutationPending =
    isCategorySubmitting ||
    isGroupSubmitting ||
    isTagSubmitting ||
    deleteCategory.isPending ||
    deleteGroup.isPending ||
    deleteTag.isPending ||
    reorderCategoriesMutation.isPending ||
    reorderGroupsMutation.isPending ||
    reorderTagsMutation.isPending;

  return {
    // フィルタ
    filters,
    setFilters,
    // データ
    isLoading,
    isFetching,
    categories,
    sortedCategories,
    availableScopes,
    flatTags,
    // カテゴリ操作
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategoriesMutation,
    // グループ操作
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroupsMutation,
    // タグ操作
    createTag,
    updateTag,
    deleteTag,
    reorderTagsMutation,
    // デフォルトカラー
    colorDefaults,
    updateTagColorDefaults,
    // ミューテーション状態
    isCategorySubmitting,
    isGroupSubmitting,
    isTagSubmitting,
    isAnyMutationPending,
  };
}








