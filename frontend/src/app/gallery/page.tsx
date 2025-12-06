'use client';

/**
 * ギャラリーページ
 * 4つのカテゴリ（子猫 / 父猫 / 母猫 / 卒業猫）をタブ切り替えで表示
 */

import React, { Suspense, useState } from 'react';
import {
  Container,
  Stack,
  Button,
  Group,
  Skeleton,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import {
  useGalleryEntries,
  useCreateGalleryEntry,
  useDeleteGalleryEntry,
  type GalleryEntry,
  type GalleryCategory,
} from '@/lib/api/hooks/use-gallery';
import { GalleryTabs } from './components/GalleryTabs';
import { GalleryGrid } from './components/GalleryGrid';
import { GalleryAddModal } from './components/GalleryAddModal';
import { MediaLightbox } from './components/MediaLightbox';
import { useGalleryTab, useGalleryPagination } from './hooks/useGalleryTab';

/**
 * ギャラリーコンテンツコンポーネント
 * Suspense境界内で使用
 */
function GalleryContent() {
  const { setPageHeader } = usePageHeader();
  const { currentTab } = useGalleryTab();
  const { currentPage, setPage } = useGalleryPagination();

  // ページヘッダー設定
  React.useEffect(() => {
    setPageHeader('ギャラリー');
  }, [setPageHeader]);

  // モーダル状態
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] =
    useDisclosure(false);
  const [lightboxOpened, { open: openLightbox, close: closeLightbox }] =
    useDisclosure(false);
  const [selectedEntry, setSelectedEntry] = useState<GalleryEntry | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // API フック
  const {
    data: galleryData,
    isLoading,
    error,
  } = useGalleryEntries(currentTab, currentPage, 20);

  const { mutate: createEntry, isPending: isCreating } =
    useCreateGalleryEntry();
  const { mutate: deleteEntry } =
    useDeleteGalleryEntry();

  // 全カテゴリの件数取得（カウント用）
  const { data: kittenData } = useGalleryEntries('KITTEN', 1, 1);
  const { data: fatherData } = useGalleryEntries('FATHER', 1, 1);
  const { data: motherData } = useGalleryEntries('MOTHER', 1, 1);
  const { data: graduationData } = useGalleryEntries('GRADUATION', 1, 1);

  const counts: Record<GalleryCategory, number> = {
    KITTEN: kittenData?.meta?.total ?? 0,
    FATHER: fatherData?.meta?.total ?? 0,
    MOTHER: motherData?.meta?.total ?? 0,
    GRADUATION: graduationData?.meta?.total ?? 0,
  };

  // ハンドラ
  const handleCardClick = (entry: GalleryEntry) => {
    if (entry.media.length > 0) {
      setSelectedEntry(entry);
      setLightboxIndex(0);
      openLightbox();
    }
  };

  const handleEditClick = (entry: GalleryEntry) => {
    // TODO: 編集モーダルを実装
    console.log('Edit entry:', entry.id);
  };

  const handleDeleteClick = (entry: GalleryEntry) => {
    modals.openConfirmModal({
      title: '削除の確認',
      children: (
        <Text size="sm">
          「{entry.name}」をギャラリーから削除しますか？
          <br />
          この操作は取り消せません。
        </Text>
      ),
      labels: { confirm: '削除', cancel: 'キャンセル' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        deleteEntry(entry.id);
      },
    });
  };

  const handleAddSubmit = (dto: Parameters<typeof createEntry>[0]) => {
    createEntry(dto, {
      onSuccess: () => {
        closeAddModal();
      },
    });
  };

  const handleCloseLightbox = () => {
    closeLightbox();
    setSelectedEntry(null);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* ヘッダー: タブとアクション */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <GalleryTabs counts={counts} loading={isLoading} />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={openAddModal}
            disabled={isLoading}
          >
            追加
          </Button>
        </Group>

        {/* グリッド */}
        <GalleryGrid
          entries={galleryData?.data ?? []}
          loading={isLoading}
          error={error ? (error instanceof Error ? error.message : 'エラーが発生しました') : null}
          category={currentTab}
          onCardClick={handleCardClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          currentPage={currentPage}
          totalPages={galleryData?.meta?.totalPages}
          onPageChange={setPage}
        />
      </Stack>

      {/* 追加モーダル */}
      <GalleryAddModal
        opened={addModalOpened}
        onClose={closeAddModal}
        category={currentTab}
        onSubmit={handleAddSubmit}
        loading={isCreating}
      />

      {/* ライトボックス */}
      {selectedEntry && (
        <MediaLightbox
          media={selectedEntry.media}
          opened={lightboxOpened}
          onClose={handleCloseLightbox}
          initialIndex={lightboxIndex}
        />
      )}
    </Container>
  );
}

/**
 * ギャラリーページローディングスケルトン
 */
function GalleryLoading() {
  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Skeleton height={42} width={400} />
        <Skeleton height={600} />
      </Stack>
    </Container>
  );
}

/**
 * ギャラリーページ
 */
export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryContent />
    </Suspense>
  );
}
