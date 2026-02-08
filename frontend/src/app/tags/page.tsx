'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  Container,
  Group,
  Loader,
  Stack,
  Switch,
  Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconFolderPlus,
  IconPlus,
  IconRobot,
  IconTag,
  IconTags,
} from '@tabler/icons-react';

import { useContextMenu } from '@/components/context-menu/use-context-menu';
import { OperationModalManager } from '@/components/context-menu/operation-modal-manager';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import type {
  TagCategoryView,
  TagGroupView,
  TagView,
  CreateTagGroupRequest,
  UpdateTagCategoryRequest,
  UpdateTagGroupRequest,
  UpdateTagRequest,
} from '@/lib/api/hooks/use-tags';
import type {
  TagAutomationRule,
  CreateTagAutomationRuleRequest,
  UpdateTagAutomationRuleRequest,
} from '@/lib/api/hooks/use-tag-automation';

import type {
  CategoryFormValues,
  TagFormValues,
  GroupFormValues,
  AutomationRuleFormValues,
} from './types';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
  DEFAULT_GROUP_COLOR,
  DEFAULT_GROUP_TEXT_COLOR,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
  CATEGORY_SCOPE_OPTIONS,
  PAGE_ACTIONS_MAP,
} from './constants';
import { buildCategoryPayload, buildTagPayload, sortGroups } from './utils';
import { useTagPageData } from './hooks/useTagPageData';
import { useAutomationRulesData } from './hooks/useAutomationRulesData';
import {
  CategoriesTab,
  TagsListTab,
  AutomationTab,
  CategoryModal,
  GroupModal,
  TagModal,
  AutomationRuleModal,
  ExecuteRuleModal,
} from './components';

import { ActionMenu } from '@/app/tenants/_components/ActionMenu';

// 有効なタブ値の型定義
type TabValue = 'categories' | 'tags' | 'automation';
const VALID_TABS: TabValue[] = ['categories', 'tags', 'automation'];

