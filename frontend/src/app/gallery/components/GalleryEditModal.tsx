'use client';
/**
 * ギャラリー編集モーダルコンポーネント
 * 既存エントリの情報を編集するフォーム
 */
import { useEffect, useMemo, useState } from 'react';
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
import { IconDeviceFloppy } from '@tabler/icons-react';
import { ImageUploader } from './ImageUploader';
import { YouTubeInput } from './YouTubeInput';
import { UnifiedModal, type ModalSection } from '@/components/common';
import {
  useBreedMasterData,
  useCoatColorMasterData,
} from '@/lib/api/hooks/use-master-data';
import type {
  GalleryEntry,
  UpdateGalleryEntryDto,
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

interface GalleryEditModalProps {
  /** 編集対象のエントリ（nullで非表示） */
  entry: GalleryEntry | null;
  /** 表示/非表示 */
  opened: boolean;
  /** 閉じる時のコールバック */
  onClose: () => void;
  /** 送信時のコールバック */
  onSubmit: (id: string, dto: UpdateGalleryEntryDto) => void;
  /** 送信中フラグ */
  loading?: boolean;
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'オス' },
  { value: 'FEMALE', label: 'メス' },
  { value: 'NEUTER', label: '去勢済みオス' },
  { value: 'SPAYED', label: '避妊済みメス' },
  { value: 'UNKNOWN', label: '不明' },
];

export function GalleryEditModal({
  entry,
  opened,
  onClose,
  onSubmit,
  loading,
}: GalleryEditModalProps) {
  const { data: coatColorData, isLoading: isCoatColorLoading } = useCoatColorMasterData();
  const { data: breedData, isLoading: isBreedLoading } = useBreedMasterData();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const coatColorOptions = useMemo(() => {
    const items = coatColorData?.data;
    if (!Array.isArray(items)) return [];
    return items.map((c) => ({ value: c.name, label: c.name }));
  }, [coatColorData]);

  const breedOptions = useMemo(() => {
    const items = breedData?.data;
    if (!Array.isArray(items)) return [];
    return items.map((b) => ({ value: b.name, label: b.name }));
  }, [breedData]);

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      gender: 'UNKNOWN',
      coatColor: null,
      breed: null,
      transferDate: null,
      destination: '',
      externalLink: '',
      notes: '',
    },
    validate: {
      name: (v) => (v.trim() ? null : '名前は必須です'),
      gender: (v) => (v ? null : '性別は必須です'),
    },
  });

  // エントリが変わったらフォームを初期化
  useEffect(() => {
    if (entry && opened) {
      form.setValues({
        name: entry.name ?? '',
        gender: entry.gender ?? 'UNKNOWN',
        coatColor: entry.coatColor ?? null,
        breed: entry.breed ?? null,
        transferDate: entry.transferDate ? new Date(entry.transferDate) : null,
        destination: entry.destination ?? '',
        externalLink: entry.externalLink ?? '',
        notes: entry.notes ?? '',
      });
      setMediaItems(
        (entry.media ?? []).map((m) => ({
          type: m.type as 'IMAGE' | 'YOUTUBE',
          url: m.url,
          thumbnailUrl: m.thumbnailUrl ?? undefined,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry, opened]);

  const handleClose = () => {
    form.reset();
    setMediaItems([]);
    onClose();
  };

  const handleSubmit = (values: FormValues) => {
    if (!entry) return;
    const dto: UpdateGalleryEntryDto = {
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
    onSubmit(entry.id, dto);
  };

  const handleImageUploaded = (url: string) => {
    setMediaItems((prev) => [...prev, { type: 'IMAGE', url }]);
  };

  const handleYouTubeAdded = (url: string, thumbnailUrl?: string) => {
    setMediaItems((prev) => [...prev, { type: 'YOUTUBE', url, thumbnailUrl }]);
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
    ...(entry?.category === 'GRADUATION'
      ? [
          {
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
          },
        ]
      : []),
    {
      label: '写真・動画',
      content: (
        <Stack gap="sm">
          {mediaItems.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                登録済み ({mediaItems.length}件)
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
            leftSection={<IconDeviceFloppy size={16} />}
            loading={loading}
          >
            保存
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
        title="ギャラリーエントリを編集"
        size="lg"
        centered
        sections={sections}
      />
    </Box>
  );
}
