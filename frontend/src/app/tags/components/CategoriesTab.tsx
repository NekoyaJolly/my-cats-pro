'use client';

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
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  Center,
  Loader,
  Stack,
  Text,
} from '@mantine/core';

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
} from '@/lib/api/hooks/use-tags';
import { SortableCategoryCard } from './SortableCategoryCard';

export type CategoriesTabProps = {
  isLoading: boolean;
  sortedCategories: TagCategoryView[];
  isAnyMutationPending: boolean;
  reorderCategoriesPending: boolean;
  deleteCategoryPending: boolean;
  deleteGroupPending: boolean;
  deleteTagPending: boolean;
  reorderGroupsPending: boolean;
  reorderTagsPending: boolean;
  onCategoryDragEnd: (event: DragEndEvent) => void;
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
 * カテゴリタブコンポーネント
 * カテゴリ一覧をDnDで並べ替え可能な形式で表示
 */
export function CategoriesTab({
  isLoading,
  sortedCategories,
  isAnyMutationPending,
  reorderCategoriesPending,
  deleteCategoryPending,
  deleteGroupPending,
  deleteTagPending,
  reorderGroupsPending,
  reorderTagsPending,
  onCategoryDragEnd,
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
}: CategoriesTabProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">カテゴリが見つかりません。新規作成してください。</Text>
      </Center>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onCategoryDragEnd}>
      <SortableContext items={sortedCategories.map((category) => category.id)} strategy={rectSortingStrategy}>
        <Stack gap="lg">
          {sortedCategories.map((category) => (
            <SortableCategoryCard
              key={category.id}
              category={category}
              isAnyMutationPending={isAnyMutationPending}
              reorderCategoriesPending={reorderCategoriesPending}
              deleteCategoryPending={deleteCategoryPending}
              deleteGroupPending={deleteGroupPending}
              deleteTagPending={deleteTagPending}
              reorderGroupsPending={reorderGroupsPending}
              reorderTagsPending={reorderTagsPending}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onOpenCreateGroup={onOpenCreateGroup}
              onOpenCreateTag={onOpenCreateTag}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
              onEditTag={onEditTag}
              onDeleteTag={onDeleteTag}
              onTagContextAction={onTagContextAction}
              onReorderGroups={onReorderGroups}
              onReorderTags={onReorderTags}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}








