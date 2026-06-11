'use client';
// 理由: チェックボックス操作のためクライアントコンポーネント

import { Checkbox, Stack, Text } from '@mantine/core';

import {
  PERMISSION_DEFINITIONS,
  type Permission,
} from '@/lib/auth/permissions';

export interface PermissionCheckboxGroupProps {
  /** 現在チェックされている権限 */
  value: Permission[];
  onChange: (permissions: Permission[]) => void;
  /** 全体を無効化（SUPER_ADMIN 対象時など） */
  disabled?: boolean;
  /**
   * 付与可能な権限（権限の天井）。
   * 含まれない権限のチェックボックスは無効表示になる。
   * 未指定時は全権限を付与可能として扱う。
   */
  grantable?: Permission[];
}

const GROUP_ORDER = ['日常記録', 'マスタ・設定', '管理'] as const;

/**
 * 権限チェックボックス（機能ドメイン単位・3グループ表示）
 *
 * 招待モーダル・ユーザー権限編集モーダルで共用する。
 */
export function PermissionCheckboxGroup({
  value,
  onChange,
  disabled = false,
  grantable,
}: PermissionCheckboxGroupProps) {
  const toggle = (permission: Permission, checked: boolean) => {
    if (checked) {
      onChange([...value, permission]);
    } else {
      onChange(value.filter((item) => item !== permission));
    }
  };

  return (
    <Stack gap="sm">
      {GROUP_ORDER.map((group) => (
        <Stack key={group} gap={6}>
          <Text size="sm" fw={600} c="dimmed">
            {group}
          </Text>
          {PERMISSION_DEFINITIONS.filter((definition) => definition.group === group).map(
            (definition) => {
              const outOfCeiling =
                grantable !== undefined && !grantable.includes(definition.value);
              return (
                <Checkbox
                  key={definition.value}
                  label={definition.label}
                  checked={value.includes(definition.value)}
                  disabled={disabled || outOfCeiling}
                  description={outOfCeiling ? '自分が保持していない権限は付与できません' : undefined}
                  onChange={(event) => toggle(definition.value, event.currentTarget.checked)}
                  data-testid={`permission-checkbox-${definition.value.replace(':', '-')}`}
                />
              );
            },
          )}
        </Stack>
      ))}
    </Stack>
  );
}
