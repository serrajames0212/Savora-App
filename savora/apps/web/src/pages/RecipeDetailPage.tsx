import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { GeneratedRecipe } from '@paliato/shared-types';
import PageShell from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import LogMealSheet from '../components/meal/LogMealSheet';
import { useToastStore } from '../stores/useToastStore';
import api from '../lib/api';

export default function RecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const [logOpen, setLogOpen] = useState(false);

  const { data: recipe, isLoading, isError } = useQuery<GeneratedRecipe>({
    queryKey: ['recipe', recipeId],
    queryFn: () => api.get(`/recipe/${recipeId}`).then((r) => r.data),
    enabled: !!recipeId,
  });

  const addToListMutation = useMutation({
    mutationFn: () => api.post('/shopping/add-from-recipe', { recipeId }),
    onSuccess: (res) => {
      addToast(`Added ${res.data.added} items to shopping list`, 'success');
    },
    onError: () => addToast('Failed to add to shopping list', 'error'),
  });

  if (isLoading) {
    return (
      <PageShell>
        <div style={{ padding: 'var(--space-6)', maxWidth: 640, margin: '0 auto' }}>
          <SkeletonLoader height="32px" width="60%" />
          <div style={{ marginTop: 'var(--space-4)' }}><SkeletonLoader height="16px" width="100%" /></div>
          <div style={{ marginTop: 'var(--space-2)' }}><SkeletonLoader height="16px" width="80%" /></div>
        </div>
      </PageShell>
    );
  }

  if (isError || !recipe) {
    return (
      <PageShell>
        <div style={{ padding: 'var(--space-6)', maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
          <p style={{ color: 'var(--color-text-muted)' }}>Recipe not found.</p>
          <Button onClick={() => navigate(-1)} style={{ marginTop: 'var(--space-4)' }}>Go back</Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ padding: 'var(--space-6)', maxWidth: 640, margin: '0 auto', paddingBottom: 100 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 14 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            <Badge variant="accent">{recipe.mood}</Badge>
            <Badge variant="default">{recipe.cuisineInspiration}</Badge>
            <Badge variant="muted">{recipe.difficulty}</Badge>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>{recipe.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{recipe.description}</p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          <Button onClick={() => addToListMutation.mutate()} disabled={addToListMutation.isPending}>
            {addToListMutation.isPending ? 'Adding...' : '+ Shopping List'}
          </Button>
          <Button variant="ghost" onClick={() => setLogOpen(true)}>Log This Meal</Button>
        </div>

        {recipe.whyThisFits && (
          <Card style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)', borderLeft: '3px solid var(--color-accent-primary)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>{recipe.whyThisFits}</p>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          {[['Prep', recipe.cookingTime.prep + 'm'], ['Cook', recipe.cookingTime.cook + 'm'], ['Total', recipe.cookingTime.total + 'm']].map(([label, val]) => (
            <Card key={label} style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>{val}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
            </Card>
          ))}
        </div>

        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Ingredients</h2>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <span style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{ing.name}{ing.note ? ` — ${ing.note}` : ''}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'right' }}>{ing.amount} {ing.unit}</span>
            </div>
          ))}
        </section>

        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Method</h2>
          {recipe.steps.map((step) => (
            <div key={step.step} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-bg-base)', fontSize: 12, fontFamily: 'var(--font-label)' }}>{step.step}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: 'var(--color-text-primary)', lineHeight: 1.7, margin: 0 }}>{step.instruction}</p>
                {step.technique && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>{step.technique}</p>}
              </div>
            </div>
          ))}
        </section>

        {recipe.platingSuggestion && (
          <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, fontFamily: 'var(--font-label)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Plating</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{recipe.platingSuggestion}</p>
          </Card>
        )}

        {recipe.pairingSuggestion && (
          <Card style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4, fontFamily: 'var(--font-label)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pairing</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>{recipe.pairingSuggestion}</p>
          </Card>
        )}
      </div>

      <LogMealSheet isOpen={logOpen} onClose={() => setLogOpen(false)} recipeName={recipe.title} recipeId={recipeId} />
    </PageShell>
  );
}
