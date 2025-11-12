import { Injectable, NestMiddleware } from '@nestjs/common';
import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF保護ミドルウェア
 * クロスサイトリクエストフォージェリ攻撃から保護
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private csrfProtection = csurf({
    cookie: {
      key: '_csrf',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });

  use(req: Request, res: Response, next: NextFunction) {
    // GET, HEAD, OPTIONS は CSRF チェックをスキップ
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // ヘルスチェックエンドポイントはスキップ
    if (req.path === '/health' || req.path === '/api/v1/health') {
      return next();
    }

    // CSRF トークン取得エンドポイント自体はスキップ
    if (req.path === '/api/v1/csrf-token') {
      return next();
    }

    // その他の POST/PUT/DELETE/PATCH リクエストはCSRFトークンをチェック
    this.csrfProtection(req, res, next);
  }
}
