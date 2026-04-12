import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/dashboard';
import { useAuthStore } from '../../store/useAuthStore';
import type {
  AssetChangeRecord,
  AssetFormValues,
  DashboardStorageState,
} from '../../types/dashboard';
import './DashboardPage.css';

const MAX_HISTORY_COUNT = 8;

const DEFAULT_VALUES: AssetFormValues = {
  cash: 0,
  savings: 0,
  investment: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
};

const DEFAULT_STATE: DashboardStorageState = {
  values: DEFAULT_VALUES,
  history: [],
};

type DraftAssetFormValues = Record<keyof AssetFormValues, string>;

const EMPTY_DRAFT_VALUES: DraftAssetFormValues = {
  cash: '',
  savings: '',
  investment: '',
  monthlyIncome: '',
  monthlyExpense: '',
};

const LEGACY_BOOTSTRAP_VALUES: AssetFormValues = {
  cash: 300000,
  savings: 1200000,
  investment: 800000,
  monthlyIncome: 700000,
  monthlyExpense: 450000,
};

const INPUT_FIELDS: Array<{
  key: keyof AssetFormValues;
  label: string;
  description: string;
}> = [
  {
    key: 'cash',
    label: '현금 자산',
    description: '지갑/체크카드 등 바로 사용 가능한 금액',
  },
  {
    key: 'savings',
    label: '예금·저축',
    description: '입출금/적금/예금 계좌에 보관 중인 금액',
  },
  {
    key: 'investment',
    label: '투자 자산',
    description: '주식, ETF, 펀드 등 투자금 총합',
  },
  {
    key: 'monthlyIncome',
    label: '월 수입',
    description: '용돈, 아르바이트, 기타 수입',
  },
  {
    key: 'monthlyExpense',
    label: '월 지출',
    description: '생활비, 교통비, 문화비 등 월 지출',
  },
];

const ASSET_COLORS = {
  cash: '#6366f1',
  savings: '#06b6d4',
  investment: '#f59e0b',
} as const;

const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('ko-KR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const formatCurrency = (value: number): string => currencyFormatter.format(value);
const formatPercent = (value: number): string => percentFormatter.format(value);

const calculateTotalAsset = (values: AssetFormValues): number =>
  values.cash + values.savings + values.investment;

const isLegacyBootstrapValues = (values: AssetFormValues): boolean =>
  values.cash === LEGACY_BOOTSTRAP_VALUES.cash &&
  values.savings === LEGACY_BOOTSTRAP_VALUES.savings &&
  values.investment === LEGACY_BOOTSTRAP_VALUES.investment &&
  values.monthlyIncome === LEGACY_BOOTSTRAP_VALUES.monthlyIncome &&
  values.monthlyExpense === LEGACY_BOOTSTRAP_VALUES.monthlyExpense;

const hasInitializedDashboardData = (values: AssetFormValues, history: AssetChangeRecord[]): boolean => {
  if (history.length === 0 && isLegacyBootstrapValues(values)) {
    return false;
  }

  return history.length > 0 || Object.values(values).some((value) => value > 0);
};

const toDraftValues = (
  values: AssetFormValues,
  options?: { hideZero?: boolean },
): DraftAssetFormValues => {
  const hideZero = options?.hideZero ?? false;
  const transform = (value: number): string => (hideZero && value === 0 ? '' : String(value));

  return {
    cash: transform(values.cash),
    savings: transform(values.savings),
    investment: transform(values.investment),
    monthlyIncome: transform(values.monthlyIncome),
    monthlyExpense: transform(values.monthlyExpense),
  };
};

const parseDraftValues = (draftValues: DraftAssetFormValues): AssetFormValues => ({
  cash: Number(draftValues.cash),
  savings: Number(draftValues.savings),
  investment: Number(draftValues.investment),
  monthlyIncome: Number(draftValues.monthlyIncome),
  monthlyExpense: Number(draftValues.monthlyExpense),
});

const isNonNegativeNumber = (value: number): boolean => Number.isFinite(value) && value >= 0;

const isAssetFormValues = (value: unknown): value is AssetFormValues => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.cash === 'number' &&
    isNonNegativeNumber(candidate.cash) &&
    typeof candidate.savings === 'number' &&
    isNonNegativeNumber(candidate.savings) &&
    typeof candidate.investment === 'number' &&
    isNonNegativeNumber(candidate.investment) &&
    typeof candidate.monthlyIncome === 'number' &&
    isNonNegativeNumber(candidate.monthlyIncome) &&
    typeof candidate.monthlyExpense === 'number' &&
    isNonNegativeNumber(candidate.monthlyExpense)
  );
};

