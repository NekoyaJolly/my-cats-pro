'use client';

import {
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { UnifiedModal, type ModalSection } from '@/components/common';

import type { GroupFormValues } from '../types';
import {
  DEFAULT_GROUP_COLOR,
  DEFAULT_GROUP_TEXT_COLOR,
  PRESET_COLORS,
} from '../constants';

export type GroupModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<GroupFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  categoryOptions: { value: string; label: string }[];
  // デフォルト設定
  setAsGroupDefaultBgColor: boolean;
  onSetAsGroupDefaultBgColorChange: (checked: boolean) => void;
  setAsGroupDefaultTextColor: boolean;
  onSetAsGroupDefaultTextColorChange: (checked: boolean) => void;
  // 継承設定
  inheritGroupColorFromCategory: boolean;
  onInheritGroupColorFromCategoryChange: (checked: boolean) => void;
};

/**
 * タググループ編集/作成モーダル
 */
export function GroupModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  categoryOptions,
  setAsGroupDefaultBgColor,
  onSetAsGroupDefaultBgColorChange,
  setAsGroupDefaultTextColor,
  onSetAsGroupDefaultTextColorChange,
  inheritGroupColorFromCategory,
  onInheritGroupColorFromCategoryChange,
}: GroupModalProps) {
  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
          <Select
            label="カテゴリ"
            data={categoryOptions}
            value={form.values.categoryId}
            onChange={(value) => form.setFieldValue('categoryId', value ?? '')}
            error={form.errors.categoryId}
            required
          />
          <TextInput
            label="グループ名"
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
            required
          />
          <TextInput
            label="説明"
            placeholder="タググループの用途"
            value={form.values.description}
            onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
          />
        </>
      ),
    },
    {
      label: 'カラー設定',
      content: (
        <>
          <Checkbox
            label="親カテゴリのカラーを継承"
            checked={inheritGroupColorFromCategory}
            onChange={(e) => onInheritGroupColorFromCategoryChange(e.currentTarget.checked)}
          />
          <Group gap="md" align="flex-end">
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="背景カラー"
                swatches={PRESET_COLORS}
                value={form.values.color}
                onChange={(value) => form.setFieldValue('color', value || DEFAULT_GROUP_COLOR)}
              />
              <Checkbox
                label="新規グループのデフォルトに設定"
                checked={setAsGroupDefaultBgColor}
                onChange={(e) => onSetAsGroupDefaultBgColorChange(e.currentTarget.checked)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="テキストカラー"
                swatches={PRESET_COLORS}
                value={form.values.textColor}
                onChange={(value) =>
                  form.setFieldValue('textColor', value || DEFAULT_GROUP_TEXT_COLOR)
                }
              />
              <Checkbox
                label="新規グループのデフォルトに設定"
                checked={setAsGroupDefaultTextColor}
                onChange={(e) => onSetAsGroupDefaultTextColorChange(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Card
            withBorder
            padding="sm"
            radius="md"
            shadow="xs"
            style={{
              backgroundColor: `${(form.values.color || DEFAULT_GROUP_COLOR)}26`,
              color: form.values.textColor || DEFAULT_GROUP_TEXT_COLOR,
              borderColor: form.values.color || DEFAULT_GROUP_COLOR,
            }}
          >
            <Text fw={600}>{form.values.name || 'タググループ名'}</Text>
            <Text size="xs">サンプルプレビュー</Text>
          </Card>
        </>
      ),
    },
    {
      label: '設定',
      content: (
        <Switch
          label="アクティブ"
          checked={form.values.isActive}
          onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
        />
      ),
    },
    {
      content: (
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? '更新' : '作成'}
          </Button>
        </Group>
      ),
    },
  ];

  return (
    <Box component="form" onSubmit={onSubmit}>
      <UnifiedModal
        opened={opened}
        onClose={onClose}
        title={isEditing ? 'タググループを編集' : 'タググループを追加'}
        size="lg"
        keepMounted={false}
        sections={sections}
      />
    </Box>
  );
}








