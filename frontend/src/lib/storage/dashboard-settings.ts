import { DashboardCardConfig } from '@/components/dashboard/DashboardCardSettings';

const STORAGE_KEY = 'dashboard_card_settings';
const DISPLAY_MODE_STORAGE_KEY = 'home_display_mode';

export interface DashboardSettings {
  cards: {
    id: string;
    visible: boolean;
    order: number;
  }[];
  version: number;
}

/**
 * ダッシュボード設定をLocalStorageから読み込む
 */
export function loadDashboardSettings(): DashboardSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const settings = JSON.parse(stored) as DashboardSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load dashboard settings:', error);
    return null;
  }
}

/**
 * ダッシュボード設定をLocalStorageに保存
 */
export function saveDashboardSettings(cards: DashboardCardConfig[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const settings: DashboardSettings = {
      cards: cards.map((card) => ({
        id: card.id,
        visible: card.visible,
        order: card.order,
      })),
      version: 1,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save dashboard settings:', error);
  }
}

/**
 * 保存された設定をカードリストに適用
 */
export function applyDashboardSettings(
  defaultCards: DashboardCardConfig[],
  settings: DashboardSettings | null
): DashboardCardConfig[] {
  if (!settings) {
    // 設定がない場合はデフォルトを返す
    return defaultCards.map((card, index) => ({
      ...card,
      visible: true,
      order: index,
    }));
  }
  
  // 設定を適用
  const cardsMap = new Map(defaultCards.map((card) => [card.id, card]));
  
  // 設定に基づいてカードを再構築
  const result: DashboardCardConfig[] = [];
  
  // 保存されている順序でカードを追加
  for (const savedCard of settings.cards) {
    const defaultCard = cardsMap.get(savedCard.id);
    if (defaultCard) {
      result.push({
        ...defaultCard,
        visible: savedCard.visible,
        order: savedCard.order,
      });
      cardsMap.delete(savedCard.id);
    }
  }
  
  // 新しく追加されたカード（設定にないカード）を末尾に追加
  for (const [, card] of cardsMap) {
    result.push({
      ...card,
      visible: true,
      order: result.length,
    });
  }
  
  // 順序でソート
  return result.sort((a, b) => a.order - b.order);
}

/**
 * ダッシュボード設定をリセット（削除）
 */
export function resetDashboardSettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset dashboard settings:', error);
  }
}

// ============================================
// ホーム画面表示モード設定
// ============================================

/** ホーム画面の表示モード */
export type HomeDisplayMode = 'auto' | 'card' | 'dial';

/** 表示モードのラベル（日本語） */
export const HOME_DISPLAY_MODE_LABELS: Record<HomeDisplayMode, string> = {
  auto: '自動切り替え',
  card: 'カード表示',
  dial: 'ダイアル表示',
};

/**
 * ホーム画面の表示モードをLocalStorageから読み込む
 */
export function loadHomeDisplayMode(): HomeDisplayMode {
  if (typeof window === 'undefined') return 'auto';
  
  try {
    const stored = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    if (!stored) return 'auto';
    
    if (stored === 'auto' || stored === 'card' || stored === 'dial') {
      return stored;
    }
    return 'auto';
  } catch (error) {
    console.error('Failed to load home display mode:', error);
    return 'auto';
  }
}

/**
 * ホーム画面の表示モードをLocalStorageに保存
 */
export function saveHomeDisplayMode(mode: HomeDisplayMode): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
  } catch (error) {
    console.error('Failed to save home display mode:', error);
  }
}

// ============================================
// ダイアルメニュー設定（モバイル用）
// ============================================

const DIAL_STORAGE_KEY = 'dial_menu_settings';
const DIAL_SIZE_STORAGE_KEY = 'dial_size_preset';

/** ダイアルサイズプリセットの種類 */
export type DialSizePreset = 'small' | 'medium' | 'large';

/** サイズプリセットの定義 */
export interface DialSizeConfig {
  dialSize: number;        // ダイアル全体のサイズ
  centerSize: number;      // 中央の穴のサイズ
  iconButtonSize: number;  // アイコンボタンサイズ
  iconOrbitRadius: number; // アイコン配置の円軌道半径
  subRadius: number;       // サブアクション配置半径
  iconSize: number;        // アイコン自体のサイズ
}

