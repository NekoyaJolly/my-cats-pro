'use client';

import React from 'react';
import {
  Card,
  Text,
  Group,
  Table,
  Badge,
  ActionIcon,
  Tooltip,
  Center,
  Loader,
} from '@mantine/core';
import {
  IconHomePlus,
  IconHeartHandshake,
  IconChevronRight,
} from '@tabler/icons-react';
import { useGetWeightRecords } from '@/lib/api/hooks/use-weight-records';
import {
  useCreateKittenDisposition,
  type BirthPlan,
  type KittenDisposition,
  type DispositionType,
} from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import { GenderBadge } from '@/components/GenderBadge';
import { notifications } from '@mantine/notifications';

/** 出荷準備対象となる体重閾値（グラム） */
const SHIPPING_WEIGHT_THRESHOLD = 500;

export interface ShippingTabProps {
  allCats: Cat[];
  birthPlans: BirthPlan[];
  isLoading: boolean;
  onRefetch: () => void;
}

interface KittenWithWeight {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  color: string;
  motherId: string;
  motherName: string;
  fatherName: string;
  birthDate: string;
  birthPlanId: string;
  disposition?: KittenDisposition;
}

/**
 * 出荷準備タブコンポーネント
 * 体重500g超えの子猫を表示し、行先を設定する
 */
export function ShippingTab({
  allCats,
  birthPlans,
  isLoading,
  onRefetch,
}: ShippingTabProps) {
  // 出産記録がある子猫を取得
  const kittensForShipping: KittenWithWeight[] = [];

  birthPlans
    .filter((bp) => bp.status === 'BORN' && !bp.completedAt)
    .forEach((birthPlan) => {
      const mother = allCats.find((c) => c.id === birthPlan.motherId);
      const father = birthPlan.fatherId
        ? allCats.find((c) => c.id === birthPlan.fatherId)
        : null;

      // この母猫の子猫を取得（生後3ヶ月以内）
      const kittens = allCats.filter((kitten) => {
        if (kitten.motherId !== birthPlan.motherId) return false;
        
        const birthDate = new Date(kitten.birthDate);
        const now = new Date();
        const ageInMonths = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        return ageInMonths <= 3;
      });

      kittens.forEach((kitten) => {
        // 既に行先が設定されている子猫はスキップ
        const existingDisposition = birthPlan.kittenDispositions?.find(
          (d) => d.kittenId === kitten.id
        );

        if (existingDisposition) return;

        kittensForShipping.push({
          id: kitten.id,
          name: kitten.name,
          gender: kitten.gender as 'MALE' | 'FEMALE',
          color: kitten.coatColor?.name ?? '未確認',
          motherId: birthPlan.motherId,
          motherName: mother?.name ?? '不明',
          fatherName: father?.name ?? '不明',
          birthDate: kitten.birthDate,
          birthPlanId: birthPlan.id,
          disposition: existingDisposition,
        });
      });
    });

  if (isLoading) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      </Card>
    );
  }

  if (kittensForShipping.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Text ta="center" c="dimmed" py="xl">
          出荷準備対象の子猫はいません
        </Text>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Text size="sm" c="dimmed" mb="md">
        生後3ヶ月以内で行先未確定の子猫を表示します。体重{SHIPPING_WEIGHT_THRESHOLD}g超えの子猫のみ行先を設定できます。
      </Text>

      <Table striped withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>子猫名</Table.Th>
            <Table.Th>性別</Table.Th>
            <Table.Th>色柄</Table.Th>
            <Table.Th>母猫</Table.Th>
            <Table.Th>最新体重</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>行先</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {kittensForShipping.map((kitten) => (
            <KittenShippingRow
              key={kitten.id}
              kitten={kitten}
              onRefetch={onRefetch}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}

/**
 * 子猫の出荷準備行コンポーネント
 */
interface KittenShippingRowProps {
  kitten: KittenWithWeight;
  onRefetch: () => void;
}

function KittenShippingRow({ kitten, onRefetch }: KittenShippingRowProps) {
  const { data: weightData, isLoading: isWeightLoading } = useGetWeightRecords({
    catId: kitten.id,
    limit: 1,
    sortOrder: 'desc',
  });

  const createDispositionMutation = useCreateKittenDisposition();

  const latestWeight = weightData?.data?.[0]?.weight ?? null;
  const isAboveThreshold = latestWeight !== null && latestWeight >= SHIPPING_WEIGHT_THRESHOLD;

  // 500g未満の場合は表示しない
  if (!isWeightLoading && !isAboveThreshold) {
    return null;
  }

  const handleSetDisposition = (disposition: DispositionType) => {
    createDispositionMutation.mutate(
      {
        birthRecordId: kitten.birthPlanId,
        kittenId: kitten.id,
        name: kitten.name,
        gender: kitten.gender,
        disposition,
        ...(disposition === 'TRAINING' && {
          trainingStartDate: new Date().toISOString().split('T')[0],
        }),
        ...(disposition === 'SALE' && {
          saleInfo: {
            buyer: '',
            price: 0,
            saleDate: new Date().toISOString().split('T')[0],
          },
        }),
        ...(disposition === 'DECEASED' && {
          deathDate: new Date().toISOString().split('T')[0],
        }),
      },
      {
        onSuccess: () => {
          notifications.show({
            title: '行先を登録しました',
            message: `${kitten.name}の行先を登録しました`,
            color: 'green',
          });
          onRefetch();
        },
      }
    );
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <IconChevronRight size={12} color="var(--mantine-color-gray-4)" />
          <Text size="sm">{kitten.name}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <GenderBadge gender={kitten.gender === 'MALE' ? 'オス' : 'メス'} size="sm" />
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">{kitten.color}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{kitten.motherName}</Text>
      </Table.Td>
      <Table.Td>
        {isWeightLoading ? (
          <Loader size="xs" />
        ) : latestWeight !== null ? (
          <Badge
            size="sm"
            color={isAboveThreshold ? 'green' : 'gray'}
            variant="light"
          >
            {latestWeight}g
          </Badge>
        ) : (
          <Text size="xs" c="dimmed">未記録</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="center">
          <Tooltip label="養成">
            <ActionIcon
              size="md"
              variant="light"
              color="blue"
              onClick={() => handleSetDisposition('TRAINING')}
              loading={createDispositionMutation.isPending}
            >
              <IconHomePlus size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="出荷">
            <ActionIcon
              size="md"
              variant="light"
              color="green"
              onClick={() => handleSetDisposition('SALE')}
              loading={createDispositionMutation.isPending}
            >
              <IconHeartHandshake size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="死亡">
            <ActionIcon
              size="md"
              variant="light"
              color="gray"
              onClick={() => handleSetDisposition('DECEASED')}
              loading={createDispositionMutation.isPending}
            >
              🌈
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

