import { MantineProvider } from '@mantine/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PrintSettingsEditor } from '../PrintSettingsEditor';

describe('PrintSettingsEditor', () => {
  const originalFetch: typeof fetch | undefined = (globalThis as { fetch?: typeof fetch }).fetch;

  const createPosition = (x: number, y: number) => ({ x, y });

  const createSettingsData = () => ({
    offsetX: 0,
    offsetY: 0,
    breed: createPosition(0, 0),
    sex: createPosition(0, 0),
    dateOfBirth: createPosition(0, 0),
    eyeColor: createPosition(0, 0),
    color: createPosition(0, 0),
    catName: { x: 0, y: 0, align: 'left' as const },
    wcaNo: { x: 0, y: 0, align: 'left' as const },
    owner: createPosition(0, 0),
    breeder: createPosition(0, 0),
    dateOfRegistration: createPosition(0, 0),
    littersM: createPosition(0, 0),
    littersF: createPosition(0, 0),
    sire: {
      name: createPosition(0, 0),
      color: createPosition(0, 0),
      eyeColor: createPosition(0, 0),
      jcu: createPosition(0, 0),
    },
    dam: {
      name: createPosition(0, 0),
      color: createPosition(0, 0),
      eyeColor: createPosition(0, 0),
      jcu: createPosition(0, 0),
    },
    grandParents: {
      ff: { name: createPosition(0, 0), color: createPosition(0, 0), jcu: createPosition(0, 0) },
      fm: { name: createPosition(0, 0), color: createPosition(0, 0), jcu: createPosition(0, 0) },
      mf: { name: createPosition(0, 0), color: createPosition(0, 0), jcu: createPosition(0, 0) },
      mm: { name: createPosition(0, 0), color: createPosition(0, 0), jcu: createPosition(0, 0) },
    },
    greatGrandParents: {
      fff: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      ffm: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      fmf: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      fmm: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      mff: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      mfm: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      mmf: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
      mmm: { name: createPosition(0, 0), jcu: createPosition(0, 0) },
    },
    otherOrganizationsNo: createPosition(0, 0),
    fontSizes: {
      catName: 10,
      wcaNo: 10,
      headerInfo: 10,
      parentName: 10,
      parentDetail: 10,
      grandParentName: 10,
      grandParentDetail: 10,
      greatGrandParent: 10,
      footer: 10,
    },
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'fetch', {
      value: originalFetch,
      writable: true,
      configurable: true,
    });
    jest.restoreAllMocks();
  });

  it('設定取得に失敗した場合はエラーを表示する', async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({}),
    } as Response;

    const fetchMock = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue(mockResponse);

    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
      configurable: true,
    });

    render(
      <MantineProvider>
        <PrintSettingsEditor />
      </MantineProvider>,
    );

    expect(await screen.findByText('設定の取得に失敗しました')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('設定取得に成功した場合、初期状態では保存が無効で、変更すると有効になる', async () => {
    const settingsData = createSettingsData();

    const fetchMock = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: settingsData }),
      } as Response);

    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
      configurable: true,
    });

    render(
      <MantineProvider>
        <PrintSettingsEditor />
      </MantineProvider>,
    );

    expect(await screen.findByText('印刷位置設定')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: '保存' });
    expect(saveButton).toBeDisabled();

    const offsetXInput = await screen.findByLabelText('X オフセット (mm)');
    fireEvent.change(offsetXInput, { target: { value: '1' } });

    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });
  }, 20000);

  it('保存を押すとPATCHが呼ばれ、変更が保存済み状態に戻る', async () => {
    const settingsData = createSettingsData();

    const fetchMock = jest
      .fn<Promise<Response>, Parameters<typeof fetch>>()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: settingsData }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
      configurable: true,
    });

    render(
      <MantineProvider>
        <PrintSettingsEditor />
      </MantineProvider>,
    );

    expect(await screen.findByText('印刷位置設定')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: '保存' });
    const offsetXInput = await screen.findByLabelText('X オフセット (mm)');

    fireEvent.change(offsetXInput, { target: { value: '1' } });
    await waitFor(() => {
      expect(saveButton).toBeEnabled();
    });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(saveButton).toBeDisabled();
    });

    const patchCall = fetchMock.mock.calls[1];
    if (!patchCall) {
      throw new Error('PATCHの呼び出しが確認できませんでした');
    }

    const [url, options] = patchCall;
    expect(url).toBe('http://localhost:3004/api/v1/pedigrees/print-settings');
    expect(options).toBeDefined();
    expect(options?.method).toBe('PATCH');
    expect(options?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(typeof options?.body).toBe('string');
    if (typeof options?.body === 'string') {
      expect(options.body).toContain('"offsetX":1');
    }
  }, 20000);
});
