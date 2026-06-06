import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { useSubscriptionStatus } from '../hooks/useSubscription';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import PaywallSheet from '../components/subscription/PaywallSheet';

interface NavLinkRowProps {
  label: string;
  to: string;
}

const NavLinkRow: React.FC<NavLinkRowProps> = ({ label, to }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(to)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-4) var(--space-2)',
        borderBottom: '1px solid var(--color-border-subtle)',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: 'var(--color-text-primary)',
        }}
      >
        {label}
      </span>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>→</span>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const subscriptionStatus = useSubscriptionStore((s) => s.status);
  const renewalDate = useSubscriptionStore((s) => s.renewalDate);
  const [paywallOpen, setPaywallOpen] = useState(false);

  // Sync subscription status from server
  useSubscriptionStatus();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatRenewalDate = (date: string | null) => {
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
      {/* User header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-bg-base)',
              letterSpacing: '0.04em',
            }}
          >
            {initials}
          </span>
        </div>
        <div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {user?.name ?? 'Guest'}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--color-text-muted)',
              marginTop: '2px',
            }}
          >
            {user?.email ?? ''}
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <Card variant="elevated" className="">
        <div style={{ padding: '0 var(--space-2)' }}>
          <NavLinkRow label="Culinary Identity" to="/genome/identity" />
          <NavLinkRow label="Flavor Genome" to="/genome/flavor" />
          <NavLinkRow label="Memory Vault" to="/profile/memory" />
          <div
            onClick={() => navigate('/profile/subscription')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-4) var(--space-2)',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--color-text-primary)',
              }}
            >
              Subscription
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>→</span>
          </div>
        </div>
      </Card>

      {/* Subscription status card */}
      <div style={{ marginTop: 'var(--space-6)' }}>
        <Card variant="surface">
          {subscriptionStatus === 'reserve' ? (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.1rem',
                  color: 'var(--color-accent-primary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Savora Reserve
              </div>
              {renewalDate && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Renews {formatRenewalDate(renewalDate)}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Savora Free
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaywallOpen(true)}
              >
                Upgrade to Reserve
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Logout */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <Button
          variant="ghost"
          style={{ width: '100%', color: 'var(--color-text-muted)' }}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
};

export default ProfilePage;
