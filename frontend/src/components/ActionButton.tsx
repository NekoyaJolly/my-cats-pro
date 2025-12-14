/**
 * CRUD操作用の統一アクションボタンコンポーネント
 * プロジェクト全体でボタンデザインを統一するための共通コンポーネント
 */

import { Button, ButtonProps, ButtonStylesNames, getThemeColor, MantineColor } from '@mantine/core';
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
    color: MantineColor;
    textColor?: MantineColor;
    borderColor?: MantineColor;
    borderWidth?: number;
    outline?: string;
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
    variant: 'outline',
    color: 'blue',
    icon: IconDeviceFloppy,
  },
  cancel: {
    variant: 'subtle',
    color: 'gray',
    icon: IconX,
  },
  confirm: {
    variant: 'outline',
    color: 'blue',
    icon: IconCheck,
  },
  back: {
    variant: 'light',
    color: 'gray',
    icon: IconArrowLeft,
  },
};

type ButtonStylesRecord = Partial<Record<ButtonStylesNames, React.CSSProperties>>;

const mergeButtonStyles = (
  baseStyles: ButtonProps['styles'] | undefined,
  overrideStyles: ButtonProps['styles'] | undefined
): ButtonProps['styles'] | undefined => {
  if (!baseStyles) return overrideStyles;
  if (!overrideStyles) return baseStyles;

  return (theme, props, ctx) => {
    const baseRecord: ButtonStylesRecord =
      typeof baseStyles === 'function' ? baseStyles(theme, props, ctx) : baseStyles;
    const overrideRecord: ButtonStylesRecord =
      typeof overrideStyles === 'function' ? overrideStyles(theme, props, ctx) : overrideStyles;

    const styleNames: ButtonStylesNames[] = ['root', 'inner', 'loader', 'section', 'label'];
    const merged: ButtonStylesRecord = {};

    for (const styleName of styleNames) {
      const baseStyle = baseRecord[styleName];
      const overrideStyle = overrideRecord[styleName];
      merged[styleName] = { ...(baseStyle ?? {}), ...(overrideStyle ?? {}) };
    }

    return merged;
  };
};

const createActionButtonOverrideStyles = (params: {
  borderColor?: MantineColor;
  borderWidth?: number;
  textColor?: MantineColor;
}): ButtonProps['styles'] | undefined => {
  const { borderColor, borderWidth, textColor } = params;

  if (!borderColor && borderWidth === undefined && !textColor) return undefined;

  return (theme) => {
    const resolvedBorderColor = borderColor ? getThemeColor(borderColor, theme) : undefined;
    const resolvedTextColor = textColor ? getThemeColor(textColor, theme) : undefined;

    const root: React.CSSProperties = {
      ...(resolvedBorderColor ? { borderColor: resolvedBorderColor, borderStyle: 'solid' } : {}),
      ...(borderWidth !== undefined ? { borderWidth, borderStyle: 'solid' } : {}),
    };

    const label: React.CSSProperties = {
      ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
    };

    return {
      root,
      label,
    };
  };
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
  /** ボタンテキストの色（Mantineテーマカラー or CSSカラー） */
  textColor?: MantineColor;
  /** 枠線の色（Mantineテーマカラー or CSSカラー） */
  borderColor?: MantineColor;
  /** 枠線の太さ（px） */
  borderWidth?: number;
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
  (
    {
      action,
      iconSize = 16,
      hideIcon = false,
      customIcon,
      children,
      textColor,
      borderColor,
      borderWidth,
      loading,
      styles: buttonStyles,
      disabled,
      ...props
    },
    ref
  ) => {
    const style = ACTION_STYLES[action];
    const Icon = customIcon || style.icon;

    const effectiveTextColor = textColor ?? style.textColor;
    const effectiveBorderColor = borderColor ?? style.borderColor;
    const effectiveBorderWidth = borderWidth ?? style.borderWidth;
    const overrideStyles = createActionButtonOverrideStyles({
      borderColor: effectiveBorderColor,
      borderWidth: effectiveBorderWidth,
      textColor: effectiveTextColor,
    });
    const mergedStyles = mergeButtonStyles(buttonStyles, overrideStyles);

    const effectiveDisabled = disabled === true || loading === true;
    const leftSection = hideIcon ? undefined : <Icon size={iconSize} />;

    return (
      <Button
        ref={ref}
        variant={style.variant}
        color={style.color}
        leftSection={leftSection}
        styles={mergedStyles}
        loading={loading}
        disabled={effectiveDisabled}
        aria-busy={loading ? true : undefined}
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
  /** 枠線の色（Mantineテーマカラー or CSSカラー） */
  borderColor?: MantineColor;
  /** 枠線の太さ（px） */
  borderWidth?: number;
}

export const ActionIconButton = forwardRef<HTMLButtonElement, ActionIconButtonProps>(
  (
    {
      action,
      iconSize = 16,
      customIcon,
      borderColor,
      borderWidth,
      loading,
      styles: buttonStyles,
      disabled,
      ...props
    },
    ref
  ) => {
    const style = ACTION_STYLES[action];
    const Icon = customIcon || style.icon;

    const effectiveBorderColor = borderColor ?? style.borderColor;
    const effectiveBorderWidth = borderWidth ?? style.borderWidth;
    const overrideStyles = createActionButtonOverrideStyles({
      borderColor: effectiveBorderColor,
      borderWidth: effectiveBorderWidth,
    });
    const mergedStyles = mergeButtonStyles(buttonStyles, overrideStyles);

    const effectiveDisabled = disabled === true || loading === true;

    return (
      <Button
        ref={ref}
        variant="light"
        color={style.color}
        size="xs"
        p={4}
        styles={mergedStyles}
        loading={loading}
        disabled={effectiveDisabled}
        aria-busy={loading ? true : undefined}
        {...props}
      >
        <Icon size={iconSize} />
      </Button>
    );
  }
);

ActionIconButton.displayName = 'ActionIconButton';
