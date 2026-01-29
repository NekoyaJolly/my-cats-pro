'use client';

import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Button,
  Group,
  Card,
  Text,
  Badge,
  Stack,
  Container,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconPaw,
  IconScale,
} from '@tabler/icons-react';
import { useGetKittens, useDeleteCat, type Cat, type KittenGroup } from '@/lib/api/hooks/use-cats';
import { useGetTagCategories } from '@/lib/api/hooks/use-tags';
import { type KittenDisposition } from '@/lib/api/hooks/use-breeding';
import TagSelector, { TagDisplay } from '@/components/TagSelector';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ContextMenuProvider, useContextMenu, OperationModalManager } from '@/components/context-menu';
import { CatEditModal } from '@/components/cats/cat-edit-modal';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { WeightRecordModal } from '@/components/kittens/WeightRecordModal';
import BulkWeightRecordModal from '@/components/kittens/BulkWeightRecordModal';
import WeightRecordTable from '@/components/kittens/WeightRecordTable';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { GenderBadge } from '@/components/GenderBadge';

import { ActionButton } from '@/components/ActionButton';

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
  daysOld: number;
}

/**
 * KittenGroup から MotherCat 形式に変換
 */
function convertKittenGroupToMotherCat(group: KittenGroup): MotherCat {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const deliveryDate = group.deliveryDate ? formatDate(group.deliveryDate) : '';
  const daysOld = group.deliveryDate
    ? Math.floor((new Date().getTime() - new Date(group.deliveryDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    id: group.mother.id,
    name: group.mother.name,
    fatherName: group.father?.name ?? '不明',
    kittens: group.kittens.map((kitten) => ({
      id: kitten.id,
      name: kitten.name,
      color: kitten.coatColor?.name ?? '未確認',
      gender: kitten.gender === 'MALE' ? 'オス' : 'メス',
      weight: 350, // TODO: 体重記録機能実装後に実データに置き換え
      birthDate: formatDate(kitten.birthDate),
      notes: kitten.description ?? '',
      tags: kitten.tags?.map((catTag) => catTag.tag.id) ?? [],
      rawCat: kitten,
      disposition: undefined, // TODO: 処遇データの取得方法を別途検討
    })),
    deliveryDate,
    daysOld,
  };
}

export default function KittensPage() {
  const { setPageHeader } = usePageHeader();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URLパラメータからタブ状態を取得（デフォルトは 'list'）
  const tabParam = searchParams.get('tab') || 'list';
  
  const [motherCats, setMotherCats] = useState<MotherCat[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // 子猫管理モーダル
  const [managementModalOpened, { open: openManagementModal, close: closeManagementModal }] = useDisclosure(false);
  const [selectedMotherIdForModal, setSelectedMotherIdForModal] = useState<string | undefined>(undefined);
  
  // 編集モーダル
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedKittenForEdit, setSelectedKittenForEdit] = useState<Cat | null>(null);

  // 体重記録モーダル
  const [weightModalOpened, { open: openWeightModal, close: closeWeightModal }] = useDisclosure(false);
  const [selectedKittenForWeight, setSelectedKittenForWeight] = useState<{ id: string; name: string } | null>(null);

  // 一括体重記録モーダル
  const [bulkWeightModalOpened, { open: openBulkWeightModal, close: closeBulkWeightModal }] = useDisclosure(false);

  // API hooks - 新しい子猫専用APIを使用
  const kittensQuery = useGetKittens({ limit: 200 });
  const deleteCatMutation = useDeleteCat();
  const tagCategoriesQuery = useGetTagCategories();

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
          kittensQuery.refetch();
          closeOperation();
        },
      });
    }
  };

  // タブ切り替え時にURLパラメータを更新
  const handleTabChange = (nextTab: string | null) => {
    if (!nextTab) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    router.push(`${pathname}?${nextParams.toString()}`);
  };

  // データ読み込み - 新しい子猫専用APIを使用
  useEffect(() => {
    if (!kittensQuery.data?.data) return;

    // サーバーサイドでグループ化済みのデータを MotherCat 形式に変換
    const motherCatsData: MotherCat[] = kittensQuery.data.data.map(convertKittenGroupToMotherCat);

    setMotherCats(motherCatsData);
  }, [kittensQuery.data]);

  // ページヘッダー設定（タブに応じてボタンを変更）
  useEffect(() => {
    const headerActions = (
      <Group gap="xs">
        {tabParam === 'weight' && motherCats.length > 0 && (
          <ActionButton 
            action="view"
            customIcon={<IconScale size={18} />}
            onClick={openBulkWeightModal}
          >
            一括記録
          </ActionButton>
        )}
        <ActionButton 
          action="create"
          onClick={() => {
            setSelectedMotherIdForModal(undefined);
            openManagementModal();
          }}
        >
          新規登録
        </ActionButton>
      </Group>
    );

    setPageHeader('子猫管理', headerActions);

    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam, motherCats.length]);

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
        return filterTags.some(filterTag => (kitten.tags ?? []).includes(filterTag));
      });

      return { ...mother, kittens: filteredKittens };
    }).filter(mother => mother.kittens.length > 0);
  };

  return (
    <Container size="lg">
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

      {/* タブ - URLパラメータで状態を管理 */}
      <Tabs value={tabParam} onChange={handleTabChange} variant="outline" radius="0" mb="md">
        <Tabs.List grow>
          <Tabs.Tab value="list" leftSection={<IconEdit size={14} />}>
            子猫一覧
          </Tabs.Tab>
          <Tabs.Tab value="weight" leftSection={<IconScale size={14} />}>
            体重管理
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
            {kittensQuery.isLoading ? (
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
                            <Text size="sm">生後{mother.daysOld}日</Text>
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

        {/* 体重管理タブ */}
        <Tabs.Panel value="weight" pt="md">
          <WeightRecordTable
            motherCats={motherCats}
            onRecordWeight={(kitten) => {
              setSelectedKittenForWeight({ id: kitten.id, name: kitten.name });
              openWeightModal();
            }}
            onBulkRecord={openBulkWeightModal}
          />
        </Tabs.Panel>
      </Tabs>

      {/* 子猫管理モーダル（統一版） */}
      <KittenManagementModal
        opened={managementModalOpened}
        onClose={closeManagementModal}
        motherId={selectedMotherIdForModal}
        onSuccess={() => {
          kittensQuery.refetch();
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
            kittensQuery.refetch();
          }}
        />
      )}

      {/* 体重記録モーダル */}
      {selectedKittenForWeight && (
        <WeightRecordModal
          opened={weightModalOpened}
          onClose={closeWeightModal}
          catId={selectedKittenForWeight.id}
          catName={selectedKittenForWeight.name}
          onSuccess={() => {
            // 体重記録更新後の処理（必要に応じてキャッシュ無効化）
          }}
        />
      )}

      {/* 一括体重記録モーダル */}
      <BulkWeightRecordModal
        opened={bulkWeightModalOpened}
        onClose={closeBulkWeightModal}
        motherGroups={motherCats.map((mother) => ({
          motherId: mother.id,
          motherName: mother.name,
          fatherName: mother.fatherName,
          deliveryDate: mother.deliveryDate,
          kittens: mother.kittens.map((k) => ({
            id: k.id,
            name: k.name,
            gender: k.gender,
            color: k.color,
          })),
        }))}
        onSuccess={() => {
          kittensQuery.refetch();
        }}
      />
    </Container>
  );
}
