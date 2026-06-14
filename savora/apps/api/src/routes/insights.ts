import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';

const router = Router();

interface DailyInsightResult {
  insight: string;
  actionLabel: string;
  actionMood: string;
}

interface SeasonalInsightResult {
  insight: string;
  season: string;
}

// In-memory caches
const dailyInsightCache = new Map<string, DailyInsightResult>();
const seasonalInsightCache = new Map<string, { result: SeasonalInsightResult; cachedAt: number }>();

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

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

router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const cacheKey = `${userId}:${getTodayKey()}`;

  const cached = dailyInsightCache.get(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const [identity, flavor] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    if (!identity && !flavor) {
      const fallback: DailyInsightResult = {
        insight: 'Your flavor genome is still forming. Explore and cook to build your profile.',
        actionLabel: 'Generate a recipe',
        actionMood: 'comfort',
      };
      dailyInsightCache.set(cacheKey, fallback);
      res.json(fallback);
      return;
    }

    const genomeContext = JSON.stringify({ identity, flavor });

    const result = await callClaude<DailyInsightResult>(
      `You are Paliato's Daily Taste Reflection engine. Generate a single daily insight for this user based on their culinary genome. Be intelligent, observational, never generic. Max 2 sentences. Return JSON: { "insight": string, "actionLabel": string, "actionMood": string }`,
      genomeContext
    );

    dailyInsightCache.set(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Daily insight error:', err);
    res.status(500).json({ error: 'Failed to generate daily insight' });
  }
});

router.get('/seasonal', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const season = getCurrentSeason();
  const cacheKey = `${userId}:${season}`;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const cached = seasonalInsightCache.get(cacheKey);
  if (cached && Date.now() - cached.cachedAt < SEVEN_DAYS_MS) {
    res.json(cached.result);
    return;
  }

  try {
    const [identity, flavor] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
    ]);

    const genomeContext = JSON.stringify({ identity, flavor, currentSeason: season });

    const result = await callClaude<SeasonalInsightResult>(
      `You are Paliato's Seasonal Intelligence engine. Given the current season and the user's culinary genome, generate a 1-2 sentence seasonal insight about what to eat, seek, or explore right now. Return JSON: { "insight": string, "season": string }`,
      genomeContext
    );

    seasonalInsightCache.set(cacheKey, { result, cachedAt: Date.now() });
    res.json(result);
  } catch (err) {
    console.error('Seasonal insight error:', err);
    res.status(500).json({ error: 'Failed to generate seasonal insight' });
  }
});

export default router;
