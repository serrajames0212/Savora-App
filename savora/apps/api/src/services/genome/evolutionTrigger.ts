import { PrismaClient } from '@prisma/client';

export async function checkAndTriggerEvolution(
  userId: string,
  prisma: PrismaClient
): Promise<{ triggered: boolean; reason: string | null }> {
  try {
    // Check if evolution was triggered in the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const latestSnapshot = await prisma.genomeSnapshot.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestSnapshot && latestSnapshot.createdAt > sevenDaysAgo) {
      return { triggered: false, reason: null };
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Load last 30 days of RecipeHistory + Favorites
    const [recentHistory, recentFavorites, searchHistory, currentFlavor, currentIdentity] = await Promise.all([
      prisma.recipeHistory.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        include: { recipe: { select: { cuisineInspiration: true, flavorProfile: true, fingerprint: true } } },
      }),
      prisma.favorite.findMany({
        where: { userId, savedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.searchHistory.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.flavorGenome.findUnique({ where: { userId } }),
      prisma.culinaryIdentityGenome.findUnique({ where: { userId } }),
    ]);

    const reasons: string[] = [];

    // Trigger 1: 3+ favorites with same dominant flavor in 7 days
    const sevenDaysAgoFav = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentWeekFavorites = recentFavorites.filter((f) => f.savedAt > sevenDaysAgoFav);
    if (recentWeekFavorites.length >= 3 && currentFlavor) {
      // Check if there's a dominant flavor pattern
      const metadataFlavors: string[] = [];
      for (const fav of recentWeekFavorites) {
        const meta = fav.metadata as Record<string, unknown> | null;
        if (meta?.cuisine) metadataFlavors.push(String(meta.cuisine));
      }
      const flavorCount: Record<string, number> = {};
      for (const f of metadataFlavors) {
        flavorCount[f] = (flavorCount[f] ?? 0) + 1;
      }
      const hasDominant = Object.values(flavorCount).some((c) => c >= 3);
      if (hasDominant) {
        await prisma.genomeSnapshot.create({
          data: {
            userId,
            type: 'flavor',
            data: { ...(currentFlavor as object), snapshotNote: 'Triggered by repeated flavor favorites' },
          },
        });
        reasons.push('flavor_favorites');
      }
    }

    // Trigger 2: same city searched 3+ times
    const cityCounts: Record<string, number> = {};
    for (const s of searchHistory) {
      cityCounts[s.city] = (cityCounts[s.city] ?? 0) + 1;
    }
    const repeatedCity = Object.entries(cityCounts).find(([, count]) => count >= 3);
    if (repeatedCity && currentIdentity) {
      await prisma.genomeSnapshot.create({
        data: {
          userId,
          type: 'identity',
          data: { ...(currentIdentity as object), snapshotNote: `Triggered by repeated ${repeatedCity[0]} searches` },
        },
      });
      reasons.push('city_repetition');
    }

    // Trigger 3: 30-day cuisine pattern differs from prior 30-day pattern
    const priorHistory = await prisma.recipeHistory.findMany({
      where: { userId, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      include: { recipe: { select: { cuisineInspiration: true } } },
    });

    const cuisineFreq = (items: typeof recentHistory) => {
      const freq: Record<string, number> = {};
      for (const h of items) {
        const c = h.recipe.cuisineInspiration;
        if (c) freq[c] = (freq[c] ?? 0) + 1;
      }
      return freq;
    };

    const recentCuisines = cuisineFreq(recentHistory);
    const priorCuisines = cuisineFreq(
      priorHistory.map((h) => ({
        ...h,
        recipe: { ...h.recipe, cuisineInspiration: h.recipe.cuisineInspiration ?? '', flavorProfile: null as unknown as object, fingerprint: null as unknown as object },
      }))
    );

    const recentTop = Object.entries(recentCuisines).sort((a, b) => b[1] - a[1])[0]?.[0];
    const priorTop = Object.entries(priorCuisines).sort((a, b) => b[1] - a[1])[0]?.[0];

    if (recentTop && priorTop && recentTop !== priorTop && currentFlavor && currentIdentity) {
      await Promise.all([
        prisma.genomeSnapshot.create({
          data: {
            userId,
            type: 'flavor',
            data: { ...(currentFlavor as object), snapshotNote: 'Cuisine pattern shift detected' },
          },
        }),
        prisma.genomeSnapshot.create({
          data: {
            userId,
            type: 'identity',
            data: { ...(currentIdentity as object), snapshotNote: 'Cuisine pattern shift detected' },
          },
        }),
      ]);
      reasons.push('cuisine_pattern_shift');
    }

    if (reasons.length > 0) {
      return { triggered: true, reason: reasons.join(', ') };
    }

    return { triggered: false, reason: null };
  } catch {
    return { triggered: false, reason: null };
  }
}
