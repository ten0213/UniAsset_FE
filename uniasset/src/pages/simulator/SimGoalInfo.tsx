import type { Goal } from '../../types/goal';

// 돈의 단위를 맞추는 함수(다른 파일에도 포함되나 내용이 다름)
function formatMoney(amount: number): string {
  if (amount == null) return '0원';
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}


export default function SimGoalInfo(props: any) {
  const goal: Goal | null = props.goal;
  const result = props.result;
  const years = props.years;

  if (!goal) {
    return null;
  }

  // 목표 달성 여부 체크
  let compareContent = null;
  if (result) {
    if (result.final >= goal.targetAmount) {
      compareContent = (
        <p className="sim-goal-success">
          {years}년 후 목표 달성 가능합니다!
        </p>
      );
    } else {
      const diff = goal.targetAmount - result.final;
      compareContent = (
        <p className="sim-goal-fail">
          {years}으로는 목표 달성이 어렵습니다.
          ({formatMoney(diff)} 부족)
        </p>
      );
    }
  }

  return (
    <div className="sim-card sim-goal-info">
      <h3>선택한 목표</h3>
      <div className="sim-goal-detail">
        <p><strong>{goal.title}</strong></p>
        <p>목표 금액: {formatMoney(goal.targetAmount)}</p>
        <p>현재 저축: {formatMoney(goal.currentAmount)}</p>
        <p>월 저축액: {formatMoney(goal.monthlySaving)}</p>

        {result && (
          <div className="sim-goal-compare">
            {compareContent}
          </div>
        )}
      </div>
    </div>
  );
}
