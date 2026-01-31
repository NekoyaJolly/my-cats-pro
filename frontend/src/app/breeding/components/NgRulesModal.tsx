'use client';

import {
  Stack,
  Text,
  Card,
  Group,
  Badge,
  Button,
  ActionIcon,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { UnifiedModal, type ModalSection } from '@/components/common';
import type { NgPairingRule } from '../types';

export interface NgRulesModalProps {
  opened: boolean;
  onClose: () => void;
  ngPairingRules: NgPairingRule[];
  isLoading: boolean;
  error: string | null;
  onOpenNewRuleModal: () => void;
  onDeleteRule: (rule: NgPairingRule) => void;
}

export function NgRulesModal({
  opened,
  onClose,
  ngPairingRules,
  isLoading,
  error,
  onOpenNewRuleModal,
  onDeleteRule,
}: NgRulesModalProps) {
  const sections: ModalSection[] = [
    {
      content: (
        <Text size="sm" c="dimmed">
        交配を禁止するルールを設定できます。設定したルールに該当する組み合わせを選択すると警告が表示されます。
        </Text>
      ),
    },
    {
      content: (
        <Button
        leftSection={<IconPlus size={16} />}
        onClick={onOpenNewRuleModal}
        variant="light"
        fullWidth
      >
        新しいルールを追加
      </Button>
      ),
    },
    {
      label: "登録済みルール",
      content: (
        <>
          {isLoading ? (
        <Text size="sm" c="dimmed" ta="center">
          読み込み中...
        </Text>
      ) : error ? (
        <Text size="sm" c="red" ta="center">
          {error}
        </Text>
      ) : ngPairingRules.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center">
          登録されているルールはありません
        </Text>
      ) : (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            登録済みルール ({ngPairingRules.length}件)
          </Text>
          {ngPairingRules.map((rule) => (
            <Card key={rule.id} p="sm" withBorder>
              <Group justify="space-between" wrap="nowrap">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>
                      {rule.name}
                    </Text>
                    <Badge 
                      size="sm" 
                      variant={rule.active ? 'filled' : 'outline'}
                      color={rule.active ? 'blue' : 'gray'}
                    >
                      {rule.active ? '有効' : '無効'}
                    </Badge>
                    <Badge size="sm" variant="light">
                      {rule.type === 'TAG_COMBINATION' ? 'タグ組合せ' : 
                       rule.type === 'INDIVIDUAL_PROHIBITION' ? '個体禁止' : 
                       rule.type === 'GENERATION_LIMIT' ? '世代制限' : rule.type}
                    </Badge>
                  </Group>
                  {rule.description && (
                    <Text size="xs" c="dimmed">
                      {rule.description}
                    </Text>
                  )}
                  {rule.type === 'INDIVIDUAL_PROHIBITION' && (
                    <Group gap="xs">
                      {rule.maleNames && rule.maleNames.length > 0 && (
                        <Text size="xs" c="dimmed">
                          オス: {rule.maleNames.join(', ')}
                        </Text>
                      )}
                      {rule.femaleNames && rule.femaleNames.length > 0 && (
                        <Text size="xs" c="dimmed">
                          メス: {rule.femaleNames.join(', ')}
                        </Text>
                      )}
                    </Group>
                  )}
                  {rule.type === 'GENERATION_LIMIT' && rule.generationLimit && (
                    <Text size="xs" c="dimmed">
                      世代制限: {rule.generationLimit}世代
                    </Text>
                  )}
                </Stack>
                <Group gap="xs" wrap="nowrap">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDeleteRule(rule)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            </Card>
            ))}
          </Stack>
        )}
        </>
      ),
    },
  ];

  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="交配NG設定"
      size="xl"
      centered
      sections={sections}
    />
  );
}









