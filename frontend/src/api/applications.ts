import apiClient from './client';
import type { Application, ApplicationStatus } from '../types/university';

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

interface ActionResponse {
  success: boolean;
  message: string;
}

export interface ApplicationFilter {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  university_id?: string;
  major_id?: string;
  search?: string;
}

export interface ApplicationStats {
  total: number;
  by_status: Record<string, number>;
  by_university: Record<string, number>;
  by_major: Record<string, number>;
}

export const applicationApi = {
  getAll: async (filters: ApplicationFilter = {}): Promise<PaginatedResponse<Application>> => {
    const response = await apiClient.get<PaginatedResponse<Application>>('/admin/applications', {
      params: filters,
    });
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: { status: ApplicationStatus; reject_reason?: string },
  ): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(`/admin/applications/${id}/status`, data);
    return response.data;
  },

  getStats: async (): Promise<{ success: boolean; data: ApplicationStats }> => {
    const response = await apiClient.get<{ success: boolean; data: ApplicationStats }>(
      '/admin/applications/stats',
    );
    return response.data;
  },
};
