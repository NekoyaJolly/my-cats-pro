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
import { IconHandGrab, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import {
  DEFAULT_GROUP_COLOR,
  DEFAULT_GROUP_TEXT_COLOR,
} from '../constants';

export type SortableGroupCardProps = {
  category: TagCategoryView;
  group: TagGroupView;
  index: number;
  tags: TagView[];
  reorderGroupsPending: boolean;
  deleteGroupPending: boolean;
  isAnyMutationPending: boolean;
  onOpenCreateTag: (categoryId: string, groupId: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
};

/**
 * ドラッグ可能なタググループカードコンポーネント
 */
export function SortableGroupCard({
  category,
  group,
  index,
  tags,
  reorderGroupsPending,
  deleteGroupPending,
  isAnyMutationPending,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
}: SortableGroupCardProps) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: 'group', categoryId: category.id },
    disabled: reorderGroupsPending,
  });

  const groupColor = group.color ?? DEFAULT_GROUP_COLOR;
  const groupTextColor = group.textColor ?? DEFAULT_GROUP_TEXT_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    borderColor: groupColor,
    borderWidth: 2,
    backgroundColor: `${groupColor}14`,
  };

  return (
    <Card ref={setNodeRef} style={style} withBorder radius="sm" padding="md" shadow="xs">
      <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="タググループを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderGroupsPending}
                {...listeners}
                {...attributes}
              >
                <IconHandGrab size={14} />
              </ActionIcon>
            </Tooltip>
            <Badge color="gray" variant="light" size="sm">
              {index + 1}
            </Badge>
            <Text fw={600} style={{ color: groupTextColor }}>
              {group.name}
            </Text>
            {!group.isActive && (
              <Badge size="xs" color="gray" variant="outline">
                非アクティブ
              </Badge>
            )}
            <Badge size="xs" variant="outline">
              タグ {tags.length}
            </Badge>
          </Group>
          {group.description && (
            <Text size="xs" c="dimmed">
              {group.description}
            </Text>
          )}
        </Stack>
        <Group gap={6} align="center" wrap="wrap">
          <Tooltip label="このグループにタグを追加" withArrow withinPortal>
            <ActionIcon
              variant="light"
              size="sm"
              onClick={() => onOpenCreateTag(category.id, group.id)}
              disabled={isAnyMutationPending}
              aria-label="タグを追加"
            >
              <IconPlus size={14} />
            </ActionIcon>
          </Tooltip>
          <ActionIcon
            variant="light"
            aria-label="グループを編集"
            onClick={() => onEditGroup(category, group)}
            disabled={isAnyMutationPending}
          >
            <IconPencil size={14} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            aria-label="グループを削除"
            onClick={() => void onDeleteGroup(group.id)}
            disabled={deleteGroupPending}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
}

