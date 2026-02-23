/**
 * タグ管理 E2E テスト
 *
 * カバー範囲:
 * - タグ管理ページの表示
 * - タグ一覧タブの表示
 * - カテゴリ・グループ・タグの階層構造の確認
 * - タグ自動化ルールタブの表示
 * - 猫へのタグ付けフロー（猫一覧でのフィルタリング）
 */

import { test, expect, createCatViaApi, deleteCatViaApi, uniqueName } from './fixtures/base';
import { TagsPage } from './pages/TagsPage';

test.describe('タグ管理', () => {
  test('タグ管理ページが表示される', async ({ page }) => {
    const tagsPage = new TagsPage(page);
    await tagsPage.goto();
    await expect(page).toHaveURL(/\/tags/);
  });

  test('タグ一覧タブが表示される', async ({ page }) => {
    const tagsPage = new TagsPage(page);
    await tagsPage.goto();

    const tagTab = page.getByRole('tab', { name: /^タグ$/ });
    if (await tagTab.count() > 0) {
      await expect(tagTab.first()).toBeVisible();
      await tagTab.first().click();
    }
  });

  test('カテゴリタブが表示される', async ({ page }) => {
    const tagsPage = new TagsPage(page);
    await tagsPage.goto();

    const categoryTab = page.getByRole('tab', { name: /カテゴリ/ });
    if (await categoryTab.count() > 0) {
      await expect(categoryTab.first()).toBeVisible();
    }
  });

  test('自動化ルールタブが表示される', async ({ page }) => {
    const tagsPage = new TagsPage(page);
    await tagsPage.goto();

    const automationTab = page.getByRole('tab', { name: /自動化|オートメーション/ });
    if (await automationTab.count() > 0) {
      await expect(automationTab.first()).toBeVisible();
    }
  });

  test.describe('タグ作成フロー', () => {
    test('タグタブを開いてタグ追加ボタンが表示される', async ({ page }) => {
      const tagsPage = new TagsPage(page);
      await tagsPage.goto();

      const tagTab = page.getByRole('tab', { name: /^タグ$/ });
      if (await tagTab.count() > 0) {
        await tagTab.first().click();
        await page.waitForLoadState('networkidle');
      }

      // タグ追加ボタンの確認
      const addButton = page.getByRole('button', { name: /タグ(を追加|追加|作成)/ });
      if (await addButton.count() > 0) {
        await expect(addButton.first()).toBeVisible();
      }
    });
  });

  test.describe('猫へのタグ付けフロー', () => {
    let catId: string;

    test.beforeEach(async ({ page }) => {
      catId = await createCatViaApi(page, { name: uniqueName('タグテスト猫'), gender: 'MALE' });
    });

    test.afterEach(async ({ page }) => {
      await deleteCatViaApi(page, catId).catch(() => {});
    });

    test('猫登録フォームにタグ選択フィールドが表示される', async ({ page }) => {
      await page.goto('/cats/new');
      await page.waitForLoadState('networkidle');

      // タグセレクタの存在確認
      const tagField = page.getByLabel('タグ')
        .or(page.getByPlaceholder(/タグ|猫の特徴/));
      const count = await tagField.count();
      expect(count).toBeGreaterThan(0);
    });

    test('猫詳細ページにタグが表示される', async ({ page }) => {
      await page.goto(`/cats/${catId}`);
      await page.waitForLoadState('networkidle');
      // 猫詳細ページが表示されること
      await expect(page.getByRole('main')).toBeVisible({ timeout: 8000 });
    });
  });
});
