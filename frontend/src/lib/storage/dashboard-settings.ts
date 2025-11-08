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
  const settingsMap = new Map(settings.cards.map((s) => [s.id, s]));
  
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
