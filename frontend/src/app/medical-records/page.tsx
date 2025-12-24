'use client';

import { useMemo, useState, useEffect } from 'react';
import {
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
  Select,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCalendarPlus, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';

import {
  type MedicalRecord,
  type GetMedicalRecordsParams,
  useCreateMedicalRecord,
  useGetMedicalRecords,
} from '@/lib/api/hooks/use-care';
import { useGetCats } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';
import { usePageHeader } from '@/lib/contexts/page-header-context';

import { ActionButton } from '@/components/ActionButton';
import { IconActionButton } from '@/components/buttons';

const STATUS_LABELS = {
  TREATING: '治療中',
  COMPLETED: '完了',
} as const;

const STATUS_COLORS = {
  TREATING: 'yellow',
  COMPLETED: 'green',
} as const;

const PAGE_LIMIT = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return dayjs(value).format('YYYY年MM月DD日');
}

function truncateText(text: string | null | undefined, maxLength = 10): string {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

interface CreateMedicalRecordFormState {
  catId: string;
  visitDate: Date | null;
  hospitalName: string;
  symptomTags: string[]; // タグID配列
  diagnosis: string;
  treatmentPlan: string;
  status: string;
  followUpDate: Date | null;
  notes: string;
}

export default function MedicalRecordsPage() {
  const { setPageHeader } = usePageHeader();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [detailRecord, setDetailRecord] = useState<MedicalRecord | null>(null);

  const [createForm, setCreateForm] = useState<CreateMedicalRecordFormState>({
    catId: '',
    visitDate: new Date(),
    hospitalName: '',
    symptomTags: [],
    diagnosis: '',
    treatmentPlan: '',
    status: 'TREATING',
    followUpDate: null,
    notes: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const medicalRecordsParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: PAGE_LIMIT,
    };
    if (selectedCatId) {
      params.catId = selectedCatId;
    }
    return params as unknown as GetMedicalRecordsParams;
  }, [page, selectedCatId]);

  const medicalRecordsQuery = useGetMedicalRecords(medicalRecordsParams);
  const createMedicalRecordMutation = useCreateMedicalRecord();

  const catsQuery = useGetCats({ limit: 100 });
  const tagsQuery = useGetTagCategories();

  // 医療データページ用のタグを取得（健康カテゴリから症状タグを抽出）
  const medicalTags = useMemo(() => {
    const categories = tagsQuery.data?.data || [];
    const healthCategory = categories.find(cat => cat.key === 'health' || cat.name.includes('健康'));
    if (!healthCategory) return [];
    
    // 健康カテゴリ内の全タグを取得
    return healthCategory.tags || [];
  }, [tagsQuery.data]);

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      '医療データ',
      <ActionButton
        action="create"
        customIcon={<IconCalendarPlus size={18} />}
        onClick={openCreateModal}
      >
        新規医療記録
      </ActionButton>
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCreateForm = () => {
    setCreateForm({
      catId: '',
      visitDate: new Date(),
      hospitalName: '',
      symptomTags: [],
      diagnosis: '',
      treatmentPlan: '',
      status: 'TREATING',
      followUpDate: null,
      notes: '',
    });
    setCreateError(null);
  };

  const handleCreateSubmit = () => {
    const trimmedCatId = createForm.catId.trim();
    const trimmedHospitalName = createForm.hospitalName.trim();
    const trimmedDiagnosis = createForm.diagnosis.trim();
    const trimmedTreatmentPlan = createForm.treatmentPlan.trim();
    const trimmedNotes = createForm.notes.trim();

    if (!trimmedCatId) {
      setCreateError('対象猫は必須です。');
      return;
    }

    if (!createForm.visitDate) {
      setCreateError('受診日は必須です。');
      return;
    }

    setCreateError(null);

    createMedicalRecordMutation.mutate(
      {
        catId: trimmedCatId,
        visitDate: dayjs(createForm.visitDate).toISOString(),
        hospitalName: trimmedHospitalName || undefined,
        diagnosis: trimmedDiagnosis || undefined,
        treatmentPlan: trimmedTreatmentPlan || undefined,
        status: createForm.status as 'TREATING' | 'COMPLETED',
        followUpDate: createForm.followUpDate ? dayjs(createForm.followUpDate).toISOString() : undefined,
        notes: trimmedNotes || undefined,
      },
      {
        onSuccess: () => {
          resetCreateForm();
          closeCreateModal();
          void medicalRecordsQuery.refetch();
        },
      },
    );
  };

  const records = medicalRecordsQuery.data?.data ?? [];
  const meta = medicalRecordsQuery.data?.meta ?? {
    total: 0,
    totalPages: 1,
    page,
    limit: PAGE_LIMIT,
  };

  const isInitialLoading = medicalRecordsQuery.isLoading && records.length === 0;
  const isEmpty = !isInitialLoading && records.length === 0;

  return (
    <Container size="lg">
      <Card withBorder shadow="xs" radius="md">
        <LoadingOverlay visible={medicalRecordsQuery.isFetching && !medicalRecordsQuery.isLoading} zIndex={10} />
        <Stack gap="md">
          {medicalRecordsQuery.isError && (
            <Alert color="red" icon={<IconAlertCircle size={18} />}>
              医療記録の取得中にエラーが発生しました。時間をおいて再度お試しください。
            </Alert>
          )}

          {/* フィルター */}
          <Group grow>
            <Select
              placeholder="猫を選択"
              data={(catsQuery.data?.data ?? []).map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              value={selectedCatId}
              onChange={setSelectedCatId}
              clearable
            />
            <TextInput
              placeholder="検索キーワード"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
          </Group>

          {isInitialLoading ? (
            <Stack>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} height={72} radius="md" />
              ))}
            </Stack>
          ) : isEmpty ? (
            <Card padding="xl" radius="md" bg="gray.0">
              <Stack gap="sm" align="center">
                <IconAlertCircle size={28} color="var(--mantine-color-teal-6)" />
                <Text fw={600}>表示する医療記録はありません</Text>
                <Text size="sm" c="dimmed" ta="center">
                  医療記録を追加して、猫の健康状態を管理しましょう。
                </Text>
                <ActionButton
                  action="create"
                  onClick={openCreateModal}
                >
                  医療記録を登録する
                </ActionButton>
              </Stack>
            </Card>
          ) : (
            <>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '15%' }}>受診日</Table.Th>
                    <Table.Th style={{ width: '15%' }}>猫名</Table.Th>
                    <Table.Th style={{ width: '25%' }}>症状・診断</Table.Th>
                    <Table.Th style={{ width: '15%' }}>病院名</Table.Th>
                    <Table.Th style={{ width: '15%' }}>状態</Table.Th>
                    <Table.Th style={{ width: '15%', textAlign: 'center' }}>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {records.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {formatDate(record.visitDate)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {record.cat.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Text size="sm" c={record.diagnosis ? undefined : 'dimmed'}>
                            {record.diagnosis ? truncateText(record.diagnosis, 12) : '診断なし'}
                          </Text>
                          {record.symptom && (
                            <Text size="xs" c="dimmed">
                              {truncateText(record.symptom, 12)}
                            </Text>
                          )}
                          {record.tags && record.tags.length > 0 && (
                            <Group gap={4}>
                              {record.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag.id}
                                  size="xs"
                                  variant="dot"
                                  color={tag.color || 'blue'}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                              {record.tags.length > 2 && (
                                <Text size="xs" c="dimmed">
                                  +{record.tags.length - 2}
                                </Text>
                              )}
                            </Group>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={record.hospitalName ? undefined : 'dimmed'}>
                          {record.hospitalName || '未設定'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={STATUS_COLORS[record.status]} variant="light">
                          {STATUS_LABELS[record.status]}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <IconActionButton
                            variant="view"
                            onClick={() => {
                              setDetailRecord(record);
                              openDetailModal();
                            }}
                          />
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
        title="医療記録の詳細"
        size="lg"
      >
        {detailRecord && (
          <Stack gap="md">
            <Group justify="space-between">
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  受診日
                </Text>
                <Text fw={500}>{formatDate(detailRecord.visitDate)}</Text>
              </Box>
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  状態
                </Text>
                <Badge color={STATUS_COLORS[detailRecord.status]} variant="light">
                  {STATUS_LABELS[detailRecord.status]}
                </Badge>
              </Box>
            </Group>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                対象猫
              </Text>
              <Text fw={500}>{detailRecord.cat.name}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                病院名
              </Text>
              <Text fw={500}>{detailRecord.hospitalName || '未設定'}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                症状
              </Text>
              <Text>{detailRecord.symptom || '記録なし'}</Text>
            </Box>

            {detailRecord.tags && detailRecord.tags.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb={8}>
                  症状タグ
                </Text>
                <Group gap="xs">
                  {detailRecord.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      color={tag.color || 'blue'}
                      variant="light"
                      size="lg"
                    >
                      {tag.categoryName && `${tag.categoryName} > `}
                      {tag.groupName && `${tag.groupName} > `}
                      {tag.name}
                    </Badge>
                  ))}
                </Group>
              </Box>
            )}

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                病名
              </Text>
              <Text>{detailRecord.diseaseName || '記録なし'}</Text>
            </Box>

            {detailRecord.symptomDetails && detailRecord.symptomDetails.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb={8}>
                  症状詳細
                </Text>
                <Stack gap="xs">
                  {detailRecord.symptomDetails.map((symptom, index) => (
                    <Card key={index} withBorder padding="sm">
                      <Text fw={500} size="sm">{symptom.label}</Text>
                      {symptom.note && (
                        <Text size="sm" c="dimmed" mt={4}>{symptom.note}</Text>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                診断
              </Text>
              <Text>{detailRecord.diagnosis || '記録なし'}</Text>
            </Box>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                治療計画
              </Text>
              <Text>{detailRecord.treatmentPlan || '記録なし'}</Text>
            </Box>

            {detailRecord.medications && detailRecord.medications.length > 0 && (
              <Box>
                <Text size="sm" c="dimmed" mb={8}>
                  投薬
                </Text>
                <Stack gap="xs">
                  {detailRecord.medications.map((medication, index) => (
                    <Card key={index} withBorder padding="sm">
                      <Text fw={500} size="sm">{medication.name}</Text>
                      {medication.dosage && (
                        <Text size="sm" c="dimmed" mt={4}>{medication.dosage}</Text>
                      )}
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}

            <Group grow>
              <Box>
                <Text size="sm" c="dimmed" mb={4}>
                  次回予定日
                </Text>
                <Text>{formatDate(detailRecord.followUpDate)}</Text>
              </Box>
            </Group>

            <Box>
              <Text size="sm" c="dimmed" mb={4}>
                備考
              </Text>
              <Text>{detailRecord.notes || 'なし'}</Text>
            </Box>

            <Divider />

            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                記録者: {detailRecord.recordedBy}
              </Text>
              <Text size="xs" c="dimmed">
                作成日: {dayjs(detailRecord.createdAt).format('YYYY/MM/DD HH:mm')}
              </Text>
            </Group>

            <Group justify="flex-end" mt="md">
              <ActionButton action="cancel" onClick={closeDetailModal}>
                閉じる
              </ActionButton>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal opened={createModalOpened} onClose={() => {
        closeCreateModal();
        resetCreateForm();
      }} title="医療記録を追加" size="lg">
        <Stack gap="md">
          {/* 1. 対象猫 */}
          <Select
            label="対象猫"
            placeholder="猫を選択"
            data={(catsQuery.data?.data ?? []).map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            value={createForm.catId}
            onChange={(value) => setCreateForm((prev) => ({ ...prev, catId: value || '' }))}
            required
          />

          {/* 2. 受診日 */}
          <DatePickerInput
            label="受診日"
            placeholder="受診日を選択"
            value={createForm.visitDate}
            onChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                visitDate: value ? new Date(value) : null,
              }))
            }
            required
          />

          {/* 3. 病院名 */}
          <TextInput
            label="病院名"
            placeholder="例: ねこクリニック東京"
            value={createForm.hospitalName}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                hospitalName: event.target.value,
              }))
            }
          />

          {/* 4. 症状タグ */}
          <Box>
            <Text size="sm" fw={500} mb="xs">
              症状タグ
            </Text>
            {tagsQuery.isLoading ? (
              <Skeleton height={40} />
            ) : medicalTags.length > 0 ? (
              <>
                <Group gap="xs" mb="sm">
                  {medicalTags.map((tag) => {
                    const isSelected = createForm.symptomTags.includes(tag.id);
                    return (
                      <Button
                        key={tag.id}
                        variant={isSelected ? 'filled' : 'outline'}
                        color={isSelected ? tag.color || 'blue' : 'gray'}
                        size="xs"
                        rightSection={isSelected ? <IconX size={12} /> : undefined}
                        onClick={() => {
                          setCreateForm((prev) => ({
                            ...prev,
                            symptomTags: isSelected
                              ? prev.symptomTags.filter((id) => id !== tag.id)
                              : [...prev.symptomTags, tag.id],
                          }));
                        }}
                      >
                        {tag.name}
                      </Button>
                    );
                  })}
                </Group>
                {createForm.symptomTags.length > 0 && (
                  <Text size="xs" c="dimmed">
                    選択されたタグ: {createForm.symptomTags.map(id => {
                      const tag = medicalTags.find(t => t.id === id);
                      return tag?.name || id;
                    }).join(', ')}
                  </Text>
                )}
              </>
            ) : (
              <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                タグ管理ページで「健康」カテゴリのタグを作成してください
              </Alert>
            )}
          </Box>

          {/* 5. 診断結果 */}
          <Textarea
            label="診断結果"
            placeholder="診断結果"
            value={createForm.diagnosis}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, diagnosis: event.target.value }))}
            minRows={2}
            autosize
          />

          {/* 6. 治療計画 */}
          <Textarea
            label="治療計画"
            placeholder="治療内容や計画"
            value={createForm.treatmentPlan}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, treatmentPlan: event.target.value }))}
            minRows={2}
            autosize
          />

          {/* 治療ステータス */}
          <Box>
            <Text size="sm" fw={500} mb="xs">
              治療ステータス
            </Text>
            <SegmentedControl
              value={createForm.status}
              onChange={(value) => setCreateForm((prev) => ({ ...prev, status: value }))}
              data={[
                { label: '治療中', value: 'TREATING' },
                { label: '完了', value: 'COMPLETED' },
              ]}
              fullWidth
            />
          </Box>

          {/* 7. 次回予定日 */}
          <DatePickerInput
            label="次回予定日"
            placeholder="次回の受診予定日"
            value={createForm.followUpDate}
            onChange={(value) =>
              setCreateForm((prev) => ({
                ...prev,
                followUpDate: value ? new Date(value) : null,
              }))
            }
          />

          {/* 8. 備考 */}
          <Textarea
            label="備考"
            placeholder="その他のメモ"
            value={createForm.notes}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))}
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
            <ActionButton action="cancel" onClick={() => {
              closeCreateModal();
              resetCreateForm();
            }}>
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleCreateSubmit} loading={createMedicalRecordMutation.isPending}>
              登録する
            </ActionButton>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}