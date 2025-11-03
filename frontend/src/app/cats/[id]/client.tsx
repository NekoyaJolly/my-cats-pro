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
  Flex,
  Badge,
  Loader,
  Center,
  Alert,
  Accordion,
  Divider,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconUser, IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import { useGetCat } from '@/lib/api/hooks/use-cats';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type Props = {
  catId: string;
};

// Gender labels (English for consistency with registration forms)
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  NEUTER: 'Neutered Male',
  SPAY: 'Spayed Female',
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
              variant="subtle"
              color="gray"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/cats')}
            >
              一覧へ戻る
            </Button>
            <Group gap="sm">
              <Button
                variant="outline"
                color="yellow"
                leftSection={<IconEdit size={16} />}
                onClick={() => router.push(`/cats/${catData.id}/edit`)}
              >
                編集
              </Button>
              <Button
                variant="outline"
                color="gray"
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
        {/* タブで詳細情報 */}
        <Tabs defaultValue="basic" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="basic">基本情報</Tabs.Tab>
            <Tabs.Tab value="family">家族</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="lg">
                {/* 名前とステータス */}
                <div>
                  <Title order={2} mb="xs">{catData.name}</Title>
                  <Group gap="xs">
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

                <Divider />

                {/* 基本情報 */}
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
                  {catData.description && (
                    <Box>
                      <Text fw={600} mb="xs">説明:</Text>
                      <Text>{catData.description}</Text>
                    </Box>
                  )}
                </Stack>

                <Divider />

                {/* 親情報 */}
                <Stack gap="md">
                  <Text fw={600} size="lg">親情報</Text>
                  <Group>
                    <Text fw={600} w={150}>父:</Text>
                    {catData.father ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => catData.father && router.push(`/cats/${catData.father.id}`)}
                      >
                        {catData.father.name}
                      </Button>
                    ) : (
                      <Text c="dimmed">未登録</Text>
                    )}
                  </Group>
                  <Group>
                    <Text fw={600} w={150}>母:</Text>
                    {catData.mother ? (
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => catData.mother && router.push(`/cats/${catData.mother.id}`)}
                      >
                        {catData.mother.name}
                      </Button>
                    ) : (
                      <Text c="dimmed">未登録</Text>
                    )}
                  </Group>
                </Stack>

                <Divider />

                {/* アコーディオンセクション */}
                <Accordion variant="contained">
                  {/* ケアノート */}
                  <Accordion.Item value="care">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      ケアノート
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text c="dimmed" size="sm">
                        ケアスケジュールからのメモがここに表示されます（今後実装予定）
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 医療記録 */}
                  <Accordion.Item value="medical">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      医療記録
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text c="dimmed" size="sm">
                        医療記録機能は今後実装予定です
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 譲渡情報 */}
                  <Accordion.Item value="transfer">
                    <Accordion.Control icon={<IconChevronDown size={16} />}>
                      譲渡情報
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text c="dimmed" size="sm">
                        譲渡情報がここに表示されます（今後実装予定）
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>

                  {/* 出産記録（メスの場合のみ） */}
                  {(catData.gender === 'FEMALE' || catData.gender === 'SPAY') && (
                    <Accordion.Item value="births">
                      <Accordion.Control icon={<IconChevronDown size={16} />}>
                        出産記録
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Text c="dimmed" size="sm">
                          出産記録がここに表示されます（今後実装予定）
                        </Text>
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}
                </Accordion>
              </Stack>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="family" pt="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={600} size="lg">子猫</Text>
                <Text c="dimmed" size="sm">
                  子猫の一覧がここに表示されます（今後実装予定）
                </Text>
              </Stack>
            </Card>
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
}
