'use client';

/**
 * 画像アップローダーコンポーネント
 * ドラッグ＆ドロップまたはファイル選択による画像アップロード
 */

import { useState, useRef } from 'react';
import {
  Box,
  Text,
  Stack,
  Progress,
  Group,
  ActionIcon,
  Image,
  Paper,
} from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconCheck } from '@tabler/icons-react';
import { useGalleryUpload } from '@/lib/api/hooks/use-gallery-upload';
import { notifications } from '@mantine/notifications';

interface ImageUploaderProps {
  /** アップロード完了時のコールバック */
  onUploaded: (url: string) => void;
  /** 許可する最大ファイル数 */
  maxFiles?: number;
  /** ドラッグ＆ドロップ無効 */
  disabled?: boolean;
}

/**
 * 画像アップローダーコンポーネント
 *
 * @example
 * ```tsx
 * <ImageUploader
 *   onUploaded={(url) => handleImageUploaded(url)}
 *   maxFiles={5}
 * />
 * ```
 */
export function ImageUploader({
  onUploaded,
  maxFiles = 10,
  disabled,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      id: string;
      name: string;
      progress: number;
      status: 'uploading' | 'completed' | 'error';
      previewUrl?: string;
      error?: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useGalleryUpload();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (files.length === 0) {
      notifications.show({
        title: 'エラー',
        message: '画像ファイルのみアップロードできます',
        color: 'red',
      });
      return;
    }

    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      await processFiles(files);
    }
    // inputをリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const filesToProcess = files.slice(0, maxFiles);

    for (const file of filesToProcess) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const previewUrl = URL.createObjectURL(file);

      setUploadingFiles((prev) => [
        ...prev,
        {
          id,
          name: file.name,
          progress: 0,
          status: 'uploading',
          previewUrl,
        },
      ]);

      try {
        // プログレス更新（擬似的）
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: 30 } : f))
        );

        const url = await uploadFile(file);

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, progress: 100, status: 'completed' } : f
          )
        );

        onUploaded(url);

        // 完了したファイルを少し後に削除
        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
          URL.revokeObjectURL(previewUrl);
        }, 2000);
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: 'error',
                  error:
                    error instanceof Error
                      ? error.message
                      : 'アップロードに失敗しました',
                }
              : f
          )
        );
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    const file = uploadingFiles.find((f) => f.id === id);
    if (file?.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Stack gap="sm">
      {/* ドロップゾーン */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          borderStyle: 'dashed',
          borderColor: isDragging
            ? 'var(--mantine-color-blue-5)'
            : 'var(--mantine-color-gray-4)',
          backgroundColor: isDragging
            ? 'var(--mantine-color-blue-0)'
            : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Stack align="center" gap="xs">
          <IconUpload
            size={32}
            stroke={1.5}
            color={
              isDragging
                ? 'var(--mantine-color-blue-5)'
                : 'var(--mantine-color-gray-5)'
            }
          />
          <Text size="sm" c="dimmed" ta="center">
            画像をドラッグ＆ドロップ
            <br />
            またはクリックして選択
          </Text>
          <Text size="xs" c="dimmed">
            JPEG, PNG, WebP 対応
          </Text>
        </Stack>
      </Paper>

      {/* 隠しファイルインプット */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* アップロード中のファイル一覧 */}
      {uploadingFiles.length > 0 && (
        <Stack gap="xs">
          {uploadingFiles.map((file) => (
            <Paper key={file.id} p="xs" radius="sm" withBorder>
              <Group gap="sm" wrap="nowrap">
                {/* プレビュー */}
                <Box
                  w={40}
                  h={40}
                  style={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {file.previewUrl ? (
                    <Image
                      src={file.previewUrl}
                      alt={file.name}
                      w={40}
                      h={40}
                      fit="cover"
                    />
                  ) : (
                    <Box
                      w={40}
                      h={40}
                      style={{
                        backgroundColor: 'var(--mantine-color-gray-1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconPhoto size={20} />
                    </Box>
                  )}
                </Box>

                {/* ファイル名とプログレス */}
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" lineClamp={1}>
                    {file.name}
                  </Text>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} size="xs" animated />
                  )}
                  {file.status === 'error' && (
                    <Text size="xs" c="red">
                      {file.error}
                    </Text>
                  )}
                </Stack>

                {/* ステータスアイコン */}
                {file.status === 'completed' && (
                  <IconCheck size={20} color="var(--mantine-color-green-5)" />
                )}
                {file.status === 'error' && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => handleRemoveFile(file.id)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
