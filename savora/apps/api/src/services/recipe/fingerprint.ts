import type { RecipeFingerprint } from '@savora/shared-types';

export interface FingerprintSimilarity {
  isTooSimilar: boolean;
  matchCount: number;
}

export function checkFingerprintSimilarity(
  newFingerprint: RecipeFingerprint,
  recentFingerprints: RecipeFingerprint[]
): FingerprintSimilarity {
  const fields: (keyof RecipeFingerprint)[] = [
    'mood',
    'coreBase',
    'cuisineInspiration',
    'cookingMethod',
    'acidSource',
    'aromaticLayer',
    'textureElement',
    'dietaryType',
  ];

  for (const existing of recentFingerprints) {
    const sameBase =
      existing.coreBase === newFingerprint.coreBase &&
      existing.cookingMethod === newFingerprint.cookingMethod;

    let matchCount = 0;
    for (const field of fields) {
      if (existing[field] === newFingerprint[field]) {
        matchCount++;
      }
    }

    if (sameBase && matchCount >= 3) {
      return { isTooSimilar: true, matchCount };
    }
  }

  return { isTooSimilar: false, matchCount: 0 };
}
