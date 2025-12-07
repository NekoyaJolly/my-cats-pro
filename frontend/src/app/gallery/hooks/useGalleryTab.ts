'use client';

/**
 * ギャラリータブのURL同期管理フック
 * URLクエリパラメータとタブ状態を同期
 */

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { GalleryCategory } from '@/lib/api/hooks/use-gallery';

/**
 * 有効なタブ一覧
 */
const VALID_TABS: GalleryCategory[] = [
  'KITTEN',
  'FATHER',
  'MOTHER',
  'GRADUATION',
];

/**
 * デフォルトタブ
 */
const DEFAULT_TAB: GalleryCategory = 'KITTEN';

/**
 * タブのラベルマッピング
 */
export const TAB_LABELS: Record<GalleryCategory, string> = {
  KITTEN: '子猫',
  FATHER: '父猫',
  MOTHER: '母猫',
  GRADUATION: '卒業猫',
};

/**
 * URLクエリパラメータからカテゴリを判定するヘルパー
 */
function parseTabFromQuery(tabQuery: string | null): GalleryCategory {
  if (!tabQuery) return DEFAULT_TAB;
  const upperTab = tabQuery.toUpperCase() as GalleryCategory;
  return VALID_TABS.includes(upperTab) ? upperTab : DEFAULT_TAB;
}

/**
 * ギャラリータブ管理フック
 *
 * @returns currentTab - 現在のタブ
 * @returns setTab - タブを変更（URL同期）
 * @returns tabLabels - タブラベル一覧
 *
 * @example
 * ```tsx
 * const { currentTab, setTab } = useGalleryTab();
 *
 * return (
 *   <Tabs value={currentTab} onChange={(tab) => setTab(tab as GalleryCategory)}>
 *     ...
 *   </Tabs>
 * );
 * ```
 */
export function useGalleryTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * 現在のタブ（URLクエリから取得）
   */
  const currentTab = useMemo(() => {
    const tab = searchParams.get('tab');
    return parseTabFromQuery(tab);
  }, [searchParams]);

  /**
   * タブを変更し、URLを更新
   */
  const setTab = useCallback(
    (tab: GalleryCategory) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab.toLowerCase());
      // ページはリセット
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * 有効なタブ一覧を取得
   */
  const validTabs = useMemo(() => VALID_TABS, []);

  return {
    currentTab,
    setTab,
    tabLabels: TAB_LABELS,
    validTabs,
  };
}

/**
 * ギャラリーページネーション管理フック
 */
export function useGalleryPagination() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * 現在のページ番号
   */
  const currentPage = useMemo(() => {
    const page = searchParams.get('page');
    const parsed = page ? parseInt(page, 10) : 1;
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }, [searchParams]);

  /**
   * ページを変更し、URLを更新
   */
  const setPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return {
    currentPage,
    setPage,
  };
}