/** サイズプリセットのマップ */
export const DIAL_SIZE_PRESETS: Record<DialSizePreset, DialSizeConfig> = {
  small: {
    dialSize: 220,
    centerSize: 64,
    iconButtonSize: 40,
    iconOrbitRadius: 68,
    subRadius: 98,
    iconSize: 24,
  },
  medium: {
    dialSize: 260,
    centerSize: 76,
    iconButtonSize: 48,
    iconOrbitRadius: 80,
    subRadius: 115,
    iconSize: 28,
  },
  large: {
    dialSize: 320,
    centerSize: 92,
    iconButtonSize: 58,
    iconOrbitRadius: 100,
    subRadius: 140,
    iconSize: 34,
  },
};

/** プリセットのラベル（日本語） */
export const DIAL_SIZE_PRESET_LABELS: Record<DialSizePreset, string> = {
  small: '小',
  medium: '中',
  large: '大',
};

/**
 * ダイアルサイズプリセットをLocalStorageから読み込む
 */
export function loadDialSizePreset(): DialSizePreset {
  if (typeof window === 'undefined') return 'medium';
  
  try {
    const stored = localStorage.getItem(DIAL_SIZE_STORAGE_KEY);
    if (!stored) return 'medium';
    
    if (stored === 'small' || stored === 'medium' || stored === 'large') {
      return stored;
    }
    return 'medium';
  } catch (error) {
    console.error('Failed to load dial size preset:', error);
    return 'medium';
  }
}

/**
 * ダイアルサイズプリセットをLocalStorageに保存
 */
export function saveDialSizePreset(preset: DialSizePreset): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(DIAL_SIZE_STORAGE_KEY, preset);
  } catch (error) {
    console.error('Failed to save dial size preset:', error);
  }
}

/**
 * プリセットからサイズ設定を取得
 */
export function getDialSizeConfig(preset: DialSizePreset): DialSizeConfig {
  return DIAL_SIZE_PRESETS[preset];
}

export interface DialMenuSettings {
  items: {
    id: string;
    visible: boolean;
    order: number;
  }[];
  version: number;
}

/**
 * ダイアルメニュー設定をLocalStorageから読み込む
 */
export function loadDialMenuSettings(): DialMenuSettings | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(DIAL_STORAGE_KEY);
    if (!stored) return null;
    
    const settings = JSON.parse(stored) as DialMenuSettings;
    return settings;
  } catch (error) {
    console.error('Failed to load dial menu settings:', error);
    return null;
  }
}

/**
 * ダイアルメニュー設定をLocalStorageに保存
 */
export function saveDialMenuSettings(items: { id: string; visible: boolean; order: number }[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    const settings: DialMenuSettings = {
      items: items.map((item) => ({
        id: item.id,
        visible: item.visible,
        order: item.order,
      })),
      version: 1,
    };
    
    localStorage.setItem(DIAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save dial menu settings:', error);
  }
}

/**
 * 保存された設定をダイアルメニュー項目に適用
 */
export function applyDialMenuSettings<T extends { id: string; visible?: boolean; order?: number }>(
  defaultItems: T[],
  settings: DialMenuSettings | null
): (T & { visible: boolean; order: number })[] {
  if (!settings) {
    // 設定がない場合はデフォルト（最初の8項目のみ表示）を返す
    return defaultItems.map((item, index) => ({
      ...item,
      visible: index < 8,
      order: index,
    }));
  }
  
  // 設定を適用
  const itemsMap = new Map(defaultItems.map((item) => [item.id, item]));
  
  // 設定に基づいてアイテムを再構築
  const result: (T & { visible: boolean; order: number })[] = [];
  
  // 保存されている順序でアイテムを追加
  for (const savedItem of settings.items) {
    const defaultItem = itemsMap.get(savedItem.id);
    if (defaultItem) {
      result.push({
        ...defaultItem,
        visible: savedItem.visible,
        order: savedItem.order,
      });
      itemsMap.delete(savedItem.id);
    }
  }
  
  // 新しく追加されたアイテム（設定にないアイテム）を末尾に追加（デフォルト非表示）
  for (const [, item] of itemsMap) {
    result.push({
      ...item,
      visible: false,
      order: result.length,
    });
  }
  
  // 順序でソート
  return result.sort((a, b) => a.order - b.order);
}
