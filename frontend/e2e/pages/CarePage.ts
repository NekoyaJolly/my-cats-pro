/**
 * ケア記録・医療記録ページ Page Object Model
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export interface CareRecordFormData {
  careType: string;
  careDate: string;
  description?: string;
}

export class CarePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto('/care');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoMedicalRecords(): Promise<void> {
    await this.page.goto('/medical-records');
    await this.page.waitForLoadState('networkidle');
  }

  /** ケア記録追加ボタンを押してモーダルを開く */
  async openCreateCareModal(): Promise<void> {
    await this.page.getByRole('button', { name: /ケア(記録)?(を追加|追加|登録)/ }).first().click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  }

  /** ケア記録が表示されていることを確認 */
  async expectCareRecordVisible(text: string): Promise<void> {
    await expect(this.page.getByText(text)).toBeVisible({ timeout: 8000 });
  }
}
