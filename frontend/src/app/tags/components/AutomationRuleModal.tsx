'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Radio,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';

import type { AutomationRuleFormValues, RuleType, ActionType } from '../types';
import {
  RULE_TYPE_OPTIONS,
  ACTION_TYPE_OPTIONS,
  AGE_TYPE_OPTIONS,
  PAGE_OPTIONS,
} from '../constants';

export type AutomationRuleModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<AutomationRuleFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  automationTagOptions: { value: string; label: string }[];
  pageActionOptions: { value: string; label: string }[];
};

/**
 * 自動化ルール編集/作成モーダル（シンプル化版）
 */
export function AutomationRuleModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  automationTagOptions,
  pageActionOptions,
}: AutomationRuleModalProps) {
  const ruleType = form.values.ruleType;
  const actionType = form.values.actionType;

  // TAG_ASSIGNEDは削除専用
  const isTagAssignedRule = ruleType === 'TAG_ASSIGNED';
  
  // TAG_ASSIGNED選択時は自動的に削除アクションに設定
  const handleRuleTypeChange = (value: RuleType) => {
    form.setFieldValue('ruleType', value);
    if (value === 'TAG_ASSIGNED') {
      form.setFieldValue('actionType', 'REMOVE');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? '自動化ルールの編集' : '自動化ルールの作成'}
      size="lg"
    >
      <Box component="form" onSubmit={onSubmit}>
        <Stack gap="md">
          {/* ルールタイプ選択 */}
          <Radio.Group
            label="いつ実行するか"
            value={ruleType}
            onChange={(value) => handleRuleTypeChange(value as RuleType)}
          >
            <Stack gap="xs" mt="xs">
              {RULE_TYPE_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value} label={option.label} />
              ))}
            </Stack>
          </Radio.Group>

          <Divider />

          {/* 条件設定エリア */}
          <Card withBorder padding="md" bg="gray.0">
            <Stack gap="md">
              {/* イベント発生時 */}
              {ruleType === 'PAGE_ACTION' && (
                <>
                  <Select
                    label="どこで"
                    placeholder="ページを選択"
                    data={PAGE_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
                    value={form.values.pageAction.page}
                    onChange={(value) => {
                      form.setFieldValue('pageAction.page', value || '');
                      form.setFieldValue('pageAction.action', '');
                    }}
                    required
                  />
                  {form.values.pageAction.page && (
                    <Select
                      label="何が発生したら"
                      placeholder="アクションを選択"
                      data={pageActionOptions}
                      value={form.values.pageAction.action}
                      onChange={(value) => form.setFieldValue('pageAction.action', value || '')}
                      required
                    />
                  )}
                </>
              )}

              {/* 年齢条件 */}
              {ruleType === 'AGE_THRESHOLD' && (
                <>
                  <Radio.Group
                    label="対象"
                    value={form.values.ageThreshold.ageType}
                    onChange={(value) => form.setFieldValue('ageThreshold.ageType', value as 'days' | 'months')}
                  >
                    <Group mt="xs">
                      {AGE_TYPE_OPTIONS.map((option) => (
                        <Radio key={option.value} value={option.value} label={option.label} />
                      ))}
                    </Group>
                  </Radio.Group>
                  <NumberInput
                    label={`生後${form.values.ageThreshold.ageType === 'days' ? '日数' : '月数'}`}
                    description={`この${form.values.ageThreshold.ageType === 'days' ? '日数' : '月数'}に達したら実行`}
                    placeholder="例: 60"
                    min={1}
                    value={form.values.ageThreshold.threshold}
                    onChange={(value) => form.setFieldValue('ageThreshold.threshold', typeof value === 'number' ? value : 0)}
                    required
                  />
                </>
              )}

              {/* タグ付与時（削除専用） */}
              {ruleType === 'TAG_ASSIGNED' && (
                <>
                  <Select
                    label="このタグが付与されたら"
                    placeholder="トリガーとなるタグを選択"
                    data={automationTagOptions}
                    value={form.values.triggerTagId}
                    onChange={(value) => form.setFieldValue('triggerTagId', value || '')}
                    searchable
                    required
                  />
                  <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                    選択したタグが付与されると、下で指定したタグが自動的に削除されます。
                  </Alert>
                </>
              )}
            </Stack>
          </Card>

          <Divider />

          {/* アクション選択 */}
          <Radio.Group
            label="何をするか"
            value={actionType}
            onChange={(value) => form.setFieldValue('actionType', value as ActionType)}
          >
            <Group mt="xs">
              {ACTION_TYPE_OPTIONS.map((option) => (
                <Radio 
                  key={option.value} 
                  value={option.value} 
                  label={option.label}
                  disabled={isTagAssignedRule && option.value === 'ASSIGN'}
                />
              ))}
            </Group>
          </Radio.Group>

          {/* 対象タグ */}
          <MultiSelect
            label={actionType === 'ASSIGN' ? '付与するタグ' : '削除するタグ'}
            placeholder="タグを選択"
            description="自動化が許可されているタグのみ選択できます"
            data={automationTagOptions}
            value={form.values.tagIds}
            onChange={(value) => form.setFieldValue('tagIds', value)}
            searchable
            required
            maxDropdownHeight={300}
            error={form.errors.tagIds}
          />

          <Divider label="オプション" labelPosition="center" />

          {/* ルール名（任意） */}
          <TextInput
            label="ルール名（任意）"
            placeholder="例: 新規猫登録時のタグ付与"
            description="空欄の場合は自動生成されます"
            value={form.values.name}
            onChange={(e) => form.setFieldValue('name', e.currentTarget.value)}
          />

          {/* メモ */}
          <TextInput
            label="メモ（任意）"
            placeholder="このルールの説明"
            value={form.values.description}
            onChange={(e) => form.setFieldValue('description', e.currentTarget.value)}
          />

          {/* アクティブスイッチ */}
          <Switch
            label="このルールを有効にする"
            checked={form.values.isActive}
            onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
          />

          {/* 設定サマリー */}
          <Card withBorder padding="sm" bg="blue.0">
            <Stack gap={4}>
              <Text size="sm" fw={500}>設定内容</Text>
              <Text size="xs" c="dimmed">
                {ruleType === 'PAGE_ACTION' && form.values.pageAction.page && form.values.pageAction.action && (
                  <>
                    📍 {PAGE_OPTIONS.find(p => p.value === form.values.pageAction.page)?.label}で
                    「{pageActionOptions.find(a => a.value === form.values.pageAction.action)?.label}」が発生したら
                  </>
                )}
                {ruleType === 'AGE_THRESHOLD' && form.values.ageThreshold.threshold > 0 && (
                  <>
                    📅 生後{form.values.ageThreshold.threshold}{form.values.ageThreshold.ageType === 'days' ? '日' : 'ヶ月'}に達したら
                  </>
                )}
                {ruleType === 'TAG_ASSIGNED' && form.values.triggerTagId && (
                  <>
                    🏷️ 「{automationTagOptions.find(t => t.value === form.values.triggerTagId)?.label}」が付与されたら
                  </>
                )}
              </Text>
              <Text size="xs">
                {actionType === 'ASSIGN' ? '→ タグを付与' : '→ タグを削除'}
                {form.values.tagIds.length > 0 && ` (${form.values.tagIds.length}件)`}
              </Text>
            </Stack>
          </Card>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {isEditing ? '更新' : '作成'}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}
