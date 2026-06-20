/**
 * 交配表のオス列同期 E2E テスト
 *
 * 回帰防止: 交配表のオス列は localStorage ではなくサーバーの交配スケジュールから
 * 復元され、`/breeding/schedules` の返却順に依存せず createdAt 昇順（= ペア成立の瞬間、
 * 全デバイスで同一順序）で並ぶことを検証する。
 *
 * 前提: 認証は setup プロジェクト（storageState）を再利用。
 * /cats と /breeding/schedules はこのテスト内でモックし、localStorage は空（別デバイス相当）の状態で検証する。
 */

import { test, expect } from './fixtures/base';

const cats = [
  { id: 'e2e-male-1', name: 'E2EオスA', gender: 'MALE', isInHouse: true, birthDate: '2022-01-01' },
  { id: 'e2e-male-2', name: 'E2EオスB', gender: 'MALE', isInHouse: true, birthDate: '2022-01-01' },
  { id: 'e2e-male-3', name: 'E2EオスC', gender: 'MALE', isInHouse: true, birthDate: '2022-01-01' },
  { id: 'e2e-female-1', name: 'E2EメスX', gender: 'FEMALE', isInHouse: true, birthDate: '2022-01-01' },
];

function makeSchedule(id: string, maleId: string, maleName: string, createdAt: string) {
  return {
    id,
    maleId,
    femaleId: 'e2e-female-1',
    startDate: '2026-06-10',
    duration: 3,
    status: 'SCHEDULED',
    recordedBy: 'e2e',
    createdAt,
    updatedAt: createdAt,
    male: { id: maleId, name: maleName },
    female: { id: 'e2e-female-1', name: 'E2EメスX' },
    checks: [],
  };
}

// 配列順はわざと A, C, B。createdAt 昇順は B(08:00) → A(10:00) → C(12:00)。
const schedules = [
  makeSchedule('e2e-s-a', 'e2e-male-1', 'E2EオスA', '2026-06-20T10:00:00.000Z'),
  makeSchedule('e2e-s-c', 'e2e-male-3', 'E2EオスC', '2026-06-20T12:00:00.000Z'),
  makeSchedule('e2e-s-b', 'e2e-male-2', 'E2EオスB', '2026-06-20T08:00:00.000Z'),
];

test.describe('交配表のオス列同期', () => {
  test('localStorage が空でも /breeding/schedules の返却順に依存せず createdAt 昇順でオス列が復元される', async ({ page }) => {
    // 猫一覧と交配スケジュールをモック（別 API は実バックエンドに委ねる）
    await page.route(/\/api\/v1\/cats(\?|$)/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: cats,
          meta: { total: cats.length, page: 1, limit: 1000, totalPages: 1 },
        }),
      }),
    );
    await page.route(/\/api\/v1\/breeding\/schedules/, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: schedules }),
      }),
    );

    await page.goto('/breeding');
    await page.waitForLoadState('networkidle');

    // サーバー由来のオス列ヘッダが描画されるまで待つ
    await expect(page.getByText('E2EオスA').first()).toBeVisible({ timeout: 15000 });

    // テーブルヘッダのオス名を DOM 順で取得
    const order = await page.evaluate(() => {
      const names = ['E2EオスA', 'E2EオスB', 'E2EオスC'];
      const result: string[] = [];
      for (const th of Array.from(document.querySelectorAll('th'))) {
        const text = (th.textContent || '').trim();
        for (const name of names) {
          if (text.includes(name) && !result.includes(name)) {
            result.push(name);
          }
        }
      }
      return result;
    });

    // 返却順(A,C,B)ではなく createdAt 昇順(B,A,C)で並ぶこと
    expect(order).toEqual(['E2EオスB', 'E2EオスA', 'E2EオスC']);
  });
});
