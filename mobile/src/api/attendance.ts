import { apiClient } from './client';
import type { ApiResponse, AttendanceRecord, PaginationMeta, TodayAttendanceInfo } from '../types';

export interface AttendanceHistoryResult {
  items: AttendanceRecord[];
  pagination: PaginationMeta;
}

export const attendanceApi = {
  async getTodayAttendance(): Promise<ApiResponse<TodayAttendanceInfo>> {
    const response = await apiClient.get<ApiResponse<TodayAttendanceInfo>>('/attendance/today');
    return response.data;
  },

  async checkIn(): Promise<ApiResponse<AttendanceRecord>> {
    const response = await apiClient.post<ApiResponse<AttendanceRecord>>('/attendance/check-in');
    return response.data;
  },

  async getHistory(page = 1, perPage = 15, month?: number, year?: number): Promise<ApiResponse<AttendanceHistoryResult>> {
    const response = await apiClient.get<ApiResponse<AttendanceHistoryResult>>('/attendance/history', {
      params: {
        page,
        per_page: perPage,
        month,
        year,
      },
    });
    return response.data;
  },
};
