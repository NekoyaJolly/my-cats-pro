import { getAccessToken } from './client';
import { getPublicApiBaseUrl } from './public-api-base-url';

/**
 * フィードバックを送信する。
 *
 * `/feedback` は生成済み OpenAPI スキーマに含まれない新規エンドポイントのため、
 * 厳格型付けの apiClient ではなく、認証トークンを付与した薄い fetch ラッパーで呼び出す。
 *
 * @returns sent: 管理者へのメール送信に成功したか（サーバー設定により false の場合がある）
 */
export async function submitFeedback(message: string): Promise<{ sent: boolean }> {
  const token = getAccessToken();
  const response = await fetch(`${getPublicApiBaseUrl()}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('フィードバックの送信に失敗しました');
  }

  const json: unknown = await response.json().catch(() => null);
  const sent =
    typeof json === 'object' && json !== null && 'data' in json
      ? Boolean((json as { data?: { sent?: boolean } }).data?.sent)
      : false;
  return { sent };
}
