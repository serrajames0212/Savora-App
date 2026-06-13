import { Router, Request, Response } from 'express';
import { anthropic } from '../lib/anthropic';
import prisma from '../lib/prisma';

const router = Router();

const SOURCING_SYSTEM_PROMPT = `You are Paliato's ingredient sourcing assistant. For the given ingredient, provide honest sourcing difficulty, real online retailer suggestions (ONLY use real, well-known culinary retailers that actually exist — do not invent names or URLs), a practical substitute, and brief description.

Return ONLY valid JSON. No markdown.

Schema:
{
  "name": string,
  "description": string,
  "sourcingDifficulty": "common" | "moderate" | "specialist",
  "nearbySearchTerm": string,
  "onlineRetailers": [
    { "name": string, "url": string, "searchTerm": string, "affiliateReady": true }
  ],
  "substituteWith": string,
  "storageNote": string | null
}

For onlineRetailers: only include real established retailers (Amazon, Sous Chef, Japan Centre, Whole Foods, Williams Sonoma, etc.). Maximum 3 retailers. Only include retailers you are certain exist for this type of ingredient.`;

interface SourcingData {
  name: string;
  description: string;
  sourcingDifficulty: 'common' | 'moderate' | 'specialist';
  nearbySearchTerm: string;
  onlineRetailers: Array<{
    name: string;
    url: string;
    searchTerm: string;
    affiliateReady: true;
  }>;
  substituteWith: string;
  storageNote: string | null;
}

// GET /api/ingredients/:name/sourcing
router.get('/:name/sourcing', async (req: Request, res: Response): Promise<void> => {
  const ingredientName = req.params.name.toLowerCase().trim();

  try {
    // Check cache first
    const now = new Date();
    const cached = await prisma.ingredientSourcingCache.findUnique({
      where: { ingredientKey: ingredientName },
    });

    if (cached && cached.expiresAt > now) {
      res.json(cached.data);
      return;
    }

    // Call Claude for sourcing data
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      temperature: 0.3,
      system: SOURCING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Ingredient: ${ingredientName}` }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');
    const text = content.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const data = JSON.parse(text) as SourcingData;

    // Cache for 30 days
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.ingredientSourcingCache.upsert({
      where: { ingredientKey: ingredientName },
      update: { data: data as object, expiresAt },
      create: { ingredientKey: ingredientName, data: data as object, expiresAt },
    });

    res.json(data);
  } catch (err) {
    console.error('Ingredient sourcing error:', err);
    res.status(500).json({ error: 'Failed to fetch ingredient sourcing data' });
  }
});

export default router;
