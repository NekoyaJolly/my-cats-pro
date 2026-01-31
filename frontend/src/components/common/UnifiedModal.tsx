'use client';

import { Modal, type ModalProps, Stack, Divider } from '@mantine/core';
import { type ReactNode } from 'react';

/**
 * モーダルセクション定義
 */
export interface ModalSection {
  /** セクションのラベル（Dividerに表示） */
  label?: string;
  /** セクションのコンテンツ */
  content: ReactNode;
  /** セクションの一意なキー（動的に追加・削除・並び替えを行う場合に推奨） */
  key?: string;
}

/**
 * 統一されたモーダルコンポーネント
 * 
 * 全ページで一貫した視認性の高いモーダルデザインを提供します。
 * - 白い不透明背景
 * - 明確な枠線
 * - 適切なパディングと間隔
 * - 半透明のオーバーレイ
 * 
 * セクション機能:
 * - `sections`プロパティでセクション分割されたコンテンツを表示
 * - 各セクション間にラベル付きDividerを自動挿入
 * - `children`と`sections`は相互排他的（どちらか一方のみ使用可能）
 */
export type UnifiedModalProps = Omit<ModalProps, 'children'> & {
  /** モーダル内のコンテンツにパディングを追加するか（デフォルト: true） */
  addContentPadding?: boolean;
} & (
  | {
      /** モーダルのコンテンツ */
      children: ReactNode;
      /** セクション分割されたコンテンツ（childrenと相互排他） */
      sections?: never;
    }
  | {
      /** モーダルのコンテンツ */
      children?: never;
      /** セクション分割されたコンテンツ（childrenと相互排他） */
      sections: ModalSection[];
    }
);

export function UnifiedModal({
  children,
  sections,
  addContentPadding = true,
  ...modalProps
}: UnifiedModalProps) {
  // sectionsが提供された場合は、セクション間にDividerを挿入してレンダリング
  const renderContent = () => {
    if (sections) {
      const sectionNodes = sections.map((section, index) => (
        <div key={section.key ?? index}>
          {index > 0 && (
            <Divider
              label={section.label}
              labelPosition="center"
              mb="md"
            />
          )}
          {index === 0 && section.label && (
            <Divider
              label={section.label}
              labelPosition="center"
              mb="md"
            />
          )}
          <Stack gap="md">
            {section.content}
          </Stack>
        </div>
      ));

      if (addContentPadding) {
        return <Stack gap="md">{sectionNodes}</Stack>;
      }

      return <>{sectionNodes}</>;
    }

    // childrenの場合は従来の動作を維持
    if (addContentPadding) {
      return <Stack gap="md">{children}</Stack>;
    }
    return children;
  };

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
      {renderContent()}
    </Modal>
  );
}
