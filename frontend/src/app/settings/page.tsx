'use client';

import { useEffect } from 'react';
import { Container, Card, Stack, Title, Text, Switch, Group, Button, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { useFooterNavSettings } from '@/lib/hooks/use-footer-nav-settings';
import { bottomNavigationItems } from '@/components/AppLayout';

export default function SettingsPage() {
  const { setPageHeader } = usePageHeader();
  const {
    items,
    isLoading,
    hasChanges,
    toggleItem,
    showAll,
    hideAll,
    resetToDefault,
    saveSettings,
  } = useFooterNavSettings(bottomNavigationItems);

  useEffect(() => {
    setPageHeader('ユーザー設定');
    return () => {
      setPageHeader(null);
    };
  }, [setPageHeader]);

  const handleSave = () => {
    const success = saveSettings();
    if (success) {
      notifications.show({
        title: '保存しました',
        message: 'フッターナビゲーションの設定を保存しました',
        color: 'green',
      });
    } else {
      notifications.show({
        title: '保存に失敗しました',
        message: '設定の保存中にエラーが発生しました',
        color: 'red',
      });
    }
  };

  if (isLoading) {
    return (
      <Container size="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  return (
    <Container size="md" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <Stack gap="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>フッターナビゲーション設定</Title>
            <Text size="sm" c="dimmed">
              表示したい項目を選択してください。設定はこのデバイスに保存されます。
            </Text>

            <Divider />

            <Stack gap="xs">
              {items.map((item) => (
                <Group key={item.id} justify="space-between">
                  <Text size="sm">{item.label}</Text>
                  <Switch
                    checked={item.visible}
                    onChange={() => toggleItem(item.id)}
                    size="sm"
                  />
                </Group>
              ))}
            </Stack>

            <Divider />

            <Group gap="sm">
              <Button variant="light" size="xs" onClick={showAll}>
                全て表示
              </Button>
              <Button variant="light" size="xs" onClick={hideAll}>
                全て非表示
              </Button>
              <Button variant="light" size="xs" onClick={resetToDefault} color="red">
                デフォルトに戻す
              </Button>
            </Group>

            <Divider />

            <Group justify="flex-end">
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges}
                variant={hasChanges ? 'filled' : 'light'}
              >
                {hasChanges ? '設定を保存' : '変更なし'}
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* 将来的に他の設定項目を追加 */}
        {/* 
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>表示設定</Title>
            ...
          </Stack>
        </Card>
        */}
      </Stack>
    </Container>
  );
}
