import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID, IsNotEmpty, Matches } from 'class-validator';

/**
 * スタッフ作成DTO
 * 最小実装: 名前のみ必須、Emailは不要
 */
export class CreateStaffDto {
  /**
   * スタッフ名（必須）
   */
  @IsString()
  @IsNotEmpty({ message: '名前は必須です' })
  name: string;

  /**
   * メールアドレス（任意、設定する場合は有効なメールアドレス）
   */
  @IsOptional()
  @IsEmail({}, { message: '有効なメールアドレスを入力してください' })
  email?: string | null;

  /**
   * 役職（任意、デフォルト: "スタッフ"）
   */
  @IsOptional()
  @IsString()
  role?: string;

  /**
   * カレンダー表示色（任意、デフォルト: "#4dabf7"）
   * 16進数カラーコード形式
   */
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'カラーコードは#000000形式で指定してください',
  })
  color?: string;

  /**
   * ユーザーID（システム内部用、通常は使用しない）
   */
  @IsOptional()
  @IsUUID()
  userId?: string;

  /**
   * 有効フラグ（任意、デフォルト: true）
   */
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
