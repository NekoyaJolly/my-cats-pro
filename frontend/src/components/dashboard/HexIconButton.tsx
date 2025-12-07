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
 * 六角形のSVGパスを生成
 * clip-pathと同じ座標系を使用
 */
function getHexPath(size: number): string {
  // clip-pathの座標をSVG用に変換
  // clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)
  const points = [
    [0.25 * size, 0.067 * size],  // 左上
    [0.75 * size, 0.067 * size],  // 右上
    [1.0 * size, 0.5 * size],     // 右
    [0.75 * size, 0.933 * size],  // 右下
    [0.25 * size, 0.933 * size],  // 左下
    [0.0 * size, 0.5 * size],     // 左
  ];
  
  const pathData = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point[0]} ${point[1]}`)
    .join(' ');
  
  return `${pathData} Z`;
}

/**
 * 六角形のアイコンボタンコンポーネント
 * CSS clip-path を使用して六角形を描画し、SVGで枠線を表示
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
      ? `${color}15` // 色に透明度を付与
      : '#FFFFFF';

  // 選択状態に応じたアイコン色
  const iconColor = selected ? '#FFFFFF' : color;

  // 選択状態に応じた影（40%の透明度）
  const getBoxShadow = () => {
    if (!selected) {
      return '0 2px 8px rgba(0, 0, 0, 0.08)';
    }
    // colorをRGBAに変換して透明度を追加
    const rgb = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (rgb) {
      const r = parseInt(rgb[1], 16);
      const g = parseInt(rgb[2], 16);
      const b = parseInt(rgb[3], 16);
      return `0 4px 12px rgba(${r}, ${g}, ${b}, 0.4)`;
    }
    return `0 4px 12px ${color}`;
  };

  const boxShadow = getBoxShadow();

  // バッジの表示判定（0は表示、undefined/null/空文字は非表示）
  const shouldShowBadge = badge !== undefined && badge !== null && badge !== '';

  // 六角形の枠線クラス
  const hexBorderClass = `${styles.hexBorder} ${selected ? styles.selected : ''} ${hovered ? styles.hovered : ''}`;

  return (
    <div
      className={styles.hexContainer}
      style={{
        width: size,
        height: size,
        '--hex-color': color,
      } as React.CSSProperties}
    >
      {/* 六角形の外枠（SVG） */}
      <svg
        className={hexBorderClass}
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          className={styles.hexBorderPath}
          d={getHexPath(size)}
        />
      </svg>

      <button
        type="button"
        className={`${styles.hexButton} ${selected ? styles.selected : ''} ${hovered ? styles.hovered : ''}`}
        style={{
          width: size * 0.92, // 枠線の内側に収まるようにやや小さく
          height: size * 0.92,
          backgroundColor,
          boxShadow,
          color: iconColor,
        }}
        onClick={onClick}
        aria-label="アイコンボタン"
        aria-pressed={selected}
      >
        {children}
      </button>

      {shouldShowBadge && (
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
