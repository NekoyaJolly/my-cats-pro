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
import { IconAlertCircle, IconPlus, IconUserPlus } from '@tabler/icons-react';
import { apiClient, apiRequest } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { ActionButton } from '@/components/ActionButton';
import { useAuth } from '@/lib/auth/store';
import { EditTenantModal } from './EditTenantModal';
import { ActionMenu } from './ActionMenu';
import { InviteTenantAdminModal } from './InviteTenantAdminModal';

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

  // 編集モーダルの状態
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  // 招待モーダルの状態
  const [inviteAdminOpened, { open: openInviteAdmin, close: closeInviteAdmin }] = useDisclosure(false);

  // 削除確認モーダルの状態
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  // 編集ボタンがクリックされたときのハンドラ
  const handleEditClick = (tenant: Tenant) => {
    setEditingTenant(tenant);
    openEditModal();
  };

  // 編集成功時のハンドラ
  const handleEditSuccess = () => {
    fetchTenants();
  };

  // 削除ボタンがクリックされたときのハンドラ
  const handleDeleteClick = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    openDeleteModal();
  };

  // 削除確認ダイアログを閉じる
  const handleDeleteModalClose = () => {
    if (!deleteLoading) {
      setDeletingTenant(null);
      closeDeleteModal();
    }
  };

  // テナント削除処理
  const handleDeleteTenant = async () => {
    if (!deletingTenant) return;

    try {
      setDeleteLoading(true);

      const response = await apiRequest(`/tenants/${deletingTenant.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'テナントを削除しました',
          color: 'green',
        });
        handleDeleteModalClose();
        // 一覧を再取得
        fetchTenants();
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'テナントの削除に失敗しました';
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
      setDeleteLoading(false);
    }
  };

  // アクションメニュー項目を生成
  const getActionItems = () => {
    if (!isSuperAdmin) return [];

    return [
      {
        id: 'create-tenant',
        label: '新規テナント作成',
        icon: <IconPlus size={16} />,
        onClick: open,
      },
      {
        id: 'invite-admin',
        label: 'テナント管理者を招待',
        icon: <IconUserPlus size={16} />,
        onClick: openInviteAdmin,
      },
    ];
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
      {/* SUPER_ADMIN のみアクションメニューを表示 */}
      {isSuperAdmin && (
        <Group justify="flex-end">
          <ActionMenu items={getActionItems()} buttonLabel="アクション" />
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
                {isSuperAdmin && <Table.Th>操作</Table.Th>}
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
                  {isSuperAdmin && (
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <ActionButton action="edit" size="xs" onClick={() => handleEditClick(tenant)}>
                          編集
                        </ActionButton>
                        <ActionButton
                          action="delete"
                          size="xs"
                          onClick={() => handleDeleteClick(tenant)}
                        >
                          削除
                        </ActionButton>
                      </Group>
                    </Table.Td>
                  )}
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

      {/* テナント編集モーダル */}
      <EditTenantModal
        tenant={editingTenant}
        opened={editModalOpened}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* テナント管理者招待モーダル */}
      <InviteTenantAdminModal
        opened={inviteAdminOpened}
        onClose={closeInviteAdmin}
      />

      {/* テナント削除確認モーダル */}
      <Modal
        opened={deleteModalOpened}
        onClose={handleDeleteModalClose}
        title="テナント削除の確認"
        size="md"
      >
        <Stack gap="md">
          <Text>
            以下のテナントを削除しますか？この操作は取り消せません。
          </Text>
          <Text fw={600} size="lg">
            {deletingTenant?.name}
          </Text>
          <Text size="sm" c="dimmed">
            ※所属ユーザーがいる場合は削除できません。
          </Text>
          <Group justify="flex-end" mt="md">
            <ActionButton action="cancel" onClick={handleDeleteModalClose} disabled={deleteLoading}>
              キャンセル
            </ActionButton>
            <ActionButton action="delete" onClick={handleDeleteTenant} loading={deleteLoading}>
              削除
            </ActionButton>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
