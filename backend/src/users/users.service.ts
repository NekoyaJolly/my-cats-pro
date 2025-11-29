import { randomBytes } from 'crypto';

import { 
  Injectable, 
  Logger, 
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';

import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

/** 招待トークンのバイトサイズ */
const INVITATION_TOKEN_BYTES = 32;
/** 招待トークンの有効期限（日数） */
const INVITATION_EXPIRY_DAYS = 7;

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
   * 指定されたロールが高権限ロール（SUPER_ADMIN, TENANT_ADMIN）かどうかをチェック
   * 
   * @private
   */
  private isPrivilegedRole(role: UserRole): boolean {
    return role === UserRole.SUPER_ADMIN || role === UserRole.TENANT_ADMIN;
  }

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
    // トランザクションで競合状態を防止
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const superAdminCount = await tx.user.count({
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

      return tx.user.update({
        where: { id: currentUser.userId },
        data: { role: UserRole.SUPER_ADMIN },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });
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

  /**
   * ユーザー招待
   * 
   * 権限チェックルール:
   * - SUPER_ADMIN: 任意のテナントに TENANT_ADMIN / ADMIN / USER を招待可能
   * - TENANT_ADMIN: 自テナント (currentUser.tenantId === dto.tenantId) にのみ ADMIN / USER を招待可能
   *   - SUPER_ADMIN, TENANT_ADMIN ロールへの招待は ForbiddenException
   * 
   * @param currentUser 現在のユーザー情報
   * @param dto 招待情報
   * @returns 招待トークン情報
   */
  async inviteUser(
    currentUser: RequestUser,
    dto: InviteUserDto,
  ): Promise<{
    success: true;
    invitationToken: string;
    tenantId: string;
    message: string;
  }> {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    const email = dto.email.trim().toLowerCase();

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // SUPER_ADMIN は任意のテナントに任意のロールを招待可能
      return this.createInvitation(email, dto.role, dto.tenantId, currentUser);
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // テナントに所属していない場合はエラー
      if (!currentUser.tenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 他のテナントへの招待は禁止
      if (currentUser.tenantId !== dto.tenantId) {
        throw new ForbiddenException('他のテナントにユーザーを招待することはできません');
      }

      // SUPER_ADMIN, TENANT_ADMIN ロールへの招待は禁止
      if (this.isPrivilegedRole(dto.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN を招待する権限がありません');
      }

      return this.createInvitation(email, dto.role, dto.tenantId, currentUser);
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザー招待の権限がありません');
  }

  /**
   * 招待トークンを作成する内部メソッド
   * 
   * @private
   */
  private async createInvitation(
    email: string,
    role: UserRole,
    tenantId: string,
    currentUser: RequestUser,
  ): Promise<{
    success: true;
    invitationToken: string;
    tenantId: string;
    message: string;
  }> {
    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('指定されたテナントが見つかりません');
    }

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // 招待トークン生成
    const token = randomBytes(INVITATION_TOKEN_BYTES).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await this.prisma.invitationToken.create({
      data: {
        email,
        token,
        role,
        tenantId,
        expiresAt,
      },
    });

    this.logger.log({
      message: 'User invitation created',
      tenantId,
      email,
      role,
      invitedBy: currentUser.userId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      invitationToken: invitation.token,
      tenantId,
      message: '招待を作成しました',
    };
  }

  /**
   * ユーザーロール変更
   * 
   * 権限チェックルール:
   * - SUPER_ADMIN:
   *   - 任意のユーザーのロールを変更可能
   *   - ただし、SUPER_ADMIN を SUPER_ADMIN 以外に降格する操作は ForbiddenException
   *   - 自分自身のロール変更も禁止
   * - TENANT_ADMIN:
   *   - 対象ユーザーが自テナント所属であること (user.tenantId === currentUser.tenantId)
   *   - 変更可能なロール: ADMIN ↔ USER のみ
   *   - SUPER_ADMIN, TENANT_ADMIN への変更は ForbiddenException
   *   - SUPER_ADMIN, TENANT_ADMIN のロール変更も ForbiddenException
   * 
   * @param currentUser 現在のユーザー情報
   * @param userId 対象ユーザー ID
   * @param dto 新しいロール情報
   * @returns 更新後のユーザー情報
   */
  async updateUserRole(
    currentUser: RequestUser,
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<{
    success: true;
    data: {
      id: string;
      email: string;
      role: UserRole;
    };
    message: string;
  }> {
    // ロールが設定されていない場合はアクセス拒否
    if (!currentUser.role) {
      throw new ForbiddenException('ユーザーロールが設定されていません');
    }

    // 対象ユーザーの取得
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('指定されたユーザーが見つかりません');
    }

    // SUPER_ADMIN の場合
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // 自分自身のロール変更は禁止
      if (currentUser.userId === userId) {
        throw new ForbiddenException('自分自身のロールを変更することはできません');
      }

      // SUPER_ADMIN を降格することは禁止
      if (targetUser.role === UserRole.SUPER_ADMIN && dto.role !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('SUPER_ADMIN を降格することはできません');
      }

      // ロール更新
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role: dto.role },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      this.logger.log({
        message: 'User role updated by SUPER_ADMIN',
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: dto.role,
        updatedBy: currentUser.userId,
      });

      return {
        success: true,
        data: updatedUser,
        message: 'ロールを更新しました',
      };
    }

    // TENANT_ADMIN の場合
    if (currentUser.role === UserRole.TENANT_ADMIN) {
      // テナントに所属していない場合はエラー
      if (!currentUser.tenantId) {
        throw new ForbiddenException('テナントに所属していません');
      }

      // 対象ユーザーが他テナントの場合はエラー
      if (targetUser.tenantId !== currentUser.tenantId) {
        throw new ForbiddenException('他のテナントのユーザーのロールを変更することはできません');
      }

      // 対象ユーザーが SUPER_ADMIN または TENANT_ADMIN の場合は変更不可
      if (this.isPrivilegedRole(targetUser.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN のロールを変更する権限がありません');
      }

      // SUPER_ADMIN, TENANT_ADMIN への変更は禁止
      if (this.isPrivilegedRole(dto.role)) {
        throw new ForbiddenException('SUPER_ADMIN または TENANT_ADMIN に変更する権限がありません');
      }

      // ロール更新（ADMIN ↔ USER のみ許可）
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { role: dto.role },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      this.logger.log({
        message: 'User role updated by TENANT_ADMIN',
        targetUserId: userId,
        oldRole: targetUser.role,
        newRole: dto.role,
        updatedBy: currentUser.userId,
        tenantId: currentUser.tenantId,
      });

      return {
        success: true,
        data: updatedUser,
        message: 'ロールを更新しました',
      };
    }

    // それ以外のロールの場合はアクセス拒否
    throw new ForbiddenException('ユーザーロール変更の権限がありません');
  }

  /**
   * 認証されたユーザーのプロフィールを取得
   * 
   * @param currentUser 現在のユーザー情報
   * @returns プロフィール情報
   */
  async getProfile(currentUser: RequestUser): Promise<{
    success: true;
    data: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
    };
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    this.logger.log({
      message: 'Profile retrieved',
      userId: user.id,
    });

    return {
      success: true,
      data: user,
    };
  }

  /**
   * 認証されたユーザーのプロフィールを更新
   * 
   * @param currentUser 現在のユーザー情報
   * @param dto 更新するプロフィール情報
   * @returns 更新後のプロフィール情報
   */
  async updateProfile(
    currentUser: RequestUser,
    dto: UpdateProfileDto,
  ): Promise<{
    success: true;
    data: {
      id: string;
      email: string;
      firstName: string | null;
      lastName: string | null;
      role: UserRole;
    };
    message: string;
  }> {
    // 更新対象のフィールドがない場合はエラー
    if (dto.firstName === undefined && dto.lastName === undefined && dto.email === undefined) {
      throw new BadRequestException('更新するフィールドがありません');
    }

    // メールアドレスの変更がある場合は重複チェック
    if (dto.email) {
      const normalizedEmail = dto.email.trim().toLowerCase();
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          NOT: { id: currentUser.userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('このメールアドレスは既に使用されています');
      }
    }

    // 更新データを構築
    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
    } = {};

    if (dto.firstName !== undefined) {
      updateData.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      updateData.lastName = dto.lastName;
    }
    if (dto.email !== undefined) {
      updateData.email = dto.email.trim().toLowerCase();
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: currentUser.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    this.logger.log({
      message: 'Profile updated',
      userId: updatedUser.id,
      updatedFields: Object.keys(updateData),
    });

    return {
      success: true,
      data: updatedUser,
      message: 'プロフィールを更新しました',
    };
  }
}
