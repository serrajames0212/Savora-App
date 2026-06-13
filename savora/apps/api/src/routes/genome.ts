import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';

const router = Router();

const onboardingDataSchema = z.object({
  dietaryRestrictions: z.array(z.string()),
  dislikes: z.array(z.string()),
  cuisineAffinity: z.array(z.string()),
  behaviorScores: z.object({
    adventurousness: z.number(),
    comfortVsNovelty: z.number(),
    luxuryVsRustic: z.number(),
    complexityTolerance: z.number(),
    cookingSkill: z.number(),
  }),
  diningContext: z.object({
    social: z.enum(['social', 'solitary']),
    ritual: z.enum(['ritual', 'spontaneous']),
    formality: z.enum(['casual', 'fineDining']),
    pace: z.enum(['slow', 'quick']),
  }),
  flavorScores: z.object({
    saltScore: z.number(),
    sweetScore: z.number(),
    bitterScore: z.number(),
    acidityScore: z.number(),
    heatScore: z.number(),
    aromaticSpiceScore: z.number(),
    umamiScore: z.number(),
    fatRichnessScore: z.number(),
    smokeCharScore: z.number(),
    fermentationScore: z.number(),
    mineralCleanScore: z.number(),
    aromaticIntensityScore: z.number(),
  }),
});

type OnboardingData = z.infer<typeof onboardingDataSchema>;

async function callClaudeWithRetry<T>(
  systemPrompt: string,
  userMessage: string,
  maxRetries = 3
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        temperature: 0.5,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Strip potential markdown code fences
      const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      const parsed = JSON.parse(text) as T;
      return parsed;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  throw lastError ?? new Error('Failed after retries');
}

const CULINARY_IDENTITY_SYSTEM = `You are Paliato's Culinary Identity Engine. Based on the user's onboarding data, generate their Culinary Identity Genome as a JSON object.

Respond ONLY with a valid JSON object. No markdown, no explanation.

Schema:
{
  "identityTitle": string,
  "identitySubtitle": string,
  "cuisineAffinity": string[],
  "behaviorScores": {
    "adventurousness": number,
    "comfortVsNovelty": number,
    "luxuryVsRustic": number,
    "complexityTolerance": number,
    "socialVsSolitary": number,
    "ritualVsSpontaneity": number,
    "finingDiningAffinity": number
  },
  "diningAtmospherePreference": string[],
  "moodFoodRelationship": string,
  "evolutionNote": string
}`;

const FLAVOR_GENOME_SYSTEM = `You are Paliato's Flavor Genome Engine. Based on the user's flavor preference sliders, generate their Flavor Genome as a JSON object.

Respond ONLY with a valid JSON object. No markdown, no explanation.

Schema:
{
  "saltScore": number,
  "sweetScore": number,
  "bitterScore": number,
  "acidityScore": number,
  "heatScore": number,
  "aromaticSpiceScore": number,
  "umamiScore": number,
  "fatRichnessScore": number,
  "smokeCharScore": number,
  "fermentationScore": number,
  "mineralCleanScore": number,
  "aromaticIntensityScore": number,
  "dominantFlavors": string[],
  "flavorPersonality": string
}`;

