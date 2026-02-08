'use client';

/**
 * ギャラリーグリッドコンポーネント
 * モバイル: 3列サムネイルグリッド + タップで詳細モーダル
 * デスクトップ: カードレイアウト（既存仕様維持）
 */

import { useState } from 'react';
import {
  SimpleGrid,
  Skeleton,
  Alert,
  Center,
  Stack,
  Text,
  Pagination,
  Box,
  Image,
  AspectRatio,
} from '@mantine/core';
import { useMediaQuery, useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconPhotoOff, IconPhoto, IconBrandYoutube } from '@tabler/icons-react';
import { GalleryCatCard, getThumbnailUrl } from './GalleryCatCard';
import { GalleryDetailModal } from './GalleryDetailModal';
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
  /** カードクリック時のコールバック（デスクトップ: ライトボックス表示） */
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
 * ローディングスケルトン（デスクトップ用）
 */
function LoadingSkeletonDesktop() {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4 }} spacing="md">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} height={280} radius="md" />
      ))}
    </SimpleGrid>
  );
}

/**
 * ローディングスケルトン（モバイル用 — 3×3グリッド）
 */
function LoadingSkeletonMobile() {
  return (
    <SimpleGrid cols={3} spacing={4}>
      {Array.from({ length: 9 }).map((_, i) => (
        <AspectRatio key={i} ratio={1}>
          <Skeleton radius={4} />
        </AspectRatio>
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
 * モバイルサムネイルセル
 * 正方形サムネイル + 猫名オーバーレイ
 */
function MobileThumbnailCell({
  entry,
  onClick,
}: {
  entry: GalleryEntry;
  onClick: () => void;
}) {
  const thumbnailUrl = getThumbnailUrl(entry);
  const hasYouTube = entry.media.some((m) => m.type === 'YOUTUBE');

  return (
    <AspectRatio ratio={1}>
      <Box
        onClick={onClick}
        style={{
          cursor: 'pointer',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {/* サムネイル画像 */}
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={entry.name}
            fit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Box
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--mantine-color-gray-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconPhoto size={24} stroke={1} color="var(--mantine-color-gray-5)" />
          </Box>
        )}

        {/* YouTube バッジ（右上） */}
        {hasYouTube && (
          <Box
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 4,
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconBrandYoutube size={12} color="var(--mantine-color-red-5)" />
          </Box>
        )}

        {/* 猫名オーバーレイ（下部） */}
        <Box
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
            padding: '12px 6px 4px',
          }}
        >
          <Text
            size="xs"
            c="white"
            fw={600}
            lineClamp={1}
            style={{ lineHeight: 1.3 }}
          >
            {entry.name}
          </Text>
        </Box>
      </Box>
    </AspectRatio>
  );
}

/**
 * ギャラリーグリッドコンポーネント
 *
 * モバイル（576px未満）: 3列サムネイルグリッド + 詳細モーダル
 * デスクトップ: 従来のカードレイアウト
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
  // モバイル判定（Mantine の sm ブレークポイント = 576px）
  const isMobile = useMediaQuery('(max-width: 575px)');

  // モバイル詳細モーダル用の状態
  const [detailEntry, setDetailEntry] = useState<GalleryEntry | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);

  const handleThumbnailClick = (entry: GalleryEntry) => {
    setDetailEntry(entry);
    openDetail();
  };

  const handleDetailMediaClick = (entry: GalleryEntry) => {
    closeDetail();
    // 少し遅延させてモーダルの閉じアニメーション後にライトボックスを開く
    setTimeout(() => {
      onCardClick?.(entry);
    }, 200);
  };

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
    return isMobile ? <LoadingSkeletonMobile /> : <LoadingSkeletonDesktop />;
  }

  // 空状態
  if (entries.length === 0) {
    return <EmptyState category={category} />;
  }

  return (
    <Stack gap="md">
      {isMobile ? (
        /* ===== モバイル: 3列サムネイルグリッド ===== */
        <SimpleGrid cols={3} spacing={4}>
          {entries.map((entry) => (
            <MobileThumbnailCell
              key={entry.id}
              entry={entry}
              onClick={() => handleThumbnailClick(entry)}
            />
          ))}
        </SimpleGrid>
      ) : (
        /* ===== デスクトップ: 従来のカードレイアウト ===== */
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
      )}

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

      {/* モバイル詳細モーダル */}
      <GalleryDetailModal
        entry={detailEntry}
        opened={detailOpened}
        onClose={closeDetail}
        onMediaClick={handleDetailMediaClick}
        onEdit={onEditClick ? (entry) => {
          onEditClick(entry);
          closeDetail();
        } : undefined}
        onDelete={onDeleteClick ? (entry) => {
          onDeleteClick(entry);
          closeDetail();
        } : undefined}
      />
    </Stack>
  );
}
