'use client';

import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import { DEFAULT_CATEGORY_COLOR } from '../constants';
import { AutomationIndicator } from './AutomationIndicator';

export type FlatTag = {
  category: TagCategoryView;
  group: TagGroupView;
  tag: TagView;
};

export type TagsListTabProps = {
  isLoading: boolean;
  flatTags: FlatTag[];
  isAnyMutationPending: boolean;
  deleteTagPending: boolean;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
};

/**
 * タグ一覧タブコンポーネント
 * フラットなリスト形式でタグを表示
 */
export function TagsListTab({
  isLoading,
  flatTags,
  isAnyMutationPending,
  deleteTagPending,
  onEditTag,
  onDeleteTag,
}: TagsListTabProps) {
  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (flatTags.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">表示できるタグがありません。</Text>
      </Center>
    );
  }

  return (
    <Stack gap="sm">
      {flatTags.map(({ category, group, tag }) => (
        <Card key={tag.id} withBorder radius="md" padding="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Group gap="xs" align="center">
                <Badge
                  variant="light"
                  style={{
                    backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                    color: category.color ?? DEFAULT_CATEGORY_COLOR,
                  }}
                >
                  {category.name}
                </Badge>
                <Badge variant="light" color="gray">
                  {group.name}
                </Badge>
                <Text fw={500}>{tag.name}</Text>
                {!tag.isActive && (
                  <Badge size="xs" color="gray" variant="outline">
                    非アクティブ
                  </Badge>
                )}
                <AutomationIndicator tag={tag} />
              </Group>
              <Group gap="xs">
                <Badge size="xs" variant="outline">
                  使用 {tag.usageCount.toLocaleString()}回
                </Badge>
                <Badge size="xs" variant="outline">
                  手動 {tag.allowsManual ? '可' : '不可'}
                </Badge>
                <Badge size="xs" variant="outline">
                  自動 {tag.allowsAutomation ? '可' : '不可'}
                </Badge>
              </Group>
              {tag.description && (
                <Text size="sm" c="dimmed">
                  {tag.description}
                </Text>
              )}
            </Stack>
            <Group gap={6}>
              <Button
                size="xs"
                variant="light"
                onClick={() => onEditTag(category, group, tag)}
                disabled={isAnyMutationPending}
              >
                編集
              </Button>
              <Button 
                size="xs" 
                color="red" 
                variant="light" 
                onClick={() => void onDeleteTag(tag.id)} 
                disabled={deleteTagPending}
              >
                削除
              </Button>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}








