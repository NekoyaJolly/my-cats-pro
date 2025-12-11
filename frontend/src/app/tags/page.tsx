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
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Collapse,
  ColorInput,
  Container,
  Group,
  Loader,
  Menu,
  Modal,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconChevronDown,
  IconHandGrab,
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconRobot,
  IconTag,
  IconTrash,
  IconWand,
  IconFolderPlus,
  IconTags,
} from '@tabler/icons-react';

import { ContextMenuProvider } from '@/components/context-menu/context-menu';
import { useContextMenu } from '@/components/context-menu/use-context-menu';
import { OperationModalManager } from '@/components/context-menu/operation-modal-manager';

import { usePageHeader } from '@/lib/contexts/page-header-context';
import {
  useCreateTag,
  useCreateTagCategory,
  useCreateTagGroup,
  useDeleteTag,
  useDeleteTagCategory,
  useDeleteTagGroup,
  useGetTagCategories,
  useReorderTagCategories,
  useReorderTagGroups,
  useReorderTags,
  useUpdateTag,
  useUpdateTagCategory,
  useUpdateTagGroup,
  type CreateTagCategoryRequest,
  type CreateTagGroupRequest,
  type CreateTagRequest,
  type TagCategoryFilters,
  type TagCategoryView,
  type TagGroupView,
  type TagView,
  type UpdateTagCategoryRequest,
  type UpdateTagGroupRequest,
  type UpdateTagRequest,
} from '@/lib/api/hooks/use-tags';
import {
  useGetTagColorDefaults,
  useUpdateTagColorDefaults,
} from '@/lib/api/hooks/use-tenant-settings';
import {
  useGetAutomationRules,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  useExecuteAutomationRule,
  type TagAutomationRule,
  type CreateTagAutomationRuleRequest,
  type UpdateTagAutomationRuleRequest,
  type TagAutomationTriggerType,
  type TagAutomationEventType,
} from '@/lib/api/hooks/use-tag-automation';

const PRESET_COLORS = [
  '#e74c3c',
  '#e67e22',
  '#f39c12',
  '#f1c40f',
  '#2ecc71',
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#95a5a6',
];

const DEFAULT_CATEGORY_COLOR = '#6366F1';
const DEFAULT_CATEGORY_TEXT_COLOR = '#111827';
const DEFAULT_GROUP_COLOR = '#3B82F6';
const DEFAULT_GROUP_TEXT_COLOR = '#111827';
const DEFAULT_TAG_COLOR = '#3B82F6';
const DEFAULT_TAG_TEXT_COLOR = '#FFFFFF';

type CategoryFormValues = {
  key: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  scopes: string[];
  isActive: boolean;
};

type TagFormValues = {
  categoryId: string;
  name: string;
  groupId: string;
  description: string;
  color: string;
  textColor: string;
  allowsManual: boolean;
  allowsAutomation: boolean;
  isActive: boolean;
};

type GroupFormValues = {
  categoryId: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  isActive: boolean;
};

type AutomationRuleFormValues = {
  key: string;
  name: string;
  description: string;
  triggerType: TagAutomationTriggerType;
  eventType: TagAutomationEventType | '';
  scope: string;
  priority: number;
  isActive: boolean;
  tagIds: string[];
  // 年齢閾値設定
  ageThreshold?: {
    type: 'kitten' | 'adult';
    kitten?: {
      minDays?: number;
      maxDays?: number;
    };
    adult?: {
      minMonths?: number;
      maxMonths?: number;
    };
  };
  // PAGE_ACTION設定
  pageAction?: {
    page: string;
    action: string;
    targetSelection: string;
    specificCatIds?: string[];
  };
};

const TRIGGER_TYPE_OPTIONS = [
  { value: 'EVENT', label: 'イベント駆動' },
  { value: 'SCHEDULE', label: 'スケジュール' },
  { value: 'MANUAL', label: '手動実行' },
];

const EVENT_TYPE_OPTIONS = [
  { value: 'BREEDING_PLANNED', label: '交配予定' },
  { value: 'BREEDING_CONFIRMED', label: '交配確認' },
  { value: 'PREGNANCY_CONFIRMED', label: '妊娠確認' },
  { value: 'KITTEN_REGISTERED', label: '子猫登録' },
  { value: 'AGE_THRESHOLD', label: '年齢閾値' },
  { value: 'PAGE_ACTION', label: 'ページ・アクション駆動（柔軟設定）' },
  { value: 'CUSTOM', label: 'カスタム' },
];

// 自動化ルールで使用可能なスコープのデフォルトリスト
const AUTOMATION_SCOPE_OPTIONS = [
  { value: 'cats', label: '猫管理' },
  { value: 'breeding', label: '交配管理' },
  { value: 'health', label: '健康管理' },
  { value: 'care', label: 'ケア記録' },
  { value: 'pedigree', label: '血統管理' },
];

// PAGE_ACTIONで選択可能なページ（実際のナビゲーション構造に基づく）
const PAGE_OPTIONS = [
  { value: 'cats', label: '在舎猫一覧', href: '/cats' },
  { value: 'cats-new', label: '新規猫登録', href: '/cats/new' },
  { value: 'cats-detail', label: '猫詳細', href: '/cats/[id]' },
  { value: 'breeding', label: '交配管理', href: '/breeding' },
  { value: 'kittens', label: '子猫管理', href: '/kittens' },
  { value: 'care', label: 'ケアスケジュール', href: '/care' },
  { value: 'pedigrees', label: '血統書データ', href: '/pedigrees' },
  { value: 'tags', label: 'タグ管理', href: '/tags' },
  { value: 'staff-shifts', label: 'スタッフシフト', href: '/staff/shifts' },
];

// ページごとに利用可能なアクション
const PAGE_ACTIONS_MAP: Record<string, Array<{ value: string; label: string; description?: string }>> = {
  'cats': [
    { value: 'view', label: '一覧表示', description: '猫一覧ページが表示された時' },
    { value: 'filter', label: 'フィルタ適用', description: '検索・フィルタが適用された時' },
    { value: 'sort', label: 'ソート変更', description: '並び順が変更された時' },
  ],
  'cats-new': [
    { value: 'create', label: '新規登録', description: '新しい猫が登録された時' },
    { value: 'create_success', label: '登録成功', description: '猫の登録が成功した時' },
  ],
  'cats-detail': [
    { value: 'view', label: '詳細表示', description: '猫の詳細が表示された時' },
    { value: 'update', label: '情報更新', description: '猫の情報が更新された時' },
    { value: 'delete', label: '削除', description: '猫が削除された時' },
    { value: 'tag_added', label: 'タグ追加', description: '猫にタグが追加された時' },
    { value: 'tag_removed', label: 'タグ削除', description: '猫からタグが削除された時' },
  ],
  'breeding': [
    { value: 'create', label: '交配予定登録', description: '新しい交配予定が登録された時' },
    { value: 'update', label: '交配情報更新', description: '交配情報が更新された時' },
    { value: 'confirm', label: '交配確認', description: '交配が確認された時' },
    { value: 'pregnancy_confirmed', label: '妊娠確認', description: '妊娠が確認された時' },
    { value: 'cancel', label: 'キャンセル', description: '交配予定がキャンセルされた時' },
  ],
  'kittens': [
    { value: 'register', label: '子猫登録', description: '新しい子猫が登録された時' },
    { value: 'update', label: '子猫情報更新', description: '子猫の情報が更新された時' },
    { value: 'graduate', label: '卒業処理', description: '子猫が卒業した時' },
    { value: 'health_check', label: '健康チェック', description: '健康チェックが記録された時' },
  ],
  'care': [
    { value: 'create', label: 'ケア予定登録', description: '新しいケア予定が登録された時' },
    { value: 'complete', label: 'ケア完了', description: 'ケアが完了した時' },
    { value: 'update', label: 'ケア情報更新', description: 'ケア情報が更新された時' },
    { value: 'cancel', label: 'キャンセル', description: 'ケア予定がキャンセルされた時' },
  ],
  'pedigrees': [
    { value: 'create', label: '血統書作成', description: '新しい血統書が作成された時' },
    { value: 'update', label: '血統書更新', description: '血統書が更新された時' },
    { value: 'export', label: 'エクスポート', description: '血統書がエクスポートされた時' },
  ],
  'tags': [
    { value: 'create', label: 'タグ作成', description: '新しいタグが作成された時' },
    { value: 'update', label: 'タグ更新', description: 'タグが更新された時' },
    { value: 'delete', label: 'タグ削除', description: 'タグが削除された時' },
  ],
  'staff-shifts': [
    { value: 'create', label: 'シフト登録', description: '新しいシフトが登録された時' },
    { value: 'update', label: 'シフト更新', description: 'シフトが更新された時' },
    { value: 'delete', label: 'シフト削除', description: 'シフトが削除された時' },
  ],
};

