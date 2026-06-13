import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import type { GeneratedRecipe, RecipeFingerprint } from '@paliato/shared-types';
import { useRecipeStore } from '../stores/useRecipeStore';

interface GenerateRecipePayload {
  mood: string;
  excludeFingerprints?: RecipeFingerprint[];
}

export function useGenerateRecipe() {
  const setCurrentRecipe = useRecipeStore((s) => s.setCurrentRecipe);
  const addToHistory = useRecipeStore((s) => s.addToHistory);

  return useMutation({
    mutationFn: async (payload: GenerateRecipePayload): Promise<GeneratedRecipe> => {
      const { data } = await api.post<GeneratedRecipe>('/recipe/generate', payload);
      return data;
    },
    onSuccess: (recipe) => {
      setCurrentRecipe(recipe);
      addToHistory(recipe);
    },
  });
}

export function useFavoriteRecipe() {
  return useMutation({
    mutationFn: async (recipeId: string): Promise<{ favorited: boolean }> => {
      const { data } = await api.post<{ favorited: boolean }>(`/recipe/${recipeId}/favorite`);
      return data;
    },
  });
}
