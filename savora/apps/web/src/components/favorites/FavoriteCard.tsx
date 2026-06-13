import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/Badge';
import { useRemoveFavorite } from '../../hooks/useFavorites';
import type { Favorite } from '@paliato/shared-types';
import api from '../../lib/api';
import { useToastStore } from '../../stores/useToastStore';

interface FavoriteCardProps {
  favorite: Favorite;
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Saved today';
  if (diffDays === 1) return 'Saved yesterday';
  if (diffDays < 30) return `Saved ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'Saved 1 month ago';
  return `Saved ${diffMonths} months ago`;
}

const gradientByType: Record<string, string> = {
  recipe: 'radial-gradient(ellipse at 50% 30%, var(--color-accent-glow) 0%, var(--color-bg-elevated) 100%)',
  restaurant: 'radial-gradient(ellipse at 50% 30%, rgba(120,80,40,0.2) 0%, var(--color-bg-elevated) 100%)',
  dish: 'radial-gradient(ellipse at 50% 30%, rgba(40,80,120,0.2) 0%, var(--color-bg-elevated) 100%)',
  memory: 'radial-gradient(ellipse at 50% 30%, rgba(80,40,120,0.2) 0%, var(--color-bg-elevated) 100%)',
};

export const FavoriteCard: React.FC<FavoriteCardProps> = ({ favorite }) => {
  const navigate = useNavigate();
  const removeMutation = useRemoveFavorite();
  const [showRemove, setShowRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number>(0);
  const addToast = useToastStore((s) => s.addToast);

  const handleCopyRecipe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRemove(false);
    if (!favorite.itemId) return;
    try {
      const response = await api.get(`/export/recipe/${favorite.itemId}/text`, {
        responseType: 'text',
      });
      const text = typeof response.data === 'string' ? response.data : String(response.data);
      await navigator.clipboard.writeText(text);
      addToast('Recipe copied to clipboard', 'success');
    } catch {
      addToast('Failed to copy recipe', 'error');
    }
  };

  const title =
    favorite.recipe?.title ??
    favorite.metadata?.restaurantName ??
    favorite.metadata?.dishName ??
    favorite.itemId;

  const gradient = gradientByType[favorite.itemType] ?? gradientByType.memory;

  const handleTap = () => {
    if (showRemove) {
      setShowRemove(false);
      return;
    }
    if (favorite.itemType === 'recipe' && favorite.itemId) {
      navigate(`/recipe/${favorite.itemId}`);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    longPressTimer.current = setTimeout(() => {
      setShowRemove(true);
    }, 300);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = touchStartX.current - e.touches[0].clientX;
    if (deltaX > 40) {
      // Swipe left
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
      setShowRemove(true);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await removeMutation.mutateAsync({ id: favorite.id, itemType: favorite.itemType });
    } catch {
      setError('Could not remove. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Card body */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-card)',
          transform: showRemove ? (favorite.itemType === 'recipe' ? 'translateX(-136px)' : 'translateX(-72px)') : 'translateX(0)',
          transition: 'transform 0.25s var(--ease-in-out-smooth)',
        }}
      >
        {/* Gradient area */}
        <div
          style={{
            height: '100px',
            background: gradient,
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: 'var(--space-2)',
              left: 'var(--space-3)',
            }}
          >
            <Badge variant="muted">{favorite.itemType}</Badge>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-3)' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              margin: 0,
              marginBottom: 'var(--space-2)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {title}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
            {favorite.metadata?.mood && (
              <Badge variant="accent">{favorite.metadata.mood as string}</Badge>
            )}
            {(favorite.metadata?.city) && (
              <Badge variant="default">{favorite.metadata.city as string}</Badge>
            )}
            {favorite.recipe?.cuisineInspiration && (
              <Badge variant="default">{favorite.recipe.cuisineInspiration}</Badge>
            )}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            {relativeTime(favorite.savedAt)}
          </p>
        </div>
      </div>

      {/* Action buttons revealed on swipe/long press */}
      <AnimatePresence>
        {showRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              overflow: 'hidden',
              width: favorite.itemType === 'recipe' ? '128px' : '64px',
            }}
          >
            {favorite.itemType === 'recipe' && (
              <button
                onClick={handleCopyRecipe}
                style={{
                  flex: 1,
                  background: 'rgba(60, 100, 160, 0.85)',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'var(--font-label)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  letterSpacing: '0.04em',
                  width: '64px',
                }}
              >
                📋
                Copy
              </button>
            )}
            <button
              onClick={handleRemove}
              style={{
                flex: 1,
                background: 'rgba(180, 60, 60, 0.85)',
                border: 'none',
                color: '#fff',
                fontFamily: 'var(--font-label)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                letterSpacing: '0.04em',
                width: '64px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M6 4V3h4v1M5 4v8h6V4H5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              bottom: 'var(--space-2)',
              left: 'var(--space-2)',
              right: 'var(--space-2)',
              background: 'var(--color-bg-overlay)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              padding: '4px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FavoriteCard;
