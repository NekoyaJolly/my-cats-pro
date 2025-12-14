import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import { PedigreeList } from '../PedigreeList';
import type { PedigreeListResponse } from '@/lib/api/hooks/use-pedigrees';
import { apiClient } from '@/lib/api/client';

let pushMock: jest.Mock<void, [string]>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (href: string) => pushMock(href),
  }),
}));

describe('PedigreeList', () => {
  const renderWithProviders = (ui: ReactElement) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>{ui}</MantineProvider>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    pushMock = jest.fn<void, [string]>();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('コピーをクリックすると register へ遷移する', async () => {
    const response: PedigreeListResponse = {
      success: true,
      data: [
        {
          id: 'p-1',
          pedigreeId: 'WCA-0001',
          catName: 'テスト猫',
          breedCode: 1,
          genderCode: 1,
          birthDate: '2025-01-01',
          breederName: '繁殖者',
          ownerName: '飼い主',
          registrationDate: '2025-02-01',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };

    jest.spyOn(apiClient, 'get').mockResolvedValue(response);

    renderWithProviders(<PedigreeList />);

    await screen.findByLabelText('新規登録にコピー');

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('新規登録にコピー'));

    expect(pushMock).toHaveBeenCalledWith(
      '/pedigrees?tab=register&copyFromId=p-1',
    );
  });

  it('家系図を見るをクリックすると onSelectFamilyTree が呼ばれる', async () => {
    const response: PedigreeListResponse = {
      success: true,
      data: [
        {
          id: 'p-2',
          pedigreeId: 'WCA-0002',
          catName: 'テスト猫2',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };

    jest.spyOn(apiClient, 'get').mockResolvedValue(response);

    const onSelectFamilyTree = jest.fn<void, [string]>();

    renderWithProviders(<PedigreeList onSelectFamilyTree={onSelectFamilyTree} />);

    await screen.findByLabelText('家系図を見る');

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('家系図を見る'));

    expect(onSelectFamilyTree).toHaveBeenCalledWith('p-2');
  });

  it('血統書PDFを印刷をクリックするとPDFを新規タブで開く', async () => {
    const response: PedigreeListResponse = {
      success: true,
      data: [
        {
          id: 'p-3',
          pedigreeId: 'WCA-0003',
          catName: 'テスト猫3',
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
    };

    jest.spyOn(apiClient, 'get').mockResolvedValue(response);

    const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'http://example.test';

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => window);

    renderWithProviders(<PedigreeList />);

    await screen.findByLabelText('血統書PDFを印刷');

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('血統書PDFを印刷'));

    expect(openSpy).toHaveBeenCalledWith(
      'http://example.test/api/v1/pedigrees/pedigree-id/WCA-0003/pdf',
      '_blank',
    );

    openSpy.mockRestore();
    if (typeof originalApiUrl === 'string') {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    } else {
      delete process.env.NEXT_PUBLIC_API_URL;
    }
  });
});
