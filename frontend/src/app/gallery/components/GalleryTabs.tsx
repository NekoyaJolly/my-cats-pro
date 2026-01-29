'use client';

/**
 * ギャラリータブコンポーネント
 * カテゴリ切り替えとURLクエリ同期
 */

import { Tabs, Group, Badge } from '@mantine/core';
import {
  IconBabyCarriage,
  IconGenderMale,
  IconGenderFemale,
  IconTrophy,
} from '@tabler/icons-react';
import { useGalleryTab, TAB_LABELS } from '../hooks/useGalleryTab';
import type { GalleryCategory } from '@/lib/api/hooks/use-gallery';

/**
 * タブアイコンマッピング
 */
const TAB_ICONS: Record<GalleryCategory, React.ReactNode> = {
  KITTEN: <IconBabyCarriage size={16} />,
  FATHER: <IconGenderMale size={16} />,
  MOTHER: <IconGenderFemale size={16} />,
  GRADUATION: <IconTrophy size={16} />,
};

/**
 * タブカラーマッピング
 */
const TAB_COLORS: Record<GalleryCategory, string> = {
  KITTEN: 'pink',
  FATHER: 'blue',
  MOTHER: 'violet',
  GRADUATION: 'yellow',
};

interface GalleryTabsProps {
  /** 各カテゴリの件数 */
  counts?: Record<GalleryCategory, number>;
  /** ローディング中フラグ */
  loading?: boolean;
}

/**
 * ギャラリータブコンポーネント
 *
 * @example
 * ```tsx
 * <GalleryTabs counts={{ KITTEN: 5, FATHER: 3, MOTHER: 4, GRADUATION: 10 }} />
 * ```
 */
export function GalleryTabs({ counts, loading }: GalleryTabsProps) {
  const { currentTab, setTab, validTabs } = useGalleryTab();

  return (
    <Tabs
      value={currentTab}
      onChange={(value) => {
        if (value) {
          setTab(value as GalleryCategory);
        }
      }}
      variant="outline"
      radius="0"
    >
      <Tabs.List grow>
        {validTabs.map((tab) => (
          <Tabs.Tab
            key={tab}
            value={tab}
            leftSection={TAB_ICONS[tab]}
            disabled={loading}
          >
            <Group gap="xs">
              <span>{TAB_LABELS[tab]}</span>
              {counts && counts[tab] !== undefined && (
                <Badge size="xs" variant="light" color={TAB_COLORS[tab]}>
                  {counts[tab]}
                </Badge>
              )}
            </Group>
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
