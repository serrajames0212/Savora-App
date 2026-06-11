import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

const VALID_POST_TYPES = ['discovery', 'dish', 'recipe', 'question', 'discussion'] as const;
type PostType = typeof VALID_POST_TYPES[number];

async function requireReserve(userId: string, res: Response, feature: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription || subscription.status !== 'active') {
    res.status(402).json({ gated: true, feature });
    return false;
  }
  return true;
}

// GET /api/community/posts
router.get('/posts', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { identitySlug, type, limit = '20', offset = '0' } = req.query as Record<string, string>;

  try {
    const where: Record<string, unknown> = {};
    if (identitySlug) where.identitySlug = identitySlug;
    if (type) where.type = type;

    const posts = await prisma.communityPost.findMany({
      where,
      take: Math.min(parseInt(limit, 10), 100),
      skip: parseInt(offset, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    });

    // Enrich with culinaryIdentity
    const enriched = await Promise.all(
      posts.map(async (post: typeof posts[number]) => {
        const genome = await prisma.culinaryIdentityGenome.findUnique({
          where: { userId: post.userId },
          select: { identityTitle: true },
        });
        return {
          ...post,
          replyCount: post._count.replies,
          culinaryIdentity: genome?.identityTitle ?? '',
        };
      })
    );

    res.json({ posts: enriched });
  } catch (err) {
    console.error('Community GET posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/community/posts (Reserve only)
router.post('/posts', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  if (!(await requireReserve(userId, res, 'community_post'))) return;

  const { identitySlug, type, title, body, cityRef, restaurantRef } = req.body as {
    identitySlug: string;
    type: string;
    title?: string;
    body: string;
    cityRef?: string;
    restaurantRef?: string;
  };

  if (!identitySlug || !type || !body) {
    res.status(400).json({ error: 'identitySlug, type, and body are required' });
    return;
  }

  if (!VALID_POST_TYPES.includes(type as PostType)) {
    res.status(400).json({ error: `type must be one of: ${VALID_POST_TYPES.join(', ')}` });
    return;
  }

  if (body.length > 500) {
    res.status(400).json({ error: 'body must be 500 characters or fewer' });
    return;
  }

  try {
    const post = await prisma.communityPost.create({
      data: {
        userId,
        identitySlug,
        type: type as PostType,
        title: title ?? null,
        body,
        cityRef: cityRef ?? null,
        restaurantRef: restaurantRef ?? null,
      },
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error('Community POST post error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// GET /api/community/posts/:id
router.get('/posts/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { replies: true } },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const genome = await prisma.culinaryIdentityGenome.findUnique({
      where: { userId: post.userId },
      select: { identityTitle: true },
    });

    res.json({
      post: {
        ...post,
        replyCount: post._count.replies,
        culinaryIdentity: genome?.identityTitle ?? '',
      },
    });
  } catch (err) {
    console.error('Community GET post error:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/community/posts/:id/replies (Reserve only)
router.post('/posts/:id/replies', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;

  if (!(await requireReserve(userId, res, 'community_post'))) return;

  const { body } = req.body as { body: string };

  if (!body) {
    res.status(400).json({ error: 'body is required' });
    return;
  }

  if (body.length > 200) {
    res.status(400).json({ error: 'body must be 200 characters or fewer' });
    return;
  }

  try {
    const post = await prisma.communityPost.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const reply = await prisma.communityReply.create({
      data: { postId: id, userId, body },
    });

    res.status(201).json({ reply });
  } catch (err) {
    console.error('Community POST reply error:', err);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// GET /api/community/reviews
router.get('/reviews', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { identitySlug, city, limit = '20', offset = '0' } = req.query as Record<string, string>;

  try {
    const where: Record<string, unknown> = {};
    if (identitySlug) where.identitySlug = identitySlug;
    if (city) where.restaurantCity = { contains: city, mode: 'insensitive' };

    const reviews = await prisma.restaurantReview.findMany({
      where,
      take: Math.min(parseInt(limit, 10), 100),
      skip: parseInt(offset, 10),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    const enriched = await Promise.all(
      reviews.map(async (review: typeof reviews[number]) => {
        const genome = await prisma.culinaryIdentityGenome.findUnique({
          where: { userId: review.userId },
          select: { identityTitle: true },
        });
        return {
          ...review,
          culinaryIdentity: genome?.identityTitle ?? '',
        };
      })
    );

    res.json({ reviews: enriched });
  } catch (err) {
    console.error('Community GET reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/community/reviews (Reserve only)
router.post('/reviews', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  if (!(await requireReserve(userId, res, 'community_post'))) return;

  const { restaurantName, restaurantCity, placeId, body, visitedAt } = req.body as {
    restaurantName: string;
    restaurantCity: string;
    placeId?: string;
    body: string;
    visitedAt?: string;
  };

  if (!restaurantName || !restaurantCity || !body) {
    res.status(400).json({ error: 'restaurantName, restaurantCity, and body are required' });
    return;
  }

  if (body.length > 400) {
    res.status(400).json({ error: 'body must be 400 characters or fewer' });
    return;
  }

  try {
    const genome = await prisma.culinaryIdentityGenome.findUnique({
      where: { userId },
      select: { identityTitle: true },
    });

    const review = await prisma.restaurantReview.create({
      data: {
        userId,
        restaurantName,
        restaurantCity,
        placeId: placeId ?? null,
        body,
        culinaryIdentity: genome?.identityTitle ?? '',
        visitedAt: visitedAt ? new Date(visitedAt) : null,
      },
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error('Community POST review error:', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// POST /api/community/report
router.post('/report', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { targetType, targetId, reason } = req.body as {
    targetType: string;
    targetId: string;
    reason?: string;
  };

  if (!targetType || !targetId) {
    res.status(400).json({ error: 'targetType and targetId are required' });
    return;
  }

  try {
    const report = await prisma.contentReport.create({
      data: {
        reporterId: userId,
        targetType,
        targetId,
        reason: reason ?? null,
      },
    });

    res.status(201).json({ report });
  } catch (err) {
    console.error('Community POST report error:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

export default router;
