import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/favorites?type=all|recipe|restaurant|dish|memory
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const type = (req.query.type as string) ?? 'all';

  try {
    const where: Record<string, unknown> = { userId };
    if (type !== 'all') {
      where.itemType = type;
    }

    const favorites = await prisma.favorite.findMany({
      where,
      orderBy: { savedAt: 'desc' },
    });

    // For recipe favorites, join recipe data
    const enriched = await Promise.all(
      favorites.map(async (fav: typeof favorites[number]) => {
        if (fav.itemType === 'recipe') {
          const recipe = await prisma.generatedRecipe.findUnique({
            where: { id: fav.itemId },
          });
          return { ...fav, recipe };
        }
        return fav;
      })
    );

    res.json({ favorites: enriched });
  } catch (err) {
    console.error('Favorites GET error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { itemType, itemId, metadata } = req.body as {
    itemType: string;
    itemId: string;
    metadata?: Record<string, unknown>;
  };

  if (!itemType || !itemId) {
    res.status(400).json({ error: 'itemType and itemId are required' });
    return;
  }

  try {
    // Subscription gate: free tier max 10 favorites
    const [totalCount, subscription] = await Promise.all([
      prisma.favorite.count({ where: { userId } }),
      prisma.subscription.findUnique({ where: { userId } }),
    ]);

    const subStatus = subscription?.status ?? 'free';
    if (totalCount >= 10 && subStatus === 'free') {
      res.status(402).json({ gated: true, feature: 'favorites' });
      return;
    }

    // Check if already favorited (idempotent)
    const existing = await prisma.favorite.findFirst({
      where: { userId, itemType, itemId },
    });

    if (existing) {
      res.json({ favorite: existing });
      return;
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        itemType,
        itemId,
        metadata: metadata ?? null,
      },
    });

    res.status(201).json({ favorite });
  } catch (err) {
    console.error('Favorites POST error:', err);
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

// DELETE /api/favorites/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const existing = await prisma.favorite.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Favorite not found' });
      return;
    }

    await prisma.favorite.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Favorites DELETE error:', err);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

export default router;
