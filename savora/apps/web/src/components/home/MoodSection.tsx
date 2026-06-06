import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MoodChip {
  label: string;
  slug: string;
  icon: React.ReactNode;
}

const ComfortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2 C6 2, 3 4, 3 7 C3 10, 5 13, 8 14 C11 13, 13 10, 13 7 C13 4, 10 2, 8 2Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M8 5 L8 10 M5.5 7.5 L10.5 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const BoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2 L14 8 L8 14 L2 8 Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
  </svg>
);

const DeepIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.6"/>
    <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
  </svg>
);

const RitualIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    <path d="M8 3 L13 8 L8 13 L3 8 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.5"/>
  </svg>
);

const LightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="2 2"/>
  </svg>
);

const SurpriseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <line x1="8" y1="1" x2="8" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="12" x2="8" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="1" y1="8" x2="4" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="3" y1="3" x2="5.1" y2="5.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="10.9" y1="10.9" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="13" y1="3" x2="10.9" y2="5.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5.1" y1="10.9" x2="3" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MOODS: MoodChip[] = [
  { label: 'Comfort', slug: 'comfort', icon: <ComfortIcon /> },
  { label: 'Bold', slug: 'bold', icon: <BoldIcon /> },
  { label: 'Deep', slug: 'deep', icon: <DeepIcon /> },
  { label: 'Ritual', slug: 'ritual', icon: <RitualIcon /> },
  { label: 'Light', slug: 'light', icon: <LightIcon /> },
  { label: 'Surprise', slug: 'surprise', icon: <SurpriseIcon /> },
];

const MoodSection: React.FC = () => {
  const navigate = useNavigate();
  const [active, setActive] = React.useState<string | null>(null);

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
        Tonight feels like...
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
        className="mood-scroll-row"
      >
        {MOODS.map((mood) => {
          const isActive = active === mood.slug;
          return (
            <button
              key={mood.slug}
              onClick={() => {
                setActive(mood.slug);
                navigate(`/generate/${mood.slug}`);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '10px var(--space-5)',
                borderRadius: '999px',
                border: `1px solid ${isActive ? 'var(--color-accent-primary)' : 'var(--color-accent-border)'}`,
                backgroundColor: isActive ? 'var(--color-accent-primary)' : 'var(--color-bg-surface)',
                color: isActive ? 'var(--color-bg-base)' : 'var(--color-accent-primary)',
                fontFamily: 'var(--font-label)',
                fontSize: '13px',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                scrollSnapAlign: 'start',
                flexShrink: 0,
                transition: 'all var(--duration-fast) var(--ease-in-out-smooth)',
                outline: 'none',
              }}
            >
              <span style={{ color: isActive ? 'var(--color-bg-base)' : 'var(--color-accent-primary)' }}>
                {mood.icon}
              </span>
              {mood.label}
            </button>
          );
        })}
      </div>

      <style>{`
        .mood-scroll-row::-webkit-scrollbar { display: none; }
        .mood-scroll-row { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default MoodSection;
