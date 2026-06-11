import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { FlavorWheel } from '../components/genome/FlavorWheel';
import PageShell from '../components/layout/PageShell';
import type { FlavorGenome } from '@savora/shared-types';

interface AxisScore {
  axis: string;
  score: number;
}

interface FlavorAnalysis {
  wheel: FlavorGenome;
  dominantAffinities: AxisScore[];
  recessiveNotes: AxisScore[];
  fullSpectrum: AxisScore[];
  dimensions: {
    noveltyDrive: number;
    intensityPreference: number;
    richnessTendency: number;
    explorationIndex: number;
  };
  evolutionInsight: string;
  flavorPersonality: string;
}

const EVOLUTION_PLACEHOLDER = 'Your flavor evolution will appear here as you explore.';

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-muted)',
  margin: '0 0 var(--space-4)',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
};

function spectrumFillColor(score: number): string {
  if (score >= 7.5) return 'rgba(201,169,110,1)';
  if (score >= 5.0) return 'rgba(201,169,110,0.7)';
  return 'rgba(255,255,255,0.15)';
}

function AffinityCard({
  title,
  rows,
  variant,
}: {
  title: string;
  rows: AxisScore[];
  variant: 'dominant' | 'recessive';
}) {
  const isDominant = variant === 'dominant';
  return (
    <div style={cardStyle}>
      <h2
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: '10px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: isDominant ? 'var(--color-accent-muted)' : 'var(--color-text-muted)',
          margin: '0 0 var(--space-3)',
        }}
      >
        {title}
      </h2>
      {rows.map((row) => (
        <div
          key={row.axis}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: 'var(--space-2) 0',
            borderTop: '1px solid rgba(201,169,110,0.2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: isDominant ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {row.axis}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '13px',
              color: isDominant ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {row.score.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

const DIMENSION_CARDS: {
  key: keyof FlavorAnalysis['dimensions'];
  title: string;
  description: string;
}[] = [
  { key: 'noveltyDrive', title: 'Novelty Drive', description: 'Appetite for the unfamiliar' },
  {
    key: 'intensityPreference',
    title: 'Intensity Preference',
    description: 'Tolerance for bold, assertive flavors',
  },
  {
    key: 'richnessTendency',
    title: 'Richness Tendency',
    description: 'Dense and complex vs. light and clean',
  },
  { key: 'explorationIndex', title: 'Exploration Index', description: 'Breadth of culinary curiosity' },
];

const FlavorGenomePage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery<FlavorAnalysis>({
    queryKey: ['genome', 'flavor', 'analysis'],
    queryFn: async () => {
      const res = await api.get<FlavorAnalysis>('/genome/flavor/analysis');
      return res.data;
    },
  });

  return (
    <PageShell>
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: 'var(--space-6)',
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

        {/* Header */}
        <header style={{ marginBottom: 'var(--space-6)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-muted)',
              margin: '0 0 var(--space-2)',
            }}
          >
            Flavor Genome
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Defines what your palate biologically seeks — sensory, not behavioral.
          </p>
        </header>

        {isLoading && (
          <div
            style={{
              padding: 'var(--space-8) 0',
              textAlign: 'center',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
            }}
          >
            Loading flavor analysis…
          </div>
        )}

        {isError && (
          <div style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Could not load your flavor analysis.
            </p>
            <button
              onClick={() => refetch()}
              style={{
                background: 'none',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-4)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-label)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {data && (
          <>
            {/* Section 1: Flavor wheel */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--space-10) 0',
              }}
            >
              <FlavorWheel size="lg" scores={data.wheel} />
            </div>

            {/* Section 2: Dominant / Recessive */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  typeof window !== 'undefined' && window.innerWidth >= 640 ? '1fr 1fr' : '1fr',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-8)',
              }}
            >
              <AffinityCard
                title="Dominant Affinities"
                rows={data.dominantAffinities}
                variant="dominant"
              />
              <AffinityCard title="Recessive Notes" rows={data.recessiveNotes} variant="recessive" />
            </div>

            {/* Section 3: Full spectrum */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={sectionHeaderStyle}>Full Spectrum</h2>
              {data.fullSpectrum.map((row, i) => (
                <div
                  key={row.axis}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '44px',
                    gap: 'var(--space-4)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      width: '120px',
                      flexShrink: 0,
                    }}
                  >
                    {row.axis}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      position: 'relative',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(row.score / 10) * 100}%` }}
                      transition={{ duration: 0.4, delay: i * 0.03, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '1px',
                        backgroundColor: spectrumFillColor(row.score),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '12px',
                      color: 'var(--color-text-primary)',
                      width: '24px',
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    {Math.round(row.score)}
                  </span>
                </div>
              ))}
            </section>

            {/* Section 4: Flavor evolution */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={sectionHeaderStyle}>Flavor Evolution</h2>
              <div
                style={{
                  backgroundColor: 'var(--color-bg-surface)',
                  borderLeft: '4px solid var(--color-accent-primary)',
                  padding: 'var(--space-5)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    fontStyle:
                      data.evolutionInsight === EVOLUTION_PLACEHOLDER ? 'normal' : 'italic',
                    color:
                      data.evolutionInsight === EVOLUTION_PLACEHOLDER
                        ? 'var(--color-text-muted)'
                        : 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {data.evolutionInsight}
                </p>
              </div>
            </section>

            {/* Section 5: Dimension analysis */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={sectionHeaderStyle}>Dimension Analysis</h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-4)',
                }}
              >
                {DIMENSION_CARDS.map((card) => (
                  <div
                    key={card.key}
                    style={{
                      backgroundColor: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4) var(--space-5)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-label)',
                          fontSize: '11px',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {card.title}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-label)',
                          fontSize: '14px',
                          color: 'var(--color-accent-primary)',
                        }}
                      >
                        {data.dimensions[card.key].toFixed(1)}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '40px',
                        borderBottom: '2px solid var(--color-accent-primary)',
                        marginBottom: 'var(--space-3)',
                      }}
                    />
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </PageShell>
  );
};

export default FlavorGenomePage;