const isAssetChangeRecord = (value: unknown): value is AssetChangeRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.changedAt === 'string' &&
    typeof candidate.previousTotal === 'number' &&
    Number.isFinite(candidate.previousTotal) &&
    typeof candidate.nextTotal === 'number' &&
    Number.isFinite(candidate.nextTotal) &&
    typeof candidate.delta === 'number' &&
    Number.isFinite(candidate.delta)
  );
};

const sanitizeDashboardState = (value: unknown): DashboardStorageState => {
  if (typeof value !== 'object' || value === null) {
    return DEFAULT_STATE;
  }

  const candidate = value as Partial<DashboardStorageState>;

  const values = isAssetFormValues(candidate.values) ? candidate.values : DEFAULT_VALUES;

  const history = Array.isArray(candidate.history)
    ? candidate.history.filter(isAssetChangeRecord).slice(0, MAX_HISTORY_COUNT)
    : [];

  return {
    values,
    history,
  };
};

const getDashboardErrorMessage = (error: unknown, fallbackMessage: string): string => {
  const axiosError = error as AxiosError<{ message?: string }>;
  const status = axiosError.response?.status;
  const serverMessage = axiosError.response?.data?.message;

  if (status === 400) {
    return '입력 정보를 확인해주세요.';
  }

  if (status === 401) {
    return '로그인이 만료되었습니다. 다시 로그인해주세요.';
  }

  if (status === 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (typeof serverMessage === 'string' && serverMessage.trim().length > 0) {
    return serverMessage;
  }

  if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('Network Error')) {
    return '네트워크 연결을 확인해주세요.';
  }

  return fallbackMessage;
};

