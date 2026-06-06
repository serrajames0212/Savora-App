export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface DietaryProfile {
  userId: string;
  restrictions: string[]; // vegan, vegetarian, pescatarian, halal, gluten-free, dairy-free, nut-free, shellfish-free
  dislikes: string[];
}

export interface CulinaryIdentityGenome {
  userId: string;
  identityTitle: string;
  identitySubtitle: string;
  cuisineAffinity: string[];
  behaviorScores: {
    adventurousness: number;
    comfortVsNovelty: number;
    luxuryVsRustic: number;
    complexityTolerance: number;
    socialVsSolitary: number;
    ritualVsSpontaneity: number;
    finingDiningAffinity: number;
  };
  diningAtmospherePreference: string[];
  moodFoodRelationship: string;
  evolutionNote: string;
}

export interface FlavorGenome {
  userId: string;
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
  dominantFlavors: string[];
  flavorPersonality: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  note: string;
}

export interface RecipeStep {
  step: number;
  instruction: string;
  technique: string;
}

export interface RecipeFingerprint {
  mood: string;
  coreBase: string;
  cuisineInspiration: string;
  cookingMethod: string;
  acidSource: string;
  aromaticLayer: string;
  textureElement: string;
  dietaryType: string;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  mood: string;
  cuisineInspiration: string;
  dietaryType: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  cookingTime: {
    prep: number;
    cook: number;
    total: number;
  };
  difficulty: 'low' | 'medium' | 'high';
  platingSuggestion: string;
  pairingSuggestion: string;
  whyThisFits: string;
  flavorProfile: {
    dominant: string[];
    secondary: string[];
    texture: string;
    aroma: string;
  };
  fingerprint: RecipeFingerprint;
}

export interface FavoriteMetadata {
  mood?: string;
  city?: string;
  restaurantName?: string;
  dishName?: string;
  cuisine?: string;
  [key: string]: unknown;
}

export interface Favorite {
  id: string;
  userId: string;
  itemType: 'recipe' | 'restaurant' | 'dish' | 'memory';
  itemId: string;
  metadata?: FavoriteMetadata | null;
  savedAt: string;
  recipe?: GeneratedRecipe | null;
}

export interface MemoryChapter {
  title: string;
  period: string;
  description: string;
  dominantCuisines: string[];
  dominantMoods: string[];
  keyRecipes: string[];
}

export interface MemoryVaultData {
  chapters: MemoryChapter[];
  strongestCities: { city: string; searchCount: number }[];
  topIngredients: string[];
  moodFrequency: Record<string, number>;
  seasonalPatterns: string;
  evolutionInsight: string;
  dataNote: string | null;
  isGated: boolean;
  gatedSince: string | null;
}

export type SubscriptionStatus = 'free' | 'reserve';

export interface Subscription {
  userId: string;
  status: SubscriptionStatus;
  renewalDate?: string;
  stripeCustomerId?: string;
}
