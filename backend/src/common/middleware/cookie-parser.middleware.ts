import { Injectable, NestMiddleware } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

/**
 * Cookie Parser ミドルウェア
 * リクエストのCookieをパースしてreq.cookiesオブジェクトに格納
 */
@Injectable()
export class CookieParserMiddleware implements NestMiddleware {
  private parser = cookieParser();

  use(req: Request, res: Response, next: NextFunction) {
    this.parser(req, res, next);
  }
}
