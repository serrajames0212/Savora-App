import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { useToastStore } from '../stores/useToastStore';
import api from '../lib/api';

interface MealLog {
  id: string;
  recipeName: string;
  moodTag?: string;
  notes?: string;
  loggedAt: string;
}

interface FlavorAnalysis {
  dominantAffinities: string[];
  flavorPersonality: string;
  evolutionInsight: string;
  fullSpectrum: Array<{ dimension: string; score: number }>;
}

export default function TasteEvolutionPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();

  const { data: flavorData, isLoading: flavorLoading } = useQuery<FlavorAnalysis>({
    queryKey: ['genome-flavor-analysis'],
    queryFn: () => api.get('/genome/flavor/analysis').then((r) => r.data),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery<{ logs: MealLog[] }>({
    queryKey: ['meal-log'],
    queryFn: () => api.get('/meal-log').then((r) => r.data),
  });

  const recalibrateMutation = useMutation({
    mutationFn: () => api.post('/genome/recalibrate'),
    onSuccess: () => {
      addToast('Genome recalibrated!', 'success');
      queryClient.invalidateQueries({ queryKey: ['genome-flavor-analysis'] });
    },
    onError: () => addToast('Recalibration failed', 'error'),
  });

  const logs = logsData?.logs ?? [];
  const topFlavors = flavorData?.fullSpectrum?.sort((a, b) => b.score - a.score).slice(0, 3) ?? [];

  return (
    <PageShell>
      <div style={{ padding: 'var(--space-6)', maxWidth: 640, margin: '0 auto', paddingBottom: 100 }}>
        <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 14 }}>
          ← Profile
        </button>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Taste Evolution</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 'var(--space-6)' }}>Track how your palate grows with every meal you log.</p>

        {/* Current genome summary */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Current Flavor Profile</h2>
          {flavorLoading ? (
            <><SkeletonLoader height="16px" width="100%" /><div style={{ marginTop: 8 }}><SkeletonLoader height="16px" width="70%" /></div></>
          ) : topFlavors.length > 0 ? (
            topFlavors.map(({ dimension, score }) => (
              <div key={dimension} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{dimension.replace(/Score$/, '')}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{score}/100</span>
                </div>
                <div style={{ height: 6, backgroundColor: 'var(--color-bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${score}%`, height: '100%', backgroundColor: 'var(--color-accent-primary)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, fontStyle: 'italic' }}>Complete onboarding to build your flavor profile.</p>
          )}
          {flavorData?.evolutionInsight && (
            <Card style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', borderLeft: '3px solid var(--color-accent-primary)' }}>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>{flavorData.evolutionInsight}</p>
            </Card>
          )}
        </section>

        {/* Recalibrate */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-2)' }}>Recalibrate Your Genome</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 'var(--space-4)' }}>Re-analyse your taste profile based on your recent meals and activity.</p>
          <Button onClick={() => recalibrateMutation.mutate()} disabled={recalibrateMutation.isPending}>
            {recalibrateMutation.isPending ? 'Recalibrating...' : 'Recalibrate Now'}
          </Button>
        </section>

        {/* Meal log timeline */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Meal Timeline</h2>
          {logsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ marginBottom: 12 }}><SkeletonLoader height="60px" /></div>)
          ) : logs.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, fontStyle: 'italic' }}>No meals logged yet. Tap "Log This Meal" after generating or viewing a recipe.</p>
          ) : (
            logs.map((log) => (
              <Card key={log.id} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--color-text-primary)', margin: 0, marginBottom: 6 }}>{log.recipeName}</p>
                    {log.notes && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>{log.notes}</p>}
                    {log.moodTag && <div style={{ marginTop: 8 }}><Badge variant="accent">{log.moodTag}</Badge></div>}
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)', whiteSpace: 'nowrap' }}>
                    {new Date(log.loggedAt).toLocaleDateString()}
                  </span>
                </div>
              </Card>
            ))
          )}
        </section>
      </div>
    </PageShell>
  );
}
