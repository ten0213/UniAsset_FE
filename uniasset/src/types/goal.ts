export interface Goal {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlySaving: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalCreateRequest {
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlySaving: number;
}

export interface GoalUpdateRequest {
  title?: string;
  targetAmount?: number;
  currentAmount?: number;
  monthlySaving?: number;
}
