import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { useToastStore } from '../../stores/useToastStore';
import api from '../../lib/api';

const MOODS = ['comfort', 'bold', 'deep', 'ritual', 'light', 'surprise'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recipeName?: string;
  recipeId?: string;
}

export default function LogMealSheet({ isOpen, onClose, recipeName = '', recipeId }: Props) {
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ recipeName, moodTag: '', notes: '' });

  const mutation = useMutation({
    mutationFn: () => api.post('/meal-log', { recipeName: form.recipeName, recipeId, moodTag: form.moodTag || undefined, notes: form.notes || undefined }),
    onSuccess: () => {
      addToast('Meal logged!', 'success');
      queryClient.invalidateQueries({ queryKey: ['meal-log'] });
      onClose();
    },
    onError: () => addToast('Failed to log meal', 'error'),
  });

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-primary)', fontSize: 14, outline: 'none',
    fontFamily: 'var(--font-body)', boxSizing: 'border-box',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
            style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: 'var(--space-6)', width: '100%', maxWidth: 600 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Log This Meal</h3>

            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Meal name</label>
              <input value={form.recipeName} onChange={(e) => setForm((p) => ({ ...p, recipeName: e.target.value }))} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Mood (optional)</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {MOODS.map((m) => (
                  <button key={m} onClick={() => setForm((p) => ({ ...p, moodTag: p.moodTag === m ? '' : m }))}
                    style={{ padding: '6px 14px', borderRadius: 999, border: `1px solid ${form.moodTag === m ? 'var(--color-accent-primary)' : 'var(--color-border-medium)'}`, backgroundColor: form.moodTag === m ? 'var(--color-accent-primary)' : 'transparent', color: form.moodTag === m ? 'var(--color-bg-base)' : 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={() => mutation.mutate()} disabled={!form.recipeName || mutation.isPending}>
                {mutation.isPending ? 'Logging...' : 'Log Meal'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
