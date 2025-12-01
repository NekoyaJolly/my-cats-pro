'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Stack,
  TextInput,
  Group,
  Alert,
  Code,
  CopyButton,
  Button,
  Text,
} from '@mantine/core';
import { IconCheck, IconCopy, IconMail } from '@tabler/icons-react';
import { ActionButton } from '@/components/ActionButton';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { getInvitationUrl } from '@/lib/invitation-utils';

interface InviteTenantAdminModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * テナント管理者招待モーダル（SUPER_ADMIN専用）
 */
export function InviteTenantAdminModal({ opened, onClose }: InviteTenantAdminModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    tenantName: '',
    tenantSlug: '',
  });
  // 招待成功後の情報を保持
  const [invitationResult, setInvitationResult] = useState<{
    email: string;
    invitationToken: string;
  } | null>(null);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      email: '',
      tenantName: '',
      tenantSlug: '',
    });
    setInvitationResult(null);
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // テナント一覧を更新して閉じる
  const handleFinish = () => {
    handleClose();
    router.refresh();
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

      if (response.success && response.data) {
        const data = response.data as { invitationToken?: string };
        if (data.invitationToken) {
          // 招待URLを表示するモードに切り替え
          setInvitationResult({
            email: formData.email.trim(),
            invitationToken: data.invitationToken,
          });
          notifications.show({
            title: '成功',
            message: 'テナントと招待が作成されました',
            color: 'green',
          });
        } else {
          // トークンが返されなかった場合は従来の動作
          notifications.show({
            title: '成功',
            message: 'テナント管理者の招待を送信しました',
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

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="テナント管理者を招待"
      size="md"
    >
      {invitationResult ? (
        // 招待成功後の表示
        <Stack gap="md">
          <Alert icon={<IconMail size={16} />} title="招待を作成しました" color="green">
            <Text size="sm" mb="xs">
              <strong>{invitationResult.email}</strong> 宛ての招待を作成しました。
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
      )}
    </Modal>
  );
}
