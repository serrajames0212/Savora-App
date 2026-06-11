import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

function categorizeIngredient(name: string): string {
  const lower = name.toLowerCase();
  if (/chicken|beef|pork|lamb|fish|salmon|tuna|cod|shrimp|prawn|tofu|tempeh|egg|turkey|duck/.test(lower)) return 'protein';
  if (/carrot|onion|garlic|tomato|pepper|zucchini|broccoli|spinach|kale|lettuce|cucumber|lemon|lime|orange|apple|herb|parsley|cilantro|basil|thyme|rosemary|mint|ginger|mushroom|potato|sweet potato|eggplant|aubergine|leek|fennel|celery|beetroot|asparagus/.test(lower)) return 'produce';
  if (/oil|vinegar|stock|broth|pasta|rice|flour|bread|canned|tin|sauce|soy|miso|tahini|honey|sugar|salt|pepper|spice|cumin|paprika|turmeric|coriander|cardamom|cinnamon|nutmeg|clove|star anise|bay leaf|dried/.test(lower)) return 'pantry';
  if (/milk|cream|butter|cheese|yogurt|yoghurt|whey|parmesan|mozzarella|feta|brie|cheddar/.test(lower)) return 'dairy';
  return 'other';
}

// GET /api/shopping - get or create user's shopping list with all items
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const list = await prisma.shoppingList.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          orderBy: [
            { isChecked: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });

    res.json({ list });
  } catch (err) {
    console.error('Shopping GET error:', err);
    res.status(500).json({ error: 'Failed to fetch shopping list' });
  }
});

// POST /api/shopping/items - add one item or array of items
router.post('/items', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  type ItemInput = {
    name: string;
    amount?: string;
    unit?: string;
    sourceRecipeId?: string;
    sourceTitle?: string;
  };

  const body = req.body as ItemInput | { items: ItemInput[] };

  const rawItems: ItemInput[] = 'items' in body ? body.items : [body as ItemInput];

  if (!rawItems.length || rawItems.some(i => !i.name)) {
    res.status(400).json({ error: 'Each item must have a name' });
    return;
  }

  try {
    // Ensure list exists
    const list = await prisma.shoppingList.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const created = await Promise.all(
      rawItems.map(item =>
        prisma.shoppingItem.create({
          data: {
            listId: list.id,
            name: item.name,
            amount: item.amount ?? null,
            unit: item.unit ?? null,
            category: categorizeIngredient(item.name),
            sourceRecipeId: item.sourceRecipeId ?? null,
            sourceTitle: item.sourceTitle ?? null,
          },
        })
      )
    );

    res.status(201).json({ items: created });
  } catch (err) {
    console.error('Shopping POST items error:', err);
    res.status(500).json({ error: 'Failed to add items' });
  }
});

// PATCH /api/shopping/items/:id - toggle isChecked or update item
router.patch('/items/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    // Verify ownership via list
    const existing = await prisma.shoppingItem.findFirst({
      where: { id },
      include: { list: true },
    });

    if (!existing || existing.list.userId !== userId) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    const { isChecked, name, amount, unit } = req.body as {
      isChecked?: boolean;
      name?: string;
      amount?: string;
      unit?: string;
    };

    const updateData: Record<string, unknown> = {};
    if (isChecked !== undefined) updateData.isChecked = isChecked;
    if (name !== undefined) {
      updateData.name = name;
      updateData.category = categorizeIngredient(name);
    }
    if (amount !== undefined) updateData.amount = amount;
    if (unit !== undefined) updateData.unit = unit;

    const updated = await prisma.shoppingItem.update({
      where: { id },
      data: updateData,
    });

    res.json({ item: updated });
  } catch (err) {
    console.error('Shopping PATCH item error:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/shopping/items/:id - delete item
router.delete('/items/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { id } = req.params;

  try {
    const existing = await prisma.shoppingItem.findFirst({
      where: { id },
      include: { list: true },
    });

    if (!existing || existing.list.userId !== userId) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    await prisma.shoppingItem.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Shopping DELETE item error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// DELETE /api/shopping/checked - remove all checked items
router.delete('/checked', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;

  try {
    const list = await prisma.shoppingList.findUnique({ where: { userId } });
    if (!list) {
      res.json({ deleted: 0 });
      return;
    }

    const result = await prisma.shoppingItem.deleteMany({
      where: { listId: list.id, isChecked: true },
    });

    res.json({ deleted: result.count });
  } catch (err) {
    console.error('Shopping DELETE checked error:', err);
    res.status(500).json({ error: 'Failed to remove checked items' });
  }
});

// DELETE /api/shopping - clear entire list
router.delete('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const keepList = req.query.keepList !== 'false';

  try {
    const list = await prisma.shoppingList.findUnique({ where: { userId } });
    if (!list) {
      res.json({ success: true });
      return;
    }

    await prisma.shoppingItem.deleteMany({ where: { listId: list.id } });

    if (!keepList) {
      await prisma.shoppingList.delete({ where: { id: list.id } });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Shopping DELETE list error:', err);
    res.status(500).json({ error: 'Failed to clear shopping list' });
  }
});

export default router;
