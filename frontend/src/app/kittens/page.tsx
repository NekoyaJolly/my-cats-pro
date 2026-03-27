'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Card,
  Text,
  Group,
  Badge,
  Table,
  Skeleton,
  Alert,
  Box,
  Title,
  ActionIcon,
  Tooltip,
  Collapse,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronRight,
  IconScale,
  IconList,
  IconBabyCarriage,
} from '@tabler/icons-react';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { useGetKittens, type KittenGroup, type Cat } from '@/lib/api/hooks/use-cats';
import { WeightRecordModal } from '@/components/kittens/WeightRecordModal';
import { BulkWeightRecordModal } from '@/components/kittens/BulkWeightRecordModal';
import { KittenManagementModal } from '@/components/kittens/KittenManagementModal';
import { GenderBadge } from '@/components/GenderBadge';
import dayjs from 'dayjs';

function calculateAgeInDays(birthDate: string | null): number {
  if (!birthDate) return 0;
  return dayjs().diff(dayjs(birthDate), 'day');
}

function AgeDisplay({ birthDate }: { birthDate: string | null }) {
  const days = calculateAgeInDays(birthDate);
  if (days < 0) return <Text size="sm" c="dimmed">-</Text>;
  if (days < 30) return <Badge color="pink" size="sm">{days}日</Badge>;
  if (days < 90) return <Badge color="orange" size="sm">{Math.floor(days / 7)}週</Badge>;
  return <Badge color="gray" size="sm">{Math.floor(days / 30)}ヶ月</Badge>;
}

interface KittenGroupCardProps {
  group: KittenGroup;
}

function KittenGroupCard({ group }: KittenGroupCardProps) {
  const [expanded, { toggle }] = useDisclosure(true);
  const [weightModalCat, setWeightModalCat] = useState<Cat | null>(null);
  const [bulkWeightOpened, { open: openBulkWeight, close: closeBulkWeight }] = useDisclosure(false);
  const [managementOpened, { open: openManagement, close: closeManagement }] = useDisclosure(false);

  return (
    <Card withBorder radius="md" padding="md">
      {/* 母猫ヘッダー */}
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={toggle} size="sm">
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>
          <Box>
            <Group gap="xs">
              <Text fw={600}>{group.mother.name}</Text>
              <Badge size="xs" color="pink" variant="light">母猫</Badge>
              {group.father && (
                <>
                  <Text size="xs" c="dimmed">×</Text>
                  <Text size="sm" fw={500}>{group.father.name}</Text>
                  <Badge size="xs" color="blue" variant="light">父猫</Badge>
                </>
              )}
            </Group>
            {group.deliveryDate && (
              <Text size="xs" c="dimmed">
                出産日: {dayjs(group.deliveryDate).format('YYYY/MM/DD')}
              </Text>
            )}
          </Box>
        </Group>
        <Group gap="xs">
          <Badge size="sm" color="teal" variant="filled">
            {group.kittenCount}頭
          </Badge>
          <Tooltip label="一括体重記録">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={openBulkWeight}
              disabled={group.kittens.length === 0}
            >
              <IconScale size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="子猫管理">
            <ActionIcon
              variant="light"
              color="teal"
              size="sm"
              onClick={openManagement}
            >
              <IconList size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* 子猫テーブル */}
      <Collapse in={expanded}>
        {group.kittens.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="sm">
            子猫の記録がありません
          </Text>
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>名前</Table.Th>
                <Table.Th>性別</Table.Th>
                <Table.Th>毛色</Table.Th>
                <Table.Th>日齢</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {group.kittens.map((kitten) => (
                <Table.Tr key={kitten.id}>
                  <Table.Td>{kitten.name}</Table.Td>
                  <Table.Td>
                    <GenderBadge gender={kitten.gender} size="xs" />
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{kitten.coatColor?.name ?? '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <AgeDisplay birthDate={kitten.birthDate} />
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="体重記録">
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        color="blue"
                        onClick={() => setWeightModalCat(kitten)}
                      >
                        <IconScale size={14} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Collapse>

      {/* 体重記録モーダル（個別） */}
      {weightModalCat && (
        <WeightRecordModal
          opened={!!weightModalCat}
          onClose={() => setWeightModalCat(null)}
          catId={weightModalCat.id}
          catName={weightModalCat.name}
          onSuccess={() => setWeightModalCat(null)}
        />
      )}

      {/* 一括体重記録モーダル */}
      <BulkWeightRecordModal
        opened={bulkWeightOpened}
        onClose={closeBulkWeight}
        motherGroups={[{
          motherId: group.mother.id,
          motherName: group.mother.name,
          fatherName: group.father?.name ?? '',
          deliveryDate: group.deliveryDate ?? '',
          kittens: group.kittens.map((k) => ({
            id: k.id,
            name: k.name,
            gender: k.gender === 'MALE' ? 'オス' as const : 'メス' as const,
            color: k.coatColor?.name ?? '',
          })),
        }]}
        onSuccess={closeBulkWeight}
      />

      {/* 子猫管理モーダル */}
      <KittenManagementModal
        opened={managementOpened}
        onClose={closeManagement}
        motherId={group.mother.id}
        onSuccess={closeManagement}
      />
    </Card>
  );
}

export default function KittensPage() {
  const { setPageTitle } = usePageHeader();
  const [page] = useState(1);

  useEffect(() => {
    setPageTitle('子猫管理');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  const { data, isLoading, error } = useGetKittens({ page, limit: 50 });

  const groups = data?.data ?? [];

  return (
    <Container size="xl" py="md">
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconBabyCarriage size={24} />
            <Title order={3}>子猫管理</Title>
          </Group>
          {!isLoading && (
            <Badge size="lg" color="teal" variant="light">
              {data?.meta?.total ?? 0}頭
            </Badge>
          )}
        </Group>

        {/* ローディング */}
        {isLoading && (
          <Stack gap="md">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={200} radius="md" />
            ))}
          </Stack>
        )}

        {/* エラー */}
        {error && !isLoading && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="データ取得エラー">
            子猫データの取得に失敗しました。再読み込みをお試しください。
          </Alert>
        )}

        {/* データなし */}
        {!isLoading && !error && groups.length === 0 && (
          <Card withBorder radius="md" padding="xl">
            <Stack align="center" gap="sm">
              <IconBabyCarriage size={48} color="var(--mantine-color-dimmed)" />
              <Text c="dimmed" ta="center">
                現在、子猫の記録はありません。
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                交配管理ページから出産記録を登録すると、ここに子猫が表示されます。
              </Text>
            </Stack>
          </Card>
        )}

        {/* 子猫グループ一覧 */}
        {!isLoading && !error && groups.map((group) => (
          <KittenGroupCard key={group.mother.id} group={group} />
        ))}
      </Stack>
    </Container>
  );
}
