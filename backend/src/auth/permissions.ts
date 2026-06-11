import { UserRole } from "@prisma/client";

/**
 * 機能ドメイン単位の権限定義
 *
 * アクセス制御の単一の真実（single source of truth）。
 * DB（User.permissions）にはこの値を文字列として保存する。
 * 詳細: docs/permission-system-design.md
 */
export const PERMISSIONS = {
  /** 猫情報の登録・編集・削除（体重記録・猫へのタグ付与/剥奪を含む） */
  CATS_WRITE: "cats:write",
  /** 交配管理（交配記録・配種スケジュール・妊娠確認・出産予定・子猫処遇・NGルール） */
  BREEDING_WRITE: "breeding:write",
  /** ケアスケジュール管理（作成・更新・完了・削除・ステータス変更） */
  CARE_WRITE: "care:write",
  /** 医療記録管理（作成・更新・削除） */
  MEDICAL_WRITE: "medical:write",
  /** タグ管理・自動化ルール（タグ3階層 CRUD・並び替え・自動化ルール） */
  TAGS_MANAGE: "tags:manage",
  /** 血統書管理（CRUD・印刷設定） */
  PEDIGREE_WRITE: "pedigree:write",
  /** ギャラリー管理（CRUD・アップロード） */
  GALLERY_WRITE: "gallery:write",
  /** スタッフ・シフト管理 */
  STAFF_MANAGE: "staff:manage",
  /** 卒業（譲渡）管理 */
  GRADUATION_WRITE: "graduation:write",
  /** データ入出力（CSVインポート・エクスポート） */
  DATA_IMPORT_EXPORT: "data:import_export",
  /** ユーザー管理（招待・ロール/権限変更・削除） */
  USERS_MANAGE: "users:manage",
  /** テナント管理（テナント CRUD・管理者招待） */
  TENANTS_MANAGE: "tenants:manage",
  /** システム設定（テナント設定・印刷テンプレート・表示設定） */
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

/** UI・エラーメッセージ用の日本語名 */
export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.CATS_WRITE]: "猫情報の登録・編集・削除",
  [PERMISSIONS.BREEDING_WRITE]: "交配管理",
  [PERMISSIONS.CARE_WRITE]: "ケアスケジュール管理",
  [PERMISSIONS.MEDICAL_WRITE]: "医療記録管理",
  [PERMISSIONS.TAGS_MANAGE]: "タグ管理・自動化ルール",
  [PERMISSIONS.PEDIGREE_WRITE]: "血統書管理",
  [PERMISSIONS.GALLERY_WRITE]: "ギャラリー管理",
  [PERMISSIONS.STAFF_MANAGE]: "スタッフ・シフト管理",
  [PERMISSIONS.GRADUATION_WRITE]: "卒業（譲渡）管理",
  [PERMISSIONS.DATA_IMPORT_EXPORT]: "データ入出力",
  [PERMISSIONS.USERS_MANAGE]: "ユーザー管理",
  [PERMISSIONS.TENANTS_MANAGE]: "テナント管理",
  [PERMISSIONS.SETTINGS_MANAGE]: "システム設定",
};

/**
 * ロールプリセット（新規ユーザー登録時の初期権限セット）
 *
 * ロールは初期チェック状態を決めるだけで、付与後は個別に調整できる。
 * SUPER_ADMIN はガード側で常にバイパスされるため全権限を持つ。
 */
export const ROLE_PRESETS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: ALL_PERMISSIONS,
  [UserRole.TENANT_ADMIN]: ALL_PERMISSIONS.filter(
    (permission) => permission !== PERMISSIONS.TENANTS_MANAGE,
  ),
  [UserRole.ADMIN]: ALL_PERMISSIONS.filter(
    (permission) =>
      permission !== PERMISSIONS.TENANTS_MANAGE &&
      permission !== PERMISSIONS.USERS_MANAGE,
  ),
  [UserRole.USER]: [
    PERMISSIONS.CATS_WRITE,
    PERMISSIONS.CARE_WRITE,
    PERMISSIONS.MEDICAL_WRITE,
    PERMISSIONS.BREEDING_WRITE,
  ],
};

/** 不正な文字列を除外して Permission[] に正規化する */
export function sanitizePermissions(values: string[] | undefined | null): Permission[] {
  if (!values) {
    return [];
  }
  return ALL_PERMISSIONS.filter((permission) => values.includes(permission));
}
