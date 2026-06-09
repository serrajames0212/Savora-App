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
          <div style={cardBase} onClick={() => navigate('/genome/identity')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.5rem',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)',
                    lineHeight: 1.2,
                  }}
                >
                  {culinaryIdentity.identityTitle}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-4)',
                    lineHeight: 1.5,
                  }}
                >
                  {culinaryIdentity.identitySubtitle}
                </div>
                {culinaryIdentity.evolutionNote && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent-primary)',
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      {culinaryIdentity.evolutionNote}
                    </div>
                  </div>
                )}
                <div
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    color: 'var(--color-accent-primary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  View full identity →
                </div>
              </div>
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
          <div style={cardBase} onClick={() => navigate('/genome/flavor')}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FlavorWheel scores={flavorGenome} size="sm" />
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                  justifyContent: 'center',
                  marginTop: 'var(--space-4)',
                }}
              >
                {(flavorGenome.dominantFlavors ?? []).slice(0, 4).map((flavor) => (
                  <Badge key={flavor} variant="accent">
                    {flavor}
                  </Badge>
                ))}
              </div>
              {flavorGenome.flavorPersonality && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    textAlign: 'center',
                    marginTop: 'var(--space-3)',
                    fontStyle: 'italic',
                  }}
                >
                  {flavorGenome.flavorPersonality}
                </div>
              )}
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
