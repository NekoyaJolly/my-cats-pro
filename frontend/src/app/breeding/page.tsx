'use client';

import React, { useEffect, useState, ChangeEvent, useRef } from 'react';
import {
  Box,
  Container,
  Text,
  Button,
  Card,
  Group,
  Stack,
  Flex,
  Badge,
  MultiSelect,
  Tabs,
  Table,
  Modal,
  Select,
  ActionIcon,
  ScrollArea,
  TextInput,
  Checkbox,
  NumberInput,
  Radio,
} from '@mantine/core';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconHeart, 
  IconCalendar,
  IconPaw,
  IconSettings,
  IconTrash,
  IconEdit,
  IconBabyCarriage,
  IconRainbow,
  IconChevronDown,
  IconChevronRight,
} from '@tabler/icons-react';

import { BreedingScheduleEditModal } from '@/components/breeding/breeding-schedule-edit-modal';
import { KittenDispositionModal } from '@/components/breeding/kitten-disposition-modal';
import { ContextMenuProvider, useContextMenu } from '@/components/context-menu';
import { TagDisplay } from '@/components/TagSelector';

import {
  useGetBreedingNgRules,
  useCreateBreedingNgRule,
  useUpdateBreedingNgRule,
  useDeleteBreedingNgRule,
  type BreedingNgRuleType,
  type CreateBreedingNgRuleRequest,
  useGetPregnancyChecks,
  useCreatePregnancyCheck,
  useDeletePregnancyCheck,
  type PregnancyCheck,
  useGetBirthPlans,
  useCreateBirthPlan,
  useDeleteBirthPlan,
  useUpdateBirthPlan,
  type BirthPlan,
  useCompleteBirthRecord,
  useCreateKittenDisposition,
  type CreateKittenDispositionRequest,
} from '@/lib/api/hooks/use-breeding';
import { useGetCats, useCreateCat, type Cat, type CreateCatRequest } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';

// 型定義
type NgRuleType = BreedingNgRuleType;

interface NgPairingRule {
  id: string;
  name: string;
  type: NgRuleType;
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

interface NewRuleState {
  name: string;
  type: NgRuleType;
  maleConditions: string[];
  femaleConditions: string[];
  maleNames: string[];
  femaleNames: string[];
  generationLimit: number | null;
  description: string;
}



interface BreedingScheduleEntry {
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

// 猫データ（繁殖用）- APIから取得するため削除

// localStorageキー
const STORAGE_KEYS = {
  ACTIVE_MALES: 'breeding_active_males',
  DEFAULT_DURATION: 'breeding_default_duration',
  SELECTED_YEAR: 'breeding_selected_year',
  SELECTED_MONTH: 'breeding_selected_month',
  BREEDING_SCHEDULE: 'breeding_schedule',
  MATING_CHECKS: 'breeding_mating_checks',
};

// NGペアルール
const initialNgPairingRules: NgPairingRule[] = [];

// 現在の日付から1ヶ月のカレンダーを生成
const generateMonthDates = (year: number, month: number) => {
  const dates = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    dates.push({
      date: day,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      dayOfWeek: date.getDay(),
    });
  }
  return dates;
};

// 年齢を月単位で計算
const calculateAgeInMonths = (birthDate: string): number => {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  
  // もし今月の日付が誕生日の日付より前なら、1ヶ月引く
  if (now.getDate() < birth.getDate()) {
    months--;
  }
  
  return Math.max(0, months);
};

export default function BreedingPage() {
  const { setPageHeader } = usePageHeader();
  
  // hydration guard: 初回マウント時に localStorage から読み込むまで保存を抑制
  const hydratedRef = useRef(false);
  const mountCountRef = useRef(0);

  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 現在の月
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // 現在の年
  const [breedingSchedule, setBreedingSchedule] = useState<Record<string, BreedingScheduleEntry>>({});
  // Note: isFullscreen is set to false and not used for toggling currently. 
  // This is reserved for future fullscreen feature implementation.
  const [isFullscreen] = useState(false);
  const [selectedMaleForEdit, setSelectedMaleForEdit] = useState<string | null>(null);
  const [activeMales, setActiveMales] = useState<Cat[]>([]); // 最初は空

  const [selectedMale, setSelectedMale] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1); // 交配期間（日数）
  const [defaultDuration, setDefaultDuration] = useState<number>(1); // デフォルト交配期間
  const [availableFemales, setAvailableFemales] = useState<Cat[]>([]);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [maleModalOpened, { open: openMaleModal, close: closeMaleModal }] = useDisclosure(false);
  const [rulesModalOpened, { close: closeRulesModal }] = useDisclosure(false);
  const [newRuleModalOpened, { open: openNewRuleModal, close: closeNewRuleModal }] = useDisclosure(false);
  const [birthInfoModalOpened, { open: openBirthInfoModal, close: closeBirthInfoModal }] = useDisclosure(false);
  const [scheduleEditModalOpened, { open: openScheduleEditModal, close: closeScheduleEditModal }] = useDisclosure(false);
  const [pregnancyCheckModalOpened, { open: openPregnancyCheckModal, close: closePregnancyCheckModal }] = useDisclosure(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<BreedingScheduleEntry | null>(null);
  const [selectedPregnancyCheck, setSelectedPregnancyCheck] = useState<PregnancyCheck | null>(null);
  const [pregnancyChecks, setPregnancyChecks] = useState({
    weightGain: false,
    pinking: false,
    palpation: false,
  });

  // コンテキストメニュー for breeding schedule
  const {
    handleAction: handleScheduleContextAction,
  } = useContextMenu<BreedingScheduleEntry>({
    edit: (schedule) => {
      if (schedule) {
        handleEditSchedule(schedule);
      }
    },
    delete: (schedule) => {
      if (schedule) {
        setSelectedScheduleForEdit(schedule);
        handleDeleteSchedule();
      }
    },
  });

  // 交配チェック記録管理 - キー: "オスID-メスID-日付", 値: チェック回数
  const [matingChecks, setMatingChecks] = useState<{[key: string]: number}>({});

  // 出産情報モーダルの状態
  const [selectedBirthPlan, setSelectedBirthPlan] = useState<BirthPlan | null>(null);
  const [birthCount, setBirthCount] = useState<number>(0);
  const [deathCount, setDeathCount] = useState<number>(0);
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedRaisingCats, setExpandedRaisingCats] = useState<Set<string>>(new Set());

  // 子猫処遇モーダルの状態
  const [dispositionModalOpened, { open: openDispositionModal, close: closeDispositionModal }] = useDisclosure(false);
  const [selectedKitten, setSelectedKitten] = useState<Cat | null>(null);
  const [selectedDispositionType, setSelectedDispositionType] = useState<'TRAINING' | 'SALE' | 'DECEASED'>('TRAINING');

  // 出産記録完了確認モーダルの状態
  const [completeConfirmModalOpened, { open: openCompleteConfirmModal, close: closeCompleteConfirmModal }] = useDisclosure(false);
  const [selectedBirthPlanForComplete, setSelectedBirthPlanForComplete] = useState<BirthPlan | null>(null);

