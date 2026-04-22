import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import { PedigreeList } from '../PedigreeList';
import type { PedigreeListResponse } from '@/lib/api/hooks/use-pedigrees';
import { apiClient, apiRequest } from '@/lib/api/client';
import {
  convertPositionsConfigToLayout,
  extractOffsetFromConfig,
  generatePedigreePdf,
  mapBackendPedigreeToPdfData,
  openPedigreePdfInNewTab,
} from '@/lib/pdf';

let pushMock: jest.Mock<void, [string]>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (href: string) => pushMock(href),
  }),
}));

jest.mock('@mantine/notifications', () => ({
  notifications: { show: jest.fn() },
}));

// named export の関数は spyOn で redefine できないため factory でモックする。
// apiClient 等の他エクスポートは実物をそのまま残して他テストを壊さない。
jest.mock('@/lib/api/client', () => {
  const actual = jest.requireActual('@/lib/api/client');
  return {
    ...actual,
    apiRequest: jest.fn(),
  };
});

jest.mock('@/lib/pdf', () => ({
  convertPositionsConfigToLayout: jest.fn(),
  extractOffsetFromConfig: jest.fn(),
  generatePedigreePdf: jest.fn(),
  mapBackendPedigreeToPdfData: jest.fn(),
  openPedigreePdfInNewTab: jest.fn(),
}));

const apiRequestMock = apiRequest as jest.MockedFunction<typeof apiRequest>;
const convertPositionsConfigToLayoutMock = convertPositionsConfigToLayout as jest.MockedFunction<typeof convertPositionsConfigToLayout>;
const extractOffsetFromConfigMock = extractOffsetFromConfig as jest.MockedFunction<typeof extractOffsetFromConfig>;
const mapBackendPedigreeToPdfDataMock = mapBackendPedigreeToPdfData as jest.MockedFunction<typeof mapBackendPedigreeToPdfData>;
const generatePedigreePdfMock = generatePedigreePdf as jest.MockedFunction<typeof generatePedigreePdf>;
const openPedigreePdfInNewTabMock = openPedigreePdfInNewTab as jest.MockedFunction<typeof openPedigreePdfInNewTab>;

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

  it('血統書PDFを印刷をクリックすると印刷設定と血統書データを取得し pdf-lib で生成した PDF を新規タブで開く', async () => {
    const listResponse: PedigreeListResponse = {
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

    // 一覧取得は apiClient.get (React Query フック経由) をモック
    jest.spyOn(apiClient, 'get').mockResolvedValue(listResponse);

    // PDF 生成時の 2 本の API 呼び出し（print-settings と pedigree-id/:id）は
    // apiRequest をモックし、URL で分岐してそれぞれのペイロードを返す。
    const printSettingsPayload = { success: true, data: { offsetX: 0, offsetY: 0 } };
    const pedigreeDetailPayload = { success: true, data: { pedigreeId: 'WCA-0003', catName: 'テスト猫3' } };
    apiRequestMock.mockImplementation((path: string) => {
      if (path === '/pedigrees/print-settings') {
        return Promise.resolve(printSettingsPayload) as ReturnType<typeof apiRequest>;
      }
      if (path === '/pedigrees/pedigree-id/WCA-0003') {
        return Promise.resolve(pedigreeDetailPayload) as ReturnType<typeof apiRequest>;
      }
      return Promise.resolve({ success: false, error: 'unexpected path' }) as ReturnType<typeof apiRequest>;
    });

    // pdf-lib への受け渡しは副作用を避けるため全てモック（上の jest.mock で差し替え済み）
    const fakeBytes = new Uint8Array([37, 80, 68, 70]); // "%PDF"
    convertPositionsConfigToLayoutMock.mockReturnValue(
      {} as ReturnType<typeof convertPositionsConfigToLayout>,
    );
    extractOffsetFromConfigMock.mockReturnValue({ offsetXmm: 0, offsetYmm: 0 });
    mapBackendPedigreeToPdfDataMock.mockReturnValue({ catName: 'テスト猫3' });
    generatePedigreePdfMock.mockResolvedValue(fakeBytes);
    openPedigreePdfInNewTabMock.mockImplementation(() => undefined);

    renderWithProviders(<PedigreeList />);

    await screen.findByLabelText('血統書PDFを印刷');

    const user = userEvent.setup();
    await user.click(screen.getByLabelText('血統書PDFを印刷'));

    // 両 API が期待した path で呼ばれている
    expect(apiRequestMock).toHaveBeenCalledWith('/pedigrees/print-settings');
    expect(apiRequestMock).toHaveBeenCalledWith('/pedigrees/pedigree-id/WCA-0003');

    // 取得したデータが各ヘルパに渡り、生成が走り、新タブで開かれる
    expect(convertPositionsConfigToLayoutMock).toHaveBeenCalledWith(printSettingsPayload.data);
    expect(extractOffsetFromConfigMock).toHaveBeenCalledWith(printSettingsPayload.data);
    expect(mapBackendPedigreeToPdfDataMock).toHaveBeenCalledWith(pedigreeDetailPayload.data);
    expect(generatePedigreePdfMock).toHaveBeenCalled();
    expect(openPedigreePdfInNewTabMock).toHaveBeenCalledWith(fakeBytes);
  });
});
