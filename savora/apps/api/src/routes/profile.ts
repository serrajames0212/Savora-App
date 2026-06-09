import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/profile/stats
router.get('/stats', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const [recipes, searchHistories, generatedRecipes, recipeDates] = await Promise.all([
      prisma.recipeHistory.count({ where: { userId } }),
      prisma.searchHistory.findMany({ where: { userId }, select: { city: true } }),
      prisma.generatedRecipe.findMany({
        where: { userId },
        select: { cuisineInspiration: true },
      }),
      prisma.recipeHistory.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
    ]);

    const cities = new Set(searchHistories.map((s: { city: string }) => s.city)).size;
    const cuisines = new Set(generatedRecipes.map((r: { cuisineInspiration: string }) => r.cuisineInspiration)).size;
    const daysActive = new Set(
      recipeDates.map((r: { createdAt: Date }) => r.createdAt.toISOString().slice(0, 10))
    ).size;

    res.json({ recipes, cities, cuisines, daysActive });
  } catch (err) {
    console.error('Profile stats error:', err);
    res.status(500).json({ error: 'Failed to fetch profile stats' });
  }
});

export default router;
