import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../stores/useUserStore';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { useGenomeStore } from '../stores/useGenomeStore';
import { useSubscriptionStatus } from '../hooks/useSubscription';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import PaywallSheet from '../components/subscription/PaywallSheet';
import { useToastStore } from '../stores/useToastStore';
import api from '../lib/api';

interface ProfileStats {
  recipes: number;
  cities: number;
  cuisines: number;
  daysActive: number;
}

interface QuickLinkRowProps {
  label: string;
  to?: string;
  onTap?: () => void;
}

const QuickLinkRow: React.FC<QuickLinkRowProps> = ({ label, to, onTap }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onTap) {
      onTap();
    } else if (to) {
      navigate(to);
    }
  };
  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '48px',
        padding: '0 var(--space-2)',
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
  const culinaryIdentity = useGenomeStore((s) => s.culinaryIdentity);
  const flavorGenome = useGenomeStore((s) => s.flavorGenome);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  // Sync subscription status from server
  useSubscriptionStatus();

  const { data: stats } = useQuery<ProfileStats>({
    queryKey: ['profile', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<ProfileStats>('/profile/stats');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const memberSince = user
    ? new Date((user as { createdAt?: string }).createdAt ?? Date.now()).toLocaleDateString(
        undefined,
        { year: 'numeric', month: 'long' }
      )
    : null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dominantFlavors = flavorGenome?.dominantFlavors?.slice(0, 3) ?? [];

  const statItems = [
    { label: 'Recipes Generated', value: stats?.recipes ?? 0 },
    { label: 'Cities Explored', value: stats?.cities ?? 0 },
    { label: 'Cuisines Discovered', value: stats?.cuisines ?? 0 },
    { label: 'Days Active', value: stats?.daysActive ?? 0 },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-5) var(--space-12)',
      }}
    >
      {/* Section 1 — User identity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: '48px',
            height: '48px',
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
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-bg-base)',
              letterSpacing: '0.04em',
            }}
          >
            {initials}
          </span>
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              color: 'var(--color-text-primary)',
              lineHeight: 1.2,
            }}
          >
            {user?.name ?? 'Guest'}
          </div>
          {memberSince && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              Member since {memberSince}
            </div>
          )}
        </div>

        {/* Subscription badge */}
        {subscriptionStatus === 'reserve' ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              backgroundColor: 'var(--color-accent-primary)',
              borderRadius: '999px',
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              color: 'var(--color-bg-base)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            ★ Reserve
          </div>
        ) : (
          <div
            style={{
              padding: '4px 10px',
              border: '1px solid var(--color-border-medium)',
              borderRadius: '999px',
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Free
          </div>
        )}
      </div>

      {/* Section 2 — Genome summary */}
      {(culinaryIdentity || flavorGenome) && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {culinaryIdentity && (
            <Card variant="elevated" onClick={() => navigate('/genome/identity')}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  color: 'var(--color-accent-primary)',
                  marginBottom: 'var(--space-1)',
                  lineHeight: 1.2,
                }}
              >
                {culinaryIdentity.identityTitle}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {culinaryIdentity.identitySubtitle}
              </div>
            </Card>
          )}

          {flavorGenome && (
            <Card variant="elevated" onClick={() => navigate('/genome/flavor')}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {dominantFlavors.map((f) => (
                  <Badge key={f} variant="accent">{f}</Badge>
                ))}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}
              >
                {flavorGenome.flavorPersonality}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Section 3 — Taste stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {statItems.map((stat) => (
          <Card key={stat.label} variant="elevated">
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '1.8rem',
                color: 'var(--color-accent-primary)',
                lineHeight: 1,
                marginBottom: 'var(--space-1)',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}
            >
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Section 4 — Quick links */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Quick Links
        </div>
        <Card variant="surface">
          <div style={{ padding: '0 var(--space-2)' }}>
            <QuickLinkRow label="Memory Vault" to="/profile/memory" />
            <QuickLinkRow label="Genome Detail" to="/genome/identity" />
            <QuickLinkRow label="Subscription" to="/profile/subscription" />
            <QuickLinkRow label="Dietary Profile" to="/profile/dietary" />
            <QuickLinkRow
              label="Notifications"
              onTap={() => addToast('Coming soon', 'info')}
            />
            <div
              onClick={() => addToast('Help center coming soon', 'info')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px',
                padding: '0 var(--space-2)',
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
                Help
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>→</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 5 — Settings */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Settings
        </div>
        <Card variant="surface">
          <div style={{ padding: '0 var(--space-2)' }}>
            <QuickLinkRow label="Edit Dietary Profile" to="/profile/dietary" />
            <QuickLinkRow
              label="Change Email"
              onTap={() => addToast('Feature coming soon', 'info')}
            />
            <QuickLinkRow
              label="Change Password"
              onTap={() => addToast('Feature coming soon', 'info')}
            />
            <div
              onClick={() => addToast('Account deletion — contact support', 'info')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px',
                padding: '0 var(--space-2)',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  color: 'rgba(200,60,60,0.85)',
                }}
              >
                Delete Account
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>→</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Section 6 — Sign out */}
      <Button
        variant="ghost"
        style={{ width: '100%', color: 'var(--color-text-muted)' }}
        onClick={handleLogout}
      >
        Sign out
      </Button>

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </div>
  );
};

export default ProfilePage;
