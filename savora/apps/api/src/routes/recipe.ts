import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';
import { checkDietaryGuardrails } from '../services/dietary/guardrail';
import { checkFingerprintSimilarity } from '../services/recipe/fingerprint';
import { checkAndTriggerEvolution } from '../services/genome/evolutionTrigger';
import type { RecipeFingerprint, GeneratedRecipe } from '@paliato/shared-types';

const router = Router();

const SYSTEM_PROMPT = `You are Paliato's Recipe Intelligence Engine. Generate a single original recipe that precisely matches the user's profile. You must NEVER violate their dietary restrictions. You must avoid their disliked ingredients. Create something genuinely original that has not appeared in their recent history.

DIVERSITY RULES:
- Do not repeat the primary protein from the user's last 3 recipes unless the mood specifically demands it
- Do not repeat the same cooking method (e.g. "charred", "braised", "raw") in consecutive recipes
- Vary the cuisine region with each generation — if the last recipe was Mediterranean, do not return Mediterranean again
- Recipe titles must follow varied structures: do not always lead with a cooking verb, do not always name the protein first
- Examples of structurally varied titles: "Koji-Cured Salmon with Yuzu Kosho", "A Study in Fennel and Fire", "Green Tahini Bowl, Charred Aubergine", "Late-Summer Tomato Consommé"

GENOME ENFORCEMENT — NON-NEGOTIABLE:
If saltScore > 70: the dish must have a prominent saline element (sea salt finish, cured component, preserved ingredient, briny sauce)
If acidityScore > 70: the dish must have a distinct acid source (citrus, vinegar, ferment, wine reduction)
If umamiScore > 70: the dish must have depth through umami (aged cheese, miso, dashi, slow-cooked stock, dried mushroom)
If heatScore > 70: the dish must have deliberate heat (fresh chilli, fermented chilli paste, white pepper, Sichuan peppercorn)
If smokeCharScore > 70: the dish must include a char or smoke element (grilled, ember-cooked, smoked ingredient, char-finished)
If fatRichnessScore < 30: the dish must be lean — avoid butter-heavy, cream-heavy, or oil-saturated preparations
If sweetScore < 25: avoid sweet glazes, fruit-forward profiles, honey finishes
If mineralCleanScore > 70: the dish should feel clean, restrained, and ingredient-forward — no heavy sauces

These are hard constraints. A user with acidityScore: 80 and fatRichnessScore: 20 must NEVER receive a cream sauce pasta.

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
  "fingerprint": { "mood": string, "coreBase": string, "cuisineInspiration": string, "cookingMethod": string, "acidSource": string, "aromaticLayer": string, "textureElement": string, "dietaryType": string },
  "titleFingerprint": { "firstWord": string, "primaryProtein": string, "cookingVerb": string, "regionModifier": string }
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
  titleFingerprint: {
    firstWord: string;
    primaryProtein: string;
    cookingVerb: string;
    regionModifier: string;
  };
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

interface RecipeQualityScore {
  dietaryCompliance: boolean;
  genomeAlignmentScore: number;
  noveltyScore: number;
  overallPass: boolean;
}

function scoreRecipeQuality(
  recipe: RawRecipe,
  flavorGenome: { saltScore: number; acidityScore: number; umamiScore: number; heatScore: number; smokeCharScore: number; fatRichnessScore: number; sweetScore: number; mineralCleanScore: number } | null,
  recentFingerprints: RecipeFingerprint[],
  guardrailPassed: boolean
): RecipeQualityScore {
  const dietaryCompliance = guardrailPassed;

  // Check genome alignment (if no genome, skip enforcement)
  let alignmentChecks = 0;
  let alignmentPassed = 0;

  if (flavorGenome) {
    const fp = recipe.fingerprint;
    const ingredientText = recipe.ingredients.map((i: { name: string; note: string }) => `${i.name} ${i.note}`).join(' ').toLowerCase();

    if (flavorGenome.saltScore > 70) { alignmentChecks++; if (/salt|cured|brine|miso|soy|anchov|caper|preserved/.test(ingredientText)) alignmentPassed++; }
    if (flavorGenome.acidityScore > 70) { alignmentChecks++; if (/lemon|lime|vinegar|citrus|ferment|pickle|wine|tamarind/.test(ingredientText)) alignmentPassed++; }
    if (flavorGenome.umamiScore > 70) { alignmentChecks++; if (/miso|dashi|mushroom|parmesan|anchov|soy|stock|broth|aged|dried/.test(ingredientText)) alignmentPassed++; }
    if (flavorGenome.heatScore > 70) { alignmentChecks++; if (/chilli|chili|pepper|sriracha|harissa|gochujang|jalapeño|scotch|cayenne/.test(ingredientText)) alignmentPassed++; }
    if (flavorGenome.smokeCharScore > 70) { alignmentChecks++; if (/smoked|charred|grilled|ember|bbq|chipotle|char/.test(ingredientText) || /char|grill|smoke/.test(fp.cookingMethod.toLowerCase())) alignmentPassed++; }
  }

  const genomeAlignmentScore = alignmentChecks === 0 ? 100 : Math.round((alignmentPassed / alignmentChecks) * 100);

  // Novelty: count matching fields against recent fingerprints
  let minSimilarity = 0;
  if (recentFingerprints.length > 0) {
    const similarities = recentFingerprints.slice(0, 10).map((prev) => {
      let matches = 0;
      const fields: (keyof RecipeFingerprint)[] = ['coreBase', 'cookingMethod', 'cuisineInspiration'];
      for (const f of fields) { if (recipe.fingerprint[f] === prev[f]) matches++; }
      return matches;
    });
    minSimilarity = Math.min(...similarities);
  }
  const noveltyScore = minSimilarity >= 3 ? 20 : minSimilarity === 2 ? 60 : minSimilarity === 1 ? 80 : 100;

  const overallPass = dietaryCompliance && genomeAlignmentScore >= 65 && noveltyScore >= 50;
  return { dietaryCompliance, genomeAlignmentScore, noveltyScore, overallPass };
}

function checkTitleFingerprintSimilarity(
  current: RawRecipe['titleFingerprint'],
  recentRecipes: RawRecipe[]
): boolean {
  if (!current) return false;
  const last30 = recentRecipes.slice(0, 30);
  for (const prev of last30) {
    if (!prev.titleFingerprint) continue;
    let matches = 0;
    if (current.firstWord === prev.titleFingerprint.firstWord) matches++;
    if (current.primaryProtein === prev.titleFingerprint.primaryProtein) matches++;
    if (current.cookingVerb === prev.titleFingerprint.cookingVerb) matches++;
    if (current.regionModifier === prev.titleFingerprint.regionModifier) matches++;
    if (matches >= 3) return true;
  }
  return false;
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

    const typedFlavorGenome = flavorGenome as { saltScore: number; acidityScore: number; umamiScore: number; heatScore: number; smokeCharScore: number; fatRichnessScore: number; sweetScore: number; mineralCleanScore: number } | null;

    let recipe: RawRecipe | null = null;
    let bestAttempt: { recipe: RawRecipe; score: number } | null = null;
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

      // Fingerprint check
      const fingerprintResult = checkFingerprintSimilarity(raw.fingerprint, recentFingerprints);
      if (fingerprintResult.isTooSimilar) {
        if (attempt === maxAttempts - 1 && !recipe) {
          recipe = bestAttempt?.recipe ?? raw;
          console.warn(`[recipe] All attempts failed quality checks — using best attempt for user ${userId}`);
        }
        continue;
      }

      // Quality score
      const qualityScore = scoreRecipeQuality(raw, typedFlavorGenome, recentFingerprints, guardrailResult.passed);
      const combinedScore = qualityScore.genomeAlignmentScore + qualityScore.noveltyScore;

      if (!bestAttempt || combinedScore > bestAttempt.score) {
        bestAttempt = { recipe: raw, score: combinedScore };
      }

      if (!qualityScore.overallPass) {
        if (attempt === maxAttempts - 1) {
          console.warn(`[recipe] All attempts failed overallPass — using best attempt (score: ${bestAttempt.score}) for user ${userId}`);
          recipe = bestAttempt.recipe;
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
        flavorProfile: recipe.flavorProfile as unknown as Prisma.InputJsonValue,
        fingerprint: recipe.fingerprint as unknown as Prisma.InputJsonValue,
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

    // Fire-and-forget evolution trigger
    checkAndTriggerEvolution(userId, prisma).catch(() => {});
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
