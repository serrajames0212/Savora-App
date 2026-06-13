import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Favorite, FavoriteMetadata } from '@paliato/shared-types';

interface FavoritesResponse {
  favorites: Favorite[];
}

interface AddFavoritePayload {
  itemType: string;
  itemId: string;
  metadata?: FavoriteMetadata;
}

interface AddFavoriteResponse {
  favorite: Favorite;
  gated?: boolean;
  feature?: string;
}

export function useFavorites(type: string) {
  return useQuery<FavoritesResponse>({
    queryKey: ['favorites', type],
    queryFn: async () => {
      const { data } = await api.get<FavoritesResponse>('/favorites', {
        params: { type },
      });
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation<AddFavoriteResponse, Error, AddFavoritePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AddFavoriteResponse>('/favorites', payload);
      return data;
    },
    onMutate: async (payload) => {
      // Optimistic: cancel in-flight queries and add locally
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      const optimisticFav: Favorite = {
        id: `optimistic-${Date.now()}`,
        userId: '',
        itemType: payload.itemType as Favorite['itemType'],
        itemId: payload.itemId,
        metadata: payload.metadata ?? null,
        savedAt: new Date().toISOString(),
      };

      // Update all relevant query caches
      const cacheKeys = ['all', payload.itemType, 'memory'];
      cacheKeys.forEach((key) => {
        queryClient.setQueryData<FavoritesResponse>(['favorites', key], (old) => {
          if (!old) return { favorites: [optimisticFav] };
          // Avoid duplicates
          const exists = old.favorites.some((f) => f.itemId === payload.itemId && f.itemType === payload.itemType);
          if (exists) return old;
          return { favorites: [optimisticFav, ...old.favorites] };
        });
      });

      return { optimisticFav };
    },
    onError: (_err, _payload, context) => {
      // Revert optimistic update
      const ctx = context as { optimisticFav?: Favorite } | undefined;
      if (ctx?.optimisticFav) {
        const id = ctx.optimisticFav.id;
        ['all', ctx.optimisticFav.itemType, 'memory'].forEach((key) => {
          queryClient.setQueryData<FavoritesResponse>(['favorites', key], (old) => {
            if (!old) return old;
            return { favorites: old.favorites.filter((f) => f.id !== id) };
          });
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, { id: string; itemType: string }>({
    mutationFn: async ({ id }) => {
      const { data } = await api.delete<{ success: boolean }>(`/favorites/${id}`);
      return data;
    },
    onMutate: async ({ id, itemType }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Save snapshots before optimistic remove
      const snapshots = new Map<string, FavoritesResponse>();
      ['all', itemType, 'memory'].forEach((key) => {
        const existing = queryClient.getQueryData<FavoritesResponse>(['favorites', key]);
        if (existing) snapshots.set(key, existing);

        queryClient.setQueryData<FavoritesResponse>(['favorites', key], (old) => {
          if (!old) return old;
          return { favorites: old.favorites.filter((f) => f.id !== id) };
        });
      });

      return { snapshots, itemType };
    },
    onError: (_err, _vars, context) => {
      const ctx = context as { snapshots: Map<string, FavoritesResponse>; itemType: string } | undefined;
      if (ctx?.snapshots) {
        ctx.snapshots.forEach((data, key) => {
          queryClient.setQueryData(['favorites', key], data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
