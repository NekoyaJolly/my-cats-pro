'use client';

/**
 * ギャラリーグリッドコンポーネント
 * カードをレスポンシブグリッドで表示
 */

import {
  SimpleGrid,
  Skeleton,
  Alert,
  Center,
  Stack,
  Text,
  Pagination,
} from '@mantine/core';
import { IconAlertCircle, IconPhotoOff } from '@tabler/icons-react';
import { GalleryCatCard } from './GalleryCatCard';
import type { GalleryEntry, GalleryCategory } from '@/lib/api/hooks/use-gallery';

interface GalleryGridProps {
  /** エントリ一覧 */
  entries: GalleryEntry[];
  /** ローディング中フラグ */
  loading?: boolean;
  /** エラーメッセージ */
  error?: string | null;
  /** 現在のカテゴリ */
  category: GalleryCategory;
  /** カードクリック時のコールバック */
  onCardClick?: (entry: GalleryEntry) => void;
  /** 編集クリック時のコールバック */
  onEditClick?: (entry: GalleryEntry) => void;
  /** 削除クリック時のコールバック */
  onDeleteClick?: (entry: GalleryEntry) => void;
  /** ページネーション: 現在ページ */
  currentPage?: number;
  /** ページネーション: 総ページ数 */
  totalPages?: number;
  /** ページネーション: ページ変更コールバック */
  onPageChange?: (page: number) => void;
}

/**
 * ローディングスケルトン
 */
function LoadingSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={280} radius="md" />
      ))}
    </SimpleGrid>
  );
}

/**
 * 空状態の表示
 */
function EmptyState({ category }: { category: GalleryCategory }) {
  const categoryLabels: Record<GalleryCategory, string> = {
    KITTEN: '子猫',
    FATHER: '父猫',
    MOTHER: '母猫',
    GRADUATION: '卒業猫',
  };

  return (
    <Center py="xl">
      <Stack align="center" gap="md">
        <IconPhotoOff size={48} stroke={1.5} color="gray" />
        <Text c="dimmed" ta="center">
          {categoryLabels[category]}のギャラリーがまだありません
        </Text>
      </Stack>
    </Center>
  );
}

/**
 * ギャラリーグリッドコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryGrid
 *   entries={data}
 *   loading={isLoading}
 *   category="KITTEN"
 *   onCardClick={(entry) => openDetail(entry.id)}
 * />
 * ```
 */
export function GalleryGrid({
  entries,
  loading,
  error,
  category,
  onCardClick,
  onEditClick,
  onDeleteClick,
  currentPage,
  totalPages,
  onPageChange,
}: GalleryGridProps) {
  // エラー表示
  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="エラー"
        color="red"
        variant="light"
      >
        {error}
      </Alert>
    );
  }

  // ローディング表示
  if (loading) {
    return <LoadingSkeleton />;
  }

  // 空状態
  if (entries.length === 0) {
    return <EmptyState category={category} />;
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
        {entries.map((entry) => (
          <GalleryCatCard
            key={entry.id}
            entry={entry}
            onClick={() => onCardClick?.(entry)}
            onEdit={() => onEditClick?.(entry)}
            onDelete={() => onDeleteClick?.(entry)}
          />
        ))}
      </SimpleGrid>

      {/* ページネーション */}
      {totalPages && totalPages > 1 && onPageChange && (
        <Center mt="md">
          <Pagination
            value={currentPage}
            onChange={onPageChange}
            total={totalPages}
            siblings={1}
            boundaries={1}
          />
        </Center>
      )}
    </Stack>
  );
}