const formatDateTime = (isoDate: string): string => {
  const parsedDate = new Date(isoDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
};

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [savedValues, setSavedValues] = useState<AssetFormValues>({ ...DEFAULT_VALUES });
  const [draftValues, setDraftValues] = useState<DraftAssetFormValues>({ ...EMPTY_DRAFT_VALUES });
  const [history, setHistory] = useState<AssetChangeRecord[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardState = async (): Promise<void> => {
      setIsPageLoading(true);
      setFormError(null);

      try {
        const { data } = await dashboardApi.getState();
        const normalizedState = sanitizeDashboardState(data);

        if (!isMounted) {
          return;
        }

        const isInitialized = hasInitializedDashboardData(normalizedState.values, normalizedState.history);

        setSavedValues({ ...normalizedState.values });
        setDraftValues(
          isInitialized ? toDraftValues(normalizedState.values) : { ...EMPTY_DRAFT_VALUES },
        );
        setHistory([...normalizedState.history]);
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        setFormError(getDashboardErrorMessage(error, '대시보드 정보를 불러오지 못했습니다.'));
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    void loadDashboardState();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAsset = calculateTotalAsset(savedValues);
  const monthlyBalance = savedValues.monthlyIncome - savedValues.monthlyExpense;
  const monthlySavingRate =
    savedValues.monthlyIncome === 0 ? 0 : (monthlyBalance / savedValues.monthlyIncome) * 100;
  const isDashboardInitialized = useMemo(
    () => hasInitializedDashboardData(savedValues, history),
    [savedValues, history],
  );

  const displayCurrency = (value: number): string =>
    isDashboardInitialized ? formatCurrency(value) : '-';

  const displayPercent = (value: number): string =>
    isDashboardInitialized ? `${formatPercent(value)}%` : '-';

  const assetComposition = useMemo(
    () => [
      {
        key: 'cash',
        label: '현금 자산',
        value: savedValues.cash,
        color: ASSET_COLORS.cash,
        percentage: totalAsset === 0 ? 0 : (savedValues.cash / totalAsset) * 100,
      },
      {
        key: 'savings',
        label: '예금·저축',
        value: savedValues.savings,
        color: ASSET_COLORS.savings,
        percentage: totalAsset === 0 ? 0 : (savedValues.savings / totalAsset) * 100,
      },
      {
        key: 'investment',
        label: '투자 자산',
        value: savedValues.investment,
        color: ASSET_COLORS.investment,
        percentage: totalAsset === 0 ? 0 : (savedValues.investment / totalAsset) * 100,
      },
    ],
    [savedValues, totalAsset],
  );

  const chartBackground = useMemo(() => {
    if (!isDashboardInitialized || totalAsset === 0) {
      return 'conic-gradient(#e5e7eb 0% 100%)';
    }

    let start = 0;
    const segments = assetComposition.map((item) => {
      const end = start + item.percentage;
      const segment = `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
      start = end;
      return segment;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }, [assetComposition, isDashboardInitialized, totalAsset]);

  const handleInputChange =
    (field: keyof AssetFormValues) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      const nextValue = event.target.value;

      setDraftValues((prev) => ({ ...prev, [field]: nextValue }));
      setFormError(null);
      setFeedbackMessage(null);
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const hasEmptyValue = Object.values(draftValues).some((value) => value.trim() === '');

    if (hasEmptyValue) {
      setFormError('모든 항목의 금액을 입력해주세요.');
      setFeedbackMessage(null);
      return;
    }

    const parsedValues = parseDraftValues(draftValues);

    const hasInvalidValue = Object.values(parsedValues).some((value) => !isNonNegativeNumber(value));

    if (hasInvalidValue) {
      setFormError('금액은 0 이상의 숫자로 입력해주세요.');
      setFeedbackMessage(null);
      return;
    }

    setIsSaving(true);

    try {
      const { data } = await dashboardApi.saveState(parsedValues);
      const normalizedState = sanitizeDashboardState(data);

      setSavedValues({ ...normalizedState.values });
      setDraftValues(toDraftValues(normalizedState.values));
      setHistory([...normalizedState.history]);
      setFormError(null);
      setFeedbackMessage('자산 정보를 저장했습니다.');
    } catch (error: unknown) {
      setFormError(getDashboardErrorMessage(error, '자산 정보를 저장하지 못했습니다.'));
      setFeedbackMessage(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreDraft = (): void => {
    setDraftValues(toDraftValues(savedValues, { hideZero: !isDashboardInitialized }));
    setFormError(null);
    setFeedbackMessage('저장된 값으로 입력값을 되돌렸습니다.');
  };

  const handleLogout = (): void => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-user">안녕하세요, {user?.name ?? '사용자'}님</p>
          <h1>UniAsset 자산관리 대시보드</h1>
          <p className="dashboard-description">
            API 연동 기반으로 현재 자산 상태를 저장/조회할 수 있습니다.
          </p>
          {isPageLoading && <p className="dashboard-description">저장된 데이터를 불러오는 중입니다...</p>}
        </div>

        <button className="dashboard-logout" type="button" onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-panel dashboard-input-card">
          <h2>자산 직접 입력</h2>
          <p className="section-description">입력값은 API를 통해 서버 DB에 저장됩니다.</p>

          <form className="dashboard-form" onSubmit={handleSubmit}>
            <div className="dashboard-form-grid">
              {INPUT_FIELDS.map((field) => (
                <label key={field.key} className="dashboard-field" htmlFor={`asset-${field.key}`}>
                  <span>{field.label}</span>
                  <small>{field.description}</small>
                  <input
                    id={`asset-${field.key}`}
                    type="number"
                    min={0}
                    step={10000}
                    value={draftValues[field.key]}
                    onChange={handleInputChange(field.key)}
                    disabled={isPageLoading || isSaving}
                    placeholder="금액 입력"
                    required
                  />
                </label>
              ))}
            </div>

            {formError && <p className="form-message form-message--error">{formError}</p>}
            {feedbackMessage && !formError && (
              <p className="form-message form-message--success">{feedbackMessage}</p>
            )}

            <div className="dashboard-form-actions">
              <button type="submit" className="action-button action-button--primary" disabled={isPageLoading || isSaving}>
                {isSaving ? '저장 중...' : '저장하기'}
              </button>
              <button
                type="button"
                className="action-button action-button--secondary"
                onClick={handleRestoreDraft}
                disabled={isPageLoading || isSaving}
              >
                입력값 되돌리기
              </button>
            </div>
          </form>
        </section>

        <section className="dashboard-panel dashboard-summary-card">
          <h2>총 자산 현황</h2>
          <p className="section-description">핵심 지표와 자산 비중을 한 번에 확인할 수 있도록 정리했습니다.</p>

          <div className="summary-hero">
            <div>
              <p className="summary-hero-label">현재 총 자산</p>
              <p className="summary-hero-value">{displayCurrency(totalAsset)}</p>
              <p className="summary-hero-description">
                {isDashboardInitialized
                  ? '현금 + 예금·저축 + 투자 자산의 합계입니다.'
                  : '입력 후 저장하면 총 자산 지표가 표시됩니다.'}
              </p>
            </div>

            <div className="summary-hero-balance">
              <span>월 잉여 자금</span>
              <strong
                className={
                  isDashboardInitialized
                    ? monthlyBalance >= 0
                      ? 'summary-value--positive'
                      : 'summary-value--negative'
                    : undefined
                }
              >
                {displayCurrency(monthlyBalance)}
              </strong>
              <small>
                {isDashboardInitialized
                  ? `저축률 ${monthlySavingRate >= 0 ? '+' : '-'}${formatPercent(
                      Math.abs(monthlySavingRate),
                    )}%`
                  : '입력 후 저장 시 저축률이 계산됩니다.'}
              </small>
            </div>
          </div>

          <div className="summary-breakdown-list" aria-label="자산 구성 상세">
            {assetComposition.map((item) => (
              <article key={item.key} className="summary-breakdown-item">
                <div className="summary-breakdown-top">
                  <div className="summary-breakdown-label-wrap">
                    <span
                      className="summary-breakdown-dot"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <h3>{item.label}</h3>
                  </div>

                  <div className="summary-breakdown-value-wrap">
                    <strong>{displayCurrency(item.value)}</strong>
                    <span>{displayPercent(item.percentage)}</span>
                  </div>
                </div>

                <div className="summary-breakdown-track">
                  <div
                    className="summary-breakdown-fill"
                    style={{
                      width:
                        isDashboardInitialized && item.value > 0
                          ? `${Math.max(item.percentage, 4)}%`
                          : '0%',
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="dashboard-summary-grid">
            <article className="summary-item">
              <h3>월 수입</h3>
              <p className="summary-value">{displayCurrency(savedValues.monthlyIncome)}</p>
            </article>

            <article className="summary-item">
              <h3>월 지출</h3>
              <p className="summary-value">{displayCurrency(savedValues.monthlyExpense)}</p>
            </article>

            <article className="summary-item">
              <h3>월 잉여 자금</h3>
              <p
                className={`summary-value ${
                  isDashboardInitialized
                    ? monthlyBalance >= 0
                      ? 'summary-value--positive'
                      : 'summary-value--negative'
                    : ''
                }`}
              >
                {displayCurrency(monthlyBalance)}
              </p>
            </article>
          </div>
        </section>

        <section className="dashboard-panel dashboard-chart-card">
          <h2>자산 비중 그래프</h2>
          <p className="section-description">현금/저축/투자 자산 비율을 도넛 차트로 시각화합니다.</p>

          <div className="asset-ratio-wrap">
            <div
              className="asset-ratio-chart"
              style={{ background: chartBackground }}
              role="img"
              aria-label="현금, 저축, 투자 자산 비중 원형 그래프"
            >
              <div className="asset-ratio-inner">
                <span>총 자산</span>
                <strong>{displayCurrency(totalAsset)}</strong>
              </div>
            </div>

            <ul className="asset-ratio-legend">
              {assetComposition.map((item) => (
                <li key={item.key}>
                  <div className="legend-main">
                    <span className="legend-color" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span className="legend-label">{item.label}</span>
                  </div>
                  <span className="legend-value">{displayPercent(item.percentage)}</span>
                  <span
                    className="legend-amount-box"
                    title={isDashboardInitialized ? formatCurrency(item.value) : '입력 후 저장'}
                  >
                    {displayCurrency(item.value)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="dashboard-panel dashboard-history-card">
          <h2>최근 자산 변동 기록</h2>
          <p className="section-description">저장 시점 기준으로 총 자산 변화를 기록합니다.</p>

          {history.length === 0 ? (
            <p className="empty-history">아직 저장된 기록이 없습니다. 먼저 자산 정보를 저장해보세요.</p>
          ) : (
            <ul className="history-list">
              {history.map((record) => {
                const isIncrease = record.delta >= 0;

                return (
                  <li key={record.id} className="history-item">
                    <div className="history-top">
                      <strong
                        className={`history-delta ${
                          isIncrease ? 'history-delta--increase' : 'history-delta--decrease'
                        }`}
                      >
                        {isIncrease ? '+' : '-'}
                        {formatCurrency(Math.abs(record.delta))}
                      </strong>
                      <span>{formatDateTime(record.changedAt)}</span>
                    </div>
                    <p>
                      {formatCurrency(record.previousTotal)} → {formatCurrency(record.nextTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
