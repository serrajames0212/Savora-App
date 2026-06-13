import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';

const router = Router();

// In-memory cache: userId -> { data, expiresAt }
const evolutionCache = new Map<string, { data: EvolutionData; expiresAt: number }>();
const whyCache = new Map<string, { explanation: string; expiresAt: number }>();

interface IdentityShift {
  period: string;
  what: string;
  significance: 'minor' | 'moderate' | 'major';
}

interface FlavorShift {
  axis: string;
  direction: 'increased' | 'decreased';
  amount: number;
  period: string;
}

interface EvolutionData {
  hasEnoughData: boolean;
  dataNote: string | null;
  identityShifts: IdentityShift[];
  flavorShifts: FlavorShift[];
  overallNarrative: string;
  currentMomentum: string;
  weeklyInsight: string | null;
}

async function generateEvolution(userId: string): Promise<EvolutionData> {
  const [snapshots, currentIdentity, currentFlavor] = await Promise.all([
    prisma.genomeSnapshot.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
    prisma.flavorGenome.findUnique({ where: { userId } }),
  ]);

  const snapshotsReversed = [...snapshots].reverse();

  const userMessage = `CURRENT CULINARY IDENTITY: ${JSON.stringify(currentIdentity)}
CURRENT FLAVOR GENOME: ${JSON.stringify(currentFlavor)}
GENOME SNAPSHOTS (oldest first): ${JSON.stringify(snapshotsReversed.reverse())}
SNAPSHOT COUNT: ${snapshots.length}

Return this schema:
{
  "hasEnoughData": boolean,
  "dataNote": string | null,
  "identityShifts": [
    { "period": string, "what": string, "significance": "minor" | "moderate" | "major" }
  ],
  "flavorShifts": [
    { "axis": string, "direction": "increased" | "decreased", "amount": number, "period": string }
  ],
  "overallNarrative": string,
  "currentMomentum": string,
  "weeklyInsight": string | null
}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    temperature: 0.5,
    system: `You are Paliato's Taste Evolution Intelligence. Analyze the user's genome history and generate an evolution narrative. Be honest — if there's insufficient data, say so. Never fabricate shifts that aren't visible in the data.

Respond ONLY with valid JSON. No markdown.`,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  return JSON.parse(text) as EvolutionData;
}

// GET /api/genome/evolution
router.get('/evolution', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    // Check subscription
    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription || subscription.status === 'free') {
      res.status(402).json({ gated: true, feature: 'evolution' });
      return;
    }

    // Check cache
    const cached = evolutionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    const data = await generateEvolution(userId);

    evolutionCache.set(userId, { data, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
    res.json(data);
  } catch (err) {
    console.error('Evolution error:', err);
    res.status(500).json({ error: 'Failed to generate evolution data' });
  }
});

// POST /api/genome/snapshot
router.post('/snapshot', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { type, data } = req.body as { type: 'identity' | 'flavor'; data: object };

  try {
    const snapshot = await prisma.genomeSnapshot.create({
      data: { userId, type, data },
    });
    res.json(snapshot);
  } catch (err) {
    console.error('Snapshot error:', err);
    res.status(500).json({ error: 'Failed to create snapshot' });
  }
});

// GET /api/genome/evolution/weekly-insight
router.get('/evolution/weekly-insight', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    // Try cache first
    const cached = evolutionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      res.json({ insight: cached.data.weeklyInsight, isNew: false });
      return;
    }

    // Generate minimal insight without full evolution (free-tier accessible)
    const [currentIdentity, currentFlavor, snapshots] = await Promise.all([
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
      prisma.genomeSnapshot.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      temperature: 0.5,
      system: 'You are Paliato\'s Taste Intelligence. Generate a single sentence weekly taste insight. Respond ONLY with valid JSON. No markdown.',
      messages: [
        {
          role: 'user',
          content: `CULINARY IDENTITY: ${JSON.stringify(currentIdentity)}
FLAVOR GENOME: ${JSON.stringify(currentFlavor)}
RECENT SNAPSHOTS: ${JSON.stringify(snapshots)}

Return: { "insight": string | null }`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');
    const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(text) as { insight: string | null };

    res.json({ insight: parsed.insight, isNew: true });
  } catch (err) {
    console.error('Weekly insight error:', err);
    res.json({ insight: null, isNew: false });
  }
});

// GET /api/genome/identity/why
router.get('/identity/why', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    // Check 7-day cache
    const cached = whyCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      res.json({ explanation: cached.explanation });
      return;
    }

    const identity = await prisma.culinaryIdentityGenome.findUnique({ where: { userId } });
    if (!identity) {
      res.json({ explanation: null });
      return;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      temperature: 0.5,
      system: 'You are Paliato\'s Culinary Identity Intelligence. Respond ONLY with valid JSON. No markdown.',
      messages: [
        {
          role: 'user',
          content: `In 2-3 sentences, explain why this user has the culinary identity titled "${identity.identityTitle}" based on their genome data. Be specific to their actual scores. Return JSON: { "explanation": string }

GENOME DATA: ${JSON.stringify(identity)}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response');
    const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(text) as { explanation: string };

    whyCache.set(userId, { explanation: parsed.explanation, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    res.json({ explanation: parsed.explanation });
  } catch (err) {
    console.error('Identity why error:', err);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

export default router;
