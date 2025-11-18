import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerOptions,
  ThrottlerStorage,
  ThrottlerGetTrackerFunction,
  ThrottlerGenerateKeyFunction,
  ThrottlerException,
} from '@nestjs/throttler';
import { Request, Response } from 'express';

import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

/**
 * 拡張版Throttlerガード
 * 
 * 機能:
 * - デコレータベースのエンドポイント別レート制限
 * - IPアドレスとユーザーIDを組み合わせたトラッキング
 * - ヘルスチェックエンドポイントの除外
 */
@Injectable()
export class EnhancedThrottlerGuard extends ThrottlerGuard {
  constructor(
    protected readonly options: ThrottlerModuleOptions,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * リクエストのトラッカーIDを生成
   * IPアドレスとユーザーIDを組み合わせる
   */
  protected async getTracker(req: Request): Promise<string> {
    const reqWithUser = req as Request & {
      user?: { userId?: string; id?: string };
      path?: string;
      connection?: { remoteAddress?: string };
    };

    const ip = this.getIpAddress(reqWithUser);
    const userId = reqWithUser.user?.userId || reqWithUser.user?.id || 'anonymous';
    const path = reqWithUser.path || reqWithUser.url || '';
    const method = reqWithUser.method || '';

    return `${ip}:${userId}:${method}:${path}`;
  }

  /**
   * IPアドレスを取得
   */
  private getIpAddress(req: Request & { connection?: { remoteAddress?: string } }): string {
    // X-Forwarded-For ヘッダーをチェック（プロキシ経由の場合）
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      const ips = forwardedFor.split(',');
      return ips[0].trim();
    }
    
    // X-Real-IP ヘッダーをチェック
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp.trim();
    }
    
    // 直接接続の場合
    return req.ip || req.connection?.remoteAddress || 'unknown';
  }

  /**
   * スキップすべきリクエストかどうかを判定
   */
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path || request.url;

    // ヘルスチェックエンドポイントは除外
    const skipPaths = ['/health', '/api/v1/health', '/'];
    if (skipPaths.includes(path)) {
      return true;
    }

    return false;
  }

  /**
   * カスタムレート制限設定を取得
   */
  protected async getThrottlerConfig(context: ExecutionContext): Promise<RateLimitOptions | null> {
    const customLimit = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    return customLimit ?? null;
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerOptions,
    getTracker: ThrottlerGetTrackerFunction,
    generateKey: ThrottlerGenerateKeyFunction,
  ): Promise<boolean> {
    const customConfig = await this.getThrottlerConfig(context);
    const effectiveLimit = customConfig?.limit ?? limit;
    const effectiveTtl = customConfig?.ttl ?? ttl;
    const trackerFn = customConfig?.tracker ?? getTracker;

    const { req, res } = this.getRequestResponse(context);
    const request = req as Request;
    const response = res as Response;
    const ignoreUserAgents = throttler.ignoreUserAgents ?? this.commonOptions.ignoreUserAgents;
    if (Array.isArray(ignoreUserAgents)) {
      for (const pattern of ignoreUserAgents) {
        const userAgent = request.headers['user-agent'];
        if (typeof userAgent === 'string' && pattern.test(userAgent)) {
          return true;
        }
      }
    }

    const throttlerName = throttler.name ?? 'default';
    const tracker = await trackerFn(request as unknown as Record<string, unknown>);
    const key = generateKey(context, tracker, throttlerName);
    const { totalHits, timeToExpire } = await this.storageService.increment(key, effectiveTtl);
    const suffix = throttlerName === 'default' ? '' : `-${throttlerName}`;
    const remaining = Math.max(0, effectiveLimit - totalHits);

    response.header(`${this.headerPrefix}-Limit${suffix}`, effectiveLimit.toString());
    response.header(`${this.headerPrefix}-Remaining${suffix}`, remaining.toString());
    response.header(`${this.headerPrefix}-Reset${suffix}`, timeToExpire.toString());

    if (totalHits > effectiveLimit) {
      response.header(`Retry-After${suffix}`, timeToExpire.toString());
      throw new ThrottlerException('リクエストが集中しています。しばらく待ってから再試行してください。');
    }

    return true;
  }
}
