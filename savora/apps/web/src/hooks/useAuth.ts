import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import { useUserStore } from '../stores/useUserStore';
import type { User } from '@paliato/shared-types';

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export function useLogin() {
  const setUser = useUserStore((s) => s.setUser);

  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<AuthResponse>('/auth/login', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.user, data.token);
    },
  });
}

export function useRegister() {
  const setUser = useUserStore((s) => s.setUser);

  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<AuthResponse>('/auth/register', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data.user, data.token);
    },
  });
}
