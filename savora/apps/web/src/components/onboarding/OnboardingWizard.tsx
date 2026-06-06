import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar } from '../ui/ProgressBar';
import { useGenomeStore } from '../../stores/useGenomeStore';
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

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardState>(DEFAULT_STATE);
  const navigate = useNavigate();
  const setCulinaryIdentity = useGenomeStore((s) => s.setCulinaryIdentity);
  const setFlavorGenome = useGenomeStore((s) => s.setFlavorGenome);
  const { mutateAsync: generateGenome } = useGenerateGenome();

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerateGenome = async (onboardingData: OnboardingData) => {
    // Fire dietary profile save in parallel
    await Promise.allSettled([
      api.post('/dietary/profile', {
        restrictions: onboardingData.dietaryRestrictions,
        dislikes: onboardingData.dislikes,
      }),
    ]);
    return generateGenome(onboardingData);
  };

  const handleComplete = (
    culinaryIdentity: import('@savora/shared-types').CulinaryIdentityGenome,
    flavorGenome: import('@savora/shared-types').FlavorGenome
  ) => {
    setCulinaryIdentity(culinaryIdentity);
    setFlavorGenome(flavorGenome);
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
