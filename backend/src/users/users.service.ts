import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

/**
 * ユーザー管理サービス
 * 
 * マルチテナント環境でのユーザー一覧取得機能を提供します。
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ユーザー一覧を取得
   * 
   * - SUPER_ADMIN: 全テナントのユーザーを取得可能
   * - TENANT_ADMIN: 自テナントのユーザーのみ取得可能
   * 
   * @param currentUser 現在のユーザー情報
   * @param tenantId フィルタするテナント ID（オプション）
   * @returns ユーザー一覧
   */
  async listUsers(currentUser: RequestUser, tenantId?: string) {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      const users = await this.prisma.user.findMany({
        where: tenantId ? { tenantId } : undefined,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log({
        message: 'Users listed by SUPER_ADMIN',
        userId: currentUser.userId,
        tenantId: tenantId ?? 'all',
        count: users.length,
      });

      return {
        success: true,
        data: users,
        count: users.length,
      };
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // 自テナントのユーザーのみ取得可能
      const userTenantId = currentUser.tenantId;

      if (!userTenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 他のテナント ID が指定された場合はエラー
      if (tenantId && tenantId !== userTenantId) {
        throw new ForbiddenException('他のテナントのユーザー一覧にはアクセスできません');
      }

      const users = await this.prisma.user.findMany({
        where: { tenantId: userTenantId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          tenantId: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log({
        message: 'Users listed by TENANT_ADMIN',
        userId: currentUser.userId,
        tenantId: userTenantId,
        count: users.length,
      });

      return {
        success: true,
        data: users,
        count: users.length,
      };
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザー一覧の取得権限がありません');
  }
}
