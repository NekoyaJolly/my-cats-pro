import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * ユーザー招待 DTO
 * 
 * SUPER_ADMIN: 任意のテナントに TENANT_ADMIN / ADMIN / USER を招待可能
 * TENANT_ADMIN: 自テナントにのみ ADMIN / USER を招待可能
 */
export class InviteUserDto {
  @ApiProperty({ 
    description: '招待するメールアドレス', 
    example: 'user@example.com' 
  })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @ApiProperty({ 
    description: 'ユーザーロール', 
    enum: UserRole,
    example: UserRole.USER 
  })
  @IsEnum(UserRole, { message: '有効なロールを指定してください' })
  role: UserRole;

  @ApiProperty({ 
    description: '招待先テナント ID', 
    example: '123e4567-e89b-12d3-a456-426614174000' 
  })
  @IsUUID('4', { message: '有効なテナント ID を指定してください' })
  @IsNotEmpty({ message: 'テナント ID は必須です' })
  tenantId: string;
}
