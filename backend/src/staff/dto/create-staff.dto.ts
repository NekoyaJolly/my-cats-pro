import { IsString, IsEmail, IsOptional, IsBoolean, IsUUID, IsNotEmpty, Matches, IsArray, IsIn, ValidateNested, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 勤務時間テンプレートDTO
 */
export class WorkTimeTemplateDto {
  @IsInt({ message: '開始時間は整数で指定してください' })
  @Min(0, { message: '開始時間は0以上で指定してください' })
  @Max(23, { message: '開始時間は23以下で指定してください' })
  startHour: number;

  @IsInt({ message: '終了時間は整数で指定してください' })
  @Min(1, { message: '終了時間は1以上で指定してください' })
  @Max(24, { message: '終了時間は24以下で指定してください' })
  endHour: number;
}

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

  /**
   * 出勤曜日（任意）
   * ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] の配列
   */
  @IsOptional()
  @IsArray()
  @IsIn(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], { each: true })
  workingDays?: string[] | null;

  /**
   * 勤務時間テンプレート（任意）
   */
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkTimeTemplateDto)
  workTimeTemplate?: WorkTimeTemplateDto | null;
}
