import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

interface IdentityShift {
  period: string;
  what: string;
  significance: 'minor' | 'moderate' | 'major';
}

interface FlavorShift {
  axis: string;
  direction: 'increased' | 'decreased';
  amount: number;
  period: string;
}

export interface EvolutionData {
  hasEnoughData: boolean;
  dataNote: string | null;
  identityShifts: IdentityShift[];
  flavorShifts: FlavorShift[];
  overallNarrative: string;
  currentMomentum: string;
  weeklyInsight: string | null;
}

export interface GatedEvolutionResponse {
  gated: true;
  feature: 'evolution';
}

export function useEvolution() {
  return useQuery<EvolutionData | GatedEvolutionResponse>({
    queryKey: ['genome', 'evolution'],
    queryFn: async () => {
      try {
        const { data } = await api.get<EvolutionData>('/genome/evolution');
        return data;
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status: number; data: GatedEvolutionResponse } };
        if (axiosErr?.response?.status === 402) {
          return axiosErr.response.data;
        }
        throw err;
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}

export function useWeeklyInsight() {
  return useQuery<{ insight: string | null; isNew: boolean }>({
    queryKey: ['genome', 'evolution', 'weekly-insight'],
    queryFn: async () => {
      const { data } = await api.get<{ insight: string | null; isNew: boolean }>(
        '/genome/evolution/weekly-insight'
      );
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useIdentityWhy() {
  return useQuery<{ explanation: string | null }>({
    queryKey: ['genome', 'identity', 'why'],
    queryFn: async () => {
      const { data } = await api.get<{ explanation: string | null }>('/genome/identity/why');
      return data;
    },
    staleTime: 7 * 24 * 60 * 60 * 1000,
  });
}
