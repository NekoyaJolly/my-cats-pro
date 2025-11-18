import { clearCsrfToken, getCsrfToken, refreshCsrfToken } from '../csrf';

describe('csrf token helpers', () => {
  const globalAny = global as typeof globalThis & { fetch: jest.Mock };
  let consoleErrorSpy: jest.SpyInstance;

  const createFetchResponse = (overrides: Partial<Response> & { json?: () => Promise<unknown> }) => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: { csrfToken: 'token-1' } }),
    ...overrides,
  });

  beforeEach(() => {
    clearCsrfToken();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    globalAny.fetch = jest.fn();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.resetAllMocks();
  });

  it('fetches token once and reuses cached value', async () => {
    globalAny.fetch.mockResolvedValue(createFetchResponse({
      json: async () => ({ success: true, data: { csrfToken: 'cached-token' } }),
    }));

    const first = await getCsrfToken();
    const second = await getCsrfToken();

    expect(first).toBe('cached-token');
    expect(second).toBe('cached-token');
    expect(globalAny.fetch).toHaveBeenCalledTimes(1);
  });

  it('refreshCsrfToken forces a new request', async () => {
    globalAny.fetch
      .mockResolvedValueOnce(createFetchResponse({
        json: async () => ({ success: true, data: { csrfToken: 'initial-token' } }),
      }))
      .mockResolvedValueOnce(createFetchResponse({
        json: async () => ({ success: true, data: { csrfToken: 'refreshed-token' } }),
      }));

    const initial = await getCsrfToken();
    expect(initial).toBe('initial-token');

    const refreshed = await refreshCsrfToken();
    expect(refreshed).toBe('refreshed-token');
    expect(globalAny.fetch).toHaveBeenCalledTimes(2);
  });

  it('throws when CSRF endpoint returns non-200 response', async () => {
    globalAny.fetch.mockResolvedValue(createFetchResponse({ ok: false, status: 500 }));

    await expect(getCsrfToken()).rejects.toThrow('Failed to fetch CSRF token');
    expect(globalAny.fetch).toHaveBeenCalledTimes(1);
  });
});
