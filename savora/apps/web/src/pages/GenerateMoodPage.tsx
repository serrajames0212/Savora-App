import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGenerateRecipe, useFavoriteRecipe } from '../hooks/useRecipe';
import { useRecipeStore } from '../stores/useRecipeStore';
import type { GeneratedRecipe } from '@savora/shared-types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import PaywallSheet from '../components/subscription/PaywallSheet';

// Loading subtext cycle
const LOADING_SUBTEXTS = [
  'Reading your genome...',
  'Shaping the flavours...',
  'Almost ready...',
];

const LoadingOverlay: React.FC = () => {
  const [subtextIndex, setSubtextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtextIndex((i) => (i + 1) % LOADING_SUBTEXTS.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg-base)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-6)',
      }}
    >
      {/* Pulsing emblem */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '2px solid var(--color-accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-accent)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C12 2 6 8 6 13a6 6 0 0 0 12 0c0-3-2-6-2-6s-1 3-3 3c-1 0-1-3-1-8z" />
        </svg>
      </motion.div>

      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Crafting your recipe...
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={subtextIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
            }}
          >
            {LOADING_SUBTEXTS[subtextIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Cuisine icon SVG placeholder
const CuisineEmblem: React.FC = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
    <path d="M3 11l19-9-9 19-2-8-8-2z" />
  </svg>
);

interface RecipeViewProps {
  recipe: GeneratedRecipe;
  onGenerateAnother: () => void;
  isGenerating: boolean;
}

const RecipeView: React.FC<RecipeViewProps> = ({ recipe, onGenerateAnother, isGenerating }) => {
  const navigate = useNavigate();
  const favoriteMutation = useFavoriteRecipe();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = () => {
    favoriteMutation.mutate(recipe.id, {
      onSuccess: (data) => setIsFavorited(data.favorited),
    });
  };

  const difficultyColor =
    recipe.difficulty === 'low'
      ? 'var(--color-text-muted)'
      : recipe.difficulty === 'medium'
      ? 'var(--color-accent-primary)'
      : 'var(--color-text-primary)';

  return (
    <motion.div
      key={recipe.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        paddingBottom: '160px',
      }}
    >
      {/* Back button */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--color-bg-base)',
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <button
          onClick={() => navigate('/generate')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-accent-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 var(--space-5)' }}>
        {/* Hero area */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            height: '240px',
            borderRadius: 'var(--radius-lg)',
            background: 'radial-gradient(ellipse at center, var(--color-accent-glow) 0%, var(--color-bg-base) 80%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-6)',
            marginTop: 'var(--space-5)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <CuisineEmblem />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)',
            lineHeight: 1.15,
          }}
        >
          {recipe.title}
        </motion.h1>

        {/* Badges row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}
        >
          <Badge variant="accent">{recipe.cuisineInspiration}</Badge>
          <Badge variant="muted">{recipe.mood}</Badge>
          <Badge variant="default">{recipe.dietaryType}</Badge>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-5)',
          }}
        >
          {recipe.description}
        </motion.p>

        {/* Cooking time row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-4) 0',
            borderTop: '1px solid var(--color-border-subtle)',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          {[
            { label: 'Prep', value: recipe.cookingTime.prep },
            { label: 'Cook', value: recipe.cookingTime.cook },
            { label: 'Total', value: recipe.cookingTime.total },
          ].map((t) => (
            <div key={t.label}>
              <div
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '10px',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '2px',
                }}
              >
                {t.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '15px',
                  color: 'var(--color-accent-primary)',
                  fontWeight: 500,
                }}
              >
                {t.value}m
              </div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '2px',
              }}
            >
              Difficulty
            </div>
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '13px',
                color: difficultyColor,
                textTransform: 'capitalize',
              }}
            >
              {recipe.difficulty}
            </div>
          </div>
        </motion.div>

        {/* Why this fits tonight */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <Card variant="elevated">
            <div
              style={{
                borderLeft: '4px solid var(--color-accent-primary)',
                paddingLeft: 'var(--space-4)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-label)',
                  fontSize: '10px',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Why this fits tonight
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {recipe.whyThisFits}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Ingredients */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Ingredients
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: recipe.ingredients.length > 4 ? '1fr 1fr' : '1fr',
              gap: 'var(--space-3)',
            }}
          >
            {recipe.ingredients.map((ing, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '12px',
                    color: 'var(--color-accent-primary)',
                    marginBottom: '2px',
                  }}
                >
                  {ing.amount} {ing.unit}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {ing.name}
                </span>
                {ing.note && (
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--color-text-muted)',
                      fontStyle: 'italic',
                      marginTop: '2px',
                    }}
                  >
                    {ing.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Method / Steps */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-4)',
            }}
          >
            Method
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {recipe.steps.map((step) => (
              <div key={step.step} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-label)',
                    fontSize: '1.4rem',
                    color: 'var(--color-accent-primary)',
                    fontWeight: 600,
                    lineHeight: 1,
                    minWidth: '32px',
                    paddingTop: '2px',
                  }}
                >
                  {step.step}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.6,
                      margin: '0 0 var(--space-1)',
                    }}
                  >
                    {step.instruction}
                  </p>
                  {step.technique && (
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      {step.technique}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Flavor profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-3)',
            }}
          >
            Flavour Profile
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {recipe.flavorProfile.dominant[0] && <Badge variant="accent">{recipe.flavorProfile.dominant[0]}</Badge>}
            {recipe.flavorProfile.dominant[1] && <Badge variant="accent">{recipe.flavorProfile.dominant[1]}</Badge>}
            {recipe.flavorProfile.texture && <Badge variant="default">{recipe.flavorProfile.texture}</Badge>}
            {recipe.flavorProfile.aroma && <Badge variant="muted">{recipe.flavorProfile.aroma}</Badge>}
          </div>
        </motion.div>

        {/* Plating suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-label)',
              fontSize: '10px',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Plating
          </div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontStyle: 'italic',
              color: 'var(--color-text-muted)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {recipe.platingSuggestion}
          </p>
        </motion.div>

        {/* Pairing suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: 'var(--space-6)' }}
        >
          <Card variant="surface">
            <div
              style={{
                fontFamily: 'var(--font-label)',
                fontSize: '10px',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 'var(--space-2)',
              }}
            >
              Pairs with
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {recipe.pairingSuggestion}
            </p>
          </Card>
        </motion.div>
      </div>

      {/* Sticky action row */}
      <div
        style={{
          position: 'sticky',
          bottom: '80px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-bg-base)',
          borderTop: '1px solid var(--color-border-subtle)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'flex',
          gap: 'var(--space-3)',
          zIndex: 20,
        }}
      >
        <Button
          variant="ghost"
          style={{ flex: 1 }}
          onClick={handleFavorite}
          loading={favoriteMutation.isPending}
        >
          {isFavorited ? '♥ Saved' : '♡ Save to Favorites'}
        </Button>
        <Button
          variant="primary"
          style={{ flex: 1 }}
          onClick={onGenerateAnother}
          loading={isGenerating}
        >
          Generate Another
        </Button>
      </div>
    </motion.div>
  );
};

