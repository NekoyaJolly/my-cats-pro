'use client';

/**
 * ギャラリー詳細モーダルコンポーネント
 * モバイルサムネイルタップ時に猫の詳細情報を表示
 */

import {
    Modal,
    Image,
    Text,
    Badge,
    Group,
    Stack,
    ActionIcon,
    Menu,
    AspectRatio,
    Box,
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
import {
    getThumbnailUrl,
    getMediaInfo,
    formatGender,
    formatDate,
} from './GalleryCatCard';

interface GalleryDetailModalProps {
    /** 表示するエントリ（nullで非表示） */
    entry: GalleryEntry | null;
    /** 表示/非表示 */
    opened: boolean;
    /** 閉じるコールバック */
    onClose: () => void;
    /** メディアタップ（ライトボックスを開く） */
    onMediaClick?: (entry: GalleryEntry) => void;
    /** 編集コールバック */
    onEdit?: (entry: GalleryEntry) => void;
    /** 削除コールバック */
    onDelete?: (entry: GalleryEntry) => void;
}

/**
 * ギャラリー詳細モーダル（モバイル用）
 *
 * サムネイルグリッドからタップして開く詳細ビュー。
 * 猫の基本情報とメディアプレビューを表示し、
 * ライトボックスへの遷移や編集・削除操作を提供する。
 */
export function GalleryDetailModal({
    entry,
    opened,
    onClose,
    onMediaClick,
    onEdit,
    onDelete,
}: GalleryDetailModalProps) {
    if (!entry) return null;

    const thumbnailUrl = getThumbnailUrl(entry);
    const mediaInfo = getMediaInfo(entry);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={entry.name}
            size="sm"
            centered
            radius="lg"
            styles={{
                title: {
                    fontWeight: 700,
                    fontSize: 'var(--mantine-font-size-lg)',
                },
                header: {
                    paddingBottom: 4,
                },
            }}
        >
            <Stack gap="md">
                {/* サムネイル画像 — タップでライトボックス */}
                <Box
                    style={{ cursor: entry.media.length > 0 ? 'pointer' : 'default' }}
                    onClick={() => {
                        if (entry.media.length > 0) {
                            onMediaClick?.(entry);
                        }
                    }}
                >
                    <AspectRatio ratio={4 / 3} style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
                        {thumbnailUrl ? (
                            <Image src={thumbnailUrl} alt={entry.name} fit="cover" />
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
                                <IconPhoto size={48} stroke={1} color="var(--mantine-color-gray-5)" />
                            </Box>
                        )}
                    </AspectRatio>

                    {/* メディア枚数バッジ（右下にオーバーレイ） */}
                    {mediaInfo.count > 1 && (
                        <Badge
                            size="sm"
                            variant="filled"
                            color="dark"
                            style={{
                                position: 'relative',
                                marginTop: -32,
                                marginLeft: 'auto',
                                marginRight: 8,
                                display: 'block',
                                width: 'fit-content',
                                opacity: 0.85,
                            }}
                        >
                            {mediaInfo.count}枚
                        </Badge>
                    )}
                </Box>

                {/* 猫情報 */}
                <Stack gap="xs">
                    {/* 性別と毛色 */}
                    <Group gap="xs">
                        <GenderBadge gender={formatGender(entry.gender)} size="sm" />
                        {entry.coatColor && (
                            <Badge size="sm" variant="light" color="gray">
                                {entry.coatColor}
                            </Badge>
                        )}
                    </Group>

                    {/* 猫種 */}
                    {entry.breed && (
                        <Text size="sm" c="dimmed">
                            {entry.breed}
                        </Text>
                    )}

                    {/* 卒業情報 */}
                    {entry.category === 'GRADUATION' && entry.transferDate && (
                        <Text size="sm" c="dimmed">
                            卒業: {formatDate(entry.transferDate)}
                        </Text>
                    )}

                    {/* メディアタイプバッジ */}
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

                    {/* 備考 */}
                    {entry.notes && (
                        <Text size="xs" c="dimmed" lineClamp={3}>
                            {entry.notes}
                        </Text>
                    )}
                </Stack>

                {/* アクションボタン */}
                {(onEdit || onDelete || entry.externalLink) && (
                    <Group justify="flex-end">
                        <Menu shadow="md" position="bottom-end" withinPortal>
                            <Menu.Target>
                                <ActionIcon variant="light" color="gray" size="md">
                                    <IconDots size={18} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {onEdit && (
                                    <Menu.Item
                                        leftSection={<IconEdit size={14} />}
                                        onClick={() => {
                                            onEdit(entry);
                                            onClose();
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
                                            onClick={() => {
                                                onDelete(entry);
                                                onClose();
                                            }}
                                        >
                                            削除
                                        </Menu.Item>
                                    </>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                )}
            </Stack>
        </Modal>
    );
}
