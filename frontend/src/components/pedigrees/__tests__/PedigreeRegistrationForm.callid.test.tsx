import { MantineProvider } from '@mantine/core';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { PedigreeRegistrationForm } from '../PedigreeRegistrationForm';
import { apiClient } from '@/lib/api/client';
import type { PedigreeRecord } from '@/lib/api/hooks/use-pedigrees';

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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: jest.fn(),
  },
}));

jest.mock('@/lib/api/hooks/use-pedigrees', () => {
  return {
    useCreatePedigree: () => ({ mutateAsync: jest.fn() }),
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
    },
  };
});

describe('PedigreeRegistrationForm CallID', () => {
  const mockedGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockedGet.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('両親IDのCallIDで、第3世代（曾祖父母）まで値が反映される', async () => {
    const breedsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const coatColorsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const gendersDeferred = createDeferred<{ success: boolean; data: [] }>();

    const callResult: PedigreeRecord = {
      id: 'p-1',
      pedigreeId: 'WCA-0001',
      catName: 'テスト猫',

      fatherTitle: 'SireTitle',
      fatherCatName: 'SireName',
      motherTitle: 'DamTitle',
      motherCatName: 'DamName',

      ffCatName: 'FFName',
      fmCatName: 'FMName',
      mfCatName: 'MFName',
      mmCatName: 'MMName',

      fffCatName: 'FFFName',
      ffmCatName: 'FFMName',
      fmfCatName: 'FMFName',
      fmmCatName: 'FMMName',
      mffCatName: 'MFFName',
      mfmCatName: 'MFMName',
      mmfCatName: 'MMFName',
      mmmCatName: 'MMMName',

      fffjcu: 'FFF-NO',
      mmmjcu: 'MMM-NO',
    };

    mockedGet.mockImplementation(async (path: string, options?: { pathParams?: { pedigreeId?: string } }) => {
      if (path === '/breeds') return breedsDeferred.promise;
      if (path === '/coat-colors') return coatColorsDeferred.promise;
      if (path === '/master/genders') return gendersDeferred.promise;

      if (path === '/pedigrees/pedigree-id/{pedigreeId}' && options?.pathParams?.pedigreeId === 'ABCDE') {
        return { success: true, data: callResult };
      }

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

    expect(await screen.findByText('Call ID')).toBeInTheDocument();

    const bothInput = screen.getByLabelText('両親ID');
    fireEvent.change(bothInput, { target: { value: 'ABCDE' } });

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith('/pedigrees/pedigree-id/{pedigreeId}', {
        pathParams: { pedigreeId: 'ABCDE' },
      });
    });

    expect(screen.getByLabelText('父親名')).toHaveValue('SireName');
    expect(screen.getByLabelText('母親名')).toHaveValue('DamName');

    // 第3世代（曾祖父母）
    expect(screen.getByLabelText('FFF名前')).toHaveValue('FFFName');
    expect(screen.getByLabelText('MMM名前')).toHaveValue('MMMName');
    expect(screen.getByLabelText('FFFナンバー')).toHaveValue('FFF-NO');
    expect(screen.getByLabelText('MMMナンバー')).toHaveValue('MMM-NO');
  }, 20000);

  it('CallIDは5文字未満だとAPI呼び出しされない（デバウンス含む）', async () => {
    const breedsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const coatColorsDeferred = createDeferred<{ success: boolean; data: [] }>();
    const gendersDeferred = createDeferred<{ success: boolean; data: [] }>();

    let callIdFetched = false;

    mockedGet.mockImplementation(async (path: string) => {
      if (path === '/breeds') return breedsDeferred.promise;
      if (path === '/coat-colors') return coatColorsDeferred.promise;
      if (path === '/master/genders') return gendersDeferred.promise;
      if (path === '/pedigrees/pedigree-id/{pedigreeId}') {
        callIdFetched = true;
        return { success: true, data: null };
      }
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

    expect(await screen.findByText('Call ID')).toBeInTheDocument();

    const bothInput = screen.getByLabelText('両親ID');
    fireEvent.change(bothInput, { target: { value: 'ABCD' } });

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(callIdFetched).toBe(false);
  }, 20000);
});
