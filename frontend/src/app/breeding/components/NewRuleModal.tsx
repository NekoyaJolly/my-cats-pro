'use client';

import React from 'react';
import {
  Modal,
  Stack,
  TextInput,
  NumberInput,
  MultiSelect,
  Radio,
  Group,
  Button,
} from '@mantine/core';
import type { BreedingNgRuleType } from '@/lib/api/hooks/use-breeding';
import type { Cat } from '@/lib/api/hooks/use-cats';
import type { NewRuleState } from '../types';

export interface NewRuleModalProps {
  opened: boolean;
  onClose: () => void;
  newRule: NewRuleState;
  onRuleChange: (rule: NewRuleState) => void;
  availableTags: string[];
  allCats: Cat[];
  onSubmit: () => void;
  isLoading: boolean;
}

export function NewRuleModal({
  opened,
  onClose,
  newRule,
  onRuleChange,
  availableTags,
  allCats,
  onSubmit,
  isLoading,
}: NewRuleModalProps) {
  const handleClose = () => {
    onRuleChange({
      name: '',
      type: 'TAG_COMBINATION',
      maleNames: [],
      femaleNames: [],
      maleConditions: [],
      femaleConditions: [],
      generationLimit: 3,
      description: '',
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="新規NGルール作成"
      size="lg"
      centered
    >
      <Stack gap="md">
        <TextInput
          label="ルール名"
          placeholder="例: 同血統禁止"
          value={newRule.name}
          onChange={(e) => onRuleChange({ ...newRule, name: e.target.value })}
          required
        />

        <Radio.Group
          label="ルールタイプ"
          value={newRule.type}
          onChange={(value) => onRuleChange({ ...newRule, type: value as BreedingNgRuleType })}
        >
          <Stack gap="xs" mt="xs">
            <Radio value="TAG_COMBINATION" label="タグ組合せ禁止" />
            <Radio value="INDIVIDUAL_PROHIBITION" label="個体間禁止" />
            <Radio value="GENERATION_LIMIT" label="世代制限" />
          </Stack>
        </Radio.Group>

        {newRule.type === 'TAG_COMBINATION' && (
          <>
            <MultiSelect
              label="オス猫の条件タグ"
              placeholder="禁止するオス猫のタグを選択"
              data={availableTags}
              value={newRule.maleConditions}
              onChange={(values) => onRuleChange({ ...newRule, maleConditions: values })}
              searchable
            />
            <MultiSelect
              label="メス猫の条件タグ"
              placeholder="禁止するメス猫のタグを選択"
              data={availableTags}
              value={newRule.femaleConditions}
              onChange={(values) => onRuleChange({ ...newRule, femaleConditions: values })}
              searchable
            />
          </>
        )}

        {newRule.type === 'INDIVIDUAL_PROHIBITION' && (
          <>
            <MultiSelect
              label="禁止するオス猫"
              placeholder="オス猫を選択"
              data={allCats
                .filter((cat) => cat.gender === 'MALE' && cat.isInHouse)
                .map((cat) => ({ value: cat.name, label: cat.name }))}
              value={newRule.maleNames}
              onChange={(values) => onRuleChange({ ...newRule, maleNames: values })}
              searchable
            />
            <MultiSelect
              label="禁止するメス猫"
              placeholder="メス猫を選択"
              data={allCats
                .filter((cat) => cat.gender === 'FEMALE' && cat.isInHouse)
                .map((cat) => ({ value: cat.name, label: cat.name }))}
              value={newRule.femaleNames}
              onChange={(values) => onRuleChange({ ...newRule, femaleNames: values })}
              searchable
            />
          </>
        )}

        {newRule.type === 'GENERATION_LIMIT' && (
          <NumberInput
            label="世代制限"
            placeholder="例: 3"
            value={newRule.generationLimit ?? 3}
            onChange={(value) => onRuleChange({ ...newRule, generationLimit: typeof value === 'number' ? value : 3 })}
            min={1}
            max={10}
          />
        )}

        <TextInput
          label="説明（任意）"
          placeholder="このルールの詳細説明"
          value={newRule.description}
          onChange={(e) => onRuleChange({ ...newRule, description: e.target.value })}
        />

        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            キャンセル
          </Button>
          <Button
            onClick={onSubmit}
            loading={isLoading}
          >
            作成
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}


