'use client';

import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  MultiSelect,
  Skeleton,
  Stack,
  TextInput,
  Table,
  Text,
  Textarea,
  Title,
  Checkbox,
  Accordion,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCheck, IconPlus, IconRefresh, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
  type CareSchedule,
  type CareType,
  type GetCareSchedulesParams,
  useAddCareSchedule,
  useCompleteCareSchedule,
  useGetCareSchedules,
} from '@/lib/api/hooks/use-care';
import { useGetCats } from '@/lib/api/hooks/use-cats';
import {
  useGetTagCategories,
  type TagCategoryView,
  type TagView,
} from '@/lib/api/hooks/use-tags';

const CARE_TYPE_LABELS: Record<CareType, string> = {
  VACCINATION: 'ワクチン',
  HEALTH_CHECK: '健康診断',
  GROOMING: 'グルーミング',
  DENTAL_CARE: 'デンタルケア',
  MEDICATION: '投薬',
  SURGERY: '手術・処置',
  OTHER: 'その他',
};

const STATUS_LABELS = {
  PENDING: '未着手',
  IN_PROGRESS: '進行中',
  COMPLETED: '完了',
  CANCELLED: 'キャンセル',
} as const;

const STATUS_COLORS = {
  PENDING: 'yellow',
  IN_PROGRESS: 'blue',
  COMPLETED: 'teal',
  CANCELLED: 'gray',
} as const;

const CARE_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'すべて' },
  { value: 'VACCINATION', label: CARE_TYPE_LABELS.VACCINATION },
  { value: 'HEALTH_CHECK', label: CARE_TYPE_LABELS.HEALTH_CHECK },
  { value: 'GROOMING', label: CARE_TYPE_LABELS.GROOMING },
  { value: 'DENTAL_CARE', label: CARE_TYPE_LABELS.DENTAL_CARE },
  { value: 'MEDICATION', label: CARE_TYPE_LABELS.MEDICATION },
  { value: 'SURGERY', label: CARE_TYPE_LABELS.SURGERY },
  { value: 'OTHER', label: CARE_TYPE_LABELS.OTHER },
] as const;

const PAGE_LIMIT = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return dayjs(value).format('YYYY年MM月DD日');
}

interface CreateScheduleFormState {
  name: string;
  category: 'Male' | 'Female' | 'Kitten' | 'Adult' | null;
  tags: string[];
  selectedCatIds: string[];
  schedule: {
    type: 'daily' | 'weekly' | 'monthly' | 'period' | 'birthday' | 'single';
    startDate?: string | null;
    endDate?: string | null;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    daysAfterBirth?: number;
  } | null;
  description: string;
}

interface CompleteScheduleFormState {
  completedDate: Date | null;
  nextScheduledDate: Date | null;
  notes: string;
}

