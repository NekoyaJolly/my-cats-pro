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

// ルールタイプ（シンプル化されたUI用）
export type RuleType = 'PAGE_ACTION' | 'AGE_THRESHOLD' | 'TAG_ASSIGNED';

// アクションタイプ
export type ActionType = 'ASSIGN' | 'REMOVE';

// 自動化ルールフォームの値（シンプル化版）
export type AutomationRuleFormValues = {
  // UI用のルールタイプ
  ruleType: RuleType;
  // アクション（付与/削除）
  actionType: ActionType;
  // 対象タグ
  tagIds: string[];
  // ルール名（任意、未入力なら自動生成）
  name: string;
  // メモ
  description: string;
  // アクティブ状態
  isActive: boolean;
  // PAGE_ACTION設定
  pageAction: {
    page: string;
    action: string;
  };
  // 年齢閾値設定
  ageThreshold: {
    ageType: 'days' | 'months';
    threshold: number;
  };
  // TAG_ASSIGNED設定（特定タグ付与時の削除トリガー）
  triggerTagId: string;
  // 内部用（バックエンドとの互換性維持）
  key?: string;
  triggerType?: TagAutomationTriggerType;
  eventType?: TagAutomationEventType | '';
  scope?: string;
  priority?: number;
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
