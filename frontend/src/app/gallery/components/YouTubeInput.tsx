'use client';

/**
 * YouTube URL入力コンポーネント
 * YouTube URLの入力とサムネイル取得
 */

import { useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Paper,
  Text,
  Image,
  Stack,
  ActionIcon,
  Box,
} from '@mantine/core';
import { IconBrandYoutube, IconPlus, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

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
 * YouTube動画のサムネイルURLを取得
 */
function getYouTubeThumbnailUrl(videoId: string): string {
  // 高品質サムネイル（存在しない場合はデフォルトにフォールバック）
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * YouTube URLを正規化
 */
function normalizeYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

interface YouTubeInputProps {
  /** 追加時のコールバック */
  onAdded: (url: string, thumbnailUrl?: string) => void;
  /** 無効状態 */
  disabled?: boolean;
}

/**
 * YouTube URL入力コンポーネント
 *
 * @example
 * ```tsx
 * <YouTubeInput
 *   onAdded={(url, thumbnail) => handleYouTubeAdded(url, thumbnail)}
 * />
 * ```
 */
export function YouTubeInput({ onAdded, disabled }: YouTubeInputProps) {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<{
    videoId: string;
    thumbnailUrl: string;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPreview(null);
  };

  const handleValidate = () => {
    if (!url.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'URLを入力してください',
        color: 'red',
      });
      return;
    }

    setIsValidating(true);

    const videoId = extractYouTubeId(url);

    if (!videoId) {
      notifications.show({
        title: 'エラー',
        message: '有効なYouTube URLではありません',
        color: 'red',
      });
      setIsValidating(false);
      return;
    }

    const thumbnailUrl = getYouTubeThumbnailUrl(videoId);
    setPreview({ videoId, thumbnailUrl });
    setIsValidating(false);
  };

  const handleAdd = () => {
    if (!preview) return;

    const normalizedUrl = normalizeYouTubeUrl(preview.videoId);
    onAdded(normalizedUrl, preview.thumbnailUrl);

    // リセット
    setUrl('');
    setPreview(null);

    notifications.show({
      title: '追加完了',
      message: 'YouTube動画を追加しました',
      color: 'green',
    });
  };

  const handleClearPreview = () => {
    setPreview(null);
    setUrl('');
  };

  return (
    <Stack gap="sm">
      {/* URL入力 */}
      <Group gap="sm" align="flex-end">
        <TextInput
          label="YouTube URL"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => handleUrlChange(e.currentTarget.value)}
          disabled={disabled}
          style={{ flex: 1 }}
          leftSection={<IconBrandYoutube size={16} />}
        />
        <Button
          variant="light"
          onClick={handleValidate}
          loading={isValidating}
          disabled={disabled || !url.trim()}
        >
          確認
        </Button>
      </Group>

      {/* プレビュー */}
      {preview && (
        <Paper p="sm" radius="md" withBorder>
          <Group gap="md" wrap="nowrap">
            <Box
              w={120}
              h={90}
              style={{
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <Image
                src={preview.thumbnailUrl}
                alt="YouTube thumbnail"
                w={120}
                h={90}
                fit="cover"
              />
              <Box
                pos="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                <IconBrandYoutube size={32} color="white" />
              </Box>
            </Box>

            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="sm" fw={500}>
                YouTube動画
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                ID: {preview.videoId}
              </Text>
              <Group gap="xs">
                <Button
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={handleAdd}
                >
                  追加
                </Button>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleClearPreview}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Stack>
          </Group>
        </Paper>
      )}

      {/* ヘルプテキスト */}
      <Text size="xs" c="dimmed">
        対応形式: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
      </Text>
    </Stack>
  );
}
