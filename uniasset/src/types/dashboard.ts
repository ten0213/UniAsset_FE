export interface AssetFormValues {
  cash: number;
  savings: number;
  investment: number;
  monthlyIncome: number;
  monthlyExpense: number;
}

export interface AssetChangeRecord {
  id: string;
  changedAt: string;
  previousTotal: number;
  nextTotal: number;
  delta: number;
}

export interface DashboardStorageState {
  values: AssetFormValues;
  history: AssetChangeRecord[];
}
