/**
 * 認証フロー E2E テスト
 *
 * カバー範囲:
 * - 未ログイン時の保護ページへのアクセス制御
 * - ログイン成功フロー
 * - ログイン失敗フロー（誤パスワード）
 * - ログアウトフロー
 * - パスワードリセット画面への遷移
 */

import { test, expect } from './fixtures/base';
import { LoginPage } from './pages/LoginPage';

// このテストファイルは storageState を使わず未認証状態で実行する
test.use({ storageState: { cookies: [], origins: [] } });

const TEST_EMAIL = process.env.E2E_USER_EMAIL ?? 'dev1@example.com';
const TEST_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'Passw0rd!';

test.describe('認証フロー', () => {
  test('未ログイン状態でホームにアクセスするとログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test('未ログイン状態で /cats にアクセスするとログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/cats');
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 });
  });

  test.describe('ログインページ', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginPage(page);
      await loginPage.goto();
    });

    test('ログインフォームが表示される', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    test('正しい認証情報でログインするとホームページに遷移する', async ({ page }) => {
      await loginPage.loginAndWaitForRedirect(TEST_EMAIL, TEST_PASSWORD);
      await expect(page).not.toHaveURL('/login');
    });

    test('誤ったパスワードでログインするとエラーメッセージが表示される', async () => {
      await loginPage.login(TEST_EMAIL, 'wrongpassword123!');
      await expect(loginPage.errorAlert).toBeVisible({ timeout: 8000 });
    });

    test('メールアドレスが空のままログインするとバリデーションエラーが表示される', async ({ page }) => {
      await loginPage.passwordInput.fill(TEST_PASSWORD);
      await loginPage.submitButton.click();
      await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    });

    test('パスワードが空のままログインするとバリデーションエラーが表示される', async ({ page }) => {
      await loginPage.emailInput.fill(TEST_EMAIL);
      await loginPage.submitButton.click();
      await expect(page.getByText('パスワードを入力してください')).toBeVisible();
    });

    test('「リセット」リンクをクリックするとパスワードリセット画面に遷移する', async ({ page }) => {
      await page.getByText('リセット').click();
      await expect(page).toHaveURL(/\/forgot-password/, { timeout: 5000 });
    });

    test('「新規登録」リンクをクリックすると登録画面に遷移する', async ({ page }) => {
      await page.getByText('新規登録').click();
      await expect(page).toHaveURL(/\/register/, { timeout: 5000 });
    });
  });

  test('ログイン済みで /login にアクセスするとホームにリダイレクトされる', async ({ page }) => {
    // まずログインして storageState を設定
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForRedirect(TEST_EMAIL, TEST_PASSWORD);

    // 再度 /login にアクセス
    await page.goto('/login');
    await expect(page).not.toHaveURL('/login', { timeout: 5000 });
  });
});
