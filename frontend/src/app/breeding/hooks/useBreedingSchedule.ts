/**
 * 交配スケジュール状態管理フック
 * 
 * localStorage によるローカルキャッシュと API 同期の両方をサポート。
 * - オンライン時: API からデータを取得し、localStorage にキャッシュ
 * - オフライン時: localStorage からデータを読み込み
 * - 新規作成/更新/削除: API 経由で実行し、成功時に localStorage を更新
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Cat } from '@/lib/api/hooks/use-cats';
import {
  useGetBreedingSchedules,
  useCreateBreedingSchedule,
  useUpdateBreedingSchedule,
  useDeleteBreedingSchedule,
  useCreateMatingCheck,
  type BreedingSchedule,
  type CreateBreedingScheduleRequest,
  type UpdateBreedingScheduleRequest,
  type CreateMatingCheckRequest,
} from '@/lib/api/hooks/use-breeding';
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
  
  // API 状態
  isLoading: boolean;
  isSyncing: boolean;
  
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
  
  // API 同期関数
  createScheduleOnServer: (entry: BreedingScheduleEntry) => Promise<void>;
  updateScheduleOnServer: (scheduleId: string, updates: UpdateBreedingScheduleRequest) => Promise<void>;
  deleteScheduleOnServer: (scheduleId: string) => Promise<void>;
  syncFromServer: () => Promise<void>;
}

/**
 * サーバーのスケジュールデータをローカル形式に変換
 */
function convertServerScheduleToLocal(
  schedule: BreedingSchedule
): Record<string, BreedingScheduleEntry> {
  const result: Record<string, BreedingScheduleEntry> = {};
  const startDate = new Date(schedule.startDate);
  
  for (let i = 0; i < schedule.duration; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    const scheduleKey = `${schedule.maleId}-${dateStr}`;
    
    result[scheduleKey] = {
      maleId: schedule.maleId,
      maleName: schedule.male?.name ?? '',
      femaleId: schedule.femaleId,
      femaleName: schedule.female?.name ?? '',
      date: dateStr,
      duration: schedule.duration,
      dayIndex: i,
      isHistory: schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED',
      result: schedule.status === 'COMPLETED' ? '成功' : schedule.status === 'CANCELLED' ? '失敗' : undefined,
      // サーバー側の ID を保持（更新/削除時に使用）
      serverId: schedule.id,
    };
  }
  
  return result;
}

/**
 * サーバーの交配チェックデータをローカル形式に変換
 */
