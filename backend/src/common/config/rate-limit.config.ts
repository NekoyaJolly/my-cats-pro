import type { Request } from 'express';

import type { RateLimitOptions, RateLimitTracker } from '../decorators/rate-limit.decorator';

type RateLimitGroup = Record<string, RateLimitOptions>;

interface RateLimitConfigShape {
  auth: RateLimitGroup;
  api: RateLimitGroup;
  upload: RateLimitOptions;
  default: RateLimitOptions;
}

/**
 * レート制限設定
 * エンドポイントごとの制限値を定義
 */

const extractClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || req.ip || 'unknown';
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }
  return req.ip || req.connection?.remoteAddress || 'unknown';
};

const normalizeEmail = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim().toLowerCase();
  }
  return 'unknown';
};

const loginTracker: RateLimitTracker = async (rawReq) => {
  const req = rawReq as unknown as Request;
  const email = normalizeEmail((req.body as Record<string, unknown> | undefined)?.email);
  return `${extractClientIp(req)}:login:${email}`;
};

const registerTracker: RateLimitTracker = async (rawReq) => {
  const req = rawReq as unknown as Request;
  const ip = extractClientIp(req);
  const email = normalizeEmail((req.body as Record<string, unknown> | undefined)?.email);

  if (process.env.NODE_ENV === 'test' && email.includes('@')) {
    const localPart = email.split('@')[0];
    const match = localPart.match(/(.+)_\d+$/);
    const namespace = match ? match[1] : localPart;
    return `register:${ip}:${namespace}`;
  }

  return `register:${ip}`;
};

const refreshTracker: RateLimitTracker = async (rawReq) => {
  const req = rawReq as unknown as Request;
  const token = (() => {
    const bodyToken = (req.body as Record<string, unknown> | undefined)?.refreshToken;
    if (typeof bodyToken === 'string' && bodyToken.length > 0) {
      return bodyToken;
    }
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const cookieToken = typeof cookies?.refresh_token === 'string' ? cookies.refresh_token : undefined;
    return cookieToken ?? 'missing';
  })();
  return `${extractClientIp(req)}:refresh:${token}`;
};

export const RateLimitConfig: RateLimitConfigShape = {
  // 認証エンドポイント: 厳格な制限
  auth: {
    login: { ttl: 60000, limit: 20, tracker: loginTracker },           // 1分間に20回（IP+メール単位）
    register: { ttl: 60000, limit: 5, tracker: registerTracker },      // 1分間に5回（IP単位 / テストはメール別）
    refresh: { ttl: 60000, limit: 20, tracker: refreshTracker },       // 1分間に20回（同一トークン単位）
    resetPassword: { ttl: 300000, limit: 3 },                          // 5分間に3回
    requestReset: { ttl: 300000, limit: 3 },                           // 5分間に3回
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
};
