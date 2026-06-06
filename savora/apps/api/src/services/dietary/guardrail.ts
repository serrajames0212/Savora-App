export interface GuardrailResult {
  passed: boolean;
  violations: string[];
}

const RESTRICTION_KEYWORDS: Record<string, string[]> = {
  vegan: [
    'meat', 'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'fish',
    'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'dairy', 'milk', 'cream',
    'butter', 'cheese', 'yogurt', 'egg', 'honey', 'gelatin', 'lard', 'bacon',
    'prosciutto', 'anchovy', 'sardine', 'tallow', 'suet', 'whey', 'casein',
  ],
  vegetarian: [
    'meat', 'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'fish',
    'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 'anchovy', 'sardine',
    'bacon', 'prosciutto', 'lard', 'tallow', 'suet', 'gelatin',
  ],
  pescatarian: [
    'meat', 'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck',
    'bacon', 'prosciutto', 'lard', 'tallow', 'suet',
  ],
  halal: [
    'pork', 'bacon', 'prosciutto', 'lard', 'ham', 'pancetta', 'chorizo',
    'alcohol', 'wine', 'beer', 'rum', 'vodka', 'whiskey', 'sake', 'mirin',
  ],
  'gluten-free': [
    'wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'spelt', 'semolina',
    'couscous', 'bulgur', 'farro', 'panko', 'breadcrumb', 'soy sauce',
  ],
  'dairy-free': [
    'milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'ghee',
    'kefir', 'creme fraiche', 'mascarpone', 'ricotta', 'brie', 'cheddar',
    'parmesan', 'mozzarella', 'feta', 'gouda',
  ],
  'nut-free': [
    'almond', 'walnut', 'pecan', 'cashew', 'pistachio', 'hazelnut', 'macadamia',
    'brazil nut', 'pine nut', 'peanut', 'nut butter', 'tahini',
  ],
  'shellfish-free': [
    'shrimp', 'crab', 'lobster', 'clam', 'oyster', 'mussel', 'scallop',
    'prawn', 'crawfish', 'crayfish',
  ],
};

export function checkDietaryGuardrails(
  recipe: { ingredients: Array<{ name: string; note?: string }> },
  profile: { restrictions: string[]; dislikes: string[] }
): GuardrailResult {
  const violations: string[] = [];

  for (const restriction of profile.restrictions) {
    const keywords = RESTRICTION_KEYWORDS[restriction.toLowerCase()];
    if (!keywords) continue;

    for (const ingredient of recipe.ingredients) {
      const searchText = [ingredient.name, ingredient.note ?? '']
        .join(' ')
        .toLowerCase();

      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          violations.push(
            `${restriction} violation: "${ingredient.name}" contains "${keyword}"`
          );
          break;
        }
      }
    }
  }

  for (const dislike of profile.dislikes) {
    const dislikeLower = dislike.toLowerCase();
    for (const ingredient of recipe.ingredients) {
      if (ingredient.name.toLowerCase().includes(dislikeLower)) {
        violations.push(`Disliked ingredient: "${ingredient.name}" matches dislike "${dislike}"`);
      }
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}
