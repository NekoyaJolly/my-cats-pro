'use client';

import {
  Stack,
  Text,
  Card,
  Flex,
  Box,
  Group,
  Badge,
  Button,
} from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { Cat } from '@/lib/api/hooks/use-cats';
import { calculateAgeInMonths } from '../utils';

export interface MaleSelectionModalProps {
  opened: boolean;
  onClose: () => void;
  allCats: Cat[];
  activeMales: Cat[];
  onAddMale: (male: Cat) => void;
}

export function MaleSelectionModal({
  opened,
  onClose,
  allCats,
  activeMales,
  onAddMale,
}: MaleSelectionModalProps) {
  // 追加可能なオス猫をフィルタリング（在舎、10ヶ月以上、まだ追加されていない）
  const availableMales = allCats.filter((cat) => 
    cat.gender === 'MALE' && 
    cat.isInHouse && 
    calculateAgeInMonths(cat.birthDate) >= 10 &&
    !activeMales.some((am) => am.id === cat.id)
  );

  const sections: ModalSection[] = [
    {
      content: (
        <Stack gap="sm" p="md">
          <Text size="sm" c="dimmed">
            スケジュールに追加するオス猫を選択してください
          </Text>
          
          {availableMales.map((male) => (
          <Card key={male.id} shadow="sm" padding="sm" radius="md" withBorder>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fw={600}>{male.name}</Text>
                <Text size="sm" c="dimmed">{male.breed?.name ?? '不明'}</Text>
                <Group gap="xs">
                  {male.tags?.map((catTag, index) => (
                    <Badge key={`${catTag.tag.id}-${index}`} variant="outline" size="xs">
                      {catTag.tag.name}
                    </Badge>
                  )) ?? []}
                </Group>
              </Box>
              <Button
                size="sm"
                onClick={() => {
                  onAddMale(male);
                  onClose();
                }}
              >
                追加
              </Button>
            </Flex>
          </Card>
          ))}
          {availableMales.length === 0 && (
            <Text ta="center" c="dimmed">
              追加可能なオス猫がいません
            </Text>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="オス猫をスケジュールに追加"
      size="md"
      addContentPadding={false}
      sections={sections}
    />
  );
}









