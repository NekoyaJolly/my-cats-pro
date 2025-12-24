'use client';

/**
 * IconActionButton - レコード操作用アイコンボタン
 * 
 * 設計思想:
 * - リスト化された各レコードに設置するアイコンのみのボタン
 * - 削除、詳細、印刷など用途別にバリアントを提供
 * - グローバルテーマに自動対応
 */

import { forwardRef } from 'react';
import { ActionIcon, Tooltip, type ActionIconProps, type MantineColor } from '@mantine/core';
import {
  IconTrash,
  IconEye,
  IconEdit,
  IconPrinter,
  IconDownload,
  IconCopy,
  IconDotsVertical,
  IconCheck,
  IconX,
  IconPlus,
  IconMinus,
  IconRefresh,
  IconExternalLink,
  IconShare,
  IconHeart,
  IconStar,
} from '@tabler/icons-react';

/** アイコンボタンのバリアント */
export type IconActionVariant =
  | 'view'      // 詳細表示
  | 'edit'      // 編集
  | 'delete'    // 削除
  | 'print'     // 印刷
  | 'download'  // ダウンロード
  | 'copy'      // コピー
  | 'more'      // その他メニュー
  | 'confirm'   // 確認
  | 'cancel'    // キャンセル
  | 'add'       // 追加
  | 'remove'    // 削除（リストから）
  | 'refresh'   // 更新
  | 'external'  // 外部リンク
  | 'share'     // 共有
  | 'favorite'  // お気に入り
  | 'star';     // スター

/** バリアントごとの設定 */
const VARIANT_CONFIG: Record<
  IconActionVariant,
  {
    icon: React.ComponentType<{ size?: number | string; stroke?: number }>;
    color: MantineColor;
    label: string;
  }
> = {
  view: { icon: IconEye, color: 'gray', label: '詳細を見る' },
  edit: { icon: IconEdit, color: 'orange', label: '編集' },
  delete: { icon: IconTrash, color: 'red', label: '削除' },
  print: { icon: IconPrinter, color: 'gray', label: '印刷' },
  download: { icon: IconDownload, color: 'blue', label: 'ダウンロード' },
  copy: { icon: IconCopy, color: 'gray', label: 'コピー' },
  more: { icon: IconDotsVertical, color: 'gray', label: 'その他' },
  confirm: { icon: IconCheck, color: 'green', label: '確認' },
  cancel: { icon: IconX, color: 'gray', label: 'キャンセル' },
  add: { icon: IconPlus, color: 'blue', label: '追加' },
  remove: { icon: IconMinus, color: 'red', label: '削除' },
  refresh: { icon: IconRefresh, color: 'gray', label: '更新' },
  external: { icon: IconExternalLink, color: 'blue', label: '外部リンク' },
  share: { icon: IconShare, color: 'blue', label: '共有' },
  favorite: { icon: IconHeart, color: 'pink', label: 'お気に入り' },
  star: { icon: IconStar, color: 'yellow', label: 'スター' },
};

export interface IconActionButtonProps extends Omit<ActionIconProps, 'variant' | 'color' | 'children'> {
  /** ボタンのバリアント */
  variant: IconActionVariant;
  /** クリック時のハンドラ */
  onClick?: () => void;
  /** ツールチップのラベル（省略時はバリアントのデフォルトラベル） */
  label?: string;
  /** ツールチップを非表示にする */
  hideTooltip?: boolean;
  /** アイコンサイズ（デフォルト: 18） */
  iconSize?: number;
  /** カスタムアイコン（ReactNodeまたは関数コンポーネント） */
  customIcon?: React.ReactNode | (() => React.ReactNode);
  /** ローディング状態 */
  loading?: boolean;
  /** 無効化 */
  disabled?: boolean;
}

/**
 * レコード操作用アイコンボタン
 * 
 * @example
 * // 詳細ボタン
 * <IconActionButton variant="view" onClick={() => handleView(id)} />
 * 
 * @example
 * // 削除ボタン
 * <IconActionButton variant="delete" onClick={() => handleDelete(id)} />
 * 
 * @example
 * // カスタムラベル
 * <IconActionButton variant="edit" label="猫情報を編集" onClick={handleEdit} />
 */
export const IconActionButton = forwardRef<HTMLButtonElement, IconActionButtonProps>(
  (
    {
      variant,
      onClick,
      label,
      hideTooltip = false,
      iconSize = 18,
      customIcon,
      loading = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const config = VARIANT_CONFIG[variant];
    const Icon = config.icon;
    const tooltipLabel = label ?? config.label;
    const isDisabled = disabled || loading;

    const button = (
      <ActionIcon
        ref={ref}
        variant="subtle"
        color={config.color}
        onClick={onClick}
        loading={loading}
        disabled={isDisabled}
        aria-label={tooltipLabel}
        styles={{
          root: {
            transition: 'all 0.2s ease',
            color: `var(--button-icon-color, var(--text-secondary))`,
            '&:hover': {
              color: `var(--mantine-color-${config.color}-6, var(--accent))`,
              backgroundColor: `var(--mantine-color-${config.color}-0, var(--accent-soft))`,
            },
          },
        }}
        {...props}
      >
        {typeof customIcon === 'function' ? customIcon() : (customIcon ?? <Icon size={iconSize} stroke={1.5} />)}
      </ActionIcon>
    );

    if (hideTooltip) {
      return button;
    }

    return (
      <Tooltip label={tooltipLabel} withArrow position="top">
        {button}
      </Tooltip>
    );
  }
);

IconActionButton.displayName = 'IconActionButton';

