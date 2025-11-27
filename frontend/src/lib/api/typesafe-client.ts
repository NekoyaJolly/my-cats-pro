import {
  ApiResponse,
  StaffResponseDto,
  StaffListResponseDto,
  CreateStaffRequest,
  UpdateStaffRequest,
  ShiftResponseDto,
  CreateShiftRequest,
  UpdateShiftRequest,
  CalendarShiftEvent,
} from '@/types/api.types';

/**
 * APIベースURL（環境変数から取得、既に/api/v1を含んでいる想定）
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 型安全なAPIクライアント
 */
class TypeSafeApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * fetchラッパー（型安全）
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = (options?.method ?? 'GET').toUpperCase();
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (options?.headers) {
      const incomingHeaders = new Headers(options.headers);
      incomingHeaders.forEach((value, key) => headers.set(key, value));
    }

    const requestInit: RequestInit = {
      ...options,
      method,
      headers,
      credentials: options?.credentials ?? 'include',
    };

    try {
      const response = await fetch(url, requestInit);

      const data = await response.json() as ApiResponse<T>;

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP Error ${response.status}`,
          response.status,
          data.details,
        );
      }

      if (!data.success) {
        throw new ApiError(
          data.error || 'API request failed',
          response.status,
          data.details,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }

  private ensureResponseData<T>(response: ApiResponse<T>, errorMessage: string): T {
    if (response.data === undefined || response.data === null) {
      throw new ApiError(errorMessage);
    }

    return response.data;
  }

  // ==========================================
  // Staff API
  // ==========================================

  /**
   * スタッフ一覧を取得
   */
  async getStaffList(): Promise<StaffListResponseDto> {
    const response = await this.request<StaffListResponseDto>(`/staff`);
    return this.ensureResponseData(response, 'スタッフ一覧の取得に失敗しました');
  }

  /**
   * 指定IDのスタッフを取得
   */
  async getStaff(id: string): Promise<StaffResponseDto> {
    const response = await this.request<StaffResponseDto>(`/staff/${id}`);
    return this.ensureResponseData(response, 'スタッフ情報の取得に失敗しました');
  }

  /**
   * スタッフを作成
   */
  async createStaff(data: CreateStaffRequest): Promise<StaffResponseDto> {
    const response = await this.request<StaffResponseDto>(`/staff`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.ensureResponseData(response, 'スタッフの作成に失敗しました');
  }

  /**
   * スタッフを更新
   */
  async updateStaff(id: string, data: UpdateStaffRequest): Promise<StaffResponseDto> {
    const response = await this.request<StaffResponseDto>(`/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return this.ensureResponseData(response, 'スタッフの更新に失敗しました');
  }

  /**
   * スタッフを削除（論理削除）
   */
  async deleteStaff(id: string): Promise<StaffResponseDto> {
    const response = await this.request<StaffResponseDto>(`/staff/${id}`, {
      method: 'DELETE',
    });
    return this.ensureResponseData(response, 'スタッフの削除に失敗しました');
  }

  // ==========================================
  // Shift API
  // ==========================================

  /**
   * シフト一覧を取得
   */
  async getShifts(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: string;
  }): Promise<ShiftResponseDto[]> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.staffId) searchParams.set('staffId', params.staffId);

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/shifts?${queryString}` : '/shifts';

    const response = await this.request<ShiftResponseDto[]>(endpoint);
    return this.ensureResponseData(response, 'シフト一覧の取得に失敗しました');
  }

  /**
   * カレンダー用シフトデータを取得
   */
  async getCalendarShifts(params: {
    startDate: string;
    endDate: string;
    staffId?: string;
  }): Promise<CalendarShiftEvent[]> {
    const searchParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    if (params.staffId) {
      searchParams.set('staffId', params.staffId);
    }

    const response = await this.request<CalendarShiftEvent[]>(
      `/shifts/calendar?${searchParams.toString()}`,
    );
    return this.ensureResponseData(response, 'カレンダーシフトの取得に失敗しました');
  }

  /**
   * 指定IDのシフトを取得
   */
  async getShift(id: string): Promise<ShiftResponseDto> {
    const response = await this.request<ShiftResponseDto>(`/shifts/${id}`);
    return this.ensureResponseData(response, 'シフト情報の取得に失敗しました');
  }

  /**
   * シフトを作成
   */
  async createShift(data: CreateShiftRequest): Promise<ShiftResponseDto> {
    const response = await this.request<ShiftResponseDto>(`/shifts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return this.ensureResponseData(response, 'シフトの作成に失敗しました');
  }

  /**
   * シフトを更新
   */
  async updateShift(id: string, data: UpdateShiftRequest): Promise<ShiftResponseDto> {
    const response = await this.request<ShiftResponseDto>(`/shifts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return this.ensureResponseData(response, 'シフトの更新に失敗しました');
  }

  /**
   * シフトを削除
   */
  async deleteShift(id: string): Promise<void> {
    await this.request<{ id: string }>(`/shifts/${id}`, {
      method: 'DELETE',
    });
  }
}

/**
 * 型安全なAPIクライアントインスタンス
 */
export const apiClient = new TypeSafeApiClient(API_BASE_URL);
