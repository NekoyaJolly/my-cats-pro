'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Paper,
  TextInput,
  Select,
  Table,
  Pagination,
  Badge,
  Group,
  Stack,
  Text,
  Card,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
  ScrollArea,
} from '@mantine/core';
import { IconSearch, IconFilter, IconFileText, IconRefresh, IconPrinter, IconCopy } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useGetPedigrees } from '@/lib/api/hooks/use-pedigrees';
import { getPublicApiBaseUrl } from '@/lib/api/public-api-base-url';

interface PedigreeData {
  id: string;
  pedigreeId: string;
  catName: string;
  breedCode: number | null;
  genderCode: number | null;
  gender?: { code: number; name: string } | null;
  breed?: { code: number; name: string } | null;
  coatColor?: { code: number; name: string } | null;
  birthDate: string | null;
  breederName: string | null;
  ownerName: string | null;
  registrationDate: string | null;
  notes: string | null;
  fatherPedigree?: { pedigreeId: string; catName: string } | null;
  motherPedigree?: { pedigreeId: string; catName: string } | null;
}

// カラム検索用のフィルター状態
interface ColumnFilters {
  pedigreeId: string;
  catName: string;
  gender: string;
  breed: string;
  coatColor: string;
  birthDate: string;
  breederName: string;
  father: string;
  mother: string;
}

const INITIAL_COLUMN_FILTERS: ColumnFilters = {
  pedigreeId: '',
  catName: '',
  gender: '',
  breed: '',
  coatColor: '',
  birthDate: '',
  breederName: '',
  father: '',
  mother: '',
};

// テーブルセルの共通スタイル（折り返し防止）
const noWrapCellStyle: React.CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '180px',
};

interface PedigreeListProps {
  onSelectFamilyTree?: (id: string) => void;
}

