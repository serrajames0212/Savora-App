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

const CULINARY_IDENTITY_SYSTEM = `You are Savora's Culinary Identity Engine. Based on the user's onboarding data, generate their Culinary Identity Genome as a JSON object.

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

const FLAVOR_GENOME_SYSTEM = `You are Savora's Flavor Genome Engine. Based on the user's flavor preference sliders, generate their Flavor Genome as a JSON object.

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

export default router;
