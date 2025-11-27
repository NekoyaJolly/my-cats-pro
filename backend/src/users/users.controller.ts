import { 
  Controller, 
  Get, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

import { UsersService } from './users.service';

/**
 * ユーザー管理コントローラ
 * 
 * ユーザー一覧取得などのエンドポイントを提供します。
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * ユーザー一覧取得
   * 
   * - SUPER_ADMIN: 全テナントのユーザーを取得可能（tenantId でフィルタ可能）
   * - TENANT_ADMIN: 自テナントのユーザーのみ取得可能
   */
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'ユーザー一覧取得',
    description: 'SUPER_ADMINは全ユーザー、TENANT_ADMINは自テナントのユーザーを取得します。' 
  })
  @ApiQuery({ 
    name: 'tenantId', 
    required: false, 
    description: 'テナント ID でフィルタ（SUPER_ADMIN のみ有効）' 
  })
  @ApiResponse({ status: 200, description: 'ユーザー一覧を返却' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  async listUsers(
    @GetUser() user: RequestUser,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.usersService.listUsers(user, tenantId);
  }
}
