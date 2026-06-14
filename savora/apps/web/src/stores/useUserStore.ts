import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@paliato/shared-types';

interface UserStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  setUser: (user: User, token: string) => void;
  setOnboardingComplete: (v: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      onboardingComplete: false,
      setUser: (user, token) =>
        set({ user, token, isAuthenticated: true, onboardingComplete: user.onboardingComplete ?? false }),
      setOnboardingComplete: (v) => set((s) => ({ onboardingComplete: v, user: s.user ? { ...s.user, onboardingComplete: v } : null })),
      logout: () => set({ user: null, token: null, isAuthenticated: false, onboardingComplete: false }),
    }),
    { name: 'paliato-user' }
  )
);
