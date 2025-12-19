'use client';

import { Group, Text, Tooltip } from '@mantine/core';
import { IconWand } from '@tabler/icons-react';

import type { TagView } from '@/lib/api/hooks/use-tags';
import { extractAutomationMeta } from '../utils';

type AutomationIndicatorProps = {
  tag: TagView;
};

/**
 * タグの自動化状態を表示するインジケーター
 */
export function AutomationIndicator({ tag }: AutomationIndicatorProps) {
  const meta = extractAutomationMeta(tag);
  if (!meta && !tag.allowsAutomation) {
    return null;
  }

  const tooltipParts = [meta?.ruleName, meta?.reason, meta?.source, meta?.assignedAt].filter(Boolean);
  if (!meta && tag.allowsAutomation && !tag.allowsManual) {
    tooltipParts.push('自動付与専用タグ');
  }
  if (!meta && tag.allowsAutomation && tooltipParts.length === 0) {
    tooltipParts.push('自動付与ルールで使用可能');
  }

  const content = (
    <Group gap={4} align="center" wrap="nowrap" style={{ fontSize: 11 }}>
      <IconWand size={12} />
      <Text span>{meta ? '自動' : '自動可'}</Text>
    </Group>
  );

  return (
    <Tooltip label={tooltipParts.join(' / ')} withArrow multiline withinPortal>
      {content}
    </Tooltip>
  );
}

