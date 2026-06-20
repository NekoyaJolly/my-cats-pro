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
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number>>;
  setDefaultDuration: React.Dispatch<React.SetStateAction<number>>;
  
  // ヘルパー関数
  addMale: (male: Cat) => void;
  removeMale: (maleId: string) => Promise<void>;
  getMatingCheckCount: (maleId: string, femaleId: string, date: string) => number;
  addMatingCheck: (maleId: string, femaleId: string, date: string) => void;
  clearScheduleData: () => void;
  
  // API 同期関数
  createScheduleOnServer: (entry: BreedingScheduleEntry, options?: { force?: boolean }) => Promise<void>;
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
    // 猫削除後（maleId=null）はサーバーIDをキーに使い、削除済み同士の衝突を防ぐ
    const scheduleKey = `${schedule.maleId ?? `deleted-${schedule.id}`}-${dateStr}`;
    
    result[scheduleKey] = {
      maleId: schedule.maleId ?? '',
      // 猫が削除済みの場合はスナップショット名（テキスト）で表示する
      maleName: schedule.male?.name ?? schedule.maleName ?? '',
      femaleId: schedule.femaleId ?? '',
      femaleName: schedule.female?.name ?? schedule.femaleName ?? '',
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
      const key = `${schedule.maleId ?? ''}-${schedule.femaleId ?? ''}-${checkDate}`;
      result[key] = (result[key] || 0) + check.count;
    }
  }
  
  return result;
}

export function useBreedingSchedule(allCats: Cat[] = []): UseBreedingScheduleReturn {
  // hydration guard: 初回マウント時に localStorage から読み込むまで保存を抑制
  const hydratedRef = useRef(false);
  const mountCountRef = useRef(0);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [breedingSchedule, setBreedingSchedule] = useState<Record<string, BreedingScheduleEntry>>({});
  // ローカルで追加したオス（まだサーバーにペアが無い単独オスの作業用リスト）
  const [localActiveMales, setLocalActiveMales] = useState<Cat[]>([]);
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
          setLocalActiveMales(parsed);
        }

        const storedDefaultDuration = localStorage.getItem(STORAGE_KEYS.DEFAULT_DURATION);
        if (storedDefaultDuration) {
          const parsed = parseInt(storedDefaultDuration, 10);
          setDefaultDuration(parsed);
        }

        // 年月は localStorage から復元しない。
        // 交配管理ページを開くたびに、常に現在の年月（useState の初期値）を表示する。

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
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MALES, JSON.stringify(localActiveMales));
        localStorage.setItem(STORAGE_KEYS.DEFAULT_DURATION, defaultDuration.toString());
        // 年月は永続化しない（開くたび現在の年月を表示するため）
        if (Object.keys(breedingSchedule).length > 0) {
          localStorage.setItem(STORAGE_KEYS.BREEDING_SCHEDULE, JSON.stringify(breedingSchedule));
        }
        localStorage.setItem(STORAGE_KEYS.MATING_CHECKS, JSON.stringify(matingChecks));
      } catch (error) {
        console.warn('Failed to save breeding data to localStorage:', error);
      }
    };

    saveToStorage();
    // selectedYear/selectedMonth は永続化しないため依存に含めない（年月切替時の不要な書き込みを防ぐ）
  }, [localActiveMales, defaultDuration, breedingSchedule, matingChecks]);

  // 表示用 activeMales を導出する。
  // サーバーのスケジュールに登場するオスを createdAt 昇順（= ペア成立の瞬間、全デバイスで同一順序）に並べ、
  // まだサーバーに無いローカル追加分（メス未投入の単独オス）を末尾に付ける。
  const activeMales = useMemo<Cat[]>(() => {
    const ordered: Cat[] = [];
    const seen = new Set<string>();
    // 猫数が多い（limit:1000）ケースでも O(1) で解決できるよう Map 化する
    const catById = new Map(allCats.map((c) => [c.id, c] as const));

    const serverSchedules = schedulesQuery.data?.data ?? [];
    const sorted = [...serverSchedules].sort((a, b) => {
      const byCreatedAt = (a.createdAt ?? '').localeCompare(b.createdAt ?? '');
      return byCreatedAt !== 0 ? byCreatedAt : a.id.localeCompare(b.id);
    });
    for (const schedule of sorted) {
      const maleId = schedule.maleId;
      if (!maleId || seen.has(maleId)) continue;
      const cat = catById.get(maleId);
      if (cat) {
        seen.add(maleId);
        ordered.push(cat);
      }
    }

    for (const male of localActiveMales) {
      if (!seen.has(male.id)) {
        seen.add(male.id);
        ordered.push(male);
      }
    }

    return ordered;
  }, [schedulesQuery.data, allCats, localActiveMales]);

  // オス猫追加（ローカル作業リストに追加。メスを入れた時点でサーバー保存→全デバイス同期）
  const addMale = useCallback((male: Cat) => {
    setLocalActiveMales((prev) => (prev.some((m) => m.id === male.id) ? prev : [...prev, male]));
  }, []);

  // オス猫削除（ローカル＋ひも付くサーバーのスケジュールも削除して全デバイスから消す）
  const removeMale = useCallback(async (maleId: string) => {
    // ひも付くサーバーのスケジュールを先に削除する。
    // 失敗は握りつぶさず呼び出し側へ伝播させ、その場合ローカル状態は更新しない（同期不整合を防ぐ）。
    const serverIds = (schedulesQuery.data?.data ?? [])
      .filter((s) => s.maleId === maleId)
      .map((s) => s.id);
    await Promise.all(serverIds.map((id) => deleteScheduleMutation.mutateAsync(id)));

    // サーバー削除が成功した後にローカル状態を更新する
    setLocalActiveMales((prev) => prev.filter((m) => m.id !== maleId));

    // ローカルのカレンダーエントリ（当該オス分）も除去
    setBreedingSchedule((prev) => {
      const next: Record<string, BreedingScheduleEntry> = {};
      for (const [key, entry] of Object.entries(prev)) {
        if (entry.maleId !== maleId) {
          next[key] = entry;
        }
      }
      return next;
    });
  }, [schedulesQuery.data, deleteScheduleMutation]);

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
  const createScheduleOnServer = useCallback(async (entry: BreedingScheduleEntry, options?: { force?: boolean }) => {
    const payload: CreateBreedingScheduleRequest = {
      maleId: entry.maleId,
      femaleId: entry.femaleId,
      startDate: entry.date,
      duration: entry.duration,
      status: 'SCHEDULED',
      ...(options?.force ? { force: true } : {}),
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
