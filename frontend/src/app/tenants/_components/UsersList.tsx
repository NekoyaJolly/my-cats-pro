'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Text, Card, Loader, Center, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
  tenantId: string;
  createdAt: string;
}

/**
 * ユーザー一覧テーブル
 */
export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // ユーザー一覧取得
  useEffect(() => {
    const fetchUsers = async () => {
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
    };

    fetchUsers();
  }, []);

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

  return (
    <Card withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ユーザー名</Table.Th>
            <Table.Th>メールアドレス</Table.Th>
            <Table.Th>ロール</Table.Th>
            <Table.Th>登録日</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => {
            const displayName = [u.lastName, u.firstName].filter(Boolean).join(' ') || '未設定';
            
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
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
