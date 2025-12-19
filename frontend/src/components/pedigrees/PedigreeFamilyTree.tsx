'use client';

import React, { useState, useEffect } from 'react';
import {
  Title,
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Card,
  LoadingOverlay,
  Alert,
  Grid,
  Select,
  Center,
} from '@mantine/core';
import { IconDna, IconBinaryTree } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { apiClient, type ApiRequestOptions } from '@/lib/api/client';

const MAX_VALIDATION_DEPTH = 6;
type FamilyTreeRequestOptions = {
  pathParams: { id: string };
  query: { generations: number };
};

const toApiRequestOptions = (
  options: FamilyTreeRequestOptions,
): ApiRequestOptions<'/pedigrees/{id}/family-tree', 'get'> =>
  options as unknown as ApiRequestOptions<'/pedigrees/{id}/family-tree', 'get'>; // TODO: スキーマ更新後に除去する

interface FamilyTreeData {
  id: string;
  pedigreeId: string;
  catName: string;
  breedCode: number | null;
  gender: number | null;
  birthDate: string | null;
  coatColorCode: number | null;
  breed?: { name: string } | null;
  color?: { name: string } | null;
  father?: FamilyTreeData | null;
  mother?: FamilyTreeData | null;
}

interface PedigreeFamilyTreeProps {
  pedigreeId?: string | null;
}

