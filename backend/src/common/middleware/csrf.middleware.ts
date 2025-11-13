import { Injectable, NestMiddleware } from '@nestjs/common';
import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF保護ミドルウェア
 * クロスサイトリクエストフォージェリ攻撃から保護
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrfProtection: ReturnType<typeof csurf> | null = null;

  private initializeCsrf() {
    if (!this.csrfProtection) {
      this.csrfProtection = csurf({
        cookie: {
          key: '_csrf',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      });
    }
    return this.csrfProtection;
  }

  use(req: Request, res: Response, next: NextFunction) {
    // CSRF トークン取得エンドポイントは常にトークンを生成
    if (req.path === '/api/v1/csrf-token' && req.method === 'GET') {
      const protection = this.initializeCsrf();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      return protection(req as any, res as any, next);
    }

    // GET, HEAD, OPTIONS は CSRF チェックをスキップ
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // ヘルスチェックエンドポイントはスキップ
    if (req.path === '/health' || req.path === '/api/v1/health') {
      return next();
    }

    // その他の POST/PUT/DELETE/PATCH リクエストはCSRFトークンをチェック
    const protection = this.initializeCsrf();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    protection(req as any, res as any, next);
  }
}
