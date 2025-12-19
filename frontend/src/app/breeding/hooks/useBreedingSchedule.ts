/**
 * 交配スケジュール状態管理フック
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { BreedingScheduleEntry } from '../types';
import { STORAGE_KEYS } from '../types';

export interface UseBreedingScheduleReturn {
  // 状態
  breedingSchedule: Record<string, BreedingScheduleEntry>;
  matingChecks: Record<string, number>;
  activeMales: Cat[];
  selectedYear: number;
  selectedMonth: number;
  defaultDuration: number;
  
  // アクション
  setBreedingSchedule: React.Dispatch<React.SetStateAction<Record<string, BreedingScheduleEntry>>>;
  setMatingChecks: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setActiveMales: React.Dispatch<React.SetStateAction<Cat[]>>;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  setDefaultDuration: React.Dispatch<React.SetStateAction<number>>;
  
  // ヘルパー関数
  addMale: (male: Cat) => void;
  removeMale: (maleId: string) => void;
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
  addMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  clearScheduleData: () => void;
}

export function useBreedingSchedule(): UseBreedingScheduleReturn {
  // hydration guard: 初回マウント時に localStorage から読み込むまで保存を抑制
  const hydratedRef = useRef(false);
  const mountCountRef = useRef(0);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [breedingSchedule, setBreedingSchedule] = useState<Record<string, BreedingScheduleEntry>>({});
  const [activeMales, setActiveMales] = useState<Cat[]>([]);
  const [defaultDuration, setDefaultDuration] = useState<number>(1);
  const [matingChecks, setMatingChecks] = useState<Record<string, number>>({});

  // localStorageからデータを読み込む
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedActiveMales = localStorage.getItem(STORAGE_KEYS.ACTIVE_MALES);
        if (storedActiveMales) {
          const parsed = JSON.parse(storedActiveMales) as Cat[];
          setActiveMales(parsed);
        }

        const storedDefaultDuration = localStorage.getItem(STORAGE_KEYS.DEFAULT_DURATION);
        if (storedDefaultDuration) {
          const parsed = parseInt(storedDefaultDuration, 10);
          setDefaultDuration(parsed);
        }

        const storedYear = localStorage.getItem(STORAGE_KEYS.SELECTED_YEAR);
        if (storedYear) {
          const parsed = parseInt(storedYear, 10);
          setSelectedYear(parsed);
        }

        const storedMonth = localStorage.getItem(STORAGE_KEYS.SELECTED_MONTH);
        if (storedMonth) {
          const parsed = parseInt(storedMonth, 10);
          setSelectedMonth(parsed);
        }

        const storedBreedingSchedule = localStorage.getItem(STORAGE_KEYS.BREEDING_SCHEDULE);
        if (storedBreedingSchedule) {
          const parsed = JSON.parse(storedBreedingSchedule) as Record<string, BreedingScheduleEntry>;
          setBreedingSchedule(parsed);
        }

        const storedMatingChecks = localStorage.getItem(STORAGE_KEYS.MATING_CHECKS);
        if (storedMatingChecks) {
          const parsed = JSON.parse(storedMatingChecks) as Record<string, number>;
          setMatingChecks(parsed);
        }
      } catch (error) {
        console.warn('Failed to load breeding data from localStorage:', error);
      }
    };

    loadFromStorage();
    
    // setTimeoutでhydratedRefをtrueにする
    setTimeout(() => {
      hydratedRef.current = true;
    }, 0);
  }, []);

  // コンポーネントのマウント/アンマウントを追跡
  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      hydratedRef.current = false;
    };
  }, []);

  // localStorageにデータを保存する
  useEffect(() => {
    const saveToStorage = () => {
      if (!hydratedRef.current) return;

      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MALES, JSON.stringify(activeMales));
        localStorage.setItem(STORAGE_KEYS.DEFAULT_DURATION, defaultDuration.toString());
        localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, selectedYear.toString());
        localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, selectedMonth.toString());
        if (Object.keys(breedingSchedule).length > 0) {
          localStorage.setItem(STORAGE_KEYS.BREEDING_SCHEDULE, JSON.stringify(breedingSchedule));
        }
        localStorage.setItem(STORAGE_KEYS.MATING_CHECKS, JSON.stringify(matingChecks));
      } catch (error) {
        console.warn('Failed to save breeding data to localStorage:', error);
      }
    };

    saveToStorage();
  }, [activeMales, defaultDuration, selectedYear, selectedMonth, breedingSchedule, matingChecks]);

  // オス猫追加
  const addMale = useCallback((male: Cat) => {
    setActiveMales((prev) => [...prev, male]);
  }, []);

  // オス猫削除
  const removeMale = useCallback((maleId: string) => {
    setActiveMales((prev) => prev.filter((m) => m.id !== maleId));
  }, []);

  // 交配チェック回数を取得
  const getMatingCheckCount = useCallback((maleId: string, femaleId: string, date: string): number => {
    const key = `${maleId}-${femaleId}-${date}`;
    return matingChecks[key] || 0;
  }, [matingChecks]);

  // 交配チェックを追加
  const addMatingCheck = useCallback((maleId: string, femaleId: string, date: string) => {
    const key = `${maleId}-${femaleId}-${date}`;
    setMatingChecks((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  }, []);

  // スケジュールデータをクリア
  const clearScheduleData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.BREEDING_SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.MATING_CHECKS);
    setBreedingSchedule({});
    setMatingChecks({});
  }, []);

  return {
    breedingSchedule,
    matingChecks,
    activeMales,
    selectedYear,
    selectedMonth,
    defaultDuration,
    setBreedingSchedule,
    setMatingChecks,
    setActiveMales,
    setSelectedYear,
    setSelectedMonth,
    setDefaultDuration,
    addMale,
    removeMale,
    getMatingCheckCount,
    addMatingCheck,
    clearScheduleData,
  };
}

