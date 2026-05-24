# 5번째 프로젝트 구현 내용 정리 파일

## 1. 투자 목표 관리 흐름 (데이터 흐름)

### A) 목표 목록 조회 흐름

페이지 진입

1. GoalPage.useEffect()
2. goalApi.getGoals()
3. GET /api/goals
4. 서버 응답 [ Goal, ... ]
5. goals 상태 업데이트
6. 대시보드 데이터 동시 조회 (dashboardApi.getState())
7. 자산 현황 + 목표 종합 현황 + 목표 카드 목록 UI 렌더링

페이지 진입 → 목표/대시보드 API 조회 → 상태 반영 → 목표 관리 UI 렌더링

---

### B) 목표 생성 흐름

사용자 입력 (목표명/목표금액/현재저축액/월저축액)

1. GoalCreateForm.handleSubmit()
2. 프론트 유효성 검증 (빈 값, 음수, 0 체크)
3. onSubmit → goalApi.createGoal(data)
4. POST /api/goals
5. 서버 응답 Goal
6. loadGoals() 재조회 → 목록 갱신

입력 → 유효성 검증 → API 생성 → 목록 재조회 → UI 갱신

---

### C) 목표 저축액 수정 흐름

사용자 저축액 수정 버튼 클릭

1. GoalCard → isEditing 활성화
2. 사용자 새 저축액 입력
3. handleUpdateAmount()
4. goalApi.updateGoal(goalId, { currentAmount })
5. PUT /api/goals/{goalId}
6. loadGoals() 재조회 → 진행률/달성예상일 갱신

저축액 입력 → API 업데이트 → 목록 재조회 → 진행률 재계산

---

### D) 목표 삭제 흐름

사용자 삭제 버튼 클릭

1. confirm() 확인 대화상자
2. goalApi.deleteGoal(goalId)
3. DELETE /api/goals/{goalId}
4. loadGoals() 재조회 → 목록에서 제거

삭제 확인 → API 삭제 → 목록 재조회 → UI 갱신

---

### E) 시뮬레이터 계산 흐름

사용자 입력 (초기자산/월투자금/연수익률/투자기간)

1. SimulatorPage.handleCalc()
2. 입력값 유효성 검증
3. 월 복리 계산: total = total \* (1 + monthRate) + monthly (12회/년 반복)
4. 연도별 자산 데이터 list 생성
5. setResult({ final, invested, profit, list })
6. SimResult에서 최종 자산/총 투자금/수익금/연도별 테이블 렌더링
7. SimGoalInfo에서 목표 달성 여부 비교 결과 표시

입력 → 복리 계산 → 결과 상태 업데이트 → 결과 UI + 목표 비교 렌더링

---

### F) 빠른 입력 흐름 (목표/대시보드 연동)

사용자 빠른 입력 선택

1. SimQuickInput에서 목표 선택 → onSelectGoal
2. SimulatorPage.handleGoalSelect() → 목표의 currentAmount, monthlySaving으로 폼 채우기
3. 또는 "대시보드 데이터로 채우기" 클릭 → fillFromDashboard()
4. 대시보드 총 자산 + 월 잉여자금으로 폼 채우기

목표/대시보드 데이터 → 폼 자동 채우기 → 바로 계산 가능

---

## 2. 레이어별 역할 요약

### 1. 타입 정의 (`types/goal.ts`)

- `Goal`: 목표 데이터 구조 (id, title, targetAmount, currentAmount, monthlySaving, completed, createdAt, updatedAt)
- `GoalCreateRequest`: 목표 생성 요청 타입
- `GoalUpdateRequest`: 목표 수정 요청 타입 (모든 필드 optional)
- 프론트와 백엔드 간 목표 데이터 형식 통일

---

### 2. 목표 API (`api/goal.ts`)

- `getGoals()` → GET `/goals`: 목표 목록 조회
- `createGoal(data)` → POST `/goals`: 목표 생성
- `updateGoal(goalId, data)` → PUT `/goals/{goalId}`: 목표 수정
- `deleteGoal(goalId)` → DELETE `/goals/{goalId}`: 목표 삭제
- 컴포넌트에서 URL/메서드를 직접 다루지 않도록 분리

---

### 3. 목표 페이지 (`pages/goal/GoalPage.tsx`)

- 목표 관리 메인 페이지
- 기능
  - 대시보드 자산 데이터 연동 (총 자산, 월 잉여자금)
  - 자산 현황 요약 (GoalSummary)
  - 목표 종합 현황 (GoalOverview)
  - 새 목표 생성 폼 토글 (GoalCreateForm)
  - 목표 카드 목록 (GoalCard)
