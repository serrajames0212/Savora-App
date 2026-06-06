import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../../hooks/useHomeData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const MemoryHighlightSection: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useJourney();

  if (isLoading) return null;

  const lastFavorite = data?.lastFavorite ?? null;

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
        From your memory
      </div>

      {lastFavorite ? (
        <Card variant="elevated" onClick={() => navigate('/favorites')}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {lastFavorite.title}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                {lastFavorite.mood && <Badge variant="accent">{lastFavorite.mood}</Badge>}
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Saved {new Date(lastFavorite.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                color: 'var(--color-accent-primary)',
                flexShrink: 0,
                paddingTop: 'var(--space-1)',
              }}
            >
              →
            </div>
          </div>
        </Card>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            lineHeight: 1.6,
          }}
        >
          Your memory vault is just beginning. Start exploring to fill it.
        </div>
      )}
    </section>
  );
};

export default MemoryHighlightSection;
