import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';
import { checkDietaryGuardrails } from '../services/dietary/guardrail';

const router = Router();

const FRIDGE_SYSTEM_PROMPT = `You are Savora's Fridge Intelligence Engine. Generate a single premium recipe using primarily the user's available ingredients. The recipe should feel intentional and elevated — not improvised. Apply the user's genome and dietary profile strictly. You may suggest a small number of pantry staples or missing ingredients that would significantly improve the dish, but the core recipe must be built around what they have.

GENOME ENFORCEMENT — NON-NEGOTIABLE:
If saltScore > 70: the dish must have a prominent saline element
If acidityScore > 70: the dish must have a distinct acid source
If umamiScore > 70: the dish must have depth through umami
If heatScore > 70: the dish must have deliberate heat
If smokeCharScore > 70: the dish must include a char or smoke element
If fatRichnessScore < 30: the dish must be lean
If sweetScore < 25: avoid sweet glazes or fruit-forward profiles
If mineralCleanScore > 70: the dish should feel clean and ingredient-forward

DIETARY GUARDRAILS: Never violate the user's dietary restrictions.

DIVERSITY: Recipe titles must be varied and not lead with the same cooking verb twice in a row.

Respond ONLY with valid JSON matching the schema. No markdown.`;

interface FridgeRecipe {
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
  fingerprint: {
    mood: string;
    coreBase: string;
    cuisineInspiration: string;
    cookingMethod: string;
    acidSource: string;
    aromaticLayer: string;
    textureElement: string;
    dietaryType: string;
  };
  usedIngredients: string[];
  missingIngredients: Array<{
    name: string;
    amount: string;
    isEssential: boolean;
    substituteWith: string | null;
  }>;
}

// POST /api/recipe/fridge
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { availableIngredients, mood } = req.body as {
    availableIngredients: string[];
    mood?: string;
  };

  try {
    // Subscription gate — same counter as regular recipe generation
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

    // Load user profiles
    const [dietaryProfile, culinaryIdentityGenome, flavorGenome] = await Promise.all([
      prisma.dietaryProfile.findUnique({ where: { userId } }),
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    const userMessage = `AVAILABLE INGREDIENTS: ${JSON.stringify(availableIngredients)}
MOOD: ${mood ?? 'open'}
DIETARY PROFILE: ${JSON.stringify(dietaryProfile ?? {})}
CULINARY IDENTITY GENOME: ${JSON.stringify(culinaryIdentityGenome ?? {})}
FLAVOR GENOME: ${JSON.stringify(flavorGenome ?? {})}

RECIPE SCHEMA:
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
  "fingerprint": { "mood": string, "coreBase": string, "cuisineInspiration": string, "cookingMethod": string, "acidSource": string, "aromaticLayer": string, "textureElement": string, "dietaryType": string },
  "usedIngredients": string[],
  "missingIngredients": [{ "name": string, "amount": string, "isEssential": boolean, "substituteWith": string | null }]
}`;

    const profile = {
      restrictions: dietaryProfile?.restrictions ?? [],
      dislikes: dietaryProfile?.dislikes ?? [],
    };

    let recipe: FridgeRecipe | null = null;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let raw: FridgeRecipe;
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          temperature: 0.8,
          system: FRIDGE_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        });
        const content = response.content[0];
        if (content.type !== 'text') throw new Error('Unexpected response type');
        const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
        raw = JSON.parse(text) as FridgeRecipe;
      } catch (parseErr) {
        if (attempt === maxAttempts - 1) throw parseErr;
        continue;
      }

      const guardrailResult = checkDietaryGuardrails(raw, profile);
      if (!guardrailResult.passed) {
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

    // Save to DB with source "fridge"
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
        flavorProfile: recipe.flavorProfile as unknown as Prisma.InputJsonValue,
        fingerprint: recipe.fingerprint as unknown as Prisma.InputJsonValue,
        source: 'fridge',
      },
    });

    await prisma.recipeHistory.create({
      data: { userId, recipeId: savedRecipe.id },
    });

    // Increment daily usage counter
    await prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { recipeGenerations: { increment: 1 } },
      create: { userId, date: today, recipeGenerations: 1 },
    });

    res.json({
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
      usedIngredients: recipe.usedIngredients,
      missingIngredients: recipe.missingIngredients,
    });
  } catch (err) {
    console.error('Fridge recipe generation error:', err);
    res.status(500).json({ error: 'Failed to generate fridge recipe' });
  }
});

export default router;