// 対象猫の選択方法
const TARGET_SELECTION_OPTIONS = [
  { value: 'event_target', label: 'イベント対象の猫' },
  { value: 'specific_cats', label: '特定の猫' },
  { value: 'all_cats', label: '全ての猫' },
];

type AutomationMeta = {
  ruleName?: string;
  reason?: string;
  source?: string;
  assignedAt?: string;
};

function sortCategories(categories: TagCategoryView[]): TagCategoryView[] {
  return [...categories].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

function sortGroups(groups?: TagGroupView[] | null): TagGroupView[] {
  return [...(groups ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

function sortTags(tags?: TagView[] | null): TagView[] {
  return [...(tags ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

function extractAutomationMeta(tag: TagView): AutomationMeta | null {
  if (!tag.metadata || typeof tag.metadata !== 'object') {
    return null;
  }

  const metadata = tag.metadata as Record<string, unknown>;
  const automation = metadata.automation;

  if (!automation || typeof automation !== 'object') {
    return null;
  }

  const info = automation as Record<string, unknown>;

  const meta: AutomationMeta = {
    ruleName: typeof info.ruleName === 'string' ? info.ruleName : undefined,
    reason: typeof info.reason === 'string' ? info.reason : undefined,
    source: typeof info.source === 'string' ? info.source : undefined,
    assignedAt: typeof info.assignedAt === 'string' ? info.assignedAt : undefined,
  };

  return Object.values(meta).some(Boolean) ? meta : null;
}

function AutomationIndicator({ tag }: { tag: TagView }) {
  const meta = extractAutomationMeta(tag);
  if (!meta && !tag.allowsAutomation) {
    return null;
  }

  const tooltipParts = [meta?.ruleName, meta?.reason, meta?.source, meta?.assignedAt].filter(Boolean);
  if (!meta && tag.allowsAutomation && !tag.allowsManual) {
    tooltipParts.push('自動付与専用タグ');
  }
  if (!meta && tag.allowsAutomation && tooltipParts.length === 0) {
    tooltipParts.push('自動付与ルールで使用可能');
  }

  const content = (
    <Group gap={4} align="center" wrap="nowrap" style={{ fontSize: 11 }}>
      <IconWand size={12} />
      <Text span>{meta ? '自動' : '自動可'}</Text>
    </Group>
  );

  return (
    <Tooltip label={tooltipParts.join(' / ')} withArrow multiline withinPortal>
      {content}
    </Tooltip>
  );
}

type SortableGroupCardProps = {
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

function SortableGroupCard({
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

type SortableTagCardProps = {
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

function SortableTagCard({
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
}: SortableTagCardProps) {
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

type SortableCategoryCardProps = {
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

function SortableCategoryCard({
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
                              <SortableTagCard
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

function buildCategoryPayload(values: CategoryFormValues): CreateTagCategoryRequest & {
  textColor?: string;
} {
  const payload: CreateTagCategoryRequest & { textColor?: string } = {
    name: values.name,
    ...(values.key ? { key: values.key } : {}),
    ...(values.description ? { description: values.description } : {}),
    color: values.color || DEFAULT_CATEGORY_COLOR,
    textColor: values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
    ...(values.scopes.length ? { scopes: values.scopes } : { scopes: [] }),
    isActive: values.isActive,
  };
  return payload;
}

function buildTagPayload(values: TagFormValues): CreateTagRequest & {
  textColor?: string;
} {
  const payload: CreateTagRequest & { textColor?: string } = {
    name: values.name,
    groupId: values.groupId,
    ...(values.description ? { description: values.description } : {}),
    color: values.color || DEFAULT_TAG_COLOR,
    textColor: values.textColor || DEFAULT_TAG_TEXT_COLOR,
    allowsManual: values.allowsManual,
    allowsAutomation: values.allowsAutomation,
    isActive: values.isActive,
  };
  return payload;
}

export default function TagsPage() {
  const { setPageHeader } = usePageHeader();
  
  const [filters, setFilters] = useState<{ scopes: string[]; includeInactive: boolean }>({
    scopes: [],
    includeInactive: false,
  });
  const [scopeDraft, setScopeDraft] = useState('');
  const [editingCategory, setEditingCategory] = useState<TagCategoryView | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ category: TagCategoryView; group: TagGroupView } | null>(null);
  const [editingTag, setEditingTag] = useState<{ category: TagCategoryView; group: TagGroupView; tag: TagView } | null>(null);
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [groupModalOpened, { open: openGroupModal, close: closeGroupModal }] = useDisclosure(false);
  const [tagModalOpened, { open: openTagModal, close: closeTagModal }] = useDisclosure(false);
  const [automationRuleModalOpened, { open: openAutomationRuleModal, close: closeAutomationRuleModal }] = useDisclosure(false);
  const [editingAutomationRule, setEditingAutomationRule] = useState<TagAutomationRule | null>(null);
  const [executeRuleModalOpened, { open: openExecuteRuleModal, close: closeExecuteRuleModal }] = useDisclosure(false);
  const [executingRule, setExecutingRule] = useState<TagAutomationRule | null>(null);

  // デフォルト設定用のチェックボックス状態
  const [setAsCategoryDefaultBgColor, setSetAsCategoryDefaultBgColor] = useState(false);
  const [setAsCategoryDefaultTextColor, setSetAsCategoryDefaultTextColor] = useState(false);
  const [setAsGroupDefaultBgColor, setSetAsGroupDefaultBgColor] = useState(false);
  const [setAsGroupDefaultTextColor, setSetAsGroupDefaultTextColor] = useState(false);
  const [setAsTagDefaultBgColor, setSetAsTagDefaultBgColor] = useState(false);
  const [setAsTagDefaultTextColor, setSetAsTagDefaultTextColor] = useState(false);
  
  // 親階層からの継承用のチェックボックス状態
  const [inheritGroupColorFromCategory, setInheritGroupColorFromCategory] = useState(false);
  const [inheritTagColorFromGroup, setInheritTagColorFromGroup] = useState(false);

  const queryFilters = useMemo<TagCategoryFilters | undefined>(() => {
    const payload: TagCategoryFilters = {};
    if (filters.scopes.length) {
      payload.scope = filters.scopes;
    }
    if (filters.includeInactive) {
      payload.includeInactive = true;
    }
    return Object.keys(payload).length ? payload : undefined;
  }, [filters]);

  const { data, isLoading, isFetching } = useGetTagCategories(queryFilters, {
    placeholderData: (previousData) => previousData,
  });

  const categories = useMemo(() => data?.data ?? [], [data]);
  const sortedCategories = useMemo(() => sortCategories(categories), [categories]);
  const availableScopes = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((category) => {
      category.scopes.forEach((scope) => {
        if (scope) {
          set.add(scope);
        }
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [categories]);

  const categoryForm = useForm<CategoryFormValues>({
    initialValues: {
      key: '',
      name: '',
      description: '',
      color: DEFAULT_CATEGORY_COLOR,
      textColor: DEFAULT_CATEGORY_TEXT_COLOR,
      scopes: [],
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length ? null : 'カテゴリ名を入力してください'),
    },
  });

  const tagForm = useForm<TagFormValues>({
    initialValues: {
      name: '',
      categoryId: '',
      groupId: '',
      description: '',
      color: DEFAULT_TAG_COLOR,
      textColor: DEFAULT_TAG_TEXT_COLOR,
      allowsManual: true,
      allowsAutomation: true,
      isActive: true,
    },
    validate: {
      name: (value) => (value.trim().length ? null : 'タグ名を入力してください'),
      categoryId: (value) => (value ? null : 'カテゴリを選択してください'),
      groupId: (value) => (value ? null : 'タググループを選択してください'),
    },
  });

  const automationRuleForm = useForm<AutomationRuleFormValues>({
    initialValues: {
      key: '',
      name: '',
      description: '',
      triggerType: 'EVENT',
      eventType: '',
      scope: '',
      priority: 10,
      isActive: true,
      tagIds: [],
      ageThreshold: {
        type: 'kitten',
        kitten: {},
        adult: {},
      },
      pageAction: {
        page: 'cats',
        action: 'create',
        targetSelection: 'event_target',
        specificCatIds: [],
      },
    },
    validate: {
      key: (value) => {
        if (!value.trim()) return 'キーを入力してください';
        // キーは英数字とハイフン、アンダースコアのみ
        if (!/^[a-z0-9_-]+$/i.test(value)) {
          return 'キーは英数字、ハイフン、アンダースコアのみ使用できます';
        }
        return null;
      },
      name: (value) => (value.trim().length ? null : 'ルール名を入力してください'),
      triggerType: (value) => (value ? null : 'トリガータイプを選択してください'),
      eventType: (value, values) => {
        if (values.triggerType === 'EVENT' && !value) {
          return 'イベントタイプを選択してください';
        }
        return null;
      },
      priority: (value) => {
        if (value < 0 || value > 100) {
          return '優先度は0-100の範囲で入力してください';
        }
        return null;
      },
      tagIds: (value) => {
        if (!value || value.length === 0) {
          return '少なくとも1つのタグを選択してください';
        }
        return null;
      },
    },
  });

  const groupForm = useForm<GroupFormValues>({
    initialValues: {
      categoryId: '',
      name: '',
      description: '',
      color: DEFAULT_GROUP_COLOR,
      textColor: DEFAULT_GROUP_TEXT_COLOR,
      isActive: true,
    },
    validate: {
      categoryId: (value) => (value ? null : 'カテゴリを選択してください'),
      name: (value) => (value.trim().length ? null : 'グループ名を入力してください'),
    },
  });

  const categoryScopeOptions = useMemo(() => {
    const set = new Set<string>([
      ...availableScopes,
      ...filters.scopes,
      ...categoryForm.values.scopes,
      scopeDraft,
    ]);
    return Array.from(set)
      .filter((scope) => scope.trim().length > 0)
      .map((scope) => ({ value: scope, label: scope }));
  }, [availableScopes, categoryForm.values.scopes, filters.scopes, scopeDraft]);

  const filterScopeOptions = useMemo(
    () => availableScopes.map((scope) => ({ value: scope, label: scope })),
    [availableScopes],
  );

  // 自動化ルール用のスコープオプション（既存スコープ + デフォルトスコープをマージ）
  const automationScopeOptions = useMemo(() => {
    const scopeMap = new Map<string, string>();
    
    // デフォルトスコープを追加
    AUTOMATION_SCOPE_OPTIONS.forEach(option => {
      scopeMap.set(option.value, option.label);
    });
    
    // 既存のスコープを追加（既にある場合は上書きしない）
    availableScopes.forEach(scope => {
      if (!scopeMap.has(scope)) {
        scopeMap.set(scope, scope);
      }
    });
    
    return Array.from(scopeMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja'));
  }, [availableScopes]);

  // 自動化ルールで使用可能なタグオプション（カテゴリ別にグループ化）
  const automationTagOptions = useMemo(() => {
    if (!sortedCategories || sortedCategories.length === 0) {
      return [];
    }
    
    const options: { value: string; label: string }[] = [];
    
    sortedCategories.forEach((category) => {
      if (!category || !category.groups) return;
      
      const groups = Array.isArray(category.groups) ? category.groups : [];
      groups.forEach((group) => {
        if (!group) return;
        
        const tags = Array.isArray(group.tags) ? group.tags : [];
        tags.forEach((tag) => {
          if (tag && tag.allowsAutomation && tag.isActive) {
            options.push({
              value: tag.id,
              label: `${category.name} > ${group.name} > ${tag.name}`,
            });
          }
        });
      });
    });
    
    return options;
  }, [sortedCategories]);

  // 選択したページに応じたアクションオプション
  const pageActionOptions = useMemo(() => {
    const selectedPage = automationRuleForm.values.pageAction?.page;
    if (!selectedPage) {
      return [];
    }
    
    const actions = PAGE_ACTIONS_MAP[selectedPage] || [];
    return actions.map(action => ({
      value: action.value,
      label: action.description 
        ? `${action.label} - ${action.description}`
        : action.label
    }));
  }, [automationRuleForm.values.pageAction?.page]);

  const categoryOptions = useMemo(
    () => sortedCategories.map((category) => ({ value: category.id, label: category.name })),
    [sortedCategories],
  );

  const groupOptionsByCategory = useMemo(() => {
    const map = new Map<string, { value: string; label: string }[]>();
    sortedCategories.forEach((category) => {
      map.set(
        category.id,
        sortGroups(category.groups).map((group) => ({ value: group.id, label: group.name })),
      );
    });
    return map;
  }, [sortedCategories]);

  const tagGroupOptions = useMemo(() => {
    if (!tagForm.values.categoryId) {
      return [];
    }
    return groupOptionsByCategory.get(tagForm.values.categoryId) ?? [];
  }, [groupOptionsByCategory, tagForm.values.categoryId]);

  useEffect(() => {
    if (!tagModalOpened) {
      return;
    }

    if (!tagForm.values.categoryId) {
      if (tagForm.values.groupId !== '') {
        tagForm.setFieldValue('groupId', '');
      }
      return;
    }

    if (tagForm.values.groupId && !tagGroupOptions.some((option) => option.value === tagForm.values.groupId)) {
      tagForm.setFieldValue('groupId', '');
      return;
    }

    // グループが未選択で、選択肢が1つ以上ある場合は最初のグループを自動選択
    if (!tagForm.values.groupId && tagGroupOptions.length > 0) {
      tagForm.setFieldValue('groupId', tagGroupOptions[0].value);
    }
  }, [tagModalOpened, tagForm, tagGroupOptions]);

  const createCategory = useCreateTagCategory();
  const updateCategory = useUpdateTagCategory();
  const deleteCategory = useDeleteTagCategory();
  const reorderCategoriesMutation = useReorderTagCategories();
  const createGroup = useCreateTagGroup();
  const updateGroup = useUpdateTagGroup();
  const deleteGroup = useDeleteTagGroup();
  const reorderGroupsMutation = useReorderTagGroups();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();
  const reorderTagsMutation = useReorderTags();

  // テナントのデフォルトカラー設定
  const { data: colorDefaults } = useGetTagColorDefaults();
  const updateTagColorDefaults = useUpdateTagColorDefaults();

  // デフォルト設定更新のヘルパー関数
  const updateColorDefaultsIfNeeded = async (
    type: 'category' | 'group' | 'tag',
    setBg: boolean,
    setText: boolean,
    values: { color: string; textColor: string }
  ) => {
    if (!setBg && !setText) return;
    
    const updates: { color?: string; textColor?: string } = {};
    if (setBg) {
      updates.color = values.color;
    }
    if (setText) {
      updates.textColor = values.textColor;
    }
    
    await updateTagColorDefaults.mutateAsync({ [type]: updates });
  };

  // 自動化ルール関連
  const { data: automationRulesData, isLoading: isLoadingAutomationRules } = useGetAutomationRules();
  const createAutomationRule = useCreateAutomationRule();
  const updateAutomationRule = useUpdateAutomationRule();
  const deleteAutomationRule = useDeleteAutomationRule();
  const executeAutomationRule = useExecuteAutomationRule();

  const automationRules = useMemo(() => automationRulesData?.data ?? [], [automationRulesData]);

  const isCategorySubmitting = createCategory.isPending || updateCategory.isPending;
  const isGroupSubmitting = createGroup.isPending || updateGroup.isPending;
  const isTagSubmitting = createTag.isPending || updateTag.isPending;
  const isAnyMutationPending =
    isCategorySubmitting ||
    isGroupSubmitting ||
    isTagSubmitting ||
    deleteCategory.isPending ||
    deleteGroup.isPending ||
    deleteTag.isPending ||
    reorderCategoriesMutation.isPending ||
    reorderGroupsMutation.isPending ||
    reorderTagsMutation.isPending;

  const flatTags = useMemo(() => {
    return sortedCategories.flatMap((category) =>
      sortGroups(category.groups).flatMap((group) =>
        sortTags(group.tags).map((tag) => ({ category, group, tag })),
      ),
    );
  }, [sortedCategories]);

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    handleAction: handleTagContextAction,
    openOperation,
    closeOperation,
  } = useContextMenu<TagView>({
    edit: (tag) => {
      // タグの編集には、categoryとgroupの情報も必要
      // flatTagsから該当タグを探して、編集モーダルを開く
      const tagInfo = flatTags.find(t => t.tag.id === tag?.id);
      if (tagInfo) {
        handleEditTag(tagInfo.category, tagInfo.group, tagInfo.tag);
      }
    },
    delete: () => {
      openOperation('delete');
    },
  });

  const handleOperationConfirm = async () => {
    if (!currentEntity) return;
    
    if (currentOperation === 'delete') {
      await deleteTag.mutateAsync(currentEntity.id);
      closeOperation();
    }
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.setValues({
      key: '',
      name: '',
      description: '',
      color: colorDefaults?.category?.color || DEFAULT_CATEGORY_COLOR,
      textColor: colorDefaults?.category?.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
      scopes: [],
      isActive: true,
    });
    setScopeDraft('');
    // チェックボックスをリセット
    setSetAsCategoryDefaultBgColor(false);
    setSetAsCategoryDefaultTextColor(false);
    openCategoryModal();
  };

  const handleEditCategory = (category: TagCategoryView) => {
    setEditingCategory(category);
    categoryForm.setValues({
      key: category.key ?? '',
      name: category.name,
      description: category.description ?? '',
      color: category.color ?? DEFAULT_CATEGORY_COLOR,
      textColor: category.textColor ?? DEFAULT_CATEGORY_TEXT_COLOR,
      scopes: category.scopes ?? [],
      isActive: category.isActive,
    });
    setScopeDraft('');
    openCategoryModal();
  };

  const handleOpenCreateGroup = (categoryId?: string) => {
    setEditingGroup(null);
    // カテゴリIDが指定されていない場合、最初のカテゴリを選択
    const selectedCategoryId = categoryId ?? (sortedCategories.length > 0 ? sortedCategories[0].id : '');
    groupForm.setValues({
      categoryId: selectedCategoryId,
      name: '',
      description: '',
      color: colorDefaults?.group?.color || DEFAULT_GROUP_COLOR,
      textColor: colorDefaults?.group?.textColor || DEFAULT_GROUP_TEXT_COLOR,
      isActive: true,
    });
    // チェックボックスをリセット
    setSetAsGroupDefaultBgColor(false);
    setSetAsGroupDefaultTextColor(false);
    setInheritGroupColorFromCategory(false);
    openGroupModal();
  };

  const handleEditGroup = (category: TagCategoryView, group: TagGroupView) => {
    setEditingGroup({ category, group });
    groupForm.setValues({
      categoryId: category.id,
      name: group.name,
      description: group.description ?? '',
      color: group.color ?? DEFAULT_GROUP_COLOR,
      textColor: group.textColor ?? DEFAULT_GROUP_TEXT_COLOR,
      isActive: group.isActive,
    });
    openGroupModal();
  };

  const handleSubmitGroup = groupForm.onSubmit(async (values) => {
    const payload: CreateTagGroupRequest & { color?: string; textColor?: string } = {
      categoryId: values.categoryId,
      name: values.name,
      ...(values.description ? { description: values.description } : {}),
      color: values.color || DEFAULT_GROUP_COLOR,
      textColor: values.textColor || DEFAULT_GROUP_TEXT_COLOR,
      isActive: values.isActive,
    };

    try {
      if (editingGroup) {
        await updateGroup.mutateAsync({
          id: editingGroup.group.id,
          payload: payload as UpdateTagGroupRequest,
        });
      } else {
        await createGroup.mutateAsync(payload);
      }

      // デフォルト設定の更新
      await updateColorDefaultsIfNeeded(
        'group',
        setAsGroupDefaultBgColor,
        setAsGroupDefaultTextColor,
        values
      );

      closeGroupModal();
    } catch {
      // noop
    }
  });

  const handleDeleteGroupAction = async (id: string) => {
    if (!window.confirm('このタググループと関連タグを削除しますか？')) {
      return;
    }
    try {
      await deleteGroup.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleReorderGroups = async (categoryId: string, groups: TagGroupView[]) => {
    if (reorderGroupsMutation.isPending) {
      return;
    }

    try {
      await reorderGroupsMutation.mutateAsync({
        items: groups.map((group, orderIndex) => ({
          id: group.id,
          displayOrder: orderIndex,
          categoryId,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleOpenCreateTag = (categoryId?: string, groupId?: string) => {
    setEditingTag(null);
    // カテゴリとグループが指定されていない場合、最初のものを選択
    let selectedCategoryId = categoryId;
    let selectedGroupId = groupId;
    
    if (!selectedCategoryId && sortedCategories.length > 0) {
      selectedCategoryId = sortedCategories[0].id;
      if (!selectedGroupId && sortedCategories[0].groups.length > 0) {
        selectedGroupId = sortedCategories[0].groups[0].id;
      }
    }
    
    tagForm.setValues({
      name: '',
      categoryId: selectedCategoryId ?? '',
      groupId: selectedGroupId ?? '',
      description: '',
      color: colorDefaults?.tag?.color || DEFAULT_TAG_COLOR,
      textColor: colorDefaults?.tag?.textColor || DEFAULT_TAG_TEXT_COLOR,
      allowsManual: true,
      allowsAutomation: true,
      isActive: true,
    });
    // チェックボックスをリセット
    setSetAsTagDefaultBgColor(false);
    setSetAsTagDefaultTextColor(false);
    setInheritTagColorFromGroup(false);
    openTagModal();
  };

  const handleEditTag = (category: TagCategoryView, group: TagGroupView, tag: TagView) => {
    setEditingTag({ category, group, tag });
    tagForm.setValues({
      name: tag.name,
      categoryId: category.id,
      groupId: group.id,
      description: tag.description ?? '',
      color: tag.color ?? DEFAULT_TAG_COLOR,
      textColor: tag.textColor ?? DEFAULT_TAG_TEXT_COLOR,
      allowsManual: tag.allowsManual,
      allowsAutomation: tag.allowsAutomation,
      isActive: tag.isActive,
    });
    openTagModal();
  };

  const handleReorderTags = async (groupId: string, tags: TagView[]) => {
    if (reorderTagsMutation.isPending) {
      return;
    }

    try {
      await reorderTagsMutation.mutateAsync({
        items: tags.map((tag, orderIndex) => ({
          id: tag.id,
          displayOrder: orderIndex,
          groupId,
        })),
      });
    } catch {
      // noop
    }
  };

  const handleSubmitCategory = categoryForm.onSubmit(async (values) => {
    const payload = buildCategoryPayload(values);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, payload: payload as UpdateTagCategoryRequest });
      } else {
        await createCategory.mutateAsync(payload);
      }

      // デフォルト設定の更新
      await updateColorDefaultsIfNeeded(
        'category',
        setAsCategoryDefaultBgColor,
        setAsCategoryDefaultTextColor,
        values
      );

      closeCategoryModal();
    } catch {
      // エラーハンドリングはミューテーション側の通知に委譲
    }
  });

  const handleSubmitTag = tagForm.onSubmit(async (values) => {
    const payload = buildTagPayload(values);
    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.tag.id, payload: payload as UpdateTagRequest });
      } else {
        await createTag.mutateAsync(payload);
      }

      // デフォルト設定の更新
      await updateColorDefaultsIfNeeded(
        'tag',
        setAsTagDefaultBgColor,
        setAsTagDefaultTextColor,
        values
      );

      closeTagModal();
    } catch {
      // 通知はミューテーション側で実施
    }
  });

  const handleOpenCreateAutomationRule = () => {
    setEditingAutomationRule(null);
    automationRuleForm.reset();
    openAutomationRuleModal();
  };

  const handleEditAutomationRule = (rule: TagAutomationRule) => {
    setEditingAutomationRule(rule);
    
    // configからtagIdsと年齢閾値設定、PAGE_ACTION設定を取得
    let tagIds: string[] = [];
    let ageThreshold: AutomationRuleFormValues['ageThreshold'] = {
      type: 'kitten',
      kitten: {},
      adult: {},
    };
    let pageAction: AutomationRuleFormValues['pageAction'] = {
      page: 'cats',
      action: 'create',
      targetSelection: 'event_target',
      specificCatIds: [],
    };

    if (rule.config && typeof rule.config === 'object') {
      const config = rule.config as { 
        tagIds?: string[]; 
        kitten?: { minDays?: number; maxDays?: number };
        adult?: { minMonths?: number; maxMonths?: number };
        page?: string;
        action?: string;
        targetSelection?: string;
        specificCatIds?: string[];
      };
      tagIds = config.tagIds || [];
      
      // 年齢閾値の設定を読み込む
      if (config.kitten) {
        ageThreshold = {
          type: 'kitten',
          kitten: config.kitten,
          adult: {},
        };
      } else if (config.adult) {
        ageThreshold = {
          type: 'adult',
          kitten: {},
          adult: config.adult,
        };
      }

      // PAGE_ACTION設定を読み込む
      if (config.page || config.action) {
        pageAction = {
          page: config.page || 'cats',
          action: config.action || 'create',
          targetSelection: config.targetSelection || 'event_target',
          specificCatIds: config.specificCatIds || [],
        };
      }
    }
    
    automationRuleForm.setValues({
      key: rule.key,
      name: rule.name,
      description: rule.description || '',
      triggerType: rule.triggerType,
      eventType: rule.eventType || '',
      scope: rule.scope || '',
      priority: rule.priority,
      isActive: rule.isActive,
      tagIds,
      ageThreshold,
      pageAction,
    });
    openAutomationRuleModal();
  };

  const handleOpenExecuteRule = (rule: TagAutomationRule) => {
    setExecutingRule(rule);
    openExecuteRuleModal();
  };

  const handleExecuteRule = async () => {
    if (!executingRule) return;
    
    try {
      await executeAutomationRule.mutateAsync({ id: executingRule.id });
      closeExecuteRuleModal();
      setExecutingRule(null);
    } catch {
      // エラーハンドリングはミューテーション側で実施
    }
  };

  const handleSubmitAutomationRule = automationRuleForm.onSubmit(async (values) => {
    const config: Record<string, unknown> = {
      tagIds: values.tagIds,
    };

    // 年齢閾値の設定を追加
    if (values.eventType === 'AGE_THRESHOLD' && values.ageThreshold) {
      if (values.ageThreshold.type === 'kitten' && values.ageThreshold.kitten) {
        config.kitten = values.ageThreshold.kitten;
      } else if (values.ageThreshold.type === 'adult' && values.ageThreshold.adult) {
        config.adult = values.ageThreshold.adult;
      }
    }

    // PAGE_ACTIONの設定を追加
    if (values.eventType === 'PAGE_ACTION' && values.pageAction) {
      config.page = values.pageAction.page;
      config.action = values.pageAction.action;
      config.targetSelection = values.pageAction.targetSelection;
      if (values.pageAction.targetSelection === 'specific_cats' && values.pageAction.specificCatIds) {
        config.specificCatIds = values.pageAction.specificCatIds;
      }
    }

    const payload: CreateTagAutomationRuleRequest | UpdateTagAutomationRuleRequest = {
      name: values.name,
      description: values.description || undefined,
      triggerType: values.triggerType,
      eventType: values.eventType || undefined,
      scope: values.scope || undefined,
      priority: values.priority,
      isActive: values.isActive,
      config,
    };

    if (!editingAutomationRule) {
      // 新規作成の場合はkeyを含める
      (payload as CreateTagAutomationRuleRequest).key = values.key;
    }

    try {
      if (editingAutomationRule) {
        await updateAutomationRule.mutateAsync({ 
          id: editingAutomationRule.id, 
          payload: payload as UpdateTagAutomationRuleRequest 
        });
      } else {
        await createAutomationRule.mutateAsync(payload as CreateTagAutomationRuleRequest);
      }
      closeAutomationRuleModal();
    } catch {
      // 通知はミューテーション側で実施
    }
  });

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('このカテゴリと関連タグを削除しますか？')) {
      return;
    }
    try {
      await deleteCategory.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm('このタグを削除しますか？')) {
      return;
    }
    try {
      await deleteTag.mutateAsync(id);
    } catch {
      // noop
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleCategoryDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || reorderCategoriesMutation.isPending) {
      return;
    }

    const oldIndex = sortedCategories.findIndex((item) => item.id === active.id);
    const newIndex = sortedCategories.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(sortedCategories, oldIndex, newIndex);
    void reorderCategoriesMutation.mutateAsync({
      items: reordered.map((category, orderIndex) => ({
        id: category.id,
        displayOrder: orderIndex,
      })),
    });
  };

  const handleScopeDraftSubmit = () => {
    const value = scopeDraft.trim();
    if (!value) {
      return;
    }
    if (!categoryForm.values.scopes.includes(value)) {
      categoryForm.setFieldValue('scopes', [...categoryForm.values.scopes, value]);
    }
    setScopeDraft('');
  };

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'タグ管理',
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button leftSection={<IconTag size={16} />} rightSection={<IconChevronDown size={16} />} size="sm">
            新規作成
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item 
            leftSection={<IconFolderPlus size={16} />} 
            onClick={handleOpenCreateCategory}
            disabled={isAnyMutationPending}
          >
            カテゴリ作成
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconTags size={16} />} 
            onClick={() => handleOpenCreateGroup()}
            disabled={sortedCategories.length === 0 || isAnyMutationPending}
          >
            グループ作成
          </Menu.Item>
          <Menu.Item 
            leftSection={<IconTag size={16} />} 
            onClick={() => handleOpenCreateTag()}
            disabled={sortedCategories.length === 0 || isAnyMutationPending}
          >
            タグ作成
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyMutationPending, sortedCategories.length]);

  return (
    <Container size="lg" pb="xl">
      <Stack gap="xl">
        <Alert icon={<IconInfoCircle size={18} />} variant="light">
          タグはカテゴリごとに整理され、カテゴリ単位でスコープ（利用ページ）やアクティブ状態を制御できます。並び替えや編集内容は保存すると即座にDBへ反映されます。
        </Alert>

        <Card withBorder padding="md" radius="md">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="md" wrap="wrap">
              <MultiSelect
                label="スコープフィルタ"
                data={filterScopeOptions}
                value={filters.scopes}
                onChange={(value) => setFilters((prev) => ({ ...prev, scopes: value }))}
                placeholder={filterScopeOptions.length ? 'スコープを選択' : '利用可能なスコープがありません'}
                searchable
                clearable
                nothingFoundMessage="スコープが見つかりません"
                size="sm"
                maxDropdownHeight={200}
                w={260}
              />
              <Switch
                label="非アクティブを含める"
                checked={filters.includeInactive}
                onChange={(event) => {
                  const checked = event.currentTarget?.checked ?? false;
                  setFilters((prev) => ({ ...prev, includeInactive: checked }));
                }}
              />
            </Group>
            {isFetching && <Loader size="sm" />}
          </Group>
        </Card>

        <Tabs defaultValue="categories" keepMounted={false} radius="md">
          <Tabs.List>
            <Tabs.Tab value="categories">カテゴリ</Tabs.Tab>
            <Tabs.Tab value="tags">タグ一覧</Tabs.Tab>
            <Tabs.Tab value="automation" leftSection={<IconRobot size={16} />}>
              自動化ルール
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="categories" pt="lg">
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : sortedCategories.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">カテゴリが見つかりません。新規作成してください。</Text>
              </Center>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                <SortableContext items={sortedCategories.map((category) => category.id)} strategy={rectSortingStrategy}>
                  <Stack gap="lg">
                    {sortedCategories.map((category) => (
                      <SortableCategoryCard
                        key={category.id}
                        category={category}
                        isAnyMutationPending={isAnyMutationPending}
                        reorderCategoriesPending={reorderCategoriesMutation.isPending}
                        deleteCategoryPending={deleteCategory.isPending}
                        deleteGroupPending={deleteGroup.isPending}
                        deleteTagPending={deleteTag.isPending}
                        reorderGroupsPending={reorderGroupsMutation.isPending}
                        reorderTagsPending={reorderTagsMutation.isPending}
                        onEditCategory={handleEditCategory}
                        onDeleteCategory={handleDeleteCategory}
                        onOpenCreateGroup={handleOpenCreateGroup}
                        onOpenCreateTag={handleOpenCreateTag}
                        onEditGroup={handleEditGroup}
                        onDeleteGroup={handleDeleteGroupAction}
                        onEditTag={handleEditTag}
                        onDeleteTag={handleDeleteTag}
                        onTagContextAction={handleTagContextAction}
                        onReorderGroups={handleReorderGroups}
                        onReorderTags={handleReorderTags}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="tags" pt="lg">
            {isLoading ? (
              <Center py="xl">
                <Loader />
              </Center>
            ) : flatTags.length === 0 ? (
              <Center py="xl">
                <Text c="dimmed">表示できるタグがありません。</Text>
              </Center>
            ) : (
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
                          onClick={() => handleEditTag(category, group, tag)}
                          disabled={isAnyMutationPending}
                        >
                          編集
                        </Button>
                        <Button size="xs" color="red" variant="light" onClick={() => void handleDeleteTag(tag.id)} disabled={deleteTag.isPending}>
                          削除
                        </Button>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="automation" pt="lg">
            <Stack gap="md">
              <Card withBorder padding="md" radius="md">
                <Stack gap="md">
                  <Group justify="space-between" align="center">
                    <Text size="lg" fw={600}>
                      自動化ルール
                    </Text>
                    <Button 
                      leftSection={<IconPlus size={16} />} 
                      size="sm" 
                      onClick={handleOpenCreateAutomationRule}
                      disabled={isAnyMutationPending || createAutomationRule.isPending}
                    >
                      ルール作成
                    </Button>
                  </Group>
                  <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                    自動化ルールを設定すると、特定のイベント（交配登録、妊娠確認、子猫登録など）が発生したときに、条件に合致する猫へ自動的にタグを付与できます。
                  </Alert>
                </Stack>
              </Card>

              {isLoadingAutomationRules ? (
                <Center py="xl">
                  <Loader />
                </Center>
              ) : automationRules.length === 0 ? (
                <Center py="xl">
                  <Stack gap="sm" align="center">
                    <IconRobot size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
                    <Text c="dimmed" size="sm">
                      自動化ルールが登録されていません
                    </Text>
                    <Text c="dimmed" size="xs">
                      「ルール作成」ボタンから新しいルールを追加できます
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <Stack gap="sm">
                  {automationRules.map((rule) => (
                    <Card key={rule.id} withBorder radius="md" padding="md">
                      <Group justify="space-between" align="flex-start">
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Group gap="xs" align="center">
                            <Text fw={500}>{rule.name}</Text>
                            {!rule.isActive && (
                              <Badge size="xs" color="gray" variant="outline">
                                無効
                              </Badge>
                            )}
                            <Badge size="xs" variant="light" color="blue">
                              {rule.triggerType === 'EVENT' && 'イベント'}
                              {rule.triggerType === 'SCHEDULE' && 'スケジュール'}
                              {rule.triggerType === 'MANUAL' && '手動'}
                            </Badge>
                            {rule.eventType && (
                              <Badge size="xs" variant="outline">
                                {rule.eventType === 'BREEDING_PLANNED' && '交配予定'}
                                {rule.eventType === 'BREEDING_CONFIRMED' && '交配確認'}
                                {rule.eventType === 'PREGNANCY_CONFIRMED' && '妊娠確認'}
                                {rule.eventType === 'KITTEN_REGISTERED' && '子猫登録'}
                                {rule.eventType === 'AGE_THRESHOLD' && '年齢閾値'}
                                {rule.eventType === 'CUSTOM' && 'カスタム'}
                              </Badge>
                            )}
                          </Group>
                          {rule.description && (
                            <Text size="sm" c="dimmed">
                              {rule.description}
                            </Text>
                          )}
                          <Group gap="xs">
                            <Badge size="xs" variant="outline">
                              優先度: {rule.priority}
                            </Badge>
                            {rule.scope && (
                              <Badge size="xs" variant="outline">
                                スコープ: {rule.scope}
                              </Badge>
                            )}
                            {rule.config && typeof rule.config === 'object' && (rule.config as { tagIds?: string[] }).tagIds && (
                              <Badge size="xs" variant="outline" color="teal">
                                付与タグ: {((rule.config as { tagIds?: string[] }).tagIds ?? []).length}個
                              </Badge>
                            )}
                            {rule._count && (
                              <>
                                {rule._count.runs !== undefined && (
                                  <Badge size="xs" variant="outline">
                                    実行回数: {rule._count.runs}
                                  </Badge>
                                )}
                                {rule._count.assignmentHistory !== undefined && (
                                  <Badge size="xs" variant="outline">
                                    付与履歴: {rule._count.assignmentHistory}
                                  </Badge>
                                )}
                              </>
                            )}
                          </Group>
                        </Stack>
                        <Group gap={6}>
                          <Tooltip label="テスト実行">
                            <ActionIcon
                              variant="light"
                              color="green"
                              size="sm"
                              onClick={() => handleOpenExecuteRule(rule)}
                              disabled={isAnyMutationPending}
                            >
                              <IconWand size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="編集">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleEditAutomationRule(rule)}
                              disabled={isAnyMutationPending || updateAutomationRule.isPending}
                            >
                              <IconPencil size={14} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="削除">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              disabled={deleteAutomationRule.isPending}
                              onClick={() => void deleteAutomationRule.mutate(rule.id)}
                            >
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        <Modal
          opened={categoryModalOpened}
          onClose={() => {
            closeCategoryModal();
            setEditingCategory(null);
            setScopeDraft('');
          }}
          title={editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
          size="lg"
          keepMounted={false}
        >
          <Box component="form" onSubmit={handleSubmitCategory}>
            <Stack gap="md">
              <TextInput
                label="キー"
                description="URLなどで利用する識別子（未入力の場合は自動生成）"
                value={categoryForm.values.key}
                onChange={(event) => categoryForm.setFieldValue('key', event.currentTarget.value)}
              />
              <TextInput
                label="カテゴリ名"
                required
                value={categoryForm.values.name}
                onChange={(event) => categoryForm.setFieldValue('name', event.currentTarget.value)}
                error={categoryForm.errors.name}
              />
              <TextInput
                label="説明"
                placeholder="カテゴリの用途や対象を記載"
                value={categoryForm.values.description}
                onChange={(event) => categoryForm.setFieldValue('description', event.currentTarget.value)}
              />
              <Group gap="md" align="flex-end">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <ColorInput
                    label="背景カラー"
                    swatches={PRESET_COLORS}
                    value={categoryForm.values.color}
                    onChange={(value) => categoryForm.setFieldValue('color', value || DEFAULT_CATEGORY_COLOR)}
                  />
                  <Checkbox
                    label="新規カテゴリのデフォルトに設定"
                    checked={setAsCategoryDefaultBgColor}
                    onChange={(e) => setSetAsCategoryDefaultBgColor(e.currentTarget.checked)}
                  />
                </Stack>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <ColorInput
                    label="テキストカラー"
                    swatches={PRESET_COLORS}
                    value={categoryForm.values.textColor}
                    onChange={(value) =>
                      categoryForm.setFieldValue('textColor', value || DEFAULT_CATEGORY_TEXT_COLOR)
                    }
                  />
                  <Checkbox
                    label="新規カテゴリのデフォルトに設定"
                    checked={setAsCategoryDefaultTextColor}
                    onChange={(e) => setSetAsCategoryDefaultTextColor(e.currentTarget.checked)}
                  />
                </Stack>
              </Group>
              <Card
                withBorder
                padding="sm"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: `${(categoryForm.values.color || DEFAULT_CATEGORY_COLOR)}26`,
                  color: categoryForm.values.textColor || DEFAULT_CATEGORY_TEXT_COLOR,
                  borderColor: categoryForm.values.color || DEFAULT_CATEGORY_COLOR,
                }}
              >
                <Text fw={600}>{categoryForm.values.name || 'カテゴリ名'}</Text>
                <Text size="xs">サンプルプレビュー</Text>
              </Card>
              <MultiSelect
                label="スコープ"
                data={categoryScopeOptions}
                value={categoryForm.values.scopes}
                onChange={(value) => categoryForm.setFieldValue('scopes', value)}
                placeholder="このカテゴリを使用する画面や機能"
                searchable
                clearable
                maxDropdownHeight={220}
              />
              <Group align="flex-end" gap="sm">
                <TextInput
                  label="スコープを追加"
                  placeholder="新しいスコープ名"
                  value={scopeDraft}
                  onChange={(event) => setScopeDraft(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleScopeDraftSubmit();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="light"
                  onClick={handleScopeDraftSubmit}
                  disabled={!scopeDraft.trim() || categoryForm.values.scopes.includes(scopeDraft.trim())}
                >
                  追加
                </Button>
              </Group>
              <Switch
                label="アクティブ"
                checked={categoryForm.values.isActive}
                onChange={(event) => categoryForm.setFieldValue('isActive', event.currentTarget.checked)}
              />
              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={closeCategoryModal}>
                  キャンセル
                </Button>
                <Button type="submit" loading={isCategorySubmitting}>
                  {editingCategory ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>

        <Modal
          opened={groupModalOpened}
          onClose={() => {
            closeGroupModal();
            setEditingGroup(null);
          }}
          title={editingGroup ? 'タググループを編集' : 'タググループを追加'}
          size="lg"
          keepMounted={false}
        >
          <Box component="form" onSubmit={handleSubmitGroup}>
            <Stack gap="md">
              <Select
                label="カテゴリ"
                data={categoryOptions}
                value={groupForm.values.categoryId}
                onChange={(value) => groupForm.setFieldValue('categoryId', value ?? '')}
                error={groupForm.errors.categoryId}
                required
              />
              <TextInput
                label="グループ名"
                value={groupForm.values.name}
                onChange={(event) => groupForm.setFieldValue('name', event.currentTarget.value)}
                error={groupForm.errors.name}
                required
              />
              <TextInput
                label="説明"
                placeholder="タググループの用途"
                value={groupForm.values.description}
                onChange={(event) => groupForm.setFieldValue('description', event.currentTarget.value)}
              />
              <Checkbox
                label="親カテゴリのカラーを継承"
                checked={inheritGroupColorFromCategory}
                onChange={(e) => {
                  setInheritGroupColorFromCategory(e.currentTarget.checked);
                  if (e.currentTarget.checked) {
                    const selectedCategory = sortedCategories.find(c => c.id === groupForm.values.categoryId);
                    if (selectedCategory) {
                      groupForm.setFieldValue('color', selectedCategory.color || DEFAULT_CATEGORY_COLOR);
                      groupForm.setFieldValue('textColor', selectedCategory.textColor || DEFAULT_CATEGORY_TEXT_COLOR);
                    }
                  }
                }}
              />
              <Group gap="md" align="flex-end">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <ColorInput
                    label="背景カラー"
                    swatches={PRESET_COLORS}
                    value={groupForm.values.color}
                    onChange={(value) => groupForm.setFieldValue('color', value || DEFAULT_GROUP_COLOR)}
                  />
                  <Checkbox
                    label="新規グループのデフォルトに設定"
                    checked={setAsGroupDefaultBgColor}
                    onChange={(e) => setSetAsGroupDefaultBgColor(e.currentTarget.checked)}
                  />
                </Stack>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <ColorInput
                    label="テキストカラー"
                    swatches={PRESET_COLORS}
                    value={groupForm.values.textColor}
                    onChange={(value) =>
                      groupForm.setFieldValue('textColor', value || DEFAULT_GROUP_TEXT_COLOR)
                    }
                  />
                  <Checkbox
                    label="新規グループのデフォルトに設定"
                    checked={setAsGroupDefaultTextColor}
                    onChange={(e) => setSetAsGroupDefaultTextColor(e.currentTarget.checked)}
                  />
                </Stack>
              </Group>
              <Card
                withBorder
                padding="sm"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: `${(groupForm.values.color || DEFAULT_GROUP_COLOR)}26`,
                  color: groupForm.values.textColor || DEFAULT_GROUP_TEXT_COLOR,
                  borderColor: groupForm.values.color || DEFAULT_GROUP_COLOR,
                }}
              >
                <Text fw={600}>{groupForm.values.name || 'タググループ名'}</Text>
                <Text size="xs">サンプルプレビュー</Text>
              </Card>
              <Switch
                label="アクティブ"
                checked={groupForm.values.isActive}
                onChange={(event) => groupForm.setFieldValue('isActive', event.currentTarget.checked)}
              />
              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={closeGroupModal}>
                  キャンセル
                </Button>
                <Button type="submit" loading={isGroupSubmitting}>
                  {editingGroup ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>

        <Modal
          opened={tagModalOpened}
          onClose={() => {
            closeTagModal();
            setEditingTag(null);
          }}
          title={editingTag ? 'タグを編集' : 'タグを追加'}
          size="lg"
          keepMounted={false}
        >
          <Box component="form" onSubmit={handleSubmitTag}>
            <Stack gap="md">
              <Select
                label="カテゴリ"
                data={categoryOptions}
                value={tagForm.values.categoryId}
                onChange={(value) => {
                  tagForm.setFieldValue('categoryId', value ?? '');
                  tagForm.setFieldValue('groupId', '');
                }}
                error={tagForm.errors.categoryId}
                required
              />
              <Select
                label="タググループ"
                placeholder={tagForm.values.categoryId ? 'グループを選択してください' : '先にカテゴリを選択してください'}
                data={tagGroupOptions}
                value={tagForm.values.groupId}
                onChange={(value) => tagForm.setFieldValue('groupId', value ?? '')}
                error={tagForm.errors.groupId}
                required
                disabled={!tagForm.values.categoryId || tagGroupOptions.length === 0}
              />
              <TextInput
                label="タグ名"
                value={tagForm.values.name}
                onChange={(event) => tagForm.setFieldValue('name', event.currentTarget.value)}
                error={tagForm.errors.name}
                required
              />
              <TextInput
                label="説明"
                placeholder="タグの補足情報"
                value={tagForm.values.description}
                onChange={(event) => tagForm.setFieldValue('description', event.currentTarget.value)}
              />
              <Checkbox
                label="親グループのカラーを継承"
                checked={inheritTagColorFromGroup}
                onChange={(e) => {
                  setInheritTagColorFromGroup(e.currentTarget.checked);
                  if (e.currentTarget.checked) {
                    const selectedCategory = sortedCategories.find(c => c.id === tagForm.values.categoryId);
                    const selectedGroup = selectedCategory?.groups.find(g => g.id === tagForm.values.groupId);
                    if (selectedGroup) {
                      tagForm.setFieldValue('color', selectedGroup.color || DEFAULT_GROUP_COLOR);
                      tagForm.setFieldValue('textColor', selectedGroup.textColor || DEFAULT_GROUP_TEXT_COLOR);
                    }
                  }
                }}
              />
              <Group gap="md" align="flex-end">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <ColorInput
                    label="背景カラー"
                    swatches={PRESET_COLORS}
                    value={tagForm.values.color}
                    onChange={(value) => tagForm.setFieldValue('color', value || DEFAULT_TAG_COLOR)}
                  />
                  <Checkbox
                    label="新規タグのデフォルトに設定"
                    checked={setAsTagDefaultBgColor}
                    onChange={(e) => setSetAsTagDefaultBgColor(e.currentTarget.checked)}
                  />
                </Stack>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <ColorInput
                    label="テキストカラー"
                    swatches={PRESET_COLORS}
                    value={tagForm.values.textColor}
                    onChange={(value) =>
                      tagForm.setFieldValue('textColor', value || DEFAULT_TAG_TEXT_COLOR)
                    }
                  />
                  <Checkbox
                    label="新規タグのデフォルトに設定"
                    checked={setAsTagDefaultTextColor}
                    onChange={(e) => setSetAsTagDefaultTextColor(e.currentTarget.checked)}
                  />
                </Stack>
              </Group>
              <Card
                withBorder
                padding="sm"
                radius="md"
                shadow="xs"
                style={{
                  backgroundColor: `${(tagForm.values.color || DEFAULT_TAG_COLOR)}26`,
                  color: tagForm.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                  borderColor: tagForm.values.color || DEFAULT_TAG_COLOR,
                }}
              >
                <Group gap="xs" align="center" wrap="wrap">
                  <Text fw={600}>{tagForm.values.name || 'タグ名'}</Text>
                  <Badge size="xs" variant="outline" color="gray">
                    プレビュー
                  </Badge>
                </Group>
                {tagForm.values.description && (
                  <Text size="xs" mt={4}>
                    {tagForm.values.description}
                  </Text>
                )}
                <Group gap={6} mt="xs" wrap="wrap">
                  <Badge
                    size="xs"
                    variant="light"
                    style={{
                      backgroundColor: `${(tagForm.values.color || DEFAULT_TAG_COLOR)}33`,
                      color: tagForm.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                    }}
                  >
                    手動 {tagForm.values.allowsManual ? '可' : '不可'}
                  </Badge>
                  <Badge
                    size="xs"
                    variant="light"
                    style={{
                      backgroundColor: `${(tagForm.values.color || DEFAULT_TAG_COLOR)}33`,
                      color: tagForm.values.textColor || DEFAULT_TAG_TEXT_COLOR,
                    }}
                  >
                    自動 {tagForm.values.allowsAutomation ? '可' : '不可'}
                  </Badge>
                </Group>
              </Card>
              <Group gap="lg">
                <Switch
                  label="手動付与を許可"
                  checked={tagForm.values.allowsManual}
                  onChange={(event) => tagForm.setFieldValue('allowsManual', event.currentTarget.checked)}
                />
                <Switch
                  label="自動付与を許可"
                  checked={tagForm.values.allowsAutomation}
                  onChange={(event) => tagForm.setFieldValue('allowsAutomation', event.currentTarget.checked)}
                />
              </Group>
              <Switch
                label="アクティブ"
                checked={tagForm.values.isActive}
                onChange={(event) => tagForm.setFieldValue('isActive', event.currentTarget.checked)}
              />
              <Group justify="flex-end" gap="sm">
                <Button variant="outline" onClick={closeTagModal}>
                  キャンセル
                </Button>
                <Button type="submit" loading={isTagSubmitting}>
                  {editingTag ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>

        <Modal
          opened={automationRuleModalOpened}
          onClose={() => {
            closeAutomationRuleModal();
            setEditingAutomationRule(null);
            automationRuleForm.reset();
          }}
          title={editingAutomationRule ? '自動化ルールの編集' : '自動化ルールの作成'}
          size="lg"
        >
          <Box component="form" onSubmit={handleSubmitAutomationRule}>
            <Stack gap="md">
              <TextInput
                label="キー"
                placeholder="例: breeding_planned_tag"
                description="英数字、ハイフン、アンダースコアのみ使用可能"
                required
                disabled={!!editingAutomationRule}
                {...automationRuleForm.getInputProps('key')}
              />

              <TextInput
                label="ルール名"
                placeholder="例: 交配予定時の自動タグ付与"
                required
                {...automationRuleForm.getInputProps('name')}
              />

              <TextInput
                label="説明"
                placeholder="このルールの動作を説明してください"
                {...automationRuleForm.getInputProps('description')}
              />

              <Select
                label="トリガータイプ"
                placeholder="トリガータイプを選択"
                data={TRIGGER_TYPE_OPTIONS}
                required
                {...automationRuleForm.getInputProps('triggerType')}
              />

              {automationRuleForm.values.triggerType === 'EVENT' && (
                <Select
                  label="イベントタイプ"
                  placeholder="イベントタイプを選択"
                  data={EVENT_TYPE_OPTIONS}
                  required
                  {...automationRuleForm.getInputProps('eventType')}
                />
              )}

              <Select
                label="スコープ"
                placeholder="適用するスコープ（任意）"
                description="このルールを適用するページ・機能を選択"
                data={automationScopeOptions}
                clearable
                searchable
                {...automationRuleForm.getInputProps('scope')}
              />

              <MultiSelect
                label="付与するタグ"
                placeholder="イベント発生時に自動付与するタグを選択"
                description="自動化が許可されているタグのみ選択できます"
                data={automationTagOptions}
                searchable
                required
                maxDropdownHeight={300}
                {...automationRuleForm.getInputProps('tagIds')}
              />

              {/* 年齢閾値の設定 */}
              {automationRuleForm.values.eventType === 'AGE_THRESHOLD' && (
                <Card withBorder padding="md" bg="gray.0">
                  <Stack gap="md">
                    <Text fw={500} size="sm">年齢閾値の設定</Text>
                    
                    <SegmentedControl
                      data={[
                        { value: 'kitten', label: '子猫用（日数）' },
                        { value: 'adult', label: '成猫用（月数）' },
                      ]}
                      value={automationRuleForm.values.ageThreshold?.type || 'kitten'}
                      onChange={(value) => {
                        automationRuleForm.setFieldValue('ageThreshold.type', value as 'kitten' | 'adult');
                      }}
                    />

                    {automationRuleForm.values.ageThreshold?.type === 'kitten' && (
                      <Group grow>
                        <NumberInput
                          label="最小日数"
                          placeholder="例: 60"
                          description="生後◯日以上"
                          min={0}
                          {...automationRuleForm.getInputProps('ageThreshold.kitten.minDays')}
                        />
                        <NumberInput
                          label="最大日数"
                          placeholder="例: 90"
                          description="生後◯日未満"
                          min={0}
                          {...automationRuleForm.getInputProps('ageThreshold.kitten.maxDays')}
                        />
                      </Group>
                    )}

                    {automationRuleForm.values.ageThreshold?.type === 'adult' && (
                      <Group grow>
                        <NumberInput
                          label="最小月数"
                          placeholder="例: 6"
                          description="生後◯ヶ月以上"
                          min={0}
                          {...automationRuleForm.getInputProps('ageThreshold.adult.minMonths')}
                        />
                        <NumberInput
                          label="最大月数"
                          placeholder="例: 12"
                          description="生後◯ヶ月未満"
                          min={0}
                          {...automationRuleForm.getInputProps('ageThreshold.adult.maxMonths')}
                        />
                      </Group>
                    )}

                    <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                      {automationRuleForm.values.ageThreshold?.type === 'kitten' 
                        ? '子猫（母猫IDが設定されている猫）に対して、指定した日数の範囲でタグを自動付与します。'
                        : '成猫に対して、指定した月数の範囲でタグを自動付与します。'
                      }
                    </Alert>
                  </Stack>
                </Card>
              )}

              {/* PAGE_ACTION設定 */}
              {automationRuleForm.values.eventType === 'PAGE_ACTION' && (
                <Card withBorder padding="md" bg="blue.0">
                  <Stack gap="md">
                    <Text fw={500} size="sm">ページ・アクション設定</Text>
                    
                    <Select
                      label="ページ"
                      placeholder="アクションが発生するページを選択"
                      description="どのページでイベントが発生するかを指定"
                      data={PAGE_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
                      required
                      onChange={(value) => {
                        automationRuleForm.setFieldValue('pageAction.page', value || '');
                        // ページ変更時にアクションをクリア
                        automationRuleForm.setFieldValue('pageAction.action', '');
                      }}
                      value={automationRuleForm.values.pageAction?.page}
                    />

                    {automationRuleForm.values.pageAction?.page && (
                      <Select
                        label="アクション"
                        placeholder="発生するアクションを選択"
                        description="どのようなアクションが発生した際にタグを付与するか"
                        data={pageActionOptions}
                        required
                        {...automationRuleForm.getInputProps('pageAction.action')}
                      />
                    )}

                    <Select
                      label="対象猫の選択方法"
                      placeholder="タグを付与する猫の選択方法"
                      description="どの猫にタグを付与するかを指定"
                      data={TARGET_SELECTION_OPTIONS}
                      required
                      {...automationRuleForm.getInputProps('pageAction.targetSelection')}
                    />

                    {automationRuleForm.values.pageAction?.targetSelection === 'specific_cats' && (
                      <MultiSelect
                        label="特定の猫"
                        placeholder="タグを付与する猫を選択"
                        description="指定した猫にのみタグを付与します"
                        data={[]}
                        searchable
                        {...automationRuleForm.getInputProps('pageAction.specificCatIds')}
                      />
                    )}

                    <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                      <Stack gap={4}>
                        <Text size="sm" fw={500}>現在の設定</Text>
                        {automationRuleForm.values.pageAction?.page && (
                          <>
                            <Text size="xs">
                              📄 ページ: {PAGE_OPTIONS.find(p => p.value === automationRuleForm.values.pageAction?.page)?.label}
                            </Text>
                            <Text size="xs" c="dimmed">
                              パス: {PAGE_OPTIONS.find(p => p.value === automationRuleForm.values.pageAction?.page)?.href}
                            </Text>
                          </>
                        )}
                        {automationRuleForm.values.pageAction?.action && pageActionOptions.length > 0 && (
                          <Text size="xs">
                            ⚡ アクション: {pageActionOptions.find(a => a.value === automationRuleForm.values.pageAction?.action)?.label}
                          </Text>
                        )}
                        {!automationRuleForm.values.pageAction?.page && (
                          <Text size="xs" c="dimmed">
                            まずページを選択してください
                          </Text>
                        )}
                        {automationRuleForm.values.pageAction?.page && pageActionOptions.length === 0 && (
                          <Text size="xs" c="orange">
                            ⚠️ 選択したページにはアクションが定義されていません
                          </Text>
                        )}
                      </Stack>
                    </Alert>
                  </Stack>
                </Card>
              )}

              <NumberInput
                label="優先度"
                description="0-100の範囲で設定。数値が大きいほど優先度が高くなります"
                min={0}
                max={100}
                required
                {...automationRuleForm.getInputProps('priority')}
              />

              <Switch
                label="このルールを有効にする"
                {...automationRuleForm.getInputProps('isActive', { type: 'checkbox' })}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => {
                    closeAutomationRuleModal();
                    setEditingAutomationRule(null);
                    automationRuleForm.reset();
                  }}
                >
                  キャンセル
                </Button>
                <Button 
                  type="submit" 
                  loading={createAutomationRule.isPending || updateAutomationRule.isPending}
                >
                  {editingAutomationRule ? '更新' : '作成'}
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>

        <Modal
          opened={executeRuleModalOpened}
          onClose={() => {
            closeExecuteRuleModal();
            setExecutingRule(null);
          }}
          title="自動化ルールのテスト実行"
          size="md"
        >
          <Stack gap="md">
            {executingRule && (
              <>
                <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                  このルールをテスト実行します。実際のデータに対してタグの付与が行われますのでご注意ください。
                </Alert>

                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    ルール名
                  </Text>
                  <Text size="sm" c="dimmed">
                    {executingRule.name}
                  </Text>
                </Box>

                {executingRule.description && (
                  <Box>
                    <Text size="sm" fw={500} mb={4}>
                      説明
                    </Text>
                    <Text size="sm" c="dimmed">
                      {executingRule.description}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text size="sm" fw={500} mb={4}>
                    イベントタイプ
                  </Text>
                  <Badge size="sm" variant="light">
                    {executingRule.eventType === 'BREEDING_PLANNED' && '交配予定'}
                    {executingRule.eventType === 'BREEDING_CONFIRMED' && '交配確認'}
                    {executingRule.eventType === 'PREGNANCY_CONFIRMED' && '妊娠確認'}
                    {executingRule.eventType === 'KITTEN_REGISTERED' && '子猫登録'}
                    {executingRule.eventType === 'AGE_THRESHOLD' && '年齢閾値'}
                    {executingRule.eventType === 'CUSTOM' && 'カスタム'}
                  </Badge>
                </Box>

                {executingRule.config && typeof executingRule.config === 'object' && (executingRule.config as { tagIds?: string[] }).tagIds && (
                  <Box>
                    <Text size="sm" fw={500} mb={4}>
                      付与するタグ
                    </Text>
                    <Text size="sm" c="dimmed">
                      {((executingRule.config as { tagIds?: string[] }).tagIds ?? []).length}個のタグを付与
                    </Text>
                  </Box>
                )}

                <Alert icon={<IconInfoCircle size={18} />} variant="light" color="yellow">
                  注意: テスト用のダミーデータでイベントを発行します。実際の猫データには影響しません。
                </Alert>
              </>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={() => {
                  closeExecuteRuleModal();
                  setExecutingRule(null);
                }}
                disabled={executeAutomationRule.isPending}
              >
                キャンセル
              </Button>
              <Button
                color="green"
                onClick={handleExecuteRule}
                loading={executeAutomationRule.isPending}
                leftSection={<IconWand size={16} />}
              >
                実行
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* 操作確認モーダル */}
        <OperationModalManager
          operationType={currentOperation}
          entity={currentEntity}
          entityType="タグ"
          onClose={closeOperation}
          onConfirm={handleOperationConfirm}
        />
      </Stack>
    </Container>
  );
}
