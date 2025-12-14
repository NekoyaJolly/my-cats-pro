import { MantineProvider } from '@mantine/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PedigreeRegistrationForm } from '../PedigreeRegistrationForm';
import { apiClient } from '@/lib/api/client';
import type { CreatePedigreeRequest } from '@/lib/api/hooks/use-pedigrees';

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

const createDeferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
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
    show: (payload: { title: string; message?: string; color?: string }) => notificationsShowMock(payload),
  },
}));

const createMutateAsyncMock = jest.fn<Promise<void>, [CreatePedigreeRequest]>();

jest.mock('@/lib/api/hooks/use-pedigrees', () => {
  return {
    useCreatePedigree: () => ({ mutateAsync: createMutateAsyncMock }),
    useUpdatePedigree: () => ({ mutateAsync: jest.fn() }),
    useGetPedigree: () => ({ data: null }),
    useGetPedigreeByNumber: () => ({ data: null, isLoading: false }),
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

describe('PedigreeRegistrationForm create smoke', () => {
  const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

  beforeEach(() => {
    pushMock.mockReset();
    backMock.mockReset();
    notificationsShowMock.mockReset();
    createMutateAsyncMock.mockReset();
    mockedGet.mockReset();
  });

  it('血統書番号を入力して「新規登録」を押すと createMutation が呼ばれ、onSuccess が呼ばれる', async () => {
    const breedsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const coatColorsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const gendersDeferred = createDeferred<{ success: boolean; data: [] }>();

    mockedGet.mockImplementation(async (path: string) => {
      if (path === '/breeds') return breedsDeferred.promise;
      if (path === '/coat-colors') return coatColorsDeferred.promise;
      if (path === '/master/genders') return gendersDeferred.promise;
      return { success: true, data: null };
    });

    createMutateAsyncMock.mockResolvedValue();

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

    await user.type(screen.getByLabelText(/血統書番号/), 'WCA-9999');

    await user.click(screen.getByRole('button', { name: '血統書を登録' }));
    await user.click(await screen.findByText('新規登録'));

    await waitFor(() => {
      expect(createMutateAsyncMock).toHaveBeenCalledWith(
        expect.objectContaining({ pedigreeId: 'WCA-9999' }),
      );
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(pushMock).not.toHaveBeenCalled();
  }, 20000);

  it('血統書番号が空のまま「新規登録」を押すとバリデーションで止まり、createMutation は呼ばれない', async () => {
    const breedsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const coatColorsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const gendersDeferred = createDeferred<{ success: boolean; data: [] }>();

    mockedGet.mockImplementation(async (path: string) => {
      if (path === '/breeds') return breedsDeferred.promise;
      if (path === '/coat-colors') return coatColorsDeferred.promise;
      if (path === '/master/genders') return gendersDeferred.promise;
      return { success: true, data: null };
    });

    render(
      <MantineProvider>
        <PedigreeRegistrationForm />
      </MantineProvider>,
    );

    await act(async () => {
      breedsDeferred.resolve({ success: true, data: [] });
      coatColorsDeferred.resolve({ success: true, data: [] });
      gendersDeferred.resolve({ success: true, data: [] });
    });

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '血統書を登録' }));
    await user.click(await screen.findByText('新規登録'));

    expect(createMutateAsyncMock).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(notificationsShowMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'バリデーションエラー',
        }),
      );
    });
  }, 20000);
});
