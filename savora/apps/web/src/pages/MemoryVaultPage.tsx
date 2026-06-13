import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemoryVault } from '../hooks/useMemory';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PaywallSheet from '../components/subscription/PaywallSheet';
import type { MemoryChapter } from '@paliato/shared-types';
import { useIsReserve } from '../hooks/useIsReserve';

// ─── Skeleton ───────────────────────────────────────────────────────────────

const MemorySkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
    <SkeletonLoader height="24px" width="60%" />
    <SkeletonLoader height="14px" width="40%" />
    {[1, 2].map((i) => (
      <div key={i} style={{ display: 'flex', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <SkeletonLoader width="10px" height="10px" borderRadius="50%" />
          <SkeletonLoader width="2px" height="80px" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <SkeletonLoader height="18px" width="70%" />
          <SkeletonLoader height="14px" width="90%" />
          <SkeletonLoader height="14px" width="80%" />
          <SkeletonLoader height="20px" width="50%" borderRadius="999px" />
        </div>
      </div>
    ))}
    <SkeletonLoader height="80px" borderRadius="var(--radius-md)" />
    <SkeletonLoader height="120px" borderRadius="var(--radius-md)" />
  </div>
);

// ─── Empty / Nudge card ──────────────────────────────────────────────────────

const NudgeCard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Card variant="elevated">
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          fontStyle: 'italic',
          color: 'var(--color-text-muted)',
          margin: 0,
          marginBottom: 'var(--space-4)',
          lineHeight: 1.6,
        }}
      >
        Your vault is just beginning to fill. Keep exploring.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <Button variant="outline" size="sm" onClick={() => navigate('/discovery')}>
          Explore a city
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/generate')}>
          Generate a recipe
        </Button>
      </div>
    </Card>
  );
};

// ─── Chapter entry ───────────────────────────────────────────────────────────

const ChapterEntry: React.FC<{ chapter: MemoryChapter; index: number }> = ({ chapter, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -24 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.4, delay: index * 0.08 }}
    style={{ display: 'flex', gap: 'var(--space-4)' }}
  >
    {/* Timeline spine */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        width: '18px',
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent-primary)',
          flexShrink: 0,
          marginTop: '4px',
        }}
      />
      <div
        style={{
          width: '2px',
          flex: 1,
          backgroundColor: 'var(--color-accent-primary)',
          opacity: 0.35,
          minHeight: '40px',
          marginTop: '4px',
        }}
      />
    </div>

    {/* Content */}
    <div style={{ flex: 1, paddingBottom: 'var(--space-8)' }}>
      <p
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: '11px',
          color: 'var(--color-text-muted)',
          margin: 0,
          marginBottom: 'var(--space-1)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {chapter.period}
      </p>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 'var(--space-2)',
          letterSpacing: '-0.01em',
        }}
      >
        {chapter.title}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginBottom: 'var(--space-3)',
          lineHeight: 1.55,
        }}
      >
        {chapter.description}
      </p>

      {/* Cuisines + moods */}
      {(chapter.dominantCuisines.length > 0 || chapter.dominantMoods.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-3)' }}>
          {chapter.dominantCuisines.map((c) => (
            <Badge key={c} variant="accent">{c}</Badge>
          ))}
          {chapter.dominantMoods.map((m) => (
            <Badge key={m} variant="muted">{m}</Badge>
          ))}
        </div>
      )}

      {/* Key recipes */}
      {chapter.keyRecipes.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {chapter.keyRecipes.map((r) => (
            <li
              key={r}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                paddingLeft: 'var(--space-3)',
                position: 'relative',
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--color-accent-primary)',
                }}
              >
                ·
              </span>
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  </motion.div>
);

// ─── Horizontal bar ──────────────────────────────────────────────────────────

const HorizontalBar: React.FC<{ label: string; value: number; max: number; delay?: number }> = ({
  label,
  value,
  max,
  delay = 0,
}) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
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
            fontWeight: 500,
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          height: '4px',
          backgroundColor: 'var(--color-bg-overlay)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
          style={{
            height: '100%',
            backgroundColor: 'var(--color-accent-primary)',
            borderRadius: '2px',
          }}
        />
      </div>
    </div>
  );
};

// ─── Gated upgrade card ──────────────────────────────────────────────────────

const GatedCard: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => (
  <Card variant="elevated">
    <p
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: 400,
        color: 'var(--color-text-primary)',
        margin: 0,
        marginBottom: 'var(--space-2)',
        letterSpacing: '-0.01em',
      }}
    >
      Your full taste history awaits.
    </p>
    <p
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: 'var(--color-text-muted)',
        margin: 0,
        marginBottom: 'var(--space-4)',
        lineHeight: 1.55,
      }}
    >
      Unlock the complete Memory Vault with Paliato Reserve.
    </p>
    <Button variant="primary" size="sm" onClick={onUpgrade}>
      Unlock full history
    </Button>
  </Card>
);

