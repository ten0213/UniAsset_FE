import './GoalPage.css';

export default function GoalPage() {
  return (
    <div className="goal-page">
      <h1>투자 목표 관리</h1>
      <p className="goal-description">사이드바 페이지 이동 테스트를 위한 구현 페이지입니다.</p>

      <div className="goal-card">
        <h2>다음에 추가할 기능</h2>
        <ul>
          <li>목표 이름 입력</li>
          <li>목표 금액 입력</li>
          <li>달성 진행률 표시</li>
        </ul>
      </div>
    </div>
  );
}
