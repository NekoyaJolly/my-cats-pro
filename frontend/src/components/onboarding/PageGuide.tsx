'use client';

import { Drawer, Stack, Group, ThemeIcon, Text, Button, Divider, ScrollArea } from '@mantine/core';
import type { PageGuide as PageGuideConfig } from '@/lib/onboarding/page-guides';

interface PageGuideProps {
  guide: PageGuideConfig;
  opened: boolean;
  onClose: () => void;
}

/**
 * 「このページでできること」を一覧表示するヘルプドロワー。
 * 初回訪問時の自動表示・ヘッダーの「?」からの手動表示の双方で利用する。
 */
export function PageGuide({ guide, opened, onClose }: PageGuideProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={guide.title}
      scrollAreaComponent={ScrollArea.Autosize}
      data-testid="page-onboarding-drawer"
    >
      <Stack gap="lg">
        {guide.intro && (
          <Text size="sm" c="dimmed">
            {guide.intro}
          </Text>
        )}

        <Stack gap="md">
          {guide.features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Group key={feature.title} gap="sm" wrap="nowrap" align="flex-start">
                <ThemeIcon variant="light" size={38} radius="md">
                  <Icon size={20} stroke={1.5} />
                </ThemeIcon>
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={700}>
                    {feature.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </Stack>
              </Group>
            );
          })}
        </Stack>

        <Divider />

        <Button onClick={onClose} fullWidth data-testid="page-onboarding-close">
          了解しました
        </Button>
      </Stack>
    </Drawer>
  );
}
