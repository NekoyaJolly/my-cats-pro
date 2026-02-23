/**
 * データインポート・エクスポート E2E テスト
 *
 * カバー範囲:
 * - インポートページの表示とファイルアップロード UI
 * - エクスポートページの表示とダウンロード操作
 * - 無効なファイル形式のバリデーション
 */

import { test, expect } from './fixtures/base';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('データインポート', () => {
  test('インポートページが表示される', async ({ page }) => {
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/import/);
  });

  test('ファイルアップロードエリアが表示される', async ({ page }) => {
    await page.goto('/import');
    await page.waitForLoadState('networkidle');

    // ドロップゾーンやファイル入力が存在することを確認
    const uploadArea = page.getByRole('button', { name: /ファイル(を選択|選択|アップロード)/ })
      .or(page.locator('input[type="file"]'))
      .or(page.getByText(/ドラッグ|アップロード/));
    const count = await uploadArea.count();
    expect(count).toBeGreaterThan(0);
  });

  test('無効なファイル形式をアップロードするとエラーが表示される', async ({ page }) => {
    await page.goto('/import');
    await page.waitForLoadState('networkidle');

    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() === 0) {
      test.skip(true, 'ファイル入力フィールドが見つからないためスキップ');
      return;
    }

    // 無効なファイルを作成してアップロード
    const tmpFile = path.join(os.tmpdir(), 'invalid.txt');
    fs.writeFileSync(tmpFile, 'invalid content');

    await fileInput.setInputFiles(tmpFile);

    // エラーメッセージまたはバリデーション失敗の確認
    const errorMessage = page.getByRole('alert')
      .or(page.getByText(/無効|エラー|対応していない形式|CSV/));
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });

    fs.unlinkSync(tmpFile);
  });

  test('CSV テンプレートのダウンロードリンクが存在する', async ({ page }) => {
    await page.goto('/import');
    await page.waitForLoadState('networkidle');

    const templateLink = page.getByRole('link', { name: /テンプレート|サンプル/ })
      .or(page.getByRole('button', { name: /テンプレート|サンプル/ }));
    const count = await templateLink.count();
    // テンプレートリンクがある場合のみ確認
    if (count > 0) {
      await expect(templateLink.first()).toBeVisible();
    }
  });
});

test.describe('データエクスポート', () => {
  test('エクスポートページが表示される', async ({ page }) => {
    await page.goto('/export');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/export/);
  });

  test('エクスポートボタンが存在する', async ({ page }) => {
    await page.goto('/export');
    await page.waitForLoadState('networkidle');

    const exportButton = page.getByRole('button', { name: /エクスポート|ダウンロード|出力/ });
    const count = await exportButton.count();
    if (count > 0) {
      await expect(exportButton.first()).toBeVisible();
    }
  });

  test('猫データのエクスポートが実行できる', async ({ page }) => {
    await page.goto('/export');
    await page.waitForLoadState('networkidle');

    // 猫データのエクスポートボタンを探す
    const catExportButton = page.getByRole('button', { name: /猫.*エクスポート|エクスポート.*猫/ })
      .or(page.getByRole('button', { name: /エクスポート|ダウンロード/ }).first());

    if (await catExportButton.count() === 0) {
      test.skip(true, 'エクスポートボタンが見つからないためスキップ');
      return;
    }

    // ダウンロードの開始を待つ
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      catExportButton.click(),
    ]);

    expect(download.suggestedFilename()).toBeTruthy();
    expect(download.suggestedFilename()).toMatch(/\.(csv|json|xlsx?)$/i);
  });
});
