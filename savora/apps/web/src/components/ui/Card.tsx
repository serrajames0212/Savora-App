import React from 'react';

type CardVariant = 'surface' | 'elevated' | 'overlay';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, React.CSSProperties> = {
  surface: {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
  },
  elevated: {
    backgroundColor: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-border-subtle)',
    boxShadow: 'var(--shadow-card)',
  },
  overlay: {
    backgroundColor: 'var(--color-bg-overlay)',
    border: '1px solid var(--color-border-medium)',
    boxShadow: 'var(--shadow-elevated)',
  },
};

export const Card: React.FC<CardProps> = ({
  variant = 'surface',
  className = '',
  style,
  children,
  onClick,
}) => {
  return (
    <div
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        cursor: onClick ? 'pointer' : undefined,
        transition: `box-shadow var(--duration-normal) var(--ease-in-out-smooth)`,
        ...style,
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
