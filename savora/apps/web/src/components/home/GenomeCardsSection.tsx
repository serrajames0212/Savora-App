import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGenomeStore } from '../../stores/useGenomeStore';
import { FlavorWheel } from '../genome/FlavorWheel';
import { Badge } from '../ui/Badge';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { useIsReserve } from '../../hooks/useIsReserve';
import PaywallSheet from '../subscription/PaywallSheet';

const LockIcon: React.FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--color-accent-primary)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EvolutionTeaserCard: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    onClick={onOpen}
    style={{
      position: 'relative',
      backgroundColor: 'var(--color-bg-elevated)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      cursor: 'pointer',
      overflow: 'hidden',
    }}
  >
    {/* Blurred fake bar graphs */}
    <div
      aria-hidden
      style={{
        filter: 'blur(4px)',
        opacity: 0.5,
        marginBottom: 'var(--space-4)',
        pointerEvents: 'none',
      }}
    >
      {[80, 55, 70, 45, 65].map((w, i) => (
        <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
          <div
            style={{
              height: '6px',
              width: `${w}%`,
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: '3px',
              opacity: 0.7,
            }}
          />
        </div>
      ))}
    </div>

    {/* Lock overlay */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        backgroundColor: 'rgba(15,15,15,0.6)',
      }}
    >
      <LockIcon />
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.55,
          maxWidth: '240px',
        }}
      >
        Your taste has been evolving. Reserve shows you how.
      </p>
    </div>
  </motion.div>
);

const GenomeCardsSection: React.FC = () => {
  const navigate = useNavigate();
  const { culinaryIdentity, flavorGenome } = useGenomeStore();
  const isReserve = useIsReserve();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const cardBase: React.CSSProperties = {
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--space-6)',
    boxShadow: 'var(--shadow-card)',
    cursor: 'pointer',
    flex: 1,
    minWidth: 0,
  };

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
          fontVariant: 'small-caps',
        }}
      >
        Your Culinary Genome
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
        className="genome-cards-row"
      >
        {/* Culinary Identity Card */}
        {culinaryIdentity ? (
          <div
            style={{ ...cardBase, border: '1px solid rgba(201,169,110,0.25)' }}
            onClick={() => navigate('/genome/identity')}
          >
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.55)',
                marginBottom: 'var(--space-2)',
              }}
            >
              Taste Identity
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
                lineHeight: 1.2,
              }}
            >
              {culinaryIdentity.identityTitle}
            </div>
            {/* Keyword chips from cuisine affinity */}
            {culinaryIdentity.cuisineAffinity && culinaryIdentity.cuisineAffinity.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-1)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {culinaryIdentity.cuisineAffinity.slice(0, 3).map((kw: string) => (
                  <span
                    key={kw}
                    style={{
                      fontFamily: 'var(--font-label)',
                      fontSize: '9px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-accent-primary)',
                      border: '1px solid rgba(201,169,110,0.3)',
                      borderRadius: '999px',
                      padding: '2px 8px',
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-4)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties}
            >
              {culinaryIdentity.identitySubtitle}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                color: 'var(--color-accent-primary)',
                letterSpacing: '0.04em',
              }}
            >
              View full identity →
            </div>
          </div>
        ) : (
          <div style={cardBase}>
            <SkeletonLoader height="24px" width="60%" />
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SkeletonLoader height="16px" width="80%" />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <SkeletonLoader height="16px" width="70%" />
            </div>
          </div>
        )}

        {/* Flavor Genome Card */}
        {flavorGenome ? (
          <div
            style={{ ...cardBase, border: '1px solid rgba(201,169,110,0.2)' }}
            onClick={() => navigate('/genome/flavor')}
          >
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(201,169,110,0.55)',
                marginBottom: 'var(--space-3)',
              }}
            >
              Flavor Genome
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
              <FlavorWheel scores={flavorGenome} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                {(flavorGenome.dominantFlavors ?? []).slice(0, 3).map((flavor, i) => (
                  <div
                    key={flavor}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <span
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor:
                          i === 0 ? 'rgba(201,169,110,1)' : 'rgba(201,169,110,0.5)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        color: i === 0 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {flavor}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '11px',
                    color: 'var(--color-accent-primary)',
                    letterSpacing: '0.04em',
                    marginTop: 'var(--space-3)',
                  }}
                >
                  View full genome →
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...cardBase, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-8)' }}>
            <SkeletonLoader height="180px" width="180px" borderRadius="50%" />
            <div style={{ marginTop: 'var(--space-4)', width: '100%' }}>
              <SkeletonLoader height="16px" width="60%" />
            </div>
          </div>
        )}

        {/* Evolution teaser for free users */}
        {!isReserve && (
          <EvolutionTeaserCard onOpen={() => setPaywallOpen(true)} />
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .genome-cards-row {
            flex-direction: row !important;
          }
        }
      `}</style>

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </section>
  );
};

export default GenomeCardsSection;
