import apiClient from './client';
import type { AuthResponse, LoginRequest, SignupRequest } from '../types/auth';

export const authApi = {
  login(data: LoginRequest) {
    return apiClient.post<AuthResponse>('/auth/login', data);
  },

  signup(data: SignupRequest) {
    return apiClient.post<AuthResponse>('/auth/signup', data);
  },

  logout() {
    return apiClient.post('/auth/logout');
  },
};
