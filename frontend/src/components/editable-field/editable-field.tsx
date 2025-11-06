'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';

interface EditableFieldProps {
  value: string | number | null | undefined;
  label?: string;
  onEdit: () => void;
  editable?: boolean;
  displayFormat?: (value: string | number | null | undefined) => string;
  style?: React.CSSProperties;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function EditableField({
  value,
  label,
  onEdit,
  editable = true,
  displayFormat,
  style,
  size = 'sm',
}: EditableFieldProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const lastTapRef = useRef<number>(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayValue = displayFormat ? displayFormat(value) : (value?.toString() || '-');

  // ダブルクリックハンドラー
  const handleDoubleClick = () => {
    if (editable) {
      onEdit();
    }
  };

  // モバイル向けダブルタップハンドラー
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!editable) return;

    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // ダブルタップ検知
      e.preventDefault();
      onEdit();
      lastTapRef.current = 0;
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    } else {
      lastTapRef.current = now;
      // 300ms後にリセット
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
      tapTimeoutRef.current = setTimeout(() => {
        lastTapRef.current = 0;
      }, 300);
    }
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  // ホバー時に少し遅延してアイコン表示
  useEffect(() => {
    if (isHovered) {
      const timer = setTimeout(() => setShowEditIcon(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowEditIcon(false);
    }
  }, [isHovered]);

  return (
    <Box
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => editable && setIsHovered(true)}
      onMouseLeave={() => editable && setIsHovered(false)}
      style={{
        cursor: editable ? 'pointer' : 'default',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        backgroundColor: isHovered ? 'var(--mantine-color-gray-0)' : 'transparent',
        border: `1px solid ${isHovered ? 'var(--mantine-color-gray-3)' : 'transparent'}`,
        position: 'relative',
        display: 'inline-block',
        minWidth: '50px',
        ...style,
      }}
      title={editable ? 'ダブルクリックで編集' : undefined}
    >
      {label && (
        <Text size="xs" c="dimmed" mb={2}>
          {label}
        </Text>
      )}
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Text size={size} style={{ flex: 1 }}>
          {displayValue}
        </Text>
        {showEditIcon && (
          <IconEdit
            size={14}
            style={{
              color: 'var(--mantine-color-gray-6)',
              opacity: 0.6,
              transition: 'opacity 0.2s ease',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
