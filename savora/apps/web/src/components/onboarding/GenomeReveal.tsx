import React from 'react';
import { motion } from 'framer-motion';
import type { CulinaryIdentityGenome, FlavorGenome } from '@paliato/shared-types';
import { Button } from '../ui/Button';
import { FlavorWheel } from '../genome/FlavorWheel';

interface GenomeRevealProps {
  culinaryIdentity: CulinaryIdentityGenome;
  flavorGenome: FlavorGenome;
  onComplete: () => void;
}

const GenomeReveal: React.FC<GenomeRevealProps> = ({ culinaryIdentity, flavorGenome, onComplete }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        background: 'radial-gradient(ellipse at center, #1a1208 0%, #0f0f0f 70%)',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Your genome is ready.
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Uniquely yours. Evolving forever.
        </p>
      </motion.div>

      {/* Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          width: '100%',
          maxWidth: '440px',
          marginBottom: 'var(--space-8)',
        }}
      >
        {/* Culinary Identity Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer border */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-lg)',
              padding: '1px',
              background: 'linear-gradient(90deg, var(--color-accent-border), var(--color-accent-primary), var(--color-accent-border))',
              backgroundSize: '200% 200%',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              pointerEvents: 'none',
            }}
          />

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            {culinaryIdentity.identityTitle}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
              lineHeight: 1.5,
            }}
          >
            {culinaryIdentity.identitySubtitle}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-2)',
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-accent-primary)',
                flexShrink: 0,
                marginTop: '5px',
              }}
            />
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              {culinaryIdentity.evolutionNote}
            </p>
          </div>
        </motion.div>

        {/* Flavor Genome Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-accent-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <FlavorWheel scores={flavorGenome} size="sm" />

          <div style={{ width: '100%', marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              {flavorGenome.dominantFlavors.map((f) => (
                <span
                  key={f}
                  style={{
                    backgroundColor: 'var(--color-accent-glow)',
                    border: '1px solid var(--color-accent-border)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: 'var(--color-accent-primary)',
                    fontFamily: 'var(--font-label)',
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
              {flavorGenome.flavorPersonality}
            </p>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          style={{ width: '100%' }}
        >
          Begin your taste journey
        </Button>
      </motion.div>
    </div>
  );
};

export default GenomeReveal;
