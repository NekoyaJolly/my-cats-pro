'use client';

import React, { useMemo } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Loader,
  Center,
  Box,
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
import {
  useGetWeightRecords,
  type WeightRecordSummary,
} from '@/lib/api/hooks/use-weight-records';

interface WeightChartProps {
  catId: string;
  catName: string;
  /** グラフの高さ（デフォルト: 200px） */
  height?: number;
}

/**
 * 体重推移グラフコンポーネント
 * recharts がインストールされていない場合は簡易テーブル表示
 */
export function WeightChart({ catId, catName, height = 200 }: WeightChartProps) {
  const { data, isLoading, error } = useGetWeightRecords({
    catId,
    limit: 30,
    sortOrder: 'asc',
  });

  // グラフ用データを整形
  const chartData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((record) => ({
      date: new Date(record.recordedAt).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      weight: record.weight,
      fullDate: new Date(record.recordedAt).toLocaleDateString('ja-JP'),
    }));
  }, [data?.data]);

  const summary = data?.summary;

  if (isLoading) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Center h={height}>
          <Loader size="sm" />
        </Center>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Center h={height}>
          <Text c="red" size="sm">
            体重データの読み込みに失敗しました
          </Text>
        </Center>
      </Card>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <Card padding="md" radius="md" withBorder>
        <Center h={height}>
          <Text c="dimmed" size="sm">
            体重記録がありません
          </Text>
        </Center>
      </Card>
    );
  }

  return (
    <Card padding="md" radius="md" withBorder>
      <Stack gap="md">
        {/* ヘッダー */}
        <Group justify="space-between" align="flex-start">
          <Text fw={500}>{catName}の体重推移</Text>
          {summary && <WeightSummaryBadge summary={summary} />}
        </Group>

        {/* 簡易グラフ（CSS のみで実装） */}
        <SimpleBarChart data={chartData} height={height} />

        {/* 最新記録 */}
        {summary && summary.latestWeight !== null && (
          <Group gap="xs" justify="center">
            <Text size="sm" c="dimmed">
              最新:
            </Text>
            <Text size="sm" fw={600}>
              {summary.latestWeight}g
            </Text>
            <Text size="xs" c="dimmed">
              ({summary.latestRecordedAt
                ? new Date(summary.latestRecordedAt).toLocaleDateString('ja-JP')
                : '-'})
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
}

/**
 * 体重変化サマリーバッジ
 */
function WeightSummaryBadge({ summary }: { summary: WeightRecordSummary }) {
  if (summary.weightChange === null) {
    return null;
  }

  const change = summary.weightChange;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Badge
      color={isPositive ? 'green' : isNegative ? 'red' : 'gray'}
      variant="light"
      leftSection={
        isPositive ? (
          <IconTrendingUp size={14} />
        ) : isNegative ? (
          <IconTrendingDown size={14} />
        ) : (
          <IconMinus size={14} />
        )
      }
    >
      {isPositive ? '+' : ''}
      {change}g
    </Badge>
  );
}

/**
 * 簡易棒グラフ（CSS のみで実装）
 * recharts を追加した場合はこれを置き換え可能
 */
function SimpleBarChart({
  data,
  height,
}: {
  data: Array<{ date: string; weight: number; fullDate: string }>;
  height: number;
}) {
  const maxWeight = Math.max(...data.map((d) => d.weight));
  const minWeight = Math.min(...data.map((d) => d.weight));
  const range = maxWeight - minWeight || 1;

  return (
    <Box style={{ height, position: 'relative' }}>
      <Group
        gap={2}
        align="flex-end"
        style={{ height: '100%', padding: '0 4px' }}
        wrap="nowrap"
      >
        {data.map((item, index) => {
          const barHeight = ((item.weight - minWeight) / range) * 0.7 + 0.3;
          return (
            <Box
              key={index}
              style={{
                flex: 1,
                minWidth: 8,
                maxWidth: 40,
                height: `${barHeight * 100}%`,
                backgroundColor: 'var(--mantine-color-blue-5)',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              title={`${item.fullDate}: ${item.weight}g`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--mantine-color-blue-7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--mantine-color-blue-5)';
              }}
            />
          );
        })}
      </Group>

      {/* Y軸ラベル */}
      <Box
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}
      >
        <Text size="xs" c="dimmed">
          {maxWeight}g
        </Text>
        <Text size="xs" c="dimmed">
          {minWeight}g
        </Text>
      </Box>
    </Box>
  );
}

export default WeightChart;

