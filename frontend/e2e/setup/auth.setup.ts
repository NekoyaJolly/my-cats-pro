/**
 * 認証セットアップ
 *
 * バックエンド API を直接呼び出してログインし、
 * accessToken / refreshToken を localStorage に保存した状態を
 * storageState として永続化する。
 * 各テストはこの storageState を再利用することで毎回ログイン操作を省略できる。
 */

import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE_PATH } from '../../playwright.config';

const E2E_EMAIL = process.env.E2E_USER_EMAIL ?? 'dev1@example.com';
const E2E_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Passw0rd!';
const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:3004/api/v1';

setup('認証状態を保存', async ({ page }) => {
  // バックエンド API に直接ログインして JWT を取得する（UI 操作不要で高速）
  const response = await page.request.post(`${API_BASE_URL}/auth/login`, {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });

  expect(response.ok(), `ログイン失敗: ${response.status()} — テストユーザー (${E2E_EMAIL}) が存在するか確認してください`).toBeTruthy();

  const body = (await response.json()) as {
    success: boolean;
    data: { access_token: string; refresh_token: string };
  };

  const { access_token, refresh_token } = body.data;

  // フロントエンドページを開いて localStorage にトークンを書き込む
  await page.goto('/');

  await page.evaluate(
    ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },
    { accessToken: access_token, refreshToken: refresh_token },
  );

  // 認証が有効であることをトップページで確認
  await page.reload();
  await expect(page).not.toHaveURL('/login', { timeout: 8000 });

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
