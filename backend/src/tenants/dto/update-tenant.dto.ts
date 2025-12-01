import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, Matches } from 'class-validator';

/**
 * テナント更新DTO
 */
export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'テナント名',
    example: '更新後テナント名',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'テナント名は100文字以内で入力してください' })
  name?: string;

  @ApiPropertyOptional({
    description: 'テナントスラッグ',
    example: 'updated-tenant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'スラッグは100文字以内で入力してください' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'スラッグは半角英小文字または数字で始まり、ハイフンで区切ることができます' })
  slug?: string;

  @ApiPropertyOptional({
    description: '有効/無効フラグ',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
