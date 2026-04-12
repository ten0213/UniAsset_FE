import apiClient from './client';
import type { AssetFormValues, DashboardStorageState } from '../types/dashboard';

export const dashboardApi = {
  getState() {
    return apiClient.get<DashboardStorageState>('/dashboard');
  },

  saveState(values: AssetFormValues) {
    return apiClient.put<DashboardStorageState>('/dashboard', values);
  },
};
