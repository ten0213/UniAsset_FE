import type { Goal } from '../../types/goal';

// 포맷팅 함수 (이 파일 안에서 선언)
function formatMoney(amount: number): string {
  if (!amount && amount !== 0) return '0원';
  const result = Math.round(amount).toLocaleString('ko-KR');
  return result + '원';
}

function calcProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  const percent = Math.round((currentAmount / targetAmount) * 100);
  if (percent > 100) {
    return 100;
  } else {
    return percent;
  }
}

export default function GoalOverview(props: any) {
  // props 가져오기
  const goals: Goal[] = props.goals;
  const totalAsset = props.totalAsset;
  const monthlyBalance = props.monthlyBalance;

  // 목표가 없으면 안보여줌
  if (goals.length === 0) return null;

  // 합계 계산
  let totalGoalTarget = 0;
  let totalGoalCurrent = 0;
  let totalMonthlySaving = 0;
  for (let i = 0; i < goals.length; i++) {
    totalGoalTarget = totalGoalTarget + goals[i].targetAmount;
    totalGoalCurrent = totalGoalCurrent + goals[i].currentAmount;
    totalMonthlySaving = totalMonthlySaving + goals[i].monthlySaving;
  }

  let goalRatio = 0;
  if (totalAsset > 0) {
    goalRatio = Math.round((totalGoalTarget / totalAsset) * 100);
  }

  // 월 저축이 잉여자금보다 많은지 체크하기
  const savingOverBalance = totalMonthlySaving > monthlyBalance && monthlyBalance >= 0;
  const overallProgress = calcProgress(totalGoalCurrent, totalGoalTarget);

  return (
    <div className="goal-overview-card">
      <h2>목표 종합 현황</h2>
      <div className="goal-overview-grid">
        <div className="goal-asset-item">
          <span className="goal-asset-label">목표 총액</span>
          <span className="goal-asset-value">{formatMoney(totalGoalTarget)}</span>
        </div>
        <div className="goal-asset-item">
          <span className="goal-asset-label">현재 저축 합계</span>
          <span className="goal-asset-value">{formatMoney(totalGoalCurrent)}</span>
        </div>
        <div className="goal-asset-item">
          <span className="goal-asset-label">월 저축 합계</span>
          <span className="goal-asset-value">{formatMoney(totalMonthlySaving)}</span>
        </div>
        <div className="goal-asset-item">
          <span className="goal-asset-label">자산 대비 목표 비중</span>
          <span className="goal-asset-value">{goalRatio}%</span>
        </div>
      </div>

      {savingOverBalance && (
        <div className="goal-warning">
          월 저축 합계({formatMoney(totalMonthlySaving)})가 월 잉여 자금({formatMoney(monthlyBalance)})을 초과합니다.
        </div>
      )}

      <div className="goal-overall-progress">
        <div className="goal-progress-text">
          <span>전체 달성률</span>
          <strong>{overallProgress}%</strong>
        </div>
        <div className="goal-progress-bar">
          <div className="goal-progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>
    </div>
  );
}