interface CulinaryIdentityResult {
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

interface FlavorGenomeResult {
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

router.post(
  '/generate',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const parsed = onboardingDataSchema.safeParse(req.body.onboardingData);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const data: OnboardingData = parsed.data;
    const userMessage = JSON.stringify(data, null, 2);

    try {
      const [culinaryIdentity, flavorGenome] = await Promise.all([
        callClaudeWithRetry<CulinaryIdentityResult>(CULINARY_IDENTITY_SYSTEM, userMessage),
        callClaudeWithRetry<FlavorGenomeResult>(FLAVOR_GENOME_SYSTEM, userMessage),
      ]);

      // Upsert culinary identity genome
      const savedIdentity = await prisma.culinaryIdentityGenome.upsert({
        where: { userId },
        create: {
          userId,
          identityTitle: culinaryIdentity.identityTitle,
          identitySubtitle: culinaryIdentity.identitySubtitle,
          cuisineAffinity: culinaryIdentity.cuisineAffinity,
          adventurousness: culinaryIdentity.behaviorScores.adventurousness,
          comfortVsNovelty: culinaryIdentity.behaviorScores.comfortVsNovelty,
          luxuryVsRustic: culinaryIdentity.behaviorScores.luxuryVsRustic,
          complexityTolerance: culinaryIdentity.behaviorScores.complexityTolerance,
          socialVsSolitary: culinaryIdentity.behaviorScores.socialVsSolitary,
          ritualVsSpontaneity: culinaryIdentity.behaviorScores.ritualVsSpontaneity,
          finingDiningAffinity: culinaryIdentity.behaviorScores.finingDiningAffinity,
          diningAtmospherePreference: culinaryIdentity.diningAtmospherePreference,
          moodFoodRelationship: culinaryIdentity.moodFoodRelationship,
          evolutionNote: culinaryIdentity.evolutionNote,
        },
        update: {
          identityTitle: culinaryIdentity.identityTitle,
          identitySubtitle: culinaryIdentity.identitySubtitle,
          cuisineAffinity: culinaryIdentity.cuisineAffinity,
          adventurousness: culinaryIdentity.behaviorScores.adventurousness,
          comfortVsNovelty: culinaryIdentity.behaviorScores.comfortVsNovelty,
          luxuryVsRustic: culinaryIdentity.behaviorScores.luxuryVsRustic,
          complexityTolerance: culinaryIdentity.behaviorScores.complexityTolerance,
          socialVsSolitary: culinaryIdentity.behaviorScores.socialVsSolitary,
          ritualVsSpontaneity: culinaryIdentity.behaviorScores.ritualVsSpontaneity,
          finingDiningAffinity: culinaryIdentity.behaviorScores.finingDiningAffinity,
          diningAtmospherePreference: culinaryIdentity.diningAtmospherePreference,
          moodFoodRelationship: culinaryIdentity.moodFoodRelationship,
          evolutionNote: culinaryIdentity.evolutionNote,
        },
      });

      // Upsert flavor genome
      const savedFlavor = await prisma.flavorGenome.upsert({
        where: { userId },
        create: {
          userId,
          ...flavorGenome,
        },
        update: {
          ...flavorGenome,
        },
      });

      res.json({
        culinaryIdentity: {
          userId: savedIdentity.userId,
          identityTitle: savedIdentity.identityTitle,
          identitySubtitle: savedIdentity.identitySubtitle,
          cuisineAffinity: savedIdentity.cuisineAffinity,
          behaviorScores: {
            adventurousness: savedIdentity.adventurousness,
            comfortVsNovelty: savedIdentity.comfortVsNovelty,
            luxuryVsRustic: savedIdentity.luxuryVsRustic,
            complexityTolerance: savedIdentity.complexityTolerance,
            socialVsSolitary: savedIdentity.socialVsSolitary,
            ritualVsSpontaneity: savedIdentity.ritualVsSpontaneity,
            finingDiningAffinity: savedIdentity.finingDiningAffinity,
          },
          diningAtmospherePreference: savedIdentity.diningAtmospherePreference,
          moodFoodRelationship: savedIdentity.moodFoodRelationship,
          evolutionNote: savedIdentity.evolutionNote,
        },
        flavorGenome: {
          userId: savedFlavor.userId,
          saltScore: savedFlavor.saltScore,
          sweetScore: savedFlavor.sweetScore,
          bitterScore: savedFlavor.bitterScore,
          acidityScore: savedFlavor.acidityScore,
          heatScore: savedFlavor.heatScore,
          aromaticSpiceScore: savedFlavor.aromaticSpiceScore,
          umamiScore: savedFlavor.umamiScore,
          fatRichnessScore: savedFlavor.fatRichnessScore,
          smokeCharScore: savedFlavor.smokeCharScore,
          fermentationScore: savedFlavor.fermentationScore,
          mineralCleanScore: savedFlavor.mineralCleanScore,
          aromaticIntensityScore: savedFlavor.aromaticIntensityScore,
          dominantFlavors: savedFlavor.dominantFlavors,
          flavorPersonality: savedFlavor.flavorPersonality,
        },
      });
    } catch (err) {
      console.error('Genome generation error:', err);
      res.status(500).json({ error: 'Failed to generate genome' });
    }
  }
);

// POST /api/genome/recalibrate — re-runs genome generation with existing data + updated dietary profile
router.post('/recalibrate', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const [existingIdentity, existingFlavor, dietaryProfile] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
      prisma.dietaryProfile.findUnique({ where: { userId } }),
    ]);

    if (!existingIdentity || !existingFlavor) {
      res.status(404).json({ error: 'Genome not found. Complete onboarding first.' });
      return;
    }

    const behaviorData = {
      dietaryRestrictions: dietaryProfile?.restrictions ?? [],
      dislikes: dietaryProfile?.dislikes ?? [],
      cuisineAffinity: existingIdentity.cuisineAffinity,
      behaviorScores: {
        adventurousness: existingIdentity.adventurousness,
        comfortVsNovelty: existingIdentity.comfortVsNovelty,
        luxuryVsRustic: existingIdentity.luxuryVsRustic,
        complexityTolerance: existingIdentity.complexityTolerance,
        cookingSkill: existingIdentity.complexityTolerance,
      },
      diningContext: {
        social: existingIdentity.socialVsSolitary > 0.5 ? 'social' : 'solitary' as 'social' | 'solitary',
        ritual: existingIdentity.ritualVsSpontaneity > 0.5 ? 'ritual' : 'spontaneous' as 'ritual' | 'spontaneous',
        formality: existingIdentity.finingDiningAffinity > 0.5 ? 'fineDining' : 'casual' as 'casual' | 'fineDining',
        pace: 'slow' as const,
      },
      flavorScores: {
        saltScore: existingFlavor.saltScore,
        sweetScore: existingFlavor.sweetScore,
        bitterScore: existingFlavor.bitterScore,
        acidityScore: existingFlavor.acidityScore,
        heatScore: existingFlavor.heatScore,
        aromaticSpiceScore: existingFlavor.aromaticSpiceScore,
        umamiScore: existingFlavor.umamiScore,
        fatRichnessScore: existingFlavor.fatRichnessScore,
        smokeCharScore: existingFlavor.smokeCharScore,
        fermentationScore: existingFlavor.fermentationScore,
        mineralCleanScore: existingFlavor.mineralCleanScore,
        aromaticIntensityScore: existingFlavor.aromaticIntensityScore,
      },
    };

    const userMessage = JSON.stringify(behaviorData, null, 2);

    const [culinaryIdentity, flavorGenome] = await Promise.all([
      callClaudeWithRetry<CulinaryIdentityResult>(CULINARY_IDENTITY_SYSTEM, userMessage),
      callClaudeWithRetry<FlavorGenomeResult>(FLAVOR_GENOME_SYSTEM, userMessage),
    ]);

    const [savedIdentity, savedFlavor] = await Promise.all([
      prisma.culinaryIdentityGenome.update({
        where: { userId },
        data: {
          identityTitle: culinaryIdentity.identityTitle,
          identitySubtitle: culinaryIdentity.identitySubtitle,
          cuisineAffinity: culinaryIdentity.cuisineAffinity,
          adventurousness: culinaryIdentity.behaviorScores.adventurousness,
          comfortVsNovelty: culinaryIdentity.behaviorScores.comfortVsNovelty,
          luxuryVsRustic: culinaryIdentity.behaviorScores.luxuryVsRustic,
          complexityTolerance: culinaryIdentity.behaviorScores.complexityTolerance,
          socialVsSolitary: culinaryIdentity.behaviorScores.socialVsSolitary,
          ritualVsSpontaneity: culinaryIdentity.behaviorScores.ritualVsSpontaneity,
          finingDiningAffinity: culinaryIdentity.behaviorScores.finingDiningAffinity,
          diningAtmospherePreference: culinaryIdentity.diningAtmospherePreference,
          moodFoodRelationship: culinaryIdentity.moodFoodRelationship,
          evolutionNote: culinaryIdentity.evolutionNote,
        },
      }),
      prisma.flavorGenome.update({
        where: { userId },
        data: { ...flavorGenome },
      }),
    ]);

    res.json({
      culinaryIdentity: {
        userId: savedIdentity.userId,
        identityTitle: savedIdentity.identityTitle,
        identitySubtitle: savedIdentity.identitySubtitle,
        cuisineAffinity: savedIdentity.cuisineAffinity,
        behaviorScores: {
          adventurousness: savedIdentity.adventurousness,
          comfortVsNovelty: savedIdentity.comfortVsNovelty,
          luxuryVsRustic: savedIdentity.luxuryVsRustic,
          complexityTolerance: savedIdentity.complexityTolerance,
          socialVsSolitary: savedIdentity.socialVsSolitary,
          ritualVsSpontaneity: savedIdentity.ritualVsSpontaneity,
          finingDiningAffinity: savedIdentity.finingDiningAffinity,
        },
        diningAtmospherePreference: savedIdentity.diningAtmospherePreference,
        moodFoodRelationship: savedIdentity.moodFoodRelationship,
        evolutionNote: savedIdentity.evolutionNote,
      },
      flavorGenome: {
        userId: savedFlavor.userId,
        saltScore: savedFlavor.saltScore,
        sweetScore: savedFlavor.sweetScore,
        bitterScore: savedFlavor.bitterScore,
        acidityScore: savedFlavor.acidityScore,
        heatScore: savedFlavor.heatScore,
        aromaticSpiceScore: savedFlavor.aromaticSpiceScore,
        umamiScore: savedFlavor.umamiScore,
        fatRichnessScore: savedFlavor.fatRichnessScore,
        smokeCharScore: savedFlavor.smokeCharScore,
        fermentationScore: savedFlavor.fermentationScore,
        mineralCleanScore: savedFlavor.mineralCleanScore,
        aromaticIntensityScore: savedFlavor.aromaticIntensityScore,
        dominantFlavors: savedFlavor.dominantFlavors,
        flavorPersonality: savedFlavor.flavorPersonality,
      },
    });
  } catch (err) {
    console.error('Genome recalibrate error:', err);
    res.status(500).json({ error: 'Failed to recalibrate genome' });
  }
});

