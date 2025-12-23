'use client';

/**
 * PrimaryButton - セクションのメインアクション用ボタン
 * 
 * 設計思想:
 * - 1セクション = 1ボタン（複数アクションは Button with Menu で統合）
 * - グローバルテーマ（monolith/ethereal/organic）に自動対応
 * - サイズ・色・角丸はテーマから継承
 */

import { forwardRef } from 'react';
import { Button, Menu, type ButtonProps } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

export interface MenuAction {
  /** メニュー項目のラベル */
  label: string;
  /** アイコン（任意） */
  icon?: React.ReactNode;
  /** クリック時のハンドラ */
  onClick: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** 危険なアクション（削除など）の場合は true */
  danger?: boolean;
}

export interface PrimaryButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  /** ボタンのラベル */
  children: React.ReactNode;
  /** クリック時のハンドラ（単一アクションの場合） */
  onClick?: () => void;
  /** 複数アクションの場合のメニュー項目 */
  menuActions?: MenuAction[];
  /** ローディング状態 */
  loading?: boolean;
  /** 無効化 */
  disabled?: boolean;
  /** 左側のアイコン */
  leftSection?: React.ReactNode;
}

/**
 * セクションのメインアクション用ボタン
 * 
 * @example
 * // 単一アクション
 * <PrimaryButton onClick={handleSave}>
 *   保存
 * </PrimaryButton>
 * 
 * @example
 * // 複数アクション（Button with Menu）
 * <PrimaryButton
 *   menuActions={[
 *     { label: '新規登録', icon: <IconPlus size={16} />, onClick: handleCreate },
 *     { label: 'インポート', icon: <IconUpload size={16} />, onClick: handleImport },
 *   ]}
 * >
 *   アクション
 * </PrimaryButton>
 */
export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      children,
      onClick,
      menuActions,
      loading = false,
      disabled = false,
      leftSection,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // 複数アクションの場合は Button with Menu
    if (menuActions && menuActions.length > 0) {
      return (
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Button
              ref={ref}
              loading={loading}
              disabled={isDisabled}
              leftSection={leftSection}
              rightSection={<IconChevronDown size={16} />}
              styles={{
                root: {
                  backgroundColor: 'var(--accent)',
                  color: 'var(--button-primary-text, #ffffff)',
                  borderRadius: 'var(--radius-base)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'var(--accent)',
                    opacity: 0.9,
                    transform: 'translateY(-1px)',
                  },
                },
              }}
              {...props}
            >
              {children}
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {menuActions.map((action, index) => (
              <Menu.Item
                key={index}
                leftSection={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                color={action.danger ? 'red' : undefined}
              >
                {action.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      );
    }

    // 単一アクションの場合
    return (
      <Button
        ref={ref}
        onClick={onClick}
        loading={loading}
        disabled={isDisabled}
        leftSection={leftSection}
        styles={{
          root: {
            backgroundColor: 'var(--accent)',
            color: 'var(--button-primary-text, #ffffff)',
            borderRadius: 'var(--radius-base)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'var(--accent)',
              opacity: 0.9,
              transform: 'translateY(-1px)',
            },
          },
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

PrimaryButton.displayName = 'PrimaryButton';

