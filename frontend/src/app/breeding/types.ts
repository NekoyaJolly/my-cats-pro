/**
 * 交配管理ページで使用する型定義
 */

import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BreedingNgRuleType } from '@/lib/api/hooks/use-breeding';

/**
 * 交配スケジュールエントリ
 */
export interface BreedingScheduleEntry {
  maleId: string;
  maleName: string;
  femaleId: string;
  femaleName: string;
  date: string;
  duration: number;
  dayIndex: number;
  isHistory: boolean;
  result?: string;
}

/**
 * NGペアリングルール
 */
export interface NgPairingRule {
  id: string;
  name: string;
  type: BreedingNgRuleType;
  maleConditions?: string[];
  femaleConditions?: string[];
  maleNames?: string[];
  femaleNames?: string[];
  generationLimit?: number | null;
  description?: string | null;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 新規ルール作成用の状態
 */
export interface NewRuleState {
  name: string;
  type: BreedingNgRuleType;
  maleConditions: string[];
  femaleConditions: string[];
  maleNames: string[];
  femaleNames: string[];
  generationLimit: number | null;
  description: string;
}

/**
 * 月のカレンダー日付
 */
export interface MonthDate {
  date: number;
  dateString: string;
  dayOfWeek: number;
}

/**
 * localStorageキー
 */
export const STORAGE_KEYS = {
  ACTIVE_MALES: 'breeding_active_males',
  DEFAULT_DURATION: 'breeding_default_duration',
  SELECTED_YEAR: 'breeding_selected_year',
  SELECTED_MONTH: 'breeding_selected_month',
  BREEDING_SCHEDULE: 'breeding_schedule',
  MATING_CHECKS: 'breeding_mating_checks',
} as const;

/**
 * 子育て中の母猫情報
 */
export interface MotherWithKittens {
  mother: Cat;
  kittens: Cat[];
}


