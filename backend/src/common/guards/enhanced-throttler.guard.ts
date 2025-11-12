import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerStorage } from '@nestjs/throttler';
import { Request } from 'express';

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
    protected readonly options: any,
    protected readonly storageService: ThrottlerStorage,
    protected readonly reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  /**
   * リクエストのトラッカーIDを生成
   * IPアドレスとユーザーIDを組み合わせる
   */
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // IPアドレスを取得
    const ip = this.getIpAddress(req);
    
    // ユーザーIDがある場合は組み合わせる
    const userId = req.user?.userId || req.user?.id || 'anonymous';
    
    // エンドポイント情報を追加
    const path = req.path || req.url || '';
    const method = req.method || '';
    
    return `${ip}:${userId}:${method}:${path}`;
  }

  /**
   * IPアドレスを取得
   */
  private getIpAddress(req: Record<string, any>): string {
    // X-Forwarded-For ヘッダーをチェック（プロキシ経由の場合）
    const forwardedFor = req.headers?.['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      const ips = forwardedFor.split(',');
      return ips[0].trim();
    }
    
    // X-Real-IP ヘッダーをチェック
    const realIp = req.headers?.['x-real-ip'];
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
  protected async getThrottlerConfig(context: ExecutionContext): Promise<{ ttl: number; limit: number } | null> {
    // デコレータから設定を取得
    const customLimit = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (customLimit) {
      return customLimit;
    }

    // デフォルト設定を使用
    return null;
  }
}
