import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn } from 'class-validator';

import { ALL_PERMISSIONS, type Permission } from '../../auth/permissions';

/**
 * ユーザー権限更新DTO
 */
export class UpdateUserPermissionsDto {
  @ApiProperty({
    description: '付与する権限の配列（機能ドメイン単位）',
    enum: ALL_PERMISSIONS,
    isArray: true,
    example: ['cats:write', 'care:write'],
  })
  @IsArray()
  @IsIn(ALL_PERMISSIONS, { each: true })
  permissions!: Permission[];
}
