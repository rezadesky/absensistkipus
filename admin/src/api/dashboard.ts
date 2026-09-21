import { apiClient } from './client';
import type { ApiResponse, AttendanceItem } from '@/types';

export interface DashboardApiResponse {
  stats: {
    total_dosen: number;
    total_tendik: number;
    hadir_hari_ini: number;
    belum_absen: number;
    izin: number;
  };
  date: string;
  attendance_today: AttendanceItem[];
}

export interface DashboardFilterParams {
  date?: string;
  role?: string;
  unit?: string;
  status?: string;
  search?: string;
}

export const dashboardApi = {
  async getDashboard(params?: DashboardFilterParams): Promise<ApiResponse<DashboardApiResponse>> {
    const response = await apiClient.get<ApiResponse<DashboardApiResponse>>('/admin/dashboard', {
      params,
    });
    return response.data;
  },
};
