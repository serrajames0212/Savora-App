import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { Badge } from '../components/ui/Badge';
import RestaurantCard from '../components/discovery/RestaurantCard';
import PaywallSheet from '../components/subscription/PaywallSheet';
import { useCityData } from '../hooks/useDiscovery';
import { useIsReserve } from '../hooks/useIsReserve';

function slugToCity(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const LOADING_PHRASES = [
  'Reading your genome...',
  'Mapping the city...',
  'Finding your matches...',
];

const EmblemPulse: React.FC<{ cityName: string }> = ({ cityName }) => {
  const [phraseIndex, setPhraseIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const phrases = [
    'Reading your genome...',
    `Mapping ${cityName}...`,
    'Finding your matches...',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        gap: 'var(--space-6)',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.5rem',
          color: 'var(--color-accent-primary)',
          letterSpacing: '0.12em',
          textTransform: 'lowercase',
        }}
      >
        savora
      </motion.div>
      <motion.p
        key={phraseIndex}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}
      >
        {phrases[phraseIndex]}
      </motion.p>
    </div>
  );
};

const InfoIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7" stroke="var(--color-text-muted)" strokeWidth="1.2" />
    <path d="M8 7v4" stroke="var(--color-text-muted)" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="5" r="0.8" fill="var(--color-text-muted)" />
  </svg>
);

const CityPage: React.FC = () => {
  const { city: citySlug = '' } = useParams<{ city: string }>();
  const cityName = slugToCity(citySlug);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const isReserve = useIsReserve();

  const { data, isLoading, error } = useCityData(cityName);

  // Check for 402 gated response
  const axiosError = error as { response?: { status?: number; data?: { gated?: boolean } } } | null;
  const isGated = axiosError?.response?.status === 402 && axiosError.response.data?.gated;

  React.useEffect(() => {
    if (isGated) setPaywallOpen(true);
  }, [isGated]);

  if (isLoading) {
    return <EmblemPulse cityName={cityName} />;
  }

  if (!data && !isGated) {
    return (
      <PageShell>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
          }}
        >
          {isGated ? null : 'Unable to load city data. Please try again.'}
        </div>
        <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-5) var(--space-10)',
        }}
      >
        {/* City hero */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--space-3)',
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
            }}
          >
            {cityName}
          </h1>

          {data?.cityIdentity && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--color-text-muted)',
                margin: '0 auto var(--space-4)',
                maxWidth: 480,
                lineHeight: 1.6,
              }}
            >
              {data.cityIdentity}
            </p>
          )}

          {data?.seasonalNote && (
            <Badge variant="accent">{data.seasonalNote}</Badge>
          )}
        </div>

        {/* AI disclaimer notice */}
        {data?.aiDisclaimer && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderLeft: '3px solid var(--color-accent-primary)',
              backgroundColor: 'var(--color-bg-surface)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              Recommendations are AI-generated based on your genome. Verify restaurant details before visiting.
            </p>
          </div>
        )}

        {/* Limited coverage note */}
        {data?.limitedCoverageNote && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <InfoIcon />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                Limited coverage
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {data.limitedCoverageNote}
              </p>
            </div>
          </div>
        )}

        {/* Restaurant cards */}
        {data && data.restaurants.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {data.restaurants.map((restaurant, idx) => {
              const isBlurred = !isReserve && idx >= 2;
              return (
                <div
                  key={restaurant.slug}
                  style={{ position: 'relative' }}
                >
                  <div style={isBlurred ? { pointerEvents: 'none', userSelect: 'none' } : undefined}>
                    <RestaurantCard
                      restaurant={restaurant}
                      citySlug={citySlug}
                    />
                  </div>
                  {isBlurred && (
                    <div
                      onClick={() => setPaywallOpen(true)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backdropFilter: 'blur(6px)',
                        backgroundColor: 'rgba(15,15,15,0.7)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        cursor: 'pointer',
                      }}
                    >
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          color: 'var(--color-text-secondary)',
                          margin: 0,
                          textAlign: 'center',
                          padding: '0 var(--space-6)',
                          lineHeight: 1.55,
                        }}
                      >
                        Reserve unlocks deeper discovery
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
          </div>
        )}

        {data && data.restaurants.length === 0 && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              marginTop: 'var(--space-8)',
            }}
          >
            No matching restaurants found for this city.
          </p>
        )}
      </div>

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </PageShell>
  );
};

export default CityPage;
