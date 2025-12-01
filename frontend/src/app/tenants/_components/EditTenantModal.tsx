'use client';

import { useState, useEffect } from 'react';
import { Modal, Stack, TextInput, Switch, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { apiRequest } from '@/lib/api/client';
import { ActionButton } from '@/components/ActionButton';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface EditTenantModalProps {
  tenant: Tenant | null;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditTenantModal({ tenant, opened, onClose, onSuccess }: EditTenantModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    isActive: true,
  });

  // テナント情報が変わったらフォームを初期化
  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
      });
    }
  }, [tenant]);

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!tenant) return;

    // バリデーション
    if (!formData.name.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'テナント名を入力してください',
        color: 'red',
      });
      return;
    }

    if (!formData.slug.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'スラッグを入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(`/tenants/${tenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          isActive: formData.isActive,
        }),
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'テナントを更新しました',
          color: 'green',
        });
        onSuccess();
        onClose();
      } else {
        const errorMessage = response.error || response.message || 'テナントの更新に失敗しました';
        notifications.show({
          title: 'エラー',
          message: errorMessage,
          color: 'red',
        });
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
      title="テナントを編集"
      size="md"
    >
      <Stack gap="md">
        <TextInput
          label="テナント名"
          placeholder="サンプルテナント"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={loading}
        />

        <TextInput
          label="テナントスラッグ"
          placeholder="sample-tenant"
          required
          description="半角英小文字、数字、ハイフンのみ使用可能"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          disabled={loading}
        />

        <Group>
          <Switch
            label="有効"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
            disabled={loading}
          />
          <Text size="sm" c="dimmed">
            無効にするとテナントのユーザーはログインできなくなります
          </Text>
        </Group>

        <Group justify="flex-end" mt="md">
          <ActionButton action="cancel" onClick={handleClose} disabled={loading}>
            キャンセル
          </ActionButton>
          <ActionButton action="save" onClick={handleSubmit} loading={loading}>
            保存
          </ActionButton>
        </Group>
      </Stack>
    </Modal>
  );
}
