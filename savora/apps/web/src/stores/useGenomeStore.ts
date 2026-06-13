import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CulinaryIdentityGenome, FlavorGenome } from '@paliato/shared-types';

interface GenomeStore {
  culinaryIdentity: CulinaryIdentityGenome | null;
  flavorGenome: FlavorGenome | null;
  setCulinaryIdentity: (genome: CulinaryIdentityGenome) => void;
  setFlavorGenome: (genome: FlavorGenome) => void;
}

export const useGenomeStore = create<GenomeStore>()(
  persist(
    (set) => ({
      culinaryIdentity: null,
      flavorGenome: null,
      setCulinaryIdentity: (genome) => set({ culinaryIdentity: genome }),
      setFlavorGenome: (genome) => set({ flavorGenome: genome }),
    }),
    { name: 'paliato-genome' }
  )
);
