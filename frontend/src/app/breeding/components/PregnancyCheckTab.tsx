'use client';

import {
  Card,
  Text,
  Group,
  Flex,
  Stack,
  ActionIcon,
} from '@mantine/core';
import type { PregnancyCheck } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface PregnancyCheckTabProps {
  pregnancyChecks: PregnancyCheck[];
  allCats: Cat[];
  onPregnancyCheck: (item: PregnancyCheck, isPregnant: boolean) => void;
}

export function PregnancyCheckTab({
  pregnancyChecks,
  allCats,
  onPregnancyCheck,
}: PregnancyCheckTabProps) {
  return (
    <Stack gap="sm">
      {pregnancyChecks.map((item) => {
        // 父猫の名前を取得（fatherIdから）
        const fatherName = item.fatherId 
          ? allCats.find((cat) => cat.id === item.fatherId)?.name || '不明'
          : '不明';
        
        // 確認予定日を計算（交配日の25日後）
        const scheduledCheckDate = item.matingDate 
          ? (() => {
              const date = new Date(item.matingDate);
              date.setDate(date.getDate() + 25);
              return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
            })()
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
                    妊娠確認予定日: {scheduledCheckDate}
                  </Text>
                </Group>
              </Group>
              <Group gap="xs" wrap="nowrap">
                <ActionIcon
                  color="green"
                  variant="light"
                  size="md"
                  onClick={() => onPregnancyCheck(item, true)}
                  title="妊娠確定"
                >
                  ○
                </ActionIcon>
                <ActionIcon
                  color="red"
                  variant="light"
                  size="md"
                  onClick={() => onPregnancyCheck(item, false)}
                  title="非妊娠"
                >
                  ×
                </ActionIcon>
              </Group>
            </Flex>
          </Card>
        );
      })}
      {pregnancyChecks.length === 0 && (
        <Text ta="center" c="dimmed" py="xl">
          現在妊娠確認中の猫はいません
        </Text>
      )}
    </Stack>
  );
}









