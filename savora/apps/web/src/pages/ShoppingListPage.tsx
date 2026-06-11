import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  category?: string;
  isChecked: boolean;
  sourceTitle?: string;
}

interface ShoppingListData {
  list: { id: string; items: ShoppingItem[] };
}

const CATEGORY_ORDER = ['protein', 'produce', 'dairy', 'pantry', 'spice', 'other'];
const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein', produce: 'Produce', dairy: 'Dairy',
  pantry: 'Pantry', spice: 'Spice', other: 'Other',
};

export default function ShoppingListPage() {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const { data, isLoading } = useQuery<ShoppingListData>({
    queryKey: ['shopping'],
    queryFn: () => api.get('/shopping').then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isChecked }: { id: string; isChecked: boolean }) =>
      api.patch(`/shopping/items/${id}`, { isChecked }),
    onMutate: async ({ id, isChecked }) => {
      await queryClient.cancelQueries({ queryKey: ['shopping'] });
      const prev = queryClient.getQueryData<ShoppingListData>(['shopping']);
      queryClient.setQueryData<ShoppingListData>(['shopping'], (old) => {
        if (!old) return old;
        return { list: { ...old.list, items: old.list.items.map((i) => i.id === id ? { ...i, isChecked } : i) } };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) queryClient.setQueryData(['shopping'], ctx.prev); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['shopping'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/shopping/items/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping'] }),
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => api.post('/shopping/items', { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shopping'] }); setNewItem(''); },
  });

  const clearCheckedMutation = useMutation({
    mutationFn: () => api.delete('/shopping/checked'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shopping'] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => api.delete('/shopping'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shopping'] }); setConfirmClear(false); },
  });

  const items = data?.list.items ?? [];
  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);

  const grouped = CATEGORY_ORDER.reduce<Record<string, ShoppingItem[]>>((acc, cat) => {
    const catItems = unchecked.filter((i) => (i.category ?? 'other') === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const handleAddItem = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newItem.trim()) addMutation.mutate(newItem.trim());
  };

  return (
    <PageShell>
      <div style={{ padding: 'var(--space-6)', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--color-text-primary)' }}>Shopping List</h1>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {checked.length > 0 && (
              <button onClick={() => clearCheckedMutation.mutate()} style={{ fontSize: 13, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear checked
              </button>
            )}
            {items.length > 0 && (
              <button onClick={() => setConfirmClear(true)} style={{ fontSize: 13, color: '#e06060', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Manual add input */}
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleAddItem}
          placeholder="Add an item... (press Enter)"
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)', fontSize: 15, outline: 'none',
            fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: 'var(--space-6)',
          }}
        />

        {isLoading ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 40 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Your list is empty.</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Generate a recipe to start.</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped).map(([cat, catItems]) => (
              <div key={cat} style={{ marginBottom: 'var(--space-6)' }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>
                  {CATEGORY_LABELS[cat]}
                </p>
                {catItems.map((item) => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={(id, val) => toggleMutation.mutate({ id, isChecked: val })} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            ))}

            {checked.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)', opacity: 0.5 }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>
                  Collected
                </p>
                {checked.map((item) => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={(id, val) => toggleMutation.mutate({ id, isChecked: val })} onDelete={(id) => deleteMutation.mutate(id)} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Confirm clear dialog */}
        <AnimatePresence>
          {confirmClear && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            >
              <Card style={{ maxWidth: 320, width: '100%', padding: 'var(--space-6)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-primary)', marginBottom: 12 }}>Clear entire list?</p>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 'var(--space-4)' }}>This cannot be undone.</p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                  <Button variant="ghost" onClick={() => setConfirmClear(false)}>Cancel</Button>
                  <Button onClick={() => clearAllMutation.mutate()} style={{ backgroundColor: '#8b2020' }}>Clear All</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

const ShoppingItemRow: React.FC<{ item: ShoppingItem; onToggle: (id: string, val: boolean) => void; onDelete: (id: string) => void }> = ({ item, onToggle, onDelete }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
    borderBottom: '1px solid var(--color-border-subtle)',
    textDecoration: item.isChecked ? 'line-through' : 'none',
    opacity: item.isChecked ? 0.5 : 1,
  }}>
    <button
      onClick={() => onToggle(item.id, !item.isChecked)}
      style={{
        width: 20, height: 20, borderRadius: 4, border: '1px solid var(--color-border-medium)',
        backgroundColor: item.isChecked ? 'var(--color-accent-primary)' : 'transparent',
        cursor: 'pointer', flexShrink: 0,
      }}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>
        {item.amount && <span style={{ color: 'var(--color-text-muted)' }}>{item.amount}{item.unit ? ` ${item.unit}` : ''} </span>}
        {item.name}
      </span>
      {item.sourceTitle && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>from: {item.sourceTitle}</div>}
    </div>
    <button
      onClick={() => onDelete(item.id)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 16, padding: '0 4px' }}
    >
      ×
    </button>
  </div>
);
