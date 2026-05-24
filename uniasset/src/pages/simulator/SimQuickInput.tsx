import type { Goal } from '../../types/goal';

// 돈의 단위 맞추는 함수(다른 파일에도 포함되나 내용이 다름)
function formatMoney(amount: number): string {
  if (amount == null) return "0원";
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

// 시뮬레이터를 진행할때 빠르게 데이터를 가져오는 기능
export default function SimQuickInput(props: any) {
  const goals: Goal[] = props.goals;
  const selectedGoal = props.selectedGoal;
  const onSelectGoal = props.onSelectGoal;
  const hasDashData = props.hasDashData;
  const onFillDashboard = props.onFillDashboard;

  if (goals.length === 0 && !hasDashData) {
    return null;
  }

  return (
    <div className="sim-card">
      <h2>빠른 입력</h2>
      <div className="sim-quick-btns">
        {goals.length > 0 && (
          <div className="sim-input-group">
            <label>투자 목표에서 가져오기</label>
            <select value={selectedGoal} onChange={onSelectGoal}>
              <option value="">선택해주세요</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>
                  {g.title} (목표: {formatMoney(g.targetAmount)})
                </option>
              ))}
            </select>
          </div>
        )}

        {hasDashData && (
          <button className="sim-btn-dash" onClick={onFillDashboard}>
            대시보드 데이터로 채우기
          </button>
        )}
      </div>
    </div>
  );
}
