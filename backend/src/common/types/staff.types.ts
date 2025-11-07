import { Staff } from '@prisma/client';

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
}

/**
 * スタッフ一覧レスポンス
 */
export interface StaffListResponseDto {
  staffList: StaffResponseDto[];
  total: number;
}
