import { MantineProvider } from '@mantine/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PedigreeRegistrationForm } from '../PedigreeRegistrationForm';
import { apiClient } from '@/lib/api/client';
import type { PedigreeRecord, UpdatePedigreeRequest } from '@/lib/api/hooks/use-pedigrees';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

const pushMock = jest.fn<void, [string]>();
const backMock = jest.fn<void, []>();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (href: string) => pushMock(href),
    back: () => backMock(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

const notificationsShowMock = jest.fn<void, [
  { title: string; message?: string; color?: string }
]>();

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: (payload: { title: string; message?: string; color?: string }) =>
      notificationsShowMock(payload),
  },
}));

const updateMutateAsyncMock = jest.fn<Promise<void>, [UpdatePedigreeRequest]>();

let lastUseUpdatePedigreeId = '';

const existingRecord: PedigreeRecord = {
  id: 'p-1',
  pedigreeId: 'WCA-1234',
  catName: '既存の猫名',
};

jest.mock('@/lib/api/hooks/use-pedigrees', () => {
  return {
    useCreatePedigree: () => ({ mutateAsync: jest.fn() }),
    useUpdatePedigree: (id: string) => {
      lastUseUpdatePedigreeId = id;
      return { mutateAsync: updateMutateAsyncMock };
    },
    useGetPedigree: () => ({ data: null }),
    useGetPedigreeByNumber: (pedigreeId: string) => ({
      data: pedigreeId === 'WCA-1234' ? existingRecord : null,
      isLoading: false,
    }),
  };
});

jest.mock('@/lib/api/client', () => {
  return {
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      put: jest.fn(),
    },
  };
});

describe('PedigreeRegistrationForm update smoke', () => {
  const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

  beforeEach(() => {
    pushMock.mockReset();
    backMock.mockReset();
    notificationsShowMock.mockReset();
    updateMutateAsyncMock.mockReset();
    mockedGet.mockReset();
    lastUseUpdatePedigreeId = '';
  });

  it('血統書番号の入力で既存データが読み込まれ、更新を押すと updateMutation が呼ばれ onSuccess が呼ばれる', async () => {
    const breedsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const coatColorsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const gendersDeferred = createDeferred<{ success: boolean; data: [] }>();

    mockedGet.mockImplementation(async (path: string) => {
      if (path === '/breeds') return breedsDeferred.promise;
      if (path === '/coat-colors') return coatColorsDeferred.promise;
      if (path === '/master/genders') return gendersDeferred.promise;
      return { success: true, data: null };
    });

    updateMutateAsyncMock.mockResolvedValue();

    const onSuccess = jest.fn<void, []>();

    render(
      <MantineProvider>
        <PedigreeRegistrationForm onSuccess={onSuccess} />
      </MantineProvider>,
    );

    await act(async () => {
      breedsDeferred.resolve({ success: true, data: [] });
      coatColorsDeferred.resolve({ success: true, data: [] });
      gendersDeferred.resolve({ success: true, data: [] });
    });

    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/血統書番号/), 'WCA-1234');

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: '既存レコードを読み込みました' }),
      );
    });

    // 編集モードに切り替わる（ボタン表示が更新になる）
    await screen.findByRole('button', { name: '血統書を更新' });

    // 何か変更を入れてから更新
    const catNameInput = screen.getByLabelText('猫の名前');
    await user.clear(catNameInput);
    await user.type(catNameInput, '更新後の猫名');

    await user.click(screen.getByRole('button', { name: '血統書を更新' }));
    await user.click(await screen.findByText('更新'));

    await waitFor(() => {
      expect(updateMutateAsyncMock).toHaveBeenCalled();
    });

    const firstCall = updateMutateAsyncMock.mock.calls[0];
    if (!firstCall) {
      throw new Error('updateMutation の呼び出しが確認できませんでした');
    }

    const [payload] = firstCall;

    expect(payload).toEqual(expect.objectContaining({ catName: '更新後の猫名' }));
    expect(Object.prototype.hasOwnProperty.call(payload, 'pedigreeId')).toBe(false);

    // originalId が反映された状態で hook が呼ばれていること（初回は空文字になる可能性あり）
    expect(lastUseUpdatePedigreeId).toBe('p-1');

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  }, 20000);
});
