import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsArray, IsEnum, IsIn, IsOptional } from 'class-validator';

import { ALL_PERMISSIONS } from '../../auth/permissions';

/**
 * ユーザーロール変更 DTO
 * 
 * SUPER_ADMIN: 任意のユーザーのロールを変更可能（自分自身とSUPER_ADMIN降格は不可）
 * TENANT_ADMIN: 自テナントの ADMIN ↔ USER のみ変更可能
 */
export class UpdateUserRoleDto {
  @ApiProperty({ 
    description: '新しいロール', 
    enum: UserRole,
    example: UserRole.ADMIN 
  })
  @IsEnum(UserRole, { message: '有効なロールを指定してください' })
  role: UserRole;

  @ApiPropertyOptional({
    description: '個別権限（未指定時はロールのプリセットを適用）',
    enum: ALL_PERMISSIONS,
    isArray: true,
    example: ['cats:write', 'care:write'],
  })
  @IsOptional()
  @IsArray()
  @IsIn(ALL_PERMISSIONS, { each: true })
  permissions?: string[];
}
