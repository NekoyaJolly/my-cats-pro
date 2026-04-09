'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Loader,
  Stack,
  Text,
  Title,
  Flex,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';

import { useGetCat } from '@/lib/api/hooks/use-cats';
import { useGetPedigreeFamilyTree } from '@/lib/api/hooks/use-pedigrees';

interface AncestorInfo {
  name: string | null;
  color: string | null;
}

interface PedigreeData {
  catName?: string | null;
  fatherCatName?: string | null;
  fatherCoatColor?: string | null;
  motherCatName?: string | null;
  motherCoatColor?: string | null;
  ffCatName?: string | null;
  ffCatColor?: string | null;
  fmCatName?: string | null;
  fmCatColor?: string | null;
  mfCatName?: string | null;
  mfCatColor?: string | null;
  mmCatName?: string | null;
  mmCatColor?: string | null;
  fffCatName?: string | null;
  fffCatColor?: string | null;
  ffmCatName?: string | null;
  ffmCatColor?: string | null;
  fmfCatName?: string | null;
  fmfCatColor?: string | null;
  fmmCatName?: string | null;
  fmmCatColor?: string | null;
  mffCatName?: string | null;
  mffCatColor?: string | null;
  mfmCatName?: string | null;
  mfmCatColor?: string | null;
  mmfCatName?: string | null;
  mmfCatColor?: string | null;
  mmmCatName?: string | null;
  mmmCatColor?: string | null;
}

const LEVEL_COLORS: Record<number, string> = {
  0: '#e3f2fd',
  1: '#f3e5f5',
  2: '#e8f5e8',
  3: '#fff3e0',
};

function CatCard({ cat, level = 0 }: { cat: AncestorInfo; level?: number }) {
  if (!cat.name) {
    return (
      <Card shadow="sm" padding="sm" radius="md" withBorder style={{ minHeight: 60, opacity: 0.3 }}>
        <Text size="sm" c="dimmed">不明</Text>
      </Card>
    );
  }

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      style={{ backgroundColor: LEVEL_COLORS[level] ?? '#f5f5f5', minHeight: 60 }}
    >
      <Stack gap="xs">
        <Text fw={600} size="sm">{cat.name}</Text>
        {cat.color && <Text size="xs" c="dimmed">{cat.color}</Text>}
      </Stack>
    </Card>
  );
}

function PedigreeTree({ data }: { data: PedigreeData }) {
  const parents: AncestorInfo[] = [
    { name: data.fatherCatName ?? null, color: data.fatherCoatColor ?? null },
    { name: data.motherCatName ?? null, color: data.motherCoatColor ?? null },
  ];
  const grandparents: AncestorInfo[] = [
    { name: data.ffCatName ?? null, color: data.ffCatColor ?? null },
    { name: data.fmCatName ?? null, color: data.fmCatColor ?? null },
    { name: data.mfCatName ?? null, color: data.mfCatColor ?? null },
    { name: data.mmCatName ?? null, color: data.mmCatColor ?? null },
  ];
  const greatGrandparents: AncestorInfo[] = [
    { name: data.fffCatName ?? null, color: data.fffCatColor ?? null },
    { name: data.ffmCatName ?? null, color: data.ffmCatColor ?? null },
    { name: data.fmfCatName ?? null, color: data.fmfCatColor ?? null },
    { name: data.fmmCatName ?? null, color: data.fmmCatColor ?? null },
    { name: data.mffCatName ?? null, color: data.mffCatColor ?? null },
    { name: data.mfmCatName ?? null, color: data.mfmCatColor ?? null },
    { name: data.mmfCatName ?? null, color: data.mmfCatColor ?? null },
    { name: data.mmmCatName ?? null, color: data.mmmCatColor ?? null },
  ];

  return (
    <>
      <Box style={{ overflowX: 'auto' }}>
        <Grid style={{ minWidth: '1200px' }}>
          <Grid.Col span={3}>
            <Stack gap="md" style={{ height: '100%', justifyContent: 'center' }}>
              <CatCard cat={{ name: data.catName ?? null, color: null }} level={0} />
            </Stack>
          </Grid.Col>
          <Grid.Col span={3}>
            <Stack gap="md" style={{ height: '100%' }}>
              {parents.map((p, i) => <CatCard key={i} cat={p} level={1} />)}
            </Stack>
          </Grid.Col>
          <Grid.Col span={3}>
            <Stack gap="md" style={{ height: '100%' }}>
              {grandparents.map((gp, i) => <CatCard key={i} cat={gp} level={2} />)}
            </Stack>
          </Grid.Col>
          <Grid.Col span={3}>
            <Stack gap="md" style={{ height: '100%' }}>
              {greatGrandparents.map((ggp, i) => <CatCard key={i} cat={ggp} level={3} />)}
            </Stack>
          </Grid.Col>
        </Grid>
      </Box>

      <Box mt="xl">
        <Grid>
          <Grid.Col span={3}><Text ta="center" fw={600} c="blue">本人</Text></Grid.Col>
          <Grid.Col span={3}><Text ta="center" fw={600} c="purple">親（第1世代）</Text></Grid.Col>
          <Grid.Col span={3}><Text ta="center" fw={600} c="green">祖父母（第2世代）</Text></Grid.Col>
          <Grid.Col span={3}><Text ta="center" fw={600} c="orange">曾祖父母（第3世代）</Text></Grid.Col>
        </Grid>
      </Box>
    </>
  );
}

export default function PedigreePage() {
  const router = useRouter();
  const params = useParams();
  const catId = params.id as string;

  const { data: catData, isLoading: catLoading } = useGetCat(catId);
  const cat = catData?.data as { name?: string; pedigreeId?: string | null } | undefined;
  const pedigreeId = cat?.pedigreeId ?? '';

  const { data: treeResponse, isLoading: treeLoading, error: treeError } = useGetPedigreeFamilyTree(
    pedigreeId,
    { enabled: !!pedigreeId },
  );
  const treeData = treeResponse as { data?: PedigreeData } | undefined;
  const pedigree = treeData?.data;

  const isLoading = catLoading || (!!pedigreeId && treeLoading);

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      <Box
        style={{
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 0',
          boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <Button
              variant="light"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              戻る
            </Button>
          </Flex>
        </Container>
      </Box>

      <Container size="xl" style={{ paddingTop: '2rem' }}>
        {isLoading && (
          <Flex justify="center" align="center" py="xl">
            <Loader size="lg" />
          </Flex>
        )}

        {!isLoading && !pedigreeId && (
          <Alert icon={<IconAlertCircle size={16} />} title="血統書未登録" color="yellow">
            {cat?.name ?? 'この猫'}には血統書が登録されていません。
            血統書を登録するには、猫の詳細ページから血統書を関連付けてください。
          </Alert>
        )}

        {!isLoading && treeError && (
          <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
            血統データの取得に失敗しました。時間をおいて再度お試しください。
          </Alert>
        )}

        {!isLoading && pedigree && (
          <>
            <Title order={1} mb="lg" ta="center">
              {pedigree.catName ?? cat?.name ?? ''}の血統表（4世代）
            </Title>
            <PedigreeTree data={pedigree} />
          </>
        )}
      </Container>
    </Box>
  );
}
