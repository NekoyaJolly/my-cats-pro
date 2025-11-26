import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { RequestUser } from '../../auth/auth.types';

/**
 * テナントスコープガード
 * 
 * リクエストのテナントIDとユーザーのテナントIDが一致することを確認します。
 * SUPER_ADMINはすべてのテナントにアクセス可能です。
 */
@Injectable()
export class TenantScopedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser; params?: Record<string, string>; body?: Record<string, unknown> }>();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('認証が必要です');
    }

    // SUPER_ADMIN は全テナントにアクセス可能
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // リクエストからテナントIDを取得（優先順位: params > body）
    const requestTenantId = request.params?.tenantId || request.body?.tenantId;

    // テナントIDが指定されていない場合はアクセス拒否
    if (!requestTenantId) {
      throw new ForbiddenException('テナントIDが指定されていません');
    }

    // ユーザーのテナントIDと一致しない場合はアクセス拒否
    if (user.tenantId !== requestTenantId) {
      throw new ForbiddenException('このテナントへのアクセス権限がありません');
    }

    return true;
  }
}
