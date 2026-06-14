import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../ui/ProgressBar';
import { useGenomeStore } from '../../stores/useGenomeStore';
import { useUserStore } from '../../stores/useUserStore';
import { useGenerateGenome } from '../../hooks/useGenerateGenome';
import type { OnboardingData } from '../../hooks/useGenerateGenome';
import api from '../../lib/api';

import Step1Welcome from './Step1Welcome';
import Step2Dietary from './Step2Dietary';
import Step3Dislikes from './Step3Dislikes';
import Step4Cuisines from './Step4Cuisines';
import Step5Behavior from './Step5Behavior';
import Step6Context from './Step6Context';
import Step7Flavors from './Step7Flavors';
import Step8Generating from './Step8Generating';

const TOTAL_STEPS = 8;
const STORAGE_KEY = 'paliato_onboarding_progress';

interface WizardState {
  dietaryRestrictions: string[];
  dislikes: string[];
  cuisineAffinity: string[];
  behaviorScores: {
    adventurousness: number;
    comfortVsNovelty: number;
    luxuryVsRustic: number;
    complexityTolerance: number;
    cookingSkill: number;
  };
  diningContext: {
    social: 'social' | 'solitary' | '';
    ritual: 'ritual' | 'spontaneous' | '';
    formality: 'casual' | 'fineDining' | '';
    pace: 'slow' | 'quick' | '';
  };
  flavorScores: {
    saltScore: number;
    sweetScore: number;
    bitterScore: number;
    acidityScore: number;
    heatScore: number;
    aromaticSpiceScore: number;
    umamiScore: number;
    fatRichnessScore: number;
    smokeCharScore: number;
    fermentationScore: number;
    mineralCleanScore: number;
    aromaticIntensityScore: number;
  };
}

const DEFAULT_STATE: WizardState = {
  dietaryRestrictions: [],
  dislikes: [],
  cuisineAffinity: [],
  behaviorScores: {
    adventurousness: 50,
    comfortVsNovelty: 50,
    luxuryVsRustic: 50,
    complexityTolerance: 50,
    cookingSkill: 50,
  },
  diningContext: {
    social: '',
    ritual: '',
    formality: '',
    pace: '',
  },
  flavorScores: {
    saltScore: 50,
    sweetScore: 50,
    bitterScore: 50,
    acidityScore: 50,
    heatScore: 50,
    aromaticSpiceScore: 50,
    umamiScore: 50,
    fatRichnessScore: 50,
    smokeCharScore: 50,
    fermentationScore: 50,
    mineralCleanScore: 50,
    aromaticIntensityScore: 50,
  },
};

interface SavedProgress {
  step: number;
  data: WizardState;
  savedAt: number;
}

// ─── Resume Prompt ───────────────────────────────────────────────────────────

interface ResumePromptProps {
  savedStep: number;
  onResume: () => void;
  onStartOver: () => void;
}

