import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubscriptionStatus, useCheckout } from '../hooks/useSubscription';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const CheckIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ flexShrink: 0, marginTop: '2px' }}
  >
    <path
      d="M3 8L6.5 11.5L13 5"
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

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: subscription, isLoading } = useSubscriptionStatus();
  const checkoutMutation = useCheckout();
  const [banner, setBanner] = useState<'success' | 'canceled' | null>(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setBanner('success');
    } else if (searchParams.get('canceled') === 'true') {
      setBanner('canceled');
    }
  }, [searchParams]);

  const formatRenewalDate = (date?: string) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: 'var(--space-6)',
        maxWidth: '390px',
        margin: '0 auto',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/profile')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          cursor: 'pointer',
          padding: '0 0 var(--space-6) 0',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
        }}
      >
        ← Profile
      </button>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          color: 'var(--color-accent-primary)',
          margin: '0 0 var(--space-6)',
          letterSpacing: '0.08em',
          textTransform: 'lowercase',
        }}
      >
        savora reserve
      </h1>

      {/* Banners */}
      {banner === 'success' && (
        <div
          style={{
            backgroundColor: 'var(--color-accent-glow)',
            border: '1px solid var(--color-accent-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-accent-primary)',
          }}
        >
          Welcome to Savora Reserve.
        </div>
      )}
      {banner === 'canceled' && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
          }}
        >
          Checkout canceled.
        </div>
      )}

      {isLoading ? (
        <div
          style={{
            height: '200px',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-md)',
            opacity: 0.4,
          }}
        />
      ) : subscription?.status === 'reserve' ? (
        /* Reserve state */
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--color-accent-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            You're on Savora Reserve
          </div>

          {subscription.renewalDate && (
            <Card variant="surface">
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Renews on{' '}
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {formatRenewalDate(subscription.renewalDate)}
                </span>
              </div>
            </Card>
          )}

          <div style={{ marginTop: 'var(--space-6)' }}>
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
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}
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
          </div>

          <button
            onClick={async () => {
              try {
                const { data } = await import('../lib/api').then((m) =>
                  m.default.post<{ url: string }>('/subscription/portal')
                );
                if (data.url && data.url !== '#') {
                  window.location.href = data.url;
                }
              } catch {
                // stub
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              marginBottom: 'var(--space-4)',
            }}
          >
            Manage subscription
          </button>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
            }}
          >
            Your taste is fully unlocked.
          </p>
        </div>
      ) : (
        /* Free state — upgrade UI */
        <div>
          <p
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-6)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Savora Free
          </p>

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
                style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}
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

          {/* Annual CTA */}
          <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
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
              loading={checkoutMutation.isPending}
              onClick={() => checkoutMutation.mutate('annual')}
            >
              €89 / year — Save 26%
            </Button>
          </div>

          {/* Monthly CTA */}
          <Button
            variant="outline"
            style={{ width: '100%', marginBottom: 'var(--space-4)' }}
            loading={checkoutMutation.isPending}
            onClick={() => checkoutMutation.mutate('monthly')}
          >
            €9.99 / month
          </Button>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
              margin: 0,
            }}
          >
            Cancel anytime.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
