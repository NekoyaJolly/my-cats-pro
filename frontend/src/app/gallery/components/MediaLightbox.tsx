'use client';

/**
 * メディアライトボックスコンポーネント
 * フルスクリーンでのメディア表示
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Box,
  Image,
  ActionIcon,
  Group,
  Text,
  Stack,
  CloseButton,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconBrandYoutube,
  IconDownload,
} from '@tabler/icons-react';
import type { GalleryMedia } from '@/lib/api/hooks/use-gallery';

/**
 * YouTube URLからビデオIDを抽出
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

interface MediaLightboxProps {
  /** メディア一覧 */
  media: GalleryMedia[];
  /** 表示/非表示 */
  opened: boolean;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** 初期表示インデックス */
  initialIndex?: number;
}

/**
 * メディアライトボックスコンポーネント
 *
 * @example
 * ```tsx
 * <MediaLightbox
 *   media={entry.media}
 *   opened={lightboxOpened}
 *   onClose={() => setLightboxOpened(false)}
 *   initialIndex={0}
 * />
 * ```
 */
export function MediaLightbox({
  media,
  opened,
  onClose,
  initialIndex = 0,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // order順でソート
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);

  // 初期インデックスが変わったらリセット
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentMedia = sortedMedia[currentIndex];
  const hasMultiple = sortedMedia.length > 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? sortedMedia.length - 1 : prev - 1
    );
  }, [sortedMedia.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === sortedMedia.length - 1 ? 0 : prev + 1
    );
  }, [sortedMedia.length]);

  // キーボードナビゲーション
  useEffect(() => {
    if (!opened) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [opened, handlePrev, handleNext, onClose]);

  if (sortedMedia.length === 0) {
    return null;
  }

  const handleDownload = async () => {
    if (currentMedia.type === 'YOUTUBE') return;

    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gallery-${currentMedia.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // ダウンロード失敗時は何もしない
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
        },
        content: {
          backgroundColor: 'transparent',
        },
      }}
    >
      {/* ヘッダー */}
      <Group
        justify="space-between"
        p="md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <Text c="white" size="sm">
          {currentIndex + 1} / {sortedMedia.length}
        </Text>
        <Group gap="xs">
          {currentMedia.type === 'IMAGE' && (
            <ActionIcon
              variant="subtle"
              color="white"
              size="lg"
              onClick={handleDownload}
              title="ダウンロード"
            >
              <IconDownload size={20} />
            </ActionIcon>
          )}
          <CloseButton
            variant="subtle"
            color="white"
            size="lg"
            onClick={onClose}
          />
        </Group>
      </Group>

      {/* メインコンテンツ */}
      <Box
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '0 60px',
        }}
      >
        {/* 前へボタン */}
        {hasMultiple && (
          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="xl"
            pos="absolute"
            left={16}
            onClick={handlePrev}
          >
            <IconChevronLeft size={24} />
          </ActionIcon>
        )}

        {/* メディア表示 */}
        <Box
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentMedia.type === 'YOUTUBE' ? (
            <Box
              style={{
                width: '80vw',
                maxWidth: '1200px',
                aspectRatio: '16 / 9',
              }}
            >
              {(() => {
                const videoId = extractYouTubeId(currentMedia.url);
                if (!videoId) {
                  return (
                    <Stack align="center" justify="center" h="100%">
                      <IconBrandYoutube
                        size={64}
                        color="var(--mantine-color-red-5)"
                      />
                      <Text c="white">動画を読み込めませんでした</Text>
                    </Stack>
                  );
                }
                return (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                );
              })()}
            </Box>
          ) : (
            <Image
              src={currentMedia.url}
              alt="Gallery media"
              fit="contain"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100vh - 120px)',
              }}
            />
          )}
        </Box>

        {/* 次へボタン */}
        {hasMultiple && (
          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="xl"
            pos="absolute"
            right={16}
            onClick={handleNext}
          >
            <IconChevronRight size={24} />
          </ActionIcon>
        )}
      </Box>

      {/* サムネイル一覧 */}
      {hasMultiple && (
        <Group
          gap="xs"
          justify="center"
          p="md"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          {sortedMedia.map((m, index) => (
            <Box
              key={m.id}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: 60,
                height: 60,
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                border:
                  index === currentIndex
                    ? '2px solid var(--mantine-color-blue-5)'
                    : '2px solid transparent',
                opacity: index === currentIndex ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            >
              {m.type === 'YOUTUBE' ? (
                <Box
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--mantine-color-dark-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconBrandYoutube
                    size={20}
                    color="var(--mantine-color-red-5)"
                  />
                </Box>
              ) : (
                <Image
                  src={m.thumbnailUrl || m.url}
                  alt="Thumbnail"
                  fit="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </Box>
          ))}
        </Group>
      )}
    </Modal>
  );
}
