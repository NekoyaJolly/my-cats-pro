'use client';

/**
 * ギャラリーカードコンポーネント
 * 個別の猫カード表示
 */

import {
  Card,
  Image,
  Text,
  Badge,
  Group,
  ActionIcon,
  Menu,
  Stack,
  AspectRatio,
} from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconPhoto,
  IconBrandYoutube,
} from '@tabler/icons-react';
import type { GalleryEntry } from '@/lib/api/hooks/use-gallery';
import { GenderBadge } from '@/components/GenderBadge';

/**
 * 性別を表示用に変換
 */
function formatGender(gender: string): 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY' {
  const upperGender = gender.toUpperCase();
  if (
    upperGender === 'MALE' ||
    upperGender === 'FEMALE' ||
    upperGender === 'NEUTER' ||
    upperGender === 'SPAY'
  ) {
    return upperGender;
  }
  // オス/メスの文字列対応
  if (gender === 'オス' || gender === '♂') return 'MALE';
  if (gender === 'メス' || gender === '♀') return 'FEMALE';
  return 'MALE';
}

/**
 * 日付フォーマット
 */
function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  try {
    const date = new Date(value);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * サムネイルURLの取得
 */
function getThumbnailUrl(entry: GalleryEntry): string | null {
  if (entry.media.length === 0) return null;

  // order順でソートして最初のメディアを取得
  const sortedMedia = [...entry.media].sort((a, b) => a.order - b.order);
  const firstMedia = sortedMedia[0];

  if (firstMedia.type === 'YOUTUBE') {
    return firstMedia.thumbnailUrl ?? null;
  }
  return firstMedia.url;
}

/**
 * メディアタイプの判定
 */
function getMediaInfo(entry: GalleryEntry): {
  hasImages: boolean;
  hasYouTube: boolean;
  count: number;
} {
  const hasImages = entry.media.some((m) => m.type === 'IMAGE');
  const hasYouTube = entry.media.some((m) => m.type === 'YOUTUBE');
  return {
    hasImages,
    hasYouTube,
    count: entry.media.length,
  };
}

interface GalleryCatCardProps {
  /** ギャラリーエントリ */
  entry: GalleryEntry;
  /** カードクリック時のコールバック */
  onClick?: () => void;
  /** 編集クリック時のコールバック */
  onEdit?: () => void;
  /** 削除クリック時のコールバック */
  onDelete?: () => void;
}

/**
 * ギャラリーカードコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryCatCard
 *   entry={entry}
 *   onClick={() => openDetail(entry.id)}
 *   onEdit={() => openEditModal(entry)}
 *   onDelete={() => confirmDelete(entry)}
 * />
 * ```
 */
export function GalleryCatCard({
  entry,
  onClick,
  onEdit,
  onDelete,
}: GalleryCatCardProps) {
  const thumbnailUrl = getThumbnailUrl(entry);
  const mediaInfo = getMediaInfo(entry);

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={(e) => {
        // メニューボタンのクリックは除外
        if ((e.target as HTMLElement).closest('[data-menu-button]')) {
          return;
        }
        onClick?.();
      }}
    >
      {/* サムネイル画像 */}
      <Card.Section>
        <AspectRatio ratio={4 / 3}>
          {thumbnailUrl ? (
            <Image src={thumbnailUrl} alt={entry.name} fit="cover" />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--mantine-color-gray-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconPhoto size={48} stroke={1} color="var(--mantine-color-gray-5)" />
            </div>
          )}
        </AspectRatio>
      </Card.Section>

      {/* カード本体 */}
      <Stack gap="xs" mt="sm">
        {/* ヘッダー: 名前とメニュー */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text fw={600} size="md" lineClamp={1}>
            {entry.name}
          </Text>
          {(onEdit || onDelete) && (
            <Menu shadow="md" position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  data-menu-button
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {onEdit && (
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    編集
                  </Menu.Item>
                )}
                {entry.externalLink && (
                  <Menu.Item
                    leftSection={<IconExternalLink size={14} />}
                    component="a"
                    href={entry.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    外部リンク
                  </Menu.Item>
                )}
                {onDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                    >
                      削除
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>

        {/* 性別と毛色 */}
        <Group gap="xs">
          <GenderBadge gender={formatGender(entry.gender)} size="xs" />
          {entry.coatColor && (
            <Badge size="xs" variant="light" color="gray">
              {entry.coatColor}
            </Badge>
          )}
        </Group>

        {/* 猫種 */}
        {entry.breed && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {entry.breed}
          </Text>
        )}

        {/* 卒業情報（GRADUATIONカテゴリの場合） */}
        {entry.category === 'GRADUATION' && entry.transferDate && (
          <Text size="xs" c="dimmed">
            卒業: {formatDate(entry.transferDate)}
          </Text>
        )}

        {/* メディア情報 */}
        {mediaInfo.count > 0 && (
          <Group gap={4}>
            {mediaInfo.hasImages && (
              <Badge
                size="xs"
                variant="dot"
                color="blue"
                leftSection={<IconPhoto size={10} />}
              >
                画像
              </Badge>
            )}
            {mediaInfo.hasYouTube && (
              <Badge
                size="xs"
                variant="dot"
                color="red"
                leftSection={<IconBrandYoutube size={10} />}
              >
                動画
              </Badge>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}
