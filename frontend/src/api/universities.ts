import apiClient from './client';
import type { University } from '../types/university';

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ActionResponse {
  success: boolean;
  message: string;
}

export const universityApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedResponse<University>> => {
    const response = await apiClient.get<PaginatedResponse<University>>('/universities', {
      params: { page, limit },
    });
    return response.data;
  },

  getByCode: async (code: string): Promise<SingleResponse<University>> => {
    const response = await apiClient.get<SingleResponse<University>>(`/universities/${code}`);
    return response.data;
  },

  create: async (data: {
    code: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
  }): Promise<SingleResponse<University>> => {
    const response = await apiClient.post<SingleResponse<University>>('/universities', data);
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<Pick<University, 'code' | 'name' | 'address' | 'phone' | 'email' | 'website' | 'description' | 'status'>>,
  ): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(`/universities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ActionResponse> => {
    const response = await apiClient.delete<ActionResponse>(`/universities/${id}`);
    return response.data;
  },
};
