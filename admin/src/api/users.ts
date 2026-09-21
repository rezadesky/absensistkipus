import { apiClient } from './client';
import type { ApiResponse, PaginationMeta, User } from '@/types';

export interface UserListResponse {
  items: User[];
  pagination: PaginationMeta;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  status: 'active' | 'inactive';
  employee_number?: string;
  department?: string;
  position?: string;
  phone?: string;
}

export interface UserQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  unit?: string;
}

export const usersApi = {
  async getUsers(roleKey: 'dosen' | 'tendik' | 'pimpinan' | 'admins', params?: UserQueryParams): Promise<ApiResponse<UserListResponse>> {
    const response = await apiClient.get<ApiResponse<UserListResponse>>(`/admin/${roleKey}`, {
      params,
    });
    return response.data;
  },

  async getUser(roleKey: 'dosen' | 'tendik' | 'pimpinan' | 'admins', id: number | string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/${roleKey}/${id}`);
    return response.data;
  },

  async createUser(roleKey: 'dosen' | 'tendik' | 'pimpinan' | 'admins', data: UserFormData): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(`/admin/${roleKey}`, data);
    return response.data;
  },

  async updateUser(roleKey: 'dosen' | 'tendik' | 'pimpinan' | 'admins', id: number | string, data: Partial<UserFormData>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/${roleKey}/${id}`, data);
    return response.data;
  },

  async deleteUser(roleKey: 'dosen' | 'tendik' | 'pimpinan' | 'admins', id: number | string): Promise<ApiResponse<null>> {
    const response = await apiClient.delete<ApiResponse<null>>(`/admin/${roleKey}/${id}`);
    return response.data;
  },
};
