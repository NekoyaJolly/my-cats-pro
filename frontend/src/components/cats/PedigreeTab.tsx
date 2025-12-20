'use client';

import React from 'react';
import {
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Loader,
  Center,
  Alert,
  Title,
  Grid,
  Paper,
  Anchor,
  Divider,
  SimpleGrid,
} from '@mantine/core';
import { IconAlertCircle, IconDna, IconUsers, IconBabyCarriage } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  useGetCatFamily,
  type ParentInfo,
  type SiblingInfo,
  type OffspringInfo,
  type AncestorInfo,
} from '@/lib/api/hooks/use-cats';

interface PedigreeTabProps {
  catId: string;
}

// 性別の表示ラベル
const GENDER_LABELS: Record<string, string> = {
  MALE: 'オス',
  FEMALE: 'メス',
  NEUTER: '去勢オス',
  SPAY: '避妊メス',
};

// 性別に応じた色
const getGenderColor = (gender: string): string => {
  switch (gender) {
    case 'MALE':
    case 'NEUTER':
      return 'blue';
    case 'FEMALE':
    case 'SPAY':
      return 'pink';
    default:
      return 'gray';
  }
};

/**
 * 祖先カード（祖父母・曾祖父母用）
 */
function AncestorCard({
  ancestor,
  label,
}: {
  ancestor: AncestorInfo | null;
  label: string;
}) {
  const router = useRouter();

  if (!ancestor || !ancestor.catName) {
    return (
      <Card p="xs" withBorder style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
        <Text size="xs" c="dimmed" ta="center">
          {label}: 情報なし
        </Text>
      </Card>
    );
  }

  const handleClick = () => {
    if (ancestor.pedigreeId) {
      router.push(`/pedigrees?tab=tree&id=${ancestor.pedigreeId}`);
    }
  };

  return (
    <Card
      p="xs"
      withBorder
      style={{
        cursor: ancestor.pedigreeId ? 'pointer' : 'default',
        transition: 'all 0.2s',
      }}
      onClick={handleClick}
    >
      <Stack gap={2}>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={500} lineClamp={1}>
          {ancestor.catName}
        </Text>
        {ancestor.pedigreeId && (
          <Text size="xs" c="blue" fw={500}>
            {ancestor.pedigreeId}
          </Text>
        )}
        {ancestor.coatColor && (
          <Text size="xs" c="dimmed">
            {ancestor.coatColor}
          </Text>
        )}
      </Stack>
    </Card>
  );
}

/**
 * 親情報カード（父または母）
 */
function ParentCard({
  parent,
  position,
}: {
  parent: ParentInfo | null;
  position: 'father' | 'mother';
}) {
  const router = useRouter();
  const borderColor = position === 'father' ? '#228be6' : '#e64980';
  const label = position === 'father' ? '父' : '母';

  if (!parent) {
    return (
      <Card
        p="md"
        withBorder
        style={{
          borderColor: '#dee2e6',
          borderStyle: 'dashed',
          borderWidth: 2,
        }}
      >
        <Text c="dimmed" ta="center">
          {label}親: 情報なし
        </Text>
      </Card>
    );
  }

  const handleCatClick = () => {
    if (parent.id) {
      router.push(`/cats/${parent.id}`);
    }
  };

  const handlePedigreeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (parent.pedigreeId) {
      router.push(`/pedigrees?tab=tree&id=${parent.pedigreeId}`);
    }
  };

  const coatColorName =
    typeof parent.coatColor === 'string'
      ? parent.coatColor
      : parent.coatColor?.name ?? null;

  return (
    <Card
      p="md"
      withBorder
      style={{
        borderColor,
        borderWidth: 2,
        cursor: parent.id ? 'pointer' : 'default',
      }}
      onClick={handleCatClick}
    >
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="xs" c="dimmed">
              {label}親
            </Text>
            <Text fw={600} size="lg">
              {parent.name}
            </Text>
          </div>
          {parent.gender && (
            <Badge color={getGenderColor(parent.gender)} size="sm">
              {GENDER_LABELS[parent.gender] || parent.gender}
            </Badge>
          )}
        </Group>

        {parent.pedigreeId && (
          <Anchor
            size="sm"
            c="blue"
            onClick={handlePedigreeClick}
            style={{ cursor: 'pointer' }}
          >
            血統書: {parent.pedigreeId}
          </Anchor>
        )}

        {parent.birthDate && (
          <Text size="sm" c="dimmed">
            生年月日: {format(new Date(parent.birthDate), 'yyyy年MM月dd日', { locale: ja })}
          </Text>
        )}

        {parent.breed && (
          <Badge size="sm" variant="light">
            {parent.breed.name}
          </Badge>
        )}

        {coatColorName && (
          <Text size="sm" c="dimmed">
            毛色: {coatColorName}
          </Text>
        )}

        {/* 祖父母情報（Pedigreeから取得） */}
        {(parent.father || parent.mother) && (
          <>
            <Divider my="xs" />
            <Text size="xs" fw={500} c="dimmed">
              祖父母
            </Text>
            <SimpleGrid cols={2} spacing="xs">
              <AncestorCard ancestor={parent.father} label="祖父" />
              <AncestorCard ancestor={parent.mother} label="祖母" />
            </SimpleGrid>
          </>
        )}
      </Stack>
    </Card>
  );
}

