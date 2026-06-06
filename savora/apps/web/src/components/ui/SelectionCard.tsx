import React from 'react';

interface SelectionCardProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  selected = false,
  onClick,
  children,
  className = '',
  disabled = false,
}) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={className}
      style={{
        backgroundColor: selected
          ? 'var(--color-accent-glow)'
          : 'var(--color-bg-surface)',
        border: selected
          ? '1px solid var(--color-accent-border)'
          : '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: selected ? 'var(--shadow-glow-accent)' : 'none',
        transition: `all var(--duration-normal) var(--ease-out-expo)`,
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default SelectionCard;
