import { apiClient } from './client';
import type { ApiResponse, LeaveRequest, PaginationMeta } from '../types';

export interface LeadershipDashboardStats {
  total_dosen: number;
  total_tendik: number;
  hadir_hari_ini: number;
  belum_absen: number;
  izin: number;
}

export interface LeadershipAttendanceItem {
  id: string | number;
  attendance_id?: number | null;
  user_id: number;
  name: string;
  nip: string;
  role: string;
  unit: string;
  position?: string;
  attendance_date: string;
  check_in_time?: string | null;
  check_in?: string | null;
  status: string;
  notes?: string | null;
}

export interface LeadershipDashboardResult {
  stats: LeadershipDashboardStats;
  date: string;
  attendance_today: LeadershipAttendanceItem[];
}

export interface LeadershipAttendanceHistoryResult {
  items: LeadershipAttendanceItem[];
  pagination: PaginationMeta;
}

export interface LeadershipSummaryResult {
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

export interface LeadershipLeaveListResult {
  items: LeaveRequest[];
  pagination: PaginationMeta;
}

export interface LeadershipAttendanceFilterParams {
  page?: number;
  per_page?: number;
  date?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  role?: string;
  unit?: string;
  search?: string;
}

export interface LeadershipLeaveFilterParams {
  page?: number;
  per_page?: number;
  status?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}

export const leadershipApi = {
  // 1. Dashboard Analytics
  async getDashboard(params?: { date?: string; role?: string; status?: string; search?: string }): Promise<ApiResponse<LeadershipDashboardResult>> {
    const response = await apiClient.get<ApiResponse<LeadershipDashboardResult>>('/leadership/dashboard', { params });
    return response.data;
  },

  // 2. Real-time Today Attendance
  async getTodayAttendance(params?: { date?: string; role?: string; status?: string; unit?: string }): Promise<ApiResponse<{ date: string; items: LeadershipAttendanceItem[] }>> {
    const response = await apiClient.get<ApiResponse<{ date: string; items: LeadershipAttendanceItem[] }>>('/leadership/attendance/today', { params });
    return response.data;
  },

  // 3. Paginated Attendance History
  async getAttendanceHistory(params?: LeadershipAttendanceFilterParams): Promise<ApiResponse<LeadershipAttendanceHistoryResult>> {
    const response = await apiClient.get<ApiResponse<LeadershipAttendanceHistoryResult>>('/leadership/attendance/history', { params });
    return response.data;
  },

  // 4. Monthly Attendance Statistical Summary / Report
  async getAttendanceSummary(month?: number, year?: number): Promise<ApiResponse<LeadershipSummaryResult>> {
    const response = await apiClient.get<ApiResponse<LeadershipSummaryResult>>('/leadership/attendance/summary', {
      params: { month, year },
    });
    return response.data;
  },

  // 5. Leave Requests Monitoring (Read-Only)
  async getLeaves(params?: LeadershipLeaveFilterParams): Promise<ApiResponse<LeadershipLeaveListResult>> {
    const response = await apiClient.get<ApiResponse<LeadershipLeaveListResult>>('/leadership/leave', { params });
    return response.data;
  },

  // 6. Leave Request Detail
  async getLeaveDetail(id: number): Promise<ApiResponse<LeaveRequest>> {
    const response = await apiClient.get<ApiResponse<LeaveRequest>>(`/leadership/leave/${id}`);
    return response.data;
  },
};
