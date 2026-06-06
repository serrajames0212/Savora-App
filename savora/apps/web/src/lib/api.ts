import axios from 'axios';
import { useUserStore } from '../stores/useUserStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
    }
    // For 402 (payment required / gated), return the response so pages can handle it
    if (error.response?.status === 402) {
      error.response.isGated = true;
      return error.response;
    }
    return Promise.reject(error);
  }
);

export default api;
