import { create } from 'zustand';
import type { SubscriptionStatus } from '@savora/shared-types';

interface SubscriptionStore {
  status: SubscriptionStatus;
  renewalDate: string | null;
  setSubscription: (status: SubscriptionStatus, renewalDate?: string) => void;
  isReserve: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>()((set, get) => ({
  status: 'free',
  renewalDate: null,
  setSubscription: (status, renewalDate) =>
    set({ status, renewalDate: renewalDate ?? null }),
  isReserve: () => get().status === 'reserve',
}));
