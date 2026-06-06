import React from 'react';
import { motion } from 'framer-motion';
import { SelectionCard } from '../ui/SelectionCard';
import { Button } from '../ui/Button';

interface DiningContext {
  social: 'social' | 'solitary' | '';
  ritual: 'ritual' | 'spontaneous' | '';
  formality: 'casual' | 'fineDining' | '';
  pace: 'slow' | 'quick' | '';
}

const GROUPS: {
  label: string;
  key: keyof DiningContext;
  options: { value: string; label: string; description: string }[];
}[] = [
  {
    label: 'Dining with others',
    key: 'social',
    options: [
      { value: 'social', label: 'Social', description: 'I love sharing meals' },
      { value: 'solitary', label: 'Solitary', description: 'I prefer dining alone' },
    ],
  },
  {
    label: 'Meal mindset',
    key: 'ritual',
    options: [
      { value: 'ritual', label: 'Ritual', description: 'Meals are ceremonial' },
      { value: 'spontaneous', label: 'Spontaneous', description: 'I eat when the mood strikes' },
    ],
  },
  {
    label: 'Atmosphere',
    key: 'formality',
    options: [
      { value: 'casual', label: 'Casual', description: 'Comfort over formality' },
      { value: 'fineDining', label: 'Fine Dining', description: 'I appreciate the full experience' },
    ],
  },
  {
    label: 'Pace',
    key: 'pace',
    options: [
      { value: 'slow', label: 'Slow', description: 'I savour every course' },
      { value: 'quick', label: 'Quick', description: 'Efficiency matters to me' },
    ],
  },
];

interface Step6ContextProps {
  context: DiningContext;
  onChange: (context: DiningContext) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step6Context: React.FC<Step6ContextProps> = ({ context, onChange, onNext, onBack }) => {
  const select = (key: keyof DiningContext, value: string) => {
    onChange({ ...context, [key]: value });
  };

  const isValid = GROUPS.every((g) => context[g.key] !== '');

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '480px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          How do you dine?
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-8)',
          }}
        >
          Pick one from each pair.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', marginBottom: 'var(--space-10)' }}>
          {GROUPS.map((group) => (
            <div key={group.key}>
              <p
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.08em',
                  marginBottom: 'var(--space-3)',
                }}
              >
                {group.label.toUpperCase()}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                {group.options.map((opt) => (
                  <SelectionCard
                    key={opt.value}
                    selected={context[group.key] === opt.value}
                    onClick={() => select(group.key, opt.value)}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: 'var(--color-text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        {opt.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.4,
                        }}
                      >
                        {opt.description}
                      </div>
                    </div>
                  </SelectionCard>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="md" onClick={onBack} style={{ flex: 1 }}>
            Back
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            disabled={!isValid}
            style={{ flex: 2 }}
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step6Context;
