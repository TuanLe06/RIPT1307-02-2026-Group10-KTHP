import apiClient from './client';
import type { ApplicationWithDetails, ApplicationStatus, ApplicationDetailData } from '../types/university';

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ActionResponse {
  success: boolean;
  message: string;
  data?: ApplicationWithDetails;
}

export interface ApplicationDetailResponse {
  success: boolean;
  data: ApplicationDetailData;
}

export interface ApplicationFilter {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  university_id?: string;
  major_id?: string;
  search?: string;
}

export const applicationApi = {
  getAll: async (filters: ApplicationFilter = {}): Promise<PaginatedResponse<ApplicationWithDetails>> => {
    const response = await apiClient.get<PaginatedResponse<ApplicationWithDetails>>('/admin/applications', {
      params: filters,
    });
    return response.data;
  },

  getById: async (id: number): Promise<ApplicationDetailResponse> => {
    const response = await apiClient.get<ApplicationDetailResponse>(`/admin/applications/${id}`);
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: { status: ApplicationStatus; reject_reason?: string },
  ): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(`/admin/applications/${id}/status`, data);
    return response.data;
  },
};
