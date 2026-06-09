import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface SuggestedDish {
  dishName: string;
  slug: string;
  flavorProfile: string[];
  whyThisFits: string;
  dietaryCompliance: string;
  confidence: number;
}

export interface DiscoveryRestaurant {
  name: string;
  slug: string;
  cuisine: string;
  atmosphere: string[];
  matchScore: number;
  whyThisFits: string;
  suggestedDishes: SuggestedDish[];
  isAiGenerated?: boolean;
}

export interface CityData {
  cityIdentity: string;
  seasonalNote: string;
  restaurants: DiscoveryRestaurant[];
  limitedCoverageNote: string | null;
  aiDisclaimer?: boolean;
}

export function useCityData(city: string) {
  return useQuery<CityData>({
    queryKey: ['city', city],
    queryFn: async () => {
      const { data } = await api.post<CityData>('/discovery/city', { city });
      return data;
    },
    enabled: !!city,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: false,
  });
}

export function useDiscoverySuggestions() {
  return useQuery<{ cities: string[] }>({
    queryKey: ['discovery', 'suggestions'],
    queryFn: async () => {
      const { data } = await api.get<{ cities: string[] }>('/discovery/suggestions');
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

export function useRecentSearches() {
  return useQuery<{ cities: string[] }>({
    queryKey: ['discovery', 'recent'],
    queryFn: async () => {
      const { data } = await api.get<{ cities: string[] }>('/discovery/recent');
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}
