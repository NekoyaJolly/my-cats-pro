/**
 * APIレスポンス型（バックエンドと完全一致）
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  timestamp: string;
}

/**
 * 曜日型
 */
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/**
 * 出勤時間テンプレート
 */
export interface WorkTimeTemplate {
  startHour: number; // 0–23
  endHour: number; // 1–24, must be > startHour
}

/**
 * スタッフレスポンスDTO
 */
export interface StaffResponseDto {
  id: string;
  name: string;
  email: string | null;
  role: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  workingDays?: Weekday[];
  workTimeTemplate?: WorkTimeTemplate | null;
}

/**
 * スタッフ一覧レスポンス
 */
export interface StaffListResponseDto {
  staffList: StaffResponseDto[];
  total: number;
}

/**
 * スタッフ作成リクエスト
 */
export interface CreateStaffRequest {
  name: string;
  email?: string | null;
  role?: string;
  color?: string;
  workingDays?: Weekday[];
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
  workingDays?: Weekday[];
  workTimeTemplate?: WorkTimeTemplate | null;
}

/**
 * シフトレスポンスDTO
 */
export interface ShiftResponseDto {
  id: string;
  staffId: string;
  staffName: string;
  staffColor: string;
  shiftDate: string; // YYYY-MM-DD
  displayName: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * シフト作成リクエスト
 */
export interface CreateShiftRequest {
  staffId: string;
  shiftDate: string; // YYYY-MM-DD
  displayName?: string | null;
  notes?: string | null;
}

/**
 * シフト更新リクエスト
 */
export interface UpdateShiftRequest {
  staffId?: string;
  shiftDate?: string; // YYYY-MM-DD
  displayName?: string | null;
  notes?: string | null;
  status?: string;
}

/**
 * カレンダー用シフトイベント
 */
export interface CalendarShiftEvent {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string;   // ISO 8601
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    shiftId: string;
    staffId: string;
    staffName: string;
    displayName: string | null;
    notes: string | null;
  };
}
