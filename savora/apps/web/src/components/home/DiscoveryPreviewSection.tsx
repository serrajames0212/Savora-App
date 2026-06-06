import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscoveryPreview } from '../../hooks/useHomeData';
import { Badge } from '../ui/Badge';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const DiscoveryPreviewSection: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useDiscoveryPreview();

  const citySlug = data?.city?.toLowerCase().replace(/\s+/g, '-') ?? '';

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
        Discover
      </div>

      {isLoading ? (
        <div
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
            borderLeft: '3px solid var(--color-accent-border)',
          }}
        >
          <SkeletonLoader height="28px" width="50%" />
          <div style={{ marginTop: 'var(--space-3)' }}>
            <SkeletonLoader height="16px" width="100%" />
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <SkeletonLoader height="16px" width="80%" />
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <SkeletonLoader height="20px" width="100px" borderRadius="999px" />
          </div>
        </div>
      ) : data ? (
        <div
          onClick={() => navigate(`/discovery/${citySlug}`)}
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
            borderLeft: '3px solid var(--color-accent-primary)',
            boxShadow: 'var(--shadow-card)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
              lineHeight: 1.1,
            }}
          >
            {data.city}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              margin: '0 0 var(--space-4)',
            }}
          >
            {data.atmosphereDescription}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Badge variant="accent">{data.topDish}</Badge>
            <span
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '13px',
                color: 'var(--color-accent-primary)',
                letterSpacing: '0.04em',
              }}
            >
              Explore {data.city} →
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default DiscoveryPreviewSection;
