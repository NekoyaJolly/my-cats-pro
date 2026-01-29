'use client';

import { Modal, type ModalProps, Stack } from '@mantine/core';
import { type ReactNode } from 'react';

/**
 * 統一されたモーダルコンポーネント
 * 
 * 全ページで一貫した視認性の高いモーダルデザインを提供します。
 * - 白い不透明背景
 * - 明確な枠線
 * - 適切なパディングと間隔
 * - 半透明のオーバーレイ
 */
export interface UnifiedModalProps extends Omit<ModalProps, 'children'> {
  /** モーダルのコンテンツ */
  children: ReactNode;
  /** モーダル内のコンテンツにパディングを追加するか（デフォルト: true） */
  addContentPadding?: boolean;
}

export function UnifiedModal({
  children,
  addContentPadding = true,
  ...modalProps
}: UnifiedModalProps) {
  return (
    <Modal
      {...modalProps}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
        ...modalProps.overlayProps,
      }}
      styles={{
        content: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          color: '#212529',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
        header: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e9ecef',
          color: '#212529',
        },
        body: {
          backgroundColor: '#ffffff',
          color: '#212529',
          padding: addContentPadding ? '16px' : '0',
        },
        title: {
          color: '#212529',
          fontWeight: 600,
        },
        ...modalProps.styles,
      }}
    >
      {addContentPadding ? (
        <Stack gap="md">{children}</Stack>
      ) : (
        children
      )}
    </Modal>
  );
}
