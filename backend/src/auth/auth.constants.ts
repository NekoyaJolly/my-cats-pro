// Authentication related constants (cookie names, lifetimes, etc.)
export const REFRESH_COOKIE_NAME = 'rt';
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * 本番環境かどうかを判定
 */
export function isSecureEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Cookie の SameSite 設定を取得
 * 本番環境では 'none' を使用（異なるサブドメイン間での通信に必要）
 * 開発環境では 'lax' を使用（HTTP でも動作する）
 */
export function getRefreshCookieSameSite(): 'lax' | 'none' {
  return isSecureEnv() ? 'none' : 'lax';
}

// 後方互換性のためのエイリアス（非推奨：関数を使用してください）
export const REFRESH_COOKIE_SAMESITE: 'lax' | 'none' = 'lax';
