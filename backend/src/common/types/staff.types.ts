import { Staff } from '@prisma/client';

/**
 * 曜日型
 */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * 勤務時間テンプレート
 */
export interface WorkTimeTemplate {
  startHour: number; // 0–23
  endHour: number; // 1–24, must be > startHour
}

/**
 * スタッフエンティティ（DBから取得される完全な型）
 */
export type StaffEntity = Staff;

/**
 * スタッフレスポンスDTO（フロントエンドに返却される型）
 */
export interface StaffResponseDto {
  id: string;
  name: string;
  email: string | null;
  role: string;
  color: string;
  isActive: boolean;
  workingDays: Weekday[] | null;
  workTimeTemplate: WorkTimeTemplate | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * スタッフ作成リクエスト（フロントエンドから受け取る型）
 */
export interface CreateStaffRequest {
  name: string;
  email?: string | null;
  role?: string;
  color?: string;
  workingDays?: Weekday[] | null;
  workTimeTemplate?: WorkTimeTemplate | null;
}

/**
 * スタッフ更新リクエスト
 */
export interface UpdateStaffRequest {
  name?: string;
  email?: string | null;
  role?: string;
  color?: string;
  isActive?: boolean;
  workingDays?: Weekday[] | null;
  workTimeTemplate?: WorkTimeTemplate | null;
}

/**
 * スタッフ一覧レスポンス
 */
export interface StaffListResponseDto {
  staffList: StaffResponseDto[];
  total: number;
}
