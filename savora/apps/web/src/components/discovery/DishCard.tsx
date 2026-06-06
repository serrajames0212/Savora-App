import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { SuggestedDish } from '../../hooks/useDiscovery';

interface DishCardProps {
  dish: SuggestedDish;
  citySlug: string;
  restaurantSlug: string;
  size?: 'mini' | 'full';
}

const DishCard: React.FC<DishCardProps> = ({ dish, citySlug, restaurantSlug, size = 'mini' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/discovery/${citySlug}/${restaurantSlug}/${dish.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: size === 'full' ? 'var(--space-5)' : 'var(--space-4)',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-accent-border)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-subtle)';
      }}
    >
      {/* Dish name */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: size === 'full' ? '1.05rem' : '0.9rem',
          color: 'var(--color-text-primary)',
          fontWeight: 500,
          marginBottom: 'var(--space-2)',
        }}
      >
        {dish.dishName}
      </div>

      {/* Flavor profile tags */}
      {dish.flavorProfile.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
          {dish.flavorProfile.map((fp) => (
            <Badge key={fp} variant="default">
              {fp}
            </Badge>
          ))}
        </div>
      )}

      {/* Why this fits */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          margin: '0 0 var(--space-2)',
          lineHeight: 1.5,
        }}
      >
        {dish.whyThisFits}
      </p>

      {/* Bottom row: dietary compliance + confidence */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <Badge variant="accent">{dish.dietaryCompliance}</Badge>
        <span
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '11px',
            color: 'var(--color-accent-primary)',
          }}
        >
          {Math.round(dish.confidence * 100)}% match
        </span>
      </div>
    </div>
  );
};

export default DishCard;
