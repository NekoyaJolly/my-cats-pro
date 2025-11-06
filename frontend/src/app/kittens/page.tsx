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
  Modal,
  Select,
  NumberInput,
  Divider,
  Container,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus,
  IconChevronDown,
  IconChevronUp,
  IconChevronRight,
  IconEdit,
  IconDeviceFloppy,
  IconCalendar,
  IconPaw,
} from '@tabler/icons-react';
import { useGetCareSchedules, type CareSchedule } from '@/lib/api/hooks/use-care';
import { useGetCats, useDeleteCat, type Cat } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';
import { useGetBirthPlans, type BirthPlan } from '@/lib/api/hooks/use-breeding';
import TagSelector, { TagDisplay } from '@/components/TagSelector';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ContextMenuProvider, useContextMenu, OperationModalManager } from '@/components/context-menu';
import { useRouter } from 'next/navigation';
import { GenderBadge } from '@/components/GenderBadge';

// サンプルデータ型定義
interface Kitten {
  id: string;
  name: string;
  color: string;
  gender: 'オス' | 'メス';
  weight: number;
  birthDate: string;
  notes?: string;
  tags?: string[];
  rawCat: Cat; // 元のCatオブジェクトを保持
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
  const [opened, { open, close }] = useDisclosure(false);
  
  // 新規登録用の状態
  const [selectedMother, setSelectedMother] = useState<string>('');
  const [maleCount, setMaleCount] = useState<number>(0);
  const [femaleCount, setFemaleCount] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // API hooks
  const catsQuery = useGetCats({ limit: 1000 });
  const deleteCatMutation = useDeleteCat();
  const tagCategoriesQuery = useGetTagCategories();
  const careSchedulesQuery = useGetCareSchedules({ limit: 100 } as any);
  const birthPlansQuery = useGetBirthPlans({ status: 'BORN', limit: 1000 } as any);

  // コンテキストメニュー用の状態
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
        router.push(`/cats/${kitten.id}/edit`);
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

