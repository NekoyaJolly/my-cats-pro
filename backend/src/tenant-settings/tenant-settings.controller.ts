import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import type { RequestUser } from '../auth/auth.types';
import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Roles } from '../auth/roles.decorator';

import { TagColorDefaultsDto, UpdateTagColorDefaultsDto } from './dto/tag-color-defaults.dto';
import { TenantSettingsService } from './tenant-settings.service';

/**
 * テナント設定コントローラ
 * 
 * テナント単位の各種設定を管理するエンドポイントを提供します。
 * 現在はタグカラーのデフォルト設定をサポートしています。
 */
@ApiTags('tenant-settings')
@Controller('tenant-settings')
@UseGuards(JwtAuthGuard, RoleGuard)
@ApiBearerAuth()
export class TenantSettingsController {
  constructor(private readonly tenantSettingsService: TenantSettingsService) {}

  /**
   * タグカラーデフォルト設定を取得
   * 
   * TENANT_ADMIN または USER（自テナントのみ）がアクセス可能
   */
  @Get('tag-color-defaults')
  @Roles(UserRole.TENANT_ADMIN, UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: 'タグカラーデフォルト設定を取得',
    description: 'テナントのタグカラーデフォルト設定を取得します。設定が存在しない場合はフロントエンドのデフォルト値を返します。',
  })
  @ApiResponse({
    status: 200,
    description: 'タグカラーデフォルト設定を返却',
    type: TagColorDefaultsDto,
  })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  async getTagColorDefaults(@GetUser() user: RequestUser): Promise<TagColorDefaultsDto> {
    if (!user.tenantId) {
      throw new BadRequestException('テナント情報が不足しています');
    }
    return this.tenantSettingsService.getTagColorDefaults(user.tenantId);
  }

  /**
   * タグカラーデフォルト設定を更新
   * 
   * TENANT_ADMIN（自テナントのみ）がアクセス可能
   */
  @Put('tag-color-defaults')
  @Roles(UserRole.TENANT_ADMIN, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'タグカラーデフォルト設定を更新',
    description: 'テナントのタグカラーデフォルト設定を更新します。部分更新をサポートしています。',
  })
  @ApiResponse({
    status: 200,
    description: 'タグカラーデフォルト設定が更新されました',
    type: TagColorDefaultsDto,
  })
  @ApiResponse({ status: 400, description: '不正なリクエスト' })
  @ApiResponse({ status: 401, description: '認証が必要です' })
  @ApiResponse({ status: 403, description: '権限がありません' })
  @ApiResponse({ status: 404, description: 'テナントが見つかりません' })
  async updateTagColorDefaults(
    @GetUser() user: RequestUser,
    @Body() dto: UpdateTagColorDefaultsDto,
  ): Promise<TagColorDefaultsDto> {
    if (!user.tenantId) {
      throw new BadRequestException('テナント情報が不足しています');
    }
    return this.tenantSettingsService.updateTagColorDefaults(user.tenantId, dto);
  }
}
