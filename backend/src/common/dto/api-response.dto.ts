/**
 * 統一APIレスポンス型
 * 全てのAPIエンドポイントで使用する標準レスポンス形式
 */
export class ApiResponse<T> {
  /**
   * API呼び出しの成功可否
   */
  success: boolean;

  /**
   * レスポンスデータ
   */
  data?: T;

  /**
   * エラーメッセージ（失敗時）
   */
  error?: string;

  /**
   * エラー詳細（失敗時、開発用）
   */
  details?: any;

  /**
   * タイムスタンプ
   */
  timestamp: string;

  constructor(success: boolean, data?: T, error?: string, details?: any) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  /**
   * 成功レスポンスを生成
   */
  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse(true, data);
  }

  /**
   * エラーレスポンスを生成
   */
  static error<T>(error: string, details?: any): ApiResponse<T> {
    return new ApiResponse(false, undefined, error, details);
  }
}

/**
 * ページネーション付きレスポンス
 */
export class PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  constructor(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
  ) {
    super(true, data);
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}
