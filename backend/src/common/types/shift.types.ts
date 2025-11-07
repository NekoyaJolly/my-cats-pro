import { Shift, Staff } from '@prisma/client';

/**
 * シフトエンティティ（リレーション含む）
 */
export type ShiftEntity = Shift & {
  staff: Staff;
};

/**
 * シフトレスポンスDTO
 */
export interface ShiftResponseDto {
  id: string;
  staffId: string;
  staffName: string;
  staffColor: string;
  shiftDate: string; // ISO 8601形式
  displayName: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * シフト作成リクエスト（最小実装: スタッフ名をドラッグ&ドロップでカレンダーに配置）
 */
export interface CreateShiftRequest {
  staffId: string;
  shiftDate: string; // YYYY-MM-DD形式
  displayName?: string | null;
  notes?: string | null;
}

/**
 * シフト更新リクエスト
 */
export interface UpdateShiftRequest {
  staffId?: string;
  shiftDate?: string; // YYYY-MM-DD形式
  displayName?: string | null;
  notes?: string | null;
  status?: string;
}

/**
 * シフト一覧取得クエリパラメータ
 */
export interface GetShiftsQuery {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  staffId?: string;
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