- 로딩/에러 상태 관리

---

### 4. 자산 현황 요약 (`pages/goal/GoalSummary.tsx`)

- 대시보드 데이터 기반 자산 요약 카드
- 총 자산, 월 수입, 월 지출, 월 잉여 자금 표시
- 월 잉여 자금은 양수/음수에 따라 색상 분리

---

### 5. 목표 종합 현황 (`pages/goal/GoalOverview.tsx`)

- 전체 목표의 합계/비율 분석 카드
- 목표 총액, 현재 저축 합계, 월 저축 합계, 자산 대비 목표 비중
- 월 저축 합계 > 월 잉여 자금 시 경고 메시지 표시
- 전체 달성률 진행 바

---

### 6. 목표 생성 폼 (`pages/goal/GoalCreateForm.tsx`)

- 목표명, 목표 금액, 현재 저축액, 월 저축액 입력 폼
- 프론트 유효성 검증 (빈 값, 음수, 0)
- 대시보드 월 잉여 자금 안내 + "월 잉여 자금으로 채우기" 빠른 입력 버튼
- 저장 중 버튼 비활성화로 중복 요청 방지

---

### 7. 목표 카드 (`pages/goal/GoalCard.tsx`)

- 개별 목표 정보 카드
- 진행률 계산 (currentAmount / targetAmount \* 100)
- 달성 예상일 계산 (남은 금액 / 월 저축액)
- 저축액 인라인 수정 기능
- 삭제 기능 (confirm 확인)
- 달성 완료 시 카드 스타일 변경 (녹색)

---

### 8. 시뮬레이터 페이지 (`pages/simulator/SimulatorPage.tsx`)

- 자산 성장 시뮬레이션 메인 페이지
- 기능
  - 빠른 입력: 목표/대시보드 데이터로 폼 자동 채우기
  - 투자 정보 입력: 초기 자산, 월 투자금, 연 수익률, 투자 기간
  - 월 복리 계산 로직
  - 결과 표시: 최종 자산, 총 투자금, 수익금, 연도별 테이블
  - 목표 비교: 선택한 목표의 달성 가능 여부

---

### 9. 빠른 입력 (`pages/simulator/SimQuickInput.tsx`)

- 목표 선택 드롭다운 → 목표 데이터로 폼 자동 채우기
- 대시보드 데이터 버튼 → 총 자산 + 월 잉여자금으로 폼 자동 채우기
- 목표/대시보드 데이터가 없으면 숨김 처리

---

### 10. 시뮬레이터 폼 (`pages/simulator/SimulatorForm.tsx`)

- 초기 자산, 월 투자 금액, 연 수익률, 투자 기간 입력
- 계산하기 / 초기화 버튼

---

### 11. 시뮬레이션 결과 (`pages/simulator/SimResult.tsx`)

- 최종 자산 (강조 표시)
- 총 투자금 / 수익금 비교
- 연도별 자산 성장 테이블

---

### 12. 목표 비교 정보 (`pages/simulator/SimGoalInfo.tsx`)

- 선택한 목표 정보 표시
- 시뮬레이션 결과와 목표 금액 비교
- 달성 가능 → 성공 메시지 / 불가능 → 부족 금액 안내

---

### 13. 스타일 (`pages/goal/GoalPage.css`, `pages/simulator/SimulatorPage.css`)

- 카드형 UI + 반응형 (모바일 세로 정렬)
- 목표 진행 바, 달성 완료 카드 녹색 스타일
- 시뮬레이터 결과 박스, 연도별 테이블, 목표 비교 카드 스타일
- 경고/안내 메시지 색상 분리

---

## 3. 이번 단계에서 구현한 범위

### 이번(5차) 구현 범위

- 투자 목표 CRUD (생성/조회/수정/삭제) API 연동
- 대시보드 자산 데이터와 목표 페이지 연동
- 자산 현황 요약 + 목표 종합 현황 카드
- 목표 진행률 계산 + 달성 예상일 계산
- 목표 저축액 인라인 수정
- 월 저축 초과 경고
- 자산 성장 시뮬레이터 (월 복리 계산)
- 빠른 입력: 목표/대시보드 데이터 연동
- 시뮬레이션 결과 (최종 자산/투자금/수익금/연도별 테이블)
- 목표 달성 가능 여부 비교
- 카드형 반응형 UI

## 목표 관리(CRUD) → 진행률/예상일 계산 → 시뮬레이터 → 대시보드/목표 데이터 연동 → 결과 시각화

### 다음 구현 예정 내용

- 커뮤니티 기능 (게시글 작성/조회/댓글)
- 관리자 페이지 (사용자 관리/통계 대시보드)
