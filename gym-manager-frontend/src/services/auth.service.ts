import apiClient from '@/lib/api-client';
import type {
  LoginResponse,
  LoginRequest,
  RegisterRequest,
  MeResponse,
} from '@/types/auth.types';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/register', payload);
    return data;
  },

  async me(): Promise<MeResponse> {
    const { data } = await apiClient.get<MeResponse>('/auth/me');
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return data;
  },
};
