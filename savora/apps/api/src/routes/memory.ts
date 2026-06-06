import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';
import { anthropic } from '../lib/anthropic';
interface RecipeHistoryWithRecipe {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: Date;
  recipe: {
    id: string;
    title: string;
    mood: string;
    cuisineInspiration: string;
    [key: string]: unknown;
  } | null;
}

interface SearchHistoryEntry {
  id: string;
  userId: string;
  city: string;
  createdAt: Date;
}

const router = Router();

// In-memory cache: userId -> { data, expiresAt }
const memoryCache = new Map<string, { data: MemoryVaultResponse; expiresAt: number }>();

interface MemoryChapter {
  title: string;
  period: string;
  description: string;
  dominantCuisines: string[];
  dominantMoods: string[];
  keyRecipes: string[];
}

interface MemoryVaultIntelligence {
  chapters: MemoryChapter[];
  strongestCities: { city: string; searchCount: number }[];
  topIngredients: string[];
  moodFrequency: Record<string, number>;
  seasonalPatterns: string;
  evolutionInsight: string;
  dataNote: string | null;
}

interface MemoryVaultResponse extends MemoryVaultIntelligence {
  isGated: boolean;
  gatedSince: string | null;
}

// GET /api/memory
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    // Check cache
    const cached = memoryCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    const subStatus = subscription?.status ?? 'free';
    const isFree = subStatus === 'free';

    // Date filter for free users
    const freeGateCutoff = new Date();
    freeGateCutoff.setDate(freeGateCutoff.getDate() - 7);

    const recipeHistoryWhere: Record<string, unknown> = { userId };
    if (isFree) {
      recipeHistoryWhere.createdAt = { gte: freeGateCutoff };
    }

    // Fetch all data in parallel
    const [recipeHistoryRaw, citySearches, favorites] = await Promise.all([
      prisma.recipeHistory.findMany({
        where: recipeHistoryWhere,
        orderBy: { createdAt: 'desc' },
        include: { recipe: true },
      }),
      prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.findMany({
        where: { userId },
      }),
    ]);

    // Compute mood frequency
    const moodFrequency: Record<string, number> = {};
    (recipeHistoryRaw as RecipeHistoryWithRecipe[]).forEach((h) => {
      const mood = h.recipe?.mood;
      if (mood) {
        moodFrequency[mood] = (moodFrequency[mood] ?? 0) + 1;
      }
    });

    // Compute cuisine frequency
    const cuisineFrequency: Record<string, number> = {};
    (recipeHistoryRaw as RecipeHistoryWithRecipe[]).forEach((h) => {
      const cuisine = h.recipe?.cuisineInspiration;
      if (cuisine) {
        cuisineFrequency[cuisine] = (cuisineFrequency[cuisine] ?? 0) + 1;
      }
    });

    // Compute monthly patterns (group recipes by YYYY-MM)
    const monthlyPatterns: Record<string, number> = {};
    (recipeHistoryRaw as RecipeHistoryWithRecipe[]).forEach((h) => {
      const month = h.createdAt.toISOString().slice(0, 7);
      monthlyPatterns[month] = (monthlyPatterns[month] ?? 0) + 1;
    });

    // Compute city frequency
    const cityFrequency: Record<string, number> = {};
    (citySearches as SearchHistoryEntry[]).forEach((s) => {
      cityFrequency[s.city] = (cityFrequency[s.city] ?? 0) + 1;
    });
    const cityFreqSorted = Object.entries(cityFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(([city, searchCount]) => ({ city, searchCount }));

    const recentRecipes = (recipeHistoryRaw as RecipeHistoryWithRecipe[]).slice(0, 20).map((h) => ({
      title: h.recipe?.title,
      mood: h.recipe?.mood,
      cuisine: h.recipe?.cuisineInspiration,
      date: h.createdAt.toISOString().slice(0, 10),
    }));

    const systemPrompt = `You are Savora's Taste Memory Intelligence. Analyze this user's food history and generate their Memory Vault intelligence. Be honest — if there's not enough data, say so in dataNote. Never fabricate patterns you cannot see in the data.

Respond ONLY with valid JSON. No markdown.`;

    const userMessage = `USER HISTORY:
Recipe count: ${recipeHistoryRaw.length}
Recent recipes: ${JSON.stringify(recentRecipes)}
City searches: ${JSON.stringify(cityFreqSorted)}
Mood frequency: ${JSON.stringify(moodFrequency)}
Cuisine frequency: ${JSON.stringify(cuisineFrequency)}
Monthly patterns: ${JSON.stringify(monthlyPatterns)}
Favorites count: ${favorites.length}

Return this schema:
{
  "chapters": [
    {
      "title": string,
      "period": string,
      "description": string,
      "dominantCuisines": string[],
      "dominantMoods": string[],
      "keyRecipes": string[]
    }
  ],
  "strongestCities": [{ "city": string, "searchCount": number }],
  "topIngredients": string[],
  "moodFrequency": { [mood: string]: number },
  "seasonalPatterns": string,
  "evolutionInsight": string,
  "dataNote": string | null
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.5,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const intelligence = JSON.parse(text) as MemoryVaultIntelligence;

    const result: MemoryVaultResponse = {
      ...intelligence,
      isGated: isFree,
      gatedSince: isFree ? freeGateCutoff.toISOString() : null,
    };

    // Cache for 6 hours
    memoryCache.set(userId, { data: result, expiresAt: Date.now() + 6 * 60 * 60 * 1000 });

    res.json(result);
  } catch (err) {
    console.error('Memory vault error:', err);
    res.status(500).json({ error: 'Failed to generate memory vault' });
  }
});

export default router;