/**
 * 兄弟姉妹リスト
 */
function SiblingsList({ siblings }: { siblings: SiblingInfo[] }) {
  const router = useRouter();

  if (siblings.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        兄弟姉妹はいません（両親が一致する猫のみ表示）
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {siblings.map((sibling) => (
        <Card
          key={sibling.id}
          p="sm"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/cats/${sibling.id}`)}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="wrap">
              <Text fw={500}>{sibling.name}</Text>
              <Badge size="sm" color={getGenderColor(sibling.gender)}>
                {GENDER_LABELS[sibling.gender] || sibling.gender}
              </Badge>
              {sibling.breed && (
                <Badge size="sm" variant="light">
                  {sibling.breed.name}
                </Badge>
              )}
              <Text size="sm" c="dimmed">
                {format(new Date(sibling.birthDate), 'yyyy/MM/dd', { locale: ja })}
              </Text>
            </Group>
            {sibling.pedigreeId && (
              <Anchor
                size="sm"
                c="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/pedigrees?tab=tree&id=${sibling.pedigreeId}`);
                }}
              >
                {sibling.pedigreeId}
              </Anchor>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * 子猫リスト
 */
function OffspringList({ offspring }: { offspring: OffspringInfo[] }) {
  const router = useRouter();

  if (offspring.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        子猫はいません
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {offspring.map((child) => (
        <Card
          key={child.id}
          p="sm"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => router.push(`/cats/${child.id}`)}
        >
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" wrap="wrap">
              <Text fw={500}>{child.name}</Text>
              <Badge size="sm" color={getGenderColor(child.gender)}>
                {GENDER_LABELS[child.gender] || child.gender}
              </Badge>
              {child.breed && (
                <Badge size="sm" variant="light">
                  {child.breed.name}
                </Badge>
              )}
              <Text size="sm" c="dimmed">
                {format(new Date(child.birthDate), 'yyyy/MM/dd', { locale: ja })}
              </Text>
              {child.otherParent && (
                <Text size="sm" c="dimmed">
                  相手: {child.otherParent.name}
                </Text>
              )}
            </Group>
            {child.pedigreeId && (
              <Anchor
                size="sm"
                c="blue"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/pedigrees?tab=tree&id=${child.pedigreeId}`);
                }}
              >
                {child.pedigreeId}
              </Anchor>
            )}
          </Group>
        </Card>
      ))}
    </Stack>
  );
}

/**
 * 簡易家系図コンポーネント
 */
function SimpleFamilyTree({
  cat,
  father,
  mother,
}: {
  cat: {
    id: string;
    name: string;
    gender: string;
    pedigreeId: string | null;
  };
  father: ParentInfo | null;
  mother: ParentInfo | null;
}) {
  const router = useRouter();

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Title order={5}>
          <Group gap="xs">
            <IconDna size={20} />
            簡易家系図
          </Group>
        </Title>

        {/* 本猫 */}
        <Card
          p="md"
          withBorder
          style={{
            borderColor: getGenderColor(cat.gender) === 'blue' ? '#228be6' : '#e64980',
            borderWidth: 3,
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
        >
          <Group justify="center">
            <Stack gap="xs" align="center">
              <Text fw={700} size="lg">
                {cat.name}（本猫）
              </Text>
              <Badge color={getGenderColor(cat.gender)}>
                {GENDER_LABELS[cat.gender] || cat.gender}
              </Badge>
              {cat.pedigreeId && (
                <Anchor
                  size="sm"
                  c="blue"
                  onClick={() => router.push(`/pedigrees?tab=tree&id=${cat.pedigreeId}`)}
                >
                  血統書: {cat.pedigreeId}
                </Anchor>
              )}
            </Stack>
          </Group>
        </Card>

        {/* 両親 */}
        <Grid>
          <Grid.Col span={6}>
            <ParentCard parent={father} position="father" />
          </Grid.Col>
          <Grid.Col span={6}>
            <ParentCard parent={mother} position="mother" />
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
}

/**
 * 血統タブコンポーネント
 */
export function PedigreeTab({ catId }: PedigreeTabProps) {
  const { data: familyData, isLoading, error } = useGetCatFamily(catId);

  if (isLoading) {
    return (
      <Center style={{ minHeight: '200px' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !familyData) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
        家族情報を読み込めませんでした。
      </Alert>
    );
  }

  const { cat, father, mother, siblings, offspring } = familyData;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="lg">
        {/* 簡易家系図 */}
        <SimpleFamilyTree cat={cat} father={father} mother={mother} />

        {/* 兄弟姉妹 */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={5}>
              <Group gap="xs">
                <IconUsers size={20} />
                兄弟姉妹（両親が一致）
              </Group>
            </Title>
            <SiblingsList siblings={siblings} />
          </Stack>
        </Paper>

        {/* 子猫 */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Title order={5}>
              <Group gap="xs">
                <IconBabyCarriage size={20} />
                子猫
              </Group>
            </Title>
            <OffspringList offspring={offspring} />
          </Stack>
        </Paper>
      </Stack>
    </Card>
  );
}

