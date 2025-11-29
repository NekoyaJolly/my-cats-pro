import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * プロフィール更新 DTO
 * 
 * 認証されたユーザーが自身のプロフィール情報を更新するためのDTO
 * すべてのフィールドはオプショナル（更新したいフィールドのみ送信可能）
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: '名',
    example: '太郎',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '名は文字列で入力してください' })
  @MaxLength(100, { message: '名は100文字以内で入力してください' })
  firstName?: string;

  @ApiPropertyOptional({
    description: '姓',
    example: '山田',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: '姓は文字列で入力してください' })
  @MaxLength(100, { message: '姓は100文字以内で入力してください' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'メールアドレス',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email?: string;
}
