import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import PageShell from '../components/layout/PageShell';

interface BehaviorScore {
  label: string;
  score: number;
}

interface IdentityDetail {
  identityTitle: string;
  keywords: string[];
  description: string;
  whyPaliatoAssignedThis: string;
  behaviorScores: BehaviorScore[];
  cuisineAffinity: { cuisine: string; score: number }[];
  atmospherePreferences: string[];
  evolutionNote: string;
}

const sectionHeaderStyle: React.CSSProperties = {
  fontFamily: 'var(--font-label)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'var(--color-accent-muted)',
  margin: '0 0 var(--space-4)',
};

const BrainIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,110,0.7)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-3.22 3 3 0 0 1 .79-5.19 2.5 2.5 0 0 1 2.74-4.12z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-3.22 3 3 0 0 0-.79-5.19 2.5 2.5 0 0 0-2.74-4.12z" />
  </svg>
);

function BarRow({ label, score, index }: { label: string; score: number; index: number }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 'var(--space-1)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '12px',
            color: 'var(--color-accent-primary)',
          }}
        >
          {score.toFixed(1)}
        </span>
      </div>
      <div
        style={{
          height: '3px',
          borderRadius: '2px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: '2px',
            backgroundColor:
              score >= 7.5
                ? 'rgba(201,169,110,1)'
                : score >= 5
                ? 'rgba(201,169,110,0.65)'
                : 'rgba(255,255,255,0.2)',
          }}
        />
      </div>
    </div>
  );
}

const IdentityGenomePage: React.FC = () => {
  const navigate = useNavigate();
  const [whyExpanded, setWhyExpanded] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery<IdentityDetail>({
    queryKey: ['genome', 'identity', 'detail'],
    queryFn: async () => {
      const res = await api.get<IdentityDetail>('/genome/identity/detail');
      return res.data;
    },
  });

  return (
    <PageShell>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-6)' }}>
        {/* Back */}
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
            Loading identity analysis…
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
              Could not load your identity analysis.
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
            {/* Section 1: Identity Card */}
            <section
              style={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid rgba(201,169,110,0.25)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-7)',
                marginBottom: 'var(--space-8)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <BrainIcon />
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(201,169,110,0.6)',
                  }}
                >
                  Taste Identity
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  color: 'var(--color-text-primary)',
                  margin: '0 0 var(--space-4)',
                  lineHeight: 1.15,
                }}
              >
                {data.identityTitle}
              </h1>

              {/* Keywords */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                {data.keywords.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent-primary)',
                      border: '1px solid rgba(201,169,110,0.35)',
                      borderRadius: '999px',
                      padding: '3px 10px',
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>

              {/* Description blockquote */}
              <blockquote
                style={{
                  borderLeft: '3px solid rgba(201,169,110,0.4)',
                  paddingLeft: 'var(--space-4)',
                  margin: '0 0 var(--space-6)',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '15px',
                    fontStyle: 'italic',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {data.description}
                </p>
              </blockquote>

              {/* WHY nested card */}
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setWhyExpanded((v) => !v)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-4) var(--space-5)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent-muted)',
                    }}
                  >
                    Why Paliato assigned this
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '14px',
                      color: 'var(--color-text-muted)',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                      transform: whyExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    ↓
                  </span>
                </button>
                {whyExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ padding: 'var(--space-2) var(--space-5) var(--space-5)' }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {data.whyPaliatoAssignedThis}
                    </p>
                  </motion.div>
                )}
              </div>
            </section>

            {/* Section 2: Behavioral Profile */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={sectionHeaderStyle}>Behavioral Profile</h2>
              {data.behaviorScores.map((row, i) => (
                <BarRow key={row.label} label={row.label} score={row.score} index={i} />
              ))}
            </section>

            {/* Section 3: Cuisine Affinity */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={sectionHeaderStyle}>Cuisine Affinity</h2>
              {data.cuisineAffinity.map((item, i) => (
                <div
                  key={item.cuisine}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '10px',
                      color: 'var(--color-accent-primary)',
                      width: '18px',
                      flexShrink: 0,
                      textAlign: 'right',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          color: i < 3 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        }}
                      >
                        {item.cuisine}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-label)',
                          fontSize: '11px',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {item.score.toFixed(1)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: '2px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '1px',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.score / 10) * 100}%` }}
                        transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          backgroundColor: i < 3 ? 'rgba(201,169,110,0.8)' : 'rgba(255,255,255,0.15)',
                          borderRadius: '1px',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Section 4: Atmosphere Preferences */}
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={sectionHeaderStyle}>Atmosphere Preferences</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {data.atmospherePreferences.map((atm) => (
                  <span
                    key={atm}
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '999px',
                      padding: '5px 12px',
                    }}
                  >
                    {atm}
                  </span>
                ))}
              </div>
            </section>

            {/* Section 5: Identity Evolution */}
            {data.evolutionNote && (
              <section style={{ marginBottom: 'var(--space-8)' }}>
                <h2 style={sectionHeaderStyle}>Identity Evolution</h2>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-5)',
                  }}
                >
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-accent-primary)',
                      flexShrink: 0,
                      marginTop: '6px',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontStyle: 'italic',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {data.evolutionNote}
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
};

export default IdentityGenomePage;
