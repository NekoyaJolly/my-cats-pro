'use client';

import React from 'react';
import {
  Card,
  Text,
  Group,
  Flex,
  Stack,
  ActionIcon,
} from '@mantine/core';
import type { BirthPlan } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface BirthPlanTabProps {
  birthPlans: BirthPlan[];
  allCats: Cat[];
  onBirthConfirm: (item: BirthPlan) => void;
  onBirthCancel: (item: BirthPlan) => void;
}

export function BirthPlanTab({
  birthPlans,
  allCats,
  onBirthConfirm,
  onBirthCancel,
}: BirthPlanTabProps) {
  // EXPECTED ステータスのみ表示
  const expectedPlans = birthPlans.filter((item) => item.status === 'EXPECTED');

  return (
    <Stack gap="sm">
      {expectedPlans.map((item) => {
        // 父猫の名前を取得（fatherIdから）
        const fatherName = item.fatherId 
          ? allCats.find((cat) => cat.id === item.fatherId)?.name || '不明'
          : '不明';
        
        return (
          <Card key={item.id} shadow="sm" padding="sm" radius="md" withBorder>
            <Flex justify="space-between" align="center" wrap="nowrap">
              <Group gap="md" wrap="nowrap">
                <Text fw={600} size="sm">
                  {item.mother?.name || '不明'} ({fatherName})
                </Text>
                <Group gap={4} wrap="nowrap">
                  <Text size="sm" c="dimmed">
                    交配日: {item.matingDate ? new Date(item.matingDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }) : '不明'}
                  </Text>
                  <Text size="sm" c="dimmed">
                    出産予定日: {new Date(item.expectedBirthDate).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                  </Text>
                </Group>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon
                  color="green"
                  variant="light"
                  size="md"
                  onClick={() => onBirthConfirm(item)}
                  title="出産確認"
                >
                  ○
                </ActionIcon>
                <ActionIcon
                  color="red"
                  variant="light"
                  size="md"
                  onClick={() => onBirthCancel(item)}
                  title="出産なし"
                >
                  ×
                </ActionIcon>
              </Group>
            </Flex>
          </Card>
        );
      })}
      {expectedPlans.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          現在出産予定の猫はいません
        </Text>
      )}
    </Stack>
  );
}


