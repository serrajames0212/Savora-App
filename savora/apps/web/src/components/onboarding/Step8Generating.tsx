import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import type { CulinaryIdentityGenome, FlavorGenome } from '@savora/shared-types';
import type { OnboardingData } from '../../hooks/useGenerateGenome';
import GenomeReveal from './GenomeReveal';

const PROGRESS_MESSAGES = [
  'Analysing your flavor identity...',
  'Mapping your culinary character...',
  'Calibrating your taste signature...',
  'Almost there...',
];

interface Step8GeneratingProps {
  onboardingData: OnboardingData;
  onComplete: (culinaryIdentity: CulinaryIdentityGenome, flavorGenome: FlavorGenome) => void;
  onRetry: () => void;
  generateGenome: (data: OnboardingData) => Promise<{ culinaryIdentity: CulinaryIdentityGenome; flavorGenome: FlavorGenome }>;
}

const Step8Generating: React.FC<Step8GeneratingProps> = ({
  onboardingData,
  onComplete,
  onRetry,
  generateGenome,
}) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    culinaryIdentity: CulinaryIdentityGenome;
    flavorGenome: FlavorGenome;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % PROGRESS_MESSAGES.length);
    }, 2200);

    generateGenome(onboardingData)
      .then((data) => {
        if (!cancelled) {
          clearInterval(interval);
          setResult(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          clearInterval(interval);
          setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        }
      });

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (result) {
    return (
      <GenomeReveal
        culinaryIdentity={result.culinaryIdentity}
        flavorGenome={result.flavorGenome}
        onComplete={() => onComplete(result.culinaryIdentity, result.flavorGenome)}
      />
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-error, #e53e3e)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-8)',
            maxWidth: '320px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Something went wrong
          </p>
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              marginBottom: 'var(--space-6)',
              lineHeight: 1.6,
            }}
          >
            We couldn't generate your genome. Please try again.
          </p>
          <Button variant="outline" size="md" onClick={onRetry} style={{ width: '100%' }}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        background: 'radial-gradient(ellipse at center, #1a1208 0%, #0f0f0f 70%)',
        textAlign: 'center',
      }}
    >
      {/* Pulsing emblem */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: 'var(--space-10)' }}
      >
        <img
          src="/assets/brand/favicon.svg"
          alt="Savora"
          style={{ width: '72px', height: '72px' }}
        />
      </motion.div>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '26px',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Crafting your genome...
      </h2>

      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '14px',
          maxWidth: '260px',
          lineHeight: 1.6,
          marginBottom: 'var(--space-10)',
        }}
      >
        This happens once. Everything that follows is uniquely yours.
      </p>

      <AnimatePresence mode="wait">
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '13px',
            color: 'var(--color-accent-primary)',
            letterSpacing: '0.04em',
          }}
        >
          {PROGRESS_MESSAGES[msgIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default Step8Generating;
