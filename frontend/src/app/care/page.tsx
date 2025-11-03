'use client';

import { useMemo, useState, useEffect } from 'react';
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
  Skeleton,
  Stack,
  Switch,
  TextInput,
  Table,
  Text,
  Textarea,
  Title,
  Checkbox,
  Accordion,
  Menu,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCheck, IconPlus, IconX, IconEye, IconEdit, IconTrash, IconChevronDown, IconCalendarPlus, IconLayoutGrid, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
  type CareSchedule,
  type CreateCareScheduleRequest,
  type GetCareSchedulesParams,
  useAddCareSchedule,
  useUpdateCareSchedule,
  useDeleteCareSchedule,
  useCompleteCareSchedule,
  useGetCareSchedules,
} from '@/lib/api/hooks/use-care';
import { useGetCats } from '@/lib/api/hooks/use-cats';
import {
  useGetTagCategories,
  type TagCategoryView,
  type TagView,
} from '@/lib/api/hooks/use-tags';
import { usePageHeader } from '@/lib/contexts/page-header-context';

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

const PAGE_LIMIT = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return dayjs(value).format('YYYY年MM月DD日');
}

function formatRecurrenceRule(rule: string | null | undefined): string {
  if (!rule) return '単発';
  
  if (rule.includes('FREQ=DAILY')) return '毎日';
  if (rule.includes('FREQ=WEEKLY')) {
    const dayMatch = rule.match(/BYDAY=([A-Z,]+)/);
    if (dayMatch) {
      const days = dayMatch[1].split(',');
      const dayNames: Record<string, string> = {
        'SU': '日', 'MO': '月', 'TU': '火', 'WE': '水',
        'TH': '木', 'FR': '金', 'SA': '土'
      };
      const japDays = days.map(d => dayNames[d] || d).join('・');
      return `毎週${japDays}曜日`;
    }
    return '毎週';
  }
  if (rule.includes('FREQ=MONTHLY')) {
    const dayMatch = rule.match(/BYMONTHDAY=(\d+)/);
    if (dayMatch) {
      return `毎月${dayMatch[1]}日`;
    }
    return '毎月';
  }
  if (rule.includes('FREQ=YEARLY')) return '毎年';
  return rule;
}

