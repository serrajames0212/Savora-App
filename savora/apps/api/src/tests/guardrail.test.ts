import { test, describe } from 'node:test';
import assert from 'node:assert';
import { checkDietaryGuardrails } from '../services/dietary/guardrail.ts';

describe('Dietary Guardrail', () => {
  test('vegan: rejects recipe with chicken', () => {
    const recipe = { ingredients: [{ name: 'chicken breast', note: '' }] };
    const profile = { restrictions: ['vegan'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
    assert.ok(result.violations.length > 0);
  });

  test('vegan: rejects recipe with dairy', () => {
    const recipe = { ingredients: [{ name: 'parmesan cheese', note: '' }] };
    const profile = { restrictions: ['vegan'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
  });

  test('vegan: accepts fully plant-based recipe', () => {
    const recipe = { ingredients: [
      { name: 'tofu', note: '' },
      { name: 'soy sauce', note: '' },
      { name: 'garlic', note: '' },
      { name: 'ginger', note: '' },
      { name: 'sesame oil', note: '' }
    ]};
    const profile = { restrictions: ['vegan'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, true);
  });

  test('halal: rejects pork', () => {
    const recipe = { ingredients: [{ name: 'pork belly', note: '' }] };
    const profile = { restrictions: ['halal'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
  });

  test('halal: rejects alcohol', () => {
    const recipe = { ingredients: [{ name: 'white wine', note: '' }] };
    const profile = { restrictions: ['halal'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
  });

  test('gluten-free: rejects wheat flour', () => {
    const recipe = { ingredients: [{ name: 'all-purpose flour', note: '' }] };
    const profile = { restrictions: ['gluten-free'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
  });

  test('gluten-free: accepts rice flour', () => {
    const recipe = { ingredients: [{ name: 'rice flour', note: '' }, { name: 'coconut milk', note: '' }] };
    const profile = { restrictions: ['gluten-free'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, true);
  });

  test('nut-free: rejects almond', () => {
    const recipe = { ingredients: [{ name: 'almond flour', note: '' }] };
    const profile = { restrictions: ['nut-free'], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
  });

  test('dislikes: rejects disliked ingredient', () => {
    const recipe = { ingredients: [{ name: 'fresh cilantro', note: '' }] };
    const profile = { restrictions: [], dislikes: ['cilantro'] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, false);
  });

  test('no restrictions: accepts any recipe', () => {
    const recipe = { ingredients: [
      { name: 'beef tenderloin', note: '' },
      { name: 'butter', note: '' },
      { name: 'garlic', note: '' }
    ]};
    const profile = { restrictions: [], dislikes: [] };
    const result = checkDietaryGuardrails(recipe, profile);
    assert.strictEqual(result.passed, true);
  });

  test('pescatarian: rejects chicken but accepts salmon', () => {
    const chickenRecipe = { ingredients: [{ name: 'chicken thighs', note: '' }] };
    const salmonRecipe = { ingredients: [{ name: 'salmon fillet', note: '' }] };
    const profile = { restrictions: ['pescatarian'], dislikes: [] };
    assert.strictEqual(checkDietaryGuardrails(chickenRecipe, profile).passed, false);
    assert.strictEqual(checkDietaryGuardrails(salmonRecipe, profile).passed, true);
  });

  test('dairy-free: rejects butter', () => {
    const recipe = { ingredients: [{ name: 'unsalted butter', note: '' }] };
    const profile = { restrictions: ['dairy-free'], dislikes: [] };
    assert.strictEqual(checkDietaryGuardrails(recipe, profile).passed, false);
  });

  test('shellfish-free: rejects shrimp', () => {
    const recipe = { ingredients: [{ name: 'tiger shrimp', note: '' }] };
    const profile = { restrictions: ['shellfish-free'], dislikes: [] };
    assert.strictEqual(checkDietaryGuardrails(recipe, profile).passed, false);
  });
});
