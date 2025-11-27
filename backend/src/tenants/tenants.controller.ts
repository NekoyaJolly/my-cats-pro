import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { TenantScopedGuard } from '../common/guards/tenant-scoped.guard';

import { 
  InviteTenantAdminDto, 
  InviteUserDto, 
  CompleteInvitationDto 
} from './dto/invitation.dto';
import { TenantsService } from './tenants.service';

/**
 * テナント管理コントローラ
 * 
 * テナント作成、ユーザー招待、招待完了のエンドポイントを提供します。
 */
@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * SuperAdmin がテナント管理者を招待
   */
  @Post('invite-admin')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'テナント管理者を招待',
    description: 'SuperAdminのみが実行可能。新しいテナントを作成し、管理者を招待します。' 
  })
  @ApiResponse({ status: 201, description: '招待が正常に作成されました' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 409, description: 'メールアドレスまたはスラッグが既に使用されています' })
  async inviteTenantAdmin(@Body() dto: InviteTenantAdminDto) {
    return this.tenantsService.inviteTenantAdmin(dto);
  }

  /**
   * テナント管理者がユーザーを招待
   */
  @Post(':tenantId/users/invite')
  @UseGuards(JwtAuthGuard, RoleGuard, TenantScopedGuard)
  @Roles(UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'ユーザーを招待',
    description: 'テナント管理者が自分のテナントにユーザーを招待します。' 
  })
  @ApiResponse({ status: 201, description: '招待が正常に作成されました' })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async inviteUser(
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.tenantsService.inviteUser(tenantId, dto);
  }

  /**
   * 招待完了（トークンでユーザー登録）
   */
  @Post('complete-invitation')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '招待完了',
    description: '招待トークンを使用してユーザー登録を完了します。認証不要。' 
  })
  @ApiResponse({ status: 201, description: 'ユーザー登録が完了しました' })
  @ApiResponse({ status: 400, description: '不正なリクエストまたは無効なトークン' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async completeInvitation(@Body() dto: CompleteInvitationDto) {
    return this.tenantsService.completeInvitation(dto);
  }
}
