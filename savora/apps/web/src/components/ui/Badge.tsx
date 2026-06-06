import React from 'react';

type BadgeVariant = 'default' | 'accent' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-subtle)',
  },
  accent: {
    backgroundColor: 'var(--color-accent-glow)',
    color: 'var(--color-accent-primary)',
    border: '1px solid var(--color-accent-border)',
  },
  muted: {
    backgroundColor: 'var(--color-bg-surface)',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border-subtle)',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  return (
    <span
      style={{
        ...variantStyles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '2px var(--space-3)',
        borderRadius: '999px',
        fontFamily: 'var(--font-label)',
        fontSize: '11px',
        fontWeight: 400,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
      className={className}
    >
      {children}
    </span>
  );
};

export default Badge;
