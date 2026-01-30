'use client';

import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Text,
  Divider,
} from '@mantine/core';
import { IconInfoCircle, IconWand } from '@tabler/icons-react';
import { UnifiedModal } from '@/components/common';

import type { TagAutomationRule } from '@/lib/api/hooks/use-tag-automation';

export type ExecuteRuleModalProps = {
  opened: boolean;
  onClose: () => void;
  rule: TagAutomationRule | null;
  isExecuting: boolean;
  onExecute: () => void;
};

/**
 * 自動化ルールテスト実行モーダル
 */
export function ExecuteRuleModal({
  opened,
  onClose,
  rule,
  isExecuting,
  onExecute,
}: ExecuteRuleModalProps) {
  return (
    <UnifiedModal
      opened={opened}
      onClose={onClose}
      title="自動化ルールのテスト実行"
      size="md"
    >
      {rule && (
        <>
          <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
            このルールをテスト実行します。実際のデータに対してタグの付与が行われますのでご注意ください。
          </Alert>

          <Divider label="ルール詳細" labelPosition="center" />

          <Box>
            <Text size="sm" fw={500} mb={4}>
              ルール名
            </Text>
            <Text size="sm" c="dimmed">
              {rule.name}
            </Text>
          </Box>

          {rule.description && (
            <Box>
              <Text size="sm" fw={500} mb={4}>
                説明
              </Text>
              <Text size="sm" c="dimmed">
                {rule.description}
              </Text>
            </Box>
          )}

          <Box>
            <Text size="sm" fw={500} mb={4}>
              イベントタイプ
            </Text>
            <Badge size="sm" variant="light">
              {rule.eventType === 'BREEDING_PLANNED' && '交配予定'}
              {rule.eventType === 'BREEDING_CONFIRMED' && '交配確認'}
              {rule.eventType === 'PREGNANCY_CONFIRMED' && '妊娠確認'}
              {rule.eventType === 'KITTEN_REGISTERED' && '子猫登録'}
              {rule.eventType === 'AGE_THRESHOLD' && '年齢閾値'}
              {rule.eventType === 'PAGE_ACTION' && 'ページアクション'}
              {rule.eventType === 'CUSTOM' && 'カスタム'}
            </Badge>
          </Box>

          {rule.config && typeof rule.config === 'object' && (rule.config as { tagIds?: string[] }).tagIds && (
            <Box>
              <Text size="sm" fw={500} mb={4}>
                付与するタグ
              </Text>
              <Text size="sm" c="dimmed">
                {((rule.config as { tagIds?: string[] }).tagIds ?? []).length}個のタグを付与
              </Text>
            </Box>
          )}

          <Divider />

          <Alert icon={<IconInfoCircle size={18} />} variant="light" color="yellow">
            注意: テスト用のダミーデータでイベントを発行します。実際の猫データには影響しません。
          </Alert>

          <Divider />
        </>
      )}

      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          onClick={onClose}
          disabled={isExecuting}
        >
          キャンセル
        </Button>
        <Button
          color="green"
          onClick={onExecute}
          loading={isExecuting}
          leftSection={<IconWand size={16} />}
        >
          実行
        </Button>
      </Group>
    </UnifiedModal>
  );
}








