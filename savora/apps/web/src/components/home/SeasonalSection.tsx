import React from 'react';
import { useSeasonalInsight } from '../../hooks/useHomeData';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const SeasonalSection: React.FC = () => {
  const { data, isLoading } = useSeasonalInsight();

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
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {data.insight}
            </p>
          </div>
        ) : null}
      </Card>
    </section>
  );
};

export default SeasonalSection;
