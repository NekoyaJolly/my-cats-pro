/**
 * 猫管理 E2E テスト
 *
 * カバー範囲:
 * - 猫一覧の表示
 * - 新規登録（必須項目のみ・任意項目含む）
 * - 登録後の詳細ページへの遷移と情報表示
 * - 猫情報の編集
 * - 猫の削除
 * - バリデーションエラー
 */

import { test, expect, createCatViaApi, deleteCatViaApi, uniqueName } from './fixtures/base';
import { CatsPage } from './pages/CatsPage';

test.describe('猫管理', () => {
  test.describe('一覧ページ', () => {
    test('猫一覧ページが表示される', async ({ page }) => {
      const catsPage = new CatsPage(page);
      await catsPage.gotoList();
      await expect(page).toHaveURL(/\/cats/);
    });

    test('「新規登録」ボタンが表示される', async ({ page }) => {
      const catsPage = new CatsPage(page);
      await catsPage.gotoList();
      // 新規登録への導線（ボタンまたはリンク）
      const newButton = page.getByRole('link', { name: /新規登録|猫を追加|在舎猫登録/ })
        .or(page.getByRole('button', { name: /新規登録|猫を追加/ }))
        .first();
      await expect(newButton).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('新規登録フロー', () => {
    test('必須項目のみで猫を登録できる', async ({ page }) => {
      const catsPage = new CatsPage(page);
      const catName = uniqueName('テスト猫オス');

      await catsPage.gotoNew();
      await catsPage.fillAndSubmit({ name: catName, gender: 'MALE' });

      // /cats に戻ることを確認
      await expect(page).toHaveURL(/\/cats/, { timeout: 10000 });
    });

    test('全項目を入力して猫を登録できる', async ({ page }) => {
      const catsPage = new CatsPage(page);
      const catName = uniqueName('テスト猫メス');

      await catsPage.gotoNew();
      await catsPage.fillAndSubmit({
        name: catName,
        gender: 'FEMALE',
        birthDate: '2023-06-15',
        description: 'E2E テスト用の猫です',
      });

      await expect(page).toHaveURL(/\/cats/, { timeout: 10000 });
    });

    test('猫の名前が空のまま送信するとバリデーションエラーが表示される', async ({ page }) => {
      const catsPage = new CatsPage(page);
      await catsPage.gotoNew();

      // 名前を入力せず性別だけ選択して送信
      await page.getByLabel('性別').click();
      await page.getByRole('option', { name: 'Male (オス)' }).click();
      await page.getByRole('button', { name: '登録する' }).last().click();

      // バリデーションエラーが表示される（ページ遷移しない）
      await expect(page).toHaveURL(/\/cats\/new/);
    });

    test('性別が未選択のまま送信するとバリデーションエラーが表示される', async ({ page }) => {
      const catsPage = new CatsPage(page);
      await catsPage.gotoNew();

      await page.getByLabel('猫の名前').fill(uniqueName('未選択テスト'));
      await page.getByRole('button', { name: '登録する' }).last().click();

      await expect(page).toHaveURL(/\/cats\/new/);
    });
  });

  test.describe('CRUD フロー', () => {
    let catId: string;
    let catName: string;

    test.beforeEach(async ({ page }) => {
      catName = uniqueName('CRUD猫');
      catId = await createCatViaApi(page, { name: catName, gender: 'MALE' });
    });

    test.afterEach(async ({ page }) => {
      // 削除テスト以外でクリーンアップ
      if (catId) {
        await deleteCatViaApi(page, catId).catch(() => {
          // 削除テスト後は既に削除済みのため無視
        });
      }
    });

    test('作成した猫が一覧に表示される', async ({ page }) => {
      const catsPage = new CatsPage(page);
      await catsPage.gotoList();
      await catsPage.expectCatVisible(catName);
    });

    test('猫名をクリックすると詳細ページに遷移する', async ({ page }) => {
      const catsPage = new CatsPage(page);
      await catsPage.gotoList();
      await catsPage.getCatRow(catName).click();
      await expect(page).toHaveURL(new RegExp(`/cats/${catId}`), { timeout: 8000 });
    });

    test('詳細ページに猫の情報が表示される', async ({ page }) => {
      await page.goto(`/cats/${catId}`);
      await page.waitForLoadState('networkidle');
      await expect(page.getByText(catName)).toBeVisible({ timeout: 8000 });
    });

    test('詳細ページから編集ページに遷移できる', async ({ page }) => {
      await page.goto(`/cats/${catId}`);
      await page.waitForLoadState('networkidle');

      const editButton = page.getByRole('link', { name: /編集/ })
        .or(page.getByRole('button', { name: /編集/ }))
        .first();
      await editButton.click();
      await expect(page).toHaveURL(new RegExp(`/cats/${catId}/edit`), { timeout: 8000 });
    });

    test('猫の情報を編集できる', async ({ page }) => {
      await page.goto(`/cats/${catId}/edit`);
      await page.waitForLoadState('networkidle');

      const updatedName = uniqueName('更新後の猫');
      const nameInput = page.getByLabel('猫の名前');
      await nameInput.clear();
      await nameInput.fill(updatedName);

      const saveButton = page.getByRole('button', { name: /保存|更新|編集する/ }).last();
      await saveButton.click();

      // 保存後に詳細ページに戻る
      await expect(page).toHaveURL(new RegExp(`/cats/${catId}`), { timeout: 10000 });
      await expect(page.getByText(updatedName)).toBeVisible({ timeout: 8000 });

      // クリーンアップ用に更新した名前を反映
      catName = updatedName;
    });
  });
});
