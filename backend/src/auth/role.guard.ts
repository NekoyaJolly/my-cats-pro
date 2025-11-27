import { Injectable, CanActivate, ExecutionContext, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import type { UserRole, RequestUser } from "./auth.types";

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
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
