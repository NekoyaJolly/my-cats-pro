'use client';

import { useState, useEffect } from 'react';
import { Stack, Tabs, Alert, Loader, Center, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '@/lib/auth/store';
import { usePageHeader } from '@/lib/contexts/page-header-context';
import { TenantsList } from './TenantsList';
import { UsersList } from './UsersList';
import { UserProfileForm } from './UserProfileForm';
import { BottomNavSettings } from './BottomNavSettings';
import { InviteUserModal } from './InviteUserModal';
import { ActionMenu } from './ActionMenu';

/**
 * ユーザー設定メインコンポーネント
 * 
 * ロールに応じて以下の機能を提供:
 * - 全員: プロフィール編集、パスワード変更
 * - SUPER_ADMIN: テナント管理者招待、全テナント閲覧、テナント作成
 * - TENANT_ADMIN: ユーザー招待、自テナントのユーザー閲覧
 */
export function TenantsManagement() {
  const { user, isAuthenticated, initialized } = useAuth();
  const { setPageHeader } = usePageHeader();
  const [activeTab, setActiveTab] = useState<string | null>('profile');

  // 招待モーダルの状態
  const [inviteUserOpened, { open: openInviteUser, close: closeInviteUser }] = useDisclosure(false);

  // ページヘッダーを設定
  useEffect(() => {
    setPageHeader('ユーザー管理');
    return () => setPageHeader(null);
  }, [setPageHeader]);

  // 権限チェック
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isTenantAdmin = user?.role === 'TENANT_ADMIN';
  // ユーザー管理は SUPER_ADMIN と TENANT_ADMIN が可能
  const hasUserManagementAccess = isSuperAdmin || isTenantAdmin;

  // 現在のタブに応じたアクションメニュー項目を生成
  const getActionItems = () => {
    // 「ユーザー一覧」タブで TENANT_ADMIN の場合のみ、ユーザー招待を表示
    if (activeTab === 'users' && isTenantAdmin) {
      return [
        {
          id: 'invite-user',
          label: 'ユーザーを招待',
          icon: <IconUserPlus size={16} />,
          onClick: openInviteUser,
        },
      ];
    }

    return [];
  };

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

  const actionItems = getActionItems();

  return (
    <Stack gap="lg" p={0}>
      {actionItems.length > 0 && (
        <Group justify="flex-end">
          <ActionMenu 
            items={actionItems} 
            buttonLabel="アクション" 
            isSectionAction
          />
        </Group>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List grow>
          <Tabs.Tab value="profile">ユーザー設定</Tabs.Tab>
          {isSuperAdmin && <Tabs.Tab value="tenants">テナント一覧</Tabs.Tab>}
          {hasUserManagementAccess && <Tabs.Tab value="users">ユーザー一覧</Tabs.Tab>}
        </Tabs.List>

        {/* 
         * タブパネルは条件付きでレンダリングし、アクティブなタブのみコンポーネントをマウントする。
         * これにより、権限がないユーザーがページに入った時に、
         * 不要なAPIコールが発生して403エラーになることを防ぐ。
         */}
        <Tabs.Panel value="profile" pt="md">
          {activeTab === 'profile' && (
            <Stack gap="lg">
              <UserProfileForm />
              <BottomNavSettings />
            </Stack>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="tenants" pt="md">
          {activeTab === 'tenants' && isSuperAdmin && <TenantsList />}
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          {activeTab === 'users' && hasUserManagementAccess && <UsersList />}
        </Tabs.Panel>
      </Tabs>

      {/* TENANT_ADMIN 専用: ユーザー招待モーダル */}
      {isTenantAdmin && (
        <InviteUserModal
          opened={inviteUserOpened}
          onClose={closeInviteUser}
        />
      )}
    </Stack>
  );
}
