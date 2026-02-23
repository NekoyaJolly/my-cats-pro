/**
 * 猫一覧・新規登録ページ Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export interface CatFormData {
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate?: string;
  description?: string;
}

export class CatsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoList(): Promise<void> {
    await this.page.goto('/cats');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/cats/new');
    await this.page.waitForLoadState('networkidle');
  }

  /** 一覧から猫名を含むカード・行を取得 */
  getCatRow(name: string): Locator {
    return this.page.getByText(name).first();
  }

  /** 猫が一覧に表示されていることを確認 */
  async expectCatVisible(name: string): Promise<void> {
    await expect(this.getCatRow(name)).toBeVisible({ timeout: 8000 });
  }

  /** 猫が一覧に表示されていないことを確認 */
  async expectCatNotVisible(name: string): Promise<void> {
    await expect(this.getCatRow(name)).not.toBeVisible({ timeout: 5000 });
  }

  /** 新規登録フォームを入力して送信 */
  async fillAndSubmit(data: CatFormData): Promise<void> {
    // 猫の名前
    await this.page.getByLabel('猫の名前').fill(data.name);

    // 性別 (SelectWithFloatingLabel — Mantine Select)
    await this.page.getByLabel('性別').click();
    const genderLabel = data.gender === 'MALE' ? 'Male (オス)' : 'Female (メス)';
    await this.page.getByRole('option', { name: genderLabel }).click();

    // 生年月日（任意）
    if (data.birthDate) {
      await this.page.getByLabel('生年月日').fill(data.birthDate);
    }

    // 備考（任意）
    if (data.description) {
      await this.page.getByLabel('備考').fill(data.description);
    }

    // 送信（ヘッダーまたはフォーム下部のボタン）
    await this.page.getByRole('button', { name: '登録する' }).last().click();

    // 登録成功後は /cats に遷移する
    await expect(this.page).toHaveURL(/\/cats/, { timeout: 10000 });
  }
}
