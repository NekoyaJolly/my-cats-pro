import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Request } from 'express';

/**
 * csurf ミドルウェアからトークンを安全に取得するユーティリティサービス
 */
@Injectable()
export class CsrfTokenService {
  /**
   * リクエストにバインドされた csrfToken ファンクションを通じてトークンを生成
   */
  issueToken(req: Request): string {
    if (typeof req.csrfToken !== 'function') {
      throw new InternalServerErrorException('CSRFミドルウェアが初期化されていません');
    }

    return req.csrfToken();
  }
}