const ResumePrompt: React.FC<ResumePromptProps> = ({ savedStep, onResume, onStartOver }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
    }}
  >
    <div
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-8)',
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.5rem',
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-3)',
          lineHeight: 1.2,
        }}
      >
        Continue where you left off?
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: '0 0 var(--space-8)',
          lineHeight: 1.6,
        }}
      >
        You were on step {savedStep} of 8.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <button
          onClick={onResume}
          style={{
            backgroundColor: 'var(--color-accent-primary)',
            color: '#0f0f0f',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4) var(--space-6)',
            fontFamily: 'var(--font-label)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Resume
        </button>
        <button
          onClick={onStartOver}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4) var(--space-6)',
            fontFamily: 'var(--font-label)',
            fontSize: '14px',
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Start over
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Wizard ──────────────────────────────────────────────────────────────────

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardState>(DEFAULT_STATE);
  const [resumePrompt, setResumePrompt] = useState<SavedProgress | null>(null);
  const navigate = useNavigate();
  const setCulinaryIdentity = useGenomeStore((s) => s.setCulinaryIdentity);
  const setFlavorGenome = useGenomeStore((s) => s.setFlavorGenome);
  const setOnboardingComplete = useUserStore((s) => s.setOnboardingComplete);
  const { mutateAsync: generateGenome } = useGenerateGenome();

  // On mount: check for saved progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedProgress;
        if (saved.step > 1) {
          setResumePrompt(saved);
        }
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // Save progress on every step change (except step 1 and step 8)
  useEffect(() => {
    if (step > 1 && step < TOTAL_STEPS) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ step, data, savedAt: Date.now() })
        );
      } catch {
        // ignore quota errors
      }
    }
  }, [step, data]);

  const handleResume = () => {
    if (resumePrompt) {
      setData(resumePrompt.data);
      setStep(resumePrompt.step);
    }
    setResumePrompt(null);
  };

  const handleStartOver = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResumePrompt(null);
    setStep(1);
    setData(DEFAULT_STATE);
  };

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerateGenome = async (onboardingData: OnboardingData) => {
    await Promise.allSettled([
      api.post('/dietary/profile', {
        restrictions: onboardingData.dietaryRestrictions,
        dislikes: onboardingData.dislikes,
      }),
    ]);
    return generateGenome(onboardingData);
  };

  const handleComplete = (
    culinaryIdentity: import('@paliato/shared-types').CulinaryIdentityGenome,
    flavorGenome: import('@paliato/shared-types').FlavorGenome
  ) => {
    // Clear saved progress after successful genome generation
    localStorage.removeItem(STORAGE_KEY);
    setCulinaryIdentity(culinaryIdentity);
    setFlavorGenome(flavorGenome);
    setOnboardingComplete(true);
    api.patch('/profile/onboarding-complete').catch(() => {});
    navigate('/home');
  };

  const buildOnboardingData = (): OnboardingData => ({
    dietaryRestrictions: data.dietaryRestrictions,
    dislikes: data.dislikes,
    cuisineAffinity: data.cuisineAffinity,
    behaviorScores: data.behaviorScores,
    diningContext: data.diningContext as OnboardingData['diningContext'],
    flavorScores: data.flavorScores,
  });

  // Show resume prompt if applicable
  if (resumePrompt) {
    return (
      <AnimatePresence mode="wait">
        <ResumePrompt
          key="resume"
          savedStep={resumePrompt.step}
          onResume={handleResume}
          onStartOver={handleStartOver}
        />
      </AnimatePresence>
    );
  }

  // Step 1 has no progress bar (full-screen welcome)
  const showProgress = step > 1 && step < TOTAL_STEPS;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      {showProgress && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--color-bg-base)',
          }}
        >
          <ProgressBar current={step - 1} total={TOTAL_STEPS - 2} />
        </div>
      )}

      {step === 1 && <Step1Welcome onNext={next} />}

      {step === 2 && (
        <Step2Dietary
          selected={data.dietaryRestrictions}
          onChange={(v) => setData((d) => ({ ...d, dietaryRestrictions: v }))}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 3 && (
        <Step3Dislikes
          dislikes={data.dislikes}
          onChange={(v) => setData((d) => ({ ...d, dislikes: v }))}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 4 && (
        <Step4Cuisines
          selected={data.cuisineAffinity}
          onChange={(v) => setData((d) => ({ ...d, cuisineAffinity: v }))}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 5 && (
        <Step5Behavior
          scores={data.behaviorScores}
          onChange={(v) => setData((d) => ({ ...d, behaviorScores: v }))}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 6 && (
        <Step6Context
          context={data.diningContext}
          onChange={(v) => setData((d) => ({ ...d, diningContext: v }))}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 7 && (
        <Step7Flavors
          scores={data.flavorScores}
          onChange={(v) => setData((d) => ({ ...d, flavorScores: v }))}
          onNext={next}
          onBack={back}
        />
      )}

      {step === 8 && (
        <Step8Generating
          onboardingData={buildOnboardingData()}
          onComplete={handleComplete}
          onRetry={() => setStep(7)}
          generateGenome={handleGenerateGenome}
        />
      )}
    </div>
  );
};

export default OnboardingWizard;
