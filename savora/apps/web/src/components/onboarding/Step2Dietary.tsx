import React from 'react';
import { motion } from 'framer-motion';
import { SelectionCard } from '../ui/SelectionCard';
import { Button } from '../ui/Button';

const OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Shellfish-Free',
  'None of these',
];

interface Step2DietaryProps {
  selected: string[];
  onChange: (values: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Dietary: React.FC<Step2DietaryProps> = ({ selected, onChange, onNext, onBack }) => {
  const toggle = (option: string) => {
    if (option === 'None of these') {
      onChange(['None of these']);
      return;
    }
    const withoutNone = selected.filter((s) => s !== 'None of these');
    if (withoutNone.includes(option)) {
      onChange(withoutNone.filter((s) => s !== option));
    } else {
      onChange([...withoutNone, option]);
    }
  };

  const isValid = selected.length > 0;

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
          Any dietary requirements?
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-6)',
          }}
        >
          Select all that apply.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {OPTIONS.map((option) => (
            <SelectionCard
              key={option}
              selected={selected.includes(option)}
              onClick={() => toggle(option)}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                }}
              >
                {option}
              </span>
            </SelectionCard>
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

export default Step2Dietary;
