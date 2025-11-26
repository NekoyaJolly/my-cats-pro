import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

/**
 * SuperAdmin がテナント管理者を招待するための DTO
 */
export class InviteTenantAdminDto {
  @ApiProperty({ description: '招待するメールアドレス', example: 'admin@example.com' })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @ApiProperty({ description: 'テナント名', example: 'Sample Tenant' })
  @IsString()
  @IsNotEmpty({ message: 'テナント名は必須です' })
  @MinLength(2, { message: 'テナント名は2文字以上である必要があります' })
  @MaxLength(100, { message: 'テナント名は100文字以内で入力してください' })
  tenantName: string;

  @ApiProperty({ 
    description: 'テナントスラッグ（URL識別子）', 
    example: 'sample-tenant',
    required: false 
  })
  @IsString()
  @MinLength(2, { message: 'スラッグは2文字以上である必要があります' })
  @MaxLength(50, { message: 'スラッグは50文字以内で入力してください' })
  tenantSlug?: string;
}

/**
 * テナント管理者がユーザーを招待するための DTO
 */
export class InviteUserDto {
  @ApiProperty({ description: '招待するメールアドレス', example: 'user@example.com' })
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  @IsNotEmpty({ message: 'メールアドレスは必須です' })
  email: string;

  @ApiProperty({ 
    description: 'ユーザーロール', 
    enum: UserRole,
    default: UserRole.USER 
  })
  @IsEnum(UserRole, { message: '有効なロールを指定してください' })
  role: UserRole;
}

/**
 * 招待トークンでユーザー登録を完了するための DTO
 */
export class CompleteInvitationDto {
  @ApiProperty({ description: '招待トークン' })
  @IsString()
  @IsNotEmpty({ message: 'トークンは必須です' })
  token: string;

  @ApiProperty({ description: 'パスワード', minLength: 8 })
  @IsString()
  @IsNotEmpty({ message: 'パスワードは必須です' })
  @MinLength(8, { message: 'パスワードは8文字以上である必要があります' })
  password: string;

  @ApiProperty({ description: '名', required: false })
  @IsString()
  firstName?: string;

  @ApiProperty({ description: '姓', required: false })
  @IsString()
  lastName?: string;
}
