import { INestApplication } from '@nestjs/common';
import request from 'supertest';

/**
 * E2EテストでCSRFトークンを取得し、CSRF保護されたリクエストを実行するヘルパー
 */
export class CsrfHelper {
  constructor(private readonly app: INestApplication) {}

  /**
   * CSRFトークンとクッキーを取得
   */
  async getCsrfToken(): Promise<{ token: string; cookie: string }> {
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

    return {
      token: csrfToken,
      cookie: cookies.join('; '),
    };
  }

  /**
   * CSRF保護されたPOSTリクエストを実行
   */
  async post(url: string, body?: any) {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .post(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send(body);
  }

  /**
   * CSRF保護されたPUTリクエストを実行
   */
  async put(url: string, body?: any) {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .put(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send(body);
  }

  /**
   * CSRF保護されたPATCHリクエストを実行
   */
  async patch(url: string, body?: any) {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .patch(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie)
      .send(body);
  }

  /**
   * CSRF保護されたDELETEリクエストを実行
   */
  async delete(url: string) {
    const { token, cookie } = await this.getCsrfToken();
    
    return request(this.app.getHttpServer())
      .delete(url)
      .set('X-CSRF-Token', token)
      .set('Cookie', cookie);
  }
}
