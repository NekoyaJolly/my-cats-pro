'use client';

import React from 'react';
import {
  Text,
  Group,
  Button,
} from '@mantine/core';
import { UnifiedModal } from '@/components/common';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';

export interface CompleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  selectedBirthPlan: BirthPlan | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CompleteConfirmModal({
  opened,
  onClose,
  selectedBirthPlan,
  onConfirm,
  isLoading,
}: CompleteConfirmModalProps) {
  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="出産記録を完了しますか？"
      centered
    >
      <Text size="sm">
        {selectedBirthPlan?.mother?.name || '不明'}の出産記録を完了します。
        完了後は子育て中タブから削除され、母猫詳細ページの出産記録に格納されます。
      </Text>
      <Text size="sm" c="dimmed">
        この操作は元に戻せません。
      </Text>
      <Group justify="flex-end" gap="sm" mt="md">
        <Button
          variant="outline"
          onClick={onClose}
        >
          キャンセル
        </Button>
        <Button
          color="blue"
          onClick={onConfirm}
          loading={isLoading}
        >
          完了する
        </Button>
      </Group>
    </UnifiedModal>
  );
}









