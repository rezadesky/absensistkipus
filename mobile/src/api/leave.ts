import { apiClient } from './client';
import type { ApiResponse, LeaveRequest, PaginationMeta } from '../types';

export interface LeaveListResult {
  items: LeaveRequest[];
  pagination: PaginationMeta;
}

export interface CreateLeavePayload {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  attachmentFile?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

export const leaveApi = {
  // Staff (Dosen / Tendik) Leave Requests
  async getMyLeaves(page = 1, perPage = 10, status?: string): Promise<ApiResponse<LeaveListResult>> {
    const response = await apiClient.get<ApiResponse<LeaveListResult>>('/leave', {
      params: {
        page,
        per_page: perPage,
        status: status && status !== 'all' ? status : undefined,
      },
    });
    return response.data;
  },

  async getLeaveDetail(id: number): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.get<ApiResponse<LeaveRequest>>(`/leave/${id}`);
    return response.data;
  },

  async createLeave(payload: CreateLeavePayload): Promise<ApiResponse<LeaveRequest>> {
    if (payload.attachmentFile) {
      const formData = new FormData();
      formData.append('type', payload.type);
      formData.append('start_date', payload.start_date);
      formData.append('end_date', payload.end_date);
      formData.append('reason', payload.reason);
      formData.append('attachment', {
        uri: payload.attachmentFile.uri,
        name: payload.attachmentFile.name,
        type: payload.attachmentFile.type,
      } as any);

      const response = await apiClient.post<ApiResponse<LeaveRequest>>('/leave', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }

    const response = await apiClient.post<ApiResponse<LeaveRequest>>('/leave', {
      type: payload.type,
      start_date: payload.start_date,
      end_date: payload.end_date,
      reason: payload.reason,
    });
    return response.data;
  },

  // Leadership (Pimpinan) Monitoring
  async getLeadershipLeaves(page = 1, perPage = 10, status?: string): Promise<ApiResponse<LeaveListResult>> {
    const response = await apiClient.get<ApiResponse<LeaveListResult>>('/leadership/leave', {
      params: {
        page,
        per_page: perPage,
        status: status && status !== 'all' ? status : undefined,
      },
    });
    return response.data;
  },

  async getLeadershipLeaveDetail(id: number): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.get<ApiResponse<LeaveRequest>>(`/leadership/leave/${id}`);
    return response.data;
  },
};
