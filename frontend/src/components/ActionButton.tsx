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

// サイズプリセット型の定義
export type ActionButtonSizePreset = 'icon' | 'small' | 'medium' | 'large';

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

// サイズプリセットの定義
const ACTION_BUTTON_SIZE_PRESETS: Record<
  ActionButtonSizePreset,
  { size: ButtonProps['size']; iconSize: number }
> = {
  icon: { size: 'xs', iconSize: 16 },
  small: { size: 'sm', iconSize: 16 },
  medium: { size: 'md', iconSize: 18 },
  large: { size: 'lg', iconSize: 20 },
};

// サイズプリセット別の最小幅（px）
const ACTION_BUTTON_WIDTH_PRESETS: Record<ActionButtonSizePreset, number> = {
  icon: 40,
  small: 96,
  medium: 112,
  large: 136,
};

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
    defaultSize: ActionButtonSizePreset;
  }
> = {
  create: {
    variant: 'light',
    color: 'var(--accent)',
    icon: IconPlus,
    defaultSize: 'small',
  },
  edit: {
    variant: 'light',
    color: 'orange',
    icon: IconEdit,
    defaultSize: 'small',
  },
  delete: {
    variant: 'light',
    color: 'red',
    icon: IconTrash,
    defaultSize: 'small',
  },
  view: {
    variant: 'light',
    color: 'gray',
    icon: IconEye,
    defaultSize: 'small',
  },
  save: {
    variant: 'light',
    color: 'var(--accent)',
    icon: IconDeviceFloppy,
    defaultSize: 'small',
  },
  cancel: {
    variant: 'light',
    color: 'gray',
    icon: IconX,
    defaultSize: 'small',
  },
  confirm: {
    variant: 'light',
    color: 'var(--accent)',
    icon: IconCheck,
    defaultSize: 'small',
  },
  back: {
    variant: 'light',
    color: 'gray',
    icon: IconArrowLeft,
    defaultSize: 'small',
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
  sizePreset?: ActionButtonSizePreset;
}): ButtonProps['styles'] | undefined => {
  const { borderColor, borderWidth, textColor, sizePreset } = params;

  if (!borderColor && borderWidth === undefined && !textColor && !sizePreset) return undefined;

  return (theme) => {
    const resolvedBorderColor = borderColor ? getThemeColor(borderColor, theme) : undefined;
    const resolvedTextColor = textColor ? getThemeColor(textColor, theme) : undefined;
    const minWidth = sizePreset ? ACTION_BUTTON_WIDTH_PRESETS[sizePreset] : undefined;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 575;

    const root: React.CSSProperties = {
      ...(resolvedBorderColor ? { borderColor: resolvedBorderColor, borderStyle: 'solid' } : {}),
      ...(borderWidth !== undefined ? { borderWidth, borderStyle: 'solid' } : {}),
      ...(minWidth && !isMobile ? { minWidth: `${minWidth}px` } : {}),
      ...(isMobile && sizePreset !== 'icon' ? { width: '100%' } : {}),
    };

    const label: React.CSSProperties = {
      ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
      ...(sizePreset === 'small' ? { fontSize: '17px' } : {}),
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
  /** サイズプリセット（icon/small/medium/large） */
  sizePreset?: ActionButtonSizePreset;
  /** アイコンのサイズ（デフォルト: プリセットに応じる） */
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
      sizePreset: inputSizePreset,
      iconSize: inputIconSize,
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
    const resolvedSizePreset = inputSizePreset ?? style.defaultSize;
    const presetConfig = ACTION_BUTTON_SIZE_PRESETS[resolvedSizePreset];
    const effectiveIconSize = inputIconSize ?? presetConfig.iconSize;

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
      sizePreset: resolvedSizePreset,
    });
    const mergedStyles = mergeButtonStyles(buttonStyles, overrideStyles);

    const effectiveDisabled = disabled === true || loading === true;
    const leftSection = hideIcon 
      ? undefined 
      : (typeof customIcon === 'object' && customIcon !== null && !('prototype' in customIcon)
          ? customIcon as React.ReactNode
          : <Icon size={effectiveIconSize} />);

    return (
      <Button
        ref={ref}
        variant={style.variant}
        color={style.color}
        size={isSectionAction ? 'md' : (props.size || presetConfig.size)}
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
  sizePreset?: ActionButtonSizePreset;
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
      sizePreset = 'icon',
      iconSize: inputIconSize,
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
    const presetConfig = ACTION_BUTTON_SIZE_PRESETS[sizePreset];
    const effectiveIconSize = inputIconSize ?? presetConfig.iconSize;

    // customIconの型に応じて適切に処理
    let iconContent: React.ReactNode;
    if (typeof customIcon === 'function') {
      // 関数の場合は実行
      if ('prototype' in customIcon) {
        // コンポーネント型
        const Icon = customIcon as React.ComponentType<{ size?: number | string }>;
        iconContent = <Icon size={effectiveIconSize} />;
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
      iconContent = <Icon size={effectiveIconSize} />;
    }

    const effectiveBorderColor = borderColor ?? style.borderColor;
    const effectiveBorderWidth = borderWidth ?? style.borderWidth;
    const overrideStyles = createActionButtonOverrideStyles({
      borderColor: effectiveBorderColor,
      borderWidth: effectiveBorderWidth,
      sizePreset,
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
