import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright E2E テスト設定
 *
 * - setup プロジェクト: ログインを行い認証状態 (storageState) を保存
 * - main プロジェクト: 保存した認証状態を再利用して業務フローをテスト
 *
 * 実行前提: フロントエンド (3000) とバックエンド (3004) が起動していること
 * 起動コマンド: pnpm dev（ルートで実行）
 */

export const STORAGE_STATE_PATH = path.join(__dirname, 'e2e/.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // テストデータの競合を避けるため順次実行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
  },

  projects: [
    // Step 1: ログインして認証状態を保存
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Step 2: 認証状態を使って業務フローをテスト
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
      dependencies: ['setup'],
    },
  ],
});
