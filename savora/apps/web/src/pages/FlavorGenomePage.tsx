import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGenomeStore } from '../stores/useGenomeStore';
import { useEvolution, type EvolutionData, type GatedEvolutionResponse } from '../hooks/useEvolution';
import { FlavorWheel } from '../components/genome/FlavorWheel';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { FlavorGenome } from '@savora/shared-types';

const FLAVOR_AXES: { key: keyof FlavorGenome; label: string }[] = [
  { key: 'saltScore', label: 'Salt' },
  { key: 'sweetScore', label: 'Sweet' },
  { key: 'bitterScore', label: 'Bitter' },
  { key: 'acidityScore', label: 'Acidity' },
  { key: 'heatScore', label: 'Heat' },
  { key: 'aromaticSpiceScore', label: 'Aromatic Spice' },
  { key: 'umamiScore', label: 'Umami' },
  { key: 'fatRichnessScore', label: 'Fat Richness' },
  { key: 'smokeCharScore', label: 'Smoke & Char' },
  { key: 'fermentationScore', label: 'Fermentation' },
  { key: 'mineralCleanScore', label: 'Mineral Clean' },
  { key: 'aromaticIntensityScore', label: 'Aromatic Intensity' },
];

function ScoreBar({ score, delay, highlight }: { score: number; delay: number; highlight: boolean }) {
  return (
    <div
      style={{
        height: '4px',
        borderRadius: '2px',
        backgroundColor: 'var(--color-bg-elevated)',
        overflow: 'hidden',
        marginTop: 'var(--space-1)',
      }}
    >
      <motion.div
        style={{
          height: '100%',
          borderRadius: '2px',
          backgroundColor: highlight
            ? 'var(--color-accent-primary)'
            : 'rgba(196, 155, 94, 0.4)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

const FlavorGenomePage: React.FC = () => {
  const navigate = useNavigate();
  const flavorGenome = useGenomeStore((s) => s.flavorGenome);
  const { data: evolutionData, isLoading: evolutionLoading } = useEvolution();

  if (!flavorGenome) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-body)',
        }}
      >
        No flavor genome found. Complete onboarding first.
      </div>
    );
  }

  const isGated =
    evolutionData && 'gated' in evolutionData && (evolutionData as GatedEvolutionResponse).gated;
  const evolution =
    evolutionData && !('gated' in evolutionData) ? (evolutionData as EvolutionData) : null;

  const dominantSet = new Set(flavorGenome.dominantFlavors ?? []);

  // Build scores object for FlavorWheel
  const wheelScores = {
    saltScore: flavorGenome.saltScore,
    sweetScore: flavorGenome.sweetScore,
    bitterScore: flavorGenome.bitterScore,
    acidityScore: flavorGenome.acidityScore,
    heatScore: flavorGenome.heatScore,
    aromaticSpiceScore: flavorGenome.aromaticSpiceScore,
    umamiScore: flavorGenome.umamiScore,
    fatRichnessScore: flavorGenome.fatRichnessScore,
    smokeCharScore: flavorGenome.smokeCharScore,
    fermentationScore: flavorGenome.fermentationScore,
    mineralCleanScore: flavorGenome.mineralCleanScore,
    aromaticIntensityScore: flavorGenome.aromaticIntensityScore,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: 'var(--space-6)',
        maxWidth: '390px',
        margin: '0 auto',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/profile')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '0 0 var(--space-6) 0',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
        }}
      >
        ← Profile
      </button>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-6)',
          lineHeight: 1.2,
        }}
      >
        Flavor Genome
      </h1>

      {/* FlavorWheel centered */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--space-8)',
        }}
      >
        <FlavorWheel scores={wheelScores} size="lg" />
      </div>

      {/* Flavor personality */}
      {flavorGenome.flavorPersonality && (
        <div
          style={{
            borderLeft: '3px solid var(--color-accent-border)',
            paddingLeft: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            paddingBottom: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: 'var(--space-8)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {flavorGenome.flavorPersonality}
          </p>
        </div>
      )}

      {/* Dominant flavors */}
      {flavorGenome.dominantFlavors && flavorGenome.dominantFlavors.length > 0 && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              margin: '0 0 var(--space-4)',
            }}
          >
            Dominant Flavors
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {flavorGenome.dominantFlavors.map((f) => (
              <Badge key={f} variant="accent">
                {f}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* All 12 axis scores */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-5)',
          }}
        >
          Flavor Axes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {FLAVOR_AXES.map((axis, i) => {
            const rawScore = flavorGenome[axis.key];
            const score = typeof rawScore === 'number' ? rawScore : 0;
            const highlight = dominantSet.has(axis.label);
            return (
              <div key={axis.key}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: highlight
                        ? 'var(--color-accent-primary)'
                        : 'var(--color-text-secondary)',
                      fontWeight: highlight ? 500 : 400,
                    }}
                  >
                    {axis.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '12px',
                      color: highlight
                        ? 'var(--color-accent-primary)'
                        : 'var(--color-text-muted)',
                    }}
                  >
                    {Math.round(score)}
                  </span>
                </div>
                <ScoreBar score={score} delay={i * 0.05} highlight={highlight} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Evolution (Reserve only) */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-4)',
          }}
        >
          Flavor Evolution
        </h2>

        {evolutionLoading ? (
          <div
            style={{
              height: '80px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              opacity: 0.5,
            }}
          />
        ) : isGated ? (
          <Card variant="surface">
            <div style={{ textAlign: 'center', padding: 'var(--space-2) 0' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-4)',
                  lineHeight: 1.5,
                }}
              >
                Flavor evolution tracking is a Savora Reserve feature.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/profile/subscription')}
              >
                Upgrade to Reserve
              </Button>
            </div>
          </Card>
        ) : evolution && evolution.flavorShifts.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {evolution.flavorShifts.map((shift, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    backgroundColor: 'var(--color-bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-3) var(--space-4)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      color:
                        shift.direction === 'increased'
                          ? 'var(--color-accent-primary)'
                          : 'var(--color-text-muted)',
                    }}
                  >
                    {shift.direction === 'increased' ? '↑' : '↓'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {shift.axis}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        marginTop: '2px',
                      }}
                    >
                      {shift.period} · +{shift.amount}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {evolution.weeklyInsight && (
              <Card variant="surface">
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {evolution.weeklyInsight}
                </p>
              </Card>
            )}
          </>
        ) : evolution ? (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
            }}
          >
            {evolution.dataNote ?? 'Not enough data to show flavor shifts yet.'}
          </p>
        ) : null}
      </section>
    </div>
  );
};

export default FlavorGenomePage;
