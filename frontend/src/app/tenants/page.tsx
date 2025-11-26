import { TenantsManagement } from './_components/TenantsManagement';

/**
 * テナント管理ページ
 * 
 * SUPER_ADMIN: テナント管理者招待機能
 * TENANT_ADMIN: 自テナント内ユーザー招待機能
 * 共通: テナント一覧表示、ユーザー一覧表示
 */
export default function TenantsPage() {
  return <TenantsManagement />;
}
