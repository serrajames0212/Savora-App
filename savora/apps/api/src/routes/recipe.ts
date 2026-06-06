import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';
import { checkDietaryGuardrails } from '../services/dietary/guardrail';
import { checkFingerprintSimilarity } from '../services/recipe/fingerprint';
import type { RecipeFingerprint, GeneratedRecipe } from '@savora/shared-types';

const router = Router();

const SYSTEM_PROMPT = `You are Savora's Recipe Intelligence Engine. Generate a single original recipe that precisely matches the user's profile. You must NEVER violate their dietary restrictions. You must avoid their disliked ingredients. Create something genuinely original that has not appeared in their recent history.

Respond ONLY with a valid JSON object matching the recipe schema. No markdown, no preamble, no explanation.`;

function buildUserMessage(
  mood: string,
  dietaryProfile: object,
  culinaryIdentityGenome: object,
  flavorGenome: object,
  recentFingerprints: RecipeFingerprint[]
): string {
  return `MOOD: ${mood}

DIETARY PROFILE:
${JSON.stringify(dietaryProfile)}

CULINARY IDENTITY GENOME:
${JSON.stringify(culinaryIdentityGenome)}

FLAVOR GENOME:
${JSON.stringify(flavorGenome)}

RECENT RECIPE FINGERPRINTS (DO NOT REPEAT THESE COMBINATIONS):
${JSON.stringify(recentFingerprints)}

RECIPE SCHEMA TO RETURN:
{
  "title": string,
  "description": string,
  "mood": string,
  "cuisineInspiration": string,
  "dietaryType": string,
  "ingredients": [{ "name": string, "amount": string, "unit": string, "note": string }],
  "steps": [{ "step": number, "instruction": string, "technique": string }],
  "cookingTime": { "prep": number, "cook": number, "total": number },
  "difficulty": "low" | "medium" | "high",
  "platingSuggestion": string,
  "pairingSuggestion": string,
  "whyThisFits": string,
  "flavorProfile": { "dominant": string[], "secondary": string[], "texture": string, "aroma": string },
  "fingerprint": { "mood": string, "coreBase": string, "cuisineInspiration": string, "cookingMethod": string, "acidSource": string, "aromaticLayer": string, "textureElement": string, "dietaryType": string }
}`;
}

interface RawRecipe {
  title: string;
  description: string;
  mood: string;
  cuisineInspiration: string;
  dietaryType: string;
  ingredients: Array<{ name: string; amount: string; unit: string; note: string }>;
  steps: Array<{ step: number; instruction: string; technique: string }>;
  cookingTime: { prep: number; cook: number; total: number };
  difficulty: 'low' | 'medium' | 'high';
  platingSuggestion: string;
  pairingSuggestion: string;
  whyThisFits: string;
  flavorProfile: { dominant: string[]; secondary: string[]; texture: string; aroma: string };
  fingerprint: RecipeFingerprint;
}

async function callClaudeForRecipe(userMessage: string): Promise<RawRecipe> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.8,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });
  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(text) as RawRecipe;
}

