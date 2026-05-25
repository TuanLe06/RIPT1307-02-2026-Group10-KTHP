import apiClient from './client';
import type { AdmissionCombination } from '../types/university';

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

export const combinationApi = {
  getAllList: async (): Promise<{ success: boolean; message: string; data: AdmissionCombination[] }> => {
    const response = await apiClient.get('/combinations/list');
    return response.data;
  },

  getAll: async (
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<AdmissionCombination>> => {
    const response = await apiClient.get<PaginatedResponse<AdmissionCombination>>(
      '/combinations',
      { params: { page, limit } },
    );
    return response.data;
  },

  createGlobal: async (data: {
    code: string;
    subject_1: string;
    subject_2: string;
    subject_3: string;
  }): Promise<SingleResponse<AdmissionCombination>> => {
    const response = await apiClient.post<SingleResponse<AdmissionCombination>>('/combinations', data);
    return response.data;
  },

  updateGlobal: async (
    combinationId: string,
    data: Partial<Pick<AdmissionCombination, 'code' | 'subject_1' | 'subject_2' | 'subject_3'>>,
  ): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(`/combinations/${combinationId}`, data);
    return response.data;
  },

  deleteGlobal: async (combinationId: string): Promise<ActionResponse> => {
    const response = await apiClient.delete<ActionResponse>(`/combinations/${combinationId}`);
    return response.data;
  },

  getAssigned: async (
    universityCode: string,
    majorCode: string,
  ): Promise<{ success: boolean; message: string; data: string[] }> => {
    const response = await apiClient.get(
      `/universities/${universityCode}/majors/${majorCode}/assigned-combinations`,
    );
    return response.data;
  },

  assign: async (
    universityCode: string,
    majorCode: string,
    combinationIds: string[],
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put(
      `/universities/${universityCode}/majors/${majorCode}/assigned-combinations`,
      { combination_ids: combinationIds },
    );
    return response.data;
  },

  getByMajor: async (
    universityCode: string,
    majorCode: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<AdmissionCombination>> => {
    const response = await apiClient.get<PaginatedResponse<AdmissionCombination>>(
      `/universities/${universityCode}/majors/${majorCode}/combinations`,
      { params: { page, limit } },
    );
    return response.data;
  },

  getDetail: async (
    universityCode: string,
    majorCode: string,
    combinationId: string,
  ): Promise<SingleResponse<AdmissionCombination>> => {
    const response = await apiClient.get<SingleResponse<AdmissionCombination>>(
      `/universities/${universityCode}/majors/${majorCode}/combinations/${combinationId}`,
    );
    return response.data;
  },

  create: async (
    universityCode: string,
    majorCode: string,
    data: {
      code: string;
      subject_1: string;
      subject_2: string;
      subject_3: string;
    },
  ): Promise<SingleResponse<AdmissionCombination>> => {
    const response = await apiClient.post<SingleResponse<AdmissionCombination>>(
      `/universities/${universityCode}/majors/${majorCode}/combinations`,
      data,
    );
    return response.data;
  },

  update: async (
    universityCode: string,
    majorCode: string,
    combinationId: string,
    data: Partial<Pick<AdmissionCombination, 'code' | 'subject_1' | 'subject_2' | 'subject_3'>>,
  ): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(
      `/universities/${universityCode}/majors/${majorCode}/combinations/${combinationId}`,
      data,
    );
    return response.data;
  },

  delete: async (
    universityCode: string,
    majorCode: string,
    combinationId: string,
  ): Promise<ActionResponse> => {
    const response = await apiClient.delete<ActionResponse>(
      `/universities/${universityCode}/majors/${majorCode}/combinations/${combinationId}`,
    );
    return response.data;
  },
};
