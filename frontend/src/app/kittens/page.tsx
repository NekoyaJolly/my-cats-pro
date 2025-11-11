'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Button,
  Group,
  Card,
  Text,
  Badge,
  ActionIcon,
  Grid,
  Stack,
  Divider,
  Container,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconDeviceFloppy,
  IconCalendar,
  IconPaw,
} from '@tabler/icons-react';
import { useGetCareSchedules, type CareSchedule } from '@/lib/api/hooks/use-care';
import { useGetCats, useDeleteCat, type Cat } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';
import { useGetBirthPlans, type KittenDisposition, type BirthPlan } from '@/lib/api/hooks/use-breeding';
import TagSelector, { TagDisplay } from '@/components/TagSelector';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ContextMenuProvider, useContextMenu, OperationModalManager } from '@/components/context-menu';
import { CatEditModal } from '@/components/cats/cat-edit-modal';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { useRouter } from 'next/navigation';
import { GenderBadge } from '@/components/GenderBadge';

// データ型定義
interface Kitten {
  id: string;
  name: string;
  color: string;
  gender: 'オス' | 'メス';
  weight: number;
  birthDate: string;
  notes?: string;
  tags?: string[];
  rawCat: Cat;
  disposition?: KittenDisposition;
}

interface MotherCat {
  id: string;
  name: string;
  fatherName: string;
  kittens: Kitten[];
  deliveryDate: string;
  monthsOld: number;
}

