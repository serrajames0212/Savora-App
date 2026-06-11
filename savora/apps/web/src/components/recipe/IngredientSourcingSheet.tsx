import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Modal } from '../ui/Modal';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import api from '../../lib/api';

interface Props {
  ingredientName: string | null;
  onClose: () => void;
}

type SourcingDifficulty = 'Common' | 'Moderate' | 'Specialist';

interface OnlineRetailer {
  name: string;
  url: string;
}

interface SourcingData {
  name: string;
  description: string;
  difficulty: SourcingDifficulty;
  nearbySearchTerm: string;
  onlineRetailers: OnlineRetailer[];
  substitutes: string[];
  storageNote?: string;
}

const DIFFICULTY_DOTS: Record<SourcingDifficulty, number> = {
  Common: 1,
  Moderate: 3,
  Specialist: 5,
};

const DIFFICULTY_COLOR: Record<SourcingDifficulty, string> = {
  Common: '#059669',
  Moderate: '#d97706',
  Specialist: '#dc2626',
};

const DifficultyDots: React.FC<{ difficulty: SourcingDifficulty }> = ({ difficulty }) => {
  const filled = DIFFICULTY_DOTS[difficulty];
  const color = DIFFICULTY_COLOR[difficulty];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: i < filled ? color : 'var(--color-border-medium)',
            flexShrink: 0,
          }}
        />
      ))}
      <span
        style={{
          fontFamily: 'var(--font-label)',
          fontSize: '12px',
          color,
          marginLeft: '6px',
          fontWeight: 600,
        }}
      >
        {difficulty}
      </span>
    </div>
  );
};

const SourcingContent: React.FC<{ ingredientName: string; onClose: () => void }> = ({ ingredientName, onClose }) => {
  const { data, isLoading, isError } = useQuery<SourcingData>({
    queryKey: ['ingredient-sourcing', ingredientName],
    queryFn: async () => {
      const res = await api.get<SourcingData>(`/ingredients/${encodeURIComponent(ingredientName)}/sourcing`);
      return res.data;
    },
    enabled: !!ingredientName,
  });

  const addToList = useMutation({
    mutationFn: async () => {
      await api.post('/shopping/items', { name: ingredientName });
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <SkeletonLoader height="22px" width="50%" />
        <SkeletonLoader height="14px" width="100%" />
        <SkeletonLoader height="14px" width="80%" />
        <SkeletonLoader height="14px" width="60%" />
        <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <SkeletonLoader height="13px" width="40%" />
          <SkeletonLoader height="40px" width="100%" borderRadius="var(--radius-sm)" />
          <SkeletonLoader height="13px" width="55%" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        Sourcing information unavailable right now.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Description */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
        {data.description}
      </p>

      {/* Difficulty */}
      <div>
        <p style={{ fontFamily: 'var(--font-label)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2)' }}>
          Sourcing Difficulty
        </p>
        <DifficultyDots difficulty={data.difficulty} />
      </div>

      {/* Where to find it */}
      <div>
        <p style={{ fontFamily: 'var(--font-label)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 var(--space-3)' }}>
          Where to Find It
        </p>

        {/* Nearby stores */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-base)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Nearby Specialist Stores
          </span>
          <button
            onClick={() => window.open(`https://maps.google.com/search?q=${encodeURIComponent(data.nearbySearchTerm)}+near+me`, '_blank')}
            style={{
              background: 'none',
              border: '1px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-accent)',
              fontFamily: 'var(--font-label)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '5px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Search Near Me
          </button>
        </div>

        {/* Online retailers */}
        {data.onlineRetailers.length > 0 && (
          <div
            style={{
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-3)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-label)', fontSize: '11px', color: 'var(--color-text-muted)', margin: '0 0 var(--space-3)', letterSpacing: '0.04em' }}>
              Online
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {data.onlineRetailers.map((retailer) => (
                <div
                  key={retailer.name}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}
                >
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {retailer.name}
                  </span>
                  <button
                    onClick={() => window.open(retailer.url, '_blank')}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border-medium)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text-accent)',
                      fontFamily: 'var(--font-label)',
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    Visit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Substitutes */}
      {data.substitutes.length > 0 && (
        <div>
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2)' }}>
            Substitute With
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {data.substitutes.join(' · ')}
          </p>
        </div>
      )}

      {/* Storage note */}
      {data.storageNote && (
        <div
          style={{
            backgroundColor: 'var(--color-bg-base)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3)',
          }}
        >
          <p style={{ fontFamily: 'var(--font-label)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', margin: '0 0 var(--space-2)' }}>
            Storage
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {data.storageNote}
          </p>
        </div>
      )}

      {/* Add to Shopping List */}
      <button
        onClick={() => addToList.mutate()}
        disabled={addToList.isPending || addToList.isSuccess}
        style={{
          width: '100%',
          backgroundColor: addToList.isSuccess ? 'var(--color-bg-elevated)' : 'var(--color-accent-primary)',
          border: '1px solid var(--color-accent-border)',
          borderRadius: 'var(--radius-sm)',
          color: addToList.isSuccess ? 'var(--color-text-muted)' : 'var(--color-bg-base)',
          fontFamily: 'var(--font-label)',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: 'var(--space-4)',
          cursor: addToList.isPending || addToList.isSuccess ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        {addToList.isSuccess ? 'Added to List' : addToList.isPending ? 'Adding…' : 'Add to Shopping List'}
      </button>
    </div>
  );
};

export const IngredientSourcingSheet: React.FC<Props> = ({ ingredientName, onClose }) => {
  return (
    <Modal
      isOpen={ingredientName !== null}
      onClose={onClose}
      title={ingredientName ?? undefined}
    >
      {ingredientName && (
        <SourcingContent ingredientName={ingredientName} onClose={onClose} />
      )}
    </Modal>
  );
};

export default IngredientSourcingSheet;
