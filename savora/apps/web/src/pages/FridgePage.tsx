import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import PaywallSheet from '../components/subscription/PaywallSheet';
import api from '../lib/api';

const MOODS = ['Comfort', 'Adventure', 'Depth', 'Ritual', 'Lightness', 'Surprise', 'Discover Something New'];
const COMMON_INGREDIENTS = ['garlic', 'onion', 'lemon', 'tomato', 'chicken', 'rice', 'olive oil', 'butter', 'eggs', 'pasta'];

interface MissingIngredient {
  name: string;
  amount: string;
  isEssential: boolean;
  substituteWith: string | null;
}

interface FridgeRecipe {
  id: string;
  title: string;
  description: string;
  mood: string;
  cuisineInspiration: string;
  ingredients: { name: string; amount: string; unit: string; note: string }[];
  steps: { step: number; instruction: string; technique: string }[];
  cookingTime: { prep: number; cook: number; total: number };
  difficulty: 'low' | 'medium' | 'high';
  platingSuggestion: string;
  pairingSuggestion: string;
  whyThisFits: string;
  usedIngredients: string[];
  missingIngredients: MissingIngredient[];
}

const LoadingOverlay: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={{
      position: 'fixed', inset: 0, backgroundColor: 'var(--color-bg-base)',
      zIndex: 100, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 'var(--space-6)',
    }}
  >
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-accent-primary)' }}
    />
    <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-primary)' }}>
      Crafting from your kitchen...
    </p>
    <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-muted)' }}>
      Applying your genome and dietary profile
    </p>
  </motion.div>
);