function truncateText(text: string | null | undefined, maxLength = 10): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function buildRecurrenceRule(schedule: CreateScheduleFormState['schedule']): string | undefined {
  if (!schedule || schedule.type === 'single') {
    return undefined;
  }

  switch (schedule.type) {
    case 'daily':
      return 'FREQ=DAILY;INTERVAL=1';
    
    case 'weekly':
      if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byday = schedule.daysOfWeek.map(d => days[d]).join(',');
        return `FREQ=WEEKLY;INTERVAL=1;BYDAY=${byday}`;
      }
      return 'FREQ=WEEKLY;INTERVAL=1';
    
    case 'monthly':
      if (schedule.dayOfMonth) {
        return `FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=${schedule.dayOfMonth}`;
      }
      return 'FREQ=MONTHLY;INTERVAL=1';
    
    case 'period':
      // 期間指定の場合はRRULEではなく終了日を使用
      return undefined;
    
    case 'birthday':
      // 生後○日目は個別にハンドリングが必要
      return undefined;
    
    default:
      return undefined;
  }
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
  const { setPageHeader } = usePageHeader();
  
  const [page, setPage] = useState(1);
  const [selectedCareNames, setSelectedCareNames] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [addCardModalOpened, { open: openAddCardModal, close: closeAddCardModal }] = useDisclosure(false);
  const [completeModalOpened, { open: openCompleteModal, close: closeCompleteModal }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [detailSchedule, setDetailSchedule] = useState<CareSchedule | null>(null);

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
    return params as unknown as GetCareSchedulesParams;
  }, [page]);

  const scheduleQuery = useGetCareSchedules(scheduleParams);
  const addScheduleMutation = useAddCareSchedule();
  const updateScheduleMutation = useUpdateCareSchedule();
  const deleteScheduleMutation = useDeleteCareSchedule();
  const completeScheduleMutation = useCompleteCareSchedule();

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [editingSchedule, setEditingSchedule] = useState<CareSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<CareSchedule | null>(null);

  const catsQuery = useGetCats({ limit: 100 });

  const tagsQuery = useGetTagCategories();
  
  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      'ケアスケジュール',
      <>
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button 
              variant="outline" 
              color="blue" 
              leftSection={<IconPlus size={16} />} 
              rightSection={<IconChevronDown size={16} />} 
              size="sm"
            >
              ケアの登録
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item leftSection={<IconCalendarPlus size={16} />} onClick={openCreateModal}>
              ケア予定を追加
            </Menu.Item>
            <Menu.Item leftSection={<IconLayoutGrid size={16} />} onClick={openAddCardModal}>
              カードを追加
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </>
    );

    return () => setPageHeader(null);
  }, []);
  
  const allTags = useMemo(() => {
    try {
      // Return empty array if data is not available or not an array
      if (!tagsQuery.data?.data || !Array.isArray(tagsQuery.data.data)) {
        return [];
      }
      
      // Helper to validate tag has required properties
      const isValidTag = (tag: unknown): tag is TagView => {
        if (!tag || typeof tag !== 'object') return false;
        const t = tag as TagView;
        return typeof t.id === 'string' && typeof t.name === 'string' &&
               t.id.trim() !== '' && t.name.trim() !== '';
      };
      
      // Helper to validate category has required properties
      const isValidCategory = (category: unknown): category is TagCategoryView => {
        if (!category || typeof category !== 'object') return false;
        const c = category as TagCategoryView;
        return typeof c.name === 'string' && c.name.trim() !== '' && Array.isArray(c.tags);
      };
      
      // Use category.tags directly (already computed by useGetTagCategories)
      return tagsQuery.data.data
        .filter(isValidCategory)
        .flatMap((category: TagCategoryView) => 
          (category.tags || [])
            .filter(isValidTag)
            .map((tag: TagView) => ({
              value: tag.id,
              label: tag.name,
              // Temporarily remove group to test
              // group: category.name || 'その他',
            }))
        );
    } catch (error) {
      // Log error and return empty array to prevent crashes
      console.error('Error computing allTags:', error);
      return [];
    }
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
          cat.tags?.some((catTag) => catTag.tag.id === tagId)
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
    setSelectedTag(null);
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
    
    const recurrenceRule = buildRecurrenceRule(createForm.schedule);
    
    addScheduleMutation.mutate(
      {
        name: trimmedName,
        catIds: catIds,
        careType: 'OTHER',
        scheduledDate: createForm.schedule?.startDate ? dayjs(createForm.schedule.startDate).toISOString() : dayjs().toISOString(),
        description: trimmedDescription || undefined,
        recurrenceRule: recurrenceRule,
      } as CreateCareScheduleRequest,
      {
        onSuccess: () => {
          resetCreateForm();
          closeCreateModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  const _openCompleteScheduleModal = (schedule: CareSchedule) => {
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
          completedDate: dayjs(completeForm.completedDate ?? new Date()).toISOString(),
          nextScheduledDate: completeForm.nextScheduledDate
            ? dayjs(completeForm.nextScheduledDate).toISOString()
            : undefined,
          notes: completeForm.notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setTargetSchedule(null);
          closeCompleteModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  const handleEditSchedule = (schedule: CareSchedule) => {
    setEditingSchedule(schedule);
    // フォームに既存データを設定
    setCreateForm({
      name: schedule.name,
      category: null,
      tags: schedule.tags?.map(t => t.id) ?? [],
      selectedCatIds: schedule.cats?.map(c => c.id) ?? [],
      schedule: {
        type: 'single',
        startDate: schedule.scheduleDate,
      },
      description: schedule.description ?? '',
    });
    openEditModal();
  };

  const handleUpdateSubmit = () => {
    if (!editingSchedule) return;

    const trimmedName = createForm.name.trim();
    const trimmedDescription = createForm.description.trim();

    if (!trimmedName) {
      setCreateError('ケア名は必須です。');
      return;
    }

    const catIds = createForm.selectedCatIds.length > 0 ? createForm.selectedCatIds : filteredCats.map(cat => cat.id);
    const recurrenceRule = buildRecurrenceRule(createForm.schedule);

    updateScheduleMutation.mutate(
      {
        id: editingSchedule.id,
        payload: {
          name: trimmedName,
          catIds: catIds,
          careType: 'OTHER',
          scheduledDate: createForm.schedule?.startDate ? dayjs(createForm.schedule.startDate).toISOString() : dayjs().toISOString(),
          description: trimmedDescription || undefined,
          recurrenceRule: recurrenceRule,
        } as CreateCareScheduleRequest,
      },
      {
        onSuccess: () => {
          setEditingSchedule(null);
          resetCreateForm();
          closeEditModal();
          void scheduleQuery.refetch();
        },
      },
    );
  };

  const handleDeleteSchedule = (schedule: CareSchedule) => {
    setDeletingSchedule(schedule);
    openDeleteModal();
  };

  const handleConfirmDelete = () => {
    if (!deletingSchedule) return;

    deleteScheduleMutation.mutate(deletingSchedule.id, {
      onSuccess: () => {
        setDeletingSchedule(null);
        closeDeleteModal();
        void scheduleQuery.refetch();
      },
    });
  };

  const isInitialLoading = scheduleQuery.isLoading && schedules.length === 0;
  const isEmpty = !isInitialLoading && schedules.length === 0;

  return (
    <Container size="lg" pb="xl">
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
                  ケア予定を追加して、ケアの履歴を管理しましょう。
                </Text>
                <Button 
                  variant="outline" 
                  color="blue" 
                  leftSection={<IconPlus size={16} />} 
                  onClick={openCreateModal}
                >
                  ケア予定を登録する
                </Button>
              </Stack>
            </Card>
          ) : (
            <>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '15%' }}>ケア名</Table.Th>
                    <Table.Th style={{ width: '20%' }}>スケジュール</Table.Th>
                    <Table.Th style={{ width: '20%' }}>内容</Table.Th>
                    <Table.Th style={{ width: '12%' }}>対象</Table.Th>
                    <Table.Th style={{ width: '10%' }}>状態</Table.Th>
                    <Table.Th style={{ width: '23%', textAlign: 'center' }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {schedules.map((schedule) => (
                    <Table.Tr key={schedule.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {schedule.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {formatDate(schedule.scheduleDate)}
                          </Text>
                          {schedule.recurrenceRule && (
                            <Text size="xs" c="green">
                              {formatRecurrenceRule(schedule.recurrenceRule)}
                            </Text>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={schedule.description ? undefined : 'dimmed'}>
                          {schedule.description ? truncateText(schedule.description, 15) : 'なし'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {(schedule as any).cats && (schedule as any).cats.length > 0 ? `${(schedule as any).cats.length}頭` : schedule.cat ? '1頭' : '未設定'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={schedule.status === 'PENDING' || schedule.status === 'IN_PROGRESS'}
                          size="sm"
                          onLabel="有効"
                          offLabel="無効"
                          disabled
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <ActionIcon
                            variant="light"
                            color="gray"
                            size="sm"
                            onClick={() => {
                              setDetailSchedule(schedule as any);
                              openDetailModal();
                            }}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="yellow"
                            size="sm"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="light"
                            color="red"
                            size="sm"
                            onClick={() => handleDeleteSchedule(schedule)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
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

      <Modal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        title="ケア予定の詳細"
        size="lg"
      >
        {detailSchedule && (
          <Stack gap="md">
            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                対象猫
              </Text>
              {(detailSchedule as any).cats && (detailSchedule as any).cats.length > 0 ? (
                <Stack gap="xs">
                  {(detailSchedule as any).cats.map((cat: any) => (
                    <Text key={cat.id} fw={500}>{cat.name}</Text>
                  ))}
                  <Text size="xs" c="dimmed">計 {(detailSchedule as any).cats.length}頭</Text>
                </Stack>
              ) : (
                <Text fw={500}>{detailSchedule.cat?.name ?? '未設定'}</Text>
              )}
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                予定日
              </Text>
              <Text fw={500}>{formatDate(detailSchedule.scheduleDate)}</Text>
            </Box>

            {detailSchedule.recurrenceRule && (
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  繰り返し設定
                </Text>
                <Group gap="xs">
                  <IconRefresh size={16} color="var(--mantine-color-green-6)" />
                  <Text fw={500} c="green">
                    {formatRecurrenceRule(detailSchedule.recurrenceRule)}
                  </Text>
                </Group>
              </Box>
            )}

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                詳細内容
              </Text>
              <Text>{detailSchedule.description || 'メモは登録されていません'}</Text>
            </Box>

            {detailSchedule.tags && detailSchedule.tags.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb={8}>
                  タグ
                </Text>
                <Group gap="xs">
                  {detailSchedule.tags.map((tag) => (
                    <Badge key={tag.id} variant="dot">
                      {tag.label}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            <Divider />

            <Group justify="space-between">
              <Box>
                <Text size="sm" c="dimmed">
                  登録者
                </Text>
                <Text size="sm" fw={500}>
                  {detailSchedule.assignedTo || '未設定'}
                </Text>
              </Box>
              <Box>
                <Text size="sm" c="dimmed">
                  ステータス
                </Text>
                <Badge color={STATUS_COLORS[detailSchedule.status]} variant="light">
                  {STATUS_LABELS[detailSchedule.status]}
                </Badge>
              </Box>
            </Group>

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                作成日: {dayjs(detailSchedule.createdAt).format('YYYY/MM/DD HH:mm')}
              </Text>
              {detailSchedule.updatedAt && (
                <Text size="xs" c="dimmed">
                  更新日: {dayjs(detailSchedule.updatedAt).format('YYYY/MM/DD HH:mm')}
                </Text>
              )}
            </Group>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={closeDetailModal}>
                閉じる
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

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

          <div>
            <Group grow align="flex-end" gap="xs">
              <Select
                label="タグ"
                placeholder="タグを選択"
                data={allTags || []}
                value={selectedTag}
                onChange={(value) => setSelectedTag(value)}
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  if (selectedTag && !(createForm.tags || []).includes(selectedTag)) {
                    setCreateForm((prev) => ({
                      ...prev,
                      tags: [...(prev.tags || []), selectedTag],
                    }));
                    setSelectedTag(null);
                  }
                }}
                disabled={!selectedTag}
                w="auto"
              >
                追加
              </Button>
            </Group>
            {(createForm.tags || []).length > 0 && (
              <Group mt="xs" gap="xs">
                {(createForm.tags || []).map((tagId) => {
                  const tag = allTags.find((t) => t.value === tagId);
                  return (
                    <Badge
                      key={tagId}
                      variant="light"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              tags: (prev.tags || []).filter((id) => id !== tagId),
                            }))
                          }
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      }
                    >
                      {tag?.label || tagId}
                    </Badge>
                  );
                })}
              </Group>
            )}
          </div>

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
                value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
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
                value={createForm.schedule.endDate ? new Date(createForm.schedule.endDate) : null}
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
              value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
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

      {/* カードを追加モーダル */}
      <Modal
        opened={addCardModalOpened}
        onClose={closeAddCardModal}
        title="カードを追加"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            統計カードとして表示するケア名を選択してください
          </Text>
          <Select
            placeholder="ケア名を選択"
            data={(availableCareNames || []).map((name) => ({ value: name, label: name }))}
            value={null}
            onChange={(value) => {
              if (value && !selectedCareNames.includes(value)) {
                setSelectedCareNames((prev) => [...prev, value]);
                closeAddCardModal();
              }
            }}
            searchable
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={closeAddCardModal}>
              キャンセル
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
              <Button 
                variant="subtle" 
                color="gray" 
                onClick={() => {
                  closeCompleteModal();
                  setTargetSchedule(null);
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="filled"
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

      {/* 編集モーダル */}
      <Modal
        opened={editModalOpened}
        onClose={() => {
          closeEditModal();
          setEditingSchedule(null);
          resetCreateForm();
        }}
        title="ケア予定を編集"
        size="lg"
      >
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

          <div>
            <Group grow align="flex-end" gap="xs">
              <Select
                label="タグ"
                placeholder="タグを選択"
                data={allTags || []}
                value={selectedTag}
                onChange={(value) => setSelectedTag(value)}
              />
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  if (selectedTag && !(createForm.tags || []).includes(selectedTag)) {
                    setCreateForm((prev) => ({
                      ...prev,
                      tags: [...(prev.tags || []), selectedTag],
                    }));
                    setSelectedTag(null);
                  }
                }}
                disabled={!selectedTag}
                w="auto"
              >
                追加
              </Button>
            </Group>
            {(createForm.tags || []).length > 0 && (
              <Group mt="xs" gap="xs">
                {(createForm.tags || []).map((tagId) => {
                  const tag = allTags.find((t) => t.value === tagId);
                  return (
                    <Badge
                      key={tagId}
                      variant="light"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          onClick={() =>
                            setCreateForm((prev) => ({
                              ...prev,
                              tags: (prev.tags || []).filter((id) => id !== tagId),
                            }))
                          }
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      }
                    >
                      {tag?.label || tagId}
                    </Badge>
                  );
                })}
              </Group>
            )}
          </div>

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
                value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
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
                value={createForm.schedule.endDate ? new Date(createForm.schedule.endDate) : null}
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
              value={createForm.schedule.startDate ? new Date(createForm.schedule.startDate) : null}
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
            <Button
              variant="default"
              onClick={() => {
                closeEditModal();
                setEditingSchedule(null);
                resetCreateForm();
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleUpdateSubmit} loading={updateScheduleMutation.isPending}>
              更新
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          closeDeleteModal();
          setDeletingSchedule(null);
        }}
        title="ケア予定を削除"
        size="md"
      >
        {deletingSchedule && (
          <Stack gap="md">
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              以下のケア予定を削除します。この操作は取り消せません。
            </Alert>

            <Box>
              <Text size="sm" c="dimmed">
                ケア名
              </Text>
              <Text fw={600}>{deletingSchedule.name}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed">
                対象猫
              </Text>
              <Text>{deletingSchedule.cats.length}頭</Text>
            </Box>

            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  closeDeleteModal();
                  setDeletingSchedule(null);
                }}
              >
                キャンセル
              </Button>
              <Button
                variant="filled"
                color="red"
                onClick={handleConfirmDelete}
                loading={deleteScheduleMutation.isPending}
              >
                削除
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

