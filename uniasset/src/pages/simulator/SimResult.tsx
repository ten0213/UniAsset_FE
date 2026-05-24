type SimResultData = {
  final: number;
  invested: number;
  profit: number;
  list: Array<{
    year: number;
    amount: number;
  }>;
};

// 돈의 단위를 맞추는 함수(다른 파일에도 포함되나 내용이 다름)
function formatMoney(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원';
}

// 시뮬레이터 결과
export default function SimResult(props: any) {
  const result: SimResultData | null = props.result;

  if (!result) {
    return null;
  }

  return (
    <div className="sim-card">
      <h2>시뮬레이션 결과</h2>

      <div className="sim-result-box">
        <div className="sim-result-item">
          <span className="sim-result-label">최종 자산</span>
          <span className="sim-result-value big">{formatMoney(result.final)}</span>
        </div>

        <div className="sim-result-row">
          <div className="sim-result-item">
            <span className="sim-result-label">총 투자금</span>
            <span className="sim-result-value">{formatMoney(result.invested)}</span>
          </div>
          <div className="sim-result-item">
            <span className="sim-result-label">수익금</span>
            <span className="sim-result-value profit">{formatMoney(result.profit)}</span>
          </div>
        </div>
      </div>

      <div className="sim-table-wrap">
        <h3>연도별 자산 성장</h3>
        <table className="sim-table">
          <thead>
            <tr>
              <th>연도</th>
              <th>예상 자산</th>
            </tr>
          </thead>
          <tbody>
            {result.list.map((item) => (
              <tr key={item.year}>
                <td>{item.year}년차</td>
                <td>{formatMoney(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
