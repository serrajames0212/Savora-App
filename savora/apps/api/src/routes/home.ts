import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';

const router = Router();

interface RecommendationResult {
  city: string;
  dish: string;
  matchScore: number;
}

interface DiscoveryPreviewResult {
  city: string;
  atmosphereDescription: string;
  topDish: string;
}

// In-memory caches
const recommendationCache = new Map<string, { result: RecommendationResult; cachedAt: number }>();
const discoveryCache = new Map<string, { result: DiscoveryPreviewResult; cachedAt: number }>();

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

async function callClaude<T>(systemPrompt: string, userMessage: string): Promise<T> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    temperature: 0.7,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(text) as T;
}

router.get('/recommendation', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const cached = recommendationCache.get(userId);
  if (cached && Date.now() - cached.cachedAt < SIX_HOURS_MS) {
    res.json(cached.result);
    return;
  }

  try {
    const [identity, flavor] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    const genomeContext = JSON.stringify({ identity, flavor });

    const result = await callClaude<RecommendationResult>(
      `You are Savora's Tonight's Recommendation engine. Based on the user's culinary genome, suggest a perfect dish to seek tonight, along with a city where it shines. Return only JSON: { "city": string, "dish": string, "matchScore": number } where matchScore is 0-100.`,
      genomeContext
    );

    recommendationCache.set(userId, { result, cachedAt: Date.now() });
    res.json(result);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
});

router.get('/discovery-preview', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const cached = discoveryCache.get(userId);
  if (cached && Date.now() - cached.cachedAt < TWENTY_FOUR_HOURS_MS) {
    res.json(cached.result);
    return;
  }

  try {
    const [identity, flavor] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    const genomeContext = JSON.stringify({ identity, flavor });

    const result = await callClaude<DiscoveryPreviewResult>(
      `You are Savora's Discovery engine. Pick an aspirational city that deeply aligns with the user's culinary genome. Return only JSON: { "city": string, "atmosphereDescription": string, "topDish": string }`,
      genomeContext
    );

    discoveryCache.set(userId, { result, cachedAt: Date.now() });
    res.json(result);
  } catch (err) {
    console.error('Discovery preview error:', err);
    res.status(500).json({ error: 'Failed to generate discovery preview' });
  }
});

router.get('/journey', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const [lastRecipeHistory, lastSearch, lastFavorite] = await Promise.all([
      prisma.recipeHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { recipe: true },
      }),
      prisma.searchHistory.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.findFirst({
        where: { userId },
        orderBy: { savedAt: 'desc' },
        include: { recipe: true },
      }),
    ]);

    res.json({
      recentRecipe: lastRecipeHistory?.recipe
        ? {
            id: lastRecipeHistory.recipe.id,
            title: lastRecipeHistory.recipe.title,
            mood: lastRecipeHistory.recipe.mood,
            cuisineInspiration: lastRecipeHistory.recipe.cuisineInspiration,
          }
        : null,
      recentCity: lastSearch?.city ?? null,
      lastMood: lastRecipeHistory?.recipe?.mood ?? null,
      lastFavorite: lastFavorite?.recipe
        ? {
            id: lastFavorite.recipe.id,
            title: lastFavorite.recipe.title,
            mood: lastFavorite.recipe.mood,
            savedAt: lastFavorite.savedAt,
          }
        : null,
    });
  } catch (err) {
    console.error('Journey error:', err);
    res.status(500).json({ error: 'Failed to fetch journey' });
  }
});

export default router;
