import { IsString, IsOptional, IsUUID, Matches } from 'class-validator';

/**
 * シフト一覧取得用クエリDTO
 */
export class GetShiftsQueryDto {
  /**
   * 開始日（YYYY-MM-DD形式）
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '開始日はYYYY-MM-DD形式で指定してください',
  })
  startDate?: string;

  /**
   * 終了日（YYYY-MM-DD形式）
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '終了日はYYYY-MM-DD形式で指定してください',
  })
  endDate?: string;

  /**
   * スタッフIDでフィルタ（任意）
   */
  @IsOptional()
  @IsUUID('4', { message: '有効なスタッフIDを指定してください' })
  staffId?: string;
}
