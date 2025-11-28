'use client';

import { useState } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
  Alert,
  Code,
  CopyButton,
  Button,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCheck, IconCopy, IconMail } from '@tabler/icons-react';
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
  // 招待成功後の情報を保持
  const [invitationResult, setInvitationResult] = useState<{
    email: string;
    invitationToken: string;
    role: string;
  } | null>(null);

  // テナントIDを取得（ユーザーオブジェクトから）
  const tenantId = user?.tenantId;

  // フォームリセット
  const resetForm = () => {
    setFormData({
      email: '',
      role: 'USER',
    });
    setInvitationResult(null);
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!loading) {
      resetForm();
      close();
    }
  };

  // ユーザー一覧を更新して閉じる
  const handleFinish = () => {
    handleClose();
    window.location.reload();
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

      if (response.success && response.data) {
        const data = response.data as { invitationToken?: string };
        if (data.invitationToken) {
          // 招待URLを表示するモードに切り替え
          setInvitationResult({
            email: formData.email.trim(),
            invitationToken: data.invitationToken,
            role: formData.role,
          });
          notifications.show({
            title: '成功',
            message: '招待を作成しました',
            color: 'green',
          });
        } else {
          // トークンが返されなかった場合は従来の動作
          notifications.show({
            title: '成功',
            message: 'ユーザーの招待を送信しました',
            color: 'green',
          });
          handleFinish();
        }
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

  // 招待URL生成（現在のホストを使用）
  const getInvitationUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/accept-invitation?token=${token}`;
    }
    return `/accept-invitation?token=${token}`;
  };

  // ロール名を日本語で取得
  const getRoleLabel = (role: string) => {
    return ROLE_OPTIONS.find((opt) => opt.value === role)?.label || role;
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
        {invitationResult ? (
          // 招待成功後の表示
          <Stack gap="md">
            <Alert icon={<IconMail size={16} />} title="招待を作成しました" color="green">
              <Text size="sm" mb="xs">
                <strong>{invitationResult.email}</strong> を
                <strong>{getRoleLabel(invitationResult.role)}</strong>として招待しました。
              </Text>
              <Text size="sm" c="dimmed">
                以下の招待URLをコピーして、招待者に共有してください。
              </Text>
            </Alert>

            <Stack gap="xs">
              <Text size="sm" fw={500}>招待URL:</Text>
              <Code block style={{ wordBreak: 'break-all' }}>
                {getInvitationUrl(invitationResult.invitationToken)}
              </Code>
              <CopyButton value={getInvitationUrl(invitationResult.invitationToken)}>
                {({ copied, copy }) => (
                  <Button
                    color={copied ? 'teal' : 'blue'}
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    onClick={copy}
                    variant="light"
                  >
                    {copied ? 'コピーしました！' : 'URLをコピー'}
                  </Button>
                )}
              </CopyButton>
            </Stack>

            <Text size="xs" c="dimmed">
              ※ 招待URLは7日間有効です。
            </Text>

            <Group justify="flex-end" mt="md">
              <ActionButton action="save" onClick={handleFinish}>
                閉じる
              </ActionButton>
            </Group>
          </Stack>
        ) : (
          // 招待フォーム
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
        )}
      </Modal>
    </>
  );
}
