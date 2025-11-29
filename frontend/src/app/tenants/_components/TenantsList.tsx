'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Badge,
  Text,
  Card,
  Loader,
  Center,
  Alert,
  Stack,
  Group,
  Modal,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiClient, apiRequest } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { useAuth } from '@/lib/auth/store';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateTenantFormData {
  name: string;
  slug: string;
}

interface CreateTenantResponse {
  id: string;
  name: string;
  slug: string;
}

/**
 * テナント一覧テーブル
 * SUPER_ADMINはテナント作成機能も使用可能
 */
export function TenantsList() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // テナント作成モーダルの状態
  const [opened, { open, close }] = useDisclosure(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTenantFormData>({
    name: '',
    slug: '',
  });

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // テナント一覧取得
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // SUPER_ADMIN のみアクセス可能
      const response = await apiClient.request('/tenants' as never, 'get');

      if (response.success && Array.isArray(response.data)) {
        setTenants(response.data as Tenant[]);
      } else {
        throw new Error(response.error || 'テナント情報の取得に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
    });
  };

  // モーダルを閉じる
  const handleClose = () => {
    if (!createLoading) {
      resetForm();
      close();
    }
  };

  // テナント作成処理
  const handleCreateTenant = async () => {
    // バリデーション
    if (!formData.name.trim()) {
      notifications.show({
        title: 'エラー',
        message: 'テナント名を入力してください',
        color: 'red',
      });
      return;
    }

    try {
      setCreateLoading(true);

      // POST /tenants でテナントを作成
      const requestBody: { name: string; slug?: string } = {
        name: formData.name.trim(),
      };
      if (formData.slug.trim()) {
        requestBody.slug = formData.slug.trim();
      }

      const response = await apiRequest<CreateTenantResponse>('/tenants', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (response.success && response.data) {
        notifications.show({
          title: '成功',
          message: 'テナントを作成しました',
          color: 'green',
        });
        handleClose();
        // 一覧を再取得
        fetchTenants();
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'テナントの作成に失敗しました';
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
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h={200}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="エラー" color="red">
        {error}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {/* SUPER_ADMIN のみテナント作成ボタンを表示 */}
      {isSuperAdmin && (
        <Group justify="flex-end">
          <ActionButton action="create" onClick={open}>
            新規テナント作成
          </ActionButton>
        </Group>
      )}

      {tenants.length === 0 ? (
        <Card withBorder p="xl">
          <Center>
            <Text c="dimmed">テナントがありません</Text>
          </Center>
        </Card>
      ) : (
        <Card withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>テナント名</Table.Th>
                <Table.Th>スラッグ</Table.Th>
                <Table.Th>ステータス</Table.Th>
                <Table.Th>作成日</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tenants.map((tenant) => (
                <Table.Tr key={tenant.id}>
                  <Table.Td>
                    <Text fw={600}>{tenant.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text c="dimmed" size="sm">
                      {tenant.slug}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={tenant.isActive ? 'green' : 'gray'} variant="light">
                      {tenant.isActive ? '有効' : '無効'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {new Date(tenant.createdAt).toLocaleDateString('ja-JP')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      {/* テナント作成モーダル */}
      <Modal
        opened={opened}
        onClose={handleClose}
        title="新規テナント作成"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="テナント名"
            placeholder="サンプルテナント"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={createLoading}
          />

          <TextInput
            label="テナントスラッグ（オプション）"
            placeholder="sample-tenant"
            description="未入力の場合、テナント名から自動生成されます"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            disabled={createLoading}
          />

          <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleClose} disabled={createLoading}>
              キャンセル
            </ActionButton>
            <ActionButton action="save" onClick={handleCreateTenant} loading={createLoading}>
              作成
            </ActionButton>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
