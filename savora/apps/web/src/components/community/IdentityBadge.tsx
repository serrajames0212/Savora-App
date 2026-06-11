import React from 'react';

interface Props {
  identity: string;
  size?: 'sm' | 'md';
}

export const IdentityBadge: React.FC<Props> = ({ identity, size = 'md' }) => {
  const isSm = size === 'sm';
  return (
    <span
      style={{
        display: 'inline-block',
        border: '1px solid var(--color-accent-border)',
        backgroundColor: 'var(--color-bg-elevated)',
        color: 'var(--color-text-accent)',
        fontFamily: 'var(--font-label)',
        fontSize: isSm ? '11px' : '12px',
        borderRadius: '999px',
        padding: isSm ? '2px 8px' : '3px 12px',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {identity}
    </span>
  );
};

export default IdentityBadge;