export function PedigreeList({ onSelectFamilyTree }: PedigreeListProps) {
  const router = useRouter();
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>(INITIAL_COLUMN_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const apiBaseUrl = getPublicApiBaseUrl();

  const genderOptions = [
    { value: '', label: '全て' },
    { value: '1', label: '雄' },
    { value: '2', label: '雌' },
  ];

  // カラムフィルターから統合検索文字列を生成
  const searchTerm = useMemo(() => {
    const terms = [
      columnFilters.pedigreeId,
      columnFilters.catName,
      columnFilters.breed,
      columnFilters.coatColor,
      columnFilters.birthDate,
      columnFilters.breederName,
      columnFilters.father,
      columnFilters.mother,
    ].filter(t => t.trim().length > 0);
    return terms.length > 0 ? terms[0] : undefined;
  }, [columnFilters]);

  // React Query フックでデータ取得
  const { data, isLoading, refetch } = useGetPedigrees({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    gender: columnFilters.gender || undefined,
  });

  const pedigrees = useMemo(() => (data?.data || []) as unknown as PedigreeData[], [data?.data]);
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  // カラムフィルターの変更ハンドラ
  const updateColumnFilter = useCallback((field: keyof ColumnFilters, value: string) => {
    setColumnFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatGender = (pedigree: PedigreeData) => {
    if (pedigree.gender?.name) {
      return pedigree.gender.name;
    }
    switch (pedigree.genderCode) {
      case 1: return 'Male';
      case 2: return 'Female';
      case 3: return 'Neuter';
      case 4: return 'Spay';
      default: return 'Unknown';
    }
  };

  const getGenderColor = (pedigree: PedigreeData) => {
    const code = pedigree.gender?.code ?? pedigree.genderCode;
    switch (code) {
      case 1: return 'blue';
      case 2: return 'pink';
      case 3: return 'cyan';
      case 4: return 'violet';
      default: return 'gray';
    }
  };

  const openPedigreePdf = (pedigreeId: string) => {
    const pdfUrl = `${apiBaseUrl}/pedigrees/pedigree-id/${encodeURIComponent(pedigreeId)}/pdf`;

    const newTab = window.open(pdfUrl, '_blank');
    if (!newTab) {
      // ポップアップがブロックされた場合は同一タブで開く
      window.location.assign(pdfUrl);
    }
  };

  // クライアントサイドフィルタリング（APIサーバー側でカラム別検索未対応の場合の補完）
  const filteredPedigrees = useMemo(() => {
    return pedigrees.filter(p => {
      if (columnFilters.pedigreeId && !p.pedigreeId.toLowerCase().includes(columnFilters.pedigreeId.toLowerCase())) return false;
      if (columnFilters.catName && !(p.catName || '').toLowerCase().includes(columnFilters.catName.toLowerCase())) return false;
      if (columnFilters.breed && !(p.breed?.name || '').toLowerCase().includes(columnFilters.breed.toLowerCase())) return false;
      if (columnFilters.coatColor && !(p.coatColor?.name || '').toLowerCase().includes(columnFilters.coatColor.toLowerCase())) return false;
      if (columnFilters.breederName && !(p.breederName || '').toLowerCase().includes(columnFilters.breederName.toLowerCase())) return false;
      if (columnFilters.father) {
        const fatherText = p.fatherPedigree ? `${p.fatherPedigree.pedigreeId} ${p.fatherPedigree.catName}` : '';
        if (!fatherText.toLowerCase().includes(columnFilters.father.toLowerCase())) return false;
      }
      if (columnFilters.mother) {
        const motherText = p.motherPedigree ? `${p.motherPedigree.pedigreeId} ${p.motherPedigree.catName}` : '';
        if (!motherText.toLowerCase().includes(columnFilters.mother.toLowerCase())) return false;
      }
      return true;
    });
  }, [pedigrees, columnFilters]);

  // 検索入力欄の共通スタイル
  const searchInputStyles = {
    input: {
      height: '28px',
      minHeight: '28px',
      fontSize: '12px',
    },
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <Badge size="lg" color="blue">
            総計: {total}件
          </Badge>
        </Group>
        <ActionIcon
          variant="light"
          onClick={() => refetch()}
          size="lg"
        >
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>

      {/* 血統書リストテーブル（カラム検索付き） */}
      <Paper shadow="sm" style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />

        <ScrollArea type="auto">
          <Table striped highlightOnHover style={{ minWidth: '1000px' }}>
            <Table.Thead>
              {/* Row 1: テーブルヘッダー */}
              <Table.Tr>
                <Table.Th style={noWrapCellStyle}>血統書番号</Table.Th>
                <Table.Th style={noWrapCellStyle}>名前</Table.Th>
                <Table.Th style={noWrapCellStyle}>性別</Table.Th>
                <Table.Th style={noWrapCellStyle}>猫種</Table.Th>
                <Table.Th style={noWrapCellStyle}>色柄</Table.Th>
                <Table.Th style={noWrapCellStyle}>生年月日</Table.Th>
                <Table.Th style={noWrapCellStyle}>繁殖者</Table.Th>
                <Table.Th style={noWrapCellStyle}>父親</Table.Th>
                <Table.Th style={noWrapCellStyle}>母親</Table.Th>
                <Table.Th style={{ whiteSpace: 'nowrap' }}>操作</Table.Th>
              </Table.Tr>

              {/* Row 2: カラム別検索行 */}
              <Table.Tr style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="番号..."
                    size="xs"
                    value={columnFilters.pedigreeId}
                    onChange={(e) => updateColumnFilter('pedigreeId', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="名前..."
                    size="xs"
                    value={columnFilters.catName}
                    onChange={(e) => updateColumnFilter('catName', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <Select
                    placeholder="性別"
                    size="xs"
                    data={genderOptions}
                    value={columnFilters.gender}
                    onChange={(v) => updateColumnFilter('gender', v || '')}
                    leftSection={<IconFilter size={12} />}
                    clearable
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="猫種..."
                    size="xs"
                    value={columnFilters.breed}
                    onChange={(e) => updateColumnFilter('breed', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="色柄..."
                    size="xs"
                    value={columnFilters.coatColor}
                    onChange={(e) => updateColumnFilter('coatColor', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="日付..."
                    size="xs"
                    value={columnFilters.birthDate}
                    onChange={(e) => updateColumnFilter('birthDate', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="繁殖者..."
                    size="xs"
                    value={columnFilters.breederName}
                    onChange={(e) => updateColumnFilter('breederName', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="父親..."
                    size="xs"
                    value={columnFilters.father}
                    onChange={(e) => updateColumnFilter('father', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  <TextInput
                    placeholder="母親..."
                    size="xs"
                    value={columnFilters.mother}
                    onChange={(e) => updateColumnFilter('mother', e.target.value)}
                    leftSection={<IconSearch size={12} />}
                    styles={searchInputStyles}
                  />
                </Table.Th>
                <Table.Th style={{ padding: '4px' }}>
                  {/* 操作列は検索不要 */}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPedigrees.map((pedigree) => (
                <Table.Tr key={pedigree.id}>
                  <Table.Td style={noWrapCellStyle}>
                    <Text fw={600} size="sm">
                      {pedigree.pedigreeId}
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text fw={500}>
                      {pedigree.catName || '名前なし'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Badge color={getGenderColor(pedigree)} size="sm" tt="none">
                      {formatGender(pedigree)}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text size="sm">
                      {pedigree.breed?.name || pedigree.breedCode || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text size="sm">
                      {pedigree.coatColor?.name || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text size="sm">
                      {formatDate(pedigree.birthDate)}
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text size="sm" c="dimmed">
                      {pedigree.breederName || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text size="sm" c="blue">
                      {pedigree.fatherPedigree
                        ? `${pedigree.fatherPedigree.pedigreeId} (${pedigree.fatherPedigree.catName})`
                        : '-'
                      }
                    </Text>
                  </Table.Td>
                  <Table.Td style={noWrapCellStyle}>
                    <Text size="sm" c="pink">
                      {pedigree.motherPedigree
                        ? `${pedigree.motherPedigree.pedigreeId} (${pedigree.motherPedigree.catName})`
                        : '-'
                      }
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ whiteSpace: 'nowrap' }}>
                    <Group gap="xs" wrap="nowrap">
                      <Tooltip label="家系図を見る">
                        <ActionIcon
                          variant="light"
                          color="green"
                          aria-label="家系図を見る"
                          onClick={() => onSelectFamilyTree ? onSelectFamilyTree(pedigree.id) : router.push(`/pedigrees?tab=tree&id=${pedigree.id}`)}
                        >
                          <IconFileText size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="新規登録にコピー">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          aria-label="新規登録にコピー"
                          onClick={() => router.push(`/pedigrees?tab=register&copyFromId=${encodeURIComponent(pedigree.id)}`)}
                        >
                          <IconCopy size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="血統書PDFを印刷">
                        <ActionIcon
                          variant="light"
                          color="orange"
                          aria-label="血統書PDFを印刷"
                          onClick={() => {
                            openPedigreePdf(pedigree.pedigreeId);
                          }}
                        >
                          <IconPrinter size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredPedigrees.length === 0 && !isLoading && (
          <Card mt="md" p="xl" style={{ textAlign: 'center' }}>
            <Text size="lg" c="dimmed">
              血統書データが見つかりませんでした
            </Text>
            <Text size="sm" c="dimmed" mt="xs">
              検索条件を変更してお試しください
            </Text>
          </Card>
        )}
      </Paper>

      {/* ページネーション */}
      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={currentPage}
            onChange={handlePageChange}
            total={totalPages}
            size="md"
          />
        </Group>
      )}
    </Stack>
  );
}