// ---------------------------------------------------------------------------
// In-memory caches (follow the pattern from routes/home.ts)
// ---------------------------------------------------------------------------
const evolutionInsightCache = new Map<string, { insight: string; cachedAt: number }>();
const whyCache = new Map<string, { explanation: string }>();

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const round1 = (n: number): number => Math.round(n * 10) / 10;

const FLAVOR_AXES: { axis: string; field: keyof Pick<
  Awaited<ReturnType<typeof prisma.flavorGenome.findUniqueOrThrow>>,
  | 'saltScore' | 'sweetScore' | 'bitterScore' | 'acidityScore' | 'heatScore'
  | 'umamiScore' | 'fatRichnessScore' | 'smokeCharScore' | 'fermentationScore'
  | 'mineralCleanScore' | 'aromaticIntensityScore'
> }[] = [
  { axis: 'Salt', field: 'saltScore' },
  { axis: 'Sweetness', field: 'sweetScore' },
  { axis: 'Bitterness', field: 'bitterScore' },
  { axis: 'Acidity', field: 'acidityScore' },
  { axis: 'Heat', field: 'heatScore' },
  { axis: 'Umami', field: 'umamiScore' },
  { axis: 'Richness', field: 'fatRichnessScore' },
  { axis: 'Smoke', field: 'smokeCharScore' },
  { axis: 'Ferment', field: 'fermentationScore' },
  { axis: 'Mineral', field: 'mineralCleanScore' },
  { axis: 'Aromatic', field: 'aromaticIntensityScore' },
];

