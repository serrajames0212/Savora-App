import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';

const router = Router();

type MoodSlug = 'comfort' | 'bold' | 'deep' | 'ritual' | 'light' | 'surprise';

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'late night';
  if (hour < 12) return 'morning';
  if (hour < 14) return 'midday';
  if (hour < 18) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function getSeason(): string {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// POST /api/mood/auto-select
router.post('/auto-select', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const [culinaryIdentityGenome, flavorGenome, recentHistory] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
      prisma.recipeHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { recipe: { select: { mood: true } } },
      }),
    ]);

    const recentMoods = recentHistory
      .map((h: { recipe: { mood: string } }) => h.recipe.mood)
      .filter(Boolean);

    const timeOfDay = getTimeOfDay();
    const season = getSeason();

    const userMessage = JSON.stringify({
      genome: culinaryIdentityGenome ?? {},
      flavorGenome: flavorGenome ?? {},
      recentMoods,
      timeOfDay,
      season,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      temperature: 0.7,
      system:
        'You are Paliato\'s Mood Intelligence Engine. Based on this user\'s genome and recent patterns, select the single best mood for them right now. Consider time of day and season. Return JSON only.',
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      res.status(500).json({ error: 'Unexpected response type' });
      return;
    }

    const text = content.text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    const parsed = JSON.parse(text) as { mood: MoodSlug; reason: string };

    const validMoods: MoodSlug[] = ['comfort', 'bold', 'deep', 'ritual', 'light', 'surprise'];
    if (!validMoods.includes(parsed.mood)) {
      parsed.mood = 'comfort';
    }

    res.json({ mood: parsed.mood, reason: parsed.reason });
  } catch (err) {
    console.error('Auto-select mood error:', err);
    res.status(500).json({ error: 'Failed to auto-select mood' });
  }
});

export default router;
