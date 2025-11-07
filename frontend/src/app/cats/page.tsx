'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Container,
  Text,
  Button,
  TextInput,
  Card,
  Group,
  Stack,
  Box,
  Badge,
  Tabs,
  Select,
  Skeleton,
  Alert,
  Table,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconPlus, IconAlertCircle, IconCat, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { CatQuickEditModal } from '@/components/cats/cat-quick-edit-modal';
import { ContextMenuProvider, OperationModalManager, useContextMenu } from '@/components/context-menu';
import { GenderBadge } from '@/components/GenderBadge';
import { useGetCats, useGetCatStatistics, useUpdateCat, useDeleteCat, type Cat, type GetCatsParams } from '@/lib/api/hooks/use-cats';
import { usePageHeader } from '@/lib/contexts/page-header-context';

export default function CatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cats');
  const [sortBy, setSortBy] = useState('name');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPageHeader } = usePageHeader();
  
  // 子猫の展開/折りたたみ状態
  const [expandedMotherIds, setExpandedMotherIds] = useState<Set<string>>(new Set());
  
  // 編集モーダルの状態
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<Cat | null>(null);

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    openOperation: _openOperation,
    closeOperation,
    handleAction: handleContextAction,
  } = useContextMenu<Cat>({
    view: (cat) => {
      if (cat) {
        router.push(`/cats/${cat.id}`);
      }
    },
    duplicate: async (cat) => {
      if (cat) {
        // 複製ロジック（後で実装）
        console.log('Duplicate cat:', cat);
      }
    },
  });

  // カラム幅の状態管理（ローカルストレージから復元）
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catsTableColumnWidths');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      name: 15,
      gender: 10,
      breed: 15,
      age: 12,
      tags: 30,
      actions: 10,
    };
  });

  // リサイズ中の状態
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // カラム幅をローカルストレージに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('catsTableColumnWidths', JSON.stringify(columnWidths));
    }
  }, [columnWidths]);

  // リサイズ開始
  const handleResizeStart = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column]);
  };

  // リサイズ中
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(5, startWidth + (diff / window.innerWidth) * 100); // 最小5%
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth,
    }));
  }, [resizingColumn, startX, startWidth]);

  // リサイズ終了
  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  // マウスイベントリスナー
  useEffect(() => {
    if (resizingColumn) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  const queryParams = useMemo<GetCatsParams>(() => {
    const params: GetCatsParams = {};

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    switch (activeTab) {
      case 'male':
        params.gender = 'MALE';
        break;
      case 'female':
        params.gender = 'FEMALE';
        break;
      case 'raising':
        // We need the full dataset client-side to determine which mothers are raising kittens.
        // Request a larger limit so client can compute correctly.
        params.limit = 1000;
        break;
      case 'kitten':
        // Kitten filtering is done client-side (motherId present + <12 months old).
        // Make sure we fetch sufficient rows to compute correctly.
        params.limit = 1000;
        break;
      default:
        // For 'cats' tab, also fetch sufficient data for accurate counts
        params.limit = 1000;
        break;
    }

    return params;
  }, [debouncedSearch, activeTab]);

  // API連携でデータ取得
  const { data, isLoading, isError, error, isRefetching, refetch } = useGetCats(queryParams, {
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: statsData } = useGetCatStatistics();

  // 新規登録からの遷移を検知して自動リフレッシュ
  useEffect(() => {
    const refreshParam = searchParams.get('t');
    if (refreshParam) {
      refetch();
      // URLからパラメータを削除
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('t');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams, refetch]);

  // ページヘッダーを設定（マウント時のみ）
  useEffect(() => {
    setPageHeader(
      '在舎猫一覧',
      <Button
        variant="outline"
        color="blue"
        leftSection={<IconPlus size={16} />}
        onClick={() => router.push('/cats/new')}
      >
        新規登録
      </Button>
    );

    // クリーンアップ
    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列でマウント時のみ実行

  const apiCats = data?.data || [];

  // compute counts for kitten / raising
  const kittenCount = apiCats.filter((cat: Cat) => {
    if (!cat.birthDate || !cat.motherId) return false;
    const birthDate = new Date(cat.birthDate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    return ageInDays <= 60; // 60日以内
  }).length;

  // Raising: 新規登録された生後11ヶ月以内の猫
  const raisingCount = apiCats.filter((cat: Cat) => {
    if (!cat.birthDate) return false;
    const birthDate = new Date(cat.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    return ageInMonths < 11; // 11ヶ月以内
  }).length;

  // 年齢計算関数
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths}ヶ月`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years}歳${months}ヶ月` : `${years}歳`;
    }
  };

  const handleViewDetails = (catId: string) => {
    router.push(`/cats/${catId}`);
  };

  // 子猫判定関数（6ヶ月未満）
  const isKitten = (birthDate: string): boolean => {
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return ageInMonths < 6;
  };

  // 子猫の展開/折りたたみトグル
  const toggleExpanded = (motherId: string) => {
    setExpandedMotherIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(motherId)) {
        newSet.delete(motherId);
      } else {
        newSet.add(motherId);
      }
      return newSet;
    });
  };

  // 猫情報の編集
  const _handleEditCat = (cat: Cat) => {
    setSelectedCatForEdit(cat);
    openEditModal();
  };

  // 猫情報の更新
  const updateCatMutation = useUpdateCat(selectedCatForEdit?.id || '');
  const deleteCatMutation = useDeleteCat();
  
  const handleSaveCat = async (catId: string, updates: { name?: string; birthDate?: string }) => {
    await updateCatMutation.mutateAsync(updates);
    refetch();
  };

  // コンテキストメニューからの操作確認
  const handleOperationConfirm = async (cat?: Cat) => {
    if (!currentOperation || !cat) return;

    switch (currentOperation) {
      case 'edit':
        // 編集モーダルを開く
        setSelectedCatForEdit(cat);
        closeOperation();
        openEditModal();
        break;

      case 'delete':
        // 削除実行
        await deleteCatMutation.mutateAsync(cat.id);
        await refetch();
        break;

      case 'duplicate':
        // 複製ロジック（後で実装）
        console.log('Duplicate:', cat);
        break;

      default:
        break;
    }
  };

  // タブ別フィルタリングとソート
  const getFilteredCats = () => {
    let filtered = Array.from(apiCats);
    
    switch (activeTab) {
      case 'male':
        filtered = apiCats.filter((cat: Cat) => cat.gender === 'MALE');
        break;
      case 'female':
        filtered = apiCats.filter((cat: Cat) => cat.gender === 'FEMALE');
        break;
      case 'kitten':
        // 母猫の出産時に登録された生後60日以内の子猫のみ表示
        filtered = apiCats.filter((cat: Cat) => {
          if (!cat.birthDate || !cat.motherId) return false;
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
          return ageInDays <= 60; // 60日以内
        });
        break;
      case 'raising':
        // 新規登録された生後11ヶ月以内の猫（養成中の猫）
        filtered = apiCats.filter((cat: Cat) => {
          if (!cat.birthDate) return false;
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
          return ageInMonths < 11; // 11ヶ月以内
        });
        break;
      default:
        filtered = apiCats;
    }
    
    // 検索フィルター適用
    if (searchTerm) {
      filtered = filtered.filter((cat: Cat) =>
        cat.name.includes(searchTerm) || 
        (cat.coatColor?.name || '').includes(searchTerm) ||
        (cat.breed?.name || '').includes(searchTerm)
      );
    }
    
    // ソート適用
    filtered.sort((a: Cat, b: Cat) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
        case 'breed':
          return (a.breed?.name || '').localeCompare(b.breed?.name || '');
        case 'gender':
          return a.gender.localeCompare(b.gender);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredCats = getFilteredCats();

  // 母猫と子猫を分類
  const { motherCatsWithKittens, adultsWithoutKittens } = useMemo(() => {
    const kittens = filteredCats.filter((cat: Cat) => isKitten(cat.birthDate) && cat.motherId);
    const kittensByMother = new Map<string, Cat[]>();
    
    kittens.forEach((kitten: Cat) => {
      if (kitten.motherId) {
        if (!kittensByMother.has(kitten.motherId)) {
          kittensByMother.set(kitten.motherId, []);
        }
        kittensByMother.get(kitten.motherId)!.push(kitten);
      }
    });

    const kittenIds = new Set(kittens.map((k: Cat) => k.id));
    const adultsWithoutKittens = filteredCats.filter((cat: Cat) => !kittenIds.has(cat.id) && !kittensByMother.has(cat.id));
    const motherCatsWithKittens = filteredCats
      .filter((cat: Cat) => kittensByMother.has(cat.id))
      .map((cat: Cat) => ({
        mother: cat,
        kittens: kittensByMother.get(cat.id) || [],
      }));

    return { motherCatsWithKittens, adultsWithoutKittens };
  }, [filteredCats]);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* メインコンテンツ */}
      <Container size="lg" style={{ paddingTop: '1.5rem' }}>
        {/* タブと検索バー・並び替えを同じ行に */}
        <Box mb="lg">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            {/* 左側: タブ */}
            <Tabs 
              value={activeTab} 
              onChange={(value) => setActiveTab(value || 'cats')} 
              style={{ flex: 1, minWidth: 'fit-content' }}
            >
              <Tabs.List>
                <Tabs.Tab value="cats">Cats ({(statsData && (statsData as any).data?.total) ?? apiCats.length})</Tabs.Tab>
                <Tabs.Tab value="male">Male ({(statsData && (statsData as any).data?.genderDistribution?.MALE) ?? apiCats.filter((c: Cat) => c.gender === 'MALE').length})</Tabs.Tab>
                <Tabs.Tab value="female">Female ({(statsData && (statsData as any).data?.genderDistribution?.FEMALE) ?? apiCats.filter((c: Cat) => c.gender === 'FEMALE').length})</Tabs.Tab>
                <Tabs.Tab value="kitten">Kitten ({kittenCount})</Tabs.Tab>
                <Tabs.Tab value="raising">Raising ({raisingCount})</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {/* 右側: 検索とソート */}
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 'fit-content' }}>
              <TextInput
                placeholder="検索..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="並び替え"
                data={[
                  { value: 'name', label: '名前順' },
                  { value: 'age', label: '年齢順（新しい順）' },
                  { value: 'breed', label: '品種順' },
                  { value: 'gender', label: '性別順' }
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value || 'name')}
                style={{ width: 140 }}
              />
            </Group>
          </Group>
        </Box>

        {/* エラー表示 */}
        {isError && (
          <Alert icon={<IconAlertCircle />} title="エラー" color="red" mb="md">
            {error instanceof Error ? error.message : 'データ取得失敗'}
          </Alert>
        )}

        {/* ローディング */}
        {(isLoading || isRefetching) && (
          <Stack gap="xs">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height={60} radius="md" />
            ))}
          </Stack>
        )}

        {/* 猫リスト（リサイズ可能なテーブル） */}
        {!isLoading && !isError && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Box style={{ overflowX: 'auto', overflowY: 'visible' }}>
              <Table striped highlightOnHover style={{ minWidth: 800, tableLayout: 'fixed' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: `${columnWidths.name}%`, position: 'relative', userSelect: 'none' }}>
                      Name
                      <Box
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 8,
                          cursor: 'col-resize',
                          backgroundColor: resizingColumn === 'name' ? 'var(--mantine-color-blue-5)' : 'transparent',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseDown={(e) => handleResizeStart('name', e)}
                        onMouseEnter={(e) => {
                          if (!resizingColumn) {
                            (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!resizingColumn) {
                            (e.target as HTMLElement).style.backgroundColor = 'transparent';
                          }
                        }}
                      />
                    </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.gender}%`, position: 'relative', userSelect: 'none' }}>
                    Gender
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'gender' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('gender', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.breed}%`, position: 'relative', userSelect: 'none' }}>
                    Breed
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'breed' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('breed', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.age}%`, position: 'relative', userSelect: 'none' }}>
                    Age
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'age' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('age', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.tags}%`, position: 'relative', userSelect: 'none' }}>
                    Tags
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'col-resize',
                        backgroundColor: resizingColumn === 'tags' ? 'var(--mantine-color-blue-5)' : 'transparent',
                      }}
                      onMouseDown={(e) => handleResizeStart('tags', e)}
                      onMouseEnter={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'var(--mantine-color-gray-3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!resizingColumn) {
                          (e.target as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    />
                  </Table.Th>
                  <Table.Th style={{ width: `${columnWidths.actions}%` }}>Operate</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {/* 子猫を持たない成猫 */}
                {adultsWithoutKittens.map((cat: Cat) => (
                  <ContextMenuProvider
                    key={cat.id}
                    entity={cat}
                    entityType="猫"
                    actions={['view', 'edit', 'delete', 'duplicate']}
                    onAction={handleContextAction}
                    enableDoubleClick={true}
                    doubleClickAction="edit"
                  >
                    <Table.Tr 
                      style={{ cursor: 'pointer' }}
                      title="右クリックまたはダブルクリックで操作"
                    >
                      {/* 名前 */}
                      <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Text fw={600}>{cat.name}</Text>
                      </Table.Td>
                      
                      {/* 性別バッジ */}
                      <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <GenderBadge gender={cat.gender} size="sm" />
                      </Table.Td>
                      
                      {/* 品種名 */}
                      <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Text size="sm">{cat.breed?.name || '未登録'}</Text>
                      </Table.Td>
                      
                      {/* 年齢 */}
                      <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <Text size="sm">{calculateAge(cat.birthDate)}</Text>
                      </Table.Td>
                      
                      {/* タグ表示 */}
                      <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {cat.tags && cat.tags.length > 0 ? (
                          <Group gap={4} wrap="nowrap">
                            {cat.tags.slice(0, 3).map((catTag) => (
                              <Badge 
                                key={catTag.tag.id} 
                                size="xs" 
                                variant="dot"
                                color={catTag.tag.color || 'gray'}
                              >
                                {catTag.tag.name}
                              </Badge>
                            ))}
                            {cat.tags.length > 3 && (
                              <Badge size="xs" variant="outline" color="gray">
                                +{cat.tags.length - 3}
                              </Badge>
                            )}
                          </Group>
                        ) : (
                          <Text size="xs" c="dimmed">-</Text>
                        )}
                      </Table.Td>
                      
                      {/* 詳細ボタン */}
                      <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        <Button
                          variant="light"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(cat.id);
                          }}
                        >
                          詳細
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  </ContextMenuProvider>
                ))}

                {/* 子猫を持つ母猫 */}
                {motherCatsWithKittens.map(({ mother, kittens }) => {
                  const isExpanded = expandedMotherIds.has(mother.id);
                  return (
                    <React.Fragment key={mother.id}>
                      {/* 母猫の行 */}
                      <ContextMenuProvider
                        entity={mother}
                        entityType="猫"
                        actions={['view', 'edit', 'delete', 'duplicate']}
                        onAction={handleContextAction}
                        enableDoubleClick={true}
                        doubleClickAction="edit"
                      >
                        <Table.Tr 
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? 'var(--mantine-color-blue-0)' : undefined
                          }}
                          title="右クリックまたはダブルクリックで操作"
                        >
                          {/* 名前（展開アイコン付き） */}
                          <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Group gap="xs" wrap="nowrap">
                              <Text fw={600}>{mother.name}</Text>
                              <Badge 
                                size="xs" 
                                color="pink" 
                                variant="outline"
                                leftSection={isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                                rightSection={<IconCat size={12} />}
                                style={{ 
                                  backgroundColor: 'white',
                                  cursor: 'pointer',
                                  userSelect: 'none'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(mother.id);
                                }}
                              >
                                {kittens.length}
                              </Badge>
                            </Group>
                          </Table.Td>

                          {/* 性別バッジ */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <GenderBadge gender={mother.gender} size="sm" />
                          </Table.Td>
                          
                          {/* 品種名 */}
                          <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Text size="sm">{mother.breed?.name || '未登録'}</Text>
                          </Table.Td>
                          
                          {/* 年齢 */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Text size="sm">{calculateAge(mother.birthDate)}</Text>
                          </Table.Td>
                          
                          {/* タグ表示 */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {mother.tags && mother.tags.length > 0 ? (
                              <Group gap={4} wrap="nowrap">
                                {mother.tags.slice(0, 3).map((catTag) => (
                                  <Badge 
                                    key={catTag.tag.id} 
                                    size="xs" 
                                    variant="dot"
                                    color={catTag.tag.color || 'gray'}
                                  >
                                    {catTag.tag.name}
                                  </Badge>
                                ))}
                                {mother.tags.length > 3 && (
                                  <Badge size="xs" variant="outline" color="gray">
                                    +{mother.tags.length - 3}
                                  </Badge>
                                )}
                              </Group>
                            ) : (
                              <Text size="xs" c="dimmed">-</Text>
                            )}
                          </Table.Td>
                          
                          {/* 詳細ボタン */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Button
                              variant="light"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(mother.id);
                              }}
                            >
                              詳細
                            </Button>
                          </Table.Td>
                        </Table.Tr>
                      </ContextMenuProvider>

                      {/* 子猫の行（展開時） */}
                      {isExpanded && kittens.map((kitten: Cat) => (
                        <ContextMenuProvider
                          key={kitten.id}
                          entity={kitten}
                          entityType="子猫"
                          actions={['view', 'edit', 'delete']}
                          onAction={handleContextAction}
                          enableDoubleClick={true}
                          doubleClickAction="edit"
                        >
                          <Table.Tr 
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: 'var(--mantine-color-gray-0)'
                            }}
                            title="右クリックまたはダブルクリックで操作"
                          >
                            {/* 名前（インデント） */}
                            <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingLeft: '3rem' }}>
                              <Group gap="xs">
                                <IconCat size={14} style={{ color: 'var(--mantine-color-gray-6)' }} />
                                <Text size="sm">{kitten.name}</Text>
                              </Group>
                            </Table.Td>

                            {/* 性別バッジ */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <GenderBadge gender={kitten.gender} size="sm" />
                            </Table.Td>
                            
                            {/* 品種名 */}
                            <Table.Td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <Text size="sm">{kitten.breed?.name || '未登録'}</Text>
                            </Table.Td>
                            
                            {/* 年齢 */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <Text size="sm">{calculateAge(kitten.birthDate)}</Text>
                            </Table.Td>
                            
                            {/* タグ表示 */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {kitten.tags && kitten.tags.length > 0 ? (
                                <Group gap={4} wrap="nowrap">
                                  {kitten.tags.slice(0, 3).map((catTag) => (
                                    <Badge 
                                      key={catTag.tag.id} 
                                      size="xs" 
                                      variant="dot"
                                      color={catTag.tag.color || 'gray'}
                                    >
                                      {catTag.tag.name}
                                    </Badge>
                                  ))}
                                  {kitten.tags.length > 3 && (
                                    <Badge size="xs" variant="outline" color="gray">
                                      +{kitten.tags.length - 3}
                                    </Badge>
                                  )}
                                </Group>
                              ) : (
                                <Text size="xs" c="dimmed">-</Text>
                              )}
                            </Table.Td>
                            
                            {/* 詳細ボタン */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <Button
                                variant="light"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(kitten.id);
                                }}
                              >
                                詳細
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        </ContextMenuProvider>
                      ))}
                    </React.Fragment>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Box>
        </Card>
        )}

        {!isLoading && !isError && filteredCats.length === 0 && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Text ta="center">
              条件に一致する猫が見つかりませんでした
            </Text>
          </Card>
        )}
      </Container>

      {/* 猫情報編集モーダル */}
      {selectedCatForEdit && (
        <CatQuickEditModal
          opened={editModalOpened}
          onClose={closeEditModal}
          catId={selectedCatForEdit.id}
          catName={selectedCatForEdit.name}
          birthDate={selectedCatForEdit.birthDate}
          onSave={handleSaveCat}
        />
      )}

      {/* コンテキストメニュー操作モーダル */}
      <OperationModalManager
        operationType={currentOperation}
        entity={currentEntity || undefined}
        entityType="猫"
        onClose={closeOperation}
        onConfirm={handleOperationConfirm}
      />
    </Box>
  );
}