const isFamilyTreeData = (value: unknown, depth = 0): value is FamilyTreeData => {
  if (depth > MAX_VALIDATION_DEPTH) {
    console.warn('家系図データの検証深度が上限を超えました');
    return false;
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  const isNullableNumber = (target: unknown): target is number | null => typeof target === 'number' || target === null;
  const isNullableString = (target: unknown): target is string | null =>
    typeof target === 'string' || target === null;
  const isNamedObject = (target: unknown): target is { name: string } =>
    typeof target === 'object' && target !== null && typeof (target as Record<string, unknown>).name === 'string';
  const isParentNode = (target: unknown): target is FamilyTreeData =>
    target === undefined || target === null || isFamilyTreeData(target, depth + 1);

  if (typeof record.id !== 'string' || typeof record.pedigreeId !== 'string' || typeof record.catName !== 'string') {
    return false;
  }

  if (
    !isNullableNumber(record.breedCode)
    || !isNullableNumber(record.gender)
    || !isNullableString(record.birthDate)
    || !isNullableNumber(record.coatColorCode)
  ) {
    return false;
  }

  if ((record.breed !== undefined && record.breed !== null && !isNamedObject(record.breed))
    || (record.color !== undefined && record.color !== null && !isNamedObject(record.color))) {
    return false;
  }

  return isParentNode(record.father) && isParentNode(record.mother);
};

export function PedigreeFamilyTree({ pedigreeId }: PedigreeFamilyTreeProps) {
  const router = useRouter();
  
  const [familyTree, setFamilyTree] = useState<FamilyTreeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState('3');

  const generationOptions = [
    { value: '2', label: '2世代' },
    { value: '3', label: '3世代' },
    { value: '4', label: '4世代' },
    { value: '5', label: '5世代' },
  ];

  useEffect(() => {
    if (!pedigreeId) {
      setFamilyTree(null);
      return;
    }

    const fetchFamilyTree = async () => {
      try {
        setLoading(true);
        setError(null);
        const requestOptions: FamilyTreeRequestOptions = {
          pathParams: { id: pedigreeId },
          query: { generations: Number(generations) },
        };

        const response = await apiClient.get(
          '/pedigrees/{id}/family-tree',
          toApiRequestOptions(requestOptions),
        );

        if (!response.success) {
          throw new Error(response.error ?? '家系図データの取得に失敗しました');
        }

        if (!response.data) {
          throw new Error('家系図データが見つかりませんでした');
        }

        if (!isFamilyTreeData(response.data)) {
          throw new Error('家系図データの形式が不正です');
        }

        setFamilyTree(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyTree();
  }, [pedigreeId, generations]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '不明';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatGender = (gender: number | null) => {
    switch (gender) {
      case 1: return '雄';
      case 2: return '雌';
      default: return '不明';
    }
  };

  const getGenderColor = (gender: number | null) => {
    switch (gender) {
      case 1: return 'blue';
      case 2: return 'pink';
      default: return 'gray';
    }
  };

  const PedigreeCard: React.FC<{ 
    pedigree: FamilyTreeData | null;
    level: number;
    position?: 'father' | 'mother';
  }> = ({ pedigree, level: _level, position }) => {
    if (!pedigree) {
      return (
        <Card 
          p="sm" 
          style={{ 
            border: '2px dashed #dee2e6',
            minHeight: '120px',
            backgroundColor: 'var(--mantine-color-body)'
          }}
        >
          <Text c="dimmed" ta="center" mt="md">
            情報なし
          </Text>
        </Card>
      );
    }

    const borderColor = position === 'father' ? '#228be6' : position === 'mother' ? '#e64980' : '#868e96';
    
    return (
      <Card 
        p="sm" 
        style={{ 
          border: `2px solid ${borderColor}`,
          cursor: 'pointer',
          transition: 'all 0.2s',
          minHeight: '120px'
        }}
        onClick={() => router.push(`/pedigrees/${pedigree.id}`)}
      >
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="sm" lineClamp={1}>
                {pedigree.catName || '名前なし'}
              </Text>
            </div>
            <Badge size="xs" color={getGenderColor(pedigree.gender)}>
              {formatGender(pedigree.gender)}
            </Badge>
          </Group>
          
          <div>
            <Text size="xs" fw={500} c="blue">
              {pedigree.pedigreeId}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(pedigree.birthDate)}
            </Text>
          </div>

          {pedigree.breed && (
            <Badge size="xs" variant="light">
              {pedigree.breed.name}
            </Badge>
          )}
        </Stack>
      </Card>
    );
  };

  const renderFamilyLevel = (pedigree: FamilyTreeData | null, currentLevel: number, maxLevel: number): React.ReactNode => {
    if (!pedigree || currentLevel > maxLevel) {
      return null;
    }

    return (
      <div key={`level-${currentLevel}-${pedigree.id}`}>
        <Grid gutter="md" mb="md">
          {/* 現在の個体 */}
          <Grid.Col span={12}>
            <Text fw={600} mb="sm" ta="center">
              {currentLevel === 0 ? '本猫' : `第${currentLevel}世代`}
            </Text>
            <Group justify="center">
              <div style={{ width: currentLevel === 0 ? '300px' : '250px' }}>
                <PedigreeCard pedigree={pedigree} level={currentLevel} />
              </div>
            </Group>
          </Grid.Col>

          {/* 両親 */}
          {(pedigree.father || pedigree.mother) && currentLevel < maxLevel && (
            <Grid.Col span={12}>
              <Text fw={600} mb="sm" ta="center">
                両親
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} mb="xs" ta="center" c="blue">
                    <Group justify="center" gap="xs">
                      <IconDna size={16} />
                      父親
                    </Group>
                  </Text>
                  <PedigreeCard pedigree={pedigree.father || null} level={currentLevel + 1} position="father" />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" fw={500} mb="xs" ta="center" c="pink">
                    <Group justify="center" gap="xs">
                      <IconDna size={16} />
                      母親
                    </Group>
                  </Text>
                  <PedigreeCard pedigree={pedigree.mother || null} level={currentLevel + 1} position="mother" />
                </Grid.Col>
              </Grid>
            </Grid.Col>
          )}
        </Grid>

        {/* 祖父母以上の世代を再帰的に表示 */}
        {currentLevel < maxLevel - 1 && (pedigree.father || pedigree.mother) && (
          <div style={{ marginLeft: '20px', paddingLeft: '20px', borderLeft: '2px solid #dee2e6' }}>
            {pedigree.father && renderFamilyLevel(pedigree.father as FamilyTreeData, currentLevel + 1, maxLevel)}
            {pedigree.mother && renderFamilyLevel(pedigree.mother as FamilyTreeData, currentLevel + 1, maxLevel)}
          </div>
        )}
      </div>
    );
  };

  if (!pedigreeId) {
    return (
      <Paper p="xl" withBorder>
        <Center>
          <Stack align="center">
            <IconBinaryTree size={48} color="gray" />
            <Text size="lg" fw={500}>家系図表示</Text>
            <Text c="dimmed">
              データ管理タブから猫を選択して家系図を表示してください。
            </Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper p="md" style={{ position: 'relative', minHeight: '400px' }}>
        <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
      </Paper>
    );
  }

  if (error || !familyTree) {
    return (
      <Alert color="red" title="エラー">
        {error || '家系図データが見つかりませんでした'}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* ヘッダー */}
      <Group justify="space-between">
        <Group>
          <Title order={3}>
            {familyTree.catName}の家系図
          </Title>
          <Badge size="lg" color="blue">
            血統書番号: {familyTree.pedigreeId}
          </Badge>
        </Group>
        <Group>
          <Select
            label="表示世代数"
            data={generationOptions}
            value={generations}
            onChange={(value) => setGenerations(value || '3')}
            w={120}
          />
        </Group>
      </Group>

      <Group>
        <Badge size="lg" color={getGenderColor(familyTree.gender)}>
          {formatGender(familyTree.gender)}
        </Badge>
        {familyTree.breed && (
          <Badge size="lg" variant="light">
            {familyTree.breed.name}
          </Badge>
        )}
      </Group>

      {/* 家系図表示 */}
      <Paper p="md" shadow="sm" style={{ overflow: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          {renderFamilyLevel(familyTree, 0, parseInt(generations))}
        </div>
      </Paper>

      {/* 説明 */}
      <Paper p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Text size="sm" c="dimmed">
          <strong>使い方:</strong> 各カードをクリックすると、その個体の詳細情報に移動できます。
          世代数を変更することで、表示する祖先の数を調整できます。
        </Text>
      </Paper>
    </Stack>
  );
}
