/**
 * 機能ドメイン単位の権限定義（バックエンド backend/src/auth/permissions.ts と同期）
 *
 * 詳細: docs/permission-system-design.md
 */

export type Permission =
  | 'cats:write'
  | 'breeding:write'
  | 'care:write'
  | 'medical:write'
  | 'tags:manage'
  | 'pedigree:write'
  | 'gallery:write'
  | 'staff:manage'
  | 'graduation:write'
  | 'data:import_export'
  | 'users:manage'
  | 'tenants:manage'
  | 'settings:manage';

export interface PermissionDefinition {
  value: Permission;
  label: string;
  /** 権限チェックボックスのグループ見出し */
  group: '日常記録' | 'マスタ・設定' | '管理';
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  { value: 'cats:write', label: '猫情報の登録・編集・削除', group: '日常記録' },
  { value: 'breeding:write', label: '交配管理', group: '日常記録' },
  { value: 'care:write', label: 'ケアスケジュール管理', group: '日常記録' },
  { value: 'medical:write', label: '医療記録管理', group: '日常記録' },
  { value: 'graduation:write', label: '卒業（譲渡）管理', group: '日常記録' },
  { value: 'tags:manage', label: 'タグ管理・自動化ルール', group: 'マスタ・設定' },
  { value: 'pedigree:write', label: '血統書管理', group: 'マスタ・設定' },
  { value: 'gallery:write', label: 'ギャラリー管理', group: 'マスタ・設定' },
  { value: 'settings:manage', label: 'システム設定', group: 'マスタ・設定' },
  { value: 'data:import_export', label: 'データ入出力', group: '管理' },
  { value: 'staff:manage', label: 'スタッフ・シフト管理', group: '管理' },
  { value: 'users:manage', label: 'ユーザー管理', group: '管理' },
  { value: 'tenants:manage', label: 'テナント管理', group: '管理' },
];

export const ALL_PERMISSIONS: Permission[] = PERMISSION_DEFINITIONS.map(
  (definition) => definition.value,
);

/**
 * ロールプリセット（招待・編集フォームのチェックボックス初期状態）
 * バックエンドの ROLE_PRESETS と同期
 */
export const ROLE_PRESETS: Record<string, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  TENANT_ADMIN: ALL_PERMISSIONS.filter((permission) => permission !== 'tenants:manage'),
  ADMIN: ALL_PERMISSIONS.filter(
    (permission) => permission !== 'tenants:manage' && permission !== 'users:manage',
  ),
  USER: ['cats:write', 'care:write', 'medical:write', 'breeding:write'],
};

/** ユーザーが指定権限を持つか判定する（SUPER_ADMIN は常に true） */
export function hasPermission(
  user: { role: string; permissions?: string[] | null } | null,
  permission: Permission,
): boolean {
  if (!user) {
    return false;
  }
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }
  return (user.permissions ?? []).includes(permission);
}
