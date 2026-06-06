import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div
      className={className}
      style={{
        width: '100%',
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
          transition: `width var(--duration-slow) var(--ease-out-expo)`,
          boxShadow: 'var(--shadow-glow-accent)',
        }}
      />
    </div>
  );
};

export default ProgressBar;
