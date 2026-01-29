'use client';

/**
 * 汎用タブセクションコンポーネント
 * ギャラリーページのタブデザインをプロジェクト全体で統一
 */

import { Tabs, Group, Badge, type TabsProps } from '@mantine/core';
import React from 'react';

export interface TabDefinition {
  /** タブの値 */
  value: string;
  /** タブのラベル */
  label: string;
  /** タブの左に表示するアイコン（オプション） */
  icon?: React.ReactNode;
  /** バッジに表示するカウント（オプション） */
  count?: number;
  /** バッジの色（オプション、デフォルト: 'blue'） */
  badgeColor?: string;
  /** タブが無効かどうか */
  disabled?: boolean;
}

export interface TabsSectionProps extends Omit<TabsProps, 'value' | 'onChange'> {
  /** 現在アクティブなタブの値 */
  value: string | null;
  /** タブ値変更時のコールバック */
  onChange: (value: string) => void;
  /** タブ定義の配列 */
  tabs: TabDefinition[];
  /** デフォルトバッジカラー */
  defaultBadgeColor?: string;
}

/**
 * 汎用タブセクションコンポーネント
 * ギャラリーページと同じスタイルで、複数のページで使用可能
 *
 * @example
 * ```tsx
 * <TabsSection
 *   value={activeTab}
 *   onChange={setActiveTab}
 *   tabs={[
 *     { value: 'schedule', label: 'スケジュール', icon: <IconCalendar size={16} />, count: 5 },
 *     { value: 'pregnancy', label: '妊娠', icon: <IconHeart size={16} /> },
 *   ]}
 * />
 * ```
 */
export function TabsSection({
  value,
  onChange,
  tabs,
  defaultBadgeColor = 'blue',
  ...tabsProps
}: TabsSectionProps) {
  return (
    <Tabs
      value={value || tabs[0]?.value}
      onChange={(val) => {
        if (val) {
          onChange(val);
        }
      }}
      {...tabsProps}
    >
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={tab.icon}
            disabled={tab.disabled}
          >
            <Group gap="xs">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <Badge 
                  size="xs" 
                  variant="light" 
                  color={tab.badgeColor || defaultBadgeColor}
                >
                  {tab.count}
                </Badge>
              )}
            </Group>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {/* Tabs.Panel は呼び出し側で使用 */}
      {tabsProps.children}
    </Tabs>
  );
}
