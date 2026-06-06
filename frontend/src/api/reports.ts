import apiClient from './client';
import type { StatusStat } from '../types/university';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface OverallStats {
  total_applications: number;
  status_statistics: {
    total: number;
    submitted: number;
    pending_review: number;
    approved: number;
    rejected: number;
    passed: number;
    failed: number;
  };
  total_universities: number;
  total_majors: number;
  total_candidates: number;
}

export interface UniStat {
  id: number;
  code: string;
  name: string;
  total_applications: number;
  submitted: number;
  pending_review: number;
  approved: number;
  rejected: number;
  passed: number;
  failed: number;
}

export interface MajorStat {
  id: number;
  code: string;
  name: string;
  university_name: string;
  total_applications: number;
  submitted: number;
  pending_review: number;
  approved: number;
  rejected: number;
  passed: number;
  failed: number;
}

export const reportsApi = {
  getOverall: async (): Promise<ApiResponse<OverallStats>> => {
    const response = await apiClient.get<ApiResponse<OverallStats>>('/admin/reports/statistics/overall');
    return response.data;
  },

  getByUniversity: async (): Promise<ApiResponse<UniStat[]>> => {
    const response = await apiClient.get<ApiResponse<UniStat[]>>('/admin/reports/statistics/by-university');
    return response.data;
  },

  getByMajor: async (): Promise<ApiResponse<MajorStat[]>> => {
    const response = await apiClient.get<ApiResponse<MajorStat[]>>('/admin/reports/statistics/by-major');
    return response.data;
  },

  getByStatus: async (): Promise<ApiResponse<StatusStat[]>> => {
    const response = await apiClient.get<ApiResponse<StatusStat[]>>('/admin/reports/statistics/by-status');
    return response.data;
  },
};
