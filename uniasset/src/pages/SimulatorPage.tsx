import './SimulatorPage.css';

export default function SimulatorPage() {
  return (
    <div className="simulator-page">
      <h1>자산 성장 시뮬레이터</h1>
      <p className="simulator-description">사이드바 페이지 이동 테스트를 위한 구현 페이지입니다.</p>

      <div className="simulator-card">
        <h2>다음에 추가할 기능</h2>
        <ul>
          <li>초기 자산 입력</li>
          <li>월 투자 금액 입력</li>
          <li>예상 수익률 계산</li>
        </ul>
      </div>
    </div>
  );
}
