import apiClient from './client';

interface ActionResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

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

export interface AdminNotification {
  id: number;
  receiver_id: number;
  receiver_email: string;
  subject: string;
  content: string;
  type: string;
  status: string;
  sent_by: number;
  created_at: string;
  updated_at: string;
}

export const notificationApi = {
  markAsRead: async (id: number): Promise<ActionResponse> => {
    const response = await apiClient.put<ActionResponse>(`/admin/notifications/${id}/read`);
    return response.data;
  },

  sendManual: async (data: {
    receiver_id: number;
    receiver_email: string;
    subject: string;
    content: string;
    type?: string;
  }): Promise<ActionResponse> => {
    const response = await apiClient.post<ActionResponse>('/admin/notifications/send', data);
    return response.data;
  },

  sendBulk: async (data: {
    university_id?: string;
    major_id?: string;
    status?: string;
    subject: string;
    content: string;
  }): Promise<ActionResponse> => {
    const response = await apiClient.post<ActionResponse>('/admin/notifications/send-bulk', data);
    return response.data;
  },

  getAdminNotifications: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminNotification>> => {
    const response = await apiClient.get<PaginatedResponse<AdminNotification>>('/admin/notifications', {
      params,
    });
    return response.data;
  },
};
