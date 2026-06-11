import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";

import type { RequestUser } from "./auth.types";
import { PERMISSION_LABELS, type Permission } from "./permissions";
import { PERMISSIONS_KEY } from "./require-permissions.decorator";

/**
 * 権限（Permission）ベースのアクセス制御ガード
 *
 * - `@RequirePermissions(...)` が付いていないエンドポイントは素通し
 * - SUPER_ADMIN は常に許可（全権限保持として扱う）
 * - 権限不足時は必要な権限名を含む日本語メッセージで 403 を返す
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const authDisabled =
      process.env.AUTH_DISABLED === "YES" ||
      process.env.AUTH_DISABLED === "true" ||
      process.env.AUTH_DISABLED === "1";

    if (authDisabled) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();

    if (!user) {
      this.logger.warn({
        message: "アクセス拒否: ユーザー情報がありません",
        requiredPermissions,
        reason: "user_not_found",
      });
      throw new ForbiddenException("この操作を行う権限がありません");
    }

    // SUPER_ADMIN は常に全権限を持つ
    if (user.role === "SUPER_ADMIN") {
      return true;
    }

    const userPermissions = user.permissions ?? [];
    const missing = requiredPermissions.filter(
      (permission) => !userPermissions.includes(permission),
    );

    if (missing.length > 0) {
      this.logger.warn({
        message: "アクセス拒否: 権限が不足しています",
        userId: user.userId,
        userRole: user.role,
        requiredPermissions,
        missing,
        reason: "permission_missing",
      });
      const missingLabels = missing
        .map((permission) => PERMISSION_LABELS[permission] ?? permission)
        .join("、");
      throw new ForbiddenException(
        `この操作を行う権限がありません（必要な権限: ${missingLabels}）`,
      );
    }

    return true;
  }
}