async function getEvolutionInsight(userId: string): Promise<string> {
  const cached = evolutionInsightCache.get(userId);
  if (cached && Date.now() - cached.cachedAt < THREE_DAYS_MS) {
    return cached.insight;
  }

  const [historyCount, favoritesCount] = await Promise.all([
    prisma.recipeHistory.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  if (historyCount + favoritesCount < 5) {
    return 'Your flavor evolution will appear here as you explore.';
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentHistory = await prisma.recipeHistory.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    include: { recipe: { select: { title: true, mood: true, cuisineInspiration: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const payload = JSON.stringify({
    recentRecipes: recentHistory.map((h) => ({
      title: h.recipe.title,
      mood: h.recipe.mood,
      cuisine: h.recipe.cuisineInspiration,
    })),
    favoriteCount: favoritesCount,
  });

  const result = await callClaudeWithRetry<{ insight: string }>(
    `You are Paliato's flavor evolution narrator. Based on the user's recent food history, write ONE short sentence describing how their palate is evolving. Tone: intelligent, observational. Return JSON: { "insight": string }`,
    payload
  );

  evolutionInsightCache.set(userId, { insight: result.insight, cachedAt: Date.now() });
  return result.insight;
}

// GET /api/genome/flavor/analysis
router.get('/flavor/analysis', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const [flavorGenome, identity] = await Promise.all([
      prisma.flavorGenome.findUnique({ where: { userId } }),
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
    ]);

    if (!flavorGenome) {
      res.status(404).json({ error: 'Flavor genome not found' });
      return;
    }

    const fullSpectrum = FLAVOR_AXES.map(({ axis, field }) => ({
      axis,
      score: round1((flavorGenome[field] as number) / 10),
    }));

    const sortedDesc = [...fullSpectrum].sort((a, b) => b.score - a.score);
    const dominantAffinities = sortedDesc.slice(0, 4);
    const recessiveNotes = sortedDesc.slice(-3);

    const adventurousness = identity?.adventurousness ?? 0;

    const distinct = await prisma.generatedRecipe.findMany({
      where: { userId },
      select: { cuisineInspiration: true },
      distinct: ['cuisineInspiration'],
    });
    const distinctCuisineCount = Math.min(distinct.length, 10);
    const explorationIndex = Math.min(10, (adventurousness / 10) * 0.4 + distinctCuisineCount * 0.6);

    const intensityPreference =
      (flavorGenome.heatScore + flavorGenome.aromaticIntensityScore + flavorGenome.smokeCharScore) / 3 / 10;

    let evolutionInsight = 'Your flavor evolution will appear here as you explore.';
    try {
      evolutionInsight = await getEvolutionInsight(userId);
    } catch (err) {
      console.error('Evolution insight error:', err);
    }

    res.json({
      wheel: flavorGenome,
      dominantAffinities,
      recessiveNotes,
      fullSpectrum,
      dimensions: {
        noveltyDrive: round1(adventurousness / 10),
        intensityPreference: round1(intensityPreference),
        richnessTendency: round1(flavorGenome.fatRichnessScore / 10),
        explorationIndex: round1(explorationIndex),
      },
      evolutionInsight,
      flavorPersonality: flavorGenome.flavorPersonality,
    });
  } catch (err) {
    console.error('Flavor analysis error:', err);
    res.status(500).json({ error: 'Failed to load flavor analysis' });
  }
});

// GET /api/genome/identity/detail
router.get('/identity/detail', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const [identity, flavorGenome] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    if (!identity) {
      res.status(404).json({ error: 'Culinary identity genome not found' });
      return;
    }

    const keywords = (flavorGenome?.dominantFlavors ?? [])
      .slice(0, 3)
      .map((f) => f.toUpperCase());

    const behaviorScores = [
      { label: 'Adventurousness', score: round1(identity.adventurousness / 10) },
      { label: 'Novelty Seeking', score: round1(identity.comfortVsNovelty / 10) },
      { label: 'Complexity Tolerance', score: round1(identity.complexityTolerance / 10) },
      { label: 'Luxury Affinity', score: round1(identity.luxuryVsRustic / 10) },
      { label: 'Social Dining', score: round1(identity.socialVsSolitary / 10) },
      { label: 'Ritual Tendency', score: round1(identity.ritualVsSpontaneity / 10) },
    ];

    const cuisineAffinity = identity.cuisineAffinity.slice(0, 6).map((cuisine, i) => ({
      cuisine,
      score: round1(Math.max(5.0, 9.2 - i * 0.9)),
    }));

    res.json({
      identityTitle: identity.identityTitle,
      identitySubtitle: identity.identitySubtitle,
      keywords,
      description: identity.identitySubtitle,
      whyPaliatoAssignedThis: whyCache.get(userId)?.explanation ?? null,
      behaviorScores,
      cuisineAffinity,
      atmospherePreferences: identity.diningAtmospherePreference,
      evolutionNote: identity.evolutionNote,
    });
  } catch (err) {
    console.error('Identity detail error:', err);
    res.status(500).json({ error: 'Failed to load identity detail' });
  }
});

// GET /api/genome/identity/why
router.get('/identity/why', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  const cached = whyCache.get(userId);
  if (cached) {
    res.json({ explanation: cached.explanation });
    return;
  }

  try {
    const [identity, flavorGenome] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    if (!identity) {
      res.status(404).json({ error: 'Culinary identity genome not found' });
      return;
    }

    const result = await callClaudeWithRetry<{ explanation: string }>(
      `You are Paliato's identity assignment narrator. In 2-3 sentences, explain in second person why the user was assigned their Culinary Identity. Be specific — reference their actual genome data. Tone: intelligent, direct, non-generic. No filler phrases. Return JSON: { "explanation": string }`,
      JSON.stringify({ identityGenome: identity, flavorGenome })
    );

    whyCache.set(userId, { explanation: result.explanation });
    res.json({ explanation: result.explanation });
  } catch (err) {
    console.error('Identity why error:', err);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

export default router;
