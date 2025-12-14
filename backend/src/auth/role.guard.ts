import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";

import type { UserRole, RequestUser } from "./auth.types";

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 認証不要ルートではロールチェックもしない（開発用の@Public()想定）
    if (isPublic) {
      return true;
    }

    const authDisabled =
      process.env.AUTH_DISABLED === 'YES' ||
      process.env.AUTH_DISABLED === 'true' ||
      process.env.AUTH_DISABLED === '1';

    // AUTH_DISABLED の開発環境ではロールチェックをスキップ
    if (authDisabled) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    
    if (!user) {
      this.logger.warn({
        message: 'アクセス拒否: ユーザー情報がありません',
        requiredRoles,
        reason: 'user_not_found',
      });
      return false;
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      this.logger.warn({
        message: 'アクセス拒否: ロールが不足しています',
        userId: user.userId,
        userRole: user.role,
        requiredRoles,
        reason: 'role_mismatch',
      });
      return false;
    }

    return true;
  }
}