export default function KittensPage() {
  const { setPageHeader } = usePageHeader();
  const router = useRouter();
  
  const [motherCats, setMotherCats] = useState<MotherCat[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // 子猫管理モーダル
  const [managementModalOpened, { open: openManagementModal, close: closeManagementModal }] = useDisclosure(false);
  const [selectedMotherIdForModal, setSelectedMotherIdForModal] = useState<string | undefined>(undefined);
  
  // 編集モーダル
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedKittenForEdit, setSelectedKittenForEdit] = useState<Cat | null>(null);

  // API hooks
  const catsQuery = useGetCats({ limit: 1000 });
  const deleteCatMutation = useDeleteCat();
  const tagCategoriesQuery = useGetTagCategories();
  const careSchedulesQuery = useGetCareSchedules({ limit: 100 } as any);
  const birthPlansQuery = useGetBirthPlans({ status: 'BORN', limit: 1000 } as any);

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    handleAction: handleKittenContextAction,
    openOperation,
    closeOperation,
  } = useContextMenu<Cat>({
    view: (kitten) => {
      if (kitten) {
        router.push(`/cats/${kitten.id}`);
      }
    },
    edit: (kitten) => {
      if (kitten) {
        setSelectedKittenForEdit(kitten);
        openEditModal();
      }
    },
    delete: (kitten) => {
      if (kitten) {
        openOperation('delete', kitten);
      }
    },
  });

  const handleOperationConfirm = () => {
    if (currentOperation === 'delete' && currentEntity) {
      deleteCatMutation.mutate(currentEntity.id, {
        onSuccess: () => {
          catsQuery.refetch();
          closeOperation();
        },
      });
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 子猫判定（生後6ヶ月未満）
  const isKitten = (birthDate: string): boolean => {
    const birth = new Date(birthDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return monthsDiff < 6;
  };

  // データ読み込み
  useEffect(() => {
    if (!catsQuery.data?.data || !birthPlansQuery.data?.data) return;

    const allCats = catsQuery.data.data;
    const birthPlans = birthPlansQuery.data.data;

    // 子猫のみフィルタリング
    const kittens = allCats.filter((cat: Cat) => isKitten(cat.birthDate));

    // 母猫ごとにグループ化
    const motherMap = new Map<string, { mother: Cat; kittens: Cat[]; fatherName: string; birthPlan?: BirthPlan }>();

    kittens.forEach((kitten: Cat) => {
      if (kitten.motherId) {
        const motherId = kitten.motherId;
        if (!motherMap.has(motherId)) {
          // birthPlansから母猫を検索
          const motherBirthPlans = birthPlans.filter((plan: BirthPlan) => plan.mother?.id === motherId);
          const birthPlan = motherBirthPlans.sort((a, b) => {
            const aHasDispositions = (a.kittenDispositions?.length || 0) > 0;
            const bHasDispositions = (b.kittenDispositions?.length || 0) > 0;
            if (aHasDispositions && !bHasDispositions) return -1;
            if (!aHasDispositions && bHasDispositions) return 1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })[0];
          
          const mother = birthPlan?.mother || kitten.mother || allCats.find((cat: Cat) => cat.id === motherId);
          if (mother) {
            const fatherId = birthPlan?.fatherId;
            const father = fatherId ? allCats.find((cat: Cat) => cat.id === fatherId) : null;
            motherMap.set(motherId, { mother: mother as Cat, kittens: [], fatherName: father?.name || '不明', birthPlan });
          }
        }
        if (motherMap.has(motherId)) {
          motherMap.get(motherId)!.kittens.push(kitten);
        }
      }
    });

    // MotherCat形式に変換
    const motherCatsData: MotherCat[] = Array.from(motherMap.values()).map(({ mother, kittens, fatherName, birthPlan }) => ({
      id: mother.id,
      name: mother.name,
      fatherName: fatherName,
      kittens: kittens.map((kitten: Cat) => {
        const disposition = birthPlan?.kittenDispositions?.find(
          (kd: KittenDisposition) => kd.kittenId === kitten.id || kd.name === kitten.name
        );
        
        return {
          id: kitten.id,
          name: kitten.name,
          color: kitten.coatColor?.name || '未確認',
          gender: kitten.gender === 'MALE' ? 'オス' : 'メス',
          weight: 350,
          birthDate: formatDate(kitten.birthDate),
          notes: kitten.description || '',
          tags: kitten.tags?.map((catTag) => catTag.tag.id) || [],
          rawCat: kitten,
          disposition,
        };
      }),
      deliveryDate: formatDate(kittens[0]?.birthDate || mother.birthDate),
      monthsOld: Math.floor((new Date().getTime() - new Date(kittens[0]?.birthDate || mother.birthDate).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    setMotherCats(motherCatsData);
  }, [catsQuery.data, birthPlansQuery.data]);

  // ページヘッダー設定
  useEffect(() => {
    setPageHeader(
      '子猫管理',
      <Button 
        leftSection={<IconPlus size={16} />} 
        onClick={() => {
          setSelectedMotherIdForModal(undefined);
          openManagementModal();
        }}
        size="sm"
      >
        新規登録
      </Button>
    );

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpanded = (catId: string) => {
    const newExpanded = new Set(expandedCats);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCats(newExpanded);
  };

  // タグでフィルタリング
  const getFilteredMotherCats = () => {
    if (filterTags.length === 0) {
      return motherCats;
    }

    return motherCats.map(mother => {
      const filteredKittens = mother.kittens.filter(kitten => {
        if (!kitten.tags || kitten.tags.length === 0) {
          return false;
        }
        return filterTags.some(filterTag => kitten.tags!.includes(filterTag));
      });

      return { ...mother, kittens: filteredKittens };
    }).filter(mother => mother.kittens.length > 0);
  };

  return (
    <Container size="lg" pb="xl">
      {/* タグフィルタ */}
      <Card padding="md" bg="gray.0" mb="md">
        <TagSelector 
          selectedTags={filterTags}
          onChange={setFilterTags}
          label="タグでフィルタ"
          placeholder="表示する子猫のタグを選択"
          categories={tagCategoriesQuery.data?.data || []}
        />
      </Card>

      {/* タブ */}
      <Tabs defaultValue="list" variant="outline" mb="md">
        <Tabs.List grow>
          <Tabs.Tab value="list" leftSection={<IconEdit size={14} />}>
            子猫一覧
          </Tabs.Tab>
          <Tabs.Tab value="care" leftSection={<IconCalendar size={14} />}>
            ケアスケジュール
          </Tabs.Tab>
        </Tabs.List>

        {/* 子猫一覧タブ */}
        <Tabs.Panel value="list" pt="md">
          {filterTags.length > 0 && (
            <Card padding="sm" bg="blue.0" radius="sm" mb="md">
              <Group gap="xs">
                <Text size="sm" fw={500}>フィルタ適用中:</Text>
                <TagDisplay tagIds={filterTags} size="xs" categories={tagCategoriesQuery.data?.data || []} />
                <Button 
                  variant="subtle" 
                  size="xs" 
                  onClick={() => setFilterTags([])}
                >
                  クリア
                </Button>
              </Group>
            </Card>
          )}

          {/* テーブル表示 */}
          <Card padding="md" radius="md" withBorder>
            {catsQuery.isLoading ? (
              <Text ta="center" c="dimmed" py="xl">
                読み込み中...
              </Text>
            ) : getFilteredMotherCats().length === 0 ? (
              <Stack gap="md" py="xl">
                <Text ta="center" c="dimmed">
                  表示する子猫がいません
                </Text>
              </Stack>
            ) : (
              <Table striped withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: '40px' }}></Table.Th>
                    <Table.Th>母猫名</Table.Th>
                    <Table.Th>父猫名</Table.Th>
                    <Table.Th>出産日</Table.Th>
                    <Table.Th>生後</Table.Th>
                    <Table.Th>子猫数</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {getFilteredMotherCats().map((mother) => {
                    const isExpanded = expandedCats.has(mother.id);
                    return (
                      <React.Fragment key={mother.id}>
                        {/* 母猫の行 */}
                        <Table.Tr
                          style={{ 
                            cursor: 'pointer', 
                            backgroundColor: isExpanded ? 'var(--mantine-color-blue-0)' : undefined 
                          }}
                          onClick={() => toggleExpanded(mother.id)}
                        >
                          <Table.Td>
                            {isExpanded ? (
                              <IconChevronDown size={16} />
                            ) : (
                              <IconChevronRight size={16} />
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Text fw={600}>{mother.name}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{mother.fatherName}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{mother.deliveryDate}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">生後{mother.monthsOld}日</Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge size="sm" variant="light">
                              {mother.kittens.length}頭
                            </Badge>
                          </Table.Td>
                        </Table.Tr>

                        {/* 子猫の行 */}
                        {isExpanded && mother.kittens.map((kitten) => {
                          const rawCat = kitten.rawCat;
                          if (!rawCat) {
                            return null;
                          }

                          return (
                            <ContextMenuProvider
                              key={kitten.id}
                              entity={rawCat}
                              entityType="子猫"
                              actions={['view', 'edit', 'delete']}
                              onAction={handleKittenContextAction}
                            >
                              <Table.Tr
                                style={{ 
                                  cursor: 'pointer',
                                  backgroundColor: 'var(--mantine-color-gray-0)'
                                }}
                                title="右クリックまたはダブルクリックで操作"
                              >
                                <Table.Td></Table.Td>
                                <Table.Td colSpan={5}>
                                  <Group gap="md" wrap="nowrap">
                                    <IconPaw size={16} style={{ color: 'var(--mantine-color-gray-6)', flexShrink: 0 }} />
                                    <Text fw={500} style={{ minWidth: '120px' }}>{kitten.name}</Text>
                                    <GenderBadge gender={kitten.gender} size="sm" />
                                    <Text size="sm" c="dimmed" style={{ minWidth: '80px' }}>{kitten.color}</Text>
                                    {kitten.disposition ? (
                                      <Badge 
                                        size="sm" 
                                        color={
                                          kitten.disposition.disposition === 'TRAINING' ? 'blue' :
                                          kitten.disposition.disposition === 'SALE' ? 'green' :
                                          'gray'
                                        }
                                        leftSection={
                                          kitten.disposition.disposition === 'TRAINING' ? '🎓' :
                                          kitten.disposition.disposition === 'SALE' ? '💰' :
                                          '🌈'
                                        }
                                      >
                                        {kitten.disposition.disposition === 'TRAINING' ? '養成中' :
                                         kitten.disposition.disposition === 'SALE' ? '出荷済' :
                                         '死亡'}
                                      </Badge>
                                    ) : (
                                      <Badge size="sm" color="gray" variant="light">
                                        処遇未登録
                                      </Badge>
                                    )}
                                    {rawCat.tags && rawCat.tags.length > 0 && (
                                      <TagDisplay 
                                        tagIds={rawCat.tags.map(t => t.tag.id)} 
                                        size="xs" 
                                        categories={tagCategoriesQuery.data?.data || []}
                                        tagMetadata={Object.fromEntries(
                                          rawCat.tags.map(t => [t.tag.id, t.tag.metadata || {}])
                                        )}
                                      />
                                    )}
                                  </Group>
                                </Table.Td>
                              </Table.Tr>
                            </ContextMenuProvider>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Tabs.Panel>

        {/* ケアスケジュールタブ */}
        <Tabs.Panel value="care" pt="md">
          <Stack gap="md">
            {/* 本日のケア一覧 */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="md">
                <Text size="lg" fw={500}>本日のケア一覧</Text>
                <Text size="sm" c="dimmed">{new Date().toLocaleDateString('ja-JP')}</Text>
              </Group>
              <Grid>
                {(() => {
                  const today = new Date().toISOString().split('T')[0];
                  const todaySchedules = careSchedulesQuery.data?.data?.filter(
                    (schedule: CareSchedule) => schedule.scheduleDate.startsWith(today)
                  ) || [];

                  const kittenSchedules = todaySchedules.filter((schedule: CareSchedule) => {
                    if (!schedule.cat) return false;
                    return motherCats.some(mother => 
                      mother.kittens.some(kitten => kitten.id === schedule.cat!.id)
                    );
                  });

                  const careGroups = kittenSchedules.reduce((acc, schedule) => {
                    const type = schedule.careType || 'OTHER';
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(schedule);
                    return acc;
                  }, {} as Record<string, CareSchedule[]>);

                  return Object.entries(careGroups).map(([careType, schedules]) => (
                    <Grid.Col key={careType} span={{ base: 12, sm: 6, md: 4 }}>
                      <Card padding="sm" radius="sm" withBorder bg="blue.0">
                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            {careType === 'VACCINATION' ? 'ワクチン' :
                             careType === 'HEALTH_CHECK' ? '健康診断' :
                             careType === 'GROOMING' ? 'グルーミング' :
                             careType === 'DENTAL_CARE' ? 'デンタルケア' :
                             careType === 'MEDICATION' ? '投薬' :
                             careType === 'SURGERY' ? '手術・処置' : 'その他'}
                          </Text>
                          <Badge size="xs" color="blue">{schedules.length}</Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {schedules.map(s => s.cat?.name).filter(Boolean).join('、')}
                        </Text>
                      </Card>
                    </Grid.Col>
                  ));
                })()}
                {careSchedulesQuery.data?.data?.filter(
                  (schedule: CareSchedule) => {
                    const today = new Date().toISOString().split('T')[0];
                    return schedule.scheduleDate.startsWith(today) && 
                           motherCats.some(mother => 
                             mother.kittens.some(kitten => kitten.id === schedule.cat!.id)
                           );
                  }
                ).length === 0 && (
                  <Grid.Col span={12}>
                    <Card padding="sm" radius="sm" withBorder bg="gray.0">
                      <Text size="sm" ta="center" c="dimmed">本日のケア予定はありません</Text>
                    </Card>
                  </Grid.Col>
                )}
              </Grid>
            </Card>

            {/* 体重記録 */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Text size="lg" fw={500} mb="md">最新体重記録</Text>
              <Grid>
                {motherCats.flatMap(mother => 
                  mother.kittens.map(kitten => (
                    <Grid.Col key={kitten.id} span={{ base: 12, sm: 6, md: 4 }}>
                      <ContextMenuProvider
                        entity={kitten.rawCat}
                        entityType="子猫"
                        actions={['view', 'edit', 'delete']}
                        onAction={handleKittenContextAction}
                      >
                        <Card 
                          padding="sm" 
                          radius="sm" 
                          withBorder
                          style={{ cursor: 'pointer' }}
                          title="右クリックまたはダブルクリックで操作"
                        >
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm" fw={500}>{kitten.name}</Text>
                              <GenderBadge gender={kitten.gender} size="xs" />
                            </Group>
                            <Text size="xs" c="dimmed">現在: {kitten.weight}g</Text>
                            <Text size="xs" c="dimmed">前回: 420g (+30g)</Text>
                            <Text size="xs" c="dimmed">測定日: 2024/08/01</Text>
                          </Stack>
                        </Card>
                      </ContextMenuProvider>
                    </Grid.Col>
                  ))
                )}
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* 子猫管理モーダル（統一版） */}
      <KittenManagementModal
        opened={managementModalOpened}
        onClose={closeManagementModal}
        motherId={selectedMotherIdForModal}
        onSuccess={() => {
          catsQuery.refetch();
          birthPlansQuery.refetch();
        }}
      />

      {/* 操作確認モーダル */}
      <OperationModalManager
        operationType={currentOperation}
        entity={currentEntity}
        entityType="子猫"
        onClose={closeOperation}
        onConfirm={handleOperationConfirm}
      />

      {/* 子猫編集モーダル */}
      {selectedKittenForEdit && (
        <CatEditModal
          opened={editModalOpened}
          onClose={closeEditModal}
          catId={selectedKittenForEdit.id}
          onSuccess={() => {
            catsQuery.refetch();
          }}
        />
      )}
    </Container>
  );
}
