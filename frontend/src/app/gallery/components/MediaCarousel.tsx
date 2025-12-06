'use client';

/**
 * メディアカルーセルコンポーネント
 * 画像とYouTube動画のスライド表示
 */

import { useState } from 'react';
import {
  Box,
  Image,
  ActionIcon,
  Group,
  AspectRatio,
  Indicator,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconChevronRight,
  IconBrandYoutube,
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

/**
 * YouTube埋め込みコンポーネント
 */
function YouTubeEmbed({ url }: { url: string }) {
  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
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
        <IconBrandYoutube size={48} color="var(--mantine-color-red-5)" />
      </Box>
    );
  }

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
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
}

interface MediaCarouselProps {
  /** メディア一覧 */
  media: GalleryMedia[];
  /** アスペクト比 */
  aspectRatio?: number;
  /** クリック時のコールバック（ライトボックス表示用） */
  onMediaClick?: (index: number) => void;
}

/**
 * メディアカルーセルコンポーネント
 *
 * @example
 * ```tsx
 * <MediaCarousel
 *   media={entry.media}
 *   aspectRatio={4 / 3}
 *   onMediaClick={(index) => openLightbox(index)}
 * />
 * ```
 */
export function MediaCarousel({
  media,
  aspectRatio = 4 / 3,
  onMediaClick,
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // order順でソート
  const sortedMedia = [...media].sort((a, b) => a.order - b.order);

  if (sortedMedia.length === 0) {
    return null;
  }

  const currentMedia = sortedMedia[currentIndex];
  const hasMultiple = sortedMedia.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === 0 ? sortedMedia.length - 1 : prev - 1
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) =>
      prev === sortedMedia.length - 1 ? 0 : prev + 1
    );
  };

  const handleClick = () => {
    onMediaClick?.(currentIndex);
  };

  return (
    <Box pos="relative">
      <AspectRatio ratio={aspectRatio}>
        <Box
          onClick={handleClick}
          style={{ cursor: onMediaClick ? 'pointer' : 'default' }}
        >
          {currentMedia.type === 'YOUTUBE' ? (
            <YouTubeEmbed url={currentMedia.url} />
          ) : (
            <Image
              src={currentMedia.url}
              alt="Gallery media"
              fit="cover"
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </Box>
      </AspectRatio>

      {/* ナビゲーションボタン */}
      {hasMultiple && (
        <>
          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="lg"
            pos="absolute"
            left={8}
            top="50%"
            style={{ transform: 'translateY(-50%)' }}
            onClick={handlePrev}
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <ActionIcon
            variant="filled"
            color="dark"
            opacity={0.7}
            radius="xl"
            size="lg"
            pos="absolute"
            right={8}
            top="50%"
            style={{ transform: 'translateY(-50%)' }}
            onClick={handleNext}
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </>
      )}

      {/* インジケーター */}
      {hasMultiple && (
        <Group
          gap={4}
          justify="center"
          pos="absolute"
          bottom={8}
          left={0}
          right={0}
        >
          {sortedMedia.map((m, index) => (
            <Indicator
              key={m.id}
              color={index === currentIndex ? 'blue' : 'gray'}
              size={8}
              processing={false}
              position="middle-center"
              offset={0}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
            >
              <Box w={8} h={8} />
            </Indicator>
          ))}
        </Group>
      )}

      {/* YouTubeバッジ */}
      {currentMedia.type === 'YOUTUBE' && (
        <Box
          pos="absolute"
          top={8}
          right={8}
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            borderRadius: 4,
            padding: '2px 6px',
          }}
        >
          <IconBrandYoutube size={16} color="white" />
        </Box>
      )}
    </Box>
  );
}
