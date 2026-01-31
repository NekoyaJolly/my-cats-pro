'use client';

import {
  Badge,
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

import type { TagFormValues } from '../types';
import {
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
  PRESET_COLORS,
} from '../constants';

export type TagModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<TagFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  categoryOptions: { value: string; label: string }[];
  tagGroupOptions: { value: string; label: string }[];
  // デフォルト設定
  setAsTagDefaultBgColor: boolean;
  onSetAsTagDefaultBgColorChange: (checked: boolean) => void;
  setAsTagDefaultTextColor: boolean;
  onSetAsTagDefaultTextColorChange: (checked: boolean) => void;
  // 継承設定
  inheritTagColorFromGroup: boolean;
  onInheritTagColorFromGroupChange: (checked: boolean) => void;
};

/**
 * タグ編集/作成モーダル
 */
export function TagModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  categoryOptions,
  tagGroupOptions,
  setAsTagDefaultBgColor,
  onSetAsTagDefaultBgColorChange,
  setAsTagDefaultTextColor,
  onSetAsTagDefaultTextColorChange,
  inheritTagColorFromGroup,
  onInheritTagColorFromGroupChange,
}: TagModalProps) {
  const sections: ModalSection[] = [
    {
      label: '基本情報',
      content: (
        <>
          <Select
            label="カテゴリ"
            data={categoryOptions}
            value={form.values.categoryId}
            onChange={(value) => {
              form.setFieldValue('categoryId', value ?? '');
              form.setFieldValue('groupId', '');
            }}
            error={form.errors.categoryId}
            required
          />
          <Select
            label="タググループ"
            placeholder={form.values.categoryId ? 'グループを選択してください' : '先にカテゴリを選択してください'}
            data={tagGroupOptions}
            value={form.values.groupId}
            onChange={(value) => form.setFieldValue('groupId', value ?? '')}
            error={form.errors.groupId}
            required
            disabled={!form.values.categoryId || tagGroupOptions.length === 0}
          />
          <TextInput
            label="タグ名"
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
            required
          />
          <TextInput
            label="説明"
            placeholder="タグの補足情報"
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
            label="親グループのカラーを継承"
            checked={inheritTagColorFromGroup}
            onChange={(e) => onInheritTagColorFromGroupChange(e.currentTarget.checked)}
          />
          <Group gap="md" align="flex-end">
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="背景カラー"
                swatches={PRESET_COLORS}
                value={form.values.color}
                onChange={(value) => form.setFieldValue('color', value || DEFAULT_TAG_COLOR)}
              />
              <Checkbox
                label="新規タグのデフォルトに設定"
                checked={setAsTagDefaultBgColor}
                onChange={(e) => onSetAsTagDefaultBgColorChange(e.currentTarget.checked)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <ColorInput
                label="テキストカラー"
                swatches={PRESET_COLORS}
                value={form.values.textColor}
                onChange={(value) =>
                  form.setFieldValue('textColor', value || DEFAULT_TAG_TEXT_COLOR)
                }
              />
              <Checkbox
                label="新規タグのデフォルトに設定"
                checked={setAsTagDefaultTextColor}
                onChange={(e) => onSetAsTagDefaultTextColorChange(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Card
            withBorder
            padding="sm"
            radius="md"
            shadow="xs"
            style={{
              backgroundColor: `${(form.values.color || DEFAULT_TAG_COLOR)}26`,
              color: form.values.textColor || DEFAULT_TAG_TEXT_COLOR,
              borderColor: form.values.color || DEFAULT_TAG_COLOR,
            }}
          >
            <Group gap="xs" align="center" wrap="wrap">
              <Text fw={600}>{form.values.name || 'タグ名'}</Text>
              <Badge size="xs" variant="outline" color="gray">
                プレビュー
              </Badge>
            </Group>
            {form.values.description && (
              <Text size="xs" mt={4}>
                {form.values.description}
              </Text>
            )}
            <Group gap={6} mt="xs" wrap="wrap">
              <Badge
                size="xs"
                variant="light"
                style={{
                  backgroundColor: `${(form.values.color || DEFAULT_TAG_COLOR)}33`,
                  color: form.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                }}
              >
                手動 {form.values.allowsManual ? '可' : '不可'}
              </Badge>
              <Badge
                size="xs"
                variant="light"
                style={{
                  backgroundColor: `${(form.values.color || DEFAULT_TAG_COLOR)}33`,
                  color: form.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                }}
              >
                自動 {form.values.allowsAutomation ? '可' : '不可'}
              </Badge>
            </Group>
          </Card>
        </>
      ),
    },
    {
      label: '設定',
      content: (
        <>
          <Group gap="lg">
            <Switch
              label="手動付与を許可"
              checked={form.values.allowsManual}
              onChange={(event) => form.setFieldValue('allowsManual', event.currentTarget.checked)}
            />
            <Switch
              label="自動付与を許可"
              checked={form.values.allowsAutomation}
              onChange={(event) => form.setFieldValue('allowsAutomation', event.currentTarget.checked)}
            />
          </Group>
          <Switch
            label="アクティブ"
            checked={form.values.isActive}
            onChange={(event) => form.setFieldValue('isActive', event.currentTarget.checked)}
          />
        </>
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
        title={isEditing ? 'タグを編集' : 'タグを追加'}
        size="lg"
        keepMounted={false}
        sections={sections}
      />
    </Box>
  );
}








