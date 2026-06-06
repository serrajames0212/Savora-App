import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';
import { checkDietaryGuardrails } from '../services/dietary/guardrail';

const router = Router();

// In-memory cache for suggestions (per userId, 24h)
const suggestionsCache = new Map<string, { cities: string[]; expiresAt: number }>();

interface SuggestedDish {
  dishName: string;
  slug: string;
  flavorProfile: string[];
  whyThisFits: string;
  dietaryCompliance: string;
  confidence: number;
}

interface Restaurant {
  name: string;
  slug: string;
  cuisine: string;
  atmosphere: string[];
  matchScore: number;
  whyThisFits: string;
  suggestedDishes: SuggestedDish[];
}

interface CityResult {
  cityIdentity: string;
  seasonalNote: string;
  restaurants: Restaurant[];
  limitedCoverageNote: string | null;
}

// POST /api/discovery/city
router.post('/city', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { city } = req.body as { city: string };

  if (!city) {
    res.status(400).json({ error: 'city is required' });
    return;
  }

  try {
    // Subscription gate
    const today = new Date().toISOString().slice(0, 10);
    const [dailyUsage, subscription] = await Promise.all([
      prisma.dailyUsage.findUnique({ where: { userId_date: { userId, date: today } } }),
      prisma.subscription.findUnique({ where: { userId } }),
    ]);

    const subStatus = subscription?.status ?? 'free';
    if ((dailyUsage?.citySearches ?? 0) >= 2 && subStatus === 'free') {
      res.status(402).json({ gated: true, feature: 'city_search' });
      return;
    }

    // Load profiles
    const [dietaryProfile, culinaryIdentityGenome, flavorGenome] = await Promise.all([
      prisma.dietaryProfile.findUnique({ where: { userId } }),
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    const systemPrompt = `You are Savora's Discovery Intelligence Engine. Generate personalized restaurant and dish recommendations for a user visiting a specific city. You MUST respect all dietary restrictions — any dish violating them must not appear. Apply the two-stage genome matching: Culinary Identity Genome for restaurants (atmosphere, cuisine style, identity alignment), Flavor Genome for dishes (flavor axis matching).

Be honest about match scores — do not inflate them. If you have limited knowledge of a city, say so in limitedCoverageNote.

Respond ONLY with valid JSON. No markdown, no explanation.`;

    const userMessage = `CITY: ${city}
CULINARY IDENTITY GENOME: ${JSON.stringify(culinaryIdentityGenome)}
FLAVOR GENOME: ${JSON.stringify(flavorGenome)}
DIETARY PROFILE: ${JSON.stringify(dietaryProfile)}

Return this exact schema:
{
  "cityIdentity": string,
  "seasonalNote": string,
  "restaurants": [
    {
      "name": string,
      "slug": string,
      "cuisine": string,
      "atmosphere": string[],
      "matchScore": number,
      "whyThisFits": string,
      "suggestedDishes": [
        {
          "dishName": string,
          "slug": string,
          "flavorProfile": string[],
          "whyThisFits": string,
          "dietaryCompliance": string,
          "confidence": number
        }
      ]
    }
  ],
  "limitedCoverageNote": string | null
}

Max 5 restaurants, max 3 dishes per restaurant.`;

    let result: CityResult | null = null;
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let raw: CityResult;
      try {
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          temperature: 0.5,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        });

        const content = response.content[0];
        if (content.type !== 'text') throw new Error('Unexpected response type');
        const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
        raw = JSON.parse(text) as CityResult;
      } catch (parseErr) {
        if (attempt === maxAttempts - 1) throw parseErr;
        continue;
      }

      // Run dietary guardrail on all dishes
      const profile = {
        restrictions: dietaryProfile?.restrictions ?? [],
        dislikes: dietaryProfile?.dislikes ?? [],
      };

      const filteredRestaurants = raw.restaurants.map((restaurant) => {
        const filteredDishes = restaurant.suggestedDishes.filter((dish) => {
          // Build a fake ingredient structure from dish name + flavorProfile
          const ingredients = [
            { name: dish.dishName, note: dish.flavorProfile.join(' ') },
            ...dish.flavorProfile.map((fp) => ({ name: fp, note: '' })),
          ];
          const guardrailResult = checkDietaryGuardrails({ ingredients }, profile);
          return guardrailResult.passed;
        });
        return { ...restaurant, suggestedDishes: filteredDishes };
      });

      result = { ...raw, restaurants: filteredRestaurants };
      break;
    }

    if (!result) {
      res.status(500).json({ error: 'Failed to generate city intelligence' });
      return;
    }

    // Save to search history
    await prisma.searchHistory.create({
      data: { userId, city },
    });

    // Increment daily usage
    await prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { citySearches: { increment: 1 } },
      create: { userId, date: today, citySearches: 1 },
    });

    res.json(result);
  } catch (err) {
    console.error('City discovery error:', err);
    res.status(500).json({ error: 'Failed to generate city discovery' });
  }
});

// GET /api/discovery/suggestions
router.get('/suggestions', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    // Check cache
    const cached = suggestionsCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      res.json({ cities: cached.cities });
      return;
    }

    const culinaryIdentityGenome = await prisma.culinaryIdentityGenome.findUnique({ where: { userId } });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: `Based on this Culinary Identity Genome, suggest 4 cities that would perfectly match this person's food identity. Return JSON: { "cities": string[] }

Culinary Identity Genome: ${JSON.stringify(culinaryIdentityGenome)}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(text) as { cities: string[] };

    // Cache for 24h
    suggestionsCache.set(userId, {
      cities: parsed.cities,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.json({ cities: parsed.cities });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// GET /api/discovery/recent
router.get('/recent', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const recent = await prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({ cities: recent.map((r) => r.city) });
  } catch (err) {
    console.error('Recent searches error:', err);
    res.status(500).json({ error: 'Failed to get recent searches' });
  }
});

export default router;
