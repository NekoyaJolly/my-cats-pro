'use client';

import { Group, Paper, Text, Stack, UnstyledButton, rem } from '@mantine/core';
import { IconCircleCheckFilled, IconLayout, IconGlass, IconCloud } from '@tabler/icons-react';
import { useTheme, ThemeType } from '@/lib/store/theme-store';

const themes: { id: ThemeType; label: string; description: string; icon: React.ComponentType<{ size?: number | string }>; color: string }[] = [
  {
    id: 'monolith',
    label: 'Architectural Monolith',
    description: '幾何学的秩序と静寂。プロフェッショナルなグリッドデザイン。',
    icon: IconLayout,
    color: '#1e293b',
  },
  {
    id: 'ethereal',
    label: 'Ethereal Layering',
    description: '光と深度。ガラス越しに覗く、未来的な情報空間。',
    icon: IconGlass,
    color: '#3b82f6',
  },
  {
    id: 'organic',
    label: 'Organic Squircle',
    description: '生命の鼓動。しなやかさを体現する流線型の世界。',
    icon: IconCloud,
    color: '#d97706',
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Stack gap="md">
      <Text fw={700} size="lg">デザイン世界の選択</Text>
      <Text size="sm" c="dimmed">アプリケーション全体の雰囲気と構造を切り替えます。</Text>
      
      <Stack gap="sm">
        {themes.map((t) => (
          <UnstyledButton
            key={t.id}
            onClick={() => setTheme(t.id)}
            style={{
              width: '100%',
              transition: 'all 0.2s ease',
            }}
          >
            <Paper
              withBorder
              p="md"
              radius="lg"
              style={{
                borderColor: theme === t.id ? t.color : undefined,
                borderWidth: theme === t.id ? 2 : 1,
                backgroundColor: theme === t.id ? 'var(--accent-soft)' : undefined,
                position: 'relative',
              }}
            >
              {theme === t.id && (
                <IconCircleCheckFilled
                  style={{
                    position: 'absolute',
                    top: rem(12),
                    right: rem(12),
                    color: t.color,
                  }}
                  size={24}
                />
              )}
              
              <Group wrap="nowrap" align="flex-start" gap="md">
                <div
                  style={{
                    backgroundColor: t.color,
                    color: '#fff',
                    borderRadius: 12,
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <t.icon size={28} />
                </div>
                
                <Stack gap={2}>
                  <Text fw={700} size="md">{t.label}</Text>
                  <Text size="xs" c="dimmed">{t.description}</Text>
                </Stack>
              </Group>
            </Paper>
          </UnstyledButton>
        ))}
      </Stack>
    </Stack>
  );
}

