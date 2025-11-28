'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ActionButton } from '@/components/ActionButton';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/store';
import { notifications } from '@mantine/notifications';

// ロール選択肢（TENANT_ADMIN が招待できるのは USER と ADMIN のみ）
const ROLE_OPTIONS = [
  { value: 'USER', label: '一般ユーザー' },
  { value: 'ADMIN', label: '管理者' },
];

/**
 * ユーザー招待モーダル（TENANT_ADMIN専用）
 */
export function InviteUserModal() {
  const { user } = useAuth();
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER',
  });

  // テナントIDを取得（ユーザーオブジェクトから）
  const tenantId = user?.tenantId;

  // フォームリセット
  const resetForm = () => {
    setFormData({
      email: '',
      role: 'USER',
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

    if (!tenantId) {
      notifications.show({
        title: 'エラー',
        message: 'テナント情報が見つかりません',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.request(`/tenants/${tenantId}/users/invite` as never, 'post', {
        body: {
          email: formData.email.trim(),
          role: formData.role,
        } as never,
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'ユーザーの招待を送信しました',
          color: 'green',
        });
        handleClose();
        // ページリロードでユーザー一覧を更新
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

  // テナントIDがない場合はボタンを表示しない
  if (!tenantId) {
    return null;
  }

  return (
    <>
      <ActionButton
        action="create"
        onClick={open}
        style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 100 }}
      >
        ユーザーを招待
      </ActionButton>

      <Modal
        opened={opened}
        onClose={handleClose}
        title="ユーザーを招待"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="メールアドレス"
            placeholder="user@example.com"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />

          <Select
            label="ロール"
            placeholder="ロールを選択"
            required
            data={ROLE_OPTIONS}
            value={formData.role}
            onChange={(value) => setFormData({ ...formData, role: value || 'USER' })}
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
