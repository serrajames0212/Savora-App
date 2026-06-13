import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { useRecommendation } from '../../hooks/useHomeData';

const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.4'/></svg>`;

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { data: recommendation, isLoading } = useRecommendation();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '60vh',
        background: 'radial-gradient(ellipse at 40% 60%, #1a1208 0%, #0f0f0f 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        paddingBottom: '40px',
      }}
    >
      {/* Noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,${NOISE_SVG}")`,
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      />

      {/* Bronze geometric arc decoration — top right */}
      <svg
        viewBox="0 0 200 200"
        width="220"
        height="220"
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          opacity: 0.08,
          pointerEvents: 'none',
        }}
      >
        {[40, 70, 100, 130, 160].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="0"
            r={r}
            fill="none"
            stroke="var(--color-accent-primary)"
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Wordmark */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 6vw, 3.5rem)',
          color: 'var(--color-text-primary)',
          letterSpacing: '0.25em',
          textTransform: 'lowercase',
          position: 'relative',
          zIndex: 1,
        }}
      >
        paliato
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.2rem, 4vw, 2rem)',
          fontWeight: 300,
          color: 'var(--color-text-primary)',
          textAlign: 'center',
          marginTop: 'var(--space-4)',
          position: 'relative',
          zIndex: 1,
          padding: '0 var(--space-6)',
        }}
      >
        Taste, remembered differently.
      </div>

      {/* Subline */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          marginTop: 'var(--space-3)',
          position: 'relative',
          zIndex: 1,
          letterSpacing: '0.04em',
        }}
      >
        Your genome. Your city. Your mood.
      </div>

      {/* Recommendation card — docked at bottom, overlapping */}
      <div
        style={{
          position: 'absolute',
          bottom: '-28px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - var(--space-8))',
          maxWidth: '420px',
          zIndex: 10,
        }}
      >
        {isLoading ? (
          <div
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <SkeletonLoader height="12px" width="80px" />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SkeletonLoader height="20px" width="60%" />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SkeletonLoader height="12px" width="40%" />
            </div>
          </div>
        ) : recommendation ? (
          <div
            onClick={() => navigate('/discovery/' + recommendation.city.toLowerCase().replace(/\s+/g, '-'))}
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-5)',
              boxShadow: '0 0 24px var(--color-accent-glow), var(--shadow-elevated)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-1)',
              }}
            >
              Tonight in {recommendation.city}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                color: 'var(--color-text-primary)',
              }}
            >
              {recommendation.dish}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '12px',
                color: 'var(--color-accent-primary)',
                marginTop: 'var(--space-1)',
              }}
            >
              {recommendation.matchScore}% taste match
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HeroSection;
