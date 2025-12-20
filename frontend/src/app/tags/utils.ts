/**
 * タグ管理ページで使用するユーティリティ関数
 */

import type {
  TagCategoryView,
  TagGroupView,
  TagView,
  CreateTagCategoryRequest,
  CreateTagRequest,
} from '@/lib/api/hooks/use-tags';
import type { AutomationMeta, CategoryFormValues, TagFormValues } from './types';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_TEXT_COLOR,
  DEFAULT_TAG_COLOR,
  DEFAULT_TAG_TEXT_COLOR,
} from './constants';

/**
 * カテゴリを表示順でソート
 */
export function sortCategories(categories: TagCategoryView[]): TagCategoryView[] {
  return [...categories].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

/**
 * グループを表示順でソート
 */
export function sortGroups(groups?: TagGroupView[] | null): TagGroupView[] {
  return [...(groups ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

/**
 * タグを表示順でソート
 */
export function sortTags(tags?: TagView[] | null): TagView[] {
  return [...(tags ?? [])].sort((a, b) => {
    const orderA = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA === orderB) {
      return a.name.localeCompare(b.name, 'ja');
    }
    return orderA - orderB;
  });
}

/**
 * タグから自動化メタデータを抽出
 */
export function extractAutomationMeta(tag: TagView): AutomationMeta | null {
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

/**
 * カテゴリフォームの値からAPIリクエストペイロードを構築
 */
export function buildCategoryPayload(values: CategoryFormValues): CreateTagCategoryRequest & {
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

/**
 * タグフォームの値からAPIリクエストペイロードを構築
 */
export function buildTagPayload(values: TagFormValues): CreateTagRequest & {
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








