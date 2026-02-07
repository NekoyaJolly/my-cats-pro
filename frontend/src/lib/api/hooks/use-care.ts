/**
 * ケアスケジュールAPIフック
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  apiClient,
  type ApiPathParams,
  type ApiQueryParams,
  type ApiRequestBody,
  type ApiSuccessData,
} from '../client';
import { createDomainQueryKeys } from './query-key-factory';

export type CareType =
  | 'VACCINATION'
  | 'HEALTH_CHECK'
  | 'GROOMING'
  | 'DENTAL_CARE'
  | 'MEDICATION'
  | 'SURGERY'
  | 'OTHER';

export type CareScheduleStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type ReminderTimingType = 'ABSOLUTE' | 'RELATIVE';
export type ReminderOffsetUnit = 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
export type ReminderRelativeTo = 'START_DATE' | 'END_DATE' | 'CUSTOM_DATE';
export type ReminderChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH';
export type ReminderRepeatFrequency = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';

export interface CareScheduleCat {
  id: string;
  name: string;
}

export interface CareScheduleReminder {
  id: string;
  timingType: ReminderTimingType;
  remindAt?: string | null;
  offsetValue?: number | null;
  offsetUnit?: ReminderOffsetUnit | null;
  relativeTo?: ReminderRelativeTo | null;
  channel: ReminderChannel;
  repeatFrequency?: ReminderRepeatFrequency | null;
  repeatInterval?: number | null;
  repeatCount?: number | null;
  repeatUntil?: string | null;
  notes?: string | null;
  isActive: boolean;
}

export interface CareScheduleTag {
  id: string;
  slug: string;
  label: string;
  level: number;
  parentId?: string | null;
}

export interface CareSchedule {
  id: string;
  name: string;
  title: string;
  description: string | null;
  scheduleDate: string;
  endDate?: string | null;
  timezone?: string | null;
  scheduleType: 'CARE' | string;
  status: CareScheduleStatus;
  careType: CareType | null;
  priority?: string;
  recurrenceRule?: string | null;
  assignedTo: string;
  cat: CareScheduleCat | null;
  cats: CareScheduleCat[];
  reminders?: CareScheduleReminder[];
  tags?: CareScheduleTag[];
  createdAt: string;
  updatedAt: string;
}

export interface CareScheduleMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CareScheduleListResponse = ApiSuccessData<'/care/schedules', 'get'>;

export type CareScheduleResponse = ApiSuccessData<'/care/schedules', 'post'>;

export type GetCareSchedulesParams = ApiQueryParams<'/care/schedules', 'get'>;
export type CreateCareScheduleRequest = ApiRequestBody<'/care/schedules', 'post'>;
export type CompleteCareScheduleRequest = ApiRequestBody<'/care/schedules/{id}/complete', 'patch'>;

const careScheduleKeys = createDomainQueryKeys<string, GetCareSchedulesParams>('care-schedules');

export { careScheduleKeys };

// ========== Medical Records ==========

export type MedicalVisitType = 'CHECKUP' | 'EMERGENCY' | 'SURGERY' | 'FOLLOW_UP' | 'VACCINATION' | 'OTHER';
export type MedicalRecordStatus = 'TREATING' | 'COMPLETED';

export interface MedicalRecordSymptom {
  label: string;
  note?: string | null;
}

export interface MedicalRecordMedication {
  name: string;
  dosage?: string | null;
}

export interface MedicalRecordAttachment {
  url: string;
  description?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  capturedAt?: string | null;
}

export interface MedicalRecordTag {
  id: string;
  name: string;
  color: string | null;
  textColor: string | null;
  groupId: string;
  groupName: string | null;
  categoryId: string | null;
  categoryName: string | null;
}

export interface MedicalRecord {
  id: string;
  visitDate: string;
  visitType?: MedicalVisitType | null;
  hospitalName?: string | null;
  symptom?: string | null;
  symptomDetails?: MedicalRecordSymptom[];
  diseaseName?: string | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  medications?: MedicalRecordMedication[];
  followUpDate?: string | null;
  status: MedicalRecordStatus;
  notes?: string | null;
  cat: { id: string; name: string };
  schedule?: { id: string; name: string } | null;
  tags?: MedicalRecordTag[]; // 更新された型定義
  attachments?: MedicalRecordAttachment[];
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 修正: OpenAPIスキーマから生成された型を上書き
export interface MedicalRecordListResponse {
  success: boolean;
  data: MedicalRecord[];
  meta: MedicalRecordMeta;
}

export interface MedicalRecordResponse {
  success: boolean;
  data: MedicalRecord;
}

// export type MedicalRecordListResponse = ApiSuccessData<'/care/medical-records', 'get'>;
// export type MedicalRecordResponse = ApiSuccessData<'/care/medical-records', 'post'>;

export type GetMedicalRecordsParams = ApiQueryParams<'/care/medical-records', 'get'>;
export type CreateMedicalRecordRequest = ApiRequestBody<'/care/medical-records', 'post'>;

const medicalRecordKeys = createDomainQueryKeys<string, GetMedicalRecordsParams>('medical-records');

export { medicalRecordKeys };

export function useGetCareSchedules(
  params: GetCareSchedulesParams = {},
  options?: Omit<UseQueryOptions<CareScheduleListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: careScheduleKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get('/care/schedules', {
        query: params,
      });

      if (!response.data) {
        throw new Error('ケアスケジュールのレスポンスが不正です');
      }

      return response as unknown as CareScheduleListResponse;
    },
    staleTime: 0,
    gcTime: 0,
    ...options,
  });
}

export function useAddCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCareScheduleRequest) => {
      const response = await apiClient.post('/care/schedules', {
        body: payload,
      });

      if (!response.data) {
        throw new Error('ケアスケジュールの登録に失敗しました。レスポンスが不正です。');
      }

      return response.data as CareScheduleResponse;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: careScheduleKeys.lists(),
        refetchType: 'all'
      });
      void queryClient.refetchQueries({
        queryKey: careScheduleKeys.lists()
      });
      notifications.show({
        title: 'ケア予定を登録しました',
        message: 'ケアスケジュールを追加しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'ケア予定の登録に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useUpdateCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateCareScheduleRequest;
    }) =>
      apiClient.patch('/care/schedules/{id}', {
        pathParams: { id } as ApiPathParams<'/care/schedules/{id}', 'patch'>,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careScheduleKeys.lists() });
      notifications.show({
        title: 'ケア予定を更新しました',
        message: '予定が正常に更新されました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'ケア予定の更新に失敗しました',
        message: error.message ?? '入力内容をご確認ください。',
        color: 'red',
      });
    },
  });
}

export function useDeleteCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete('/care/schedules/{id}', {
        pathParams: { id } as ApiPathParams<'/care/schedules/{id}', 'delete'>,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careScheduleKeys.lists() });
      notifications.show({
        title: 'ケア予定を削除しました',
        message: '予定が正常に削除されました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'ケア予定の削除に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}

export function useCompleteCareSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CompleteCareScheduleRequest;
    }) =>
      apiClient.patch('/care/schedules/{id}/complete', {
        pathParams: { id } as ApiPathParams<'/care/schedules/{id}/complete', 'patch'>,
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: careScheduleKeys.lists() });
      notifications.show({
        title: 'ケア予定を完了しました',
        message: '完了履歴に記録しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'ケア完了処理に失敗しました',
        message: error.message ?? '入力内容をご確認ください。',
        color: 'red',
      });
    },
  });
}

// ========== Medical Records Hooks ==========

export function useGetMedicalRecords(
  params: GetMedicalRecordsParams = {},
  options?: Omit<UseQueryOptions<MedicalRecordListResponse>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: medicalRecordKeys.list(params),
    queryFn: async () => {
      const response = await apiClient.get('/care/medical-records', {
        query: params,
      });

      if (!response.data) {
        throw new Error('医療記録のレスポンスが不正です');
      }

      return response as unknown as MedicalRecordListResponse;
    },
    staleTime: 0,
    gcTime: 0,
    ...options,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMedicalRecordRequest) => {
      const response = await apiClient.post('/care/medical-records', {
        body: payload,
      });

      if (!response.data) {
        throw new Error('医療記録の作成に失敗しました。レスポンスが不正です。');
      }

      return response as unknown as MedicalRecordResponse;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: medicalRecordKeys.lists(),
        refetchType: 'all'
      });
      void queryClient.refetchQueries({
        queryKey: medicalRecordKeys.lists()
      });
      notifications.show({
        title: '医療記録を登録しました',
        message: '医療記録を追加しました。',
        color: 'teal',
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: '医療記録の登録に失敗しました',
        message: error.message ?? '時間をおいて再度お試しください。',
        color: 'red',
      });
    },
  });
}
