/**
 * カスタムテスト Fixture
 *
 * Playwright の標準 test を拡張し、プロジェクト共通のヘルパーを提供する。
 * 各テストファイルは test/expect を playwright の標準ではなくここからインポートする。
 */

import { test as base, expect, type Page } from '@playwright/test';

const API_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:3004/api/v1';

/**
 * テスト用の一意な識別子を生成する
 * 例: "テスト猫_1706789012345"
 */
export function uniqueName(prefix: string): string {
  return `${prefix}_${Date.now()}`;
}

/**
 * API クライアント（認証トークン付き）
 * バックエンドへの直接操作が必要なテストデータの準備・後処理に使う
 */
export async function getAccessToken(page: Page): Promise<string> {
  const token = await page.evaluate(() => localStorage.getItem('accessToken'));
  if (!token) {
    throw new Error('accessToken が localStorage に見つかりません。auth.setup.ts が正常に完了しているか確認してください。');
  }
  return token;
}

/**
 * バックエンド API を直接呼んでテスト用リソースを作成するヘルパー
 */
export async function createCatViaApi(
  page: Page,
  data: { name: string; gender: 'MALE' | 'FEMALE' },
): Promise<string> {
  const token = await getAccessToken(page);
  const response = await page.request.post(`${API_BASE_URL}/cats`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: data.name,
      gender: data.gender,
      birthDate: '2023-01-01',
    },
  });
  const body = (await response.json()) as { data: { id: string } };
  return body.data.id;
}

/**
 * バックエンド API を直接呼んで猫を削除するヘルパー（テスト後のクリーンアップ用）
 */
export async function deleteCatViaApi(page: Page, catId: string): Promise<void> {
  const token = await getAccessToken(page);
  await page.request.delete(`${API_BASE_URL}/cats/${catId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * バックエンド API を直接呼んでタグを作成するヘルパー
 */
export async function createTagViaApi(
  page: Page,
  data: { name: string; color: string },
): Promise<string> {
  const token = await getAccessToken(page);
  const response = await page.request.post(`${API_BASE_URL}/tags`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: data.name,
      color: data.color,
    },
  });
  const body = (await response.json()) as { data: { id: string } };
  return body.data.id;
}

export const test = base.extend({});
export { expect };
