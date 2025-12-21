'use client';

import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconHandGrab, IconPencil, IconTrash } from '@tabler/icons-react';

import { ContextMenuProvider } from '@/components/context-menu/context-menu';
import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
} from '../constants';
import { AutomationIndicator } from './AutomationIndicator';

export type SortableTagItemProps = {
  category: TagCategoryView;
  group: TagGroupView;
  tag: TagView;
  index: number;
  reorderTagsPending: boolean;
  deleteTagPending: boolean;
  isAnyMutationPending: boolean;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
  onContextAction?: (action: string, tag?: TagView) => void;
};

/**
 * ドラッグ可能なタグアイテムコンポーネント
 */
export function SortableTagItem({
  category,
  group,
  tag,
  index,
  reorderTagsPending,
  deleteTagPending,
  isAnyMutationPending,
  onEditTag,
  onDeleteTag,
  onContextAction,
}: SortableTagItemProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tag.id,
    data: { type: 'tag', groupId: group.id },
    disabled: reorderTagsPending,
  });

  const tagColor = tag.color ?? DEFAULT_TAG_COLOR;
  const tagTextColor = tag.textColor ?? DEFAULT_TAG_TEXT_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    borderColor: tagColor,
    borderWidth: 2,
    backgroundColor: `${tagColor}14`,
  };

  return (
    <ContextMenuProvider
      entity={tag}
      entityType="タグ"
      actions={['edit', 'delete']}
      onAction={onContextAction}
    >
      <Card 
        ref={setNodeRef} 
        style={{ 
          ...style, 
          cursor: 'pointer',
        }} 
        withBorder 
        radius="sm" 
        padding="sm"
        title="右クリックまたはダブルクリックで操作"
      >
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="xs" align="center" wrap="wrap">
              <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  aria-label="タグを並べ替え"
                  ref={setActivatorNodeRef}
                  disabled={reorderTagsPending}
                  {...attributes}
                  {...listeners}
                >
                  <IconHandGrab size={14} />
                </ActionIcon>
              </Tooltip>
              <Badge color="gray" variant="light" size="sm">
                {index + 1}
              </Badge>
              <Text fw={600} size="sm" style={{ color: tagTextColor }}>
                {tag.name}
              </Text>
              {!tag.isActive && (
                <Badge size="xs" color="gray" variant="outline">
                  非アクティブ
                </Badge>
              )}
              <Badge size="xs" variant="outline">
                使用 {tag.usageCount.toLocaleString()}回
              </Badge>
              <AutomationIndicator tag={tag} />
            </Group>
            {tag.description && (
              <Text size="xs" c="dimmed">
                {tag.description}
              </Text>
            )}
            <Group gap="xs" wrap="wrap">
              <Badge size="xs" variant="outline">
                手動 {tag.allowsManual ? '可' : '不可'}
              </Badge>
              <Badge size="xs" variant="outline">
                自動 {tag.allowsAutomation ? '可' : '不可'}
              </Badge>
              <Badge size="xs" variant="outline">
                {group.name}
              </Badge>
              <Badge
                size="xs"
                variant="light"
                style={{
                  backgroundColor: `${(category.color ?? DEFAULT_CATEGORY_COLOR)}1A`,
                  color: category.color ?? DEFAULT_CATEGORY_COLOR,
                }}
              >
                {category.name}
              </Badge>
            </Group>
          </Stack>
          <Group gap={4} align="center" wrap="wrap">
            <ActionIcon
              variant="light"
              aria-label="タグを編集"
              onClick={() => onEditTag(category, group, tag)}
              disabled={isAnyMutationPending}
            >
              <IconPencil size={14} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              aria-label="タグを削除"
              onClick={() => onDeleteTag(tag.id)}
              disabled={deleteTagPending || isAnyMutationPending}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Card>
    </ContextMenuProvider>
  );
}








