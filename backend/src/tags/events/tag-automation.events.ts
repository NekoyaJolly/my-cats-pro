import { TagAutomationEventType } from "@prisma/client";

/**
 * 基底イベントペイロード
 */
export interface BaseAutomationEvent {
  eventType: TagAutomationEventType;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 交配予定イベント
 */
export interface BreedingPlannedEvent extends BaseAutomationEvent {
  eventType: 'BREEDING_PLANNED';
  breedingId: string;
  maleId: string;
  femaleId: string;
  plannedDate: Date;
}

/**
 * 交配確認イベント
 */
export interface BreedingConfirmedEvent extends BaseAutomationEvent {
  eventType: 'BREEDING_CONFIRMED';
  breedingId: string;
  maleId: string;
  femaleId: string;
  confirmedDate: Date;
}

/**
 * 妊娠確認イベント
 */
export interface PregnancyConfirmedEvent extends BaseAutomationEvent {
  eventType: 'PREGNANCY_CONFIRMED';
  pregnancyCheckId: string;
  femaleId: string;
  maleId?: string;
  confirmedDate: Date;
}

/**
 * 子猫登録イベント
 */
export interface KittenRegisteredEvent extends BaseAutomationEvent {
  eventType: 'KITTEN_REGISTERED';
  kittenId: string;
  motherId?: string;
  fatherId?: string;
  birthDate?: Date;
}

/**
 * 年齢閾値イベント
 */
export interface AgeThresholdEvent extends BaseAutomationEvent {
  eventType: 'AGE_THRESHOLD';
  catId: string;
  ageInMonths: number;
  thresholdMonths: number;
  /** 閾値に一致したルールID。指定時はそのルールのみ実行される */
  ruleId?: string;
}

/**
 * ページ・アクション駆動イベント
 * 任意のページで任意のアクションが発生した際のイベント
 */
export interface PageActionEvent extends BaseAutomationEvent {
  eventType: 'PAGE_ACTION';
  page: string; // 'cats', 'breeding', 'health', 'care', 'pedigree' など
  action: string; // 'create', 'update', 'delete', 'status_change' など
  targetId: string; // 対象のリソースID（猫ID、交配記録IDなど）
  targetType?: string; // 'cat', 'breeding', 'health_record' など
  additionalData?: Record<string, unknown>; // アクション固有の追加データ
}

/**
 * タグ付与・剥奪イベント
 * 手動操作でタグが付与/剥奪された際に発火する
 * （自動化による付与では無限ループ防止のため発火しない）
 */
export interface TagAssignedEvent extends BaseAutomationEvent {
  eventType: 'TAG_ASSIGNED';
  catId: string;
  tagId: string;
  action: 'ASSIGNED' | 'UNASSIGNED';
}

/**
 * カスタムイベント
 */
export interface CustomEvent extends BaseAutomationEvent {
  eventType: 'CUSTOM';
  customEventType: string;
  targetId: string;
  data: Record<string, unknown>;
}

/**
 * 全イベント型の統合
 */
export type TagAutomationEvent =
  | BreedingPlannedEvent
  | BreedingConfirmedEvent
  | PregnancyConfirmedEvent
  | KittenRegisteredEvent
  | AgeThresholdEvent
  | PageActionEvent
  | TagAssignedEvent
  | CustomEvent;

/**
 * イベント名の定数
 */
export const TAG_AUTOMATION_EVENTS = {
  BREEDING_PLANNED: 'tag.automation.breeding.planned',
  BREEDING_CONFIRMED: 'tag.automation.breeding.confirmed',
  PREGNANCY_CONFIRMED: 'tag.automation.pregnancy.confirmed',
  KITTEN_REGISTERED: 'tag.automation.kitten.registered',
  AGE_THRESHOLD: 'tag.automation.age.threshold',
  PAGE_ACTION: 'tag.automation.page.action',
  TAG_ASSIGNED: 'tag.automation.tag.assigned',
  CUSTOM: 'tag.automation.custom',
} as const;
