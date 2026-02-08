'use client';

/**
 * ギャラリー追加モーダルコンポーネント
 * 新規エントリの作成フォーム
 */

import { useMemo, useState } from 'react';
import {
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Text,
  Box,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { ImageUploader } from './ImageUploader';
import { YouTubeInput } from './YouTubeInput';
import { UnifiedModal, type ModalSection } from '@/components/common';
import {
  useBreedMasterData,
  useCoatColorMasterData,
} from '@/lib/api/hooks/use-master-data';
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
  coatColor: string | null;
  breed: string | null;
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

  // マスタデータ取得
  const { data: breedData, isLoading: isBreedLoading } = useBreedMasterData();
  const { data: coatColorData, isLoading: isCoatColorLoading } = useCoatColorMasterData();

  // Select用の選択肢を生成（Mantine Selectは重複valueを許容しないため、重複排除が必要）
  const breedOptions = useMemo(() => {
    const items = breedData?.data;
    if (!items) return [];
    const seen = new Set<string>();
    return items.reduce<Array<{ value: string; label: string }>>((acc, item) => {
      const name = (item.displayName ?? item.name ?? '').trim();
      // code=0のプレースホルダーレコード、空名、重複を除外
      const isPlaceholder = item.code === 0 && (!name || /^\d+$/.test(name));
      if (!name || isPlaceholder || seen.has(name)) return acc;
      seen.add(name);
      acc.push({ value: name, label: name });
      return acc;
    }, []);
  }, [breedData]);

  const coatColorOptions = useMemo(() => {
    const items = coatColorData?.data;
    if (!items) return [];
    const seen = new Set<string>();
    return items.reduce<Array<{ value: string; label: string }>>((acc, item) => {
      const name = (item.displayName ?? item.name ?? '').trim();
      // code=0のプレースホルダーレコード、空名、重複を除外
      const isPlaceholder = item.code === 0 && (!name || /^\d+$/.test(name));
      if (!name || isPlaceholder || seen.has(name)) return acc;
      seen.add(name);
      acc.push({ value: name, label: name });
      return acc;
    }, []);
  }, [coatColorData]);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      gender: '',
      coatColor: null,
      breed: null,
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
      coatColor: values.coatColor?.trim() || undefined,
      breed: values.breed?.trim() || undefined,
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

  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
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
            <Select
              label="毛色"
              placeholder={isCoatColorLoading ? '読み込み中...' : '毛色を選択'}
              data={coatColorOptions}
              searchable
              clearable
              nothingFoundMessage="該当なし"
              disabled={isCoatColorLoading}
              {...form.getInputProps('coatColor')}
            />
          </Group>

          <Select
            label="猫種"
            placeholder={isBreedLoading ? '読み込み中...' : '猫種を選択'}
            data={breedOptions}
            searchable
            clearable
            nothingFoundMessage="該当なし"
            disabled={isBreedLoading}
            {...form.getInputProps('breed')}
          />
        </>
      ),
    },
    ...(category === 'GRADUATION' ? [{
      label: '卒業情報',
      content: (
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
      ),
    }] : []),
    {
      label: '写真・動画',
      content: (
        <Stack gap="sm">
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

          <ImageUploader onUploaded={handleImageUploaded} />
          <YouTubeInput onAdded={handleYouTubeAdded} />
        </Stack>
      ),
    },
    {
      label: 'その他',
      content: (
        <>
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
        </>
      ),
    },
    {
      content: (
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
      ),
    },
  ];

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <UnifiedModal
        opened={opened}
        onClose={handleClose}
        title={CATEGORY_TITLES[category]}
        size="lg"
        centered
        sections={sections}
      />
    </Box>
  );
}
