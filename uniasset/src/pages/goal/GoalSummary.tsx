import type { AssetFormValues } from '../../types/dashboard';

// 돈 포맷팅 함수 (각 파일에 있음)
function formatMoney(amount: number): string {
  if (amount == null) return '0원';
  return amount.toLocaleString('ko-KR') + '원';
}

export default function GoalSummary(props: any) {
  // 구조분해할당
  const assetValues: AssetFormValues = props.assetValues;
  const totalAsset = props.totalAsset;
  const monthlyBalance = props.monthlyBalance;

  return (
    <div className="goal-asset-card">
      <h2>내 자산 현황 (대시보드 연동)</h2>
      <div className="goal-asset-grid">
        <div className="goal-asset-item">
          <span className="goal-asset-label">총 자산</span>
          <span className="goal-asset-value">{formatMoney(totalAsset)}</span>
        </div>
        <div className="goal-asset-item">
          <span className="goal-asset-label">월 수입</span>
          <span className="goal-asset-value">{formatMoney(assetValues.monthlyIncome)}</span>
        </div>
        <div className="goal-asset-item">
          <span className="goal-asset-label">월 지출</span>
          <span className="goal-asset-value">{formatMoney(assetValues.monthlyExpense)}</span>
        </div>
        <div className="goal-asset-item">
          <span className="goal-asset-label">월 잉여 자금</span>
          <span className={`goal-asset-value ${monthlyBalance >= 0 ? 'goal-asset-positive' : 'goal-asset-negative'}`}>
            {formatMoney(monthlyBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