  // 日付をyyyy-mm-dd形式にフォーマットする関数
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 子猫かどうかを判定する関数(生後6ヶ月未満)
  const isKitten = (birthDate: string): boolean => {
    const birth = new Date(birthDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return monthsDiff < 6;
  };

    // データを読み込む
  useEffect(() => {
    if (!catsQuery.data?.data || !birthPlansQuery.data?.data) return;

    const allCats = catsQuery.data.data;
    const birthPlans = birthPlansQuery.data.data;

    // 子猫のみをフィルタリング
    const kittens = allCats.filter((cat: Cat) => isKitten(cat.birthDate));

    // 母猫ごとに子猫をグループ化
    const motherMap = new Map<string, { mother: Cat; kittens: Cat[]; fatherName: string }>();

    kittens.forEach((kitten: Cat) => {
      if (kitten.motherId) {
        const motherId = kitten.motherId;
        if (!motherMap.has(motherId)) {
          // birthPlansから母猫を検索
          const birthPlan = birthPlans.find((plan) => plan.mother?.id === motherId);
          const mother = birthPlan?.mother || kitten.mother || allCats.find((cat: Cat) => cat.id === motherId);
          if (mother) {
            const fatherId = birthPlan?.fatherId;
            const father = fatherId ? allCats.find((cat: Cat) => cat.id === fatherId) : null;
            motherMap.set(motherId, { mother: mother as Cat, kittens: [], fatherName: father?.name || '不明' });
          }
        }
        if (motherMap.has(motherId)) {
          motherMap.get(motherId)!.kittens.push(kitten);
        }
      }
    });

    // MotherCat形式に変換
    const motherCatsData: MotherCat[] = Array.from(motherMap.values()).map(({ mother, kittens, fatherName }) => ({
      id: mother.id,
      name: mother.name,
      fatherName: fatherName,
      kittens: kittens.map((kitten: Cat) => ({
        id: kitten.id,
        name: kitten.name,
        color: kitten.coatColor?.name || '未確認',
        gender: kitten.gender === 'MALE' ? 'オス' : 'メス',
        weight: 350, // TODO: 体重データがAPIにないので仮の値
        birthDate: formatDate(kitten.birthDate),
        notes: kitten.description || '',
        tags: kitten.tags?.map((catTag) => catTag.tag.id) || [],
        rawCat: kitten, // 元のCatオブジェクトを保持
      })),
      deliveryDate: formatDate(kittens[0]?.birthDate || mother.birthDate), // 最初の子猫の生年月日を使用
      monthsOld: Math.floor((new Date().getTime() - new Date(kittens[0]?.birthDate || mother.birthDate).getTime()) / (1000 * 60 * 60 * 24)), // 生後日数
    }));

    setMotherCats(motherCatsData);
  }, [catsQuery.data, birthPlansQuery.data]);

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader(
      '子猫管理',
      <Button 
        leftSection={<IconPlus size={16} />} 
        onClick={open}
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

  // タグでフィルタリングする関数
  const getFilteredMotherCats = () => {
    console.log('getFilteredMotherCats called, motherCats:', motherCats.length, 'filterTags:', filterTags);
    
    if (filterTags.length === 0) {
      return motherCats;
    }

    return motherCats.map(mother => {
      // 子猫をフィルタリング
      const filteredKittens = mother.kittens.filter(kitten => {
        if (!kitten.tags || kitten.tags.length === 0) {
          return false;
        }
        return filterTags.some(filterTag => kitten.tags!.includes(filterTag));
      });

      return { ...mother, kittens: filteredKittens };
    }).filter(mother => mother.kittens.length > 0); // 該当する子猫がいる母猫のみ表示
  };

  const handleRegisterKittens = () => {
    if (!selectedMother || (maleCount === 0 && femaleCount === 0)) {
      return;
    }

    const mother = motherCats.find(cat => cat.id === selectedMother);
    if (!mother) return;

    const newKittens: Kitten[] = [];
    let kittenNumber = mother.kittens.length + 1;

    // オスの子猫を追加
    for (let i = 0; i < maleCount; i++) {
      newKittens.push({
        id: `k${Date.now()}-${i}`,
        name: `${mother.name}${kittenNumber}号`,
        color: '未確認',
        gender: 'オス',
        weight: 350,
        birthDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: selectedTags,
        rawCat: {} as Cat, // ダミー(新規登録用の一時データ)
      });
      kittenNumber++;
    }

    // メスの子猫を追加
    for (let i = 0; i < femaleCount; i++) {
      newKittens.push({
        id: `k${Date.now()}-${maleCount + i}`,
        name: `${mother.name}${kittenNumber}号`,
        color: '未確認',
        gender: 'メス',
        weight: 340,
        birthDate: new Date().toISOString().split('T')[0],
        notes: '',
        tags: selectedTags,
        rawCat: {} as Cat, // ダミー(新規登録用の一時データ)
      });
      kittenNumber++;
    }

    // 母猫の子猫リストを更新
    setMotherCats(prev => prev.map(cat => 
      cat.id === selectedMother 
        ? { ...cat, kittens: [...cat.kittens, ...newKittens] }
        : cat
    ));

    // フォームをリセット
    setSelectedMother('');
    setMaleCount(0);
    setFemaleCount(0);
    setSelectedTags([]);
    close();
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

      {/* タブ - モバイル最適化 */}
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

          {/* テーブル表示 - 母猫アコーディオン形式 */}
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
                  <Text ta="center" size="xs" c="dimmed">
                    (motherCats: {motherCats.length}件, 
                    総子猫数: {motherCats.reduce((sum, m) => sum + m.kittens.length, 0)}頭)
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

                          {/* 子猫の行 (展開時) */}
                          {isExpanded && mother.kittens.map((kitten) => {
                            const rawCat = kitten.rawCat;
                            if (!rawCat) {
                              console.warn('rawCat not found for kitten:', kitten.id, kitten);
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

                  // 子猫に関連するケアのみをフィルタリング
                  const kittenSchedules = todaySchedules.filter((schedule: CareSchedule) => {
                    if (!schedule.cat) return false;
                    return motherCats.some(mother => 
                      mother.kittens.some(kitten => kitten.id === schedule.cat!.id)
                    );
                  });

                  // ケアタイプごとにグループ化
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

            {/* ケアカレンダー */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group justify="space-between" mb="md" wrap="wrap">
                <Text size="lg" fw={500}>ケアカレンダー</Text>
                <Group gap="xs">
                  <Button variant="light" size="xs">
                    今週
                  </Button>
                  <Button variant="light" size="xs">
                    来週
                  </Button>
                </Group>
              </Group>
              
              {/* カレンダーテーブル - 横スクロール対応 */}
              <Box 
                style={{ 
                  overflowX: 'auto', 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin'
                }} 
                mb="md"
              >
                <table style={{ 
                  width: '100%', 
                  minWidth: '600px', 
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--background-soft)' }}>
                      <th style={{ 
                        padding: '6px 8px', 
                        border: '1px solid #dee2e6', 
                        minWidth: '80px',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: 'var(--background-soft)',
                        zIndex: 10
                      }}>
                        母猫名
                      </th>
                      {Array.from({ length: 7 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        return (
                          <th key={i} style={{ 
                            padding: '6px 4px', 
                            border: '1px solid #dee2e6', 
                            minWidth: '70px',
                            textAlign: 'center'
                          }}>
                            <div>
                              <Text size="xs" c="dimmed">
                                {date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                              </Text>
                              <Text size="xs" fw={500}>
                                {date.toLocaleDateString('ja-JP', { weekday: 'short' })}
                              </Text>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {motherCats.map((motherCat) => (
                      <tr key={motherCat.id}>
                        <td style={{ 
                          padding: '6px 8px', 
                          border: '1px solid #dee2e6', 
                          verticalAlign: 'top',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'var(--surface)',
                          zIndex: 5
                        }}>
                          <Group gap="xs" wrap="nowrap">
                            <Text size="sm" fw={500}>{motherCat.name}</Text>
                            <ActionIcon size="xs" variant="light">
                              <IconPlus size={10} />
                            </ActionIcon>
                          </Group>
                        </td>
                        {Array.from({ length: 7 }, (_, dayIndex) => (
                          <td key={dayIndex} style={{ 
                            padding: '2px', 
                            border: '1px solid #dee2e6', 
                            verticalAlign: 'top',
                            minHeight: '50px'
                          }}>
                            <Stack gap={2} align="center">
                              <Badge size="xs" color="blue" variant="light" style={{ fontSize: '0.65rem' }}>
                                ミルク
                              </Badge>
                              {dayIndex % 3 === 0 && (
                                <Badge size="xs" color="green" variant="light" style={{ fontSize: '0.65rem' }}>
                                  体重
                                </Badge>
                              )}
                              {dayIndex === 2 && (
                                <Badge size="xs" color="orange" variant="light" style={{ fontSize: '0.65rem' }}>
                                  洗い
                                </Badge>
                              )}
                            </Stack>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* スクロールヒント */}
              <Text size="xs" c="dimmed" ta="center" mb="md">
                ← → 横スクロールでカレンダーを確認できます
              </Text>

              {/* 特別ケア */}
              <Divider my="md" />
              <Text size="md" fw={500} mb="sm">特別ケア</Text>
              <Group>
                <Button variant="outline" size="xs" leftSection={<IconPlus size={12} />}>
                  特別ケア追加
                </Button>
              </Group>
              <Stack gap="xs" mt="sm">
                <Card padding="xs" radius="sm" withBorder bg="red.0">
                  <Group justify="space-between">
                    <Group gap="xs">
                      <Text size="sm">ミケ2号 - 投薬（抗生物質）</Text>
                      <Badge size="xs" color="red">継続中</Badge>
                    </Group>
                    <ActionIcon size="sm" color="green">
                      <IconDeviceFloppy size={12} />
                    </ActionIcon>
                  </Group>
                </Card>
              </Stack>
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

      {/* 新規登録モーダル */}
      <Modal opened={opened} onClose={close} title="子猫新規登録" size="md">
        <Stack gap="md">
          <Select
            label="母猫選択"
            placeholder="出産予定日の近い順"
            value={selectedMother}
            onChange={(value) => setSelectedMother(value || '')}
            data={catsQuery.data?.data
              ?.filter((cat: Cat) => cat.gender === 'FEMALE' && cat.isInHouse)
              .sort((a: Cat, b: Cat) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime())
              .map((cat: Cat) => ({ 
                value: cat.id, 
                label: `${cat.name} (${cat.birthDate} - ${Math.floor((new Date().getTime() - new Date(cat.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30))}ヶ月)` 
              })) || []}
          />
          <Group grow>
            <NumberInput
              label="オス頭数"
              placeholder="0"
              min={0}
              max={10}
              value={maleCount}
              onChange={(value) => setMaleCount(Number(value) || 0)}
            />
            <NumberInput
              label="メス頭数"
              placeholder="0"
              min={0}
              max={10}
              value={femaleCount}
              onChange={(value) => setFemaleCount(Number(value) || 0)}
            />
          </Group>
          <TagSelector 
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            label="タグ"
            placeholder="子猫に適用するタグを選択"
            categories={tagCategoriesQuery.data?.data || []}
          />
          {selectedMother && (maleCount > 0 || femaleCount > 0) && (
            <Card padding="sm" bg="blue.0" radius="sm">
              <Text size="sm" fw={500} mb="xs">生成される子猫名</Text>
              <Group gap="xs">
                {Array.from({ length: maleCount + femaleCount }, (_, i) => {
                  const mother = motherCats.find(cat => cat.id === selectedMother);
                  const kittenNumber = (mother?.kittens.length || 0) + i + 1;
                  return (
                    <Badge 
                      key={i} 
                      size="sm" 
                      color={i < maleCount ? 'cyan' : 'pink'}
                      variant="light"
                    >
                      {mother?.name}{kittenNumber}号
                    </Badge>
                  );
                })}
              </Group>
            </Card>
          )}
          <Text size="sm" c="dimmed">
            ※子猫名は自動生成されます（母猫名＋番号）
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={close}>
              キャンセル
            </Button>
            <Button 
              onClick={handleRegisterKittens}
              disabled={!selectedMother || (maleCount === 0 && femaleCount === 0)}
            >
              登録
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* 操作確認モーダル */}
      <OperationModalManager
        operationType={currentOperation}
        entity={currentEntity}
        entityType="子猫"
        onClose={closeOperation}
        onConfirm={handleOperationConfirm}
      />
    </Container>
  );
}
