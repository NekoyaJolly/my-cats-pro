import { 
  Controller, 
  Get, 
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PERMISSIONS } from '../auth/permissions';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';

import { InviteUserDto } from './dto/invite-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
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

  /**
   * 自身のプロフィール取得
   * 
   * JWTで認証されたユーザー自身のプロフィール情報を取得します。
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '自身のプロフィール取得',
    description: 'JWTで認証されたユーザー自身のプロフィール情報を取得します。' 
  })
  @ApiResponse({ status: 200, description: 'プロフィール情報を返却' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async getMe(@GetUser() user: RequestUser) {
    return this.usersService.getProfile(user);
  }

  /**
   * 自身のプロフィール更新
   * 
   * JWTで認証されたユーザー自身のプロフィール情報を更新します。
   * 各フィールドはオプショナル（更新したいフィールドのみ送信可能）。
   * メールアドレスが変更される場合は重複チェックを行います。
   */
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: '自身のプロフィール更新',
    description: 'JWTで認証されたユーザー自身のプロフィール情報を更新します。各フィールドはオプショナルです。' 
  })
  @ApiResponse({ status: 200, description: 'プロフィールが更新されました' })
  @ApiResponse({ status: 400, description: '更新するフィールドがありません' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async updateMe(
    @GetUser() user: RequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user, dto);
  }

  /**
   * ユーザー招待
   * 
   * - SUPER_ADMIN: 任意のテナントに TENANT_ADMIN / ADMIN / USER を招待可能
   * - TENANT_ADMIN: 自テナントにのみ ADMIN / USER を招待可能
   */
  @Post('invite')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'ユーザー招待',
    description: 'SUPER_ADMINは任意のテナント、TENANT_ADMINは自テナントにユーザーを招待します。' 
  })
  @ApiResponse({ status: 201, description: '招待が作成されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  @ApiResponse({ status: 409, description: 'メールアドレスが既に使用されています' })
  async inviteUser(
    @GetUser() user: RequestUser,
    @Body() dto: InviteUserDto,
  ) {
    return this.usersService.inviteUser(user, dto);
  }

  /**
   * ユーザーロール変更
   * 
   * - SUPER_ADMIN: 任意のユーザーのロールを変更可能（自分自身と SUPER_ADMIN 降格は不可）
   * - TENANT_ADMIN: 自テナントの ADMIN ↔ USER のみ変更可能
   */
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'ユーザーロール変更',
    description: 'SUPER_ADMINは任意のユーザー、TENANT_ADMINは自テナントのADMIN/USERのロールを変更します。' 
  })
  @ApiParam({ name: 'id', description: '対象ユーザー ID' })
  @ApiResponse({ status: 200, description: 'ロールが更新されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async updateUserRole(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(user, id, dto);
  }

  /**
   * ユーザー削除
   * 
   * - SUPER_ADMIN: 任意のユーザーを削除可能（自分自身と他の SUPER_ADMIN は削除不可）
   * - TENANT_ADMIN: 自テナントの ADMIN / USER のみ削除可能
   */
  /**
   * ユーザーの個別権限を変更
   */
  @Patch(':id/permissions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'ユーザーの権限を変更',
    description: '付与できるのは自分が保持する権限の範囲内のみ。自分自身の権限は変更できません。',
  })
  @ApiParam({ name: 'id', description: '対象ユーザーID' })
  @ApiResponse({ status: 200, description: '権限を更新しました' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async updateUserPermissions(
    @Param('id') id: string,
    @Body() dto: UpdateUserPermissionsDto,
    @GetUser() user: RequestUser,
  ) {
    return this.usersService.updateUserPermissions(user, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(PERMISSIONS.USERS_MANAGE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'ユーザー削除',
    description: 'SUPER_ADMINは任意のユーザー（自分と他のSUPER_ADMINを除く）、TENANT_ADMINは自テナントのADMIN/USERを削除します。' 
  })
  @ApiParam({ name: 'id', description: '対象ユーザー ID' })
  @ApiResponse({ status: 200, description: 'ユーザーが削除されました' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async deleteUser(
    @GetUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(user, id);
  }
}
