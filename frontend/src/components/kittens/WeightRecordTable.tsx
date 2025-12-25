'use client';

import React from 'react';
import {
  Card,
  Table,
  Text,
  Group,
  Badge,
  Tooltip,
  Stack,
  Box,
  ScrollArea,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconScale,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconChevronRight,
} from '@tabler/icons-react';
import { useGetWeightRecords } from '@/lib/api/hooks/use-weight-records';
import { ActionIconButton } from '@/components/ActionButton';
import { GenderBadge } from '@/components/GenderBadge';

interface Kitten {
  id: string;
  name: string;
  color: string;
  gender: 'オス' | 'メス';
}

interface MotherCat {
  id: string;
  name: string;
  fatherName: string;
  kittens: Kitten[];
  deliveryDate: string;
  daysOld: number;
}

interface WeightRecordTableProps {
  motherCats: MotherCat[];
  onRecordWeight: (kitten: Kitten) => void;
  /** 一括記録ボタンのハンドラ（ヘッダーで使用するため、ここでは使用しない） */
  onBulkRecord?: () => void;
  /** 表示する体重記録の数（デフォルト: 8） */
  recordLimit?: number;
}

/**
 * 体重管理テーブルコンポーネント
 * 母猫ごとにグループ化し、各子猫の体重推移を表示
 * スマホ対応: 最新体重+増減を固定表示、履歴は横スクロール
 */
