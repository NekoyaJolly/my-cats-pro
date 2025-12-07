# ギャラリー機能 Phase 3: フロントエンドUI

## 概要

ギャラリーページのUIを刷新し、4つのカテゴリ（Kittens / Fathers / Mothers / Graduations）をタブ切り替えで表示します。URLクエリ同期、カード表示、メディアカルーセルを実装します。

## 技術要件

- **フレームワーク**: Next.js 15 (App Router)
- **UIライブラリ**: Mantine v7
- **状態管理**: TanStack Query (React Query)
- **パフォーマンス**: 遅延読み込み、画像最適化

## 実装タスク

### 1. ファイル構成

```
frontend/src/app/gallery/
├── page.tsx                       # メインページ
├── components/
│   ├── GalleryTabs.tsx            # タブ切り替え + URLクエリ同期
│   ├── GalleryGrid.tsx            # カードグリッド表示
│   ├── GalleryCatCard.tsx         # 個別カード
│   ├── MediaCarousel.tsx          # 画像・動画カルーセル
│   ├── MediaLightbox.tsx          # フルスクリーン表示
│   ├── GalleryAddModal.tsx        # 追加モーダル
│   ├── ImageUploader.tsx          # 画像アップロードUI
│   └── YouTubeInput.tsx           # YouTube URL入力
└── hooks/
    └── useGalleryTab.ts           # URLクエリ管理
```

### 2. API Hooks

#### 2-1. ギャラリーAPI用フック

**frontend/src/lib/api/hooks/use-gallery. ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

// 型定義
export type GalleryCategory = 'KITTEN' | 'FATHER' | 'MOTHER' | 'GRADUATION';

export interface GalleryMedia {
  id: string;
  type: 'IMAGE' | 'YOUTUBE';
  url: string;
  thumbnailUrl?: string;
  order: number;
  createdAt: string;
}

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
    type: 'IMAGE' | 'YOUTUBE';
    url: string;
    thumbnailUrl?: string;
    order?: number;
  }[];
}

/**
 * ギャラリー一覧取得
 */
export function useGalleryEntries(
  category?: GalleryCategory,
  page: number = 1,
  limit: number = 20
) {
  return useQuery<GalleryResponse>({
    queryKey: ['gallery', category, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await fetch(`${API_BASE_URL}/gallery?${params}`);
      if (!res.ok) throw new Error('ギャラリーの取得に失敗しました');
      return res.json();
    },
    staleTime: category === 'KITTEN' ? 5 * 60 * 1000 : 60 * 60 * 1000, // Kittens: 5分、他: 1時間
  });
}

/**
 * ギャラリー詳細取得
 */
export function useGalleryEntry(id: string | null) {
  return useQuery<{ success: boolean; data: GalleryEntry }>({
    queryKey: ['gallery', id],
    queryFn: async () => {
      if (!id) throw new Error('IDが必要です');
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`);
      if (!res.ok) throw new Error('ギャラリーの取得に失敗しました');
      return res.json();
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
      const res = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (! res.ok) throw new Error('登録に失敗しました');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
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
      const res = await fetch(`${API_BASE_URL}/gallery/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entries),
      });
      if (! res.ok) throw new Error('一括登録に失敗しました');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
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
      const res = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
      });
      if (!res. ok) throw new Error('削除に失敗しました');
      return res. json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
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
      media: { type: 'IMAGE' | 'YOUTUBE'; url: string; thumbnailUrl?: string };
    }) => {
      const res = await fetch(`${API_BASE_URL}/gallery/${entryId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media),
      });
      if (!res.ok) throw new Error('メディア追加に失敗しました');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
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
      const res = await fetch(`${API_BASE_URL}/gallery/media/${mediaId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('メディア削除に失敗しました');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}
```

### 3. URLクエリ管理フック

**frontend/src/app/gallery/hooks/useGalleryTab.ts**

```typescript
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { GalleryCategory } from '@/lib/api/hooks/use-gallery';

const VALID_TABS: GalleryCategory[] = ['KITTEN', 'FATHER', 'MOTHER', 'GRADUATION'];
const DEFAULT_TAB: GalleryCategory = 'KITTEN';

export function useGalleryTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = useMemo(() => {
    const tab = searchParams.get('tab')?.toUpperCase() as GalleryCategory;
    return VALID_TABS. includes(tab) ?  tab : DEFAULT_TAB;
  }, [searchParams]);

  const setTab = useCallback(
    (tab: GalleryCategory) => {
      const params = new URLSearchParams(searchParams. toString());
      params.set('tab', tab. toLowerCase());
      router.push(`${pathname}?${params. toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  return { currentTab, setTab };
}
```

### 4.  ギャラリーページ

**frontend/src/app/gallery/page. tsx**

```typescript
'use client';

import React, { Suspense } from 'react';
import { Container, Stack, Skeleton } from '@mantine/core';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { GalleryTabs } from './components/GalleryTabs';
import { GalleryGrid } from './components/GalleryGrid';
import { useGalleryTab } from './hooks/useGalleryTab