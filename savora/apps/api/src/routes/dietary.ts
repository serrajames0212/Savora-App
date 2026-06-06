import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

const dietaryProfileSchema = z.object({
  restrictions: z.array(z.string()),
  dislikes: z.array(z.string()),
});

router.post('/profile', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const parsed = dietaryProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { restrictions, dislikes } = parsed.data;

  try {
    const profile = await prisma.dietaryProfile.upsert({
      where: { userId },
      create: { userId, restrictions, dislikes },
      update: { restrictions, dislikes },
    });

    res.json({ profile });
  } catch (err) {
    console.error('Dietary profile save error:', err);
    res.status(500).json({ error: 'Failed to save dietary profile' });
  }
});

export default router;
