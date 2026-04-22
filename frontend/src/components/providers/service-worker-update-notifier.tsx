'use client';

import { useEffect, useRef } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
const NOTIFICATION_ID = 'sw-update-available';

/**
 * Service Worker の新バージョンを検知してユーザーに「今すぐ更新」トーストを出す。
 * 既存タブが編集中でも強制リロードしないのがポイント（作業消失を避ける）。
 *
 * 動作:
 * 1. 新しい SW が `installed` 状態（= waiting）に入ったら通知を表示
 * 2. 「今すぐ更新」押下で `SKIP_WAITING` を SW に送信
 * 3. SW が skipWaiting → clientsClaim により controllerchange が発火
 * 4. このコンポーネントが controllerchange を検知してページをリロード
 * 5. タブ復帰時と 5 分ごとに registration.update() で新バージョンをポーリング
 */
export function ServiceWorkerUpdateNotifier(): null {
  const reloadTriggeredRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const showUpdateNotification = (waiting: ServiceWorker): void => {
      notifications.show({
        id: NOTIFICATION_ID,
        title: '新しいバージョンがあります',
        message: (
          <Stack gap="xs">
            <Text size="sm">最新の機能や修正が利用可能です。</Text>
            <Text size="xs" c="dimmed">
              作業中のデータを保存してから更新してください。
            </Text>
            <Group gap="xs" mt={4}>
              <Button
                size="xs"
                onClick={() => {
                  waiting.postMessage({ type: 'SKIP_WAITING' });
                }}
              >
                今すぐ更新
              </Button>
              <Button
                size="xs"
                variant="subtle"
                onClick={() => {
                  notifications.hide(NOTIFICATION_ID);
                }}
              >
                後で
              </Button>
            </Group>
          </Stack>
        ),
        color: 'blue',
        autoClose: false,
        withCloseButton: true,
        withBorder: true,
      });
    };

    const handleRegistration = (reg: ServiceWorkerRegistration): void => {
      registration = reg;

      if (reg.waiting && navigator.serviceWorker.controller) {
        showUpdateNotification(reg.waiting);
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            showUpdateNotification(newWorker);
          }
        });
      });

      intervalId = setInterval(() => {
        void reg.update().catch(() => {
          // オフライン等は無視
        });
      }, UPDATE_CHECK_INTERVAL_MS);
    };

    const handleControllerChange = (): void => {
      if (reloadTriggeredRef.current) return;
      reloadTriggeredRef.current = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      'controllerchange',
      handleControllerChange,
    );

    void navigator.serviceWorker.ready
      .then(handleRegistration)
      .catch(() => {
        // SW 未登録環境では何もしない
      });

    const handleVisibility = (): void => {
      if (document.visibilityState === 'visible' && registration) {
        void registration.update().catch(() => {
          // ignore
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (intervalId !== null) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        handleControllerChange,
      );
    };
  }, []);

  return null;
}
