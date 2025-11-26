import { randomBytes, randomUUID } from 'crypto';

import { 
  Injectable, 
  BadRequestException, 
  NotFoundException,
  ConflictException,
  Logger 
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { PasswordService } from '../auth/password.service';
import { PrismaService } from '../prisma/prisma.service';

import { 
  InviteTenantAdminDto, 
  InviteUserDto, 
  CompleteInvitationDto 
} from './dto/invitation.dto';

/**
 * テナント管理サービス
 * 
 * マルチテナント環境でのテナント作成、ユーザー招待、招待完了を管理します。
 */
@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * SuperAdmin がテナント管理者を招待
   * 
   * 新しいテナントを作成し、管理者招待トークンを生成します。
   */
  async inviteTenantAdmin(dto: InviteTenantAdminDto): Promise<{
    success: true;
    tenantId: string;
    invitationToken: string;
    message: string;
  }> {
    const email = dto.email.trim().toLowerCase();

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // テナントスラッグの生成（未指定の場合）
    const slug = dto.tenantSlug || this.generateSlug(dto.tenantName);

    // スラッグの重複チェック
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      throw new ConflictException('このスラッグは既に使用されています');
    }

    // トランザクションでテナントと招待トークンを作成
    const result = await this.prisma.$transaction(async (tx) => {
      // テナント作成
      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug,
          isActive: true,
        },
      });

      // 招待トークン生成（有効期限: 7日間）
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await tx.invitationToken.create({
        data: {
          email,
          token,
          role: UserRole.TENANT_ADMIN,
          tenantId: tenant.id,
          expiresAt,
        },
      });

      return { tenant, invitation };
    });

    this.logger.log({
      message: 'Tenant admin invitation created',
      tenantId: result.tenant.id,
      email,
      timestamp: new Date().toISOString(),
    });

    // TODO: メール送信実装
    // 開発環境ではコンソールにトークンを出力
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Invitation token for ${email}: ${result.invitation.token}`);
      this.logger.log(`Invitation URL: http://localhost:3000/accept-invitation?token=${result.invitation.token}`);
    }

    return {
      success: true,
      tenantId: result.tenant.id,
      invitationToken: result.invitation.token,
      message: '招待メールを送信しました',
    };
  }

  /**
   * テナント管理者がユーザーを招待
   */
  async inviteUser(
    tenantId: string,
    dto: InviteUserDto,
  ): Promise<{
    success: true;
    invitationToken: string;
    message: string;
  }> {
    const email = dto.email.trim().toLowerCase();

    // テナントの存在確認
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('テナントが見つかりません');
    }

    if (!tenant.isActive) {
      throw new BadRequestException('このテナントは無効化されています');
    }

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // TENANT_ADMIN は招待できない（SUPER_ADMIN のみ可能）
    if (dto.role === UserRole.TENANT_ADMIN || dto.role === UserRole.SUPER_ADMIN) {
      throw new BadRequestException('テナント管理者またはスーパー管理者を招待することはできません');
    }

    // 招待トークン生成（有効期限: 7日間）
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitationToken.create({
      data: {
        email,
        token,
        role: dto.role,
        tenantId,
        expiresAt,
      },
    });

    this.logger.log({
      message: 'User invitation created',
      tenantId,
      email,
      role: dto.role,
      timestamp: new Date().toISOString(),
    });

    // TODO: メール送信実装
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`Invitation token for ${email}: ${invitation.token}`);
      this.logger.log(`Invitation URL: http://localhost:3000/accept-invitation?token=${invitation.token}`);
    }

    return {
      success: true,
      invitationToken: invitation.token,
      message: '招待メールを送信しました',
    };
  }

  /**
   * 招待トークンでユーザー登録を完了
   */
  async completeInvitation(dto: CompleteInvitationDto): Promise<{
    success: true;
    userId: string;
    tenantId: string;
    access_token: string;
    message: string;
  }> {
    // トークンの検証
    const invitation = await this.prisma.invitationToken.findUnique({
      where: { token: dto.token },
      include: { tenant: true },
    });

    if (!invitation) {
      throw new BadRequestException('無効な招待トークンです');
    }

    // トークンの使用済みチェック
    if (invitation.usedAt) {
      throw new BadRequestException('この招待トークンは既に使用されています');
    }

    // トークンの有効期限チェック
    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('招待トークンの有効期限が切れています');
    }

    // テナントの有効性チェック
    if (!invitation.tenant.isActive) {
      throw new BadRequestException('このテナントは無効化されています');
    }

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      throw new ConflictException('このメールアドレスは既に使用されています');
    }

    // パスワード強度チェック
    const validation = this.passwordService.validatePasswordStrength(dto.password);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'パスワードが要件を満たしていません',
        errors: validation.errors,
      });
    }

    // パスワードハッシュ化
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // トランザクションでユーザー作成と招待トークン使用済みマーク
    const result = await this.prisma.$transaction(async (tx) => {
      // ユーザー作成
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash,
          role: invitation.role,
          tenantId: invitation.tenantId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          clerkId: `local_${randomUUID()}`,
          isActive: true,
          failedLoginAttempts: 0,
        },
      });

      // 招待トークンを使用済みにマーク
      await tx.invitationToken.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      return user;
    });

    this.logger.log({
      message: 'Invitation completed, user created',
      userId: result.id,
      tenantId: result.tenantId,
      email: result.email,
      role: result.role,
      timestamp: new Date().toISOString(),
    });

    // TODO: JWT トークン生成（auth.service と統合する場合）
    // 現時点では簡易的なトークンを返す
    const mockToken = `mock_token_${result.id}`;

    return {
      success: true,
      userId: result.id,
      tenantId: result.tenantId!,
      access_token: mockToken,
      message: 'ユーザー登録が完了しました',
    };
  }

  /**
   * テナント名からスラッグを生成
   * 
   * @private
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // 英数字とスペース、ハイフンのみ
      .replace(/\s+/g, '-') // スペースをハイフンに
      .replace(/-+/g, '-') // 連続するハイフンを1つに
      .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
  }
}
