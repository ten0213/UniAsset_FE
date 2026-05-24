// 시뮬레이터의 기능을 이후에 적용시킬 props를 중심으로 함수 제작
export default function SimulatorForm(props: any) {
  const start = props.start;
  const monthly = props.monthly;
  const rate = props.rate;
  const years = props.years;
  const onStartChange = props.onStartChange;
  const onMonthlyChange = props.onMonthlyChange;
  const onRateChange = props.onRateChange;
  const onYearsChange = props.onYearsChange;
  const onCalc = props.onCalc;
  const onReset = props.onReset;

  return (
    <div className="sim-card">
      <h2>투자 정보 입력</h2>

      <div className="sim-input-group">
        <label>초기 자산 (원)</label>
        <input
          type="number"
          value={start}
          onChange={onStartChange}
          placeholder="예: 1000000"
        />
      </div>

      <div className="sim-input-group">
        <label>월 투자 금액 (원)</label>
        <input
          type="number"
          value={monthly}
          onChange={onMonthlyChange}
          placeholder="예: 300000"
        />
      </div>

      <div className="sim-row">
        <div className="sim-input-group">
          <label>연 수익률 (%)</label>
          <input
            type="number"
            value={rate}
            onChange={onRateChange}
            placeholder="예: 5"
          />
        </div>

        <div className="sim-input-group">
          <label>투자 기간 (년)</label>
          <input
            type="number"
            value={years}
            onChange={onYearsChange}
            placeholder="예: 10"
          />
        </div>
      </div>

      <div className="sim-btn-group">
        <button className="sim-btn-calc" onClick={onCalc}>
          계산하기
        </button>
        <button className="sim-btn-reset" onClick={onReset}>
          초기화
        </button>
      </div>
    </div>
  );
}
