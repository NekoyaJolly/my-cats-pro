import { Title, TitleProps } from '@mantine/core';
import { ReactNode } from 'react';

/**
 * セクション用タイトル（ページ内階層）
 * - フォントサイズ 16px
 * - 太さ 600
 * - 統一されたセクション間隔（CSS変数 --section-gap-lg）
 */
export interface SectionTitleProps extends Omit<TitleProps, 'order'> {
  children: ReactNode;
  withTopMargin?: boolean;
  withBottomMargin?: boolean;
}

export function SectionTitle({
  children,
  withTopMargin = true,
  withBottomMargin = true,
  style,
  ...rest
}: SectionTitleProps) {
  return (
    <Title
      order={3}
      {...rest}
      style={{
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.35,
        marginTop: withTopMargin ? 'var(--section-gap-lg)' : undefined,
        marginBottom: withBottomMargin ? 'var(--section-gap)' : undefined,
        ...style,
      }}
    >
      {children}
    </Title>
  );
}
