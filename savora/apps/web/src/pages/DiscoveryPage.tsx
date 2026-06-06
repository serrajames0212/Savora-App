import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageShell from '../components/layout/PageShell';
import { useDiscoverySuggestions, useRecentSearches } from '../hooks/useDiscovery';

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-');
}

const SearchIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="8" cy="8" r="5" stroke="var(--color-text-muted)" strokeWidth="1.4" />
    <path d="M12 12l3 3" stroke="var(--color-text-muted)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="6" cy="6" r="5" stroke="var(--color-text-muted)" strokeWidth="1.2" />
    <path d="M6 3.5v2.5l1.5 1.5" stroke="var(--color-text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChipSkeleton: React.FC = () => (
  <motion.div
    animate={{ opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 1.4, repeat: Infinity }}
    style={{
      width: 80,
      height: 32,
      borderRadius: '999px',
      backgroundColor: 'var(--color-bg-elevated)',
    }}
  />
);

const DiscoveryPage: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  const { data: suggestionsData, isLoading: suggestionsLoading } = useDiscoverySuggestions();
  const { data: recentData } = useRecentSearches();

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/discovery/${cityToSlug(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const suggestions = suggestionsData?.cities ?? [];
  const recent = recentData?.cities ?? [];

  return (
    <PageShell>
      <div
        style={{
          maxWidth: 540,
          margin: '0 auto',
          padding: 'var(--space-8) var(--space-5) var(--space-10)',
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 8vw, 2.8rem)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-2)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          Discover
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--color-text-muted)',
            margin: '0 0 var(--space-8)',
            lineHeight: 1.55,
          }}
        >
          Find restaurants and dishes matched to your genome.
        </p>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-10)' }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search a city..."
            style={{
              width: '100%',
              height: '56px',
              border: '1px solid var(--color-accent-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              padding: '0 48px 0 var(--space-5)',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'outline 0.15s',
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.outline = '1px solid var(--color-accent-primary)';
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.outline = 'none';
            }}
          />
          <button
            onClick={handleSubmit}
            aria-label="Search"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SearchIcon />
          </button>
        </div>

        {/* Suggested for you */}
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Suggested for you
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {suggestionsLoading
              ? Array.from({ length: 4 }).map((_, i) => <ChipSkeleton key={i} />)
              : suggestions.map((city) => (
                  <motion.button
                    key={city}
                    onClick={() => navigate(`/discovery/${cityToSlug(city)}`)}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      backgroundColor: 'var(--color-bg-surface)',
                      border: '1px solid var(--color-accent-border)',
                      borderRadius: '999px',
                      color: 'var(--color-text-primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      padding: '6px 16px',
                      cursor: 'pointer',
                      lineHeight: 1.4,
                    }}
                  >
                    {city}
                  </motion.button>
                ))}
          </div>
        </section>

        {/* Recent searches */}
        {recent.length > 0 && (
          <section>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
              }}
            >
              Recent
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {recent.map((city) => (
                <motion.button
                  key={city}
                  onClick={() => navigate(`/discovery/${cityToSlug(city)}`)}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    backgroundColor: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: '999px',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    padding: '6px 16px 6px 12px',
                    cursor: 'pointer',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}
                >
                  <ClockIcon />
                  {city}
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
};

export default DiscoveryPage;
