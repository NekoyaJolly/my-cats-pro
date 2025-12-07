'use client';

/**
 * ギャラリー追加モーダルコンポーネント
 * 新規エントリの作成フォーム
 */

import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Divider,
  Text,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { ImageUploader } from './ImageUploader';
import { YouTubeInput } from './YouTubeInput';
import type {
  GalleryCategory,
  CreateGalleryEntryDto,
} from '@/lib/api/hooks/use-gallery';

interface MediaItem {
  type: 'IMAGE' | 'YOUTUBE';
  url: string;
  thumbnailUrl?: string;
}

interface FormValues {
  name: string;
  gender: string;
  coatColor: string;
  breed: string;
  transferDate: Date | null;
  destination: string;
  externalLink: string;
  notes: string;
}

interface GalleryAddModalProps {
  /** 表示/非表示 */
  opened: boolean;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** 現在のカテゴリ */
  category: GalleryCategory;
  /** 送信時のコールバック */
  onSubmit: (dto: CreateGalleryEntryDto) => void;
  /** 送信中フラグ */
  loading?: boolean;
}

/**
 * カテゴリ別のフォームタイトル
 */
const CATEGORY_TITLES: Record<GalleryCategory, string> = {
  KITTEN: '子猫を追加',
  FATHER: '父猫を追加',
  MOTHER: '母猫を追加',
  GRADUATION: '卒業猫を追加',
};

/**
 * 性別オプション
 */
const GENDER_OPTIONS = [
  { value: 'MALE', label: 'オス' },
  { value: 'FEMALE', label: 'メス' },
  { value: 'NEUTER', label: '去勢済みオス' },
  { value: 'SPAY', label: '避妊済みメス' },
];

/**
 * ギャラリー追加モーダルコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryAddModal
 *   opened={modalOpened}
 *   onClose={() => setModalOpened(false)}
 *   category="KITTEN"
 *   onSubmit={(dto) => createEntry(dto)}
 *   loading={isPending}
 * />
 * ```
 */
export function GalleryAddModal({
  opened,
  onClose,
  category,
  onSubmit,
  loading,
}: GalleryAddModalProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      gender: '',
      coatColor: '',
      breed: '',
      transferDate: null,
      destination: '',
      externalLink: '',
      notes: '',
    },
    validate: {
      name: (value) => (value.trim() ? null : '名前は必須です'),
      gender: (value) => (value ? null : '性別を選択してください'),
    },
  });

  const handleClose = () => {
    form.reset();
    setMediaItems([]);
    onClose();
  };

  const handleSubmit = (values: FormValues) => {
    const dto: CreateGalleryEntryDto = {
      category,
      name: values.name.trim(),
      gender: values.gender,
      coatColor: values.coatColor.trim() || undefined,
      breed: values.breed.trim() || undefined,
      transferDate: values.transferDate
        ? values.transferDate.toISOString().split('T')[0]
        : undefined,
      destination: values.destination.trim() || undefined,
      externalLink: values.externalLink.trim() || undefined,
      notes: values.notes.trim() || undefined,
      media: mediaItems.map((m, index) => ({
        type: m.type,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl,
        order: index,
      })),
    };

    onSubmit(dto);
  };

  const handleImageUploaded = (url: string) => {
    setMediaItems((prev) => [...prev, { type: 'IMAGE', url }]);
  };

  const handleYouTubeAdded = (url: string, thumbnailUrl?: string) => {
    setMediaItems((prev) => [
      ...prev,
      { type: 'YOUTUBE', url, thumbnailUrl },
    ]);
  };

  const handleRemoveMedia = (index: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={CATEGORY_TITLES[category]}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* 基本情報 */}
          <TextInput
            label="名前"
            placeholder="猫の名前を入力"
            required
            {...form.getInputProps('name')}
          />

          <Group grow>
            <Select
              label="性別"
              placeholder="選択してください"
              data={GENDER_OPTIONS}
              required
              {...form.getInputProps('gender')}
            />
            <TextInput
              label="毛色"
              placeholder="例: 茶トラ"
              {...form.getInputProps('coatColor')}
            />
          </Group>

          <TextInput
            label="猫種"
            placeholder="例: アメリカンショートヘア"
            {...form.getInputProps('breed')}
          />

          {/* 卒業猫の場合のみ表示 */}
          {category === 'GRADUATION' && (
            <>
              <Divider label="卒業情報" labelPosition="center" />
              <Group grow>
                <DateInput
                  label="卒業日"
                  placeholder="日付を選択"
                  valueFormat="YYYY/MM/DD"
                  {...form.getInputProps('transferDate')}
                />
                <TextInput
                  label="お届け先"
                  placeholder="例: 東京都"
                  {...form.getInputProps('destination')}
                />
              </Group>
            </>
          )}

          {/* メディアアップロード */}
          <Divider label="写真・動画" labelPosition="center" />

          <Stack gap="sm">
            {/* アップロード済みメディア一覧 */}
            {mediaItems.length > 0 && (
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  追加済み ({mediaItems.length}件)
                </Text>
                {mediaItems.map((item, index) => (
                  <Group key={index} justify="space-between">
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {item.type === 'YOUTUBE' ? '🎬 YouTube動画' : '🖼️ 画像'}:{' '}
                      {item.url.substring(0, 50)}...
                    </Text>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => handleRemoveMedia(index)}
                    >
                      削除
                    </Button>
                  </Group>
                ))}
              </Stack>
            )}

            {/* 画像アップロード */}
            <ImageUploader onUploaded={handleImageUploaded} />

            {/* YouTube URL入力 */}
            <YouTubeInput onAdded={handleYouTubeAdded} />
          </Stack>

          {/* その他の情報 */}
          <Divider label="その他" labelPosition="center" />

          <TextInput
            label="外部リンク"
            placeholder="https://..."
            {...form.getInputProps('externalLink')}
          />

          <Textarea
            label="メモ"
            placeholder="備考など"
            rows={3}
            {...form.getInputProps('notes')}
          />

          {/* ボタン */}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={loading}>
              キャンセル
            </Button>
            <Button
              type="submit"
              leftSection={<IconPlus size={16} />}
              loading={loading}
            >
              追加
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
