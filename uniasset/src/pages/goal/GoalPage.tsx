import { useEffect, useState } from 'react';
import { goalApi } from '../../api/goal';
import { dashboardApi } from '../../api/dashboard';
import type { Goal } from '../../types/goal';
import GoalSummary from './GoalSummary';
import GoalOverview from './GoalOverview';
import GoalCreateForm from './GoalCreateForm';
import GoalCard from './GoalCard';
import './GoalPage.css';

export default function GoalPage() {
  // 상태 관리
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assetValues, setAssetValues] = useState<any>({
    cash: 0,
    savings: 0,
    investment: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
  });
  const [isAssetLoaded, setIsAssetLoaded] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);

  // 목표 불러오기
  const loadGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await goalApi.getGoals();
      setGoals(res.data);
    } catch {
      setError('목표를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 대시보드 데이터 불러오기
  const loadDashboard = async () => {
    try {
      const res = await dashboardApi.getState();
      setAssetValues(res.data.values);
      setIsAssetLoaded(true);
    } catch {
      setIsAssetLoaded(false);
    }
  };

  useEffect(() => {
    loadGoals();
    loadDashboard();
  }, []);

  // 자산 합계 계산
  const totalAsset = assetValues.cash + assetValues.savings + assetValues.investment;
  const monthlyBalance = assetValues.monthlyIncome - assetValues.monthlyExpense;

  // 목표 생성
  const handleCreateGoal = async (data: any) => {
    await goalApi.createGoal(data);
    setIsFormOpen(false);
    await loadGoals();
  };

  // 에러 핸들러
  const handleError = (msg: string) => {
    setError(msg);
  };

  return (
    <div className="goal-page">
      <div className="goal-header">
        <h1>투자 목표 관리</h1>
        <p className="goal-description">
          재무 목표를 설정하고 달성 진행 상황을 추적하세요.
        </p>
      </div>

      {error && <div className="goal-error">{error}</div>}

      {isAssetLoaded && (
        <div className="goal-asset-summary">
          <GoalSummary
            assetValues={assetValues}
            totalAsset={totalAsset}
            monthlyBalance={monthlyBalance}
          />
          <GoalOverview
            goals={goals}
            totalAsset={totalAsset}
            monthlyBalance={monthlyBalance}
          />
        </div>
      )}

      <div className="goal-toolbar">
        <button
          className="goal-btn goal-btn-primary"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? '취소' : '+ 새 목표 추가'}
        </button>
      </div>

      {isFormOpen && (
        <GoalCreateForm
          monthlyBalance={monthlyBalance}
          isAssetLoaded={isAssetLoaded}
          onSubmit={handleCreateGoal}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isLoading && <p className="goal-loading">목표를 불러오는 중...</p>}

      {!isLoading && goals.length === 0 && (
        <div className="goal-empty">
          <p>아직 설정한 목표가 없습니다.</p>
          <p>새 목표를 추가해보세요!</p>
        </div>
      )}

      <div className="goal-list">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onRefresh={loadGoals}
            onError={handleError}
          />
        ))}
      </div>
    </div>
  );
}
