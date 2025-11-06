'use client';

import { Badge, MantineSize } from '@mantine/core';

type Gender = 'MALE' | 'FEMALE' | 'NEUTER' | 'SPAY' | 'オス' | 'メス';

interface GenderBadgeProps {
  gender: Gender;
  size?: MantineSize;
  variant?: 'filled' | 'light' | 'outline' | 'dot' | 'default';
}

/**
 * 性別バッジコンポーネント
 * アプリケーション全体で統一されたデザインの性別バッジを提供
 */
export function GenderBadge({ gender, size = 'sm', variant = 'light' }: GenderBadgeProps) {
  const getGenderConfig = (g: Gender) => {
    switch (g) {
      case 'MALE':
      case 'オス':
        return {
          color: 'blue',
          label: 'オス',
        };
      case 'FEMALE':
      case 'メス':
        return {
          color: 'pink',
          label: 'メス',
        };
      case 'NEUTER':
        return {
          color: 'gray',
          label: '去勢',
        };
      case 'SPAY':
        return {
          color: 'gray',
          label: '避妊',
        };
      default:
        return {
          color: 'gray',
          label: '不明',
        };
    }
  };

  const { color, label } = getGenderConfig(gender);

  return (
    <Badge size={size} color={color} variant={variant}>
      {label}
    </Badge>
  );
}

/**
 * 性別をテキストに変換するユーティリティ関数
 */
export function getGenderLabel(gender: Gender): string {
  switch (gender) {
    case 'MALE':
    case 'オス':
      return 'オス';
    case 'FEMALE':
    case 'メス':
      return 'メス';
    case 'NEUTER':
      return '去勢';
    case 'SPAY':
      return '避妊';
    default:
      return '不明';
  }
}

/**
 * 性別の色を取得するユーティリティ関数
 */
export function getGenderColor(gender: Gender): string {
  switch (gender) {
    case 'MALE':
    case 'オス':
      return 'blue';
    case 'FEMALE':
    case 'メス':
      return 'pink';
    case 'NEUTER':
    case 'SPAY':
      return 'gray';
    default:
      return 'gray';
  }
}
