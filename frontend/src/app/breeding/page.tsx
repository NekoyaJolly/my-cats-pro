'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Group,
} from '@mantine/core';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { 
  IconHeart, 
  IconCalendar,
  IconPaw,
  IconBabyCarriage,
  IconScale,
  IconTruck,
  IconSettings,
} from '@tabler/icons-react';

import { BreedingScheduleEditModal } from '@/components/breeding/breeding-schedule-edit-modal';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { TabsSection } from '@/components/TabsSection';
import { useContextMenu } from '@/components/context-menu';
import { ActionButton } from '@/components/ActionButton';

import {
  useGetBreedingNgRules,
  useCreateBreedingNgRule,
  useDeleteBreedingNgRule,
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
} from '@/lib/api/hooks/use-breeding';
import { useGetCats, useCreateCat, type Cat, type CreateCatRequest } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';

// 分割したコンポーネント
import {
  BreedingScheduleTab,
  PregnancyCheckTab,
  BirthPlanTab,
  RaisingTab,
  WeightTab,
  ShippingTab,
  MaleSelectionModal,
  FemaleSelectionModal,
  BirthInfoModal,
  NgRulesModal,
  NewRuleModal,
  CompleteConfirmModal,
} from './components';

// カスタムフック
import { useBreedingSchedule } from './hooks';
import { useNgPairing } from './hooks/useNgPairing';

// 型定義
import type { BreedingScheduleEntry, NgPairingRule, NewRuleState } from './types';
import { calculateAgeInMonths } from './utils';

