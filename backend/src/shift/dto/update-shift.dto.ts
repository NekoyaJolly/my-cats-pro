import { ShiftStatus } from '@prisma/client';
import {
  IsString,
  IsUUID,
  IsOptional,
  Matches,
  IsEnum,
} from 'class-validator';

/**
 * シフト更新DTO
 */
export class UpdateShiftDto {
  /**
   * スタッフID（変更する場合）
   */
  @IsOptional()
  @IsUUID('4', { message: '有効なスタッフIDを指定してください' })
  staffId?: string;

  /**
   * シフト日付（変更する場合、YYYY-MM-DD形式）
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'シフト日付はYYYY-MM-DD形式で指定してください',
  })
  shiftDate?: string;

  /**
   * 表示名
   */
  @IsOptional()
  @IsString()
  displayName?: string | null;

  /**
   * 備考
   */
  @IsOptional()
  @IsString()
  notes?: string | null;

  /**
   * シフトステータス
   */
  @IsOptional()
  @IsEnum(ShiftStatus, { message: '有効なシフトステータスを指定してください' })
  status?: ShiftStatus;
}
