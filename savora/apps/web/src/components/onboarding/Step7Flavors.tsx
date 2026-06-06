import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';

interface FlavorScores {
  saltScore: number;
  sweetScore: number;
  bitterScore: number;
  acidityScore: number;
  heatScore: number;
  aromaticSpiceScore: number;
  umamiScore: number;
  fatRichnessScore: number;
  smokeCharScore: number;
  fermentationScore: number;
  mineralCleanScore: number;
  aromaticIntensityScore: number;
}

const FLAVOR_AXES: { key: keyof FlavorScores; label: string }[] = [
  { key: 'saltScore', label: 'Salt' },
  { key: 'sweetScore', label: 'Sweet' },
  { key: 'bitterScore', label: 'Bitter' },
  { key: 'acidityScore', label: 'Acidity' },
  { key: 'heatScore', label: 'Heat' },
  { key: 'aromaticSpiceScore', label: 'Aromatic Spice' },
  { key: 'umamiScore', label: 'Umami' },
  { key: 'fatRichnessScore', label: 'Fat & Richness' },
  { key: 'smokeCharScore', label: 'Smoke & Char' },
  { key: 'fermentationScore', label: 'Fermentation' },
  { key: 'mineralCleanScore', label: 'Mineral & Clean' },
  { key: 'aromaticIntensityScore', label: 'Aromatic Intensity' },
];

interface Step7FlavorsProps {
  scores: FlavorScores;
  onChange: (scores: FlavorScores) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step7Flavors: React.FC<Step7FlavorsProps> = ({ scores, onChange, onNext, onBack }) => {
  const update = (key: keyof FlavorScores, value: number) => {
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
          Define your flavor identity.
        </h2>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
            marginBottom: 'var(--space-8)',
          }}
        >
          Adjust each axis to reflect your true preferences.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-10)',
          }}
        >
          {FLAVOR_AXES.map((axis) => (
            <div key={axis.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {axis.label.toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    color: 'var(--color-accent-primary)',
                  }}
                >
                  {scores[axis.key]}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={scores[axis.key]}
                onChange={(v) => update(axis.key, v)}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="ghost" size="md" onClick={onBack} style={{ flex: 1 }}>
            Back
          </Button>
          <Button variant="primary" size="md" onClick={onNext} style={{ flex: 2 }}>
            Generate my genome
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Step7Flavors;
