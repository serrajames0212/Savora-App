import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJourney } from '../../hooks/useHomeData';
import { Badge } from '../ui/Badge';

interface JourneyCard {
  id: string;
  label: string;
  category: string;
  href: string;
  gradient: string;
}

const JourneySection: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useJourney();

  if (!data) return null;

  const cards: JourneyCard[] = [];

  if (data.recentRecipe) {
    cards.push({
      id: 'recipe',
      label: data.recentRecipe.title,
      category: data.recentRecipe.mood ?? 'recipe',
      href: `/generate/${data.recentRecipe.mood ?? 'comfort'}`,
      gradient: 'linear-gradient(135deg, var(--color-bg-elevated), var(--color-bg-overlay))',
    });
  }

  if (data.recentCity) {
    cards.push({
      id: 'city',
      label: data.recentCity,
      category: 'city',
      href: `/discovery/${data.recentCity.toLowerCase().replace(/\s+/g, '-')}`,
      gradient: 'linear-gradient(135deg, var(--color-bg-elevated), var(--color-bg-surface))',
    });
  }

  if (data.lastMood && !data.recentRecipe) {
    cards.push({
      id: 'mood',
      label: `Back to ${data.lastMood}`,
      category: 'mood',
      href: `/generate/${data.lastMood}`,
      gradient: 'linear-gradient(135deg, var(--color-accent-glow), var(--color-bg-elevated))',
    });
  }

  if (data.lastFavorite) {
    cards.push({
      id: 'favorite',
      label: data.lastFavorite.title,
      category: 'saved',
      href: '/favorites',
      gradient: 'linear-gradient(135deg, var(--color-bg-overlay), var(--color-bg-elevated))',
    });
  }

  if (cards.length === 0) return null;

  return (
    <section style={{ padding: '0 var(--space-5)' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-5)',
        }}
      >
        Continue your taste journey
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 'var(--space-2)',
          marginLeft: 'calc(-1 * var(--space-5))',
          marginRight: 'calc(-1 * var(--space-5))',
          paddingLeft: 'var(--space-5)',
          paddingRight: 'var(--space-5)',
        }}
        className="journey-scroll-row"
      >
        {cards.slice(0, 4).map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.href)}
            style={{
              width: '160px',
              height: '120px',
              flexShrink: 0,
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              cursor: 'pointer',
              scrollSnapAlign: 'start',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                flex: '0 0 60px',
                background: card.gradient,
              }}
            />
            <div
              style={{
                flex: 1,
                backgroundColor: 'var(--color-bg-elevated)',
                padding: 'var(--space-2) var(--space-3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {card.label}
              </div>
              <Badge variant="muted">{card.category}</Badge>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .journey-scroll-row::-webkit-scrollbar { display: none; }
        .journey-scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default JourneySection;
