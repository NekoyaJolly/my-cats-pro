import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import { apiClient, type ApiResponse } from '../client';
import { createDomainQueryKeys } from './query-key-factory';
import { tagCategoryKeys } from './use-tags';

// 型定義
export type TagAutomationTriggerType = 'EVENT' | 'SCHEDULE' | 'MANUAL';
export type TagAutomationEventType =
  | 'BREEDING_PLANNED'
  | 'BREEDING_CONFIRMED'
  | 'PREGNANCY_CONFIRMED'
  | 'KITTEN_REGISTERED'
  | 'AGE_THRESHOLD'
  | 'CUSTOM';
export type TagAutomationRunStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface TagAutomationRule {
  id: string;
  key: string;
  name: string;
  description?: string;
  triggerType: TagAutomationTriggerType;
  eventType?: TagAutomationEventType;
  scope?: string;
  config?: Record<string, unknown>;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    runs?: number;
    assignmentHistory?: number;
  };
}

export interface TagAutomationRun {
  id: string;
  ruleId: string;
  status: TagAutomationRunStatus;
  eventPayload?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CreateTagAutomationRuleRequest {
  key: string;
  name: string;
  description?: string;
  triggerType: TagAutomationTriggerType;
  eventType?: TagAutomationEventType;
  scope?: string;
  config?: Record<string, unknown>;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateTagAutomationRuleRequest {
  name?: string;
  description?: string;
  triggerType?: TagAutomationTriggerType;
  eventType?: TagAutomationEventType;
  scope?: string;
  config?: Record<string, unknown>;
  priority?: number;
  isActive?: boolean;
}

export interface TagAutomationRuleFilters {
  active?: boolean;
  scope?: string;
  triggerType?: TagAutomationTriggerType;
  eventType?: TagAutomationEventType;
}

export type TagAutomationRulesResponse = ApiResponse<TagAutomationRule[]>;
export type TagAutomationRuleResponse = ApiResponse<TagAutomationRule>;
export type TagAutomationRunsResponse = ApiResponse<TagAutomationRun[]>;

const automationRuleKeys = createDomainQueryKeys<string, TagAutomationRuleFilters>(
  'tagAutomationRules',
);

export { automationRuleKeys };

function buildAutomationRuleQuery(
  filters?: TagAutomationRuleFilters,
): Record<string, string> | undefined {
  if (!filters) {
    return undefined;
  }

  const query: Record<string, string> = {};

  if (filters.active !== undefined) {
    query.active = filters.active.toString();
  }

  if (filters.scope) {
    query.scope = filters.scope;
  }

  if (filters.triggerType) {
    query.triggerType = filters.triggerType;
  }

  if (filters.eventType) {
    query.eventType = filters.eventType;
  }

  return Object.keys(query).length > 0 ? query : undefined;
}

function showErrorNotification(title: string, error: unknown) {
  notifications.show({
    title,
    message: error instanceof Error ? error.message : '時間をおいて再度お試しください。',
    color: 'red',
  });
}

// ルール一覧取得
export function useGetAutomationRules(
  filters?: TagAutomationRuleFilters,
  options?: Omit<UseQueryOptions<TagAutomationRulesResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: automationRuleKeys.list(filters),
    queryFn: async () => {
      try {
        const query = buildAutomationRuleQuery(filters);
        const response = await apiClient.get('/tags/automation/rules', {
          query: query as unknown as Record<string, never> | undefined,
        });

        // Validate response.data is an array
        if (!response.data || !Array.isArray(response.data)) {
          return { ...response, data: [] } satisfies TagAutomationRulesResponse;
        }

        return response as TagAutomationRulesResponse;
      } catch (error) {
        console.error('Failed to fetch automation rules:', error);
        throw error;
      }
    },
    ...options,
  });
}

// ルール詳細取得
export function useGetAutomationRule(
  ruleId: string,
  options?: Omit<UseQueryOptions<TagAutomationRuleResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: automationRuleKeys.detail(ruleId),
    queryFn: async () => {
      try {
        const response = await apiClient.get('/tags/automation/rules/{id}', {
          pathParams: { id: ruleId },
          query: {
            includeRuns: 'true',
            includeHistoryCount: 'true',
          } as unknown as Record<string, never>,
        });

        return response as TagAutomationRuleResponse;
      } catch (error) {
        console.error('Failed to fetch automation rule:', error);
        throw error;
      }
    },
    enabled: !!ruleId,
    ...options,
  });
}

// ルール作成
export function useCreateAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTagAutomationRuleRequest) =>
      apiClient.post('/tags/automation/rules', {
        body: payload as unknown as never,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: automationRuleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: '自動化ルールを作成しました',
        message: '新しいルールが利用可能になりました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('ルールの作成に失敗しました', error);
    },
  });
}

// ルール更新
export function useUpdateAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagAutomationRuleRequest }) =>
      apiClient.patch('/tags/automation/rules/{id}', {
        pathParams: { id },
        body: payload as unknown as never,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: automationRuleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: '自動化ルールを更新しました',
        message: 'ルール情報を保存しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('ルールの更新に失敗しました', error);
    },
  });
}

// ルール削除
export function useDeleteAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete('/tags/automation/rules/{id}', {
        pathParams: { id },
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: automationRuleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: tagCategoryKeys.lists() });
      notifications.show({
        title: '自動化ルールを削除しました',
        message: 'ルールを削除しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('ルールの削除に失敗しました', error);
    },
  });
}

// 実行履歴取得
export function useGetAutomationRuns(
  filters?: { ruleId?: string; status?: TagAutomationRunStatus; limit?: number },
  options?: Omit<UseQueryOptions<TagAutomationRunsResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['tagAutomationRuns', filters],
    queryFn: async () => {
      try {
        const query: Record<string, string> = {};
        if (filters?.ruleId) query.ruleId = filters.ruleId;
        if (filters?.status) query.status = filters.status;
        if (filters?.limit) query.limit = filters.limit.toString();

        const response = await apiClient.get('/tags/automation/runs', {
          query: Object.keys(query).length > 0 ? (query as unknown as Record<string, never>) : undefined,
        });

        if (!response.data || !Array.isArray(response.data)) {
          return { ...response, data: [] } satisfies TagAutomationRunsResponse;
        }

        return response as TagAutomationRunsResponse;
      } catch (error) {
        console.error('Failed to fetch automation runs:', error);
        throw error;
      }
    },
    ...options,
  });
}

// 手動実行
export function useExecuteAutomationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dryRun = false }: { id: string; dryRun?: boolean }) =>
      apiClient.post('/tags/automation/rules/{id}/execute', {
        pathParams: { id },
        query: dryRun ? ({ dryRun: 'true' } as unknown as Record<string, never>) : undefined,
        retryOnUnauthorized: false,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: automationRuleKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['tagAutomationRuns'] });
      notifications.show({
        title: 'ルールを実行しました',
        message: '実行が完了しました。',
        color: 'teal',
      });
    },
    onError: (error: unknown) => {
      showErrorNotification('ルールの実行に失敗しました', error);
    },
  });
}
