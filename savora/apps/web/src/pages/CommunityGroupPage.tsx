import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { IdentityBadge } from '../components/community/IdentityBadge';
import PaywallSheet from '../components/subscription/PaywallSheet';
import api from '../lib/api';

const SLUG_TO_NAME: Record<string, string> = {
  'coastal-minimalists': 'Coastal Minimalists',
  'umami-architects': 'Umami Architects',
  'comfort-ritualists': 'Comfort Ritualists',
  'fire-foragers': 'Fire Foragers',
  'zen-purists': 'Zen Purists',
  'bold-explorers': 'Bold Explorers',
  'ferment-devotees': 'Ferment Devotees',
  'pastoral-seasonalists': 'Pastoral Seasonalists',
  'heat-seekers': 'Heat Seekers',
  'sweet-restraint': 'Sweet Restraint',
};

const POST_TYPES = ['discovery', 'dish', 'recipe', 'question', 'discussion'] as const;
const TYPE_LABELS: Record<string, string> = { discovery: 'Discovery', dish: 'Dish', recipe: 'Recipe', question: 'Question', discussion: 'Discussion' };

interface Post {
  id: string;
  userId: string;
  identitySlug: string;
  type: string;
  title?: string;
  body: string;
  cityRef?: string;
  restaurantRef?: string;
  createdAt: string;
  userName: string;
  culinaryIdentity?: string;
  replyCount: number;
  replies?: { id: string; body: string; userName: string; createdAt: string }[];
}

const TABS = ['All', 'Discussions', 'Discoveries', 'Dishes', 'Questions'];

export default function CommunityGroupPage() {
  const { identitySlug } = useParams<{ identitySlug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [composeType, setComposeType] = useState<typeof POST_TYPES[number]>('discussion');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [replyBodies, setReplyBodies] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ posts: Post[] }>({
    queryKey: ['community-posts', identitySlug],
    queryFn: () => api.get(`/community/posts?identitySlug=${identitySlug}&limit=50`).then((r) => r.data),
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/community/posts', {
        identitySlug, type: composeType, title: composeTitle || undefined, body: composeBody,
      });
      if (res.data?.gated) { setShowPaywall(true); throw new Error('gated'); }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts', identitySlug] });
      setShowCompose(false); setComposeTitle(''); setComposeBody('');
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ postId, body }: { postId: string; body: string }) => {
      const res = await api.post(`/community/posts/${postId}/replies`, { body });
      if (res.data?.gated) { setShowPaywall(true); throw new Error('gated'); }
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community-posts', identitySlug] }),
  });

  const tabFilter = (type: string) => {
    if (activeTab === 'All') return true;
    return type === activeTab.toLowerCase().replace(/s$/, '');
  };

  const posts = (data?.posts ?? []).filter((p) => tabFilter(p.type));
  const displayName = SLUG_TO_NAME[identitySlug ?? ''] ?? identitySlug;

  return (
    <PageShell>
      <div style={{ padding: 'var(--space-6)', maxWidth: 680, margin: '0 auto', paddingBottom: 100 }}>
        <button onClick={() => navigate('/community')} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', marginBottom: 'var(--space-4)', fontSize: 14 }}>
          ← Community
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--color-text-primary)', marginBottom: 'var(--space-6)' }}>{displayName}</h1>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-6)', overflowX: 'auto' }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                border: '1px solid', fontFamily: 'var(--font-body)',
                borderColor: activeTab === tab ? 'var(--color-accent-primary)' : 'var(--color-border-medium)',
                backgroundColor: activeTab === tab ? 'var(--color-accent-glow)' : 'transparent',
                color: activeTab === tab ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
              }}
            >{tab}</button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 40 }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--color-text-secondary)' }}>No posts yet.</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Be the first to share something.</p>
          </div>
        ) : (
          posts.map((post) => (
            <Card key={post.id} style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>{post.userName}</span>
                {post.culinaryIdentity && <IdentityBadge identity={post.culinaryIdentity} size="sm" />}
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, backgroundColor: 'var(--color-bg-overlay)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-label)' }}>{TYPE_LABELS[post.type] ?? post.type}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              {post.title && <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--color-text-primary)', marginBottom: 4 }}>{post.title}</p>}
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {expandedPostId === post.id ? post.body : post.body.slice(0, 120) + (post.body.length > 120 ? '...' : '')}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{post.replyCount} replies</span>
              </div>
              {expandedPostId === post.id && (
                <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
                  {(post.replies ?? []).map((reply) => (
                    <div key={reply.id} style={{ marginBottom: 'var(--space-3)', paddingLeft: 12, borderLeft: '2px solid var(--color-border-subtle)' }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{reply.userName} · </span>
                      <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{reply.body}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-3)' }} onClick={(e) => e.stopPropagation()}>
                    <input
                      value={replyBodies[post.id] ?? ''}
                      onChange={(e) => setReplyBodies((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Reply... (max 200 chars)"
                      maxLength={200}
                      style={{
                        flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-overlay)',
                        color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)',
                      }}
                    />
                    <Button
                      onClick={() => { const body = replyBodies[post.id]; if (body?.trim()) replyMutation.mutate({ postId: post.id, body }); }}
                      disabled={!replyBodies[post.id]?.trim()}
                    >Reply</Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Compose FAB */}
      <button
        onClick={() => setShowCompose(true)}
        style={{
          position: 'fixed', bottom: 90, right: 20, width: 56, height: 56, borderRadius: '50%',
          backgroundColor: 'var(--color-accent-primary)', border: 'none', cursor: 'pointer',
          color: '#1a1208', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >+</button>

      {/* Compose sheet */}
      <AnimatePresence>
        {showCompose && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              style={{ backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', padding: 'var(--space-6)', width: '100%', maxWidth: 600 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--color-text-primary)', marginBottom: 'var(--space-4)' }}>New Post</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                {POST_TYPES.map((t) => (
                  <button key={t} onClick={() => setComposeType(t)}
                    style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)', border: '1px solid', borderColor: composeType === t ? 'var(--color-accent-primary)' : 'var(--color-border-medium)', backgroundColor: composeType === t ? 'var(--color-accent-glow)' : 'transparent', color: composeType === t ? 'var(--color-accent-primary)' : 'var(--color-text-muted)' }}>
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <input value={composeTitle} onChange={(e) => setComposeTitle(e.target.value)} placeholder="Title (optional)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', marginBottom: 'var(--space-3)' }} />
              <textarea value={composeBody} onChange={(e) => setComposeBody(e.target.value.slice(0, 500))} placeholder="Share your thoughts..." rows={4}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-medium)', backgroundColor: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box', resize: 'vertical', marginBottom: 4 }} />
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'right', marginBottom: 'var(--space-3)' }}>{composeBody.length}/500</p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
                <Button onClick={() => postMutation.mutate()} disabled={!composeBody.trim() || postMutation.isPending}>Post</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPaywall && <PaywallSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)} />}
    </PageShell>
  );
}
