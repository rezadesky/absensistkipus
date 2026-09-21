import { apiClient } from './client';
import type { ApiResponse, User } from '@/types';

export interface LoginResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(email: string, password: string):Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/login', {
      email,
      password,
    });
    return response.data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>('/me');
    return response.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const response = await apiClient.post<ApiResponse<null>>('/logout');
    return response.data;
  },
};
