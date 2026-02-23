/**
 * タグ管理ページ Page Object Model
 */

import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export interface TagFormData {
  name: string;
  color?: string;
}

export class TagsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.goto('/tags');
    await this.page.waitForLoadState('networkidle');
  }

  /** タグ名で Locator を取得 */
  getTagItem(name: string): Locator {
    return this.page.getByText(name).first();
  }

  /** タグが一覧に表示されていることを確認 */
  async expectTagVisible(name: string): Promise<void> {
    await expect(this.getTagItem(name)).toBeVisible({ timeout: 8000 });
  }

  /** タグが一覧に表示されていないことを確認 */
  async expectTagNotVisible(name: string): Promise<void> {
    await expect(this.getTagItem(name)).not.toBeVisible({ timeout: 5000 });
  }

  /** 「タグを追加」ボタンをクリックして作成モーダルを開く */
  async openCreateTagModal(): Promise<void> {
    // タグタブが選択されていることを確認
    const tagTab = this.page.getByRole('tab', { name: 'タグ' });
    if (await tagTab.isVisible()) {
      await tagTab.click();
    }
    await this.page.getByRole('button', { name: /タグ(を追加|追加|作成)/ }).first().click();
  }

  /** タグ作成ダイアログに入力して保存 */
  async fillTagForm(data: TagFormData): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel(/タグ名|名前/).fill(data.name);
    await dialog.getByRole('button', { name: /保存|作成|登録/ }).click();
    await expect(dialog).not.toBeVisible({ timeout: 5000 });
  }
}
