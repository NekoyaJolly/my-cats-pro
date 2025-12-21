'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Collapse,
  Group,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconHandGrab,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
} from '../constants';
import { sortGroups, sortTags } from '../utils';
import { SortableGroupCard } from './SortableGroupCard';
import { SortableTagItem } from './SortableTagItem';

export type SortableCategoryCardProps = {
  category: TagCategoryView;
  isAnyMutationPending: boolean;
  reorderCategoriesPending: boolean;
  deleteCategoryPending: boolean;
  deleteGroupPending: boolean;
  deleteTagPending: boolean;
  reorderGroupsPending: boolean;
  reorderTagsPending: boolean;
  onEditCategory: (category: TagCategoryView) => void;
  onDeleteCategory: (id: string) => void;
  onOpenCreateGroup: (categoryId: string) => void;
  onOpenCreateTag: (categoryId: string, groupId?: string) => void;
  onEditGroup: (category: TagCategoryView, group: TagGroupView) => void;
  onDeleteGroup: (groupId: string) => void;
  onEditTag: (category: TagCategoryView, group: TagGroupView, tag: TagView) => void;
  onDeleteTag: (id: string) => void;
  onTagContextAction?: (action: string, tag?: TagView) => void;
  onReorderGroups: (categoryId: string, groups: TagGroupView[]) => void;
  onReorderTags: (groupId: string, tags: TagView[]) => void;
};

/**
 * ドラッグ可能なカテゴリカードコンポーネント
 * 内部にグループとタグのDnDコンテキストを持つ
 */
