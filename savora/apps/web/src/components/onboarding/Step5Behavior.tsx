import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';

interface BehaviorScores {
  adventurousness: number;
  comfortVsNovelty: number;
  luxuryVsRustic: number;
  complexityTolerance: number;
  cookingSkill: number;
}

const SLIDERS: {
  key: keyof BehaviorScores;
  label: string;
  leftLabel: string;
  rightLabel: string;
}[] = [
  { key: 'adventurousness', label: 'Adventurousness', leftLabel: 'Familiar', rightLabel: 'Adventurous' },
  { key: 'comfortVsNovelty', label: 'Comfort vs Novelty', leftLabel: 'Comfort', rightLabel: 'Novelty' },
  { key: 'luxuryVsRustic', label: 'Luxury vs Rustic', leftLabel: 'Rustic', rightLabel: 'Luxury' },
  { key: 'complexityTolerance', label: 'Complexity', leftLabel: 'Simple', rightLabel: 'Complex' },
  { key: 'cookingSkill', label: 'Cooking skill', leftLabel: 'Beginner', rightLabel: 'Expert' },
];

interface Step5BehaviorProps {
  scores: BehaviorScores;
  onChange: (scores: BehaviorScores) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step5Behavior: React.FC<Step5BehaviorProps> = ({ scores, onChange, onNext, onBack }) => {
  const update = (key: keyof BehaviorScores, value: number) => {
    onChange({ ...scores, [key]: value });
  };

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
          How do you experience food?
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-8)',
          }}
        >
          Drag each slider to reflect your preferences.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-10)' }}>
          {SLIDERS.map((slider) => (
            <div key={slider.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {slider.label.toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    color: 'var(--color-accent-primary)',
                  }}
                >
                  {scores[slider.key]}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={scores[slider.key]}
                onChange={(v) => update(slider.key, v)}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 'var(--space-1)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                  {slider.leftLabel}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>
                  {slider.rightLabel}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="md" onClick={onBack} style={{ flex: 1 }}>
            Back
          </Button>
          <Button variant="primary" size="md" onClick={onNext} style={{ flex: 2 }}>
            Continue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step5Behavior;
