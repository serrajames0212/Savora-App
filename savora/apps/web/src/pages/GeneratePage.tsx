import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Inline SVG icon components
const FlameIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C12 2 6 8 6 13a6 6 0 0 0 12 0c0-3-2-6-2-6s-1 3-3 3c-1 0-1-3-1-8z" />
  </svg>
);

const StarIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const SwirlIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12" />
    <path d="M12 18a6 6 0 0 0 0-12" />
    <path d="M12 14a2 2 0 1 1 0-4" />
  </svg>
);

const DiamondIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 22 12 12 22 2 12" />
  </svg>
);

const CircleIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

const SparkIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.636 5.636l2.122 2.122M16.243 16.243l2.121 2.121M5.636 18.364l2.122-2.122M16.243 7.757l2.121-2.121" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

interface MoodDef {
  slug: string;
  name: string;
  descriptor: string;
  Icon: React.FC;
}

const MOODS: MoodDef[] = [
  { slug: 'comfort', name: 'Comfort', descriptor: 'Warm. Familiar. Safe.', Icon: FlameIcon },
  { slug: 'bold', name: 'Bold', descriptor: 'Intense. Daring. Alive.', Icon: StarIcon },
  { slug: 'deep', name: 'Deep', descriptor: 'Complex. Layered. Slow.', Icon: SwirlIcon },
  { slug: 'ritual', name: 'Ritual', descriptor: 'Intentional. Precise. Sacred.', Icon: DiamondIcon },
  { slug: 'light', name: 'Light', descriptor: 'Fresh. Delicate. Clear.', Icon: CircleIcon },
  { slug: 'surprise', name: 'Surprise', descriptor: 'Unexpected. Playful. New.', Icon: SparkIcon },
];

const MoodCard: React.FC<{ mood: MoodDef; onClick: () => void }> = ({ mood, onClick }) => {
  const { Icon } = mood;
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        minHeight: '180px',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      className="mood-card"
    >
      <style>{`
        .mood-card:hover {
          border-color: var(--color-accent-primary) !important;
          box-shadow: var(--shadow-glow-accent) !important;
        }
      `}</style>
      <div style={{ color: 'var(--color-accent-primary)' }}>
        <Icon />
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          {mood.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
          }}
        >
          {mood.descriptor}
        </div>
      </div>
    </motion.div>
  );
};

const EllipsisIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="19" cy="12" r="1.5" />
  </svg>
);

const DiscoverCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    style={{
      gridColumn: '1 / -1',
      minHeight: '100px',
      backgroundColor: 'var(--color-bg-surface)',
      border: '1px dashed var(--color-border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    }}
    className="discover-card"
  >
    <style>{`
      .discover-card:hover {
        border-color: var(--color-accent-primary) !important;
        box-shadow: var(--shadow-glow-accent) !important;
      }
      .discover-card:hover .discover-text { color: var(--color-text-primary) !important; }
    `}</style>
    <div style={{ color: 'var(--color-text-muted)' }}>
      <EllipsisIcon />
    </div>
    <div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.2rem',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-1)',
        }}
      >
        Discover Something New
      </div>
      <div
        className="discover-text"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          transition: 'color 0.2s ease',
        }}
      >
        Let your genome decide.
      </div>
    </div>
  </motion.div>
);

const GeneratePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        padding: 'var(--space-8) var(--space-5)',
        paddingBottom: 'calc(80px + var(--space-8))',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 'var(--space-8)' }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 6vw, 2.4rem)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            What are you feeling?
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              color: 'var(--color-text-muted)',
            }}
          >
            Your genome shapes every result.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-4)',
          }}
        >
          {MOODS.map((mood, i) => (
            <motion.div
              key={mood.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <MoodCard
                mood={mood}
                onClick={() => navigate(`/generate/${mood.slug}`)}
              />
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: MOODS.length * 0.07, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridColumn: '1 / -1' }}
          >
            <DiscoverCard onClick={() => navigate('/generate/discover')} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePage;