  const [ngPairingRules, setNgPairingRules] = useState<NgPairingRule[]>(initialNgPairingRules);
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<NewRuleState>({
    name: '',
    type: 'TAG_COMBINATION',
    maleNames: [],
    femaleNames: [],
    maleConditions: [],
    femaleConditions: [],
    generationLimit: 3,
    description: '',
  });

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'breeding',
      <Group gap="sm">
        <Button
          variant="light"
          leftSection={<IconSettings size={16} />}
          size="sm"
        >
          NG設定
        </Button>
      </Group>
    );

    return () => {
      setPageHeader(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列でマウント時のみ実行

  // localStorageからデータを読み込む
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedActiveMales = localStorage.getItem(STORAGE_KEYS.ACTIVE_MALES);
        if (storedActiveMales) {
          const parsed = JSON.parse(storedActiveMales);
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
          const parsed = JSON.parse(storedBreedingSchedule);
          setBreedingSchedule(parsed);
          // すぐにlocalStorageを更新して同期を取る
          localStorage.setItem(STORAGE_KEYS.BREEDING_SCHEDULE, storedBreedingSchedule);
        }

        const storedMatingChecks = localStorage.getItem(STORAGE_KEYS.MATING_CHECKS);
        if (storedMatingChecks) {
          const parsed = JSON.parse(storedMatingChecks);
          setMatingChecks(parsed);
          // すぐにlocalStorageを更新
          localStorage.setItem(STORAGE_KEYS.MATING_CHECKS, storedMatingChecks);
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
  }, []);  // localStorageにデータを保存する
  
  // コンポーネントのマウント/アンマウントを追跡
  useEffect(() => {
    mountCountRef.current += 1;
    return () => {
      hydratedRef.current = false; // reset hydrated state on unmount
    };
  }, []);
  

  useEffect(() => {    const saveToStorage = () => {
      // don't persist before we've hydrated from storage
      if (!hydratedRef.current) return;

      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MALES, JSON.stringify(activeMales));
        localStorage.setItem(STORAGE_KEYS.DEFAULT_DURATION, defaultDuration.toString());
        localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, selectedYear.toString());
        localStorage.setItem(STORAGE_KEYS.SELECTED_MONTH, selectedMonth.toString());
        // breedingScheduleが空でない場合のみ保存
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

  const catsQuery = useGetCats({ limit: 1000 }, { enabled: true });
  const { data: catsResponse } = catsQuery;
  const tagCategoriesQuery = useGetTagCategories();
  const ngRulesQuery = useGetBreedingNgRules();
  const { data: ngRulesResponse, isLoading: isNgRulesLoading, isFetching: isNgRulesFetching, error: ngRulesError } = ngRulesQuery;

  // Pregnancy Check hooks
  const pregnancyChecksQuery = useGetPregnancyChecks();
  const { data: pregnancyChecksResponse } = pregnancyChecksQuery;
  const createPregnancyCheckMutation = useCreatePregnancyCheck();
  const deletePregnancyCheckMutation = useDeletePregnancyCheck();

  // Birth Plan hooks
  const birthPlansQuery = useGetBirthPlans();
  const { data: birthPlansResponse } = birthPlansQuery;
  const createBirthPlanMutation = useCreateBirthPlan();
  const deleteBirthPlanMutation = useDeleteBirthPlan();
  const updateBirthPlanMutation = useUpdateBirthPlan();
  const createCatMutation = useCreateCat();

  // Kitten Disposition hooks
  const createKittenDispositionMutation = useCreateKittenDisposition();
  const completeBirthRecordMutation = useCompleteBirthRecord();

  useEffect(() => {
    if (!ngRulesResponse) {
      return;
    }

  const remoteRules = (ngRulesResponse.data ?? []) as NgPairingRule[];
  setNgPairingRules(remoteRules.map(rule => ({ ...rule })));
  }, [ngRulesResponse]);

  useEffect(() => {
    if (ngRulesError) {
      setRulesError(ngRulesError instanceof Error ? ngRulesError.message : 'NGルールの取得に失敗しました');
    } else {
      setRulesError(null);
    }
  }, [ngRulesError]);
  const createNgRuleMutation = useCreateBreedingNgRule();
  const updateNgRuleMutation = useUpdateBreedingNgRule();
  const deleteNgRuleMutation = useDeleteBreedingNgRule();

  // 次のルール番号を生成する関数
  const getNextRuleName = () => {
    const existingNumbers = ngPairingRules
      .map((rule: NgPairingRule) => {
        const match = rule.name.match(/^NG(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter((num: number) => num > 0);
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `NG${maxNumber + 1}`;
  };
  
  const availableTags: string[] = [...new Set(
    (catsResponse?.data ?? [])
      .flatMap((cat: Cat) => cat.tags?.map((catTag) => catTag.tag.name).filter((name: string) => name) ?? [])
      .filter((name: string) => name)
  )];
  
  const maleCats = (catsResponse?.data ?? []).filter((cat: Cat) => cat.gender === 'MALE');
  const femaleCats = (catsResponse?.data ?? []).filter((cat: Cat) => cat.gender === 'FEMALE');

  const monthDates = generateMonthDates(selectedYear, selectedMonth);

  // NGペアチェック関数
  const isNGPairing = (maleId: string, femaleId: string) => {
    const male = activeMales.find((m: Cat) => m.id === maleId);
    const female = catsResponse?.data?.find((f: Cat) => f.id === femaleId);
    
    if (!male || !female) return false;
    
    const maleTags = male.tags?.map((catTag) => catTag.tag.name) ?? [];
    const femaleTags = female.tags?.map((catTag) => catTag.tag.name) ?? [];
    
    return ngPairingRules.some((rule: NgPairingRule) => {
      if (!rule.active) return false;
      
      if (rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions) {
        const maleMatches = rule.maleConditions.some((condition: string) => maleTags.includes(condition));
        const femaleMatches = rule.femaleConditions.some((condition: string) => femaleTags.includes(condition));
        return maleMatches && femaleMatches;
      }
      
      if (rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames) {
        return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
      }
      
      // generation_limit の実装（将来的にpedigree機能連携）
      if (rule.type === 'GENERATION_LIMIT') {
        // 血統データとの連携は将来実装予定
        return false;
      }
      
      return false;
    });
  };

  // フルスクリーン切り替え（将来の機能拡張用）
  // const toggleFullscreen = () => {
  //   if (!isFullscreen) {
  //     document.documentElement.requestFullscreen?.();
  //   } else {
  //     document.exitFullscreen?.();
  //   }
  //   setIsFullscreen(!isFullscreen);
  // };

  // オス猫追加
  const handleAddMale = (maleData: Cat) => {
    setActiveMales((prev: Cat[]) => [...prev, maleData]);
    closeMaleModal();
  };

  // オス猫削除
  const handleRemoveMale = (maleId: string) => {
    setActiveMales((prev: Cat[]) => prev.filter((m: Cat) => m.id !== maleId));
    setSelectedMaleForEdit(null);
  };

  // オス猫選択時に交配可能メス一覧を表示
  const handleMaleSelect = (maleId: string, date: string) => {
    setSelectedMale(maleId);
    setSelectedDate(date);
    setSelectedDuration(defaultDuration); // デフォルト期間を使用
    
    // 交配可能なメス猫をフィルタリング（生後11ヶ月以上、最新出産日から65日以上経過、FEMALE、在舎）
    // TODO: 最新出産日から65日以上経過のチェックを実装（breeding history APIが必要）
    const available = (catsResponse?.data ?? []).filter((cat: Cat) => 
      cat.gender === 'FEMALE' &&
      cat.isInHouse &&
      calculateAgeInMonths(cat.birthDate) >= 11
    );    setAvailableFemales(available);
    openModal();
  };

  // デフォルト期間を更新
  const handleSetDefaultDuration = (duration: number, setAsDefault: boolean) => {
    if (setAsDefault) {
      setDefaultDuration(duration);
    }
  };

  // 交配結果処理
  const handleMatingResult = (maleId: string, femaleId: string, femaleName: string, matingDate: string, result: 'success' | 'failure') => {
    const male = activeMales.find((m: Cat) => m.id === maleId);
    
    if (result === 'success') {
      // ○ボタン：妊娠確認中リストに追加
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + 21); // 21日後に妊娠確認
      
      createPregnancyCheckMutation.mutate({
        motherId: femaleId,
        fatherId: maleId,
        matingDate: matingDate,
        checkDate: checkDate.toISOString().split('T')[0],
        status: 'SUSPECTED',
        notes: `${male?.name || ''}との交配による妊娠疑い`,
      });
    }
    
    // 交配スケジュールを履歴として残す（○×どちらも）
    setBreedingSchedule((prev: Record<string, BreedingScheduleEntry>) => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(key => {
        if (key.includes(maleId) && newSchedule[key].femaleName === femaleName && !newSchedule[key].isHistory) {
          newSchedule[key] = {
            ...newSchedule[key],
            isHistory: true,
            result: '' // 成功・失敗問わず結果表示なし
          };
        }
      });
      return newSchedule;
    });
  };

  // 交配チェックを追加
  const handleMatingCheck = (maleId: string, femaleId: string, date: string) => {
    const key = `${maleId}-${femaleId}-${date}`;
    setMatingChecks((prev: {[key: string]: number}) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  // その日のチェック回数を取得
  const getMatingCheckCount = (maleId: string, femaleId: string, date: string): number => {
    const key = `${maleId}-${femaleId}-${date}`;
    return matingChecks[key] || 0;
  };

  // オス猫名クリック時の編集モード
  const handleMaleNameClick = (maleId: string) => {
    setSelectedMaleForEdit(selectedMaleForEdit === maleId ? null : maleId);
  };

  // 交配スケジュールの編集
  const handleEditSchedule = (schedule: BreedingScheduleEntry) => {
    setSelectedScheduleForEdit(schedule);
    openScheduleEditModal();
  };

  // 交配期間とメス猫の更新
  const handleUpdateScheduleDuration = (newDuration: number, newFemaleId?: string) => {
    if (!selectedScheduleForEdit) return;

    const { maleId, femaleId, date, duration: oldDuration, dayIndex } = selectedScheduleForEdit;
    
    // 開始日を計算
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayIndex);
    
    // メス猫が変更された場合、新しいメス猫情報を取得
    let newFemaleName = selectedScheduleForEdit.femaleName;
    let finalFemaleId = femaleId;
    
    if (newFemaleId && newFemaleId !== femaleId) {
      const newFemale = catsResponse?.data?.find((f: Cat) => f.id === newFemaleId);
      if (newFemale) {
        newFemaleName = newFemale.name;
        finalFemaleId = newFemaleId;
      }
    }
    
    // 新しいスケジュールを生成
    const newSchedule: Record<string, BreedingScheduleEntry> = {};
    const scheduleDates: string[] = [];
    
    for (let i = 0; i < newDuration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      scheduleDates.push(dateStr);
      
      const scheduleKey = `${maleId}-${dateStr}`;
      newSchedule[scheduleKey] = {
        ...selectedScheduleForEdit,
        femaleId: finalFemaleId,
        femaleName: newFemaleName,
        date: dateStr,
        duration: newDuration,
        dayIndex: i,
      };
    }
    
    // 古いスケジュールを削除し、新しいスケジュールを追加
    setBreedingSchedule((prev) => {
      const updated = { ...prev };
      
      // 古いスケジュールを削除（開始日から元の期間分）
      for (let i = 0; i < oldDuration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduleKey = `${maleId}-${dateStr}`;
        delete updated[scheduleKey];
      }
      
      // 新しいスケジュールを追加
      return { ...updated, ...newSchedule };
    });

    const message = newFemaleId && newFemaleId !== femaleId
      ? `交配期間を${newDuration}日間に変更し、メス猫を${newFemaleName}に変更しました`
      : `交配期間を${newDuration}日間に変更しました`;

    notifications.show({
      title: '更新成功',
      message,
      color: 'green',
    });
  };

  // スケジュールの削除
  const handleDeleteSchedule = () => {
    if (!selectedScheduleForEdit) return;

    const { maleId, date, duration, dayIndex } = selectedScheduleForEdit;
    
    // 開始日を計算
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayIndex);
    
    // スケジュール全体を削除
    setBreedingSchedule((prev) => {
      const updated = { ...prev };
      
      for (let i = 0; i < duration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduleKey = `${maleId}-${dateStr}`;
        delete updated[scheduleKey];
      }
      
      return updated;
    });

    notifications.show({
      title: '削除成功',
      message: 'スケジュールを削除しました',
      color: 'green',
    });
  };

  // メス猫をスケジュールに追加
  const handleAddFemaleToSchedule = (femaleId: string) => {
    const female = catsResponse?.data?.find((f: Cat) => f.id === femaleId);
    const male = activeMales.find((m: Cat) => m.id === selectedMale);
    
    if (female && male && selectedDate && selectedMale) {
      // メス猫の重複チェック
      const startDate = new Date(selectedDate);
      const scheduleDates: string[] = [];
      for (let i = 0; i < selectedDuration; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        scheduleDates.push(date.toISOString().split('T')[0]);
      }
      
      // 他のオス猫のスケジュールで同じメス猫が同じ日付に入っているかチェック
      const duplicateMales: string[] = [];
      activeMales.forEach((otherMale: Cat) => {
        if (otherMale.id === selectedMale) return; // 同じオスはスキップ
        
        scheduleDates.forEach(dateStr => {
          const scheduleKey = `${otherMale.id}-${dateStr}`;
          const schedule = breedingSchedule[scheduleKey];
          if (schedule && schedule.femaleId === femaleId && !schedule.isHistory) {
            if (!duplicateMales.includes(otherMale.name)) {
              duplicateMales.push(otherMale.name);
            }
          }
        });
      });
      
      if (duplicateMales.length > 0) {
        const confirmed = window.confirm(
          `警告: ${female.name}は既に以下のオス猫のスケジュールに入っています：\n${duplicateMales.join(', ')}\n\n本当にこのメス猫を追加しますか？`
        );
        
        if (!confirmed) {
          closeModal();
          return;
        }
      }
      
      // NGペアチェック
      if (isNGPairing(selectedMale, femaleId)) {
        const ngRule = ngPairingRules.find((rule: NgPairingRule) => {
          if (!rule.active) return false;
          
          if (rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions) {
            const maleTags = male.tags?.map((catTag) => catTag.tag.name) ?? [];
            const femaleTags = female.tags?.map((catTag) => catTag.tag.name) ?? [];
            const maleMatches = rule.maleConditions.some(condition => maleTags.includes(condition));
            const femaleMatches = rule.femaleConditions.some(condition => femaleTags.includes(condition));
            return maleMatches && femaleMatches;
          }
          
          if (rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames) {
            return rule.maleNames.includes(male.name) && rule.femaleNames.includes(female.name);
          }
          
          return false;
        });
        
        const confirmed = window.confirm(
          `警告: このペアは「${ngRule?.name}」ルールに該当します。\n${ngRule?.description ?? '詳細が設定されていません。'}\n\n本当に交配を予定しますか？`
        );
        
        if (!confirmed) {
          closeModal();
          return;
        }
      }
      
      // 各日付にスケジュールを追加
      const newSchedules: Record<string, BreedingScheduleEntry> = {};
      scheduleDates.forEach((dateStr, index) => {
        const scheduleKey = `${selectedMale}-${dateStr}`;
        
        // 前回のペアがある場合、成功/失敗の確認
        const existingPair = breedingSchedule[scheduleKey];
        if (existingPair && index === 0) { // 初日のみチェック
          const success = window.confirm(`前回のペア（${male.name} × ${existingPair.femaleName}）は成功しましたか？`);
          
          if (success) {
            // 成功：妊娠確認中リストに追加
            const checkDate = new Date(selectedDate);
            checkDate.setDate(checkDate.getDate() + 21); // 21日後に妊娠確認
            
            createPregnancyCheckMutation.mutate({
              motherId: femaleId,
              checkDate: checkDate.toISOString().split('T')[0],
              status: 'SUSPECTED',
              notes: `${male.name}との交配による妊娠疑い`,
            });
          }
          
          // 成功・失敗に関わらず、既存のペアをテキスト記録に変更
          newSchedules[scheduleKey] = {
            ...existingPair,
            isHistory: true,
            result: success ? '成功' : '失敗',
          };
        } else if (!existingPair) {
          // 新しいペアを追加
          newSchedules[scheduleKey] = {
            maleId: selectedMale,
            maleName: male.name,
            femaleId: femaleId,
            femaleName: female.name,
            date: dateStr,
            duration: selectedDuration,
            dayIndex: index, // 0: 初日, 1: 2日目, 2: 3日目...
            isHistory: false,
          };
        }
      });
      
      setBreedingSchedule(prev => ({ ...prev, ...newSchedules }));
    }
    
    closeModal();
  };

  // 妊娠確認
  const handlePregnancyCheck = (checkItem: PregnancyCheck, isPregnant: boolean) => {
    if (isPregnant) {
      // 妊娠の場合：チェックリストモーダルを開く
      setSelectedPregnancyCheck(checkItem);
      setPregnancyChecks({
        weightGain: false,
        pinking: false,
        palpation: false,
      });
      openPregnancyCheckModal();
    } else {
      // 非妊娠の場合：妊娠チェックを削除
      deletePregnancyCheckMutation.mutate(checkItem.id);
    }
  };

  // 妊娠確認モーダルでの確定処理
  const handleConfirmPregnancy = () => {
    if (!selectedPregnancyCheck) return;

    // 出産予定リストに追加
    const expectedDate = new Date(selectedPregnancyCheck.checkDate);
    expectedDate.setDate(expectedDate.getDate() + 45); // 妊娠確認から約45日後に出産予定
    
    createBirthPlanMutation.mutate({
      motherId: selectedPregnancyCheck.motherId,
      fatherId: selectedPregnancyCheck.fatherId ?? undefined,
      matingDate: selectedPregnancyCheck.matingDate ?? undefined,
      expectedBirthDate: expectedDate.toISOString().split('T')[0],
      status: 'EXPECTED',
      notes: '妊娠確認による出産予定',
    }, {
      onSuccess: () => {
        // 出産予定作成成功後、妊娠確認中から削除
        deletePregnancyCheckMutation.mutate(selectedPregnancyCheck.id, {
          onSuccess: () => {
            closePregnancyCheckModal();
            setSelectedPregnancyCheck(null);
            setPregnancyChecks({
              weightGain: false,
              pinking: false,
              palpation: false,
            });
          },
          onError: (error) => {
            // 妊娠確認削除失敗時は通知を表示するが、出産予定作成の成功は維持
            notifications.show({
              title: '注意',
              message: '出産予定は作成されましたが、妊娠確認の削除に失敗しました。ページを更新してください。',
              color: 'orange',
            });
            closePregnancyCheckModal();
            setSelectedPregnancyCheck(null);
            setPregnancyChecks({
              weightGain: false,
              pinking: false,
              palpation: false,
            });
          }
        });
      }
    });
  };

  // 子猫処遇登録ハンドラー
  const handleKittenDispositionSubmit = async (data: {
    disposition: 'TRAINING' | 'SALE' | 'DECEASED';
    trainingStartDate?: string;
    saleInfo?: { buyer: string; price: number; saleDate: string; notes?: string };
    deathDate?: string;
    deathReason?: string;
    notes?: string;
  }) => {
    if (!selectedKitten) return;

    // BirthPlanを取得（子猫のmotherIdから）
    const birthPlan = (birthPlansResponse?.data || []).find(
      (bp: BirthPlan) => bp.motherId === selectedKitten.motherId && bp.status === 'BORN'
    );

    if (!birthPlan) {
      notifications.show({
        title: 'エラー',
        message: '出産記録が見つかりません',
        color: 'red',
      });
      return;
    }

    const payload: CreateKittenDispositionRequest = {
      birthRecordId: birthPlan.id,
      kittenId: selectedKitten.id,
      name: selectedKitten.name,
      gender: selectedKitten.gender,
      disposition: data.disposition,
      trainingStartDate: data.trainingStartDate,
      saleInfo: data.saleInfo,
      deathDate: data.deathDate,
      deathReason: data.deathReason,
      notes: data.notes,
    };

    try {
      await createKittenDispositionMutation.mutateAsync(payload);
      
      closeDispositionModal();
      setSelectedKitten(null);
      catsQuery.refetch();
    } catch (error) {
      console.error('Failed to create kitten disposition:', error);
    }
  };

  // NGルール管理機能
  const addNewRule = () => {
    if (createNgRuleMutation.isPending) {
      return;
    }

    const payload: CreateBreedingNgRuleRequest = {
      name: newRule.name,
      description: newRule.description.trim() ? newRule.description.trim() : undefined,
      type: newRule.type,
      active: true,
    };

    if (newRule.type === 'TAG_COMBINATION') {
      payload.maleConditions = newRule.maleConditions;
      payload.femaleConditions = newRule.femaleConditions;
    } else if (newRule.type === 'INDIVIDUAL_PROHIBITION') {
      payload.maleNames = newRule.maleNames;
      payload.femaleNames = newRule.femaleNames;
    } else if (newRule.type === 'GENERATION_LIMIT' && newRule.generationLimit) {
      payload.generationLimit = newRule.generationLimit;
    }

    setRulesError(null);
    createNgRuleMutation.mutate(payload, {
      onSuccess: () => {
        resetNewRuleForm();
        closeNewRuleModal();
      },
      onError: (error: unknown) => {
        setRulesError(error instanceof Error ? error.message : 'NGルールの登録に失敗しました');
      },
    });
  };

  const resetNewRuleForm = () => {
    setNewRule({
      name: getNextRuleName(),
      type: 'TAG_COMBINATION',
      maleNames: [],
      femaleNames: [],
      maleConditions: [],
      femaleConditions: [],
      generationLimit: 3,
      description: '',
    });
  };

  // 新規ルールモーダルを開く時にルール名を自動生成
  const openNewRuleModalWithName = () => {
    setNewRule((prev: NewRuleState) => ({
      ...prev,
      name: getNextRuleName()
    }));
    openNewRuleModal();
  };

  // 新規ルールのバリデーション
  const isNewRuleValid = () => {
    // ルール名は必須
    if (!newRule.name.trim()) {
      return false;
    }

    // ルールタイプ別のバリデーション
    if (newRule.type === 'TAG_COMBINATION') {
      return newRule.maleConditions.length > 0 && newRule.femaleConditions.length > 0;
    } else if (newRule.type === 'INDIVIDUAL_PROHIBITION') {
      return newRule.maleNames.length > 0 && newRule.femaleNames.length > 0;
    } else if (newRule.type === 'GENERATION_LIMIT') {
      return (newRule.generationLimit ?? 0) > 0;
    }

    return false;
  };

  const deleteRule = (ruleId: string) => {
    const previousRules = [...ngPairingRules];
    setRulesError(null);
    setNgPairingRules((prev: NgPairingRule[]) => prev.filter((rule: NgPairingRule) => rule.id !== ruleId));
    deleteNgRuleMutation.mutate(ruleId, {
      onError: (error: unknown) => {
        setRulesError(error instanceof Error ? error.message : 'NGルールの削除に失敗しました');
        setNgPairingRules(previousRules);
      },
    });
  };

  const toggleRule = (ruleId: string) => {
    const previousRules = ngPairingRules.map((rule: NgPairingRule) => ({ ...rule }));
    const target = previousRules.find((rule: NgPairingRule) => rule.id === ruleId);
    if (!target) return;

    const nextActive = !target.active;
    setRulesError(null);
    setNgPairingRules((prev: NgPairingRule[]) =>
      prev.map((rule: NgPairingRule) => (rule.id === ruleId ? { ...rule, active: nextActive } : rule)),
    );

    updateNgRuleMutation.mutate(
      { id: ruleId, payload: { active: nextActive } },
      {
        onError: (error: unknown) => {
          setRulesError(error instanceof Error ? error.message : 'NGルールの更新に失敗しました');
          setNgPairingRules(previousRules);
        },
      },
    );
  };

  return (
    <Box 
      style={{ 
        minHeight: '100vh', 
  backgroundColor: 'var(--background-base)',
        position: isFullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: isFullscreen ? 9999 : 'auto',
        overflow: isFullscreen ? 'hidden' : 'auto',
      }}
    >
      {/* メインコンテンツ */}
      <Container 
        size={isFullscreen ? "100%" : "xl"} 
        style={{ 
          paddingTop: '1rem',
          height: isFullscreen ? 'calc(100vh - 80px)' : 'auto',
          overflow: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        {/* タブ */}
        <Tabs value={activeTab} onChange={(value: string | null) => setActiveTab(value || 'schedule')} mb="md">
          <Tabs.List style={{ gap: '4px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
            <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />} style={{ whiteSpace: 'nowrap' }}>
              交配管理
            </Tabs.Tab>
            <Tabs.Tab value="pregnancy" leftSection={<IconHeart size={16} />} style={{ whiteSpace: 'nowrap' }}>
              妊娠確認 ({pregnancyChecksResponse?.data?.length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="birth" leftSection={<IconPaw size={16} />} style={{ whiteSpace: 'nowrap' }}>
              出産予定 ({birthPlansResponse?.data?.filter((item: BirthPlan) => item.status === 'EXPECTED').length || 0})
            </Tabs.Tab>
            <Tabs.Tab value="raising" leftSection={<IconBabyCarriage size={16} />} style={{ whiteSpace: 'nowrap' }}>
              子育て中 ({(() => {
                // 子猫を持つ母猫の数を計算
                const mothersWithKittens = (catsResponse?.data || []).filter((cat: Cat) => {
                  // 生後3ヶ月以内の子猫がいる母猫を抽出
                  const hasYoungKittens = (catsResponse?.data || []).some((kitten: Cat) => {
                    if (kitten.motherId !== cat.id) return false;
                    
                    const birthDate = new Date(kitten.birthDate);
                    const now = new Date();
                    const ageInMonths = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                    
                    return ageInMonths <= 3;
                  });
                  
                  return hasYoungKittens;
                });
                return mothersWithKittens.length;
              })()})
            </Tabs.Tab>
          </Tabs.List>

          {/* 交配管理表タブ */}
          <Tabs.Panel value="schedule" pt="md">
            <Card 
              shadow="sm" 
              padding={isFullscreen ? "xs" : "md"} 
              radius="md" 
              withBorder 
              mb="md"
              style={{ height: isFullscreen ? 'calc(100vh - 180px)' : 'auto' }}
            >
              <Group gap="xs" mb="md" align="flex-end">
                <Select
                  value={selectedYear.toString()}
                  onChange={(value: string | null) => setSelectedYear(parseInt(value || '2024'))}
                  data={['2024', '2025', '2026'].map(year => ({ value: year, label: year }))}
                  size={isFullscreen ? "xs" : "sm"}
                  styles={{ input: { width: '80px' } }}
                />
                <Text size="sm" pb={isFullscreen ? 4 : 8}>年</Text>
                <Select
                  value={selectedMonth.toString()}
                  onChange={(value: string | null) => setSelectedMonth(parseInt(value || '8'))}
                  data={Array.from({ length: 12 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: String(i + 1).padStart(2, '0')
                  }))}
                  size={isFullscreen ? "xs" : "sm"}
                  styles={{ input: { width: '70px' } }}
                />
                <Text size="sm" pb={isFullscreen ? 4 : 8}>月</Text>
                <Button
                  variant="light"
                  size={isFullscreen ? "xs" : "sm"}
                  leftSection={<IconPaw size={16} />}
                  rightSection={<IconPlus size={16} />}
                  onClick={openMaleModal}
                >
                  オス追加
                </Button>
              </Group>
              
              <ScrollArea 
                style={{ 
                  height: isFullscreen ? 'calc(100% - 80px)' : '600px',
                  width: '100%'
                }}
              >
                <Table
                  style={{ 
                    fontSize: isFullscreen ? '11px' : '14px',
                    minWidth: isFullscreen ? '1200px' : '800px',
                    position: 'relative'
                  }}
                >
                  <Table.Thead 
                    style={{ 
                      position: 'sticky',
                      top: 0,
                      backgroundColor: 'var(--surface)',
                      zIndex: 10,
                      borderBottom: '2px solid var(--border-subtle)'
                    }}
                  >
                    <Table.Tr>
                      <Table.Th 
                        style={{ 
                          width: isFullscreen ? 60 : 80,
                          minWidth: isFullscreen ? 60 : 80,
                          maxWidth: isFullscreen ? 60 : 80,
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'var(--surface)',
                          zIndex: 11,
                          borderRight: '2px solid var(--border-subtle)'
                        }}
                      >
                        <Flex align="center" gap={4} justify="center">
                          <Text size={isFullscreen ? "xs" : "sm"} fw={600}>
                            日付
                          </Text>
                        </Flex>
                      </Table.Th>
                      {activeMales.map((male: Cat) => (
                        <Table.Th 
                          key={male.id} 
                          style={{ 
                            minWidth: isFullscreen ? 100 : 120,
                            borderRight: '1px solid var(--border-subtle)' // オス名の境界線
                          }}
                        >
                          <Box
                            onClick={() => handleMaleNameClick(male.id)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                          >
                            <Text fw={600} size={isFullscreen ? "xs" : "sm"} ta="center">
                              {male.name}
                            </Text>
                          </Box>
                          {selectedMaleForEdit === male.id && (
                            <Group gap="xs" justify="center" mt="xs">
                              <Button
                                size="xs"
                                color="red"
                                onClick={() => handleRemoveMale(male.id)}
                              >
                                削除
                              </Button>
                              <Button
                                size="xs"
                                onClick={() => setSelectedMaleForEdit(null)}
                              >
                                保存
                              </Button>
                            </Group>
                          )}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {monthDates.map(({ date, dateString, dayOfWeek }: { date: number; dateString: string; dayOfWeek: number }) => (
                      <Table.Tr key={date}>
                        <Table.Td
                          style={{
                            width: isFullscreen ? 60 : 80,
                            minWidth: isFullscreen ? 60 : 80,
                            maxWidth: isFullscreen ? 60 : 80,
                            position: 'sticky',
                            left: 0,
                            backgroundColor: 'var(--surface)',
                            zIndex: 5,
                            borderRight: '1px solid var(--border-subtle)'
                          }}
                        >
                          <Flex align="center" gap={4} justify="center">
                            <Text 
                              size={isFullscreen ? "xs" : "sm"} 
                              fw={dayOfWeek === 0 || dayOfWeek === 6 ? 600 : 400}
                              c={dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : undefined}
                            >
                              {date}日
                            </Text>
                            <Text 
                              size={isFullscreen ? "8px" : "xs"} 
                              c={dayOfWeek === 0 ? 'red' : dayOfWeek === 6 ? 'blue' : 'dimmed'}
                            >
                              ({['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]})
                            </Text>
                          </Flex>
                        </Table.Td>
                        {activeMales.map((male: Cat) => {
                          const scheduleKey = `${male.id}-${dateString}`;
                          const schedule = breedingSchedule[scheduleKey];
                          
                          // 次の日も同じ交配期間かチェック
                          const nextDate = new Date(selectedYear, selectedMonth, date + 1);
                          const nextDateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
                          const nextScheduleKey = `${male.id}-${nextDateString}`;
                          const nextSchedule = breedingSchedule[nextScheduleKey];
                          const hasNextSameMating = schedule && nextSchedule && 
                            schedule.femaleName === nextSchedule.femaleName && 
                            !schedule.isHistory && !nextSchedule.isHistory;
                          
                          return (
                            <Table.Td 
                              key={male.id} 
                              style={{ 
                                textAlign: 'center',
                                // 交配期間中で次の日も同じ交配の場合は境界線を消す
                                borderRight: hasNextSameMating ? 'none' : '1px solid var(--border-subtle)',
                                // 交配期間中は薄い黄色の背景
                                backgroundColor: schedule && !schedule.isHistory ? '#fffacd' : 'transparent'
                              }}
                            >
                              {schedule ? (
                                schedule.isHistory ? (
                                  // 履歴：名前とチェックマークを一行表示（ダブルクリックで編集可能、右クリックでメニュー）
                                  <ContextMenuProvider
                                    entity={schedule}
                                    actions={['edit', 'delete']}
                                    onAction={handleScheduleContextAction}
                                  >
                                    <Box 
                                      style={{ position: 'relative', width: '100%', height: '100%', minHeight: isFullscreen ? '28px' : '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: 0.6, cursor: 'pointer' }}
                                      title="ダブルクリックまたは右クリックで操作"
                                    >
                                    <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
                                      {/* 履歴のメス名表示（初日と最終日） */}
                                      {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
                                        <Badge size={isFullscreen ? "xs" : "sm"} color="gray" variant="light">
                                          {schedule.femaleName}
                                        </Badge>
                                      )}
                                      
                                      {/* 履歴のチェックマーク表示エリア */}
                                      <Box
                                        style={{
                                          flex: 1,
                                          minHeight: isFullscreen ? '20px' : '24px',
                                          padding: '2px 4px',
                                          borderRadius: '3px',
                                          border: '1px dashed #d3d3d3',
                                          backgroundColor: getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? '#f8f8f8' : 'transparent',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        {getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? (
                                          <Text size={isFullscreen ? "8px" : "xs"} c="dimmed" ta="center" lh={1}>
                                            {'✓'.repeat(getMatingCheckCount(male.id, schedule.femaleId, dateString))}
                                          </Text>
                                        ) : (
                                          <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.3 }} lh={1}>
                                            -
                                          </Text>
                                        )}
                                      </Box>
                                    </Flex>
                                  </Box>
                                  </ContextMenuProvider>
                                ) : (
                                  // 現在のスケジュール：ダブルクリックまたは右クリックで操作
                                  <ContextMenuProvider
                                    entity={schedule}
                                    actions={['edit', 'delete']}
                                    onAction={handleScheduleContextAction}
                                  >
                                  <Box 
                                    style={{ position: 'relative', width: '100%', height: '100%', minHeight: isFullscreen ? '28px' : '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}
                                    title="ダブルクリックまたは右クリックで操作"
                                  >
                                    {/* 一行表示：メス名バッジ（初日と最終日）とチェックエリア */}
                                    <Flex align="center" gap={4} style={{ minHeight: isFullscreen ? '24px' : '28px' }}>
                                      {/* メス名表示（初日と最終日） */}
                                      {(schedule.dayIndex === 0 || schedule.dayIndex === schedule.duration - 1) && (
                                        <Badge size={isFullscreen ? "xs" : "sm"} color="pink">
                                          {schedule.femaleName}
                                        </Badge>
                                      )}
                                      
                                      {/* チェックマーク表示エリアまたは最終日のボタン */}
                                      {schedule.dayIndex === schedule.duration - 1 ? (
                                        /* 最終日：○×ボタン */
                                        <Group gap={2}>
                                          <ActionIcon
                                            size={isFullscreen ? "xs" : "sm"}
                                            variant="light"
                                            color="green"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMatingResult(male.id, schedule.femaleId, schedule.femaleName, schedule.date, 'success');
                                            }}
                                            title="交配成功"
                                          >
                                            ○
                                          </ActionIcon>
                                          <ActionIcon
                                            size={isFullscreen ? "xs" : "sm"}
                                            variant="light"
                                            color="red"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleMatingResult(male.id, schedule.femaleId, schedule.femaleName, schedule.date, 'failure');
                                            }}
                                            title="交配失敗"
                                          >
                                            ×
                                          </ActionIcon>
                                        </Group>
                                      ) : (
                                        /* 初日・中間日：チェックマーク表示エリア */
                                        <Box
                                          style={{
                                            flex: 1,
                                            minHeight: isFullscreen ? '16px' : '18px',
                                            cursor: 'pointer',
                                            padding: '1px 4px',
                                            borderRadius: '3px',
                                            border: '1px dashed var(--border-subtle)',
                                            backgroundColor: getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? '#f0f9f0' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleMatingCheck(male.id, schedule.femaleId, dateString);
                                          }}
                                          title="クリックして交配記録を追加"
                                        >
                                          {getMatingCheckCount(male.id, schedule.femaleId, dateString) > 0 ? (
                                            <Text size={isFullscreen ? "8px" : "xs"} c="green" ta="center" lh={1}>
                                              {'✓'.repeat(getMatingCheckCount(male.id, schedule.femaleId, dateString))}
                                            </Text>
                                          ) : (
                                            <Text size="8px" c="dimmed" ta="center" style={{ opacity: 0.5 }} lh={1}>
                                              +
                                            </Text>
                                          )}
                                        </Box>
                                      )}
                                    </Flex>
                                  </Box>
                                  </ContextMenuProvider>
                                )
                              ) : (
                                <Button
                                  variant="subtle"
                                  size={isFullscreen ? "xs" : "sm"}
                                  onClick={() => handleMaleSelect(male.id, dateString)}
                                  style={{ 
                                    width: '100%',
                                    height: isFullscreen ? '24px' : '32px'
                                  }}
                                >
                                  +
                                </Button>
                              )}
                            </Table.Td>
                          );
                        })}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Card>
          </Tabs.Panel>

          {/* 妊娠確認中タブ */}
          <Tabs.Panel value="pregnancy" pt="md">
            <Stack gap="sm">
              {pregnancyChecksResponse?.data?.map((item: PregnancyCheck) => {
                // 父猫の名前を取得（fatherIdから）
                const fatherName = item.fatherId 
                  ? catsResponse?.data?.find((cat: Cat) => cat.id === item.fatherId)?.name || '不明'
                  : '不明';
                
                // 確認予定日を計算（交配確認日の27日後）
                const scheduledCheckDate = item.matingDate 
                  ? (() => {
                      const date = new Date(item.matingDate);
                      date.setDate(date.getDate() + 27);
                      return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
                    })()
                  : '不明';
                
                return (
                  <Card key={item.id} shadow="sm" padding="sm" radius="md" withBorder>
                    <Flex justify="space-between" align="center" wrap="nowrap">
                      <Group gap="md" wrap="nowrap">
                        <Text fw={600} size="sm">
                          {item.mother?.name || '不明'} ({fatherName})
                        </Text>
                        <Group gap={4} wrap="nowrap">
                          <Text size="sm" c="dimmed">
                            交配確認日: {item.matingDate ? new Date(item.matingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '不明'}
                          </Text>
                          <Text size="sm" c="dimmed">
                            確認予定日: {scheduledCheckDate}
                          </Text>
                        </Group>
                      </Group>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          color="green"
                          variant="light"
                          size="md"
                          onClick={() => handlePregnancyCheck(item, true)}
                          title="妊娠確定"
                        >
                          ○
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="light"
                          size="md"
                          onClick={() => handlePregnancyCheck(item, false)}
                          title="非妊娠"
                        >
                          ×
                        </ActionIcon>
                      </Group>
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
          </Tabs.Panel>

          {/* 出産予定一覧タブ */}
          <Tabs.Panel value="birth" pt="md">
            <Stack gap="sm">
              {birthPlansResponse?.data?.filter((item: BirthPlan) => item.status === 'EXPECTED').map((item: BirthPlan) => {
                // 父猫の名前を取得（fatherIdから）
                const fatherName = item.fatherId 
                  ? catsResponse?.data?.find((cat: Cat) => cat.id === item.fatherId)?.name || '不明'
                  : '不明';
                
                return (
                  <Card key={item.id} shadow="sm" padding="sm" radius="md" withBorder>
                    <Flex justify="space-between" align="center" wrap="nowrap">
                      <Group gap="md" wrap="nowrap">
                        <Text fw={600} size="sm">
                          {item.mother?.name || '不明'} ({fatherName})
                        </Text>
                        <Group gap={4} wrap="nowrap">
                          <Text size="sm" c="dimmed">
                            交配日: {item.matingDate ? new Date(item.matingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '不明'}
                          </Text>
                          <Text size="sm" c="dimmed">
                            出産予定日: {new Date(item.expectedBirthDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                          </Text>
                        </Group>
                      </Group>
                      <Group gap="xs" wrap="nowrap">
                        <ActionIcon
                          color="green"
                          variant="light"
                          size="md"
                          onClick={() => {
                            setSelectedBirthPlan(item);
                            setBirthCount(0);
                            setDeathCount(0);
                            setBirthDate(new Date().toISOString().split('T')[0]);
                            openBirthInfoModal();
                          }}
                          title="出産確認"
                        >
                          ○
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="light"
                          size="md"
                          onClick={() => {
                            // 出産計画を削除して交配管理表に戻す
                            deleteBirthPlanMutation.mutate(item.id);
                          }}
                          title="出産なし"
                        >
                          ×
                        </ActionIcon>
                      </Group>
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
          </Tabs.Panel>

          {/* 子育て中タブ */}
          <Tabs.Panel value="raising" pt="md">
            <Card padding="md" radius="md" withBorder>
              {catsQuery.isLoading ? (
                <Text ta="center" c="dimmed" py="xl">読み込み中...</Text>
              ) : (() => {
                // 子猫を持つ母猫をフィルタリング（完了していない出産記録のみ）
                const mothersWithKittens = (catsResponse?.data || [])
                  .filter((cat: Cat) => {
                    // この母猫の未完了の出産記録を確認
                    const activeBirthPlan = (birthPlansResponse?.data || []).find(
                      (bp: BirthPlan) => bp.motherId === cat.id && bp.status === 'BORN' && !bp.completedAt
                    );
                    
                    if (!activeBirthPlan) return false;
                    
                    // 生後3ヶ月以内の子猫がいる母猫を抽出
                    const hasYoungKittens = (catsResponse?.data || []).some((kitten: Cat) => {
                      if (kitten.motherId !== cat.id) return false;
                      
                      const birthDate = new Date(kitten.birthDate);
                      const now = new Date();
                      const ageInMonths = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                      
                      return ageInMonths <= 3;
                    });
                    
                    return hasYoungKittens;
                  })
                  .map((mother: Cat) => {
                    // この母猫の子猫を取得
                    const kittens = (catsResponse?.data || []).filter((kitten: Cat) => {
                      if (kitten.motherId !== mother.id) return false;
                      
                      const birthDate = new Date(kitten.birthDate);
                      const now = new Date();
                      const ageInMonths = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
                      
                      return ageInMonths <= 3;
                    });
                    
                    return { mother, kittens };
                  });

                if (mothersWithKittens.length === 0) {
                  return (
                    <Text ta="center" c="dimmed" py="xl">
                      現在子育て中の母猫はいません
                    </Text>
                  );
                }

                return (
                  <Table striped withTableBorder>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: '40px' }}></Table.Th>
                        <Table.Th>母猫名</Table.Th>
                        <Table.Th>父猫名</Table.Th>
                        <Table.Th>出産日</Table.Th>
                        <Table.Th>生後</Table.Th>
                        <Table.Th>子猫数</Table.Th>
                        <Table.Th>処遇完了</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {mothersWithKittens.map(({ mother, kittens }) => {
                        const isExpanded = expandedRaisingCats.has(mother.id);
                        const oldestKitten = kittens.length > 0 ? kittens.reduce((oldest, k) => 
                          new Date(k.birthDate) < new Date(oldest.birthDate) ? k : oldest
                        ) : null;
                        
                        const ageInMonths = oldestKitten 
                          ? calculateAgeInMonths(oldestKitten.birthDate)
                          : 0;

                        // この母猫のBirthPlanを取得して出産数と死亡数を計算
                        const birthPlan = (birthPlansResponse?.data || []).find(
                          (bp: BirthPlan) => bp.motherId === mother.id && bp.status === 'BORN'
                        );
                        const totalBorn = birthPlan?.actualKittens || kittens.length;
                        const alive = kittens.length;
                        const dead = totalBorn - alive;

                        return (
                          <React.Fragment key={mother.id}>
                            {/* 母猫の行 */}
                            <Table.Tr
                              style={{ cursor: 'pointer', backgroundColor: isExpanded ? '#f8f9fa' : undefined }}
                              onClick={() => {
                                const newExpanded = new Set(expandedRaisingCats);
                                if (newExpanded.has(mother.id)) {
                                  newExpanded.delete(mother.id);
                                } else {
                                  newExpanded.add(mother.id);
                                }
                                setExpandedRaisingCats(newExpanded);
                              }}
                            >
                              <Table.Td>
                                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                              </Table.Td>
                              <Table.Td>
                                <Text fw={500}>{mother.name}</Text>
                              </Table.Td>
                              <Table.Td>
                                {mother.fatherId 
                                  ? catsResponse?.data?.find((c: Cat) => c.id === mother.fatherId)?.name || '不明'
                                  : '不明'
                                }
                              </Table.Td>
                              <Table.Td>
                                {oldestKitten 
                                  ? new Date(oldestKitten.birthDate).toLocaleDateString('ja-JP')
                                  : '-'
                                }
                              </Table.Td>
                              <Table.Td>
                                {ageInMonths}ヶ月
                              </Table.Td>
                              <Table.Td>
                                {alive}頭（{totalBorn}-{dead}）
                              </Table.Td>
                              <Table.Td>
                                {birthPlan && !birthPlan.completedAt ? (
                                  <Button
                                    size="xs"
                                    variant="light"
                                    color="blue"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (birthPlan) {
                                        setSelectedBirthPlanForComplete(birthPlan);
                                        openCompleteConfirmModal();
                                      }
                                    }}
                                  >
                                    完了
                                  </Button>
                                ) : birthPlan?.completedAt ? (
                                  <Badge color="green" size="sm">完了済</Badge>
                                ) : (
                                  <Text size="sm" c="dimmed">-</Text>
                                )}
                              </Table.Td>
                            </Table.Tr>

                            {/* 子猫の詳細行 */}
                            {isExpanded && kittens.map((kitten: Cat) => (
                              <Table.Tr key={kitten.id} style={{ backgroundColor: '#f8f9fa' }}>
                                <Table.Td></Table.Td>
                                <Table.Td colSpan={1}>
                                  <Text size="sm" pl="md">{kitten.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">{kitten.gender === 'MALE' ? 'オス' : 'メス'}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">{kitten.coatColor?.name || '-'}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">{calculateAgeInMonths(kitten.birthDate)}ヶ月</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Group gap="xs">
                                    {kitten.tags && kitten.tags.length > 0 && (
                                      <TagDisplay 
                                        tagIds={kitten.tags.map(t => t.tag.id)} 
                                        size="xs" 
                                        categories={tagCategoriesQuery.data?.data || []}
                                        tagMetadata={Object.fromEntries(
                                          kitten.tags.map(t => [t.tag.id, t.tag.metadata || {}])
                                        )}
                                      />
                                    )}
                                  </Group>
                                </Table.Td>
                                <Table.Td>
                                  <Group gap={4}>
                                    <ActionIcon
                                      size="sm"
                                      variant="light"
                                      color="blue"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedKitten(kitten);
                                        setSelectedDispositionType('TRAINING');
                                        openDispositionModal();
                                      }}
                                      title="養成開始"
                                    >
                                      🎓
                                    </ActionIcon>
                                    <ActionIcon
                                      size="sm"
                                      variant="light"
                                      color="green"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedKitten(kitten);
                                        setSelectedDispositionType('SALE');
                                        openDispositionModal();
                                      }}
                                      title="出荷"
                                    >
                                      💰
                                    </ActionIcon>
                                    <ActionIcon
                                      size="sm"
                                      variant="light"
                                      color="gray"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedKitten(kitten);
                                        setSelectedDispositionType('DECEASED');
                                        openDispositionModal();
                                      }}
                                      title="死亡登録"
                                    >
                                      🌈
                                    </ActionIcon>
                                  </Group>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                );
              })()}
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Container>

      {/* メス猫選択モーダル */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title="交配するメス猫を選択"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {selectedMale && activeMales.find((m: Cat) => m.id === selectedMale)?.name} との交配相手を選択してください
          </Text>
          
          <Stack gap="xs">
            <NumberInput
              label="交配期間"
              description="交配を行う日数を設定してください"
              value={selectedDuration}
              onChange={(value: string | number) => setSelectedDuration(typeof value === 'number' ? value : 1)}
              min={1}
              max={7}
              suffix="日間"
            />
            <Checkbox
              label="この期間をデフォルトに設定"
              size="sm"
              onChange={(event: ChangeEvent<HTMLInputElement>) => handleSetDefaultDuration(selectedDuration, event.currentTarget.checked)}
            />
          </Stack>

          {availableFemales.map((female: Cat) => {
            const isNG = selectedMale ? isNGPairing(selectedMale, female.id) : false;
            return (
              <Card 
                key={female.id} 
                shadow="sm" 
                padding="sm" 
                radius="md" 
                withBorder
                style={{ borderColor: isNG ? '#ff6b6b' : undefined }}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Group gap="xs">
                      <Text fw={600}>{female.name}</Text>
                      {isNG && <Badge color="red" size="xs">NG</Badge>}
                    </Group>
                    <Text size="sm" c="dimmed">{female.breed?.name ?? '不明'}</Text>
                    <Group gap="xs">
                      {female.tags?.map((catTag) => (
                        <Badge key={catTag.tag.id} variant="outline" size="xs">
                          {catTag.tag.name}
                        </Badge>
                      )) ?? []}
                    </Group>
                  </Box>
                  <Button
                    size="sm"
                    color={isNG ? "red" : undefined}
                    variant={isNG ? "outline" : "filled"}
                    onClick={() => handleAddFemaleToSchedule(female.id)}
                  >
                    {isNG ? '警告選択' : '選択'}
                  </Button>
                </Flex>
              </Card>
            );
          })}
          {availableFemales.length === 0 && (
            <Text ta="center" c="dimmed">
              現在交配可能なメス猫がいません
            </Text>
          )}
        </Stack>
      </Modal>

      {/* オス猫追加モーダル */}
      <Modal
        opened={maleModalOpened}
        onClose={closeMaleModal}
        title="オス猫をスケジュールに追加"
        size="md"
      >
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            スケジュールに追加するオス猫を選択してください
          </Text>
          
          {(catsResponse?.data ?? []).filter((cat: Cat) => 
            cat.gender === 'MALE' && 
            cat.isInHouse && 
            calculateAgeInMonths(cat.birthDate) >= 10 &&
            !activeMales.some((am: Cat) => am.id === cat.id)
          ).map((male: Cat) => (
            <Card key={male.id} shadow="sm" padding="sm" radius="md" withBorder>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fw={600}>{male.name}</Text>
                  <Text size="sm" c="dimmed">{male.breed?.name ?? '不明'}</Text>
                  <Group gap="xs">
                    {male.tags?.map((catTag, index) => (
                      <Badge key={`${catTag.tag.id}-${index}`} variant="outline" size="xs">
                        {catTag.tag.name}
                      </Badge>
                    )) ?? []}
                  </Group>
                </Box>
                <Button
                  size="sm"
                  onClick={() => handleAddMale(male)}
                >
                  追加
                </Button>
              </Flex>
            </Card>
          ))}
          {(catsResponse?.data ?? []).filter((cat: Cat) => 
            cat.gender === 'MALE' && 
            cat.isInHouse && 
            calculateAgeInMonths(cat.birthDate) >= 10 &&
            !activeMales.some((am: Cat) => am.id === cat.id)
          ).length === 0 && (
            <Text ta="center" c="dimmed">
              追加可能なオス猫がいません
            </Text>
          )}
        </Stack>
      </Modal>

      {/* NGペアルール設定モーダル */}
      <Modal
        opened={rulesModalOpened}
        onClose={closeRulesModal}
        title="NGペアルール設定"
        size="lg"
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              交配時に警告を表示するルールを設定できます
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={openNewRuleModalWithName}
              size="sm"
            >
              新規ルール作成
            </Button>
          </Group>

          {(isNgRulesLoading || isNgRulesFetching) && (
            <Text size="sm" c="dimmed">
              NGルールを読み込み中です...
            </Text>
          )}

          {rulesError && (
            <Text size="sm" c="red">
              {rulesError}
            </Text>
          )}

          {ngPairingRules.map((rule: NgPairingRule) => (
            <Card key={rule.id} shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{rule.name}</Text>
                <Group gap="xs">
                  <Badge color={rule.active ? 'green' : 'gray'}>
                    {rule.active ? '有効' : '無効'}
                  </Badge>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="sm"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text size="sm" c="dimmed" mb="xs">
                {rule.description ?? '説明が設定されていません'}
              </Text>

              {/* ルールタイプ別の詳細表示 */}
              {rule.type === 'TAG_COMBINATION' && rule.maleConditions && rule.femaleConditions && (
                <Group gap="xs">
                  <Text size="xs">オス条件:</Text>
                  {rule.maleConditions.map((condition: string) => (
                    <Badge key={condition} variant="outline" size="xs" color="blue">
                      {condition}
                    </Badge>
                  ))}
                  <Text size="xs">メス条件:</Text>
                  {rule.femaleConditions.map((condition: string) => (
                    <Badge key={condition} variant="outline" size="xs" color="pink">
                      {condition}
                    </Badge>
                  ))}
                </Group>
              )}

              {rule.type === 'INDIVIDUAL_PROHIBITION' && rule.maleNames && rule.femaleNames && (
                <Group gap="xs">
                  <Text size="xs">禁止ペア:</Text>
                  {rule.maleNames.map((maleName: string, _index: number) => 
                    rule.femaleNames!.map((femaleName: string) => (
                      <Badge key={`${maleName}-${femaleName}`} variant="outline" size="xs" color="red">
                        {maleName} × {femaleName}
                      </Badge>
                    ))
                  )}
                </Group>
              )}

              {rule.type === 'GENERATION_LIMIT' && (
                <Text size="xs" c="dimmed">
                  近親係数制限: {rule.generationLimit}親等まで禁止
                </Text>
              )}
            </Card>
          ))}

          {ngPairingRules.length === 0 && (
            <Text ta="center" c="dimmed" py="md">
              NGルールが設定されていません
            </Text>
          )}
        </Stack>
      </Modal>

      {/* 新規ルール作成モーダル */}
      <Modal
        opened={newRuleModalOpened}
        onClose={closeNewRuleModal}
        title="NGルール新規作成"
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="ルール名"
            placeholder="例: 大型×小型禁止"
            value={newRule.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRule((prev: NewRuleState) => ({ ...prev, name: e.target.value }))}
            required
          />

          <Radio.Group
            label="ルールタイプ"
            value={newRule.type}
            onChange={(value: string) =>
              setNewRule((prev: NewRuleState) => ({ ...prev, type: (value as NgRuleType) ?? prev.type }))
            }
            required
          >
            <Stack gap="xs">
              <Radio value="TAG_COMBINATION" label="タグ組み合わせ禁止" />
              <Radio value="INDIVIDUAL_PROHIBITION" label="個別ペア禁止" />
              <Radio value="GENERATION_LIMIT" label="近親係数制限" />
            </Stack>
          </Radio.Group>

          {newRule.type === 'TAG_COMBINATION' && (
            <>
              <MultiSelect
                label="オス猫の条件タグ"
                data={availableTags.length > 0 ? availableTags : []}
                value={newRule.maleConditions}
                onChange={(value: string[]) => setNewRule((prev: NewRuleState) => ({ ...prev, maleConditions: value }))}
                placeholder="禁止するオス猫のタグを選択"
                required
              />
              <MultiSelect
                label="メス猫の条件タグ"
                data={availableTags.length > 0 ? availableTags : []}
                value={newRule.femaleConditions}
                onChange={(value: string[]) => setNewRule((prev: NewRuleState) => ({ ...prev, femaleConditions: value }))}
                placeholder="禁止するメス猫のタグを選択"
                required
              />
            </>
          )}

          {newRule.type === 'INDIVIDUAL_PROHIBITION' && (
            <>
              <MultiSelect
                label="禁止するオス猫"
                data={maleCats.filter((cat: Cat) => cat.name).map((cat: Cat) => ({ value: cat.name, label: cat.name }))}
                value={newRule.maleNames}
                onChange={(value: string[]) => setNewRule((prev: NewRuleState) => ({ ...prev, maleNames: value }))}
                placeholder="禁止するオス猫を選択"
                required
              />
              <MultiSelect
                label="禁止するメス猫"
                data={femaleCats.filter((cat: Cat) => cat.name).map((cat: Cat) => ({ value: cat.name, label: cat.name }))}
                value={newRule.femaleNames}
                onChange={(value: string[]) => setNewRule((prev: NewRuleState) => ({ ...prev, femaleNames: value }))}
                placeholder="禁止するメス猫を選択"
                required
              />
            </>
          )}

          {newRule.type === 'GENERATION_LIMIT' && (
            <NumberInput
              label="親等制限"
              description="指定した親等以内の近親交配を禁止します"
              value={newRule.generationLimit ?? 3}
              onChange={(value: string | number) =>
                setNewRule((prev: NewRuleState) => ({
                  ...prev,
                  generationLimit: typeof value === 'number' ? value : prev.generationLimit,
                }))
              }
              min={1}
              max={10}
              suffix="親等"
              required
            />
          )}

          <TextInput
            label="説明"
            placeholder="このルールの詳細説明（任意）"
            value={newRule.description}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewRule((prev: NewRuleState) => ({ ...prev, description: e.target.value }))}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={closeNewRuleModal}>
              キャンセル
            </Button>
            <Button 
              onClick={addNewRule}
              disabled={!isNewRuleValid() || createNgRuleMutation.isPending}
            >
              {createNgRuleMutation.isPending ? '作成中…' : 'ルール作成'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 出産情報入力モーダル */}
      <Modal
        opened={birthInfoModalOpened}
        onClose={() => {
          closeBirthInfoModal();
          setSelectedBirthPlan(null);
          setBirthCount(0);
          setDeathCount(0);
          setBirthDate(new Date().toISOString().split('T')[0]);
        }}
        title="出産情報の入力"
        size="md"
      >
        <Stack gap="md">
          {/* 両親の名前 */}
          <TextInput
            label="両親"
            value={selectedBirthPlan ? `${selectedBirthPlan.mother?.name || '不明'} (${
              selectedBirthPlan.fatherId 
                ? catsResponse?.data?.find((cat: Cat) => cat.id === selectedBirthPlan.fatherId)?.name || '不明'
                : '不明'
            })` : ''}
            readOnly
          />

          {/* 出産日 */}
          <TextInput
            label="出産日"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          {/* 出産頭数 */}
          <Group gap="sm" align="flex-end">
            <NumberInput
              label="出産頭数"
              value={birthCount}
              onChange={(value: string | number) => setBirthCount(typeof value === 'number' ? value : 0)}
              min={0}
              style={{ flex: 1 }}
            />
            <ActionIcon
              size="lg"
              variant="light"
              color="blue"
              onClick={() => setBirthCount(prev => prev + 1)}
              title="1頭追加"
            >
              <IconBabyCarriage size={20} />
            </ActionIcon>
          </Group>

          {/* 死亡数 */}
          <Group gap="sm" align="flex-end">
            <NumberInput
              label="死亡数"
              value={deathCount}
              onChange={(value: string | number) => setDeathCount(typeof value === 'number' ? value : 0)}
              min={0}
              style={{ flex: 1 }}
            />
            <ActionIcon
              size="lg"
              variant="light"
              color="grape"
              onClick={() => setDeathCount(prev => prev + 1)}
              title="1頭追加"
            >
              <IconRainbow size={20} />
            </ActionIcon>
          </Group>

          {/* アクションボタン */}
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: 子猫管理ページの子猫登録モーダルを開く
                console.log('詳細登録:', {
                  birthPlan: selectedBirthPlan,
                  birthCount,
                  deathCount,
                });
              }}
            >
              詳細登録
            </Button>
            <Button
              onClick={async () => {
                if (!selectedBirthPlan) return;
                
                try {
                  const birthDateStr = birthDate;
                  const aliveCount = birthCount - deathCount;
                  
                  // 1. BirthPlanを更新 (出産完了、actualKittensに生まれた総数を設定)
                  await updateBirthPlanMutation.mutateAsync({
                    id: selectedBirthPlan.id,
                    payload: {
                      status: 'BORN',
                      actualBirthDate: birthDateStr,
                      actualKittens: birthCount,
                    },
                  });
                  
                  // 2. 生存している子猫を作成
                  const createPromises: Promise<unknown>[] = [];
                  const motherName = selectedBirthPlan.mother?.name || '不明';
                  
                  for (let i = 0; i < aliveCount; i++) {
                    const catData: CreateCatRequest = {
                      name: `${motherName}${i + 1}号`,
                      gender: 'MALE', // TODO: 性別を指定できるようにする
                      birthDate: birthDateStr,
                      motherId: selectedBirthPlan.motherId,
                      fatherId: selectedBirthPlan.fatherId || undefined,
                      isInHouse: true,
                    };
                    
                    createPromises.push(createCatMutation.mutateAsync(catData));
                  }
                  
                  await Promise.all(createPromises);
                  
                  notifications.show({
                    title: '出産登録完了',
                    message: `${motherName}の出産情報を登録しました（出産: ${birthCount}頭、生存: ${aliveCount}頭、死亡: ${deathCount}頭）`,
                    color: 'green',
                  });
                  
                  closeBirthInfoModal();
                  setSelectedBirthPlan(null);
                  setBirthCount(0);
                  setDeathCount(0);
                  setBirthDate(new Date().toISOString().split('T')[0]);
                } catch (error) {
                  notifications.show({
                    title: 'エラー',
                    message: error instanceof Error ? error.message : '出産情報の登録に失敗しました',
                    color: 'red',
                  });
                }
              }}
              loading={updateBirthPlanMutation.isPending || createCatMutation.isPending}
            >
              登録
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 妊娠確認モーダル */}
      <Modal
        opened={pregnancyCheckModalOpened}
        onClose={() => {
          closePregnancyCheckModal();
          setSelectedPregnancyCheck(null);
          setPregnancyChecks({
            weightGain: false,
            pinking: false,
            palpation: false,
          });
        }}
        title="妊娠確認チェック"
        size="md"
      >
        <Stack gap="md">
          {/* 母猫情報 */}
          <TextInput
            label="母猫"
            value={selectedPregnancyCheck?.mother?.name || '不明'}
            readOnly
          />

          {/* チェックリスト */}
          <Stack gap="sm">
            <Text size="sm" fw={500}>妊娠兆候</Text>
            <Checkbox
              label="体重増加"
              checked={pregnancyChecks.weightGain}
              onChange={(e) => setPregnancyChecks(prev => ({ ...prev, weightGain: e.target.checked }))}
            />
            <Checkbox
              label="ピンキング（乳首の色が濃くなる）"
              checked={pregnancyChecks.pinking}
              onChange={(e) => setPregnancyChecks(prev => ({ ...prev, pinking: e.target.checked }))}
            />
            <Checkbox
              label="触診（お腹が膨らんでいる）"
              checked={pregnancyChecks.palpation}
              onChange={(e) => setPregnancyChecks(prev => ({ ...prev, palpation: e.target.checked }))}
            />
          </Stack>

          {/* アクションボタン */}
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="outline"
              onClick={() => {
                closePregnancyCheckModal();
                setSelectedPregnancyCheck(null);
                setPregnancyChecks({
                  weightGain: false,
                  pinking: false,
                  palpation: false,
                });
              }}
            >
              キャンセル
            </Button>
            <Button
              color="green"
              onClick={handleConfirmPregnancy}
              loading={createBirthPlanMutation.isPending || deletePregnancyCheckMutation.isPending}
            >
              妊娠確定
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 交配スケジュール編集モーダル */}
      <BreedingScheduleEditModal
        opened={scheduleEditModalOpened}
        onClose={closeScheduleEditModal}
        schedule={selectedScheduleForEdit}
        availableFemales={(catsResponse?.data ?? []).filter((cat: Cat) => 
          cat.gender === 'FEMALE' &&
          cat.isInHouse &&
          calculateAgeInMonths(cat.birthDate) >= 11
        )}
        onSave={handleUpdateScheduleDuration}
        onDelete={handleDeleteSchedule}
      />

      {/* 子猫処遇登録モーダル */}
      <KittenDispositionModal
        opened={dispositionModalOpened}
        onClose={() => {
          closeDispositionModal();
          setSelectedKitten(null);
        }}
        kitten={selectedKitten}
        dispositionType={selectedDispositionType}
        onSubmit={handleKittenDispositionSubmit}
        loading={createKittenDispositionMutation.isPending}
      />

      {/* 出産記録完了確認モーダル */}
      <Modal
        opened={completeConfirmModalOpened}
        onClose={closeCompleteConfirmModal}
        title="出産記録を完了しますか？"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            {selectedBirthPlanForComplete?.mother?.name || '不明'}の出産記録を完了します。
            完了後は子育て中タブから削除され、母猫詳細ページの出産記録に格納されます。
          </Text>
          <Text size="sm" c="dimmed">
            この操作は元に戻せません。
          </Text>
          <Group justify="flex-end" gap="sm" mt="md">
            <Button
              variant="outline"
              onClick={closeCompleteConfirmModal}
            >
              キャンセル
            </Button>
            <Button
              color="blue"
              onClick={() => {
                if (selectedBirthPlanForComplete) {
                  completeBirthRecordMutation.mutate(selectedBirthPlanForComplete.id, {
                    onSuccess: () => {
                      closeCompleteConfirmModal();
                      setSelectedBirthPlanForComplete(null);
                    },
                  });
                }
              }}
              loading={completeBirthRecordMutation.isPending}
            >
              完了する
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
