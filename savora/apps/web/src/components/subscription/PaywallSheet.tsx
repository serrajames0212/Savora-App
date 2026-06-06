import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import api from '../../lib/api';

interface PaywallSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    style={{ flexShrink: 0, marginTop: '2px' }}
  >
    <path
      d="M2.5 7L5.5 10L11.5 4"
      stroke="var(--color-accent-primary)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BENEFITS = [
  'Unlimited recipe generations',
  'Advanced taste evolution tracking',
  'Full Memory Vault history',
  'Deep genome insights & "why this fits"',
  'Unlimited city discovery searches',
  'Unlimited favorites',
  'Seasonal & weekly taste intelligence',
  'Priority AI response speed',
];

const PaywallSheet: React.FC<PaywallSheetProps> = ({ isOpen, onClose }) => {
  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    try {
      const { data } = await api.post<{ url: string }>('/subscription/checkout', { plan });
      if (data.url && data.url !== '#') {
        window.location.href = data.url;
      }
    } catch {
      // stub — no-op
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        style={{
          backgroundColor: 'var(--color-bg-overlay)',
          borderRadius: 'var(--radius-md)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '20px',
            lineHeight: 1,
            padding: 'var(--space-2)',
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Brand title */}
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            color: 'var(--color-accent-primary)',
            letterSpacing: '0.12em',
            textTransform: 'lowercase',
            marginBottom: 'var(--space-4)',
          }}
        >
          savora reserve
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-3)',
            lineHeight: 1.25,
          }}
        >
          Unlock your full culinary intelligence.
        </h2>

        {/* Subline */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.65,
            marginBottom: 'var(--space-6)',
          }}
        >
          Savora Reserve gives you endless adaptive recipes, advanced taste evolution, and premium
          culinary discovery tailored entirely to you.
        </p>

        {/* Benefits list */}
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
          }}
        >
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
              }}
            >
              <CheckIcon />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.5,
                }}
              >
                {benefit}
              </span>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          {/* Annual — most popular */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-accent-primary)',
                color: 'var(--color-bg-base)',
                fontFamily: 'var(--font-label)',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '2px 10px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                zIndex: 1,
              }}
            >
              Most popular
            </div>
            <Button
              variant="primary"
              style={{ width: '100%' }}
              onClick={() => handleCheckout('annual')}
            >
              €89 / year — Save 26%
            </Button>
          </div>

          {/* Monthly */}
          <Button
            variant="outline"
            style={{ width: '100%' }}
            onClick={() => handleCheckout('monthly')}
          >
            €9.99 / month
          </Button>
        </div>

        {/* Fine print */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Cancel anytime. No commitment.
        </p>
      </div>
    </Modal>
  );
};

export default PaywallSheet;
