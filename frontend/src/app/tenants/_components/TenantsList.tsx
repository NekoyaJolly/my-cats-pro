'use client';

import { useState, useEffect } from 'react';
import { Table, Badge, Text, Card, Loader, Center, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * テナント一覧テーブル
 */
export function TenantsList() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // テナント一覧取得
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        setError(null);

        // SUPER_ADMIN は全テナント、それ以外は自分のテナントのみ
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
    };

    fetchTenants();
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

  if (tenants.length === 0) {
    return (
      <Card withBorder p="xl">
        <Center>
          <Text c="dimmed">テナントがありません</Text>
        </Center>
      </Card>
    );
  }

  return (
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
  );
}
