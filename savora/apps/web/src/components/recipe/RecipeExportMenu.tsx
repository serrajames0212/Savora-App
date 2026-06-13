import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { useToastStore } from '../../stores/useToastStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import PaywallSheet from '../subscription/PaywallSheet';

interface RecipeExportMenuProps {
  recipeId: string;
}

const RecipeExportMenu: React.FC<RecipeExportMenuProps> = ({ recipeId }) => {
  const [open, setOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const addToast = useToastStore((s) => s.addToast);
  const isReserve = useSubscriptionStore((s) => s.isReserve)();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopyRecipe = async () => {
    setOpen(false);
    try {
      const response = await api.get(`/export/recipe/${recipeId}/text`, {
        responseType: 'text',
      });
      const text = typeof response.data === 'string' ? response.data : String(response.data);
      await navigator.clipboard.writeText(text);
      addToast('Recipe copied to clipboard', 'success');
    } catch {
      addToast('Failed to copy recipe', 'error');
    }
  };

  const handleShareCard = async () => {
    setOpen(false);
    try {
      const response = await api.post(
        `/export/recipe/${recipeId}/share-card`,
        {},
        { responseType: 'blob' }
      );

      // Check if 402
      if (response.status === 402) {
        setPaywallOpen(true);
        return;
      }

      const contentType = response.headers['content-type'];
      const blob = new Blob([response.data as BlobPart], {
        type: typeof contentType === 'string' ? contentType : 'image/svg+xml',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'paliato_recipe_card.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 402) {
        setPaywallOpen(true);
      } else {
        addToast('Failed to generate share card', 'error');
      }
    }
  };

  return (
    <>
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '20px',
            letterSpacing: '2px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Recipe options"
        >
          ···
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                minWidth: '200px',
                backgroundColor: 'var(--color-bg-overlay)',
                border: '1px solid var(--color-border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-elevated)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={handleCopyRecipe}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                📋 Copy recipe
              </button>
              <button
                onClick={handleShareCard}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-3) var(--space-4)',
                  textAlign: 'left',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                🎴 Share card
                {!isReserve && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      fontFamily: 'var(--font-label)',
                      color: 'var(--color-accent-primary)',
                      border: '1px solid var(--color-accent-border)',
                      borderRadius: '999px',
                      padding: '1px 6px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Reserve
                  </span>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PaywallSheet isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </>
  );
};

export default RecipeExportMenu;