export default function BreedingPage() {
  const { setPageHeader } = usePageHeader();
  
  // カスタムフックから状態を取得
  const {
    breedingSchedule,
    activeMales,
    selectedYear,
    selectedMonth,
    defaultDuration,
    setBreedingSchedule,
    setSelectedYear,
    setSelectedMonth,
    setDefaultDuration,
    addMale,
    removeMale,
    getMatingCheckCount,
    addMatingCheck,
    clearScheduleData,
  } = useBreedingSchedule();

  const [activeTab, setActiveTab] = useState('schedule');
  const [isFullscreen] = useState(false);
  const [selectedMaleForEdit, setSelectedMaleForEdit] = useState<string | null>(null);

  const [selectedMale, setSelectedMale] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [availableFemales, setAvailableFemales] = useState<Cat[]>([]);
  
  // モーダル状態
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [maleModalOpened, { open: openMaleModal, close: closeMaleModal }] = useDisclosure(false);
  const [rulesModalOpened, { open: openRulesModal, close: closeRulesModal }] = useDisclosure(false);
  const [newRuleModalOpened, { open: openNewRuleModal, close: closeNewRuleModal }] = useDisclosure(false);
  const [birthInfoModalOpened, { open: openBirthInfoModal, close: closeBirthInfoModal }] = useDisclosure(false);
  const [scheduleEditModalOpened, { open: openScheduleEditModal, close: closeScheduleEditModal }] = useDisclosure(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<BreedingScheduleEntry | null>(null);
  const [managementModalOpened, { open: openManagementModal, close: closeManagementModal }] = useDisclosure(false);
  const [selectedMotherIdForModal, setSelectedMotherIdForModal] = useState<string | undefined>();
  const [completeConfirmModalOpened, { open: openCompleteConfirmModal, close: closeCompleteConfirmModal }] = useDisclosure(false);
  const [selectedBirthPlanForComplete, setSelectedBirthPlanForComplete] = useState<BirthPlan | null>(null);

  // 出産情報モーダルの状態
  const [selectedBirthPlan, setSelectedBirthPlan] = useState<BirthPlan | null>(null);
  const [birthCount, setBirthCount] = useState<number>(0);
  const [deathCount, setDeathCount] = useState<number>(0);
  const [birthDate, setBirthDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expandedRaisingCats, setExpandedRaisingCats] = useState<Set<string>>(new Set());

  // NGルール状態
  const [ngPairingRules, setNgPairingRules] = useState<NgPairingRule[]>([]);
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

  // コンテキストメニュー
  const {
    handleAction: handleScheduleContextAction,
  } = useContextMenu<BreedingScheduleEntry>({
    edit: (schedule) => {
      if (schedule) {
        setSelectedScheduleForEdit(schedule);
        openScheduleEditModal();
      }
    },
    delete: (schedule) => {
      if (schedule) {
        setSelectedScheduleForEdit(schedule);
        handleDeleteSchedule();
      }
    },
  });

  // API hooks
  const catsQuery = useGetCats({ limit: 1000 }, { enabled: true });
  const { data: catsResponse } = catsQuery;
  const tagCategoriesQuery = useGetTagCategories();
  const ngRulesQuery = useGetBreedingNgRules();
  const { data: ngRulesResponse, isLoading: isNgRulesLoading, isFetching: isNgRulesFetching, error: ngRulesError } = ngRulesQuery;

  const pregnancyChecksQuery = useGetPregnancyChecks();
  const { data: pregnancyChecksResponse } = pregnancyChecksQuery;
  const createPregnancyCheckMutation = useCreatePregnancyCheck();
  const deletePregnancyCheckMutation = useDeletePregnancyCheck();

  const birthPlansQuery = useGetBirthPlans();
  const { data: birthPlansResponse } = birthPlansQuery;
  const createBirthPlanMutation = useCreateBirthPlan();
  const deleteBirthPlanMutation = useDeleteBirthPlan();
  const updateBirthPlanMutation = useUpdateBirthPlan();
  const createCatMutation = useCreateCat();
  const completeBirthRecordMutation = useCompleteBirthRecord();

  const createNgRuleMutation = useCreateBreedingNgRule();
  const deleteNgRuleMutation = useDeleteBreedingNgRule();

  // NGペアリングフック
  const { isNGPairing, findMatchingRule } = useNgPairing({
    activeMales,
    allCats: catsResponse?.data ?? [],
    ngPairingRules,
  });

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      '交配管理',
      <Group gap="sm">
        <ActionButton
          action="view"
          customIcon={<IconSettings size={18} />}
          onClick={openRulesModal}
        >
          NG設定
        </ActionButton>
      </Group>
    );

    return () => {
      setPageHeader(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // NGルールの読み込み
  useEffect(() => {
    if (!ngRulesResponse) return;
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

  // 利用可能なタグ一覧
  const availableTags: string[] = [...new Set(
    (catsResponse?.data ?? [])
      .flatMap((cat: Cat) => cat.tags?.map((catTag) => catTag.tag.name).filter((name: string) => name) ?? [])
      .filter((name: string) => name)
  )];

  // オス猫追加
  const handleAddMale = (maleData: Cat) => {
    addMale(maleData);
    closeMaleModal();
  };

  // オス猫削除
  const handleRemoveMale = (maleId: string) => {
    removeMale(maleId);
    setSelectedMaleForEdit(null);
  };

  // オス猫選択時に交配可能メス一覧を表示
  const handleMaleSelect = (maleId: string, date: string) => {
    setSelectedMale(maleId);
    setSelectedDate(date);
    setSelectedDuration(defaultDuration);
    
    const available = (catsResponse?.data ?? []).filter((cat: Cat) => 
      cat.gender === 'FEMALE' &&
      cat.isInHouse &&
      calculateAgeInMonths(cat.birthDate) >= 11
    );
    setAvailableFemales(available);
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
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + 21);
      
      const payload = {
        motherId: femaleId,
        fatherId: maleId,
        matingDate: matingDate,
        checkDate: checkDate.toISOString().split('T')[0],
        status: 'SUSPECTED' as const,
        notes: `${male?.name || ''}との交配による妊娠疑い`,
      };
      
      createPregnancyCheckMutation.mutate(payload, {
        onSuccess: async () => {
          setBreedingSchedule((prev: Record<string, BreedingScheduleEntry>) => {
            const newSchedule = { ...prev };
            Object.keys(newSchedule).forEach(key => {
              if (key.includes(maleId) && newSchedule[key].femaleName === femaleName && !newSchedule[key].isHistory) {
                newSchedule[key] = {
                  ...newSchedule[key],
                  isHistory: true,
                  result: ''
                };
              }
            });
            return newSchedule;
          });
          
          await pregnancyChecksQuery.refetch();
        },
        onError: (error: Error) => {
          let errorMessage = '妊娠確認中リストへの登録に失敗しました';
          if (error.message) {
            errorMessage = error.message;
          }
          
          notifications.show({
            title: '登録失敗',
            message: errorMessage,
            color: 'red',
            autoClose: 15000,
          });
        }
      });
    } else {
      setBreedingSchedule((prev: Record<string, BreedingScheduleEntry>) => {
        const newSchedule = { ...prev };
        Object.keys(newSchedule).forEach(key => {
          if (key.includes(maleId) && newSchedule[key].femaleName === femaleName && !newSchedule[key].isHistory) {
            newSchedule[key] = {
              ...newSchedule[key],
              isHistory: true,
              result: ''
            };
          }
        });
        return newSchedule;
      });
    }
  };

  // 交配期間とメス猫の更新
  const handleUpdateScheduleDuration = (newDuration: number, newFemaleId?: string) => {
    if (!selectedScheduleForEdit) return;

    const { maleId, femaleId, date, duration: oldDuration, dayIndex } = selectedScheduleForEdit;
    
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayIndex);
    
    let newFemaleName = selectedScheduleForEdit.femaleName;
    let finalFemaleId = femaleId;
    
    if (newFemaleId && newFemaleId !== femaleId) {
      const newFemale = catsResponse?.data?.find((f: Cat) => f.id === newFemaleId);
      if (newFemale) {
        newFemaleName = newFemale.name;
        finalFemaleId = newFemaleId;
      }
    }
    
    const newSchedule: Record<string, BreedingScheduleEntry> = {};
    
    for (let i = 0; i < newDuration; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
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
    
    setBreedingSchedule((prev) => {
      const updated = { ...prev };
      
      for (let i = 0; i < oldDuration; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const scheduleKey = `${maleId}-${dateStr}`;
        delete updated[scheduleKey];
      }
      
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
    
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - dayIndex);
    
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
        if (otherMale.id === selectedMale) return;
        
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
        const ngRule = findMatchingRule(selectedMale, femaleId);
        
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
        
        const existingPair = breedingSchedule[scheduleKey];
        if (existingPair && index === 0) {
          const success = window.confirm(`前回のペア（${male.name} × ${existingPair.femaleName}）は成功しましたか？`);
          
          if (success) {
            const checkDate = new Date(selectedDate);
            checkDate.setDate(checkDate.getDate() + 21);
            
            createPregnancyCheckMutation.mutate({
              motherId: femaleId,
              checkDate: checkDate.toISOString().split('T')[0],
              status: 'SUSPECTED',
              notes: `${male.name}との交配による妊娠疑い`,
            });
          }
          
          newSchedules[scheduleKey] = {
            ...existingPair,
            isHistory: true,
            result: success ? '成功' : '失敗',
          };
        } else if (!existingPair) {
          newSchedules[scheduleKey] = {
            maleId: selectedMale,
            maleName: male.name,
            femaleId: femaleId,
            femaleName: female.name,
            date: dateStr,
            duration: selectedDuration,
            dayIndex: index,
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
      const expectedDate = new Date(checkItem.matingDate || checkItem.checkDate);
      expectedDate.setDate(expectedDate.getDate() + 63);
      
      createBirthPlanMutation.mutate({
        motherId: checkItem.motherId,
        fatherId: checkItem.fatherId ?? undefined,
        matingDate: checkItem.matingDate ?? undefined,
        expectedBirthDate: expectedDate.toISOString().split('T')[0],
        status: 'EXPECTED',
        notes: '妊娠確認による出産予定',
      }, {
        onSuccess: async () => {
          await deletePregnancyCheckMutation.mutateAsync(checkItem.id);
          await Promise.all([
            pregnancyChecksQuery.refetch(),
            birthPlansQuery.refetch(),
          ]);
        }
      });
    } else {
      deletePregnancyCheckMutation.mutate(checkItem.id, {
        onSuccess: () => {
          pregnancyChecksQuery.refetch();
        }
      });
    }
  };

  // 出産確認
  const handleBirthConfirm = (item: BirthPlan) => {
    setSelectedBirthPlan(item);
    setBirthCount(0);
    setDeathCount(0);
    setBirthDate(new Date().toISOString().split('T')[0]);
    openBirthInfoModal();
  };

  // 出産キャンセル
  const handleBirthCancel = (item: BirthPlan) => {
    deleteBirthPlanMutation.mutate(item.id);
  };

  // 出産情報登録
  const handleBirthInfoSubmit = async () => {
    if (!selectedBirthPlan) return;
    
    try {
      const birthDateStr = birthDate;
      const aliveCount = birthCount - deathCount;
      
      await updateBirthPlanMutation.mutateAsync({
        id: selectedBirthPlan.id,
        payload: {
          status: 'BORN',
          actualBirthDate: birthDateStr,
          actualKittens: birthCount,
        },
      });
      
      const createPromises: Promise<unknown>[] = [];
      const motherName = selectedBirthPlan.mother?.name || '不明';
      
      for (let i = 0; i < aliveCount; i++) {
        const catData: CreateCatRequest = {
          name: `${motherName}${i + 1}号`,
          gender: 'MALE',
          birthDate: birthDateStr,
          motherId: selectedBirthPlan.motherId,
          fatherId: selectedBirthPlan.fatherId || undefined,
          isInHouse: true,
        };
        
        createPromises.push(createCatMutation.mutateAsync(catData));
      }
      
      await Promise.all(createPromises);
      
      await Promise.all([
        catsQuery.refetch(),
        birthPlansQuery.refetch(),
      ]);
      
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
  };

  // NGルール削除
  const handleDeleteRule = (rule: NgPairingRule) => {
    if (confirm(`ルール「${rule.name}」を削除しますか？`)) {
      deleteNgRuleMutation.mutate(rule.id, {
        onSuccess: () => {
          notifications.show({
            title: 'ルール削除成功',
            message: `${rule.name}を削除しました`,
            color: 'green',
          });
        },
        onError: (error) => {
          notifications.show({
            title: 'エラー',
            message: error instanceof Error ? error.message : 'ルールの削除に失敗しました',
            color: 'red',
          });
        },
      });
    }
  };

  // NGルール作成
  const handleCreateRule = () => {
    if (!newRule.name.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'ルール名を入力してください',
        color: 'red',
      });
      return;
    }

    const ruleData: CreateBreedingNgRuleRequest = {
      name: newRule.name.trim(),
      type: newRule.type,
      description: newRule.description.trim() || undefined,
      maleNames: newRule.maleNames,
      femaleNames: newRule.femaleNames,
      maleConditions: newRule.maleConditions,
      femaleConditions: newRule.femaleConditions,
      generationLimit: newRule.type === 'GENERATION_LIMIT' ? (newRule.generationLimit ?? undefined) : undefined,
      active: true,
    };

    createNgRuleMutation.mutate(ruleData, {
      onSuccess: () => {
        notifications.show({
          title: 'ルール作成成功',
          message: `${newRule.name}を作成しました`,
          color: 'green',
        });
        closeNewRuleModal();
    setNewRule({
          name: '',
      type: 'TAG_COMBINATION',
      maleNames: [],
      femaleNames: [],
      maleConditions: [],
      femaleConditions: [],
      generationLimit: 3,
      description: '',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'エラー',
          message: error instanceof Error ? error.message : 'ルールの作成に失敗しました',
          color: 'red',
        });
      },
    });
  };

  // 子育て中タブの展開切り替え
  const handleToggleExpand = (motherId: string) => {
    const newExpanded = new Set(expandedRaisingCats);
    if (newExpanded.has(motherId)) {
      newExpanded.delete(motherId);
    } else {
      newExpanded.add(motherId);
    }
    setExpandedRaisingCats(newExpanded);
  };

  // 出産記録完了
  const handleComplete = (birthPlan: BirthPlan) => {
    setSelectedBirthPlanForComplete(birthPlan);
    openCompleteConfirmModal();
  };

  // 出産記録完了確定
  const handleCompleteConfirm = () => {
    if (selectedBirthPlanForComplete) {
      completeBirthRecordMutation.mutate(selectedBirthPlanForComplete.id, {
        onSuccess: () => {
          closeCompleteConfirmModal();
          setSelectedBirthPlanForComplete(null);
        },
      });
    }
  };

  // 子猫管理モーダルを開く
  const handleOpenManagementModal = (motherId: string) => {
    setSelectedMotherIdForModal(motherId);
    openManagementModal();
  };

  // 子育て中タブの母猫数を計算
  const mothersWithKittensCount = (catsResponse?.data || []).filter((cat: Cat) => {
    const hasYoungKittens = (catsResponse?.data || []).some((kitten: Cat) => {
      if (kitten.motherId !== cat.id) return false;
      
      const birthDateObj = new Date(kitten.birthDate);
      const now = new Date();
      const ageInMonths = (now.getTime() - birthDateObj.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      return ageInMonths <= 3;
    });
    
    return hasYoungKittens;
  }).length;

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
      <Container 
        size={isFullscreen ? "100%" : "xl"} 
        style={{ 
          height: isFullscreen ? 'calc(100vh - 80px)' : 'auto',
          overflow: isFullscreen ? 'hidden' : 'visible',
        }}
      >
        <TabsSection
          value={activeTab}
          onChange={setActiveTab}
          mb="md"
          tabs={[
            {
              value: 'schedule',
              label: '交配管理',
              icon: <IconCalendar size={16} />,
            },
            {
              value: 'pregnancy',
              label: '妊娠確認',
              icon: <IconHeart size={16} />,
              count: pregnancyChecksResponse?.data?.length || 0,
              badgeColor: 'pink',
            },
            {
              value: 'birth',
              label: '出産予定',
              icon: <IconPaw size={16} />,
              count: birthPlansResponse?.data?.filter((item: BirthPlan) => item.status === 'EXPECTED').length || 0,
              badgeColor: 'orange',
            },
            {
              value: 'raising',
              label: '子育て中',
              icon: <IconBabyCarriage size={16} />,
              count: mothersWithKittensCount || 0,
              badgeColor: 'grape',
            },
            {
              value: 'weight',
              label: '体重管理',
              icon: <IconScale size={16} />,
              badgeColor: 'cyan',
            },
            {
              value: 'shipping',
              label: '出荷準備',
              icon: <IconTruck size={16} />,
              badgeColor: 'green',
            },
          ]}
        >
          <>
            {activeTab === 'schedule' && (
              <Box pt="md">
                <BreedingScheduleTab
                  isFullscreen={isFullscreen}
                  selectedYear={selectedYear}
                  selectedMonth={selectedMonth}
                  activeMales={activeMales}
                  breedingSchedule={breedingSchedule}
                  selectedMaleForEdit={selectedMaleForEdit}
                  onYearChange={setSelectedYear}
                  onMonthChange={setSelectedMonth}
                  onOpenMaleModal={openMaleModal}
                  onMaleSelect={handleMaleSelect}
                  onMaleNameClick={(maleId) => setSelectedMaleForEdit(selectedMaleForEdit === maleId ? null : maleId)}
                  onRemoveMale={handleRemoveMale}
                  onSaveMaleEdit={() => setSelectedMaleForEdit(null)}
                  onMatingCheck={addMatingCheck}
                  onMatingResult={handleMatingResult}
                  onScheduleContextAction={handleScheduleContextAction}
                  onClearData={clearScheduleData}
                  getMatingCheckCount={getMatingCheckCount}
                />
              </Box>
            )}

            {activeTab === 'pregnancy' && (
              <Box pt="md">
                <PregnancyCheckTab
                  pregnancyChecks={pregnancyChecksResponse?.data || []}
                  allCats={catsResponse?.data || []}
                  onPregnancyCheck={handlePregnancyCheck}
                />
              </Box>
            )}

            {activeTab === 'birth' && (
              <Box pt="md">
                <BirthPlanTab
                  birthPlans={birthPlansResponse?.data || []}
                  allCats={catsResponse?.data || []}
                  onBirthConfirm={handleBirthConfirm}
                  onBirthCancel={handleBirthCancel}
                />
              </Box>
            )}

            {activeTab === 'raising' && (
              <Box pt="md">
                <RaisingTab
                  allCats={catsResponse?.data || []}
                  birthPlans={birthPlansResponse?.data || []}
                  tagCategories={tagCategoriesQuery.data?.data || []}
                  expandedRaisingCats={expandedRaisingCats}
                  isLoading={catsQuery.isLoading}
                  onToggleExpand={handleToggleExpand}
                  onComplete={handleComplete}
                  onOpenManagementModal={handleOpenManagementModal}
                />
              </Box>
            )}

            {activeTab === 'weight' && (
              <Box pt="md">
                <WeightTab
                  allCats={catsResponse?.data || []}
                  birthPlans={birthPlansResponse?.data || []}
                  isLoading={catsQuery.isLoading}
                  onRefetch={() => {
                    if (catsQuery.refetch) catsQuery.refetch();
                  }}
                />
              </Box>
            )}

            {activeTab === 'shipping' && (
              <Box pt="md">
                <ShippingTab
                  allCats={catsResponse?.data || []}
                  birthPlans={birthPlansResponse?.data || []}
                  isLoading={catsQuery.isLoading}
                  onRefetch={() => {
                    if (catsQuery.refetch) catsQuery.refetch();
                    if (birthPlansQuery.refetch) birthPlansQuery.refetch();
                  }}
                />
              </Box>
            )}
          </>
        </TabsSection>
      </Container>

      {/* モーダル群 */}
      <FemaleSelectionModal
        opened={modalOpened}
        onClose={closeModal}
        selectedMale={activeMales.find((m) => m.id === selectedMale) || null}
        availableFemales={availableFemales}
        selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration}
        onSetDefaultDuration={handleSetDefaultDuration}
        onSelectFemale={handleAddFemaleToSchedule}
        isNGPairing={isNGPairing}
      />

      <MaleSelectionModal
        opened={maleModalOpened}
        onClose={closeMaleModal}
        allCats={catsResponse?.data || []}
        activeMales={activeMales}
        onAddMale={handleAddMale}
      />

      <BirthInfoModal
        opened={birthInfoModalOpened}
        onClose={() => {
          closeBirthInfoModal();
          setSelectedBirthPlan(null);
          setBirthCount(0);
          setDeathCount(0);
          setBirthDate(new Date().toISOString().split('T')[0]);
        }}
        selectedBirthPlan={selectedBirthPlan}
        allCats={catsResponse?.data || []}
        birthCount={birthCount}
        deathCount={deathCount}
        birthDate={birthDate}
        onBirthCountChange={setBirthCount}
        onDeathCountChange={setDeathCount}
        onBirthDateChange={setBirthDate}
        onSubmit={handleBirthInfoSubmit}
        onDetailSubmit={() => {
                console.log('詳細登録:', {
                  birthPlan: selectedBirthPlan,
                  birthCount,
                  deathCount,
                });
              }}
        isLoading={updateBirthPlanMutation.isPending || createCatMutation.isPending}
      />

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

      <KittenManagementModal
        opened={managementModalOpened}
        onClose={closeManagementModal}
        motherId={selectedMotherIdForModal}
        onSuccess={() => {
          if (catsQuery.refetch) catsQuery.refetch();
          if (birthPlansQuery.refetch) birthPlansQuery.refetch();
        }}
      />

      <CompleteConfirmModal
        opened={completeConfirmModalOpened}
        onClose={closeCompleteConfirmModal}
        selectedBirthPlan={selectedBirthPlanForComplete}
        onConfirm={handleCompleteConfirm}
        isLoading={completeBirthRecordMutation.isPending}
      />

      <NgRulesModal
        opened={rulesModalOpened}
        onClose={closeRulesModal}
        ngPairingRules={ngPairingRules}
        isLoading={isNgRulesLoading || isNgRulesFetching}
        error={rulesError}
        onOpenNewRuleModal={openNewRuleModal}
        onDeleteRule={handleDeleteRule}
      />

      <NewRuleModal
        opened={newRuleModalOpened}
        onClose={closeNewRuleModal}
        newRule={newRule}
        onRuleChange={setNewRule}
        availableTags={availableTags}
        allCats={catsResponse?.data || []}
        onSubmit={handleCreateRule}
        isLoading={createNgRuleMutation.isPending}
      />
    </Box>
  );
}
