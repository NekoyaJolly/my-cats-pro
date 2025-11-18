import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { apiRequest, type ApiResponse } from '../client';

export type DisplayNameMode = 'CANONICAL' | 'CODE_AND_NAME' | 'CUSTOM';

export interface MasterDataItem {
  code: number;
  name: string;
  displayName?: string | null;
  displayNameMode?: DisplayNameMode;
  isOverridden?: boolean;
}

const MASTER_DATA_STALE_TIME = 1000 * 60 * 10; // 10 minutes

async function fetchBreedMasterData() {
  return apiRequest<MasterDataItem[]>('/breeds/master-data');
}

async function fetchCoatColorMasterData() {
  return apiRequest<MasterDataItem[]>('/coat-colors/master-data');
}

export function useBreedMasterData(
  options?: Omit<UseQueryOptions<ApiResponse<MasterDataItem[]>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['master-data', 'breeds'],
    queryFn: fetchBreedMasterData,
    staleTime: MASTER_DATA_STALE_TIME,
    gcTime: MASTER_DATA_STALE_TIME,
    ...options,
  });
}

export function useCoatColorMasterData(
  options?: Omit<UseQueryOptions<ApiResponse<MasterDataItem[]>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['master-data', 'coat-colors'],
    queryFn: fetchCoatColorMasterData,
    staleTime: MASTER_DATA_STALE_TIME,
    gcTime: MASTER_DATA_STALE_TIME,
    ...options,
  });
}
