/**
 * 公開向け API Base URL を正規化して返します。
 *
 * - `NEXT_PUBLIC_API_URL` が `https://example.com` の場合は `/api/v1` を補完
 * - `NEXT_PUBLIC_API_URL` が `https://example.com/api/v1` の場合はそのまま利用
 *
 * 本番/開発での設定ゆれ（/api/v1 を含める/含めない）による不具合を避けるためのヘルパー。
 */
export function getPublicApiBaseUrl(): string {
  const fallback = 'http://localhost:3004/api/v1';
  const raw = process.env.NEXT_PUBLIC_API_URL;

  const normalized = (raw ?? fallback).replace(/\/+$/, '');
  if (normalized.endsWith('/api/v1')) {
    return normalized;
  }

  return `${normalized}/api/v1`;
}
