import { Injectable, NestMiddleware } from '@nestjs/common';
import csurf from 'csurf';
import { Request, Response, NextFunction, RequestHandler } from 'express';

import { CsrfValidationError } from '../errors/csrf-validation.error';

export const CSRF_COOKIE_NAME = 'mycats.csrf';

/**
 * csurf を利用した CSRF 保護ミドルウェア
 * Cookie に保管したシークレットと送信トークンを照合する
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfProtection: RequestHandler;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';

    // 本番環境では sameSite: 'none' + secure: true を使用
    // これは Cloud Run のフロントエンド/バックエンドが異なるサブドメインにあるため必要
    // 開発環境では sameSite: 'lax' を使用（HTTP でも動作する）
    this.csrfProtection = csurf({
      cookie: {
        key: CSRF_COOKIE_NAME,
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        path: '/',
      },
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    }) as unknown as RequestHandler; // csurf 型は express@5 系のため、実際の express@4 型へ合わせる
  }

  use(req: Request, res: Response, next: NextFunction): void {
    if (this.shouldBypass(req)) {
      return next();
    }

    this.csrfProtection(req, res, (error?: unknown) => {
      if (error) {
        if (this.isCsrfLibraryError(error)) {
          next(new CsrfValidationError());
          return;
        }
        next(error);
        return;
      }

      next();
    });
  }

  private shouldBypass(req: Request): boolean {
    const normalizedPath = (req.originalUrl || req.url || '').toLowerCase();
    const pathOnly = normalizedPath.split('?')[0];
    return pathOnly === '/health' || pathOnly === '/api/v1/health';
  }

  private isCsrfLibraryError(error: unknown): error is { code?: string } {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const candidate = error as { code?: string };
    return candidate.code === 'EBADCSRFTOKEN';
  }
}
