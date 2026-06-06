import React from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 10,
  step = 1,
  value,
  onChange,
  label,
  showValue = false,
  className = '',
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className} style={{ width: '100%' }}>
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-2)',
          }}
        >
          {label && (
            <span
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
              }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '12px',
                color: 'var(--color-accent-primary)',
              }}
            >
              {value}
            </span>
          )}
        </div>
      )}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: '2px',
              transition: `width var(--duration-fast) var(--ease-in-out-smooth)`,
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            height: '20px',
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${percentage}% - 10px)`,
            width: '20px',
            height: '20px',
            backgroundColor: 'var(--color-accent-primary)',
            borderRadius: '50%',
            boxShadow: 'var(--shadow-glow-accent)',
            pointerEvents: 'none',
            transition: `left var(--duration-fast) var(--ease-in-out-smooth)`,
          }}
        />
      </div>
    </div>
  );
};

export default Slider;
