import { DashboardCardConfig } from '@/components/dashboard/DashboardCardSettings';

const STORAGE_KEY = 'dashboard_card_settings';

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
// ダイアルメニュー設定（モバイル用）
// ============================================

const DIAL_STORAGE_KEY = 'dial_menu_settings';

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
