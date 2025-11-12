/**
 * レート制限設定
 * エンドポイントごとの制限値を定義
 */

export const RateLimitConfig = {
  // 認証エンドポイント: 厳格な制限
  auth: {
    login: { ttl: 60000, limit: 5 },           // 1分間に5回
    register: { ttl: 300000, limit: 3 },        // 5分間に3回
    refresh: { ttl: 60000, limit: 20 },         // 1分間に20回
    resetPassword: { ttl: 300000, limit: 3 },   // 5分間に3回
    requestReset: { ttl: 300000, limit: 3 },    // 5分間に3回
  },

  // API エンドポイント: 通常の制限
  api: {
    read: { ttl: 60000, limit: 100 },          // 1分間に100回（GET）
    write: { ttl: 60000, limit: 30 },          // 1分間に30回（POST/PUT/DELETE）
    heavy: { ttl: 60000, limit: 10 },          // 1分間に10回（重い処理）
  },

  // ファイルアップロード: 厳格な制限
  upload: {
    ttl: 300000,
    limit: 10,                                 // 5分間に10回
  },

  // デフォルト
  default: {
    ttl: 60000,
    limit: 100,                                // 1分間に100回
  },
} as const;

export type RateLimitOptions = {
  ttl: number;
  limit: number;
};
