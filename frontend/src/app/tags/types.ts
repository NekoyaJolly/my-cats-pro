/**
 * タグ管理ページで使用する型定義
 */

import type {
  TagAutomationTriggerType,
  TagAutomationEventType,
} from '@/lib/api/hooks/use-tag-automation';

// カテゴリフォームの値
export type CategoryFormValues = {
  key: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  scopes: string[];
  isActive: boolean;
};

// タグフォームの値
export type TagFormValues = {
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

// グループフォームの値
export type GroupFormValues = {
  categoryId: string;
  name: string;
  description: string;
  color: string;
  textColor: string;
  isActive: boolean;
};

// 自動化ルールフォームの値
export type AutomationRuleFormValues = {
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

// 自動化メタデータ
export type AutomationMeta = {
  ruleName?: string;
  reason?: string;
  source?: string;
  assignedAt?: string;
};

// フィルタ状態
export type TagFiltersState = {
  scopes: string[];
  includeInactive: boolean;
};




