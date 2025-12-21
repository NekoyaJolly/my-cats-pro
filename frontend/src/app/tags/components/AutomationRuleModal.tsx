'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';

import type { AutomationRuleFormValues } from '../types';
import {
  TRIGGER_TYPE_OPTIONS,
  EVENT_TYPE_OPTIONS,
  PAGE_OPTIONS,
  TARGET_SELECTION_OPTIONS,
} from '../constants';

export type AutomationRuleModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<AutomationRuleFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isEditing: boolean;
  isSubmitting: boolean;
  automationScopeOptions: { value: string; label: string }[];
  automationTagOptions: { value: string; label: string }[];
  pageActionOptions: { value: string; label: string }[];
};

/**
 * 自動化ルール編集/作成モーダル
 */
export function AutomationRuleModal({
  opened,
  onClose,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
  automationScopeOptions,
  automationTagOptions,
  pageActionOptions,
}: AutomationRuleModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? '自動化ルールの編集' : '自動化ルールの作成'}
      size="lg"
    >
      <Box component="form" onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            label="キー"
            placeholder="例: breeding_planned_tag"
            description="英数字、ハイフン、アンダースコアのみ使用可能"
            required
            disabled={isEditing}
            {...form.getInputProps('key')}
          />

          <TextInput
            label="ルール名"
            placeholder="例: 交配予定時の自動タグ付与"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="説明"
            placeholder="このルールの動作を説明してください"
            {...form.getInputProps('description')}
          />

          <Select
            label="トリガータイプ"
            placeholder="トリガータイプを選択"
            data={TRIGGER_TYPE_OPTIONS}
            required
            {...form.getInputProps('triggerType')}
          />

          {form.values.triggerType === 'EVENT' && (
            <Select
              label="イベントタイプ"
              placeholder="イベントタイプを選択"
              data={EVENT_TYPE_OPTIONS}
              required
              {...form.getInputProps('eventType')}
            />
          )}

          <Select
            label="スコープ"
            placeholder="適用するスコープ（任意）"
            description="このルールを適用するページ・機能を選択"
            data={automationScopeOptions}
            clearable
            searchable
            {...form.getInputProps('scope')}
          />

          <MultiSelect
            label="付与するタグ"
            placeholder="イベント発生時に自動付与するタグを選択"
            description="自動化が許可されているタグのみ選択できます"
            data={automationTagOptions}
            searchable
            required
            maxDropdownHeight={300}
            {...form.getInputProps('tagIds')}
          />

          {/* 年齢閾値の設定 */}
          {form.values.eventType === 'AGE_THRESHOLD' && (
            <Card withBorder padding="md" bg="gray.0">
              <Stack gap="md">
                <Text fw={500} size="sm">年齢閾値の設定</Text>
                
                <SegmentedControl
                  data={[
                    { value: 'kitten', label: '子猫用（日数）' },
                    { value: 'adult', label: '成猫用（月数）' },
                  ]}
                  value={form.values.ageThreshold?.type || 'kitten'}
                  onChange={(value) => {
                    form.setFieldValue('ageThreshold.type', value as 'kitten' | 'adult');
                  }}
                />

                {form.values.ageThreshold?.type === 'kitten' && (
                  <Group grow>
                    <NumberInput
                      label="最小日数"
                      placeholder="例: 60"
                      description="生後◯日以上"
                      min={0}
                      {...form.getInputProps('ageThreshold.kitten.minDays')}
                    />
                    <NumberInput
                      label="最大日数"
                      placeholder="例: 90"
                      description="生後◯日未満"
                      min={0}
                      {...form.getInputProps('ageThreshold.kitten.maxDays')}
                    />
                  </Group>
                )}

                {form.values.ageThreshold?.type === 'adult' && (
                  <Group grow>
                    <NumberInput
                      label="最小月数"
                      placeholder="例: 6"
                      description="生後◯ヶ月以上"
                      min={0}
                      {...form.getInputProps('ageThreshold.adult.minMonths')}
                    />
                    <NumberInput
                      label="最大月数"
                      placeholder="例: 12"
                      description="生後◯ヶ月未満"
                      min={0}
                      {...form.getInputProps('ageThreshold.adult.maxMonths')}
                    />
                  </Group>
                )}

                <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                  {form.values.ageThreshold?.type === 'kitten' 
                    ? '子猫（母猫IDが設定されている猫）に対して、指定した日数の範囲でタグを自動付与します。'
                    : '成猫に対して、指定した月数の範囲でタグを自動付与します。'
                  }
                </Alert>
              </Stack>
            </Card>
          )}

          {/* PAGE_ACTION設定 */}
          {form.values.eventType === 'PAGE_ACTION' && (
            <Card withBorder padding="md" bg="blue.0">
              <Stack gap="md">
                <Text fw={500} size="sm">ページ・アクション設定</Text>
                
                <Select
                  label="ページ"
                  placeholder="アクションが発生するページを選択"
                  description="どのページでイベントが発生するかを指定"
                  data={PAGE_OPTIONS.map(p => ({ value: p.value, label: p.label }))}
                  required
                  onChange={(value) => {
                    form.setFieldValue('pageAction.page', value || '');
                    // ページ変更時にアクションをクリア
                    form.setFieldValue('pageAction.action', '');
                  }}
                  value={form.values.pageAction?.page}
                />

                {form.values.pageAction?.page && (
                  <Select
                    label="アクション"
                    placeholder="発生するアクションを選択"
                    description="どのようなアクションが発生した際にタグを付与するか"
                    data={pageActionOptions}
                    required
                    {...form.getInputProps('pageAction.action')}
                  />
                )}

                <Select
                  label="対象猫の選択方法"
                  placeholder="タグを付与する猫の選択方法"
                  description="どの猫にタグを付与するかを指定"
                  data={TARGET_SELECTION_OPTIONS}
                  required
                  {...form.getInputProps('pageAction.targetSelection')}
                />

                {form.values.pageAction?.targetSelection === 'specific_cats' && (
                  <MultiSelect
                    label="特定の猫"
                    placeholder="タグを付与する猫を選択"
                    description="指定した猫にのみタグを付与します"
                    data={[]}
                    searchable
                    {...form.getInputProps('pageAction.specificCatIds')}
                  />
                )}

                <Alert icon={<IconInfoCircle size={18} />} variant="light" color="blue">
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>現在の設定</Text>
                    {form.values.pageAction?.page && (
                      <>
                        <Text size="xs">
                          📄 ページ: {PAGE_OPTIONS.find(p => p.value === form.values.pageAction?.page)?.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          パス: {PAGE_OPTIONS.find(p => p.value === form.values.pageAction?.page)?.href}
                        </Text>
                      </>
                    )}
                    {form.values.pageAction?.action && pageActionOptions.length > 0 && (
                      <Text size="xs">
                        ⚡ アクション: {pageActionOptions.find(a => a.value === form.values.pageAction?.action)?.label}
                      </Text>
                    )}
                    {!form.values.pageAction?.page && (
                      <Text size="xs" c="dimmed">
                        まずページを選択してください
                      </Text>
                    )}
                    {form.values.pageAction?.page && pageActionOptions.length === 0 && (
                      <Text size="xs" c="orange">
                        ⚠️ 選択したページにはアクションが定義されていません
                      </Text>
                    )}
                  </Stack>
                </Alert>
              </Stack>
            </Card>
          )}

          <NumberInput
            label="優先度"
            description="0-100の範囲で設定。数値が大きいほど優先度が高くなります"
            min={0}
            max={100}
            required
            {...form.getInputProps('priority')}
          />

          <Switch
            label="このルールを有効にする"
            {...form.getInputProps('isActive', { type: 'checkbox' })}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={onClose}
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              loading={isSubmitting}
            >
              {isEditing ? '更新' : '作成'}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Modal>
  );
}








