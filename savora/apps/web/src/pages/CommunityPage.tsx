import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { IdentityBadge } from '../components/community/IdentityBadge';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import api from '../lib/api';

interface CommunityReview {
  id: string;
  restaurantName: string;
  city: string;
  reviewerName: string;
  reviewerIdentity: string;
  date: string;
  snippet: string;
}

interface ReviewsResponse {
  reviews: CommunityReview[];
}

const IDENTITY_GROUPS: { slug: string; displayName: string; descriptor: string }[] = [
  {
    slug: 'coastal-minimalists',
    displayName: 'Coastal Minimalists',
    descriptor: 'Clean, oceanic flavors with refined restraint and seasonal simplicity.',
  },
  {
    slug: 'umami-architects',
    displayName: 'Umami Architects',
    descriptor: 'Depth-first tasters who engineer layered savoriness in every dish.',
  },
  {
    slug: 'comfort-ritualists',
    displayName: 'Comfort Ritualists',
    descriptor: 'Devotees of slow food, familiar warmth, and the rituals of nourishment.',
  },
  {
    slug: 'fire-foragers',
    displayName: 'Fire Foragers',
    descriptor: 'Live-fire lovers and wild ingredient seekers who eat with primal instinct.',
  },
  {
    slug: 'zen-purists',
    displayName: 'Zen Purists',
    descriptor: 'Minimal-ingredient philosophies guided by calm, clarity, and balance.',
  },
  {
    slug: 'bold-explorers',
    displayName: 'Bold Explorers',
    descriptor: 'Fearless palates drawn to the unknown, the fusion, and the frontier.',
  },
  {
    slug: 'ferment-devotees',
    displayName: 'Ferment Devotees',
    descriptor: 'Passionate cultivators of complexity through fermentation and time.',
  },
  {
    slug: 'pastoral-seasonalists',
    displayName: 'Pastoral Seasonalists',
    descriptor: 'Rooted in land and harvest — eating what the season insists upon.',
  },
  {
    slug: 'heat-seekers',
    displayName: 'Heat Seekers',
    descriptor: 'Capsaicin devotees who pursue the full spectrum of spice with reverence.',
  },
  {
    slug: 'sweet-restraint',
    displayName: 'Sweet Restraint',
    descriptor: 'Dessert minimalists who find beauty in quiet, considered sweetness.',
  },
];

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ReviewsResponse>({
    queryKey: ['community-reviews', 5],
    queryFn: async () => {
      const res = await api.get<ReviewsResponse>('/community/reviews?limit=5');
      return res.data;
    },
  });

  const reviews = data?.reviews ?? [];

  return (
    <PageShell>
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-4)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '30px',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            The Savora Community
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--color-text-muted)',
              margin: 'var(--space-2) 0 0',
              fontStyle: 'italic',
            }}
          >
            Shared taste, distinct voices.
          </p>
        </div>

        {/* Identity Groups */}
        <section style={{ marginBottom: 'var(--space-10)' }}>
          <h2
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Identity Groups
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
            }}
          >
            {IDENTITY_GROUPS.map((group) => (
              <motion.button
                key={group.slug}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/community/${group.slug}`)}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-accent-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  padding: 'var(--space-4)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '15px',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.25,
                  }}
                >
                  {group.displayName}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                  }}
                >
                  {group.descriptor}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Recent Reviews */}
        <section>
          <h2
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Recent Reviews
          </h2>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <SkeletonLoader height="14px" width="60%" />
                  <SkeletonLoader height="12px" width="40%" />
                  <SkeletonLoader height="12px" width="90%" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
              }}
            >
              Could not load reviews right now.
            </p>
          ) : reviews.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
              }}
            >
              No reviews yet. Be the first to share.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '15px',
                          color: 'var(--color-text-primary)',
                        }}
                      >
                        {review.restaurantName}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          marginLeft: 'var(--space-2)',
                        }}
                      >
                        {review.city}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-label)',
                        fontSize: '12px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {review.reviewerName}
                    </span>
                    <IdentityBadge identity={review.reviewerIdentity} size="sm" />
                  </div>

                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                      fontStyle: 'italic',
                    }}
                  >
                    "{review.snippet}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
};

export default CommunityPage;
