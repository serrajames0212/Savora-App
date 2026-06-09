import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SelectionCard } from '../components/ui/SelectionCard';
import { Button } from '../components/ui/Button';
import { useToastStore } from '../stores/useToastStore';
import { useGenomeStore } from '../stores/useGenomeStore';
import api from '../lib/api';

const DIETARY_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Pescatarian',
  'Halal',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Shellfish-Free',
  'None of these',
];

const DISLIKE_SUGGESTIONS = ['Cilantro', 'Blue cheese', 'Liver', 'Anchovies', 'Durian', 'Oysters'];

interface DietaryProfileData {
  restrictions: string[];
  dislikes: string[];
}

const EmblemPulse: React.FC = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-base)',
      gap: 'var(--space-4)',
    }}
  >
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: '2px solid var(--color-accent-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C12 2 6 8 6 13a6 6 0 0 0 12 0c0-3-2-6-2-6s-1 3-3 3c-1 0-1-3-1-8z" />
      </svg>
    </motion.div>
    <div
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: 'var(--color-text-muted)',
      }}
    >
      Updating your genome...
    </div>
  </div>
);

const DietaryProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const setCulinaryIdentity = useGenomeStore((s) => s.setCulinaryIdentity);
  const setFlavorGenome = useGenomeStore((s) => s.setFlavorGenome);

  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [dislikeInput, setDislikeInput] = useState('');
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  // Load current dietary profile
  const { isLoading, data: profileData } = useQuery<{ profile: DietaryProfileData }>({
    queryKey: ['dietary', 'profile'],
    queryFn: async () => {
      const { data } = await api.get<{ profile: DietaryProfileData }>('/dietary/profile');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profileData) {
      setRestrictions(profileData.profile.restrictions ?? []);
      setDislikes(profileData.profile.dislikes ?? []);
    }
  }, [profileData]);

  const saveMutation = useMutation({
    mutationFn: async (payload: DietaryProfileData) => {
      await api.put('/dietary/profile', payload);
    },
    onSuccess: async () => {
      // Recalibrate genome
      setIsRecalibrating(true);
      try {
        const { data } = await api.post('/genome/recalibrate');
        if (data.culinaryIdentity) setCulinaryIdentity(data.culinaryIdentity);
        if (data.flavorGenome) setFlavorGenome(data.flavorGenome);
        addToast('Your profile has been updated.', 'success');
        navigate('/profile');
      } catch {
        addToast('Profile saved. Genome update failed — try again later.', 'info');
        navigate('/profile');
      } finally {
        setIsRecalibrating(false);
      }
    },
    onError: () => {
      addToast('Failed to save dietary profile', 'error');
    },
  });

  const toggleRestriction = (option: string) => {
    if (option === 'None of these') {
      setRestrictions(['None of these']);
      return;
    }
    const withoutNone = restrictions.filter((s) => s !== 'None of these');
    if (withoutNone.includes(option)) {
      setRestrictions(withoutNone.filter((s) => s !== option));
    } else {
      setRestrictions([...withoutNone, option]);
    }
  };

  const addDislikeTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !dislikes.includes(trimmed)) {
      setDislikes((prev) => [...prev, trimmed]);
    }
  };

  const removeDislikeTag = (tag: string) => {
    setDislikes((prev) => prev.filter((d) => d !== tag));
  };

  const handleDislikeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addDislikeTag(dislikeInput);
      setDislikeInput('');
    } else if (e.key === 'Backspace' && dislikeInput === '' && dislikes.length > 0) {
      removeDislikeTag(dislikes[dislikes.length - 1]);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({ restrictions, dislikes });
  };

  if (isRecalibrating) {
    return <EmblemPulse />;
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-5) var(--space-12)',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/profile')}
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
          marginBottom: 'var(--space-6)',
        }}
      >
        ← Profile
      </button>

      {/* Page title */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-6)',
          lineHeight: 1.15,
        }}
      >
        Dietary Profile
      </h1>

      {/* Restrictions */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Dietary Restrictions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-3)',
          }}
        >
          {DIETARY_OPTIONS.map((option) => (
            <SelectionCard
              key={option}
              selected={restrictions.includes(option)}
              onClick={() => toggleRestriction(option)}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                }}
              >
                {option}
              </span>
            </SelectionCard>
          ))}
        </div>
      </div>

      {/* Dislikes */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-label)',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Ingredients You Dislike
        </h2>

        {/* Tags */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <AnimatePresence>
            {dislikes.map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border-medium)',
                  borderRadius: '999px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-primary)',
                }}
              >
                {tag}
                <button
                  onClick={() => removeDislikeTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    padding: 0,
                    lineHeight: 1,
                    fontSize: '14px',
                  }}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input */}
        <input
          type="text"
          value={dislikeInput}
          onChange={(e) => setDislikeInput(e.target.value)}
          onKeyDown={handleDislikeKeyDown}
          placeholder="Type an ingredient and press Enter"
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Suggestions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-3)',
          }}
        >
          {DISLIKE_SUGGESTIONS.filter((s) => !dislikes.includes(s)).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addDislikeTag(suggestion)}
              style={{
                background: 'none',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '999px',
                padding: '3px 10px',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <Button
        variant="primary"
        style={{ width: '100%' }}
        onClick={handleSave}
        loading={saveMutation.isPending}
        disabled={restrictions.length === 0}
      >
        Save changes
      </Button>
    </div>
  );
};

export default DietaryProfilePage;
