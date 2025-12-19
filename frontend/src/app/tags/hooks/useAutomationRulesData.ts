'use client';

import { useMemo } from 'react';

import {
  useGetAutomationRules,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  useExecuteAutomationRule,
} from '@/lib/api/hooks/use-tag-automation';

/**
 * 自動化ルールのデータ取得・ミューテーション用フック
 */
export function useAutomationRulesData() {
  // データ取得
  const { data: automationRulesData, isLoading: isLoadingAutomationRules } = useGetAutomationRules();

  // ルールリストを整形
  const automationRules = useMemo(() => automationRulesData?.data ?? [], [automationRulesData]);

  // ミューテーション
  const createAutomationRule = useCreateAutomationRule();
  const updateAutomationRule = useUpdateAutomationRule();
  const deleteAutomationRule = useDeleteAutomationRule();
  const executeAutomationRule = useExecuteAutomationRule();

  return {
    // データ
    isLoadingAutomationRules,
    automationRules,
    // ミューテーション
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    executeAutomationRule,
  };
}

