'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Badge, Text, Card, Loader, Center, Alert, Select, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle } from '@tabler/icons-react';
import { ActionButton, ActionIconButton } from '@/components/ActionButton';
import { UnifiedModal } from '@/components/common';
import { apiClient, apiRequest } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/lib/auth/store';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  tenantId: string;
  createdAt: string;
}

interface RoleOption {
  value: string;
  label: string;
}

/**
 * ユーザー一覧テーブル
 */
export function UsersList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [changingRoleUserId, setChangingRoleUserId] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isTenantAdmin = currentUser?.role === 'TENANT_ADMIN';

  // 削除確認モーダルの状態
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ロール表示名変換
  const getRoleLabel = (role: string): string => {
    const mapping: Record<string, string> = {
      SUPER_ADMIN: 'スーパー管理者',
      TENANT_ADMIN: 'テナント管理者',
      ADMIN: '管理者',
      USER: '一般ユーザー',
    };
    return mapping[role] || role;
  };

  // ロール色
  const getRoleColor = (role: string): string => {
    const mapping: Record<string, string> = {
      SUPER_ADMIN: 'red',
      TENANT_ADMIN: 'blue',
      ADMIN: 'yellow',
      USER: 'gray',
    };
    return mapping[role] || 'gray';
  };

  /**
   * ターゲットユーザーのロール変更可能な選択肢を返す
   * 変更不可の場合は null を返す
   */
  const getRoleOptions = useCallback((targetUser: User): RoleOption[] | null => {
    // 自分自身は変更不可
    if (targetUser.id === currentUser?.id) return null;

    if (isSuperAdmin) {
      // SUPER_ADMIN は他の SUPER_ADMIN のロールは変更不可
      if (targetUser.role === 'SUPER_ADMIN') return null;
      // ADMIN ↔ USER, TENANT_ADMIN への変更を許可
      return [
        { value: 'USER', label: '一般ユーザー' },
        { value: 'ADMIN', label: '管理者' },
        { value: 'TENANT_ADMIN', label: 'テナント管理者' },
      ];
    }

    if (isTenantAdmin) {
      // TENANT_ADMIN は SUPER_ADMIN と TENANT_ADMIN のユーザーは変更不可
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'TENANT_ADMIN') return null;
      // 自テナントの ADMIN ↔ USER のみ変更可能
      return [
        { value: 'USER', label: '一般ユーザー' },
        { value: 'ADMIN', label: '管理者' },
      ];
    }

    return null;
  }, [currentUser?.id, isSuperAdmin, isTenantAdmin]);

  /**
   * ロール変更 API 呼び出し
   */
  const handleRoleChange = async (userId: string, newRole: string): Promise<void> => {
    setChangingRoleUserId(userId);
    try {
      const response = await apiClient.request(`/users/${userId}/role` as never, 'patch', {
        body: { role: newRole } as never,
      });

      if (response.success) {
        // ユーザー一覧の state を更新
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        notifications.show({
          title: '成功',
          message: 'ロールを変更しました',
          color: 'green',
        });
      } else {
        throw new Error(response.error || 'ロールの変更に失敗しました');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      notifications.show({
        title: 'エラー',
        message,
        color: 'red',
      });
    } finally {
      setChangingRoleUserId(null);
    }
  };

  // ユーザー一覧取得
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 自分のテナント内のユーザーを取得
      const response = await apiClient.request('/users' as never, 'get');

      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data as User[]);
      } else {
        throw new Error(response.error || 'ユーザー情報の取得に失敗しました');
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
    fetchUsers();
  }, [fetchUsers]);

  /**
   * 対象ユーザーを削除可能かどうかを判定
   */
  const canDeleteUser = useCallback((targetUser: User): boolean => {
    // 自分自身は削除不可
    if (targetUser.id === currentUser?.id) return false;

    if (isSuperAdmin) {
      // SUPER_ADMIN は他の SUPER_ADMIN は削除不可
      if (targetUser.role === 'SUPER_ADMIN') return false;
      return true;
    }

    if (isTenantAdmin) {
      // TENANT_ADMIN は SUPER_ADMIN と TENANT_ADMIN は削除不可
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'TENANT_ADMIN') return false;
      return true;
    }

    return false;
  }, [currentUser?.id, isSuperAdmin, isTenantAdmin]);

  // 削除ボタンがクリックされたときのハンドラ
  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    openDeleteModal();
  };

  // 削除確認ダイアログを閉じる
  const handleDeleteModalClose = () => {
    if (!deleteLoading) {
      setDeletingUser(null);
      closeDeleteModal();
    }
  };

  // ユーザー削除処理
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setDeleteLoading(true);

      const response = await apiRequest(`/users/${deletingUser.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        notifications.show({
          title: '成功',
          message: 'ユーザーを削除しました',
          color: 'green',
        });
        handleDeleteModalClose();
        // 一覧を再取得
        fetchUsers();
      } else {
        const errorMessage =
          response.error ||
          response.message ||
          'ユーザーの削除に失敗しました';
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

  if (users.length === 0) {
    return (
      <Card withBorder p="xl">
        <Center>
          <Text c="dimmed">ユーザーがいません</Text>
        </Center>
      </Card>
    );
  }

  // 現在のユーザーが SUPER_ADMIN または TENANT_ADMIN の場合、操作列を表示
  const showActionsColumn = isSuperAdmin || isTenantAdmin;

  return (
    <Card withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ユーザー名</Table.Th>
            <Table.Th>メールアドレス</Table.Th>
            <Table.Th>ロール</Table.Th>
            <Table.Th>登録日</Table.Th>
            {showActionsColumn && <Table.Th>操作</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => {
            const displayName = [u.lastName, u.firstName].filter(Boolean).join(' ') || '未設定';
            const roleOptions = getRoleOptions(u);
            const isChangingRole = changingRoleUserId === u.id;
            
            return (
              <Table.Tr key={u.id}>
                <Table.Td>
                  <Text fw={600}>{displayName}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {u.email}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getRoleColor(u.role)} variant="light">
                    {getRoleLabel(u.role)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(u.createdAt).toLocaleDateString('ja-JP')}
                  </Text>
                </Table.Td>
                {showActionsColumn && (
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      {roleOptions ? (
                        <Select
                          size="xs"
                          w={140}
                          placeholder="ロール変更"
                          data={roleOptions}
                          value={u.role}
                          onChange={(value) => {
                            if (value && value !== u.role) {
                              void handleRoleChange(u.id, value);
                            }
                          }}
                          disabled={isChangingRole}
                          rightSection={isChangingRole ? <Loader size="xs" /> : undefined}
                          aria-label={`${displayName}のロールを変更`}
                        />
                      ) : (
                        <Text size="sm" c="dimmed" w={140}>
                          -
                        </Text>
                      )}
                      {canDeleteUser(u) && (
                        <ActionIconButton
                          action="delete"
                          onClick={() => handleDeleteClick(u)}
                          title="削除"
                        />
                      )}
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {/* ユーザー削除確認モーダル */}
      <UnifiedModal
        opened={deleteModalOpened}
        onClose={handleDeleteModalClose}
        title="ユーザー削除の確認"
        size="md"
      >
        <Text>
          以下のユーザーを削除しますか？この操作は取り消せません。
        </Text>
        <Text fw={600} size="lg">
          {deletingUser?.firstName || deletingUser?.lastName
            ? [deletingUser?.lastName, deletingUser?.firstName].filter(Boolean).join(' ')
            : deletingUser?.email}
        </Text>
        <Text size="sm" c="dimmed">
          メールアドレス: {deletingUser?.email}
        </Text>
        <Group justify="flex-end" mt="md">
          <ActionButton action="cancel" onClick={handleDeleteModalClose} disabled={deleteLoading}>
            キャンセル
          </ActionButton>
          <ActionButton action="delete" onClick={handleDeleteUser} loading={deleteLoading}>
            削除
          </ActionButton>
        </Group>
      </UnifiedModal>
    </Card>
  );
}
