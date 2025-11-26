'use client';

import { useState } from 'react';
import { Stack, Title, Tabs, Alert, Loader, Center } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { TenantsList } from './TenantsList';
import { UsersList } from './UsersList';
import { InviteTenantAdminModal } from './InviteTenantAdminModal';
import { InviteUserModal } from './InviteUserModal';

/**
 * テナント管理メインコンポーネント
 * 
 * ロールに応じて以下の機能を提供:
 * - SUPER_ADMIN: テナント管理者招待、全テナント閲覧
 * - TENANT_ADMIN: ユーザー招待、自テナントのユーザー閲覧
 * - その他: 自テナントの情報閲覧のみ
 */
export function TenantsManagement() {
  const { user, isAuthenticated, initialized } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>('tenants');

  // 権限チェック
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isTenantAdmin = user?.role === 'TENANT_ADMIN';
  const hasManagementAccess = isSuperAdmin || isTenantAdmin;

  // 初期化待機
  if (!initialized) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // 未認証
  if (!isAuthenticated || !user) {
    return (
      <Center h="50vh">
        <Alert icon={<IconAlertCircle size={16} />} title="認証エラー" color="red">
          ログインが必要です
        </Alert>
      </Center>
    );
  }

  return (
    <Stack gap="lg" p="md">
      <Title order={2}>テナント管理</Title>

      {!hasManagementAccess && (
        <Alert icon={<IconAlertCircle size={16} />} title="権限がありません" color="yellow">
          テナント管理機能へのアクセスには管理者権限が必要です
        </Alert>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="tenants">テナント一覧</Tabs.Tab>
          <Tabs.Tab value="users">ユーザー一覧</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tenants" pt="md">
          <TenantsList />
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <UsersList />
        </Tabs.Panel>
      </Tabs>

      {/* SUPER_ADMIN 専用: テナント管理者招待モーダル */}
      {isSuperAdmin && <InviteTenantAdminModal />}

      {/* TENANT_ADMIN 専用: ユーザー招待モーダル */}
      {isTenantAdmin && <InviteUserModal />}
    </Stack>
  );
}
