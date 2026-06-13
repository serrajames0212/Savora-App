import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { Badge } from '../components/ui/Badge';
import DishCard from '../components/discovery/DishCard';
import { useCityData } from '../hooks/useDiscovery';

function slugToCity(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 15.5s-7-4.5-7-9a4 4 0 0 1 7-2.65A4 4 0 0 1 16 6.5c0 4.5-7 9-7 9z"
      stroke="var(--color-accent-primary)"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={filled ? 'var(--color-accent-primary)' : 'none'}
    />
  </svg>
);

const RestaurantPage: React.FC = () => {
  const { city: citySlug = '', restaurantSlug = '' } = useParams<{
    city: string;
    restaurantSlug: string;
  }>();
  const navigate = useNavigate();
  const cityName = slugToCity(citySlug);

  const { data, isLoading } = useCityData(cityName);
  const [favorited, setFavorited] = React.useState(false);

  const restaurant = data?.restaurants.find((r) => r.slug === restaurantSlug);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--color-accent-primary)',
            letterSpacing: '0.1em',
          }}
        >
          paliato
        </motion.div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <PageShell>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
          }}
        >
          Restaurant not found.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: 'var(--space-6) var(--space-5) var(--space-10)',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(`/discovery/${citySlug}`)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            padding: '0 0 var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          ← {cityName}
        </button>

        {/* Header */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
          {/* Match score */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'flex',
              alignItems: 'baseline',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '2rem',
                color: 'var(--color-accent-primary)',
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {restaurant.matchScore}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              % match
            </span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--space-3)',
              paddingRight: '80px',
              lineHeight: 1.1,
            }}
          >
            {restaurant.name}
          </h1>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            <Badge variant="accent">{cityName}</Badge>
            <Badge variant="default">{restaurant.cuisine}</Badge>
          </div>

          {/* Atmosphere chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {restaurant.atmosphere.map((atm) => (
              <Badge key={atm} variant="muted">{atm}</Badge>
            ))}
          </div>
        </div>

        {/* Why this fits your identity */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderLeft: '3px solid var(--color-accent-primary)',
            backgroundColor: 'var(--color-bg-surface)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            marginBottom: 'var(--space-8)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Why this fits your identity
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.65,
              fontStyle: 'italic',
            }}
          >
            {restaurant.whyThisFits}
          </p>
        </div>

        {/* Suggested dishes */}
        {restaurant.suggestedDishes.length > 0 && (
          <section style={{ marginBottom: 'var(--space-8)' }}>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Suggested Dishes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {restaurant.suggestedDishes.map((dish) => (
                <DishCard
                  key={dish.slug}
                  dish={dish}
                  citySlug={citySlug}
                  restaurantSlug={restaurantSlug}
                  size="full"
                />
              ))}
            </div>
          </section>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <button
            onClick={() => navigate(`/generate?cuisine=${encodeURIComponent(restaurant.cuisine)}`)}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-bg-base)',
              fontFamily: 'var(--font-label)',
              fontSize: '13px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Cook something inspired by this
          </button>

          <button
            onClick={() => setFavorited((f) => !f)}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              color: 'var(--color-accent-primary)',
              border: '1px solid var(--color-accent-border)',
              fontFamily: 'var(--font-label)',
              fontSize: '13px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <HeartIcon filled={favorited} />
            {favorited ? 'Saved' : 'Save to Favorites'}
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default RestaurantPage;
