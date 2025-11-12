/**
 * CSRF トークン管理
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api/v1';

let csrfToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

/**
 * CSRFトークンをバックエンドから取得
 */
export async function getCsrfToken(): Promise<string> {
  // 既にトークンがある場合は再利用
  if (csrfToken) {
    return csrfToken;
  }

  // 既にフェッチ中の場合は同じPromiseを返す（重複リクエスト防止）
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  tokenFetchPromise = fetchCsrfToken();

  try {
    const token = await tokenFetchPromise;
    csrfToken = token;
    return token;
  } finally {
    tokenFetchPromise = null;
  }
}

/**
 * 内部: CSRFトークンをフェッチ
 */
async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Cookieを送信
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data = await response.json() as {
      success: boolean;
      data?: { csrfToken: string };
    };

    if (data.success && data.data?.csrfToken) {
      return data.data.csrfToken;
    }

    throw new Error('Invalid CSRF token response format');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
}

/**
 * CSRFトークンをクリア（ログアウト時など）
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  tokenFetchPromise = null;
}

/**
 * CSRFトークンを強制的に再取得
 */
export async function refreshCsrfToken(): Promise<string> {
  clearCsrfToken();
  return getCsrfToken();
}