const GenerateMoodPage: React.FC = () => {
  const { mood = 'comfort' } = useParams<{ mood: string }>();
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const generateMutation = useGenerateRecipe();
  const setCurrentRecipe = useRecipeStore((s) => s.setCurrentRecipe);

  const generate = (excludeFingerprints?: GeneratedRecipe['fingerprint'][]) => {
    generateMutation.mutate(
      { mood, excludeFingerprints },
      {
        onSuccess: (data) => {
          setRecipe(data);
          setCurrentRecipe(data);
        },
        onError: (err: unknown) => {
          const axiosErr = err as { response?: { status?: number } };
          if (axiosErr?.response?.status === 402) {
            setShowPaywall(true);
          }
        },
      }
    );
  };

  // Trigger on mount
  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateAnother = () => {
    if (recipe) {
      generate([recipe.fingerprint]);
    } else {
      generate();
    }
  };

  const isLoading = generateMutation.isPending && !recipe;

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingOverlay key="loading" />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {recipe && (
          <RecipeView
            key={recipe.id}
            recipe={recipe}
            onGenerateAnother={handleGenerateAnother}
            isGenerating={generateMutation.isPending}
          />
        )}
      </AnimatePresence>

      {showPaywall && (
        <PaywallSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      )}
    </>
  );
};

export default GenerateMoodPage;
