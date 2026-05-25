import apiClient from './client';
import type { AuthResponse, RegisterPayload } from '../types/auth';

export const authApi = {
  login: async (data: { citizenId: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<{ success: boolean; data: import('../types/auth').User }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};
