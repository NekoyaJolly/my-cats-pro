'use client';
// 理由: App Router の error boundary はクライアントコンポーネントである必要がある

import { Alert, Button, Center, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { useEffect } from 'react';

/**
 * ルート共通のエラーバウンダリ
 *
 * セグメント内で捕捉されなかったレンダリングエラーを受け止め、
 * 日本語の案内と再試行ボタンを表示する。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 調査用にコンソールへ出力（本番では Sentry 等が拾う）
    console.error('画面の描画でエラーが発生しました:', error);
  }, [error]);

  return (
    <Center mih="60vh" p="md">
      <Stack gap="md" maw={480} w="100%">
        <Alert
          icon={<IconAlertTriangle size={20} />}
          title="エラーが発生しました"
          color="red"
          variant="light"
        >
          <Text size="sm">
            画面の表示中に問題が発生しました。再試行しても解決しない場合は、
            ページを再読み込みするか、時間をおいてからお試しください。
          </Text>
          {error.digest && (
            <Text size="xs" c="dimmed" mt="xs">
              エラーID: {error.digest}
            </Text>
          )}
        </Alert>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={reset}
          variant="light"
          data-testid="error-retry-button"
        >
          再試行
        </Button>
      </Stack>
    </Center>
  );
}
