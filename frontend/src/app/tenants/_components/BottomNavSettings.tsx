'use client';

import { Card, Stack, Title, Text, Switch, Group, Divider } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useBottomNavSettings } from '@/lib/hooks/use-bottom-nav-settings';
import { bottomNavigationItems } from '@/components/AppLayout';
import { ActionButton } from '@/components/ActionButton';

/**
 * ボトムナビゲーション設定コンポーネント
 * 
 * 表示したい項目を選択してカスタマイズできます。
 * 設定はローカルストレージに保存されます。
 */
export function BottomNavSettings() {
  const {
    items,
    isLoading,
    hasChanges,
    toggleItem,
    showAll,
    hideAll,
    resetToDefault,
    saveSettings,
  } = useBottomNavSettings(bottomNavigationItems);

  const handleSave = () => {
    const success = saveSettings();
    if (success) {
      notifications.show({
        title: '保存しました',
        message: 'ボトムナビゲーションの設定を保存しました',
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
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text>読み込み中...</Text>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Title order={3}>ボトムナビゲーション設定</Title>
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
          <ActionButton action="view" onClick={showAll} isSectionAction>
            全て表示
          </ActionButton>
          <ActionButton action="cancel" onClick={hideAll} isSectionAction>
            全て非表示
          </ActionButton>
          <ActionButton action="delete" onClick={resetToDefault} isSectionAction>
            デフォルトに戻す
          </ActionButton>
        </Group>

        <Divider />

        <Group justify="flex-end">
          <ActionButton 
            action="save"
            onClick={handleSave} 
            disabled={!hasChanges}
            isSectionAction
          >
            {hasChanges ? '設定を保存' : '変更なし'}
          </ActionButton>
        </Group>
      </Stack>
    </Card>
  );
}

