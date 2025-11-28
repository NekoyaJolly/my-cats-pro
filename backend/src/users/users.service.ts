import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

export interface PromoteToSuperAdminResponse {
  success: true;
  data: {
    id: string;
    email: string;
    role: UserRole;
  };
}

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

  /**
   * 初回 SUPER_ADMIN 昇格
   * 
   * DB 上に SUPER_ADMIN が存在しない場合のみ、現在のユーザーを SUPER_ADMIN に昇格します。
   * 
   * @param currentUser 現在のユーザー情報
   * @returns 昇格後のユーザー情報
   * @throws ForbiddenException SUPER_ADMIN がすでに存在する場合
   */
  async promoteToSuperAdminOnce(currentUser: RequestUser): Promise<PromoteToSuperAdminResponse> {
    const superAdminCount = await this.prisma.user.count({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (superAdminCount > 0) {
      this.logger.warn({
        message: 'promoteToSuperAdminOnce: すでにSUPER_ADMINが存在するため拒否',
        requestedByUserId: currentUser.userId,
        requestedByEmail: currentUser.email,
      });
      throw new ForbiddenException('SUPER_ADMINはすでに存在します');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.userId },
      data: { role: UserRole.SUPER_ADMIN },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    this.logger.log({
      message: 'promoteToSuperAdminOnce: SUPER_ADMINを初回作成',
      userId: updatedUser.id,
      email: updatedUser.email,
    });

    return {
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }
}
