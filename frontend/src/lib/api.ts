/**
 * API utility functions and configuration
 *
 * @deprecated 新規コードでは `src/lib/api/client.ts` の `apiClient` と React Query フックを利用してください。
 * このモジュールはレガシー互換用途のみに残されており、段階的に削除予定です。
 */

import { getPublicApiBaseUrl } from '@/lib/api/public-api-base-url';

const apiBaseUrl = getPublicApiBaseUrl();

/**
 * Constructs a full API URL from a relative path
 * @param path - The API endpoint path (e.g., '/breeds', '/pedigrees')
 * @returns Complete API URL
 */
export function getApiUrl(path: string): string {
  // Ensure path starts with '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

/**
 * Makes an authenticated API request
 * @param url - The API URL
 * @param options - Fetch options
 * @returns Promise with the response
 */
export async function apiRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // Add default headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
}

/**
 * Makes a GET request to the API
 * @param path - The API endpoint path
 * @param params - Optional query parameters
 * @returns Promise with the response
 */
export async function apiGet(path: string, params?: Record<string, string>): Promise<Response> {
  let url = getApiUrl(path);
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  return apiRequest(url, { method: 'GET' });
}

/**
 * Makes a POST request to the API
 * @param path - The API endpoint path
 * @param data - Request body data
 * @returns Promise with the response
 */
export async function apiPost(path: string, data: unknown): Promise<Response> {
  return apiRequest(getApiUrl(path), {
    method: 'POST',
    body: JSON.stringify(data),
  });
}