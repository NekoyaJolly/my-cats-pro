'use client';

import { useEffect, useState } from 'react';
import type { Icon } from '@tabler/icons-react';

const STORAGE_KEY = 'footer-nav-settings';

export interface FooterNavItem {
  id: string;
  label: string;
  href: string;
  icon: Icon;
  visible: boolean;
}

/**
 * フッターナビゲーション設定を管理するカスタムフック
 * localStorageにユーザーの設定を保存
 */
export function useFooterNavSettings(defaultItems: Omit<FooterNavItem, 'visible'>[]) {
  const [items, setItems] = useState<FooterNavItem[]>(() => {
    // 初期状態は全て表示
    return defaultItems.map(item => ({ ...item, visible: true }));
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // localStorageから設定を読み込む（初回のみ）
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedSettings = JSON.parse(stored) as Record<string, boolean>;
        setItems(defaultItems.map(item => ({
          ...item,
          visible: savedSettings[item.id] ?? true,
        })));
      }
    } catch (error) {
      console.error('Failed to load footer nav settings:', error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // 設定を保存
  const saveSettings = () => {
    try {
      const settings = items.reduce((acc, item) => {
        acc[item.id] = item.visible;
        return acc;
      }, {} as Record<string, boolean>);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setHasChanges(false);
      // 保存完了を通知
      return true;
    } catch (error) {
      console.error('Failed to save footer nav settings:', error);
      return false;
    }
  };

  // 項目の表示/非表示を切り替え
  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, visible: !item.visible } : item
    ));
    setHasChanges(true);
  };

  // 全て表示
  const showAll = () => {
    setItems(prev => prev.map(item => ({ ...item, visible: true })));
    setHasChanges(true);
  };

  // 全て非表示
  const hideAll = () => {
    setItems(prev => prev.map(item => ({ ...item, visible: false })));
    setHasChanges(true);
  };

  // デフォルトに戻す
  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems(defaultItems.map(item => ({ ...item, visible: true })));
    setHasChanges(false);
  };

  return {
    items,
    isLoading,
    hasChanges,
    toggleItem,
    showAll,
    hideAll,
    resetToDefault,
    saveSettings,
    visibleItems: items.filter(item => item.visible),
  };
}
