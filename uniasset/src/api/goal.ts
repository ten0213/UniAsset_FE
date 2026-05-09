import apiClient from './client';
import type { Goal, GoalCreateRequest, GoalUpdateRequest } from '../types/goal';

export const goalApi = {
  getGoals() {
    return apiClient.get<Goal[]>('/goals');
  },

  createGoal(data: GoalCreateRequest) {
    return apiClient.post<Goal>('/goals', data);
  },

  updateGoal(goalId: number, data: GoalUpdateRequest) {
    return apiClient.put<Goal>(`/goals/${goalId}`, data);
  },

  deleteGoal(goalId: number) {
    return apiClient.delete(`/goals/${goalId}`);
  },
};