// POST /api/recipe/generate
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { mood, excludeFingerprints = [] } = req.body as {
    mood: string;
    excludeFingerprints?: RecipeFingerprint[];
  };

  try {
    // Subscription gate
    const today = new Date().toISOString().slice(0, 10);
    const [dailyUsage, subscription] = await Promise.all([
      prisma.dailyUsage.findUnique({ where: { userId_date: { userId, date: today } } }),
      prisma.subscription.findUnique({ where: { userId } }),
    ]);

    const subStatus = subscription?.status ?? 'free';
    if ((dailyUsage?.recipeGenerations ?? 0) >= 3 && subStatus === 'free') {
      res.status(402).json({ gated: true, feature: 'recipe_generation' });
      return;
    }

    // Load profiles
    const [dietaryProfile, culinaryIdentityGenome, flavorGenome] = await Promise.all([
      prisma.dietaryProfile.findUnique({ where: { userId } }),
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    // Load recent fingerprints
    const recentHistoryItems = await prisma.recipeHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { recipe: { select: { fingerprint: true } } },
    });

    const recentFingerprints: RecipeFingerprint[] = [
      ...excludeFingerprints,
      ...recentHistoryItems
        .map((h: { recipe: { fingerprint: unknown } }) => h.recipe.fingerprint as unknown as RecipeFingerprint)
        .filter(Boolean),
    ];

    const profile = {
      restrictions: dietaryProfile?.restrictions ?? [],
      dislikes: dietaryProfile?.dislikes ?? [],
    };

    const userMessage = buildUserMessage(
      mood,
      dietaryProfile ?? {},
      culinaryIdentityGenome ?? {},
      flavorGenome ?? {},
      recentFingerprints
    );

    let recipe: RawRecipe | null = null;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let raw: RawRecipe;
      try {
        raw = await callClaudeForRecipe(userMessage);
      } catch (parseErr) {
        if (attempt === maxAttempts - 1) throw parseErr;
        continue;
      }

      // Guardrail check
      const guardrailResult = checkDietaryGuardrails(raw, profile);
      if (!guardrailResult.passed) {
        if (attempt === maxAttempts - 1) {
          // Use it anyway — best effort
          recipe = raw;
          break;
        }
        continue;
      }

      // Fingerprint check
      const fingerprintResult = checkFingerprintSimilarity(raw.fingerprint, recentFingerprints);
      if (fingerprintResult.isTooSimilar) {
        if (attempt === maxAttempts - 1) {
          recipe = raw;
          break;
        }
        continue;
      }

      recipe = raw;
      break;
    }

    if (!recipe) {
      res.status(500).json({ error: 'Failed to generate a valid recipe' });
      return;
    }

    // Save to DB
    const savedRecipe = await prisma.generatedRecipe.create({
      data: {
        userId,
        title: recipe.title,
        description: recipe.description,
        mood: recipe.mood,
        cuisineInspiration: recipe.cuisineInspiration,
        dietaryType: recipe.dietaryType,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        prepTime: recipe.cookingTime.prep,
        cookTime: recipe.cookingTime.cook,
        totalTime: recipe.cookingTime.total,
        difficulty: recipe.difficulty,
        platingSuggestion: recipe.platingSuggestion,
        pairingSuggestion: recipe.pairingSuggestion,
        whyThisFits: recipe.whyThisFits,
        flavorProfile: recipe.flavorProfile,
        fingerprint: recipe.fingerprint,
      },
    });

    await prisma.recipeHistory.create({
      data: { userId, recipeId: savedRecipe.id },
    });

    // Increment daily usage
    await prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { recipeGenerations: { increment: 1 } },
      create: { userId, date: today, recipeGenerations: 1 },
    });

    const responseRecipe: GeneratedRecipe = {
      id: savedRecipe.id,
      title: savedRecipe.title,
      description: savedRecipe.description,
      mood: savedRecipe.mood,
      cuisineInspiration: savedRecipe.cuisineInspiration,
      dietaryType: savedRecipe.dietaryType,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      platingSuggestion: savedRecipe.platingSuggestion,
      pairingSuggestion: savedRecipe.pairingSuggestion,
      whyThisFits: savedRecipe.whyThisFits,
      flavorProfile: recipe.flavorProfile,
      fingerprint: recipe.fingerprint,
    };

    res.json(responseRecipe);
  } catch (err) {
    console.error('Recipe generation error:', err);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// POST /api/recipe/:id/favorite
router.post('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id: recipeId } = req.params;

  try {
    const existing = await prisma.favorite.findFirst({
      where: { userId, itemId: recipeId, itemType: 'recipe' },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: { userId, itemType: 'recipe', itemId: recipeId },
      });
      res.json({ favorited: true });
    }
  } catch (err) {
    console.error('Favorite toggle error:', err);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// GET /api/recipe/history
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const historyItems = await prisma.recipeHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { recipe: true },
    });

    type HistoryItemWithRecipe = { recipe: { id: string; title: string; description: string; mood: string; cuisineInspiration: string; dietaryType: string; ingredients: unknown; steps: unknown; prepTime: number; cookTime: number; totalTime: number; difficulty: string; platingSuggestion: string; pairingSuggestion: string; whyThisFits: string; flavorProfile: unknown; fingerprint: unknown } };
    const recipes: GeneratedRecipe[] = historyItems.map((h: HistoryItemWithRecipe) => {
      const r = h.recipe;
      const ingredients = r.ingredients as unknown as GeneratedRecipe['ingredients'];
      const steps = r.steps as unknown as GeneratedRecipe['steps'];
      const flavorProfile = r.flavorProfile as unknown as GeneratedRecipe['flavorProfile'];
      const fingerprint = r.fingerprint as unknown as RecipeFingerprint;
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        mood: r.mood,
        cuisineInspiration: r.cuisineInspiration,
        dietaryType: r.dietaryType,
        ingredients,
        steps,
        cookingTime: { prep: r.prepTime, cook: r.cookTime, total: r.totalTime },
        difficulty: r.difficulty as GeneratedRecipe['difficulty'],
        platingSuggestion: r.platingSuggestion,
        pairingSuggestion: r.pairingSuggestion,
        whyThisFits: r.whyThisFits,
        flavorProfile,
        fingerprint,
      };
    });

    res.json(recipes);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
