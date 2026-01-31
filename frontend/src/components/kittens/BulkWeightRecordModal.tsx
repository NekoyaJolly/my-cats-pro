'use client';

import { useState, useEffect } from 'react';
import {
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Card,
  Grid,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import {
  IconScale,
  IconChevronLeft,
  IconChevronRight,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from '@tabler/icons-react';
import {
  useCreateBulkWeightRecords,
  useGetWeightRecords,
  type BulkWeightRecordItem,
} from '@/lib/api/hooks/use-weight-records';
import { GenderBadge } from '@/components/GenderBadge';
import { UnifiedModal, type ModalSection } from '@/components/common';

interface Kitten {
  id: string;
  name: string;
  gender: 'オス' | 'メス';
  color: string;
}

interface MotherGroup {
  motherId: string;
  motherName: string;
  fatherName: string;
  deliveryDate: string;
  kittens: Kitten[];
}

interface BulkWeightRecordModalProps {
  opened: boolean;
  onClose: () => void;
  motherGroups: MotherGroup[];
  initialMotherIndex?: number;
  onSuccess?: () => void;
}

interface WeightInputState {
  [catId: string]: {
    weight: number | '';
    notes: string;
  };
}

/**
 * 母猫単位の一括体重記録モーダル
 * 兄弟（同じ母猫の子猫）をまとめて体重記録できる
 */
export function BulkWeightRecordModal({
  opened,
  onClose,
  motherGroups,
  initialMotherIndex = 0,
  onSuccess,
}: BulkWeightRecordModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialMotherIndex);
  const [recordedAt, setRecordedAt] = useState<Date>(new Date());
  const [weightInputs, setWeightInputs] = useState<WeightInputState>({});

  const createBulkMutation = useCreateBulkWeightRecords();

  const currentGroup = motherGroups[currentIndex];
  const hasMultipleGroups = motherGroups.length > 1;

  // モーダルが開いたときに初期化
  useEffect(() => {
    if (opened) {
      setCurrentIndex(initialMotherIndex);
      setRecordedAt(new Date());
      setWeightInputs({});
    }
  }, [opened, initialMotherIndex]);

  // 母猫が変わったときに入力状態をリセット
  useEffect(() => {
    if (currentGroup) {
      const initialInputs: WeightInputState = {};
      for (const kitten of currentGroup.kittens) {
        initialInputs[kitten.id] = { weight: '', notes: '' };
      }
      setWeightInputs(initialInputs);
    }
  }, [currentIndex, currentGroup]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < motherGroups.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleWeightChange = (catId: string, weight: number | string) => {
    setWeightInputs((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        weight: weight === '' ? '' : Number(weight),
      },
    }));
  };

  const handleNotesChange = (catId: string, notes: string) => {
    setWeightInputs((prev) => ({
      ...prev,
      [catId]: {
        ...prev[catId],
        notes,
      },
    }));
  };

  const handleSubmit = () => {

    // 入力された体重のみを収集
    const records: BulkWeightRecordItem[] = Object.entries(weightInputs)
      .filter(([, input]) => input.weight !== '' && typeof input.weight === 'number' && input.weight > 0)
      .map(([catId, input]) => ({
        catId,
        weight: input.weight as number,
        notes: input.notes || undefined,
      }));

    if (records.length === 0) {
      return;
    }

    createBulkMutation.mutate(
      {
        recordedAt: recordedAt.toISOString(),
        records,
      },
      {
        onSuccess: () => {
          // 入力をリセット
          const resetInputs: WeightInputState = {};
          for (const kitten of currentGroup?.kittens ?? []) {
            resetInputs[kitten.id] = { weight: '', notes: '' };
          }
          setWeightInputs(resetInputs);
          onSuccess?.();
        },
      },
    );
  };

  const filledCount = Object.values(weightInputs).filter(
    (input) => input.weight !== '' && typeof input.weight === 'number' && input.weight > 0,
  ).length;

  const isLoading = createBulkMutation.isPending;

  if (!currentGroup) {
    return null;
  }

  const sections: ModalSection[] = [
    {
      content: (
        <Card padding="sm" bg="gray.0" radius="md">
        <Group justify="space-between" align="center">
          <ActionIcon
            variant="subtle"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            aria-label="前の母猫"
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <Stack gap={2} align="center">
            <Text fw={600} size="lg">
              {currentGroup.motherName}
            </Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                父: {currentGroup.fatherName}
              </Text>
              <Text size="xs" c="dimmed">
                •
              </Text>
              <Text size="xs" c="dimmed">
                {currentGroup.deliveryDate}
              </Text>
            </Group>
            {hasMultipleGroups && (
              <Badge size="xs" variant="light">
                {currentIndex + 1} / {motherGroups.length}
              </Badge>
            )}
          </Stack>

          <ActionIcon
            variant="subtle"
            disabled={currentIndex === motherGroups.length - 1}
            onClick={handleNext}
            aria-label="次の母猫"
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Group>
        </Card>
      ),
    },
    {
      content: (
        <DateTimePicker
        label="測定日時"
        placeholder="測定日時を選択"
        maxDate={new Date()}
        value={recordedAt}
        onChange={(value) => {
          if (value) {
            // DateTimePicker は string を返すので Date に変換
            const dateValue = typeof value === 'string' ? new Date(value) : value;
            setRecordedAt(dateValue);
          }
        }}
          valueFormat="YYYY/MM/DD HH:mm"
        />
      ),
    },
    {
      content: (
        <Grid gutter="sm">
        {currentGroup.kittens.map((kitten) => (
          <Grid.Col key={kitten.id} span={{ base: 12, xs: 6 }}>
            <KittenWeightInput
              kitten={kitten}
              value={weightInputs[kitten.id]?.weight ?? ''}
              notes={weightInputs[kitten.id]?.notes ?? ''}
              onWeightChange={(weight) => handleWeightChange(kitten.id, weight)}
              onNotesChange={(notes) => handleNotesChange(kitten.id, notes)}
            />
          </Grid.Col>
        ))}
        </Grid>
      ),
    },
    {
      content: (
        <Group justify="space-between" mt="md">
          <Text size="sm" c="dimmed">
            {filledCount} / {currentGroup.kittens.length} 頭入力済み
          </Text>
          <Group>
            <Button variant="default" onClick={onClose} disabled={isLoading}>
              閉じる
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              disabled={filledCount === 0}
            >
              保存 ({filledCount}件)
            </Button>
          </Group>
        </Group>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconScale size={20} />
          <Text fw={600}>体重を一括記録</Text>
        </Group>
      }
      size="lg"
      centered
      sections={sections}
    />
  );
}

/**
 * 子猫の体重入力カード
 */
interface KittenWeightInputProps {
  kitten: Kitten;
  value: number | '';
  notes: string;
  onWeightChange: (weight: number | string) => void;
  onNotesChange: (notes: string) => void;
}

function KittenWeightInput({
  kitten,
  value,
  notes,
  onWeightChange,
  onNotesChange,
}: KittenWeightInputProps) {
  // 最新の体重記録を取得
  const { data: weightData } = useGetWeightRecords({
    catId: kitten.id,
    limit: 2,
    sortOrder: 'desc',
  });

  const summary = weightData?.summary;
  const previousWeight = summary?.latestWeight;
  const weightChange =
    value !== '' && previousWeight !== null && previousWeight !== undefined
      ? (value as number) - previousWeight
      : null;

  return (
    <Card padding="sm" radius="md" withBorder>
      <Stack gap="xs">
        {/* ヘッダー */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" fw={500} lineClamp={1}>
              {kitten.name}
            </Text>
            <GenderBadge gender={kitten.gender} size="xs" />
          </Group>
          {previousWeight !== null && previousWeight !== undefined && (
            <Text size="xs" c="dimmed">
              前回: {previousWeight}g
            </Text>
          )}
        </Group>

        {/* 体重入力 */}
        <Group gap="xs" align="flex-end" wrap="nowrap">
          <NumberInput
            placeholder="体重"
            value={value}
            onChange={onWeightChange}
            min={1}
            max={50000}
            step={5}
            suffix=" g"
            size="sm"
            style={{ flex: 1 }}
          />
          {weightChange !== null && (
            <WeightChangeBadge change={weightChange} />
          )}
        </Group>

        {/* メモ（オプション） */}
        <Textarea
          placeholder="メモ（任意）"
          value={notes}
          onChange={(e) => onNotesChange(e.currentTarget.value)}
          size="xs"
          autosize
          minRows={1}
          maxRows={2}
        />
      </Stack>
    </Card>
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
          <IconTrendingUp size={12} />
        ) : isNegative ? (
          <IconTrendingDown size={12} />
        ) : (
          <IconMinus size={12} />
        )
      }
    >
      {isPositive ? '+' : ''}
      {change}g
    </Badge>
  );
}

export default BulkWeightRecordModal;

