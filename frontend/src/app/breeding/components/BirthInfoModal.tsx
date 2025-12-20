'use client';

import React from 'react';
import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  Group,
  Button,
  ActionIcon,
} from '@mantine/core';
import { IconBabyCarriage, IconRainbow } from '@tabler/icons-react';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface BirthInfoModalProps {
  opened: boolean;
  onClose: () => void;
  selectedBirthPlan: BirthPlan | null;
  allCats: Cat[];
  birthCount: number;
  deathCount: number;
  birthDate: string;
  onBirthCountChange: (count: number) => void;
  onDeathCountChange: (count: number) => void;
  onBirthDateChange: (date: string) => void;
  onSubmit: () => void;
  onDetailSubmit: () => void;
  isLoading: boolean;
}

export function BirthInfoModal({
  opened,
  onClose,
  selectedBirthPlan,
  allCats,
  birthCount,
  deathCount,
  birthDate,
  onBirthCountChange,
  onDeathCountChange,
  onBirthDateChange,
  onSubmit,
  onDetailSubmit,
  isLoading,
}: BirthInfoModalProps) {
  const handleClose = () => {
    onClose();
  };

  // 父猫の名前を取得
  const fatherName = selectedBirthPlan?.fatherId 
    ? allCats.find((cat) => cat.id === selectedBirthPlan.fatherId)?.name || '不明'
    : '不明';

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="出産情報の入力"
      size="md"
    >
      <Stack gap="md">
        {/* 両親の名前 */}
        <TextInput
          label="両親"
          value={selectedBirthPlan ? `${selectedBirthPlan.mother?.name || '不明'} (${fatherName})` : ''}
          readOnly
        />

        {/* 出産日 */}
        <TextInput
          label="出産日"
          type="date"
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
        />

        {/* 出産頭数 */}
        <Group gap="sm" align="flex-end">
          <NumberInput
            label="出産頭数"
            value={birthCount}
            onChange={(value) => onBirthCountChange(typeof value === 'number' ? value : 0)}
            min={0}
            style={{ flex: 1 }}
          />
          <ActionIcon
            size="lg"
            variant="light"
            color="blue"
            onClick={() => onBirthCountChange(birthCount + 1)}
            title="1頭追加"
          >
            <IconBabyCarriage size={20} />
          </ActionIcon>
        </Group>

        {/* 死亡数 */}
        <Group gap="sm" align="flex-end">
          <NumberInput
            label="死亡数"
            value={deathCount}
            onChange={(value) => onDeathCountChange(typeof value === 'number' ? value : 0)}
            min={0}
            style={{ flex: 1 }}
          />
          <ActionIcon
            size="lg"
            variant="light"
            color="grape"
            onClick={() => onDeathCountChange(deathCount + 1)}
            title="1頭追加"
          >
            <IconRainbow size={20} />
          </ActionIcon>
        </Group>

        {/* アクションボタン */}
        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="outline"
            onClick={onDetailSubmit}
          >
            詳細登録
          </Button>
          <Button
            onClick={onSubmit}
            loading={isLoading}
          >
            登録
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}









