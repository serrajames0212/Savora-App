import React from 'react';
import { motion } from 'framer-motion';
import { SelectionCard } from '../ui/SelectionCard';
import { Button } from '../ui/Button';

const CUISINES = [
  'Japanese', 'Italian', 'French', 'Mexican', 'Thai', 'Indian',
  'Chinese', 'Mediterranean', 'Korean', 'Spanish', 'Middle Eastern',
  'Peruvian', 'Ethiopian', 'Vietnamese', 'American', 'Greek',
];

const MAX_SELECTIONS = 8;

interface Step4CuisinesProps {
  selected: string[];
  onChange: (values: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step4Cuisines: React.FC<Step4CuisinesProps> = ({ selected, onChange, onNext, onBack }) => {
  const toggle = (cuisine: string) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter((c) => c !== cuisine));
    } else if (selected.length < MAX_SELECTIONS) {
      onChange([...selected, cuisine]);
    }
  };

  const isValid = selected.length >= 3;

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
          Which cuisines speak to you?
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-6)',
          }}
        >
          Select up to 8. The order you tap sets your ranking.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {CUISINES.map((cuisine) => {
            const rank = selected.indexOf(cuisine) + 1;
            const isSelected = rank > 0;
            const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;
            return (
              <SelectionCard
                key={cuisine}
                selected={isSelected}
                onClick={() => toggle(cuisine)}
                disabled={isDisabled}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {cuisine}
                  </span>
                  {isSelected && (
                    <span
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-accent-primary)',
                        color: 'var(--color-bg-base)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-label)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {rank}
                    </span>
                  )}
                </div>
              </SelectionCard>
            );
          })}
        </div>

        <p
          style={{
            fontSize: '12px',
            color: isValid ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            fontFamily: 'var(--font-label)',
            textAlign: 'center',
            marginBottom: 'var(--space-4)',
          }}
        >
          {selected.length} / {MAX_SELECTIONS} selected {!isValid && '— pick at least 3'}
        </p>

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

export default Step4Cuisines;
