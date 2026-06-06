import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface Recommendation {
  city: string;
  dish: string;
  matchScore: number;
}

export interface JourneyData {
  recentRecipe: { id: string; title: string; mood: string; cuisineInspiration: string } | null;
  recentCity: string | null;
  lastMood: string | null;
  lastFavorite: { id: string; title: string; mood: string; savedAt: string } | null;
}

export interface DiscoveryPreview {
  city: string;
  atmosphereDescription: string;
  topDish: string;
}

export interface DailyInsight {
  insight: string;
  actionLabel: string;
  actionMood: string;
}

export interface SeasonalInsight {
  insight: string;
  season: string;
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export function useRecommendation() {
  return useQuery<Recommendation>({
    queryKey: ['home', 'recommendation'],
    queryFn: async () => {
      const res = await api.get<Recommendation>('/home/recommendation');
      return res.data;
    },
    staleTime: SIX_HOURS_MS,
    retry: 1,
  });
}

export function useJourney() {
  return useQuery<JourneyData>({
    queryKey: ['home', 'journey'],
    queryFn: async () => {
      const res = await api.get<JourneyData>('/home/journey');
      return res.data;
    },
    staleTime: FIVE_MINUTES_MS,
    retry: 1,
  });
}

export function useDiscoveryPreview() {
  return useQuery<DiscoveryPreview>({
    queryKey: ['home', 'discovery-preview'],
    queryFn: async () => {
      const res = await api.get<DiscoveryPreview>('/home/discovery-preview');
      return res.data;
    },
    staleTime: TWENTY_FOUR_HOURS_MS,
    retry: 1,
  });
}

export function useDailyInsight() {
  return useQuery<DailyInsight>({
    queryKey: ['insights', 'daily'],
    queryFn: async () => {
      const res = await api.get<DailyInsight>('/insights/daily');
      return res.data;
    },
    staleTime: TWENTY_FOUR_HOURS_MS,
    retry: 1,
  });
}

export function useSeasonalInsight() {
  return useQuery<SeasonalInsight>({
    queryKey: ['insights', 'seasonal'],
    queryFn: async () => {
      const res = await api.get<SeasonalInsight>('/insights/seasonal');
      return res.data;
    },
    staleTime: SEVEN_DAYS_MS,
    retry: 1,
  });
}
