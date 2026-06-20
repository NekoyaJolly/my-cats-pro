/**
 * 交配管理ページの初期年月 E2E テスト
 *
 * 回帰防止: 交配管理ページは localStorage に過去の年月が残っていても、
 * 開いたときに常に現在の年月を表示する（過去に選択した年月で開かない）。
 *
 * 前提: 認証は setup プロジェクト（storageState）を再利用。
 * /cats と /breeding/schedules はモックし、過去の年月を localStorage に仕込んだ状態で検証する。
 */

import { test, expect } from './fixtures/base';

test.describe('交配管理ページの初期年月', () => {
  test('localStorage に過去の年月が残っていても常に現在の年月を表示する', async ({ page }) => {
    // 不具合の再現条件: 過去の年月を localStorage に仕込む
    await page.addInitScript(() => {
      try {
        localStorage.setItem('breeding_selected_year', '2020');
        localStorage.setItem('breeding_selected_month', '1');
      } catch {
        // ignore
      }
    });

    // 年月表示の検証に集中するため、猫一覧とスケジュールは空でモック
    await page.route(/\/api\/v1\/cats(\?|$)/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          meta: { total: 0, page: 1, limit: 1000, totalPages: 1 },
        }),
      }),
    );
    await page.route(/\/api\/v1\/breeding\/schedules/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [] }),
      }),
    );

    await page.goto('/breeding');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('オス追加').first()).toBeVisible({ timeout: 15000 });

    // 年月の number input の値を取得
    const inputValues = await page.evaluate(() =>
      Array.from(document.querySelectorAll('input'))
        .map((i) => i.value)
        .filter((v) => /^\d{1,4}$/.test(v)),
    );

    const now = new Date();
    const currentYear = String(now.getFullYear());

    // 現在の年が表示され、仕込んだ過去年(2020)は表示されないこと
    expect(inputValues).toContain(currentYear);
    expect(inputValues).not.toContain('2020');
  });
});
