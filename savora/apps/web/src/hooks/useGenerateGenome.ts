import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import type { CulinaryIdentityGenome, FlavorGenome } from '@savora/shared-types';

export interface OnboardingData {
  dietaryRestrictions: string[];
  dislikes: string[];
  cuisineAffinity: string[];
  behaviorScores: {
    adventurousness: number;
    comfortVsNovelty: number;
    luxuryVsRustic: number;
    complexityTolerance: number;
    cookingSkill: number;
  };
  diningContext: {
    social: 'social' | 'solitary';
    ritual: 'ritual' | 'spontaneous';
    formality: 'casual' | 'fineDining';
    pace: 'slow' | 'quick';
  };
  flavorScores: {
    saltScore: number;
    sweetScore: number;
    bitterScore: number;
    acidityScore: number;
    heatScore: number;
    aromaticSpiceScore: number;
    umamiScore: number;
    fatRichnessScore: number;
    smokeCharScore: number;
    fermentationScore: number;
    mineralCleanScore: number;
    aromaticIntensityScore: number;
  };
}

interface GenomeResponse {
  culinaryIdentity: CulinaryIdentityGenome;
  flavorGenome: FlavorGenome;
}

export function useGenerateGenome() {
  return useMutation<GenomeResponse, Error, OnboardingData>({
    mutationFn: async (onboardingData: OnboardingData) => {
      const response = await api.post<GenomeResponse>('/genome/generate', { onboardingData });
      return response.data;
    },
  });
}
