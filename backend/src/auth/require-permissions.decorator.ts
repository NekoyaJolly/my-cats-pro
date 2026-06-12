import { SetMetadata } from "@nestjs/common";

import type { Permission } from "./permissions";

export const PERMISSIONS_KEY = "required_permissions";

/**
 * エンドポイントに必要な権限を宣言するデコレータ
 *
 * 使用例: `@RequirePermissions(PERMISSIONS.STAFF_MANAGE)`
 * PermissionsGuard と組み合わせて使用する（SUPER_ADMIN は常にバイパス）。
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
