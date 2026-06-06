import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface ErrorCardProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = 'Something went wrong',
  description = 'We ran into an issue loading this content. Please try again.',
  onRetry,
}) => {
  return (
    <Card variant="surface">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 'var(--space-4)',
          padding: 'var(--space-4) 0',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--space-2)',
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {description}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorCard;
