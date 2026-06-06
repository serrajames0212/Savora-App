import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteCard } from '../components/favorites/FavoriteCard';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

type TabType = 'all' | 'recipe' | 'restaurant' | 'dish' | 'memory';

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'recipe', label: 'Recipes' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'dish', label: 'Dishes' },
  { id: 'memory', label: 'Memories' },
];

const EMPTY_MESSAGES: Record<TabType, string> = {
  all: 'Nothing saved yet. Your taste journey begins when you explore.',
  recipe: 'No saved recipes yet. Generate one to get started.',
  restaurant: 'No saved restaurants yet. Explore a city to find matches.',
  dish: 'No saved dishes yet. Discover a city to uncover them.',
  memory: 'No memories yet. Your most meaningful meals will live here.',
};

const FavoritesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { data, isLoading, isError } = useFavorites(activeTab);

  const favorites = data?.favorites ?? [];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: 'var(--space-6) var(--space-4)',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          margin: 0,
          marginBottom: 'var(--space-6)',
          letterSpacing: '-0.01em',
        }}
      >
        Favorites
      </h1>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-1)',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '999px',
              fontFamily: 'var(--font-label)',
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              color: activeTab === tab.id ? 'var(--color-bg-base)' : 'var(--color-text-muted)',
              zIndex: 1,
              transition: 'color 0.2s ease',
            }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '999px',
                  backgroundColor: 'var(--color-accent-primary)',
                  zIndex: -1,
                }}
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
              }}
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <SkeletonLoader height="100px" borderRadius="0" />
                  <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', backgroundColor: 'var(--color-bg-elevated)' }}>
                    <SkeletonLoader height="14px" width="80%" />
                    <SkeletonLoader height="14px" width="60%" />
                    <SkeletonLoader height="10px" width="40%" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--space-12) 0',
                fontStyle: 'italic',
              }}
            >
              Something went quiet. Please try again.
            </p>
          ) : favorites.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                padding: 'var(--space-12) var(--space-4)',
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}
            >
              {EMPTY_MESSAGES[activeTab]}
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
              }}
            >
              <AnimatePresence>
                {favorites.map((fav) => (
                  <FavoriteCard key={fav.id} favorite={fav} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FavoritesPage;
