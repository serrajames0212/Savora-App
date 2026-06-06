import { create } from 'zustand';
import type { GeneratedRecipe } from '@savora/shared-types';

interface RecipeStore {
  currentRecipe: GeneratedRecipe | null;
  recentRecipes: GeneratedRecipe[];
  setCurrentRecipe: (recipe: GeneratedRecipe) => void;
  addToHistory: (recipe: GeneratedRecipe) => void;
}

export const useRecipeStore = create<RecipeStore>()((set) => ({
  currentRecipe: null,
  recentRecipes: [],
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  addToHistory: (recipe) =>
    set((state) => ({
      recentRecipes: [recipe, ...state.recentRecipes.filter((r) => r.id !== recipe.id)].slice(0, 20),
    })),
}));
