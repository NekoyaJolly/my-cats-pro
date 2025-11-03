/**
 * CRUD操作用の統一アクションボタンコンポーネント
 * プロジェクト全体でボタンデザインを統一するための共通コンポーネント
 */

import { Button, ButtonProps } from '@mantine/core';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDeviceFloppy,
  IconX,
  IconCheck,
  IconArrowLeft,
} from '@tabler/icons-react';
import { forwardRef } from 'react';

// アクションタイプの定義
export type ActionType =
  | 'create'
  | 'edit'
  | 'delete'
  | 'view'
  | 'save'
  | 'cancel'
  | 'confirm'
  | 'back';

// アクションタイプごとのスタイル設定
const ACTION_STYLES: Record<
  ActionType,
  {
    variant: ButtonProps['variant'];
    color: string;
    icon: React.ComponentType<{ size?: number | string }>;
  }
> = {
  create: {
    variant: 'outline',
    color: 'blue',
    icon: IconPlus,
  },
  edit: {
    variant: 'outline',
    color: 'yellow',
    icon: IconEdit,
  },
  delete: {
    variant: 'outline',
    color: 'red',
    icon: IconTrash,
  },
  view: {
    variant: 'outline',
    color: 'gray',
    icon: IconEye,
  },
  save: {
    variant: 'filled',
    color: 'blue',
    icon: IconDeviceFloppy,
  },
  cancel: {
    variant: 'subtle',
    color: 'gray',
    icon: IconX,
  },
  confirm: {
    variant: 'filled',
    color: 'blue',
    icon: IconCheck,
  },
  back: {
    variant: 'light',
    color: 'gray',
    icon: IconArrowLeft,
  },
};

export interface ActionButtonProps extends Omit<ButtonProps, 'variant' | 'color' | 'leftSection'> {
  /** アクションタイプ（自動的にスタイルとアイコンが適用される） */
  action: ActionType;
  /** アイコンのサイズ（デフォルト: 16） */
  iconSize?: number;
  /** アイコンを表示しない場合はtrue */
  hideIcon?: boolean;
  /** カスタムアイコンを使用する場合 */
  customIcon?: React.ComponentType<{ size?: number | string }>;
  /** ボタンクリック時のハンドラ */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** ローディング状態 */
  loading?: boolean;
}

/**
 * CRUD操作用の統一アクションボタン
 * 
 * @example
 * ```tsx
 * // 作成ボタン
 * <ActionButton action="create" onClick={handleCreate}>
 *   新規登録
 * </ActionButton>
 * 
 * // 編集ボタン
 * <ActionButton action="edit" onClick={handleEdit}>
 *   編集
 * </ActionButton>
 * 
 * // 削除ボタン（確認あり）
 * <ActionButton action="delete" onClick={handleDelete}>
 *   削除
 * </ActionButton>
 * ```
 */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ action, iconSize = 16, hideIcon = false, customIcon, children, ...props }, ref) => {
    const style = ACTION_STYLES[action];
    const Icon = customIcon || style.icon;

    return (
      <Button
        ref={ref}
        variant={style.variant}
        color={style.color}
        leftSection={!hideIcon && <Icon size={iconSize} />}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

/**
 * アクションアイコンボタン（小さいボタン用）
 * テーブルの行アクションなどに使用
 */
export interface ActionIconButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  action: ActionType;
  iconSize?: number;
  customIcon?: React.ComponentType<{ size?: number | string }>;
}

export const ActionIconButton = forwardRef<HTMLButtonElement, ActionIconButtonProps>(
  ({ action, iconSize = 16, customIcon, ...props }, ref) => {
    const style = ACTION_STYLES[action];
    const Icon = customIcon || style.icon;

    return (
      <Button
        ref={ref}
        variant="light"
        color={style.color}
        size="xs"
        p={4}
        {...props}
      >
        <Icon size={iconSize} />
      </Button>
    );
  }
);

ActionIconButton.displayName = 'ActionIconButton';
