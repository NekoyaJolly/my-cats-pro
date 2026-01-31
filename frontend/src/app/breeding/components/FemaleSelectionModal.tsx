'use client';

import React, { ChangeEvent } from 'react';
import {
  Stack,
  Text,
  Card,
  Flex,
  Box,
  Group,
  Badge,
  Button,
  NumberInput,
  Checkbox,
  Divider,
} from '@mantine/core';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { Cat } from '@/lib/api/hooks/use-cats';

export interface FemaleSelectionModalProps {
  opened: boolean;
  onClose: () => void;
  selectedMale: Cat | null;
  availableFemales: Cat[];
  selectedDuration: number;
  onDurationChange: (duration: number) => void;
  onSetDefaultDuration: (duration: number, setAsDefault: boolean) => void;
  onSelectFemale: (femaleId: string) => void;
  isNGPairing: (maleId: string, femaleId: string) => boolean;
}

export function FemaleSelectionModal({
  opened,
  onClose,
  selectedMale,
  availableFemales,
  selectedDuration,
  onDurationChange,
  onSetDefaultDuration,
  onSelectFemale,
  isNGPairing,
}: FemaleSelectionModalProps) {
  const sections: ModalSection[] = [
    {
      content: (
        <Stack gap="md" p="md">
        <Text size="sm" c="dimmed">
          {selectedMale?.name} との交配相手を選択してください
        </Text>
        
        <Stack gap="xs">
          <NumberInput
            label="交配期間"
            description="交配を行う日数を設定してください"
            value={selectedDuration}
            onChange={(value) => onDurationChange(typeof value === 'number' ? value : 1)}
            min={1}
            max={7}
            suffix="日間"
          />
          <Checkbox
            label="この期間をデフォルトに設定"
            size="sm"
            onChange={(event: ChangeEvent<HTMLInputElement>) => 
              onSetDefaultDuration(selectedDuration, event.currentTarget.checked)
            }
          />
        </Stack>

        <Divider label="メス猫一覧" labelPosition="center" />

        {availableFemales.map((female) => {
          const isNG = selectedMale ? isNGPairing(selectedMale.id, female.id) : false;
          return (
            <Card 
              key={female.id} 
              shadow="sm" 
              padding="sm" 
              radius="md" 
              withBorder
              style={{ borderColor: isNG ? '#ff6b6b' : undefined }}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Group gap="xs">
                    <Text fw={600}>{female.name}</Text>
                    {isNG && <Badge color="red" size="xs">NG</Badge>}
                  </Group>
                  <Text size="sm" c="dimmed">{female.breed?.name ?? '不明'}</Text>
                  <Group gap="xs">
                    {female.tags?.map((catTag) => (
                      <Badge key={catTag.tag.id} variant="outline" size="xs">
                        {catTag.tag.name}
                      </Badge>
                    )) ?? []}
                  </Group>
                </Box>
                <Button
                  size="sm"
                  color={isNG ? "red" : undefined}
                  variant={isNG ? "outline" : "filled"}
                  onClick={() => onSelectFemale(female.id)}
                >
                  {isNG ? '警告選択' : '選択'}
                </Button>
              </Flex>
            </Card>
          );
        })}
        {availableFemales.length === 0 && (
          <Text ta="center" c="dimmed">
            現在交配可能なメス猫がいません
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
      title="交配するメス猫を選択"
      size="md"
      addContentPadding={false}
      sections={sections}
    />
  );
}