export default function CarePage() {
  const [page, setPage] = useState(1);
  const [careTypeFilter, setCareTypeFilter] = useState<(typeof CARE_TYPE_FILTER_OPTIONS)[number]['value']>('ALL');
  const [selectedCareNames, setSelectedCareNames] = useState<string[]>([]);

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [completeModalOpened, { open: openCompleteModal, close: closeCompleteModal }] = useDisclosure(false);

  const [createForm, setCreateForm] = useState<CreateScheduleFormState>({
    name: '',
    category: null,
    tags: [],
    selectedCatIds: [],
    schedule: null,
    description: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const [completeForm, setCompleteForm] = useState<CompleteScheduleFormState>({
    completedDate: new Date(),
    nextScheduledDate: null,
    notes: '',
  });
  const [targetSchedule, setTargetSchedule] = useState<CareSchedule | null>(null);

  const scheduleParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: PAGE_LIMIT,
    };
    if (careTypeFilter && careTypeFilter !== 'ALL') {
      params.careType = careTypeFilter;
    }
    return params as unknown as GetCareSchedulesParams;
  }, [page, careTypeFilter]);

  const scheduleQuery = useGetCareSchedules(scheduleParams);
  const addScheduleMutation = useAddCareSchedule();
  const completeScheduleMutation = useCompleteCareSchedule();

  const catsQuery = useGetCats({ limit: 100 });

  const tagsQuery = useGetTagCategories();
  const allTags = useMemo(() => {
    if (!tagsQuery.data?.data) return [];
    
    // Helper to validate tag has required properties
    const isValidTag = (tag: TagView) => {
      return typeof tag.id === 'string' && typeof tag.name === 'string' &&
             tag.id.trim() !== '' && tag.name.trim() !== '';
    };
    
    // Use category.tags directly (already computed by useGetTagCategories)
    return tagsQuery.data.data
      .flatMap((category: TagCategoryView) => 
        (category.tags || [])
          .filter(isValidTag)
          .map((tag: TagView) => ({
            value: tag.id,
            label: tag.name,
            group: category.name || 'その他', // Ensure group is always a string
          }))
      );
  }, [tagsQuery.data?.data]);

  // 絞り込まれた猫を計算
  const filteredCats = useMemo(() => {
    if (!catsQuery.data?.data) return [];
    let filtered = catsQuery.data.data;

    // カテゴリで絞り込み
    if (createForm.category) {
      filtered = filtered.filter((cat) => {
        if (createForm.category === 'Male') return cat.gender === 'MALE';
        if (createForm.category === 'Female') return cat.gender === 'FEMALE';
        if (createForm.category === 'Kitten') {
          // 生後1年未満をKittenとする
          const birthDate = dayjs(cat.birthDate);
          const oneYearAgo = dayjs().subtract(1, 'year');
          return birthDate.isAfter(oneYearAgo);
        }
        if (createForm.category === 'Adult') {
          // 生後1年以上をAdultとする
          const birthDate = dayjs(cat.birthDate);
          const oneYearAgo = dayjs().subtract(1, 'year');
          return birthDate.isBefore(oneYearAgo);
        }
        return true;
      });
    }

    // タグで絞り込み
    if (createForm.tags.length > 0) {
      filtered = filtered.filter((cat) =>
        createForm.tags.some((tagId) =>
          cat.tags?.some((tag) => tag.id === tagId)
        )
      );
    }

    return filtered;
  }, [catsQuery.data?.data, createForm.category, createForm.tags]);

  const schedules = scheduleQuery.data?.data ?? [];
  const meta = scheduleQuery.data?.meta ?? {
    total: 0,
    totalPages: 1,
    page,
    limit: PAGE_LIMIT,
  };

  // 登録されているケア名を取得
  const availableCareNames = useMemo(() => {
    const allSchedules = scheduleQuery.data?.data ?? [];
    const uniqueNames = new Set<string>();
    allSchedules.forEach((schedule) => {
      if (schedule.name) {
        uniqueNames.add(schedule.name);
      }
    });
    return Array.from(uniqueNames).sort();
  }, [scheduleQuery.data?.data]);

  // 選択されたケア名ごとの統計を計算
  const selectedCareStats = useMemo(() => {
    const allSchedules = scheduleQuery.data?.data ?? [];
    return selectedCareNames.map((careName) => {
      const relatedSchedules = allSchedules.filter((schedule) => schedule.name === careName);
      const uniqueCats = new Set(relatedSchedules.map((schedule) => schedule.cat?.id).filter(Boolean));
      return {
        name: careName,
        catCount: uniqueCats.size,
      };
    });
  }, [selectedCareNames, scheduleQuery.data?.data]);

  const handleRefresh = () => {
    void scheduleQuery.refetch();
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      category: null,
      tags: [],
      selectedCatIds: [],
      schedule: null,
      description: '',
    });
    setCreateError(null);
  };

  const handleCreateSubmit = () => {
    const trimmedName = createForm.name.trim();
    const trimmedDescription = createForm.description.trim();

    if (!trimmedName) {
      setCreateError('ケア名は必須です。');
      return;
    }

    // TODO: スケジュールバリデーションを追加

    setCreateError(null);
    // TODO: 新しいAPIに合わせて送信処理を更新
    // 仮に複数猫に対応したAPIを使用
    const catIds = createForm.selectedCatIds.length > 0 ? createForm.selectedCatIds : filteredCats.map(cat => cat.id);
    // 仮に最初の猫のみを使用
    addScheduleMutation.mutate(
      {
        name: trimmedName,
        catId: catIds[0] || '', // 仮
        careType: 'OTHER', // 仮
        scheduledDate: createForm.schedule?.startDate ? dayjs(createForm.schedule.startDate).toISOString() : dayjs().toISOString(),
        description: trimmedDescription || undefined,
      },
      {
        onSuccess: () => {
          resetCreateForm();
          closeCreateModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  const openCompleteScheduleModal = (schedule: CareSchedule) => {
    setTargetSchedule(schedule);
    setCompleteForm({
      completedDate: new Date(),
      nextScheduledDate: null,
      notes: '',
    });
    openCompleteModal();
  };

  const handleCompleteSubmit = () => {
    if (!targetSchedule) return;

    completeScheduleMutation.mutate(
      {
        id: targetSchedule.id,
        payload: {
          completedDate: completeForm.completedDate
            ? dayjs(completeForm.completedDate).format('YYYY-MM-DD')
            : undefined,
          nextScheduledDate: completeForm.nextScheduledDate
            ? dayjs(completeForm.nextScheduledDate).format('YYYY-MM-DD')
            : undefined,
          notes: completeForm.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          closeCompleteModal();
          setTargetSchedule(null);
        },
      },
    );
  };

  const isInitialLoading = scheduleQuery.isLoading && schedules.length === 0;
  const isEmpty = !isInitialLoading && schedules.length === 0;

  return (
    <Container size="lg" pb="xl">
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>
          ケアスケジュール
        </Title>
        <Group gap="xs">
          <ActionIcon variant="subtle" aria-label="refresh" onClick={handleRefresh} loading={scheduleQuery.isFetching}>
            <IconRefresh size={18} />
          </ActionIcon>
          <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
            ケア予定を追加
          </Button>
          <Select
            placeholder="カードを追加"
            data={availableCareNames.map((name) => ({ value: name, label: name }))}
            value={null}
            onChange={(value) => {
              if (value && !selectedCareNames.includes(value)) {
                setSelectedCareNames((prev) => [...prev, value]);
              }
            }}
            w={200}
            leftSection={<IconPlus size={16} />}
          />
        </Group>
      </Group>

      {/* 選択されたケア名のカード表示 */}
      {selectedCareStats.length > 0 && (
        <Group grow mb="lg">
          {selectedCareStats.map((stat) => (
            <Card key={stat.name} shadow="xs" padding="md" radius="md" withBorder>
              <Group justify="space-between" align="center">
                <div>
                  <Text size="sm" c="dimmed" mb={4}>
                    {stat.name}
                  </Text>
                  <Text size="xl" fw={700}>
                    {stat.catCount}
                  </Text>
                  <Text size="xs" c="dimmed">
                    頭
                  </Text>
                </div>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    setSelectedCareNames((prev) => prev.filter((name) => name !== stat.name));
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Group>
      )}

      <Card withBorder shadow="xs" radius="md">
        <LoadingOverlay visible={scheduleQuery.isFetching && !scheduleQuery.isLoading} zIndex={10} />
        <Stack gap="md">
          <Group justify="space-between" align="flex-end">
            <Box>
              <Text size="sm" fw={600}>
                フィルター
              </Text>
              <Text size="xs" c="dimmed">
                ケア種別で絞り込み
              </Text>
            </Box>
            <Select
              data={CARE_TYPE_FILTER_OPTIONS}
              value={careTypeFilter}
              onChange={(value) => {
                setPage(1);
                setCareTypeFilter((value as (typeof CARE_TYPE_FILTER_OPTIONS)[number]['value']) ?? 'ALL');
              }}
              w={200}
            />
          </Group>

          {scheduleQuery.isError && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              ケアスケジュールの取得中にエラーが発生しました。時間をおいて再度お試しください。
            </Alert>
          )}

          {isInitialLoading ? (
            <Stack>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={72} radius="md" />
              ))}
            </Stack>
          ) : isEmpty ? (
            <Card padding="xl" radius="md" bg="gray.0">
              <Stack gap="sm" align="center">
                <IconCheck size={28} color="var(--mantine-color-teal-6)" />
                <Text fw={600}>表示するケア予定はありません</Text>
                <Text size="sm" c="dimmed" ta="center">
                  {careTypeFilter === 'ALL'
                    ? 'ケア予定を追加して、ケアの履歴を管理しましょう。'
                    : '選択した条件に一致するケア予定がありません。'}
                </Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal} variant="light">
                  ケア予定を登録する
                </Button>
              </Stack>
            </Card>
          ) : (
            <>
              <Table verticalSpacing="md" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '18%' }}>猫</Table.Th>
                    <Table.Th style={{ width: '18%' }}>ケア種別</Table.Th>
                    <Table.Th style={{ width: '18%' }}>予定日</Table.Th>
                    <Table.Th style={{ width: '28%' }}>詳細</Table.Th>
                    <Table.Th style={{ width: '10%' }}>状態</Table.Th>
                    <Table.Th style={{ width: '8%' }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {schedules.map((schedule) => (
                    <Table.Tr key={schedule.id}>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={600}>{schedule.cat?.name ?? '未設定'}</Text>
                          <Text size="xs" c="dimmed">
                            登録者: {schedule.assignedTo || 'システム'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light">
                          {schedule.careType ? CARE_TYPE_LABELS[schedule.careType] : '未設定'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text fw={500}>{formatDate(schedule.scheduleDate)}</Text>
                          <Text size="xs" c="dimmed">
                            追加: {dayjs(schedule.createdAt).format('YYYY/MM/DD')}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={500}>
                            {schedule.name || schedule.title}
                          </Text>
                          <Text size="sm" c={schedule.description ? undefined : 'dimmed'}>
                            {schedule.description ?? 'メモは登録されていません'}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[schedule.status]} variant="light">
                          {STATUS_LABELS[schedule.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          variant="light"
                          disabled={schedule.status === 'COMPLETED' || schedule.status === 'CANCELLED'}
                          onClick={() => openCompleteScheduleModal(schedule)}
                        >
                          完了
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {meta.totalPages > 1 && (
                <Group justify="center">
                  <Pagination
                    value={meta.page ?? page}
                    onChange={(value) => setPage(value)}
                    total={meta.totalPages}
                    siblings={1}
                  />
                </Group>
              )}
            </>
          )}
        </Stack>
      </Card>

      <Modal opened={createModalOpened} onClose={() => {
        closeCreateModal();
        resetCreateForm();
      }} title="ケア予定を追加" size="lg">
        <Stack gap="md">
          <TextInput
            label="ケア名"
            placeholder="例: 年次健康診断"
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                name: event.target.value,
              }))
            }
            required
          />

          <RadioGroup
            label="カテゴリ"
            value={createForm.category}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, category: value as 'Male' | 'Female' | 'Kitten' | 'Adult' }))}
          >
            <Group mt="xs">
              <Radio value="Male" label="Male" />
              <Radio value="Female" label="Female" />
              <Radio value="Kitten" label="Kitten" />
              <Radio value="Adult" label="Adult" />
            </Group>
          </RadioGroup>

          <MultiSelect
            label="タグ"
            placeholder="タグを選択（複数選択可能）"
            data={allTags}
            value={createForm.tags}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, tags: value }))}
          />

          <Group justify="space-between" align="center">
            <Text size="sm" fw={500}>対象猫</Text>
            <Text size="sm" c="dimmed">{filteredCats.length}頭</Text>
          </Group>

          <Accordion>
            <Accordion.Item value="select-cats">
              <Accordion.Control>更に選択する</Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {filteredCats.length === 0 ? (
                    <Text size="sm" c="dimmed">絞り込まれた猫がありません</Text>
                  ) : (
                    filteredCats.map((cat) => (
                      <Checkbox
                        key={cat.id}
                        label={`${cat.name} (${cat.gender})`}
                        checked={createForm.selectedCatIds.includes(cat.id)}
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          setCreateForm((prev) => ({
                            ...prev,
                            selectedCatIds: checked
                              ? [...prev.selectedCatIds, cat.id]
                              : prev.selectedCatIds.filter((id) => id !== cat.id),
                          }));
                        }}
                      />
                    ))
                  )}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

          <Select
            label="スケジュールタイプ"
            placeholder="スケジュールタイプを選択"
            data={[
              { value: 'daily', label: '毎日' },
              { value: 'weekly', label: '毎週○曜日' },
              { value: 'monthly', label: '毎月○日' },
              { value: 'period', label: '○日〜○日（期間指定）' },
              { value: 'birthday', label: '生後○日目' },
              { value: 'single', label: '単日' },
            ]}
            value={createForm.schedule?.type || null}
            onChange={(value) => setCreateForm((prev) => ({
              ...prev,
              schedule: value ? { type: value as any } : null
            }))}
          />

          {createForm.schedule?.type === 'weekly' && (
            <Select
              label="曜日"
              placeholder="曜日を選択"
              data={[
                { value: '0', label: '日曜日' },
                { value: '1', label: '月曜日' },
                { value: '2', label: '火曜日' },
                { value: '3', label: '水曜日' },
                { value: '4', label: '木曜日' },
                { value: '5', label: '金曜日' },
                { value: '6', label: '土曜日' },
              ]}
              value={createForm.schedule.daysOfWeek?.[0]?.toString() || null}
              onChange={(value) => setCreateForm((prev) => ({
                ...prev,
                schedule: {
                  ...prev.schedule!,
                  daysOfWeek: value ? [parseInt(value)] : []
                }
              }))}
            />
          )}

          {createForm.schedule?.type === 'monthly' && (
            <Select
              label="日付"
              placeholder="日付を選択"
              data={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: `${i + 1}日` }))}
              value={createForm.schedule.dayOfMonth?.toString() || null}
              onChange={(value) => setCreateForm((prev) => ({
                ...prev,
                schedule: {
                  ...prev.schedule!,
                  dayOfMonth: value ? parseInt(value) : undefined
                }
              }))}
            />
          )}

          {createForm.schedule?.type === 'period' && (
            <Group grow>
              <DatePickerInput
                label="開始日"
                value={createForm.schedule.startDate}
                onChange={(value) => setCreateForm((prev) => ({
                  ...prev,
                  schedule: prev.schedule ? {
                    ...prev.schedule,
                    startDate: value
                  } : null
                }))}
              />
              <DatePickerInput
                label="終了日"
                value={createForm.schedule.endDate}
                onChange={(value) => setCreateForm((prev) => ({
                  ...prev,
                  schedule: prev.schedule ? {
                    ...prev.schedule,
                    endDate: value
                  } : null
                }))}
              />
            </Group>
          )}

          {createForm.schedule?.type === 'birthday' && (
            <TextInput
              label="生後日数"
              placeholder="例: 21"
              type="number"
              value={createForm.schedule.daysAfterBirth?.toString() || ''}
              onChange={(event) => setCreateForm((prev) => ({
                ...prev,
                schedule: {
                  ...prev.schedule!,
                  daysAfterBirth: parseInt(event.target.value) || undefined
                }
              }))}
            />
          )}

          {createForm.schedule?.type === 'single' && (
            <DatePickerInput
              label="日付"
              value={createForm.schedule.startDate}
              onChange={(value) => setCreateForm((prev) => ({
                ...prev,
                schedule: prev.schedule ? {
                  ...prev.schedule,
                  startDate: value
                } : null
              }))}
            />
          )}

          <Textarea
            label="備考"
            placeholder="ケアの詳細やメモを入力（任意）"
            value={createForm.description}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
            minRows={3}
            autosize
          />

          {createError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {createError}
            </Alert>
          )}

          <Divider />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => {
              closeCreateModal();
              resetCreateForm();
            }}>
              キャンセル
            </Button>
            <Button onClick={handleCreateSubmit} loading={addScheduleMutation.isPending}>
              登録する
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={completeModalOpened} onClose={() => {
        closeCompleteModal();
        setTargetSchedule(null);
  }} title={targetSchedule ? `${targetSchedule.cat?.name ?? '未設定'} - ${targetSchedule.name || targetSchedule.title} を完了` : 'ケア完了処理'} size="lg">
        {targetSchedule ? (
          <Stack gap="md">
            <Card withBorder shadow="xs" radius="md">
              <Stack gap={4}>
                <Group justify="space-between">
                  <Badge size="sm" variant="light">
                    {targetSchedule.careType ? CARE_TYPE_LABELS[targetSchedule.careType] : '未設定'}
                  </Badge>
                  <Text size="sm" c="dimmed">
                    予定日: {formatDate(targetSchedule.scheduleDate)}
                  </Text>
                </Group>
                <Stack gap={2}>
                  <Text fw={600}>{targetSchedule.name || targetSchedule.title}</Text>
                  <Text size="sm">{targetSchedule.description ?? 'メモは登録されていません'}</Text>
                </Stack>
              </Stack>
            </Card>

            <DatePickerInput
              label="完了日"
              placeholder="完了日を選択"
              value={completeForm.completedDate}
              onChange={(value) =>
                setCompleteForm((prev) => ({
                  ...prev,
                  completedDate: value ? new Date(value) : null,
                }))
              }
              required
            />

            <DatePickerInput
              label="次回予定日 (任意)"
              placeholder="次回ケアを予定している場合は選択"
              value={completeForm.nextScheduledDate}
              onChange={(value) =>
                setCompleteForm((prev) => ({
                  ...prev,
                  nextScheduledDate: value ? new Date(value) : null,
                }))
              }
              minDate={completeForm.completedDate ?? undefined}
            />

            <Textarea
              label="メモ"
              placeholder="ケア内容の詳細、体調、次回の注意点など"
              value={completeForm.notes}
              onChange={(event) => setCompleteForm((prev) => ({ ...prev, notes: event.target.value }))}
              autosize
              minRows={3}
            />

            <Divider />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={() => {
                closeCompleteModal();
                setTargetSchedule(null);
              }}>
                キャンセル
              </Button>
              <Button
                onClick={handleCompleteSubmit}
                loading={completeScheduleMutation.isPending}
                color="teal"
              >
                完了として記録
              </Button>
            </Group>
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            対象のケア予定が見つかりませんでした。
          </Text>
        )}
      </Modal>
    </Container>
  );
}