export default function TagsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URLパラメータからタブ状態を取得（無効な値の場合はデフォルトの 'categories' を使用）
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = VALID_TABS.includes(tabParam as TabValue)
    ? (tabParam as TabValue)
    : 'categories';

  const { setPageHeader } = usePageHeader();

  // タブ切り替え時にURLを更新
  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // データ取得
  const {
    filters,
    setFilters,
    isLoading,
    isFetching,
    sortedCategories,
    flatTags,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategoriesMutation,
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroupsMutation,
    createTag,
    updateTag,
    deleteTag,
    reorderTagsMutation,
    colorDefaults,
    updateTagColorDefaults,
    isCategorySubmitting,
    isGroupSubmitting,
    isTagSubmitting,
    isAnyMutationPending,
  } = useTagPageData();

  const {
    isLoadingAutomationRules,
    automationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    executeAutomationRule,
  } = useAutomationRulesData();

  // 編集状態
  const [editingCategory, setEditingCategory] = useState<TagCategoryView | null>(null);
  const [editingGroup, setEditingGroup] = useState<{ category: TagCategoryView; group: TagGroupView } | null>(null);
  const [editingTag, setEditingTag] = useState<{ category: TagCategoryView; group: TagGroupView; tag: TagView } | null>(null);
  const [editingAutomationRule, setEditingAutomationRule] = useState<TagAutomationRule | null>(null);
  const [executingRule, setExecutingRule] = useState<TagAutomationRule | null>(null);

  // モーダル状態
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false);
  const [groupModalOpened, { open: openGroupModal, close: closeGroupModal }] = useDisclosure(false);
  const [tagModalOpened, { open: openTagModal, close: closeTagModal }] = useDisclosure(false);
  const [automationRuleModalOpened, { open: openAutomationRuleModal, close: closeAutomationRuleModal }] = useDisclosure(false);
  const [executeRuleModalOpened, { open: openExecuteRuleModal, close: closeExecuteRuleModal }] = useDisclosure(false);

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

  // フォーム
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
      ruleType: 'PAGE_ACTION',
      actionType: 'ASSIGN',
      tagIds: [],
      name: '',
      description: '',
      isActive: true,
      pageAction: {
        page: 'cats',
        action: '',
      },
      ageThreshold: {
        ageType: 'days',
        threshold: 60,
      },
      triggerTagId: '',
    },
    validate: {
      tagIds: (value) => {
        if (!value || value.length === 0) {
          return '少なくとも1つのタグを選択してください';
        }
        return null;
      },
      triggerTagId: (value, values) => {
        if (values.ruleType === 'TAG_ASSIGNED' && !value) {
          return 'トリガータグを選択してください';
        }
        return null;
      },
    },
  });

  // オプション生成

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

  // タグモーダルでグループの自動選択
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
    if (!tagForm.values.groupId && tagGroupOptions.length > 0) {
      tagForm.setFieldValue('groupId', tagGroupOptions[0].value);
    }
  }, [tagModalOpened, tagForm, tagGroupOptions]);

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

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    handleAction: handleTagContextAction,
    openOperation,
    closeOperation,
  } = useContextMenu<TagView>({
    edit: (tag) => {
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

  // カテゴリ操作
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
    openCategoryModal();
  };

  const handleSubmitCategory = categoryForm.onSubmit(async (values) => {
    const payload = buildCategoryPayload(values);
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, payload: payload as UpdateTagCategoryRequest });
      } else {
        await createCategory.mutateAsync(payload);
      }
      await updateColorDefaultsIfNeeded('category', setAsCategoryDefaultBgColor, setAsCategoryDefaultTextColor, values);
      closeCategoryModal();
    } catch {
      // エラーハンドリングはミューテーション側の通知に委譲
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

  // グループ操作
  const handleOpenCreateGroup = (categoryId?: string) => {
    setEditingGroup(null);
    const selectedCategoryId = categoryId ?? (sortedCategories.length > 0 ? sortedCategories[0].id : '');
    groupForm.setValues({
      categoryId: selectedCategoryId,
      name: '',
      description: '',
      color: colorDefaults?.group?.color || DEFAULT_GROUP_COLOR,
      textColor: colorDefaults?.group?.textColor || DEFAULT_GROUP_TEXT_COLOR,
      isActive: true,
    });
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
      await updateColorDefaultsIfNeeded('group', setAsGroupDefaultBgColor, setAsGroupDefaultTextColor, values);
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

  const handleInheritGroupColorFromCategoryChange = (checked: boolean) => {
    setInheritGroupColorFromCategory(checked);
    if (checked) {
      const selectedCategory = sortedCategories.find(c => c.id === groupForm.values.categoryId);
      if (selectedCategory) {
        groupForm.setFieldValue('color', selectedCategory.color || DEFAULT_CATEGORY_COLOR);
        groupForm.setFieldValue('textColor', selectedCategory.textColor || DEFAULT_CATEGORY_TEXT_COLOR);
      }
    }
  };

  // タグ操作
  const handleOpenCreateTag = (categoryId?: string, groupId?: string) => {
    setEditingTag(null);
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

  const handleSubmitTag = tagForm.onSubmit(async (values) => {
    const payload = buildTagPayload(values);
    try {
      if (editingTag) {
        await updateTag.mutateAsync({ id: editingTag.tag.id, payload: payload as UpdateTagRequest });
      } else {
        await createTag.mutateAsync(payload);
      }
      await updateColorDefaultsIfNeeded('tag', setAsTagDefaultBgColor, setAsTagDefaultTextColor, values);
      closeTagModal();
    } catch {
      // 通知はミューテーション側で実施
    }
  });

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

  const handleInheritTagColorFromGroupChange = (checked: boolean) => {
    setInheritTagColorFromGroup(checked);
    if (checked) {
      const selectedCategory = sortedCategories.find(c => c.id === tagForm.values.categoryId);
      const selectedGroup = selectedCategory?.groups.find(g => g.id === tagForm.values.groupId);
      if (selectedGroup) {
        tagForm.setFieldValue('color', selectedGroup.color || DEFAULT_GROUP_COLOR);
        tagForm.setFieldValue('textColor', selectedGroup.textColor || DEFAULT_GROUP_TEXT_COLOR);
      }
    }
  };

  // 自動化ルール操作
  const handleOpenCreateAutomationRule = () => {
    setEditingAutomationRule(null);
    automationRuleForm.reset();
    openAutomationRuleModal();
  };

  const handleEditAutomationRule = (rule: TagAutomationRule) => {
    setEditingAutomationRule(rule);

    // configからデータを抽出
    const config = (rule.config && typeof rule.config === 'object') ? rule.config as Record<string, unknown> : {};
    const tagIds = (config.tagIds as string[]) || [];

    // ルールタイプの判定
    let ruleType: AutomationRuleFormValues['ruleType'] = 'PAGE_ACTION';
    if (rule.eventType === 'AGE_THRESHOLD') {
      ruleType = 'AGE_THRESHOLD';
    } else if (rule.eventType === 'TAG_ASSIGNED') {
      ruleType = 'TAG_ASSIGNED';
    }

    // アクションタイプの判定
    const actionType: AutomationRuleFormValues['actionType'] =
      (config.actionType as string) === 'REMOVE' ? 'REMOVE' : 'ASSIGN';

    // ページアクション設定
    const pageAction: AutomationRuleFormValues['pageAction'] = {
      page: (config.page as string) || 'cats',
      action: (config.action as string) || '',
    };

    // 年齢閾値設定
    const ageThreshold: AutomationRuleFormValues['ageThreshold'] = {
      ageType: (config.ageType as 'days' | 'months') || 'days',
      threshold: (config.threshold as number) || 60,
    };

    // トリガータグID
    const triggerTagId = (config.triggerTagId as string) || '';

    automationRuleForm.setValues({
      ruleType,
      actionType,
      tagIds,
      name: rule.name,
      description: rule.description || '',
      isActive: rule.isActive,
      pageAction,
      ageThreshold,
      triggerTagId,
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
    // configを構築
    const config: Record<string, unknown> = {
      tagIds: values.tagIds,
      actionType: values.actionType,
    };

    // ルールタイプに応じた設定を追加
    if (values.ruleType === 'PAGE_ACTION') {
      config.page = values.pageAction.page;
      config.action = values.pageAction.action;
    } else if (values.ruleType === 'AGE_THRESHOLD') {
      config.ageType = values.ageThreshold.ageType;
      config.threshold = values.ageThreshold.threshold;
    } else if (values.ruleType === 'TAG_ASSIGNED') {
      config.triggerTagId = values.triggerTagId;
    }

    // ペイロードを構築（keyは省略してバックエンドで自動生成）
    const payload: CreateTagAutomationRuleRequest | UpdateTagAutomationRuleRequest = {
      name: values.name || undefined, // 空の場合はバックエンドで自動生成
      description: values.description || undefined,
      triggerType: 'EVENT', // 全て EVENT トリガー
      eventType: values.ruleType, // ruleTypeをeventTypeとして使用
      isActive: values.isActive,
      config,
    };

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

  const handleDeleteAutomationRule = (id: string) => {
    deleteAutomationRule.mutate(id);
  };

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'タグ管理',
      <ActionMenu
        buttonLabel="新規作成"
        buttonIcon={IconPlus}
        action="create"
        items={[
          {
            id: 'category',
            label: 'カテゴリ作成',
            icon: <IconFolderPlus size={16} />,
            onClick: handleOpenCreateCategory,
          },
          {
            id: 'group',
            label: 'グループ作成',
            icon: <IconTags size={16} />,
            onClick: () => handleOpenCreateGroup(),
          },
          {
            id: 'tag',
            label: 'タグ作成',
            icon: <IconTag size={16} />,
            onClick: () => handleOpenCreateTag(),
          }
        ]}
      />
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnyMutationPending, sortedCategories.length]);

  return (
    <Container size="lg">
      <Stack gap="xl">
        <Group justify="space-between" align="center" wrap="wrap">
          <Switch
            label="非アクティブを含める"
            checked={filters.includeInactive}
            onChange={(event) => {
              const checked = event.currentTarget?.checked ?? false;
              setFilters((prev) => ({ ...prev, includeInactive: checked }));
            }}
          />
          {isFetching && <Loader size="sm" />}
        </Group>

        <Tabs value={activeTab} onChange={handleTabChange} keepMounted={false}>
          <Tabs.List style={{ overflowX: 'auto', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            <Tabs.Tab value="categories" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>カテゴリ</Tabs.Tab>
            <Tabs.Tab value="tags" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>タグ一覧</Tabs.Tab>
            <Tabs.Tab value="automation" leftSection={<IconRobot size={16} />} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              自動化ルール
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="categories" pt="lg">
            <CategoriesTab
              isLoading={isLoading}
              sortedCategories={sortedCategories}
              isAnyMutationPending={isAnyMutationPending}
              reorderCategoriesPending={reorderCategoriesMutation.isPending}
              deleteCategoryPending={deleteCategory.isPending}
              deleteGroupPending={deleteGroup.isPending}
              deleteTagPending={deleteTag.isPending}
              reorderGroupsPending={reorderGroupsMutation.isPending}
              reorderTagsPending={reorderTagsMutation.isPending}
              onCategoryDragEnd={handleCategoryDragEnd}
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
          </Tabs.Panel>

          <Tabs.Panel value="tags" pt="lg">
            <TagsListTab
              isLoading={isLoading}
              flatTags={flatTags}
              isAnyMutationPending={isAnyMutationPending}
              deleteTagPending={deleteTag.isPending}
              onEditTag={handleEditTag}
              onDeleteTag={handleDeleteTag}
            />
          </Tabs.Panel>

          <Tabs.Panel value="automation" pt="lg">
            <AutomationTab
              isLoading={isLoadingAutomationRules}
              automationRules={automationRules}
              isAnyMutationPending={isAnyMutationPending}
              createAutomationRulePending={createAutomationRule.isPending}
              updateAutomationRulePending={updateAutomationRule.isPending}
              deleteAutomationRulePending={deleteAutomationRule.isPending}
              onOpenCreateRule={handleOpenCreateAutomationRule}
              onEditRule={handleEditAutomationRule}
              onDeleteRule={handleDeleteAutomationRule}
              onOpenExecuteRule={handleOpenExecuteRule}
            />
          </Tabs.Panel>
        </Tabs>

        {/* モーダル群 */}
        <CategoryModal
          opened={categoryModalOpened}
          onClose={() => {
            closeCategoryModal();
            setEditingCategory(null);
          }}
          form={categoryForm}
          onSubmit={handleSubmitCategory}
          isEditing={!!editingCategory}
          isSubmitting={isCategorySubmitting}
          categoryScopeOptions={CATEGORY_SCOPE_OPTIONS}
          setAsCategoryDefaultBgColor={setAsCategoryDefaultBgColor}
          onSetAsCategoryDefaultBgColorChange={setSetAsCategoryDefaultBgColor}
          setAsCategoryDefaultTextColor={setAsCategoryDefaultTextColor}
          onSetAsCategoryDefaultTextColorChange={setSetAsCategoryDefaultTextColor}
        />

        <GroupModal
          opened={groupModalOpened}
          onClose={() => {
            closeGroupModal();
            setEditingGroup(null);
          }}
          form={groupForm}
          onSubmit={handleSubmitGroup}
          isEditing={!!editingGroup}
          isSubmitting={isGroupSubmitting}
          categoryOptions={categoryOptions}
          setAsGroupDefaultBgColor={setAsGroupDefaultBgColor}
          onSetAsGroupDefaultBgColorChange={setSetAsGroupDefaultBgColor}
          setAsGroupDefaultTextColor={setAsGroupDefaultTextColor}
          onSetAsGroupDefaultTextColorChange={setSetAsGroupDefaultTextColor}
          inheritGroupColorFromCategory={inheritGroupColorFromCategory}
          onInheritGroupColorFromCategoryChange={handleInheritGroupColorFromCategoryChange}
        />

        <TagModal
          opened={tagModalOpened}
          onClose={() => {
            closeTagModal();
            setEditingTag(null);
          }}
          form={tagForm}
          onSubmit={handleSubmitTag}
          isEditing={!!editingTag}
          isSubmitting={isTagSubmitting}
          categoryOptions={categoryOptions}
          tagGroupOptions={tagGroupOptions}
          setAsTagDefaultBgColor={setAsTagDefaultBgColor}
          onSetAsTagDefaultBgColorChange={setSetAsTagDefaultBgColor}
          setAsTagDefaultTextColor={setAsTagDefaultTextColor}
          onSetAsTagDefaultTextColorChange={setSetAsTagDefaultTextColor}
          inheritTagColorFromGroup={inheritTagColorFromGroup}
          onInheritTagColorFromGroupChange={handleInheritTagColorFromGroupChange}
        />

        <AutomationRuleModal
          opened={automationRuleModalOpened}
          onClose={() => {
            closeAutomationRuleModal();
            setEditingAutomationRule(null);
            automationRuleForm.reset();
          }}
          form={automationRuleForm}
          onSubmit={handleSubmitAutomationRule}
          isEditing={!!editingAutomationRule}
          isSubmitting={createAutomationRule.isPending || updateAutomationRule.isPending}
          automationTagOptions={automationTagOptions}
          pageActionOptions={pageActionOptions}
        />

        <ExecuteRuleModal
          opened={executeRuleModalOpened}
          onClose={() => {
            closeExecuteRuleModal();
            setExecutingRule(null);
          }}
          rule={executingRule}
          isExecuting={executeAutomationRule.isPending}
          onExecute={handleExecuteRule}
        />

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
