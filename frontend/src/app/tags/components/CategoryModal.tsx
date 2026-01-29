'use client';

import {
  Box,
  Button,
  Card,
  Checkbox,
  ColorInput,
  Group,
  MultiSelect,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { UnifiedModal } from '@/components/common';

import type { CategoryFormValues } from '../types';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
  PRESET_COLORS,
} from '../constants';

export type CategoryModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<CategoryFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  // スコープ関連（事前定義済み選択肢）
  categoryScopeOptions: { value: string; label: string }[];
  // デフォルト設定
  setAsCategoryDefaultBgColor: boolean;
  onSetAsCategoryDefaultBgColorChange: (checked: boolean) => void;
  setAsCategoryDefaultTextColor: boolean;
  onSetAsCategoryDefaultTextColorChange: (checked: boolean) => void;
};

/**
 * カテゴリ編集/作成モーダル
 */
export function CategoryModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  categoryScopeOptions,
  setAsCategoryDefaultBgColor,
  onSetAsCategoryDefaultBgColorChange,
  setAsCategoryDefaultTextColor,
  onSetAsCategoryDefaultTextColorChange,
}: CategoryModalProps) {
  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'カテゴリを編集' : 'カテゴリを追加'}
      size="lg"
      keepMounted={false}
      addContentPadding={false}
    >
      <Box component="form" onSubmit={onSubmit}>
        <Stack gap="md" p="md">
          <TextInput
            label="キー"
            description="URLなどで利用する識別子（未入力の場合は自動生成）"
            value={form.values.key}
            onChange={(event) => form.setFieldValue('key', event.currentTarget.value)}
          />
          <TextInput
            label="カテゴリ名"
            required
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
          />
          <TextInput
            label="説明"
            placeholder="カテゴリの用途や対象を記載"
            value={form.values.description}
            onChange={(event) => form.setFieldValue('description', event.currentTarget.value)}
          />
          <Group gap="md" align="flex-end">
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="背景カラー"
                swatches={PRESET_COLORS}
                value={form.values.color}
                onChange={(value) => form.setFieldValue('color', value || DEFAULT_CATEGORY_COLOR)}
              />
              <Checkbox
                label="新規カテゴリのデフォルトに設定"
                checked={setAsCategoryDefaultBgColor}
                onChange={(e) => onSetAsCategoryDefaultBgColorChange(e.currentTarget.checked)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="テキストカラー"
                swatches={PRESET_COLORS}
                value={form.values.textColor}
                onChange={(value) =>
                  form.setFieldValue('textColor', value || DEFAULT_CATEGORY_TEXT_COLOR)
                }
              />
              <Checkbox
                label="新規カテゴリのデフォルトに設定"
                checked={setAsCategoryDefaultTextColor}
                onChange={(e) => onSetAsCategoryDefaultTextColorChange(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Card
            withBorder
            padding="sm"
            radius="md"
            shadow="xs"
            style={{
              backgroundColor: `${(form.values.color || DEFAULT_CATEGORY_COLOR)}26`,
              color: form.values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
              borderColor: form.values.color || DEFAULT_CATEGORY_COLOR,
            }}
          >
            <Text fw={600}>{form.values.name || 'カテゴリ名'}</Text>
            <Text size="xs">サンプルプレビュー</Text>
          </Card>
          <MultiSelect
            label="利用ページ"
            description="このカテゴリのタグを表示するページを選択"
            data={categoryScopeOptions}
            value={form.values.scopes}
            onChange={(value) => form.setFieldValue('scopes', value)}
            placeholder="ページを選択"
            searchable
            clearable
            maxDropdownHeight={220}
          />
          <Switch
            label="アクティブ"
            checked={form.values.isActive}
            onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? '更新' : '作成'}
            </Button>
          </Group>
        </Stack>
      </Box>
    </UnifiedModal>
  );
}
