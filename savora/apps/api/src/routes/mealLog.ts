import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// POST /api/meal-log
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { recipeName, recipeId, moodTag, notes } = req.body as {
    recipeName: string;
    recipeId?: string;
    moodTag?: string;
    notes?: string;
  };

  if (!recipeName) {
    res.status(400).json({ error: 'recipeName required' });
    return;
  }

  try {
    const log = await prisma.mealLog.create({
      data: { userId, recipeName, recipeId: recipeId ?? null, moodTag: moodTag ?? null, notes: notes ?? null },
    });
    res.status(201).json({ log });
  } catch (err) {
    console.error('Meal log error:', err);
    res.status(500).json({ error: 'Failed to log meal' });
  }
});

// GET /api/meal-log
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  try {
    const logs = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: 30,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meal logs' });
  }
});

export default router;
