import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, Matches } from 'class-validator';

/**
 * テナント作成DTO
 */
export class CreateTenantDto {
  @ApiProperty({
    description: 'テナント名',
    example: 'サンプルテナント',
  })
  @IsString()
  @IsNotEmpty({ message: 'テナント名は必須です' })
  @MaxLength(100, { message: 'テナント名は100文字以内で入力してください' })
  name: string;

  @ApiPropertyOptional({
    description: 'テナントスラッグ（未入力の場合は自動生成）',
    example: 'sample-tenant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'スラッグは100文字以内で入力してください' })
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'スラッグは半角英小文字または数字で始まり、ハイフンで区切ることができます（連続・先頭・末尾のハイフンは不可）' })
  slug?: string;
}
