import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { CsrfValidationError } from '../errors/csrf-validation.error';
import { CsrfTokenService } from '../services/csrf-token.service';

/**
 * CSRF保護ミドルウェア
 * クロスサイトリクエストフォージェリ攻撃から保護
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(private readonly csrfTokenService: CsrfTokenService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const originalUrl = (req.originalUrl || req.url || req.path || '').toLowerCase();
    const isCsrfTokenEndpoint =
      originalUrl.startsWith('/api/v1/csrf-token') || originalUrl.startsWith('/csrf-token');

    if (this.shouldSkipValidation(req, isCsrfTokenEndpoint)) {
      return next();
    }

    const token = this.extractToken(req);
    if (!token) {
      return next(new CsrfValidationError('Missing CSRF token'));
    }

    const isValid = this.csrfTokenService.validateToken(token);
    if (!isValid) {
      return next(new CsrfValidationError('Invalid or expired CSRF token'));
    }

    return next();
  }

  private shouldSkipValidation(req: Request, isCsrfTokenEndpoint: boolean): boolean {
    if (isCsrfTokenEndpoint && req.method === 'GET') {
      return true;
    }

    if (!isCsrfTokenEndpoint && ['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return true;
    }

    if (req.path === '/health' || req.path === '/api/v1/health') {
      return true;
    }

    return false;
  }

  private extractToken(req: Request): string | null {
    const headerNames = ['x-csrf-token', 'x-xsrf-token', 'csrf-token'];
    for (const name of headerNames) {
      const value = req.get(name);
      if (value && typeof value === 'string' && value.trim().length > 0) {
        return value;
      }
    }

    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      const candidate = (req.body as Record<string, unknown>)._csrf;
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate;
      }
    }

    const queryCandidate = req.query?._csrf;
    if (typeof queryCandidate === 'string' && queryCandidate.trim().length > 0) {
      return queryCandidate;
    }

    return null;
  }
}
