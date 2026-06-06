import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { MemoryVaultData } from '@savora/shared-types';

export function useMemoryVault() {
  return useQuery<MemoryVaultData>({
    queryKey: ['memory-vault'],
    queryFn: async () => {
      const { data } = await api.get<MemoryVaultData>('/memory');
      return data;
    },
    staleTime: 6 * 60 * 60 * 1000, // 6 hours — matches server cache
    retry: false,
  });
}
