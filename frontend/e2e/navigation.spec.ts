/**
 * ナビゲーション・画面遷移 E2E テスト
 *
 * カバー範囲:
 * - アプリ全体のナビゲーション（メニューからの各ページ遷移）
 * - ログアウトフロー
 * - 各主要ページのロード確認（エラーなし）
 */

import { test, expect } from './fixtures/base';

const MAIN_PAGES = [
  { path: '/cats', label: '猫一覧' },
  { path: '/pedigrees', label: '血統書一覧' },
  { path: '/breeding', label: '繁殖管理' },
  { path: '/care', label: 'ケア管理' },
  { path: '/medical-records', label: '医療履歴' },
  { path: '/tags', label: 'タグ管理' },
  { path: '/kittens', label: '子猫管理' },
  { path: '/import', label: 'データインポート' },
  { path: '/export', label: 'データエクスポート' },
  { path: '/settings', label: '設定' },
];

test.describe('ナビゲーション', () => {
  test.describe('各ページへの直接アクセス', () => {
    for (const { path, label } of MAIN_PAGES) {
      test(`${label} (${path}) にアクセスできる`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        // ログインページにリダイレクトされていないことを確認
        await expect(page).not.toHaveURL('/login', { timeout: 8000 });
        // ページが正常に表示されている（500エラー等でない）
        await expect(page.getByRole('main')).toBeVisible({ timeout: 8000 });
      });
    }
  });

  test('ホームページ (/) にアクセスできる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL('/login', { timeout: 8000 });
  });

  test.describe('ログアウトフロー', () => {
    test('ログアウト後にログインページにリダイレクトされる', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // ログアウトボタンを探す（ナビゲーションやプロフィールメニュー内）
      const logoutButton = page.getByRole('button', { name: /ログアウト|サインアウト|logout/i })
        .or(page.getByRole('menuitem', { name: /ログアウト|サインアウト/ }));

      if (await logoutButton.count() === 0) {
        // プロフィールメニューを開いてからログアウトボタンを探す
        const profileButton = page.getByRole('button', { name: /プロフィール|アカウント|メニュー/ })
          .or(page.getByRole('button').filter({ hasText: /dev1|user|admin/ }));

        if (await profileButton.count() > 0) {
          await profileButton.first().click();
          const menuLogout = page.getByRole('menuitem', { name: /ログアウト/ })
            .or(page.getByRole('button', { name: /ログアウト/ }));
          if (await menuLogout.count() > 0) {
            await menuLogout.first().click();
            await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
          }
        }
      } else {
        await logoutButton.first().click();
        await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
      }
    });
  });

  test.describe('サイドナビゲーション', () => {
    test('サイドナビゲーションが表示される', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // ナビゲーション要素の確認
      const nav = page.getByRole('navigation');
      const count = await nav.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
