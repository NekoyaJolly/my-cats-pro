'use client';

import { ActionIcon, Tooltip, SegmentedControl, Group, Box } from '@mantine/core';
import { IconLayoutGrid, IconCircleDot, IconSettings } from '@tabler/icons-react';
import { type HomeDisplayMode } from '@/lib/storage/dashboard-settings';

interface DisplayModeToggleProps {
  /** 現在の表示モード */
  mode: HomeDisplayMode;
  /** モード変更時のコールバック */
  onModeChange: (mode: HomeDisplayMode) => void;
  /** 設定ボタンクリック時のコールバック */
  onSettingsClick: () => void;
  /** コンパクト表示（アイコンのみ） */
  compact?: boolean;
}

/**
 * ホーム画面の表示モード切り替えコンポーネント
 * カード式/ダイアル式の切り替えと設定ボタンを提供
 */
export function DisplayModeToggle({
  mode,
  onModeChange,
  onSettingsClick,
  compact = false,
}: DisplayModeToggleProps) {
  if (compact) {
    // コンパクト表示: アイコンボタンのみ
    return (
      <Group gap="xs">
        {/* 表示モード切り替えボタン */}
        <Tooltip 
          label={mode === 'card' ? 'ダイアル表示に切り替え' : 'カード表示に切り替え'} 
          position="left"
        >
          <ActionIcon
            variant="light"
            color={mode === 'card' ? 'blue' : 'violet'}
            size="lg"
            onClick={() => {
              const nextMode = mode === 'card' ? 'dial' : 'card';
              onModeChange(nextMode);
            }}
          >
            {mode === 'card' ? <IconCircleDot size={20} /> : <IconLayoutGrid size={20} />}
          </ActionIcon>
        </Tooltip>
        
        {/* 設定ボタン */}
        <Tooltip label="設定を開く" position="left">
          <ActionIcon
            variant="light"
            color="gray"
            size="lg"
            onClick={onSettingsClick}
          >
            <IconSettings size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  // 通常表示: セグメント付き
  return (
    <Group gap="md" wrap="nowrap">
      {/* 表示モード選択 */}
      <Box>
        <SegmentedControl
          value={mode}
          onChange={(value) => onModeChange(value as HomeDisplayMode)}
          data={[
            {
              value: 'auto',
              label: '自動',
            },
            {
              value: 'card',
              label: (
                <Group gap={6} wrap="nowrap">
                  <IconLayoutGrid size={16} />
                  <span>カード</span>
                </Group>
              ),
            },
            {
              value: 'dial',
              label: (
                <Group gap={6} wrap="nowrap">
                  <IconCircleDot size={16} />
                  <span>ダイアル</span>
                </Group>
              ),
            },
          ]}
          size="sm"
        />
      </Box>
      
      {/* 設定ボタン */}
      <Tooltip label="設定を開く" position="left">
        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          onClick={onSettingsClick}
        >
          <IconSettings size={20} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
