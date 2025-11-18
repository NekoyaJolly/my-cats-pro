import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export type RateLimitTracker = (req: Record<string, unknown>) => string | Promise<string>;

export interface RateLimitOptions {
  ttl: number;
  limit: number;
  tracker?: RateLimitTracker;
}

/**
 * カスタムレート制限デコレータ
 * 
 * @example
 * ```typescript
 * @RateLimit({ ttl: 60000, limit: 10 })
 * @Post('login')
 * async login() { ... }
 * ```
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
