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
    icon: React.ComponentType<{ size?: number | string }>;
    defaultSize: ButtonProps['size'];
  }
> = {
  create: {
    variant: 'filled',
    color: 'var(--accent)',
    icon: IconPlus,
    defaultSize: 'md',
  },
  edit: {
    variant: 'light',
    color: 'orange',
    icon: IconEdit,
    defaultSize: 'sm',
  },
  delete: {
    variant: 'light',
    color: 'red',
    icon: IconTrash,
    defaultSize: 'sm',
  },
  view: {
    variant: 'subtle',
    color: 'gray',
    icon: IconEye,
    defaultSize: 'sm',
  },
  save: {
    variant: 'filled',
    color: 'var(--accent)',
    icon: IconDeviceFloppy,
    defaultSize: 'md',
  },
  cancel: {
    variant: 'subtle',
    color: 'gray',
    icon: IconX,
    defaultSize: 'sm',
  },
  confirm: {
    variant: 'filled',
    color: 'var(--accent)',
    icon: IconCheck,
    defaultSize: 'md',
  },
  back: {
    variant: 'subtle',
    color: 'gray',
    icon: IconArrowLeft,
    defaultSize: 'sm',
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
  /** アイコンのサイズ（デフォルト: 18） */
  iconSize?: number;
  /** アイコンを表示しない場合はtrue */
  hideIcon?: boolean;
  /** カスタムアイコンを使用する場合（コンポーネント型またはReactNode） */
  customIcon?: React.ComponentType<{ size?: number | string }> | React.ReactNode;
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
  /** セクション内の主要アクションとしてサイズを強制統一するか (md) */
  isSectionAction?: boolean;
  /** ツールチップ用のタイトル */
  title?: string;
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
      iconSize = 18, // Slightly larger icons for better visibility
      hideIcon = false,
      customIcon,
      children,
      textColor,
      borderColor,
      borderWidth,
      loading,
      styles: buttonStyles,
      disabled,
      isSectionAction,
      ...props
    },
    ref
  ) => {
    const style = ACTION_STYLES[action];
    // customIconがReactNodeの場合はそのまま使用、コンポーネント型の場合はインスタンス化
    const Icon = typeof customIcon === 'function' && 'prototype' in customIcon 
      ? (customIcon as React.ComponentType<{ size?: number | string }>)
      : style.icon;

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
    const leftSection = hideIcon 
      ? undefined 
      : (typeof customIcon === 'object' && customIcon !== null && !('prototype' in customIcon)
          ? customIcon as React.ReactNode
          : <Icon size={iconSize} />);

    return (
      <Button
        ref={ref}
        variant={style.variant}
        color={style.color}
        size={isSectionAction ? 'md' : (props.size || style.defaultSize)}
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
  /** カスタムアイコン（コンポーネント型、ReactNode、または関数） */
  customIcon?: React.ComponentType<{ size?: number | string }> | React.ReactNode | (() => React.ReactNode);
  /** 枠線の色（Mantineテーマカラー or CSSカラー） */
  borderColor?: MantineColor;
  /** 枠線の太さ（px） */
  borderWidth?: number;
  /** ボタンクリック時のハンドラ */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** ツールチップ用のタイトル */
  title?: string;
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
    // customIconの型に応じて適切に処理
    let iconContent: React.ReactNode;
    if (typeof customIcon === 'function') {
      // 関数の場合は実行
      if ('prototype' in customIcon) {
        // コンポーネント型
        const Icon = customIcon as React.ComponentType<{ size?: number | string }>;
        iconContent = <Icon size={iconSize} />;
      } else {
        // 関数として実行（型アサーションで明示的に型を指定）
        iconContent = (customIcon as () => React.ReactNode)();
      }
    } else if (customIcon && typeof customIcon === 'object' && !('prototype' in customIcon)) {
      // ReactNode
      iconContent = customIcon;
    } else {
      // デフォルトアイコン
      const Icon = style.icon;
      iconContent = <Icon size={iconSize} />;
    }

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
        {iconContent}
      </Button>
    );
  }
);

ActionIconButton.displayName = 'ActionIconButton';
