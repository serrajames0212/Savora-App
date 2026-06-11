import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { IdentityBadge } from '../components/community/IdentityBadge';
import PaywallSheet from '../components/subscription/PaywallSheet';
import api from '../lib/api';

interface Review {
  id: string;
  restaurantName: string;
  restaurantCity: string;
  body: string;
  visitedAt?: string;
  createdAt: string;
  culinaryIdentity: string;
  user: { name: string };
}

export default function CommunityReviewsPage() {
  const navigate = useNavigate();
  const { city: cityParam } = useParams<{ city?: string }>();
  const queryClient = useQueryClient();
  const [cityFilter, setCityFilter] = useState(
    cityParam ? cityParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : ''
  );
  const [showCompose, setShowCompose] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [form, setForm] = useState({ restaurantName: '', restaurantCity: '', body: '', visitedAt: '' });

  const { data, isLoading } = useQuery<{ reviews: Review[] }>({
    queryKey: ['community-reviews'],
    queryFn: () => api.get('/community/reviews?limit=50').then((r) => r.data),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/community/reviews', {
        restaurantName: form.restaurantName,
        restaurantCity: form.restaurantCity,
        body: form.body,
        visitedAt: form.visitedAt || undefined,
      });
      if (res.data?.gated) { setShowPaywall(true); throw new Error('gated'); }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-reviews'] });
      setShowCompose(false);
      setForm({ restaurantName: '', restaurantCity: '', body: '', visitedAt: '' });
    },
  });

  const reviews = (data?.reviews ?? []).filter((r) =>
    !cityFilter || r.restaurantCity.toLowerCase().includes(cityFilter.toLowerCase())
  );

  return (
    <PageShell>
      <div style={{ padding: 'var(--space-6)', maxWidth: 680, margin: '0 auto', paddingBottom: 100 }}>
        <button onClick={() => navigate('/community')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 14 }}>
          ← Community
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--color-text-primary)' }}>Restaurant Reviews</h1>
          <Button onClick={() => setShowCompose(true)}>Write a Review</Button>
        </div>

        <input
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          placeholder="Filter by city..."
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)',
            color: 'var(--color-text-primary)', fontSize: 14, outline: 'none',
            fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: 'var(--space-6)',
          }}
        />

        {isLoading ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 40 }}>Loading...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-secondary)' }}>No reviews yet.</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Be the first to share a dining experience.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--color-text-primary)' }}>{review.restaurantName}</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{review.restaurantCity}</p>
                </div>
                {review.visitedAt && <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)' }}>{new Date(review.visitedAt).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{review.user.name}</span>
                {review.culinaryIdentity && <IdentityBadge identity={review.culinaryIdentity} size="sm" />}
              </div>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{review.body}</p>
            </Card>
          ))
        )}
      </div>

      {/* Compose sheet */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: 'var(--space-6)', width: '100%', maxWidth: 600 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>Write a Review</h3>
              {[
                { label: 'Restaurant name', key: 'restaurantName', placeholder: 'e.g. Bistro du Marché' },
                { label: 'City', key: 'restaurantCity', placeholder: 'e.g. Paris' },
                { label: 'Date visited (optional)', key: 'visitedAt', placeholder: '', type: 'date' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key} style={{ marginBottom: 'var(--space-3)' }}>
                  <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input
                    type={type ?? 'text'}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Your review (max 400 chars)</label>
                <textarea value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value.slice(0, 400) }))} rows={4}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', resize: 'vertical' }} />
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right' }}>{form.body.length}/400</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
                <Button onClick={() => submitMutation.mutate()} disabled={!form.restaurantName || !form.restaurantCity || !form.body || submitMutation.isPending}>Submit</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPaywall && <PaywallSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)} />}
    </PageShell>
  );
}
