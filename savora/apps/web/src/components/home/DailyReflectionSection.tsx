import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyInsight } from '../../hooks/useHomeData';
import { Card } from '../ui/Card';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const DailyReflectionSection: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useDailyInsight();

  return (
    <section style={{ padding: '0 var(--space-5)' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-5)',
        }}
      >
        Today's Taste Reflection
      </div>

      <Card variant="elevated">
        {isLoading ? (
          <div>
            <SkeletonLoader height="16px" width="100%" />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SkeletonLoader height="16px" width="80%" />
            </div>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <SkeletonLoader height="14px" width="120px" />
            </div>
          </div>
        ) : isError || !data ? (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
            }}
          >
            Reflection unavailable today.
          </div>
        ) : (
          <div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                color: 'var(--color-text-primary)',
                lineHeight: 1.6,
                margin: 0,
                marginBottom: 'var(--space-4)',
              }}
            >
              {data.insight}
            </p>
            <button
              onClick={() => navigate(`/generate/${data.actionMood}`)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                fontFamily: 'var(--font-label)',
                fontSize: '13px',
                color: 'var(--color-accent-primary)',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              {data.actionLabel} →
            </button>
          </div>
        )}
      </Card>
    </section>
  );
};

export default DailyReflectionSection;
