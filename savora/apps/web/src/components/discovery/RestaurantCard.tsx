import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import DishCard from './DishCard';
import type { DiscoveryRestaurant } from '../../hooks/useDiscovery';
import api from '../../lib/api';

interface RestaurantCardProps {
  restaurant: DiscoveryRestaurant;
  citySlug: string;
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

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <motion.svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2 }}
  >
    <path
      d="M4 6l4 4 4-4"
      stroke="var(--color-text-muted)"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, citySlug }) => {
  const navigate = useNavigate();
  const [whyOpen, setWhyOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleCardClick = () => {
    navigate(`/discovery/${citySlug}/${restaurant.slug}`);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post('/favorites/toggle', {
        itemType: 'restaurant',
        itemId: `${citySlug}:${restaurant.slug}`,
      });
      setFavorited((f) => !f);
    } catch {
      setFavorited((f) => !f);
    }
  };

  const handleWhyToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWhyOpen((o) => !o);
  };

  return (
    <Card variant="elevated">
      {/* Header row */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
        {/* Match score — top right */}
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
              fontSize: '1.4rem',
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
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            % match
          </span>
        </div>

        {/* Favorite icon — top right below match score */}
        <button
          onClick={handleFavorite}
          style={{
            position: 'absolute',
            top: '28px',
            right: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Save to favorites"
        >
          <HeartIcon filled={favorited} />
        </button>

        {/* Restaurant name */}
        <div
          onClick={handleCardClick}
          style={{ cursor: 'pointer', paddingRight: '60px' }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              color: 'var(--color-text-primary)',
              margin: '0 0 var(--space-2)',
              lineHeight: 1.2,
            }}
          >
            {restaurant.name}
          </h3>
        </div>

        {/* Cuisine + atmosphere chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', paddingRight: '60px' }}>
          <Badge variant="accent">{restaurant.cuisine}</Badge>
          {restaurant.atmosphere.map((atm) => (
            <Badge key={atm} variant="muted">
              {atm}
            </Badge>
          ))}
        </div>
      </div>

      {/* "Why this fits" expandable */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <button
          onClick={handleWhyToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-label)',
            fontSize: '11px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          <span>Why this fits</span>
          <ChevronIcon open={whyOpen} />
        </button>

        <AnimatePresence initial={false}>
          {whyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  margin: 'var(--space-2) 0 0',
                  paddingLeft: 'var(--space-2)',
                  borderLeft: '2px solid var(--color-accent-border)',
                }}
              >
                {restaurant.whyThisFits}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggested dishes */}
      {restaurant.suggestedDishes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-1)',
            }}
          >
            Suggested Dishes
          </div>
          {restaurant.suggestedDishes.map((dish) => (
            <DishCard
              key={dish.slug}
              dish={dish}
              citySlug={citySlug}
              restaurantSlug={restaurant.slug}
              size="mini"
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default RestaurantCard;