function convertServerChecksToLocal(
  schedules: BreedingSchedule[]
): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const schedule of schedules) {
    if (!schedule.checks) continue;
    
    for (const check of schedule.checks) {
      const checkDate = new Date(check.checkDate).toISOString().split('T')[0];
      const key = `${schedule.maleId}-${schedule.femaleId}-${checkDate}`;
      result[key] = (result[key] || 0) + check.count;
    }
  }
  
  return result;
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
  const [isSyncing, setIsSyncing] = useState(false);

  // API フック
  const schedulesQuery = useGetBreedingSchedules({}, { enabled: true });
  const createScheduleMutation = useCreateBreedingSchedule();
  const updateScheduleMutation = useUpdateBreedingSchedule();
  const deleteScheduleMutation = useDeleteBreedingSchedule();
  const createMatingCheckMutation = useCreateMatingCheck();

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

        // スケジュールと交配チェックは API から取得するが、
        // オフライン時のフォールバックとして localStorage からも読み込む
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

  // API からデータを取得してローカル状態を更新
  useEffect(() => {
    if (!schedulesQuery.data?.data) return;
    
    const serverSchedules = schedulesQuery.data.data;
    
    // サーバーデータをローカル形式に変換
    let mergedSchedule: Record<string, BreedingScheduleEntry> = {};
    for (const schedule of serverSchedules) {
      const localEntries = convertServerScheduleToLocal(schedule);
      mergedSchedule = { ...mergedSchedule, ...localEntries };
    }
    
    // ローカルの serverId がないエントリ（まだサーバーに保存されていない）を保持
    setBreedingSchedule(prev => {
      const localOnlyEntries: Record<string, BreedingScheduleEntry> = {};
      for (const [key, entry] of Object.entries(prev)) {
        if (!entry.serverId) {
          localOnlyEntries[key] = entry;
        }
      }
      return { ...mergedSchedule, ...localOnlyEntries };
    });
    
    // 交配チェックも同期
    const serverChecks = convertServerChecksToLocal(serverSchedules);
    setMatingChecks(prev => ({ ...prev, ...serverChecks }));
    
  }, [schedulesQuery.data]);

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

  // 交配チェックを追加（ローカル + API）
  const addMatingCheck = useCallback((maleId: string, femaleId: string, date: string) => {
    const key = `${maleId}-${femaleId}-${date}`;
    
    // ローカル状態を即座に更新
    setMatingChecks((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
    
    // 対応するスケジュールの serverId を探す
    const scheduleKey = `${maleId}-${date}`;
    const scheduleEntry = breedingSchedule[scheduleKey];
    
    if (scheduleEntry?.serverId) {
      // サーバーに交配チェックを追加
      const payload: CreateMatingCheckRequest = {
        checkDate: date,
        count: 1,
      };
      
      createMatingCheckMutation.mutate({
        scheduleId: scheduleEntry.serverId,
        payload,
      });
    }
  }, [breedingSchedule, createMatingCheckMutation]);

  // スケジュールデータをクリア
  const clearScheduleData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.BREEDING_SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.MATING_CHECKS);
    setBreedingSchedule({});
    setMatingChecks({});
  }, []);

  // サーバーにスケジュールを作成
  const createScheduleOnServer = useCallback(async (entry: BreedingScheduleEntry) => {
    const payload: CreateBreedingScheduleRequest = {
      maleId: entry.maleId,
      femaleId: entry.femaleId,
      startDate: entry.date,
      duration: entry.duration,
      status: 'SCHEDULED',
    };
    
    try {
      setIsSyncing(true);
      await createScheduleMutation.mutateAsync(payload);
      // 成功時は schedulesQuery が自動的に再取得される
    } finally {
      setIsSyncing(false);
    }
  }, [createScheduleMutation]);

  // サーバーのスケジュールを更新
  const updateScheduleOnServer = useCallback(async (scheduleId: string, updates: UpdateBreedingScheduleRequest) => {
    try {
      setIsSyncing(true);
      await updateScheduleMutation.mutateAsync({ id: scheduleId, payload: updates });
    } finally {
      setIsSyncing(false);
    }
  }, [updateScheduleMutation]);

  // サーバーのスケジュールを削除
  const deleteScheduleOnServer = useCallback(async (scheduleId: string) => {
    try {
      setIsSyncing(true);
      await deleteScheduleMutation.mutateAsync(scheduleId);
    } finally {
      setIsSyncing(false);
    }
  }, [deleteScheduleMutation]);

  // サーバーからデータを再取得
  const syncFromServer = useCallback(async () => {
    try {
      setIsSyncing(true);
      await schedulesQuery.refetch();
    } finally {
      setIsSyncing(false);
    }
  }, [schedulesQuery]);

  // ローディング状態
  const isLoading = useMemo(() => {
    return schedulesQuery.isLoading || 
           createScheduleMutation.isPending || 
           updateScheduleMutation.isPending || 
           deleteScheduleMutation.isPending;
  }, [
    schedulesQuery.isLoading,
    createScheduleMutation.isPending,
    updateScheduleMutation.isPending,
    deleteScheduleMutation.isPending,
  ]);

  return {
    breedingSchedule,
    matingChecks,
    activeMales,
    selectedYear,
    selectedMonth,
    defaultDuration,
    isLoading,
    isSyncing,
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
    createScheduleOnServer,
    updateScheduleOnServer,
    deleteScheduleOnServer,
    syncFromServer,
  };
}
