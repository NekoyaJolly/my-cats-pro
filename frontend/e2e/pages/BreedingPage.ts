/**
 * 繁殖管理ページ Page Object Model
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export class BreedingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto('/breeding');
    await this.page.waitForLoadState('networkidle');
  }

  /** タブを選択 */
  async selectTab(name: string): Promise<void> {
    await this.page.getByRole('tab', { name }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /** 交配スケジュール追加ボタンを押してモーダルを開く */
  async openBreedingScheduleModal(): Promise<void> {
    await this.selectTab('交配スケジュール');
    await this.page.getByRole('button', { name: /交配(スケジュール)?(を追加|追加|登録)/ }).first().click();
    await expect(this.page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  }

  /** NG ルール一覧に特定テキストが含まれることを確認 */
  async expectNgRuleVisible(text: string): Promise<void> {
    await this.selectTab('NG ルール');
    await expect(this.page.getByText(text)).toBeVisible({ timeout: 5000 });
  }

  /** 出産計画タブのリストを確認 */
  async expectBirthPlanVisible(text: string): Promise<void> {
    await this.selectTab('出産計画');
    await expect(this.page.getByText(text)).toBeVisible({ timeout: 5000 });
  }
}
