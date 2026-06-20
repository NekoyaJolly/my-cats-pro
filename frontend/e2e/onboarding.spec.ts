/**
 * オンボーディング E2E テスト
 *
 * カバー範囲:
 * - ガイド定義のあるページの初回訪問で「できること」ドロワーが自動表示される
 * - 一度表示したページは再訪しても自動表示されない（localStorage `mycats-onboarding` に記録）
 * - ヘッダーの「?」ボタンでいつでも手動再表示できる
 *
 * 前提: 認証状態は setup プロジェクト（auth.setup.ts）の storageState を再利用。
 * 各テストは新しいコンテキストで開始するため `mycats-onboarding` は未設定の状態から始まる。
 *
 * 設計メモ: 初回ログイン直後の着地ページは歓迎ヒント優先でガイドを見送るため、
 * 先に `/` を開いて歓迎処理を通してから対象ページへ遷移する。
 */

import { test, expect } from './fixtures/base';

const ONBOARDING_STORAGE_KEY = 'mycats-onboarding';

test.describe('オンボーディング', () => {
  test('在舎猫ページ初回訪問でガイドが自動表示され、再訪では表示されない', async ({ page }) => {
    // 歓迎処理を先に通す（着地ページの自動表示は初回のみ見送られる設計）
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 初回訪問 → ドロワー自動表示（「了解しました」ボタンは開いている時だけ描画される）
    await page.goto('/cats');
    await page.waitForLoadState('networkidle');
    const closeButton = page.getByTestId('page-onboarding-close');
    await expect(closeButton).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('在舎猫の一覧でできること')).toBeVisible();

    // localStorage に当該ページが記録されている
    const stored = await page.evaluate(
      (key) => localStorage.getItem(key),
      ONBOARDING_STORAGE_KEY,
    );
    expect(stored).toContain('::cats');

    // 閉じる
    await closeButton.click();
    await expect(closeButton).toBeHidden();

    // 再訪 → 記録済みなので自動表示されない
    await page.goto('/cats');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('page-onboarding-close')).toBeHidden();
  });

  test('ヘッダーの「?」ボタンでガイドを再表示できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.goto('/cats');
    await page.waitForLoadState('networkidle');

    // 初回の自動表示を閉じる
    const closeButton = page.getByTestId('page-onboarding-close');
    await expect(closeButton).toBeVisible({ timeout: 10000 });
    await closeButton.click();
    await expect(closeButton).toBeHidden();

    // 「?」ボタンで再表示
    await page.getByTestId('page-onboarding-help').click();
    await expect(page.getByTestId('page-onboarding-close')).toBeVisible();
    await expect(page.getByText('在舎猫の一覧でできること')).toBeVisible();
  });
});