export default function FridgePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<FridgeRecipe | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const addIngredient = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue('');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const removeIngredient = (i: string) => setIngredients((prev) => prev.filter((x) => x !== i));

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/recipe/fridge', {
        availableIngredients: ingredients,
        mood: selectedMood && selectedMood !== 'Discover Something New' ? selectedMood : undefined,
      });
      if (res.data?.gated) { setShowPaywall(true); throw new Error('gated'); }
      return res.data as FridgeRecipe;
    },
    onSuccess: (data) => setRecipe(data),
  });

  const addMissingToList = async () => {
    if (!recipe) return;
    const essential = recipe.missingIngredients.filter((m) => m.isEssential);
    await api.post('/shopping/items', {
      items: essential.map((m) => ({ name: m.name, amount: m.amount })),
    });
    queryClient.invalidateQueries({ queryKey: ['shopping'] });
  };

  if (recipe) {
    return (
      <PageShell>
        <div style={{ padding: 'var(--space-6)', maxWidth: 640, margin: '0 auto' }}>
          <button
            onClick={() => setRecipe(null)}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 14 }}
          >
            ← Back to kitchen
          </button>

          {/* Ingredient panel */}
          <Card style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>You Have</p>
                {recipe.usedIngredients.map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-accent-primary)', fontSize: 12 }}>✓</span>
                    <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{i}</span>
                  </div>
                ))}
              </div>
              <div>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>You Need</p>
                {recipe.missingIngredients.map((m) => (
                  <div key={m.name} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 14, color: m.isEssential ? 'var(--color-text-secondary)' : 'var(--color-text-muted)', fontWeight: m.isEssential ? 500 : 400 }}>{m.name} {m.amount}</span>
                    {m.substituteWith && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>or {m.substituteWith}</div>}
                  </div>
                ))}
              </div>
            </div>
            {recipe.missingIngredients.some((m) => m.isEssential) && (
              <button
                onClick={addMissingToList}
                style={{ marginTop: 'var(--space-3)', fontSize: 13, color: 'var(--color-accent-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Add missing to shopping list
              </button>
            )}
          </Card>

          {/* Recipe */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>{recipe.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>{recipe.description}</p>

          {/* Why this fits */}
          <div style={{ borderLeft: '3px solid var(--color-accent-primary)', paddingLeft: 'var(--space-4)', marginBottom: 'var(--space-6)', fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
            {recipe.whyThisFits}
          </div>

          {/* Timing + difficulty */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            <Badge>Prep {recipe.cookingTime.prep}m</Badge>
            <Badge>Cook {recipe.cookingTime.cook}m</Badge>
            <Badge>Total {recipe.cookingTime.total}m</Badge>
            <Badge variant="muted">{recipe.difficulty}</Badge>
          </div>

          {/* Ingredients */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Ingredients</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginBottom: 'var(--space-6)' }}>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{ing.amount} {ing.unit}</span> {ing.name}
                {ing.note && <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}> · {ing.note}</span>}
              </div>
            ))}
          </div>

          {/* Steps */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Method</h3>
          {recipe.steps.map((s) => (
            <div key={s.step} style={{ marginBottom: 'var(--space-4)', paddingLeft: 'var(--space-4)', borderLeft: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-label)', color: 'var(--color-accent-primary)', marginBottom: 4 }}>Step {s.step} · {s.technique}</div>
              <p style={{ fontSize: 15, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{s.instruction}</p>
            </div>
          ))}

          {/* Plating + Pairing */}
          <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>{recipe.platingSuggestion}</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Pairing: {recipe.pairingSuggestion}</p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
            <Button variant="ghost" onClick={() => navigate('/favorites')}>Save to Favorites</Button>
            <Button onClick={() => mutation.mutate()}>Generate Another</Button>
          </div>
        </div>
        {showPaywall && <PaywallSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)} />}
        <AnimatePresence>{mutation.isPending && <LoadingOverlay />}</AnimatePresence>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <AnimatePresence>{mutation.isPending && <LoadingOverlay />}</AnimatePresence>
      <div style={{ padding: 'var(--space-6)', maxWidth: 540, margin: '0 auto' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 14 }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>
          What's in your kitchen?
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)' }}>Add your ingredients. We'll do the rest.</p>

        {/* Input */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type an ingredient and press Enter..."
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)', fontSize: 16, outline: 'none',
              fontFamily: 'var(--font-body)', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Common ingredient chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-4)' }}>
          {COMMON_INGREDIENTS.filter((c) => !ingredients.includes(c)).map((c) => (
            <button
              key={c}
              onClick={() => addIngredient(c)}
              style={{
                padding: '4px 12px', borderRadius: 999, border: '1px solid var(--color-border-medium)',
                backgroundColor: 'transparent', color: 'var(--color-text-muted)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'var(--font-body)',
              }}
            >
              + {c}
            </button>
          ))}
        </div>

        {/* Added ingredients */}
        {ingredients.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-6)' }}>
            {ingredients.map((ing) => (
              <span
                key={ing}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 999,
                  backgroundColor: 'var(--color-accent-primary)', color: '#1a1208',
                  fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500,
                }}
              >
                {ing}
                <button
                  onClick={() => removeIngredient(ing)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1208', padding: 0, lineHeight: 1, fontSize: 14 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Mood selector */}
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>Mood (optional)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-8)' }}>
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(selectedMood === m ? null : m)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                fontFamily: 'var(--font-body)', border: '1px solid',
                borderColor: selectedMood === m ? 'var(--color-accent-primary)' : 'var(--color-border-medium)',
                backgroundColor: selectedMood === m ? 'var(--color-accent-glow)' : 'transparent',
                color: selectedMood === m ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <Button
          onClick={() => mutation.mutate()}
          disabled={ingredients.length < 2 || mutation.isPending}
          style={{ width: '100%' }}
        >
          {ingredients.length < 2 ? `Add ${2 - ingredients.length} more ingredient${ingredients.length === 1 ? '' : 's'}` : 'Generate Recipe'}
        </Button>

        {mutation.isError && (mutation.error as Error)?.message !== 'gated' && (
          <p style={{ color: '#e06060', fontSize: 13, marginTop: 'var(--space-3)', textAlign: 'center' }}>
            Something went wrong. Please try again.
          </p>
        )}
      </div>
      {showPaywall && <PaywallSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)} />}
    </PageShell>
  );
}
