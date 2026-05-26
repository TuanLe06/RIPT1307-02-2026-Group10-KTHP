import apiClient from './client';
import type { Major } from '../types/university';

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

export const majorApi = {
  getByUniversity: async (
    universityCode: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Major>> => {
    const response = await apiClient.get<PaginatedResponse<Major>>(
      `/universities/${universityCode}/majors`,
      { params: { page, limit } },
    );
    return response.data;
  },

  getDetail: async (universityCode: string, code: string): Promise<SingleResponse<Major>> => {
    const response = await apiClient.get<SingleResponse<Major>>(
      `/universities/${universityCode}/majors/${code}`,
    );
    return response.data;
  },

  create: async (
    universityId: string,
    data: {
      code: string;
      name: string;
      description?: string;
      min_score?: number;
    },
  ): Promise<SingleResponse<Major>> => {
    const response = await apiClient.post<SingleResponse<Major>>(
      `/universities/${universityId}/majors`,
      data,
    );
    return response.data;
  },

  update: async (
    universityId: string,
    majorId: string,
    data: Partial<Pick<Major, 'code' | 'name' | 'description' | 'min_score' | 'status'>>,
  ): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(
      `/universities/${universityId}/majors/${majorId}`,
      data,
    );
    return response.data;
  },

  delete: async (universityId: string, majorId: string): Promise<ActionResponse> => {
    const response = await apiClient.delete<ActionResponse>(
      `/universities/${universityId}/majors/${majorId}`,
    );
    return response.data;
  },
};
