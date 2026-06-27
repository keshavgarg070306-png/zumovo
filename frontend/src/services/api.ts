import axios from 'axios';
import type { Signal, SignalRequest, SignalStatusResponse, AuthResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { username, password });
    return data;
  },
  register: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { username, password });
    return data;
  },
};

export const signalApi = {
  getSignals: async (): Promise<Signal[]> => {
    const { data } = await api.get<Signal[]>('/signals');
    return data;
  },
  getSignal: async (id: string): Promise<Signal> => {
    const { data } = await api.get<Signal>(`/signals/${id}`);
    return data;
  },
  createSignal: async (signal: SignalRequest): Promise<Signal> => {
    const { data } = await api.post<Signal>('/signals', signal);
    return data;
  },
  deleteSignal: async (id: string): Promise<void> => {
    await api.delete(`/signals/${id}`);
  },
  getSignalStatus: async (id: string): Promise<SignalStatusResponse> => {
    const { data } = await api.get<SignalStatusResponse>(`/signals/${id}/status`);
    return data;
  },
};

export default api;
