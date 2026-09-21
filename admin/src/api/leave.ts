import { apiClient } from './client';
import type { ApiResponse, LeaveRequestItem, PaginationMeta } from '@/types';

export interface LeaveRequestListResponse {
  items: LeaveRequestItem[];
  pagination: PaginationMeta;
}

export interface LeaveFilterParams {
  page?: number;
  per_page?: number;
  status?: string;
  type?: string;
  user_id?: number | string;
  start_date?: string;
  end_date?: string;
}

export const leaveApi = {
  async getLeaveRequests(params?: LeaveFilterParams): Promise<ApiResponse<LeaveRequestListResponse>> {
    const response = await apiClient.get<ApiResponse<LeaveRequestListResponse>>('/admin/leave', {
      params,
    });
    return response.data;
  },

  async getLeaveRequestDetail(id: number | string): Promise<ApiResponse<LeaveRequestItem>> {
    const response = await apiClient.get<ApiResponse<LeaveRequestItem>>(`/admin/leave/${id}`);
    return response.data;
  },

  async approveLeave(id: number | string, reviewNote?: string): Promise<ApiResponse<LeaveRequestItem>> {
    const response = await apiClient.post<ApiResponse<LeaveRequestItem>>(`/admin/leave/${id}/approve`, {
      review_note: reviewNote || null,
    });
    return response.data;
  },

  async rejectLeave(id: number | string, reviewNote: string): Promise<ApiResponse<LeaveRequestItem>> {
    const response = await apiClient.post<ApiResponse<LeaveRequestItem>>(`/admin/leave/${id}/reject`, {
      review_note: reviewNote,
    });
    return response.data;
  },
};