// ─── Section label ───────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      fontFamily: 'var(--font-label)',
      fontSize: '11px',
      fontWeight: 500,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--color-text-muted)',
      margin: 0,
      marginBottom: 'var(--space-4)',
    }}
  >
    {children}
  </p>
);

// ─── Main page ───────────────────────────────────────────────────────────────

const MemoryVaultPage: React.FC = () => {
  const { data, isLoading, isError } = useMemoryVault();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const isReserve = useIsReserve();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg-base)',
          padding: 'var(--space-6) var(--space-4)',
          maxWidth: '480px',
          margin: '0 auto',
        }}
      >
        <MemorySkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg-base)',
          padding: 'var(--space-6) var(--space-4)',
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            fontStyle: 'italic',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          The vault is temporarily unavailable. Please try again.
        </p>
      </div>
    );
  }

  const hasChapters = data.chapters && data.chapters.length > 0;
  const showNudge = !hasChapters && !!data.dataNote;

  const cityMax = data.strongestCities.length > 0 ? data.strongestCities[0].searchCount : 1;
  const moodEntries = Object.entries(data.moodFrequency ?? {}).sort((a, b) => b[1] - a[1]);
  const moodMax = moodEntries.length > 0 ? moodEntries[0][1] : 1;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: 'var(--space-6) var(--space-4)',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 'var(--space-1)',
          letterSpacing: '-0.01em',
        }}
      >
        Memory Vault
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: 0,
          marginBottom: 'var(--space-8)',
          fontStyle: 'italic',
        }}
      >
        Your taste, over time.
      </p>

      {/* Nudge if empty */}
      {showNudge && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <NudgeCard />
        </div>
      )}

      {/* Taste Chapters */}
      {hasChapters && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <SectionLabel>Taste Chapters</SectionLabel>
          {data.chapters.map((chapter, i) => {
            const isBlurred = !isReserve && i > 0;
            const isLastBlurred = !isReserve && i === data.chapters.length - 1 && i > 0;
            return (
              <div
                key={i}
                style={{ position: 'relative' }}
              >
                <div style={isBlurred ? { filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' } : undefined}>
                  <ChapterEntry chapter={chapter} index={i} />
                </div>
                {isLastBlurred && (
                  <div
                    onClick={() => setPaywallOpen(true)}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer',
                      padding: 'var(--space-4)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--color-text-secondary)',
                        margin: 0,
                        textAlign: 'center',
                        lineHeight: 1.55,
                      }}
                    >
                      Reserve unlocks your full taste history
                    </p>
                    <span
                      style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: '12px',
                        color: 'var(--color-accent-primary)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Unlock Reserve →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Patterns section */}
      {(data.strongestCities.length > 0 || moodEntries.length > 0 || data.topIngredients.length > 0) && (
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <SectionLabel>Patterns</SectionLabel>

          {/* Strongest cities */}
          {data.strongestCities.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Cities
              </p>
              {data.strongestCities.map((entry, i) => (
                <HorizontalBar
                  key={entry.city}
                  label={entry.city}
                  value={entry.searchCount}
                  max={cityMax}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}

          {/* Mood breakdown */}
          {moodEntries.length > 0 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Moods
              </p>
              {moodEntries.map(([mood, count], i) => (
                <HorizontalBar
                  key={mood}
                  label={mood}
                  value={count}
                  max={moodMax}
                  delay={i * 0.05}
                />
              ))}
            </div>
          )}

          {/* Top ingredients word cloud */}
          {data.topIngredients.length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Favourite Ingredients
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {data.topIngredients.map((ingredient, i) => {
                  // Vary font size by position — first = largest
                  const scale = Math.max(0.75, 1 - i * 0.07);
                  return (
                    <span
                      key={ingredient}
                      style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: `${Math.round(scale * 13)}px`,
                        color: i < 3 ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                        backgroundColor: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border-subtle)',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {ingredient}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Evolution insight */}
      {data.evolutionInsight && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderLeft: '4px solid var(--color-accent-primary)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-primary)',
                margin: 0,
                marginBottom: 'var(--space-2)',
              }}
            >
              Your Evolution
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontStyle: 'italic',
                color: 'var(--color-text-secondary)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {data.evolutionInsight}
            </p>
          </div>
        </motion.section>
      )}

      {/* Gated upgrade card for free users */}
      {data.isGated && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <GatedCard onUpgrade={() => setPaywallOpen(true)} />
        </div>
      )}

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
};

export default MemoryVaultPage;
