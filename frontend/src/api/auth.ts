import apiClient from './client';
import type { AuthResponse, RegisterPayload } from '../types/auth';

export const authApi = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterPayload): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<{ success: boolean; data: import('../types/auth').User }> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  verifyOtp: async (data: { email: string; otp: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<{ success: boolean; message: string; code?: string }> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  resendOtp: async (data: { email: string }): Promise<{ success: boolean; message: string; code?: string; data?: { remaining: number } }> => {
    const response = await apiClient.post('/auth/resend-otp', data);
    return response.data;
  },

  resetPassword: async (data: { email: string; otp: string; password: string }): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ success: boolean; data: import('../types/auth').User; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<{ success: boolean; data: import('../types/auth').User; message: string }>(
      '/users/me/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  deleteAvatar: async (): Promise<{ success: boolean; data: import('../types/auth').User; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; data: import('../types/auth').User; message: string }>(
      '/users/me/avatar',
    );
    return response.data;
  },
};
