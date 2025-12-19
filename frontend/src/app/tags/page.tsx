'use client';

import { useEffect, useMemo, useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  Alert,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Menu,
  MultiSelect,
  Stack,
  Switch,
  Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  IconChevronDown,
  IconFolderPlus,
  IconInfoCircle,
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
  AUTOMATION_SCOPE_OPTIONS,
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

export default function TagsPage() {
  const { setPageHeader } = usePageHeader();

  // データ取得
  const {
    filters,
    setFilters,
    isLoading,
    isFetching,
    sortedCategories,
    availableScopes,
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

  // スコープドラフト
  const [scopeDraft, setScopeDraft] = useState('');

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

  // オプション生成
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

  const automationScopeOptions = useMemo(() => {
    const scopeMap = new Map<string, string>();
    AUTOMATION_SCOPE_OPTIONS.forEach(option => {
      scopeMap.set(option.value, option.label);
    });
    availableScopes.forEach(scope => {
      if (!scopeMap.has(scope)) {
        scopeMap.set(scope, scope);
      }
    });
    return Array.from(scopeMap.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja'));
  }, [availableScopes]);

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
    setScopeDraft('');
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
      if (config.kitten) {
        ageThreshold = { type: 'kitten', kitten: config.kitten, adult: {} };
      } else if (config.adult) {
        ageThreshold = { type: 'adult', kitten: {}, adult: config.adult };
      }
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

    if (values.eventType === 'AGE_THRESHOLD' && values.ageThreshold) {
      if (values.ageThreshold.type === 'kitten' && values.ageThreshold.kitten) {
        config.kitten = values.ageThreshold.kitten;
      } else if (values.ageThreshold.type === 'adult' && values.ageThreshold.adult) {
        config.adult = values.ageThreshold.adult;
      }
    }

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

  const handleDeleteAutomationRule = (id: string) => {
    deleteAutomationRule.mutate(id);
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
            setScopeDraft('');
          }}
          form={categoryForm}
          onSubmit={handleSubmitCategory}
          isEditing={!!editingCategory}
          isSubmitting={isCategorySubmitting}
          categoryScopeOptions={categoryScopeOptions}
          scopeDraft={scopeDraft}
          onScopeDraftChange={setScopeDraft}
          onScopeDraftSubmit={handleScopeDraftSubmit}
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
          automationScopeOptions={automationScopeOptions}
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
