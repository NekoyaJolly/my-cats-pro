'use client';

import { type ReactNode } from 'react';
import { Badge } from '@mantine/core';
import styles from './HexIconButton.module.css';

/**
 * 六角形アイコンボタンのプロパティ
 */
export interface HexIconButtonProps {
  /** 外接円基準のサイズ（px） */
  size: number;
  /** 選択状態 */
  selected?: boolean;
  /** ホバー状態 */
  hovered?: boolean;
  /** 背景色（選択時）*/
  color?: string;
  /** バッジ表示内容 */
  badge?: string | number;
  /** 中央に表示するアイコン */
  children: ReactNode;
  /** クリックハンドラー */
  onClick?: () => void;
}

/**
 * 六角形のアイコンボタンコンポーネント
 * CSS clip-path を使用して六角形を描画
 */
export function HexIconButton({
  size,
  selected = false,
  hovered = false,
  color = '#2563EB',
  badge,
  children,
  onClick,
}: HexIconButtonProps) {
  // 選択状態に応じた背景色
  const backgroundColor = selected
    ? color
    : hovered
      ? 'rgba(37, 99, 235, 0.10)'
      : '#FFFFFF';

  // 選択状態に応じたアイコン色
  const iconColor = selected ? '#FFFFFF' : color;

  // 選択状態に応じた影
  const boxShadow = selected
    ? `0 4px 12px ${color}66`
    : '0 2px 8px rgba(0, 0, 0, 0.08)';

  return (
    <div
      className={styles.hexContainer}
      style={{
        width: size,
        height: size,
      }}
    >
      <button
        type="button"
        className={`${styles.hexButton} ${selected ? styles.selected : ''} ${hovered ? styles.hovered : ''}`}
        style={{
          width: size,
          height: size,
          backgroundColor,
          boxShadow,
          color: iconColor,
        }}
        onClick={onClick}
        aria-label="Navigation icon"
      >
        {children}
      </button>

      {badge !== undefined && badge !== 0 && badge !== '' && (
        <Badge
          variant="filled"
          color="red"
          size="sm"
          circle
          className={styles.badge}
        >
          {badge}
        </Badge>
      )}
    </div>
  );
}