export function WeightRecordTable({
  motherCats,
  onRecordWeight,
  // onBulkRecord はヘッダーで使用するため、ここでは参照しない
  recordLimit = 8,
}: WeightRecordTableProps) {
  if (motherCats.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Center py="xl">
          <Text c="dimmed">表示する子猫がいません</Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between">
          <Text size="lg" fw={500}>
            体重記録一覧
          </Text>
          <Text size="sm" c="dimmed">
            直近{recordLimit}回分を表示
          </Text>
        </Group>

        {/* テーブル */}
        <Box style={{ position: 'relative' }}>
          <ScrollArea>
            <Table striped withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ minWidth: 120, position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                    母猫/子猫
                  </Table.Th>
                  <Table.Th style={{ minWidth: 60 }}>色柄</Table.Th>
                  <Table.Th style={{ minWidth: 80, textAlign: 'center' }}>最新</Table.Th>
                  <Table.Th style={{ minWidth: 60, textAlign: 'center' }}>増減</Table.Th>
                  <Table.Th style={{ minWidth: 40, textAlign: 'center' }}></Table.Th>
                  {/* 過去の記録列（スマホでは横スクロール） */}
                  {Array.from({ length: recordLimit - 1 }).map((_, i) => (
                    <Table.Th key={i} style={{ minWidth: 70, textAlign: 'center' }}>
                      {i + 2}回前
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {motherCats.map((mother) => (
                  <React.Fragment key={mother.id}>
                    {/* 母猫ヘッダー行 */}
                    <Table.Tr style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                      <Table.Td
                        colSpan={4 + recordLimit}
                        style={{ position: 'sticky', left: 0, background: 'var(--mantine-color-blue-0)' }}
                      >
                        <Group gap="xs">
                          <Text fw={600} size="sm">
                            {mother.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            ({mother.deliveryDate})
                          </Text>
                          <Badge size="xs" variant="light">
                            {mother.kittens.length}頭
                          </Badge>
                        </Group>
                      </Table.Td>
                    </Table.Tr>

                    {/* 子猫の行 */}
                    {mother.kittens.map((kitten) => (
                      <KittenWeightRow
                        key={kitten.id}
                        kitten={kitten}
                        recordLimit={recordLimit}
                        onRecordWeight={() => onRecordWeight(kitten)}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Box>

        {/* 凡例 */}
        <Group gap="md" justify="center">
          <Group gap={4}>
            <IconTrendingUp size={14} color="var(--mantine-color-blue-6)" />
            <Text size="xs" c="dimmed">
              増加
            </Text>
          </Group>
          <Group gap={4}>
            <IconTrendingDown size={14} color="var(--mantine-color-red-6)" />
            <Text size="xs" c="dimmed">
              減少
            </Text>
          </Group>
          <Group gap={4}>
            <IconMinus size={14} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed">
              変化なし
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}

/**
 * 子猫の体重行コンポーネント
 */
interface KittenWeightRowProps {
  kitten: Kitten;
  recordLimit: number;
  onRecordWeight: () => void;
}

function KittenWeightRow({ kitten, recordLimit, onRecordWeight }: KittenWeightRowProps) {
  const { data: weightData, isLoading } = useGetWeightRecords({
    catId: kitten.id,
    limit: recordLimit,
    sortOrder: 'desc',
  });

  const records = weightData?.data ?? [];
  const latestWeight = records[0]?.weight ?? null;
  const previousWeight = records[1]?.weight ?? null;
  const weightChange =
    latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : null;

  return (
    <Table.Tr>
      {/* 子猫名（固定） */}
      <Table.Td style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
        <Group gap="xs" wrap="nowrap">
          <IconChevronRight size={12} color="var(--mantine-color-gray-4)" />
          <Text size="sm" lineClamp={1}>
            {kitten.name}
          </Text>
          <GenderBadge gender={kitten.gender} size="xs" />
        </Group>
      </Table.Td>

      {/* 色柄 */}
      <Table.Td>
        <Text size="xs" c="dimmed" lineClamp={1}>
          {kitten.color}
        </Text>
      </Table.Td>

      {/* 最新体重 */}
      <Table.Td style={{ textAlign: 'center' }}>
        {isLoading ? (
          <Loader size="xs" />
        ) : latestWeight !== null ? (
          <Text size="sm" fw={600}>
            {latestWeight}g
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        )}
      </Table.Td>

      {/* 増減 */}
      <Table.Td style={{ textAlign: 'center' }}>
        {weightChange !== null ? (
          <WeightChangeBadge change={weightChange} />
        ) : (
          <Text size="xs" c="dimmed">
            -
          </Text>
        )}
      </Table.Td>

      {/* 記録ボタン */}
      <Table.Td style={{ textAlign: 'center' }}>
        <Tooltip label="体重を記録">
          <ActionIconButton 
            action="edit"
            customIcon={<IconScale size={18} />}
            onClick={onRecordWeight}
          />
        </Tooltip>
      </Table.Td>

      {/* 過去の記録 */}
      {Array.from({ length: recordLimit - 1 }).map((_, i) => {
        const record = records[i + 1];
        const prevRecord = records[i + 2];
        const change =
          record && prevRecord ? record.weight - prevRecord.weight : null;

        return (
          <Table.Td key={i} style={{ textAlign: 'center' }}>
            {record ? (
              <Stack gap={2} align="center">
                <Text size="xs">{record.weight}g</Text>
                {change !== null && (
                  <MiniWeightChange change={change} />
                )}
              </Stack>
            ) : (
              <Text size="xs" c="dimmed">
                -
              </Text>
            )}
          </Table.Td>
        );
      })}
    </Table.Tr>
  );
}

/**
 * 体重変化バッジ
 */
function WeightChangeBadge({ change }: { change: number }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Badge
      size="sm"
      color={isPositive ? 'blue' : isNegative ? 'red' : 'gray'}
      variant="light"
      leftSection={
        isPositive ? (
          <IconTrendingUp size={10} />
        ) : isNegative ? (
          <IconTrendingDown size={10} />
        ) : (
          <IconMinus size={10} />
        )
      }
    >
      {isPositive ? '+' : ''}
      {change}
    </Badge>
  );
}

/**
 * 小さい体重変化表示（過去の記録用）
 */
function MiniWeightChange({ change }: { change: number }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Group gap={2} wrap="nowrap">
      {isPositive ? (
        <IconTrendingUp size={10} color="var(--mantine-color-blue-6)" />
      ) : isNegative ? (
        <IconTrendingDown size={10} color="var(--mantine-color-red-6)" />
      ) : (
        <IconMinus size={10} color="var(--mantine-color-gray-5)" />
      )}
      <Text
        size="xs"
        c={isPositive ? 'blue' : isNegative ? 'red' : 'dimmed'}
      >
        {isPositive ? '+' : ''}
        {change}
      </Text>
    </Group>
  );
}

export default WeightRecordTable;

