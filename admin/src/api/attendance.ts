import { apiClient } from './client';
import type { ApiResponse, AttendanceItem, PaginationMeta } from '@/types';

export interface TodayAttendanceResponse {
  date: string;
  items: AttendanceItem[];
}

export interface AttendanceHistoryResponse {
  items: AttendanceItem[];
  pagination: PaginationMeta;
}

export interface AttendanceSummaryResponse {
  month: number;
  year: number;
  total_hadir: number;
  total_izin: number;
  total_record: number;
  active_employees: {
    dosen: number;
    tendik: number;
    total: number;
  };
}

export interface AttendanceHistoryFilterParams {
  page?: number;
  per_page?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  role?: string;
  unit?: string;
  status?: string;
  search?: string;
}

export const attendanceApi = {
  async getTodayAttendance(params?: { date?: string; role?: string; unit?: string; status?: string; search?: string }): Promise<ApiResponse<TodayAttendanceResponse>> {
    const response = await apiClient.get<ApiResponse<TodayAttendanceResponse>>('/admin/attendance/today', {
      params,
    });
    return response.data;
  },

  async getHistory(params?: AttendanceHistoryFilterParams): Promise<ApiResponse<AttendanceHistoryResponse>> {
    const response = await apiClient.get<ApiResponse<AttendanceHistoryResponse>>('/admin/attendance/history', {
      params,
    });
    return response.data;
  },

  async getSummary(params?: { month?: number; year?: number }): Promise<ApiResponse<AttendanceSummaryResponse>> {
    const response = await apiClient.get<ApiResponse<AttendanceSummaryResponse>>('/admin/attendance/summary', {
      params,
    });
    return response.data;
  },
};
