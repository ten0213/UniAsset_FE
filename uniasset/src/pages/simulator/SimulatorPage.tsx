import { useEffect, useState } from 'react';
import { goalApi } from '../../api/goal';
import { dashboardApi } from '../../api/dashboard';
import type { Goal } from '../../types/goal';
import type { AssetFormValues } from '../../types/dashboard';
import SimQuickInput from './SimQuickInput';
import SimulatorForm from './SimulatorForm';
import SimResult from './SimResult';
import SimGoalInfo from './SimGoalInfo';
import './SimulatorPage.css';

// SimulatorPage 타입 설정
type SimResultData = {
  final: number;
  invested: number;
  profit: number;
  list: Array<{
    year: number;
    amount: number;
  }>;
};


export default function SimulatorPage() {
  const [start, setStart] = useState('');
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');

  const [result, setResult] = useState<SimResultData | null>(null);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('');

  const [dashData, setDashData] = useState<AssetFormValues | null>(null);

  useEffect(() => {
    loadGoals();
    loadDash();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await goalApi.getGoals();
      setGoals(res.data);
    } catch (err) {
      console.log('목표를 못 불러왔어요', err);
    }
  };

  const loadDash = async () => {
    try {
      const res = await dashboardApi.getState();
      setDashData(res.data.values);
    } catch (err) { // 에러처리
      console.log('대시보드를 못 불러왔어요', err);
    }
  };

  const handleGoalSelect = (e: any) => {
    const goalId = e.target.value;
    setSelectedGoal(goalId);

    if (goalId) {
      const goal = goals.find(g => g.id === Number(goalId));
      if (goal) {
        setStart(String(goal.currentAmount));
        setMonthly(String(goal.monthlySaving));
      }
    }
  };

  // 데시보드에서의 연동기능 처리
  const fillFromDashboard = () => {
    if (dashData) {
      const total = dashData.cash + dashData.savings + dashData.investment;
      const balance = dashData.monthlyIncome - dashData.monthlyExpense;
      setStart(String(total));
      setMonthly(String(balance));
    }
  };

  const handleCalc = () => {
    const s = Number(start);
    const m = Number(monthly);
    const r = Number(rate);
    const y = Number(years);

    // 값이 이상한 경우 처리
    if (!s || s < 0 || !m || m < 0 || !r || !y || y <= 0) {
      alert('값을 제대로 입력해주세요!');
      return;
    }

    const monthRate = r / 100 / 12;
    const months = y * 12;

    let total = s;
    const list: Array<{ year: number; amount: number }> = [];

    for (let i = 1; i <= y; i++) {
      for (let j = 1; j <= 12; j++) {
        total = total * (1 + monthRate) + m;
      }
      list.push({
        year: i,
        amount: total
      });
    }

    const totalInvested = s + (m * months);
    const profit = total - totalInvested;

    setResult({
      final: total,
      invested: totalInvested,
      profit: profit,
      list: list
    });
  };

  const handleReset = () => {
    setStart('');
    setMonthly('');
    setRate('5');
    setYears('10');
    setResult(null);
    setSelectedGoal('');
  };

  const selectedGoalData = selectedGoal
    ? goals.find(g => g.id === Number(selectedGoal)) || null
    : null;

  // 지금까지의 다른 파일에서의 구현을 props로 가져오기 적용(SimQuickInput, SimulatorForm, SimGoalInfo)
  return (
    <div className="simulator-page">
      <h1>자산 성장 시뮬레이터</h1>
      <p className="simulator-description">
        투자 계획을 세우고 미래 자산을 예측해보세요
      </p>


      <SimQuickInput
        goals={goals}
        selectedGoal={selectedGoal}
        onSelectGoal={handleGoalSelect}
        hasDashData={dashData !== null}
        onFillDashboard={fillFromDashboard}
      />

      <SimulatorForm
        start={start}
        monthly={monthly}
        rate={rate}
        years={years}
        onStartChange={(e: any) => setStart(e.target.value)}
        onMonthlyChange={(e: any) => setMonthly(e.target.value)}
        onRateChange={(e: any) => setRate(e.target.value)}
        onYearsChange={(e: any) => setYears(e.target.value)}
        onCalc={handleCalc}
        onReset={handleReset}
      />

      <SimResult result={result} />

      <SimGoalInfo
        goal={selectedGoalData}
        result={result}
        years={years}
      />
    </div>
  );
}
