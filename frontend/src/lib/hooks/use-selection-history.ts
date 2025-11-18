'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useCallback } from 'react';
import type { MasterOption } from '@/lib/master-data/master-options';

const HISTORY_LIMIT = 10;

export type SelectionHistoryDomain = 'breed' | 'coat-color';

interface StoredHistoryItem extends MasterOption {
  updatedAt: number;
}

export function useSelectionHistory(domain: SelectionHistoryDomain) {
  const storageKey = `master-selection-history:${domain}`;
  const [history, setHistory] = useLocalStorage<StoredHistoryItem[]>({
    key: storageKey,
    defaultValue: [],
    getInitialValueInEffect: true,
  });

  const recordSelection = useCallback((item: MasterOption | undefined) => {
    if (!item) {
      return;
    }

    setHistory((prev) => {
      const filtered = prev.filter((entry) => entry.value !== item.value);
      const next: StoredHistoryItem[] = [
        {
          value: item.value,
          label: item.label,
          code: item.code,
          updatedAt: Date.now(),
        },
        ...filtered,
      ];
      return next.slice(0, HISTORY_LIMIT);
    });
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history,
    recordSelection,
    clearHistory,
  };
}
