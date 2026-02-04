'use client';

import { useState } from 'react';
import {
  Paper,
  TextInput,
  Select,
  Button,
  Table,
  Pagination,
  Badge,
  Group,
  Stack,
  Text,
  Card,
  Grid,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
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

interface PedigreeListProps {
  onSelectFamilyTree?: (id: string) => void;
}

export function PedigreeList({ onSelectFamilyTree }: PedigreeListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const apiBaseUrl = getPublicApiBaseUrl();

  const genderOptions = [
    { value: '', label: '全て' },
    { value: '1', label: '雄' },
    { value: '2', label: '雌' },
  ];

  // React Query フックでデータ取得
  const { data, isLoading, refetch } = useGetPedigrees({
    page: currentPage,
    limit: 20,
    search: searchTerm || undefined,
    gender: genderFilter || undefined,
  });

  const pedigrees = (data?.data || []) as unknown as PedigreeData[];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

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

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group>
          <Badge size="lg" color="blue">
            総計: {total}件
          </Badge>
        </Group>
      </Group>

      {/* フィルター・検索セクション */}
      <Paper p="md" shadow="sm">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="猫名、繁殖者名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Select
              placeholder="性別で絞り込み"
              data={genderOptions}
              value={genderFilter}
              onChange={setGenderFilter}
              leftSection={<IconFilter size={16} />}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Group>
              <Button onClick={handleSearch} leftSection={<IconSearch size={16} />}>
                検索
              </Button>
              <ActionIcon
                variant="light"
                onClick={() => refetch()}
                size="lg"
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* 血統書リストテーブル */}
      <Paper shadow="sm" style={{ position: 'relative' }}>
        <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>血統書番号</Table.Th>
              <Table.Th>名前</Table.Th>
              <Table.Th>性別</Table.Th>
              <Table.Th>猫種</Table.Th>
              <Table.Th>色柄</Table.Th>
              <Table.Th>生年月日</Table.Th>
              <Table.Th>繁殖者</Table.Th>
              <Table.Th>父親</Table.Th>
              <Table.Th>母親</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pedigrees.map((pedigree) => (
              <Table.Tr key={pedigree.id}>
                <Table.Td>
                  <Text fw={600} size="sm">
                    {pedigree.pedigreeId}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={500}>
                    {pedigree.catName || '名前なし'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getGenderColor(pedigree)} size="sm" tt="none">
                    {formatGender(pedigree)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {pedigree.breed?.name || pedigree.breedCode || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {pedigree.coatColor?.name || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {formatDate(pedigree.birthDate)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {pedigree.breederName || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="blue">
                    {pedigree.fatherPedigree
                      ? `${pedigree.fatherPedigree.pedigreeId} (${pedigree.fatherPedigree.catName})`
                      : '-'
                    }
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="pink">
                    {pedigree.motherPedigree
                      ? `${pedigree.motherPedigree.pedigreeId} (${pedigree.motherPedigree.catName})`
                      : '-'
                    }
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
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

        {pedigrees.length === 0 && !isLoading && (
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
