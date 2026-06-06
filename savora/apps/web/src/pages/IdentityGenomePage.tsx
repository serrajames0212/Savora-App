import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGenomeStore } from '../stores/useGenomeStore';
import { useEvolution, useIdentityWhy, type EvolutionData, type GatedEvolutionResponse } from '../hooks/useEvolution';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const BEHAVIOR_AXES: { key: keyof NonNullable<ReturnType<typeof useGenomeStore.getState>['culinaryIdentity']>['behaviorScores']; label: string; dual?: [string, string] }[] = [
  { key: 'adventurousness', label: 'Adventurousness' },
  { key: 'comfortVsNovelty', label: 'Comfort ←→ Novelty', dual: ['Comfort', 'Novelty'] },
  { key: 'luxuryVsRustic', label: 'Luxury ←→ Rustic', dual: ['Luxury', 'Rustic'] },
  { key: 'complexityTolerance', label: 'Complexity Tolerance' },
  { key: 'socialVsSolitary', label: 'Social ←→ Solitary', dual: ['Social', 'Solitary'] },
  { key: 'ritualVsSpontaneity', label: 'Ritual ←→ Spontaneity', dual: ['Ritual', 'Spontaneity'] },
  { key: 'finingDiningAffinity', label: 'Fine Dining Affinity' },
];

function ScoreBar({ score, delay }: { score: number; delay: number }) {
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
          backgroundColor: 'var(--color-accent-primary)',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      />
    </div>
  );
}

function SignificanceBadge({ significance }: { significance: 'minor' | 'moderate' | 'major' }) {
  const variantMap: Record<string, 'muted' | 'default' | 'accent'> = {
    minor: 'muted',
    moderate: 'default',
    major: 'accent',
  };
  return <Badge variant={variantMap[significance]}>{significance}</Badge>;
}

const IdentityGenomePage: React.FC = () => {
  const navigate = useNavigate();
  const culinaryIdentity = useGenomeStore((s) => s.culinaryIdentity);
  const { data: evolutionData, isLoading: evolutionLoading } = useEvolution();
  const { data: whyData, isLoading: whyLoading } = useIdentityWhy();

  if (!culinaryIdentity) {
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
        No identity genome found. Complete onboarding first.
      </div>
    );
  }

  const isGated =
    evolutionData && 'gated' in evolutionData && (evolutionData as GatedEvolutionResponse).gated;
  const evolution =
    evolutionData && !('gated' in evolutionData) ? (evolutionData as EvolutionData) : null;

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
          margin: '0 0 var(--space-2)',
          lineHeight: 1.2,
        }}
      >
        {culinaryIdentity.identityTitle}
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          margin: '0 0 var(--space-4)',
          lineHeight: 1.6,
        }}
      >
        {culinaryIdentity.identitySubtitle}
      </p>

      {/* Evolution note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <motion.div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-primary)',
            flexShrink: 0,
          }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            margin: 0,
          }}
        >
          {culinaryIdentity.evolutionNote}
        </p>
      </div>

      {/* Behavior Profile */}
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
          Behavior Profile
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {BEHAVIOR_AXES.map((axis, i) => {
            const score = culinaryIdentity.behaviorScores[axis.key];
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
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {axis.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '12px',
                      color: 'var(--color-accent-primary)',
                    }}
                  >
                    {Math.round(score)}
                  </span>
                </div>
                <ScoreBar score={score} delay={i * 0.05} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Cuisine Affinity */}
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
          Cuisine Affinity
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {culinaryIdentity.cuisineAffinity.map((cuisine, i) => (
            <div
              key={cuisine}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  color: 'var(--color-accent-primary)',
                  width: '20px',
                  flexShrink: 0,
                  textAlign: 'center',
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: i < 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {cuisine}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Atmosphere */}
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
          Atmosphere
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {culinaryIdentity.diningAtmospherePreference.map((atm) => (
            <Badge key={atm} variant="default">
              {atm}
            </Badge>
          ))}
        </div>
      </section>

      {/* Why you are [identityTitle] */}
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
          Why you are {culinaryIdentity.identityTitle}
        </h2>
        {whyLoading ? (
          <div
            style={{
              height: '60px',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-md)',
              opacity: 0.5,
            }}
          />
        ) : whyData?.explanation ? (
          <div
            style={{
              borderLeft: '2px solid var(--color-accent-border)',
              paddingLeft: 'var(--space-4)',
              paddingTop: 'var(--space-3)',
              paddingBottom: 'var(--space-3)',
              backgroundColor: 'var(--color-bg-elevated)',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
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
              {whyData.explanation}
            </p>
          </div>
        ) : null}
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
          Your Evolution
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
                Taste evolution tracking is a Savora Reserve feature.
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
        ) : evolution ? (
          <>
            {!evolution.hasEnoughData && evolution.dataNote && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {evolution.dataNote}
              </p>
            )}

            {evolution.identityShifts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                {evolution.identityShifts.map((shift, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'var(--color-bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      borderLeft: '2px solid var(--color-border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-label)',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {shift.period}
                      </span>
                      <SignificanceBadge significance={shift.significance} />
                    </div>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {shift.what}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {evolution.overallNarrative && (
              <Card variant="elevated">
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
                  {evolution.overallNarrative}
                </p>
              </Card>
            )}

            {evolution.currentMomentum && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  marginTop: 'var(--space-4)',
                  lineHeight: 1.5,
                }}
              >
                {evolution.currentMomentum}
              </p>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
};

export default IdentityGenomePage;
