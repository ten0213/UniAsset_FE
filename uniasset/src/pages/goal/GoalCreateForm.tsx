import { useState } from 'react';
import type { FormEvent } from 'react';

// 돈 포맷
function formatMoney(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('ko-KR');
  return formatted + '원';
}

export default function GoalCreateForm(props: any) {
  const monthlyBalance = props.monthlyBalance;
  const isAssetLoaded = props.isAssetLoaded;
  const onSubmit = props.onSubmit;
  const onCancel = props.onCancel;

  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [monthly, setMonthly] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 폼 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 유효성 검사
    if (!title.trim()) {
      setErrorMsg('목표 이름을 입력해주세요.');
      return;
    }

    const targetNum = Number(target);
    const currentNum = Number(current);
    const monthlyNum = Number(monthly);

    if (!targetNum || targetNum <= 0) {
      setErrorMsg('목표 금액을 올바르게 입력해주세요.');
      return;
    }
    if (currentNum < 0 || isNaN(currentNum)) {
      setErrorMsg('현재 저축액을 올바르게 입력해주세요.');
      return;
    }
    if (monthlyNum < 0 || isNaN(monthlyNum)) {
      setErrorMsg('월 저축액을 올바르게 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        targetAmount: targetNum,
        currentAmount: currentNum,
        monthlySaving: monthlyNum,
      });
    } catch (err) {
      setErrorMsg('목표 생성에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 월 잉여자금 제안
  const fillSuggestedMonthly = () => {
    if (isAssetLoaded && monthlyBalance > 0) {
      setMonthly(String(monthlyBalance));
    }
  };

  return (
    <div className="goal-form-card">
      <h2>새 목표 만들기</h2>
      {isAssetLoaded && monthlyBalance > 0 && (
        <p className="goal-form-hint">
          대시보드 기준 월 잉여 자금: <strong>{formatMoney(monthlyBalance)}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="goal-form-group">
          <label>목표 이름</label>
          <input
            type="text"
            placeholder="예: 노트북 구매 자금"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="goal-form-row">
          <div className="goal-form-group">
            <label>목표 금액 (원)</label>
            <input
              type="number"
              min={1}
              placeholder="예: 1500000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="goal-form-group">
            <label>현재 저축액 (원)</label>
            <input
              type="number"
              min={0}
              placeholder="예: 300000"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
        </div>
        <div className="goal-form-group">
          <label>월 저축액 (원)</label>
          <div className="goal-form-input-row">
            <input
              type="number"
              min={0}
              placeholder="예: 100000"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
            />
            {isAssetLoaded && monthlyBalance > 0 && (
              <button type="button" className="goal-btn goal-btn-suggest" onClick={fillSuggestedMonthly}>
                월 잉여 자금으로 채우기
              </button>
            )}
          </div>
        </div>
        {errorMsg && <div className="goal-form-error">{errorMsg}</div>}
        <div className="goal-edit-btns">
          <button className="goal-btn goal-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? '저장 중...' : '목표 만들기'}
          </button>
          <button className="goal-btn goal-btn-secondary" type="button" onClick={onCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
