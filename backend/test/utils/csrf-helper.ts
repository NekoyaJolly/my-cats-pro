import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';

/**
 * E2EテストでCSRFトークンを取得し、CSRF保護されたリクエストを実行するヘルパー
 */
export class CsrfHelper {
  private cachedToken: { token: string; cookie: string } | null = null;

  constructor(private readonly app: INestApplication) {}

  /**
   * CSRFトークンとクッキーを取得（キャッシュ可能）
   */
  async getCsrfToken(refresh = false): Promise<{ token: string; cookie: string }> {
    if (!refresh && this.cachedToken) {
      return this.cachedToken;
    }

    const response = await request(this.app.getHttpServer())
      .get('/api/v1/csrf-token')
      .expect(200);

    const csrfToken = response.body.data.csrfToken;
    const cookies = response.headers['set-cookie'];
    
    if (!csrfToken) {
      throw new Error('CSRF token not found in response');
    }
    
    if (!cookies || !Array.isArray(cookies) || cookies.length === 0) {
      throw new Error('CSRF cookie not found in response');
    }

    this.cachedToken = {
      token: csrfToken,
      cookie: cookies.join('; '),
    };

    return this.cachedToken;
  }

  /**
   * CSRF保護されたPOSTリクエストを実行して結果を返す
   */
  async post(url: string, body?: any): Promise<Response> {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .post(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send(body);
  }

  /**
   * CSRF保護されたPUTリクエストを実行して結果を返す
   */
  async put(url: string, body?: any): Promise<Response> {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .put(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send(body);
  }

  /**
   * CSRF保護されたPATCHリクエストを実行して結果を返す
   */
  async patch(url: string, body?: any): Promise<Response> {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .patch(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send(body);
  }

  /**
   * CSRF保護されたDELETEリクエストを実行して結果を返す
   */
  async delete(url: string): Promise<Response> {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .delete(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);
  }
}
