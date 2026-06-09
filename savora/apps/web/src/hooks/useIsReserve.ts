import { useSubscriptionStore } from '../stores/useSubscriptionStore';

export function useIsReserve(): boolean {
  return useSubscriptionStore((s) => s.status === 'reserve');
}
