'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Text,
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
import { IconSearch, IconAlertCircle, IconCat, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useGetCats, useGetCatStatistics, useDeleteCat, type Cat, type GetCatsParams, type TabCounts } from '@/lib/api/hooks/use-cats';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { CatEditModal } from '@/components/cats/cat-edit-modal';
import { ContextMenuProvider, OperationModalManager, useContextMenu } from '@/components/context-menu';
import { GenderBadge } from '@/components/GenderBadge';

export default function CatsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPageHeader } = usePageHeader();
  
  // URLパラメータからタブを取得（初期値は'cats'）
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam || 'cats';
  });
  
  const [sortBy, setSortBy] = useState('name');
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  
  // 子猫の展開/折りたたみ状態
  const [expandedMotherIds, setExpandedMotherIds] = useState<Set<string>>(new Set());
  
  // 編集モーダルの状態
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<Cat | null>(null);

  // コンテキストメニュー
  const {
    currentOperation,
    currentEntity,
    closeOperation,
    handleAction: handleContextAction,
  } = useContextMenu<Cat>({
    view: (cat) => {
      if (cat) {
        router.push(`/cats/${cat.id}`);
      }
    },
    edit: (cat) => {
      if (cat) {
        setSelectedCatForEdit(cat);
        openEditModal();
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
    const params: GetCatsParams = {
      limit: 1000, // 全タブで十分なデータを取得
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    // タブに関わらず全猫を取得（フィルタリングはクライアント側で実行）
    // これによりタブカウントが動的に変わることを防ぐ

    return params;
  }, [debouncedSearch]); // activeTabを依存配列から削除

  // API連携でデータ取得
  const { data, isLoading, isError, error, isRefetching, refetch } = useGetCats(queryParams, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
  });

  // 統計情報を取得（タブカウント用）
  const { data: statisticsData, isLoading: isStatisticsLoading } = useGetCatStatistics({
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを使用
  });

  // サーバーサイドのタブカウントを使用（フォールバック付き）
  const tabCounts: TabCounts = statisticsData?.tabCounts ?? {
    total: 0,
    male: 0,
    female: 0,
    kitten: 0,
    raising: 0,
    grad: 0,
  };

  // URLパラメータからタブを取得して反映
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['cats', 'male', 'female', 'kitten', 'raising', 'grad'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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
      <ActionButton
        action="create"
        onClick={() => router.push('/cats/new')}
      >
        新規登録
      </ActionButton>
    );

    // クリーンアップ
    return () => setPageHeader(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空の依存配列でマウント時のみ実行

  const apiCats = data?.data || [];

  // 在舎猫のみを対象とする（フィルタリング用）
  const inHouseCats = apiCats.filter((cat: Cat) => cat.isInHouse);

  // 子猫判定関数（6ヶ月未満）を先に定義
  const isKittenFunc = (birthDate: string): boolean => {
    const birth = new Date(birthDate);
    const now = new Date();
    const ageInMonths = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return ageInMonths < 6;
  };

  // 成猫のみ（子猫を除外）- フィルタリング用
  const adultCats = inHouseCats.filter((cat: Cat) => !isKittenFunc(cat.birthDate));

  // タブカウントはサーバーサイドの統計データを使用
  // ローディング中はフォールバック値（0）を表示
  const totalCount = tabCounts.total;
  const maleCount = tabCounts.male;
  const femaleCount = tabCounts.female;
  const kittenCount = tabCounts.kitten;
  const raisingCount = tabCounts.raising;
  const gradCount = tabCounts.grad;

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
  const isKitten = useCallback((birthDate: string): boolean => {
    return isKittenFunc(birthDate);
  }, []);

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

  // 猫情報の更新
  const deleteCatMutation = useDeleteCat();

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
    let filtered: Cat[] = [];
    
    switch (activeTab) {
      case 'male':
        // 在舎猫登録されていて、性別がMaleの成猫のみ（子猫除外）
        filtered = adultCats.filter((cat: Cat) => cat.gender === 'MALE');
        break;
      case 'female':
        // 在舎猫登録されていて、性別がFemaleの猫（成猫+子猫、表示時に子猫は母猫に格納）
        filtered = inHouseCats.filter((cat: Cat) => cat.gender === 'FEMALE');
        break;
      case 'kitten':
        // 母猫名が入力されてる生後3ヶ月(90日)以内の猫
        filtered = inHouseCats.filter((cat: Cat) => {
          if (!cat.birthDate || !cat.motherId) return false;
          const birthDate = new Date(cat.birthDate);
          const today = new Date();
          const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
          return ageInDays <= 90; // 3ヶ月(90日)以内
        });
        break;
      case 'raising':
        // 養成中タグがついてる猫
        filtered = inHouseCats.filter((cat: Cat) => {
          return cat.tags?.some((catTag) => catTag.tag.name === '養成中');
        });
        break;
      case 'grad':
        // 卒業予定タグがついてる猫
        filtered = inHouseCats.filter((cat: Cat) => {
          return cat.tags?.some((catTag) => catTag.tag.name === '卒業予定');
        });
        break;
      case 'cats':
      default:
        // 在舎登録されている全ての猫（成猫+子猫、表示時に子猫は母猫に格納）
        filtered = inHouseCats;
        break;
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
        case 'gender-name': {
          // 性別順（メス→オス）→名前順
          const genderCompare = a.gender.localeCompare(b.gender);
          if (genderCompare !== 0) return genderCompare;
          return a.name.localeCompare(b.name);
        }
        case 'gender-age': {
          // 性別順（メス→オス）→年齢順（新しい順）
          const genderCompare2 = a.gender.localeCompare(b.gender);
          if (genderCompare2 !== 0) return genderCompare2;
          return new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime();
        }
        case 'breed-name': {
          // 品種順→名前順
          const breedCompare = (a.breed?.name || '').localeCompare(b.breed?.name || '');
          if (breedCompare !== 0) return breedCompare;
          return a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredCats = getFilteredCats();

  // 母猫の子猫マップと表示用猫リストを作成
  const { displayCats, kittensByMother } = useMemo(() => {
    // Maleタブ: 成猫のオスのみ表示（子猫完全除外）
    if (activeTab === 'male') {
      return { displayCats: filteredCats, kittensByMother: new Map<string, Cat[]>() };
    }
    
    // Kittenタブ: 子猫全頭を個別表示（母猫に格納しない）
    if (activeTab === 'kitten') {
      return { displayCats: filteredCats, kittensByMother: new Map<string, Cat[]>() };
    }
    
    // Gradタブ: 個別表示（母猫に格納しない）
    if (activeTab === 'grad') {
      return { displayCats: filteredCats, kittensByMother: new Map<string, Cat[]>() };
    }
    
    // Cats/Female/Raisingタブ: 母猫に子猫を格納して表示
    const kittens = filteredCats.filter((cat: Cat) => isKitten(cat.birthDate) && cat.motherId);
    const kittensByMotherMap = new Map<string, Cat[]>();
    
    kittens.forEach((kitten: Cat) => {
      if (kitten.motherId) {
        if (!kittensByMotherMap.has(kitten.motherId)) {
          kittensByMotherMap.set(kitten.motherId, []);
        }
        const siblings = kittensByMotherMap.get(kitten.motherId);
        if (siblings) {
          siblings.push(kitten);
        }
      }
    });

    // 子猫を除外した表示用リスト（母猫は含む、ソート順を維持）
    const kittenIds = new Set(kittens.map((k: Cat) => k.id));
    const displayCats = filteredCats.filter((cat: Cat) => !kittenIds.has(cat.id));

    return { displayCats, kittensByMother: kittensByMotherMap };
  }, [filteredCats, activeTab, isKitten]);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* メインコンテンツ */}
      <Container size="lg">
        {/* タブと検索バー・並び替えを同じ行に */}
        <Box mb="lg">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            {/* 左側: タブ */}
            <Tabs 
              value={activeTab} 
              onChange={(value) => setActiveTab(value || 'cats')} 
              style={{ flex: 1, minWidth: 'fit-content' }}
              variant="outline"
              radius="0"
            >
              <Tabs.List grow>
                <Tabs.Tab value="cats">Cats ({isStatisticsLoading ? '...' : totalCount})</Tabs.Tab>
                <Tabs.Tab value="male">Male ({isStatisticsLoading ? '...' : maleCount})</Tabs.Tab>
                <Tabs.Tab value="female">Female ({isStatisticsLoading ? '...' : femaleCount})</Tabs.Tab>
                <Tabs.Tab value="kitten">Kitten ({isStatisticsLoading ? '...' : kittenCount})</Tabs.Tab>
                <Tabs.Tab value="raising">Raising ({isStatisticsLoading ? '...' : raisingCount})</Tabs.Tab>
                <Tabs.Tab value="grad">Grad ({isStatisticsLoading ? '...' : gradCount})</Tabs.Tab>
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
                  { value: 'gender', label: '性別順' },
                  { value: 'gender-name', label: '性別 → 名前順' },
                  { value: 'gender-age', label: '性別 → 年齢順' },
                  { value: 'breed-name', label: '品種 → 名前順' },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value || 'name')}
                style={{ width: 180 }}
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
                {/* ソート済みの猫リストを1つずつ表示 */}
                {displayCats.map((cat: Cat) => {
                  const kittens = kittensByMother.get(cat.id) || [];
                  const hasMother = kittens.length > 0;
                  const isExpanded = expandedMotherIds.has(cat.id);

                  return (
                    <React.Fragment key={cat.id}>
                      {/* 猫の行（母猫または通常の猫） */}
                      <ContextMenuProvider
                        entity={cat}
                        entityType="猫"
                        actions={['view', 'edit', 'delete', 'duplicate']}
                        onAction={handleContextAction}
                        enableDoubleClick={true}
                        doubleClickAction="edit"
                      >
                        <Table.Tr 
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: (hasMother && isExpanded) ? 'var(--mantine-color-blue-0)' : undefined
                          }}
                          title="右クリックまたはダブルクリックで操作"
                        >
                          {/* 名前 */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {hasMother ? (
                              <Group gap="xs" wrap="nowrap" justify="space-between" style={{ width: '100%' }}>
                                <Text fw={600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                  {cat.name}
                                </Text>
                                <Badge 
                                  size="xs" 
                                  color="pink" 
                                  variant="outline"
                                  leftSection={isExpanded ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
                                  rightSection={<IconCat size={12} />}
                                  style={{ 
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    flexShrink: 0
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(cat.id);
                                  }}
                                >
                                  {kittens.length}
                                </Badge>
                              </Group>
                            ) : (
                              <Text fw={600} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cat.name}
                              </Text>
                            )}
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
                          
                          {/* 操作アイコン */}
                          <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <Group gap="xs" wrap="nowrap">
                              <ActionIconButton
                                action="edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCatForEdit(cat);
                                  openEditModal();
                                }}
                                title="編集"
                              />
                              <ActionIconButton
                                action="delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContextAction('delete', cat);
                                }}
                                title="削除"
                              />
                              <ActionIconButton
                                action="view"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(cat.id);
                                }}
                                title="詳細"
                              />
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      </ContextMenuProvider>

                      {/* 子猫の行（展開時） */}
                      {hasMother && isExpanded && kittens.map((kitten: Cat) => (
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
                            
                            {/* 操作アイコン */}
                            <Table.Td style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              <Group gap="xs" wrap="nowrap">
                                <ActionIconButton
                                  action="edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCatForEdit(kitten);
                                    openEditModal();
                                  }}
                                  title="編集"
                                />
                                <ActionIconButton
                                  action="delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleContextAction('delete', kitten);
                                  }}
                                  title="削除"
                                />
                                <ActionIconButton
                                  action="view"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(kitten.id);
                                  }}
                                  title="詳細"
                                />
                              </Group>
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
        <CatEditModal
          opened={editModalOpened}
          onClose={closeEditModal}
          catId={selectedCatForEdit.id}
          onSuccess={() => {
            refetch();
          }}
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
