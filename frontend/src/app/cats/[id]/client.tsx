'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Tabs,
  Table,
  Flex,
  Badge,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconUser, IconAlertCircle } from '@tabler/icons-react';
import { useGetCat } from '@/lib/api/hooks/use-cats';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type Props = {
  catId: string;
};

const GENDER_LABELS: Record<string, string> = {
  MALE: 'オス',
  FEMALE: 'メス',
  NEUTER: '去勢オス',
  SPAY: '避妊メス',
};

export default function CatDetailClient({ catId }: Props) {
  const router = useRouter();
  const { data: cat, isLoading, error } = useGetCat(catId);

  if (isLoading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !cat) {
    return (
      <Container size="lg" style={{ paddingTop: '2rem' }}>
        <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
          猫の情報を読み込めませんでした。
        </Alert>
        <Button
          mt="md"
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/cats')}
        >
          一覧へ戻る
        </Button>
      </Container>
    );
  }

  const catData = cat.data;
  
  if (!catData) {
    return null;
  }

  return (
  <Box style={{ minHeight: '100vh', backgroundColor: 'var(--background-base)' }}>
      {/* ヘッダー */}
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
              onClick={() => router.push('/cats')}
            >
              一覧へ戻る
            </Button>
            <Group gap="sm">
              <Button
                leftSection={<IconEdit size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/edit`)}
              >
                編集
              </Button>
              <Button
                variant="outline"
                leftSection={<IconUser size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/pedigree`)}
              >
                血統表を見る
              </Button>
            </Group>
          </Flex>
        </Container>
      </Box>

      <Container size="lg" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        {/* メイン詳細カード */}
        <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={2}>{catData.name}</Title>
                <Group gap="xs" mt="xs">
                  <Badge color={catData.isInHouse ? 'green' : 'gray'}>
                    {catData.isInHouse ? '在舎' : '不在'}
                  </Badge>
                  {catData.tags && catData.tags.length > 0 && (
                    <>
                      {catData.tags.map((catTag: any) => (
                        <Badge
                          key={catTag.tag.id}
                          color={catTag.tag.color || 'blue'}
                          variant="light"
                        >
                          {catTag.tag.name}
                        </Badge>
                      ))}
                    </>
                  )}
                </Group>
              </div>
            </Group>
            
            <Group gap="md">
              <Text c="dimmed">
                {GENDER_LABELS[catData.gender] || catData.gender}
              </Text>
              <Text c="dimmed">|</Text>
              <Text c="dimmed">
                {format(new Date(catData.birthDate), 'yyyy年MM月dd日', { locale: ja })}
              </Text>
              {catData.breed && (
                <>
                  <Text c="dimmed">|</Text>
                  <Text c="dimmed">{catData.breed.name}</Text>
                </>
              )}
              {catData.coatColor && (
                <>
                  <Text c="dimmed">|</Text>
                  <Text c="dimmed">{catData.coatColor.name}</Text>
                </>
              )}
            </Group>
            
            {catData.description && (
              <Text>{catData.description}</Text>
            )}
          </Stack>
        </Card>

        {/* タブで詳細情報 */}
        <Tabs defaultValue="basic" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="basic">基本情報</Tabs.Tab>
            <Tabs.Tab value="family">家族</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group>
                  <Text fw={600} w={150}>品種:</Text>
                  <Text>{catData.breed?.name || '未登録'}</Text>
                </Group>
                <Group>
                  <Text fw={600} w={150}>性別:</Text>
                  <Text>{GENDER_LABELS[catData.gender] || catData.gender}</Text>
                </Group>
                <Group>
                  <Text fw={600} w={150}>生年月日:</Text>
                  <Text>{format(new Date(catData.birthDate), 'yyyy年MM月dd日', { locale: ja })}</Text>
                </Group>
                <Group>
                  <Text fw={600} w={150}>色柄:</Text>
                  <Text>{catData.coatColor?.name || '未登録'}</Text>
                </Group>
                {catData.microchipNumber && (
                  <Group>
                    <Text fw={600} w={150}>マイクロチップ:</Text>
                    <Text>{catData.microchipNumber}</Text>
                  </Group>
                )}
                {catData.registrationNumber && (
                  <Group>
                    <Text fw={600} w={150}>登録番号:</Text>
                    <Text>{catData.registrationNumber}</Text>
                  </Group>
                )}
                <Group>
                  <Text fw={600} w={150}>在舎状況:</Text>
                  <Badge color={catData.isInHouse ? 'green' : 'gray'}>
                    {catData.isInHouse ? '在舎中' : '不在'}
                  </Badge>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="family" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                {catData.father && (
                  <div>
                    <Text fw={600} mb="xs">父親</Text>
                    <Button
                      variant="light"
                      onClick={() => catData.father && router.push(`/cats/${catData.father.id}`)}
                    >
                      {catData.father.name}
                    </Button>
                  </div>
                )}
                {catData.mother && (
                  <div>
                    <Text fw={600} mb="xs">母親</Text>
                    <Button
                      variant="light"
                      onClick={() => catData.mother && router.push(`/cats/${catData.mother.id}`)}
                    >
                      {catData.mother.name}
                    </Button>
                  </div>
                )}
                {!catData.father && !catData.mother && (
                  <Text c="dimmed">親猫の情報はありません</Text>
                )}
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
}
