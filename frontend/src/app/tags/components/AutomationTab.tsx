'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconRobot,
  IconTrash,
  IconWand,
} from '@tabler/icons-react';

import type { TagAutomationRule } from '@/lib/api/hooks/use-tag-automation';

export type AutomationTabProps = {
  isLoading: boolean;
  automationRules: TagAutomationRule[];
  isAnyMutationPending: boolean;
  createAutomationRulePending: boolean;
  updateAutomationRulePending: boolean;
  deleteAutomationRulePending: boolean;
  onOpenCreateRule: () => void;
  onEditRule: (rule: TagAutomationRule) => void;
  onDeleteRule: (id: string) => void;
  onOpenExecuteRule: (rule: TagAutomationRule) => void;
};

/**
 * 自動化ルールタブコンポーネント
 * タグ自動付与ルールの一覧と管理
 */
export function AutomationTab({
  isLoading,
  automationRules,
  isAnyMutationPending,
  createAutomationRulePending,
  updateAutomationRulePending,
  deleteAutomationRulePending,
  onOpenCreateRule,
  onEditRule,
  onDeleteRule,
  onOpenExecuteRule,
}: AutomationTabProps) {
  return (
    <Stack gap="md">
      <Card withBorder padding="md" radius="md">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>
              自動化ルール
            </Text>
            <Button 
              leftSection={<IconPlus size={16} />} 
              size="sm" 
              onClick={onOpenCreateRule}
              disabled={isAnyMutationPending || createAutomationRulePending}
            >
              ルール作成
            </Button>
          </Group>
          <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
            自動化ルールを設定すると、特定のイベント（交配登録、妊娠確認、子猫登録など）が発生したときに、条件に合致する猫へ自動的にタグを付与できます。
          </Alert>
        </Stack>
      </Card>

      {isLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : automationRules.length === 0 ? (
        <Center py="xl">
          <Stack gap="sm" align="center">
            <IconRobot size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" size="sm">
              自動化ルールが登録されていません
            </Text>
            <Text c="dimmed" size="xs">
              「ルール作成」ボタンから新しいルールを追加できます
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {automationRules.map((rule) => (
            <Card key={rule.id} withBorder radius="md" padding="md">
              <Group justify="space-between" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Group gap="xs" align="center">
                    <Text fw={500}>{rule.name}</Text>
                    {!rule.isActive && (
                      <Badge size="xs" color="gray" variant="outline">
                        無効
                      </Badge>
                    )}
                    <Badge size="xs" variant="light" color="blue">
                      {rule.triggerType === 'EVENT' && 'イベント'}
                      {rule.triggerType === 'SCHEDULE' && 'スケジュール'}
                      {rule.triggerType === 'MANUAL' && '手動'}
                    </Badge>
                    {rule.eventType && (
                      <Badge size="xs" variant="outline">
                        {rule.eventType === 'BREEDING_PLANNED' && '交配予定'}
                        {rule.eventType === 'BREEDING_CONFIRMED' && '交配確認'}
                        {rule.eventType === 'PREGNANCY_CONFIRMED' && '妊娠確認'}
                        {rule.eventType === 'KITTEN_REGISTERED' && '子猫登録'}
                        {rule.eventType === 'AGE_THRESHOLD' && '年齢閾値'}
                        {rule.eventType === 'PAGE_ACTION' && 'ページアクション'}
                        {rule.eventType === 'CUSTOM' && 'カスタム'}
                      </Badge>
                    )}
                  </Group>
                  {rule.description && (
                    <Text size="sm" c="dimmed">
                      {rule.description}
                    </Text>
                  )}
                  <Group gap="xs">
                    <Badge size="xs" variant="outline">
                      優先度: {rule.priority}
                    </Badge>
                    {rule.scope && (
                      <Badge size="xs" variant="outline">
                        スコープ: {rule.scope}
                      </Badge>
                    )}
                    {rule.config && typeof rule.config === 'object' && (rule.config as { tagIds?: string[] }).tagIds && (
                      <Badge size="xs" variant="outline" color="teal">
                        付与タグ: {((rule.config as { tagIds?: string[] }).tagIds ?? []).length}個
                      </Badge>
                    )}
                    {rule._count && (
                      <>
                        {rule._count.runs !== undefined && (
                          <Badge size="xs" variant="outline">
                            実行回数: {rule._count.runs}
                          </Badge>
                        )}
                        {rule._count.assignmentHistory !== undefined && (
                          <Badge size="xs" variant="outline">
                            付与履歴: {rule._count.assignmentHistory}
                          </Badge>
                        )}
                      </>
                    )}
                  </Group>
                </Stack>
                <Group gap={6}>
                  <Tooltip label="テスト実行">
                    <ActionIcon
                      variant="light"
                      color="green"
                      size="sm"
                      onClick={() => onOpenExecuteRule(rule)}
                      disabled={isAnyMutationPending}
                    >
                      <IconWand size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="編集">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => onEditRule(rule)}
                      disabled={isAnyMutationPending || updateAutomationRulePending}
                    >
                      <IconPencil size={14} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="削除">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      disabled={deleteAutomationRulePending}
                      onClick={() => void onDeleteRule(rule.id)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

