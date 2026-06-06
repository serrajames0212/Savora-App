import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface Step1WelcomeProps {
  onNext: () => void;
}

const Step1Welcome: React.FC<Step1WelcomeProps> = ({ onNext }) => {
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
      {/* Emblem */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ marginBottom: 'var(--space-10)' }}
      >
        <img
          src="/assets/brand/favicon.svg"
          alt="Savora"
          style={{ width: '80px', height: '80px' }}
        />
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 7vw, 40px)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
          lineHeight: 1.2,
          margin: '0 0 var(--space-4)',
        }}
      >
        Let's define your taste.
      </motion.h1>

      {/* Subline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--color-text-secondary)',
          maxWidth: '280px',
          lineHeight: 1.6,
          marginBottom: 'var(--space-12)',
        }}
      >
        Your Culinary Genome is built once. It evolves forever.
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          style={{ minWidth: '160px' }}
        >
          Begin
        </Button>
      </motion.div>
    </div>
  );
};

export default Step1Welcome;
