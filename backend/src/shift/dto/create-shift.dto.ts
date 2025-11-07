import {
  IsString,
  IsUUID,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

/**
 * シフト作成DTO（最小実装）
 * ドラッグ&ドロップでスタッフをカレンダーに配置する際に使用
 */
export class CreateShiftDto {
  /**
   * スタッフID（必須）
   */
  @IsUUID('4', { message: '有効なスタッフIDを指定してください' })
  @IsNotEmpty({ message: 'スタッフIDは必須です' })
  staffId: string;

  /**
   * シフト日付（必須、YYYY-MM-DD形式）
   */
  @IsString()
  @IsNotEmpty({ message: 'シフト日付は必須です' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'シフト日付はYYYY-MM-DD形式で指定してください',
  })
  shiftDate: string;

  /**
   * 表示名（任意、指定しない場合はスタッフ名を使用）
   */
  @IsOptional()
  @IsString()
  displayName?: string | null;

  /**
   * 備考（任意）
   */
  @IsOptional()
  @IsString()
  notes?: string | null;
}
