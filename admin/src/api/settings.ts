import { apiClient } from './client';
import type { ApiResponse, HolidayConfig, WorkDayConfig } from '@/types';

export const settingsApi = {
  async getWorkDays(): Promise<ApiResponse<WorkDayConfig[]>> {
    const response = await apiClient.get<ApiResponse<WorkDayConfig[]>>('/admin/work-days');
    return response.data;
  },

  async updateWorkDays(days: { id: number; is_active: boolean }[]): Promise<ApiResponse<WorkDayConfig[]>> {
    const response = await apiClient.put<ApiResponse<WorkDayConfig[]>>('/admin/work-days', {
      days,
    });
    return response.data;
  },

  async getHolidays(year?: number): Promise<ApiResponse<HolidayConfig[]>> {
    const response = await apiClient.get<ApiResponse<HolidayConfig[]>>('/admin/holidays', {
      params: { year },
    });
    return response.data;
  },

  async createHoliday(data: { date: string; name: string; description?: string }): Promise<ApiResponse<HolidayConfig>> {
    const response = await apiClient.post<ApiResponse<HolidayConfig>>('/admin/holidays', data);
    return response.data;
  },

  async deleteHoliday(id: number): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/holidays/${id}`);
    return response.data;
  },
};
