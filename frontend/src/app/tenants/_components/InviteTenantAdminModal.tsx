'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ActionButton } from '@/components/ActionButton';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

/**
 * テナント管理者招待モーダル（SUPER_ADMIN専用）
 */
export function InviteTenantAdminModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    tenantName: '',
    tenantSlug: '',
  });

  // フォームリセット
  const resetForm = () => {
    setFormData({
      email: '',
      tenantName: '',
      tenantSlug: '',
    });
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!loading) {
      resetForm();
      close();
    }
  };

  // 招待送信
  const handleSubmit = async () => {
    // バリデーション
    if (!formData.email.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'メールアドレスを入力してください',
        color: 'red',
      });
      return;
    }

    if (!formData.tenantName.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'テナント名を入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.request('/tenants/invite-admin' as never, 'post', {
        body: {
          email: formData.email.trim(),
          tenantName: formData.tenantName.trim(),
          tenantSlug: formData.tenantSlug.trim() || undefined,
        } as never,
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'テナント管理者の招待を送信しました',
          color: 'green',
        });
        handleClose();
        // ページリロードでテナント一覧を更新
        window.location.reload();
      } else {
        throw new Error(response.error || '招待の送信に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ActionButton
        action="create"
        onClick={open}
        style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 100 }}
      >
        テナント管理者を招待
      </ActionButton>

      <Modal
        opened={opened}
        onClose={handleClose}
        title="テナント管理者を招待"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="メールアドレス"
            placeholder="admin@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />

          <TextInput
            label="テナント名"
            placeholder="サンプルテナント"
            required
            value={formData.tenantName}
            onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
            disabled={loading}
          />

          <TextInput
            label="テナントスラッグ（オプション）"
            placeholder="sample-tenant"
            description="未入力の場合、テナント名から自動生成されます"
            value={formData.tenantSlug}
            onChange={(e) => setFormData({ ...formData, tenantSlug: e.target.value })}
            disabled={loading}
          />

          <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleClose} disabled={loading}>
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleSubmit} loading={loading}>
              招待を送信
            </ActionButton>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
