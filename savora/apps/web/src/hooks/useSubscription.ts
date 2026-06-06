import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import type { Subscription } from '@savora/shared-types';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';

export function useSubscriptionStatus() {
  const setSubscription = useSubscriptionStore((s) => s.setSubscription);

  return useQuery<Subscription>({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const { data } = await api.get<Subscription>('/subscription/status');
      setSubscription(data.status, data.renewalDate ?? undefined);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (plan: 'monthly' | 'annual'): Promise<{ url: string }> => {
      const { data } = await api.post<{ url: string }>('/subscription/checkout', { plan });
      return data;
    },
    onSuccess: ({ url }) => {
      if (url && url !== '#') {
        window.location.href = url;
      }
    },
  });
}
