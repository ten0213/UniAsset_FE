import { useState } from 'react';
import { goalApi } from '../../api/goal';

// 유틸리티 함수들 (이 파일 안에 선언)
function formatMoney(amount: number): string {
  if (amount == null) return '0원';
  return amount.toLocaleString('ko-KR') + '원';
}

function calcProgress(currentAmount: number, targetAmount: number): number {
  if (targetAmount <= 0) {
    return 0;
  }
  const pct = Math.round((currentAmount / targetAmount) * 100);
  if (pct > 100) return 100;
  return pct;
}

function calcEstimatedMonths(currentAmount: number, targetAmount: number, monthlySaving: number): number {
  const remain = targetAmount - currentAmount;
  if (remain <= 0) return 0;
  if (monthlySaving <= 0) return -1; // 달성 불가능
  return Math.ceil(remain / monthlySaving);
}

function formatEstimatedDate(months: number): string {
  if (months === 0) return '이미 달성';
  if (months < 0) return '저축액을 설정해주세요';
  const today = new Date();
  const targetDate = new Date(today.getFullYear(), today.getMonth() + months, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth() + 1;
  return year + '년 ' + month + '월 예상';
}

export default function GoalCard(props: any) {
  const goal = props.goal;
  const onRefresh = props.onRefresh;
  const onError = props.onError;

  const [isEditing, setIsEditing] = useState(false);
  const [editCurrent, setEditCurrent] = useState(String(goal.currentAmount));
  const [isUpdating, setIsUpdating] = useState(false);

  // 진행률 계산
  const progress = calcProgress(goal.currentAmount, goal.targetAmount);
  const estMonths = calcEstimatedMonths(goal.currentAmount, goal.targetAmount, goal.monthlySaving);
  const estDate = formatEstimatedDate(estMonths);

  // 저축액 업데이트
  const handleUpdateAmount = async () => {
    const newAmount = Number(editCurrent);
    if (isNaN(newAmount) || newAmount < 0) return;

    setIsUpdating(true);
    try {
      await goalApi.updateGoal(goal.id, { currentAmount: newAmount });
      setIsEditing(false);
      onRefresh();
    } catch (error) {
      onError('업데이트에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?') == false) return;

    try {
      await goalApi.deleteGoal(goal.id);
      onRefresh();
    } catch (error) {
      onError('삭제에 실패했습니다.');
    }
  };

  const startEdit = () => {
    setEditCurrent(String(goal.currentAmount));
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditCurrent(String(goal.currentAmount));
  };

  // 남은 금액 표시
  let remainText = '';
  if (goal.completed) {
    remainText = '목표를 달성했습니다!';
  } else {
    remainText = '남은 금액: ' + formatMoney(goal.targetAmount - goal.currentAmount);
  }

  return (
    <div className={`goal-card ${goal.completed ? 'goal-card-completed' : ''}`}>
      <div className="goal-card-header">
        <h3>{goal.title}</h3>
        <span className={`goal-badge ${goal.completed ? 'goal-badge-done' : 'goal-badge-progress'}`}>
          {goal.completed ? '달성 완료' : '진행 중'}
        </span>
      </div>

      <div className="goal-card-info">
        <div className="goal-info-item">
          <span className="goal-info-label">목표 금액</span>
          <span className="goal-info-value">{formatMoney(goal.targetAmount)}</span>
        </div>
        <div className="goal-info-item">
          <span className="goal-info-label">현재 저축액</span>
          <span className="goal-info-value">{formatMoney(goal.currentAmount)}</span>
        </div>
        <div className="goal-info-item">
          <span className="goal-info-label">월 저축액</span>
          <span className="goal-info-value">{formatMoney(goal.monthlySaving)}</span>
        </div>
        <div className="goal-info-item">
          <span className="goal-info-label">달성 예상일</span>
          <span className="goal-info-value">{estDate}</span>
        </div>
      </div>

      <div className="goal-progress-wrap">
        <div className="goal-progress-text">
          <span>진행률</span>
          <strong>{progress}%</strong>
        </div>
        <div className="goal-progress-bar">
          <div className="goal-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="goal-progress-remain">
          {remainText}
        </p>
      </div>

      {isEditing ? (
        <div className="goal-edit-form">
          <label>저축액 업데이트</label>
          <input
            type="number"
            min={0}
            value={editCurrent}
            onChange={(e) => setEditCurrent(e.target.value)}
          />
          <div className="goal-edit-btns">
            <button className="goal-btn goal-btn-primary" onClick={handleUpdateAmount} disabled={isUpdating}>
              {isUpdating ? '저장 중...' : '저장'}
            </button>
            <button className="goal-btn goal-btn-secondary" onClick={cancelEdit}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="goal-card-actions">
          <button className="goal-btn goal-btn-secondary" onClick={startEdit}>
            저축액 수정
          </button>
          <button className="goal-btn goal-btn-danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
