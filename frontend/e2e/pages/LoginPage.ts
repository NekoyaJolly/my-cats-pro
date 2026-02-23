/**
 * ログインページ Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('メールアドレス');
    this.passwordInput = page.getByLabel('パスワード');
    this.submitButton = page.getByRole('button', { name: 'ログイン' });
    this.errorAlert = page.getByRole('alert').filter({ hasText: 'ログインエラー' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAndWaitForRedirect(email: string, password: string): Promise<void> {
    await this.login(email, password);
    // ログイン成功後は /login 以外にリダイレクトされる
    await expect(this.page).not.toHaveURL('/login', { timeout: 10000 });
  }
}
