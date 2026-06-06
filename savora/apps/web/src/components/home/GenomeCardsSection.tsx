import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGenomeStore } from '../../stores/useGenomeStore';
import { FlavorWheel } from '../genome/FlavorWheel';
import { Badge } from '../ui/Badge';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const GenomeCardsSection: React.FC = () => {
  const navigate = useNavigate();
  const { culinaryIdentity, flavorGenome } = useGenomeStore();

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
              <FlavorWheel scores={flavorGenome} size={180} />
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
      </div>

      <style>{`
        @media (min-width: 768px) {
          .genome-cards-row {
            flex-direction: row !important;
          }
        }
      `}</style>
    </section>
  );
};

export default GenomeCardsSection;
