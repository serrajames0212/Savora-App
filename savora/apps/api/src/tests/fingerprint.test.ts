import { test, describe } from 'node:test';
import assert from 'node:assert';
import { checkFingerprintSimilarity } from '../services/recipe/fingerprint.ts';

describe('Fingerprint Similarity', () => {
  const base = {
    mood: 'comfort',
    coreBase: 'pasta',
    cuisineInspiration: 'Italian',
    cookingMethod: 'boiling',
    acidSource: 'tomato',
    aromaticLayer: 'basil',
    textureElement: 'al dente',
    dietaryType: 'vegetarian'
  };

  test('identical fingerprint is too similar', () => {
    const result = checkFingerprintSimilarity(base, [base]);
    assert.strictEqual(result.isTooSimilar, true);
  });

  test('completely different fingerprint is not too similar', () => {
    const different = {
      mood: 'bold',
      coreBase: 'fish',
      cuisineInspiration: 'Japanese',
      cookingMethod: 'grilling',
      acidSource: 'citrus',
      aromaticLayer: 'ginger',
      textureElement: 'crispy',
      dietaryType: 'pescatarian'
    };
    const result = checkFingerprintSimilarity(different, [base]);
    assert.strictEqual(result.isTooSimilar, false);
  });

  test('2 matching fields is not too similar', () => {
    const similar2 = { ...base, coreBase: 'rice', cookingMethod: 'steaming', acidSource: 'lemon', aromaticLayer: 'thyme', textureElement: 'fluffy' };
    const result = checkFingerprintSimilarity(similar2, [base]);
    assert.strictEqual(result.isTooSimilar, false);
  });

  test('empty history is never too similar', () => {
    const result = checkFingerprintSimilarity(base, []);
    assert.strictEqual(result.isTooSimilar, false);
  });

  test('3+ matches with same coreBase+cookingMethod is too similar', () => {
    const similar = { ...base, acidSource: 'lemon', aromaticLayer: 'oregano' };
    const result = checkFingerprintSimilarity(similar, [base]);
    assert.strictEqual(result.isTooSimilar, true);
  });
});
