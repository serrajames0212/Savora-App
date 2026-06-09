import React, { useState } from 'react';
import { useSeasonalInsight } from '../../hooks/useHomeData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { useIsReserve } from '../../hooks/useIsReserve';
import PaywallSheet from '../subscription/PaywallSheet';

const SeasonalSection: React.FC = () => {
  const { data, isLoading } = useSeasonalInsight();
  const isReserve = useIsReserve();
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Split insight into first sentence vs rest
  const insight = data?.insight ?? '';
  const firstDotIdx = insight.search(/[.!?]/);
  const firstSentence =
    firstDotIdx >= 0 ? insight.slice(0, firstDotIdx + 1) : insight;
  const restOfInsight =
    firstDotIdx >= 0 ? insight.slice(firstDotIdx + 1).trimStart() : '';

  return (
    <section style={{ padding: '0 var(--space-5)' }}>
      <Card variant="surface">
        {isLoading ? (
          <div>
            <SkeletonLoader height="20px" width="80px" borderRadius="999px" />
            <div style={{ marginTop: 'var(--space-3)' }}>
              <SkeletonLoader height="16px" width="100%" />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SkeletonLoader height="16px" width="70%" />
            </div>
          </div>
        ) : data ? (
          <div>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <Badge variant="accent">
                {data.season.charAt(0).toUpperCase() + data.season.slice(1)}
              </Badge>
            </div>

            {isReserve ? (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {insight}
              </p>
            ) : (
              <div style={{ position: 'relative' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.6,
                    margin: 0,
                    marginBottom: restOfInsight ? 'var(--space-1)' : 0,
                  }}
                >
                  {firstSentence}
                  {restOfInsight && (
                    <span style={{ position: 'relative' }}>
                      {' '}
                      <span
                        style={{
                          position: 'relative',
                          display: 'inline',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            color: 'transparent',
                            userSelect: 'none',
                          }}
                        >
                          {restOfInsight.slice(0, 40)}...
                        </span>
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background:
                              'linear-gradient(to right, transparent 0%, var(--color-bg-surface) 60%)',
                            pointerEvents: 'none',
                          }}
                        />
                      </span>
                    </span>
                  )}
                </p>

                {restOfInsight && (
                  <button
                    onClick={() => setPaywallOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-label)',
                      fontSize: '12px',
                      color: 'var(--color-accent-primary)',
                      letterSpacing: '0.04em',
                      marginTop: 'var(--space-2)',
                      display: 'block',
                    }}
                  >
                    Unlock full insight · Reserve
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Card>

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </section>
  );
};

export default SeasonalSection;