export function SortableCategoryCard({
  category,
  isAnyMutationPending,
  reorderCategoriesPending,
  deleteCategoryPending,
  deleteGroupPending,
  deleteTagPending,
  reorderGroupsPending,
  reorderTagsPending,
  onEditCategory,
  onDeleteCategory,
  onOpenCreateGroup,
  onOpenCreateTag,
  onEditGroup,
  onDeleteGroup,
  onEditTag,
  onDeleteTag,
  onTagContextAction,
  onReorderGroups,
  onReorderTags,
}: SortableCategoryCardProps) {
  const sortedGroups = useMemo(() => sortGroups(category.groups), [category.groups]);
  const [groupsOpened, { toggle: toggleGroups }] = useDisclosure(false);
  const [tagsOpened, { toggle: toggleTags }] = useDisclosure(false);
  const [groupOrder, setGroupOrder] = useState(sortedGroups);
  const [tagOrders, setTagOrders] = useState<Record<string, TagView[]>>(() =>
    Object.fromEntries(sortedGroups.map((group) => [group.id, sortTags(group.tags)])),
  );

  useEffect(() => {
    setGroupOrder(sortedGroups);
    setTagOrders(Object.fromEntries(sortedGroups.map((group) => [group.id, sortTags(group.tags)])));
  }, [sortedGroups]);

  const totalTags = useMemo(
    () =>
      groupOrder.reduce((sum, group) => {
        const tags = tagOrders[group.id] ?? sortTags(group.tags);
        return sum + tags.length;
      }, 0),
    [groupOrder, tagOrders],
  );

  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: { type: 'category' },
    disabled: reorderCategoriesPending,
  });

  const colorHex = category.color ?? DEFAULT_CATEGORY_COLOR;

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    borderColor: colorHex,
    borderWidth: 2,
    backgroundColor: `${colorHex}14`,
  };

  const nestedSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGroupDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || reorderGroupsPending) {
      return;
    }

    const oldIndex = groupOrder.findIndex((group) => group.id === active.id);
    const newIndex = groupOrder.findIndex((group) => group.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(groupOrder, oldIndex, newIndex);
    setGroupOrder(reordered);
    void onReorderGroups(category.id, reordered);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      withBorder
      padding="lg"
      radius="md"
      shadow="sm"
    >
      <Stack gap="sm">
        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Group gap="sm" align="center" wrap="wrap">
            <Tooltip label="ドラッグで並べ替え" withArrow withinPortal>
              <ActionIcon
                variant="light"
                aria-label="カテゴリを並べ替え"
                ref={setActivatorNodeRef}
                disabled={reorderCategoriesPending}
                {...listeners}
                {...attributes}
              >
                <IconHandGrab size={16} />
              </ActionIcon>
            </Tooltip>
            <Text fw={600} size="lg" style={{ color: category.textColor ?? DEFAULT_CATEGORY_TEXT_COLOR }}>
              {category.name}
            </Text>
            {!category.isActive && (
              <Badge color="gray" variant="outline" size="sm">
                非アクティブ
              </Badge>
            )}
            <Group gap={6} wrap="wrap">
              {category.scopes.length > 0 ? (
                category.scopes.map((scope) => (
                  <Badge key={scope} variant="dot">
                    {scope}
                  </Badge>
                ))
              ) : (
                <Badge variant="dot" color="gray">
                  スコープ未設定
                </Badge>
              )}
            </Group>
          </Group>
          <Group gap={6} align="center">
            <ActionIcon
              variant="light"
              aria-label="カテゴリを編集"
              onClick={() => onEditCategory(category)}
              disabled={isAnyMutationPending}
            >
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              aria-label="カテゴリを削除"
              onClick={() => void onDeleteCategory(category.id)}
              disabled={deleteCategoryPending}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Group justify="space-between" align="center" gap="sm" wrap="wrap">
          <Group gap="md" align="center" wrap="wrap" style={{ flex: 1 }}>
            <Text size="sm" c="dimmed" style={{ flex: 1 }}>
              {category.description || '説明が設定されていません'}
            </Text>
          </Group>
          <Group gap="md" align="center" wrap="wrap">
            <Group gap={4} align="center">
              <Button
                variant="subtle"
                size="xs"
                rightSection={
                  <IconChevronDown
                    size={12}
                    style={{ transform: groupsOpened ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }}
                  />
                }
                onClick={toggleGroups}
              >
                グループ {groupOrder.length}
              </Button>
              <Tooltip label="グループを追加" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onOpenCreateGroup(category.id)}
                  disabled={isAnyMutationPending}
                  aria-label="グループを追加"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group gap={4} align="center">
              <Button
                variant="subtle"
                size="xs"
                rightSection={
                  <IconChevronDown
                    size={12}
                    style={{ transform: tagsOpened ? 'rotate(180deg)' : undefined, transition: 'transform 120ms ease' }}
                  />
                }
                onClick={toggleTags}
              >
                タグ {totalTags}
              </Button>
              <Tooltip label="タグを追加" withArrow withinPortal>
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onOpenCreateTag(category.id)}
                  disabled={isAnyMutationPending}
                  aria-label="タグを追加"
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Group>

        <Collapse in={groupsOpened}>
          <Stack gap="sm" mt="sm">
            {groupOrder.length === 0 ? (
              <Text size="sm" c="dimmed">
                このカテゴリにはまだタググループがありません。
              </Text>
            ) : (
              <DndContext
                sensors={nestedSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGroupDragEnd}
              >
                <SortableContext items={groupOrder.map((group) => group.id)} strategy={rectSortingStrategy}>
                  <Stack gap="sm">
                    {groupOrder.map((group, groupIndex) => {
                      const tags = tagOrders[group.id] ?? sortTags(group.tags);
                      return (
                        <SortableGroupCard
                          key={group.id}
                          category={category}
                          group={group}
                          index={groupIndex}
                          tags={tags}
                          reorderGroupsPending={reorderGroupsPending}
                          deleteGroupPending={deleteGroupPending}
                          isAnyMutationPending={isAnyMutationPending}
                          onOpenCreateTag={onOpenCreateTag}
                          onEditGroup={onEditGroup}
                          onDeleteGroup={onDeleteGroup}
                        />
                      );
                    })}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Stack>
        </Collapse>

        <Collapse in={tagsOpened}>
          <Stack gap="md" mt="sm">
            {totalTags === 0 ? (
              <Text size="sm" c="dimmed">
                このカテゴリにはまだタグがありません。
              </Text>
            ) : (
              groupOrder.map((group) => {
                const tags = tagOrders[group.id] ?? sortTags(group.tags);
                return (
                  <Stack key={group.id} gap="xs">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs" align="center" wrap="wrap">
                        <Badge variant="light" color="gray">
                          {group.name}
                        </Badge>
                        <Badge size="xs" variant="outline">
                          タグ {tags.length}
                        </Badge>
                      </Group>
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
                    </Group>
                    {tags.length === 0 ? (
                      <Text size="xs" c="dimmed" pl="md">
                        このグループにはまだタグがありません。
                      </Text>
                    ) : (
                      <DndContext
                        sensors={nestedSensors}
                        collisionDetection={closestCenter}
                        onDragEnd={({ active, over }) => {
                          if (!over || active.id === over.id || reorderTagsPending) {
                            return;
                          }
                          const currentTags = tagOrders[group.id] ?? tags;
                          const oldIndex = currentTags.findIndex((item) => item.id === active.id);
                          const newIndex = currentTags.findIndex((item) => item.id === over.id);
                          if (oldIndex === -1 || newIndex === -1) {
                            return;
                          }
                          const reordered = arrayMove(currentTags, oldIndex, newIndex);
                          setTagOrders((prev) => ({ ...prev, [group.id]: reordered }));
                          void onReorderTags(group.id, reordered);
                        }}
                      >
                        <SortableContext
                          items={(tagOrders[group.id] ?? tags).map((tag) => tag.id)}
                          strategy={rectSortingStrategy}
                        >
                          <Stack gap="xs">
                            {(tagOrders[group.id] ?? tags).map((tag, tagIndex) => (
                              <SortableTagItem
                                key={tag.id}
                                category={category}
                                group={group}
                                tag={tag}
                                index={tagIndex}
                                reorderTagsPending={reorderTagsPending}
                                deleteTagPending={deleteTagPending}
                                isAnyMutationPending={isAnyMutationPending}
                                onEditTag={onEditTag}
                                onDeleteTag={onDeleteTag}
                                onContextAction={onTagContextAction}
                              />
                            ))}
                          </Stack>
                        </SortableContext>
                      </DndContext>
                    )}
                  </Stack>
                );
              })
            )}
          </Stack>
        </Collapse>
      </Stack>
    </Card>
  );
}








