# 2번째 프로젝트 구현 내용 정리 파일

## 1. 대시보드 조회/저장 흐름 (데이터 흐름)

### A) 초기 조회 흐름

페이지 진입
1. DashboardPage.useEffect()
2. dashboardApi.getState()
3. GET /api/dashboard
4. 서버 응답 { values, history }
5. savedValues / draftValues / history 상태 업데이트
6. (초기 미입력 상태면 금액은 '-'로 비표시)
7. 총 자산 Hero / 자산 구성 바 / 비중 그래프 / 변동 기록 UI 반영


페이지 진입 → API 조회 → 상태 반영 → 대시보드 렌더링

---

### B) 저장 흐름

사용자 입력 (현금/저축/투자/월 수입/월 지출)
1. DashboardPage.handleInputChange()
2. draftValues 상태 업데이트
3. DashboardPage.handleSubmit()
4. 입력값 검증 (모든 항목 입력 + 0 이상 숫자)
5. dashboardApi.saveState(draftValues)
6. PUT /api/dashboard
7. 서버 응답 { values, history }
8. savedValues / draftValues / history 상태 업데이트
9. 총 자산 Hero / 자산 구성 바 / 비중 그래프 / 변동 기록 UI 즉시 반영


직접 입력 → API 저장 → 최신 상태 재반영 → 대시보드 시각화

---

### C) 회원가입 완료 후 로그인 이동 흐름

회원가입 폼 제출
1. SignupPage.handleSubmit()
2. useAuthStore.signup()
3. POST /api/auth/signup
4. 회원가입 성공 시 토큰/사용자 상태 초기화(자동 로그인 없음)
5. navigate('/login', state: signupSuccessMessage)
6. LoginPage에서 성공 메시지 배너 노출


회원가입 성공 → 안내 메시지 표시 → 로그인 페이지에서 직접 로그인

---

## 2. 레이어별 역할 요약

### 1. 타입 정의 (`types/dashboard.ts`)
- 대시보드에서 사용하는 데이터 구조를 타입으로 분리
- 예: `AssetFormValues`, `AssetChangeRecord`, `DashboardStorageState`
- 조회/저장 API 응답 형식을 프론트 상태와 동일하게 유지

---

### 2. Axios 클라이언트 (`api/client.ts`)
- `baseURL`을 `/api` 기준으로 설정
- 요청 인터셉터로 JWT 자동 첨부
- 응답 인터셉터로 401 처리(토큰 제거 + 로그인 이동)

---

### 3. 대시보드 API (`api/dashboard.ts`)
- `getState()` → GET `/dashboard`
- `saveState(values)` → PUT `/dashboard`
- 대시보드 페이지에서 URL/메서드를 직접 다루지 않도록 분리

---

### 4. 대시보드 페이지 (`pages/dashboard/DashboardPage.tsx`)
- 저장 방식을 API 기반으로 전환한 대시보드 핵심 화면
- 기능
  - 자산 직접 입력 폼
  - 총 자산 Hero 카드 + 월 잉여 자금 + 저축률
  - 현금/저축/투자 자산 구성 상세(금액 + 비중 + 막대 바)
  - 도넛 형태 자산 비중 그래프
  - 최근 자산 변동 이력
- 초기 로딩/저장 상태(`isPageLoading`, `isSaving`) 분리 관리
- 첫 화면 기본 샘플값 미노출: 입력 전에는 지표를 `-`로 표시하고, 저장 후 실제 값 렌더링
- 서버 응답의 런타임 타입 검증 후 안전하게 상태 반영

---

### 5. 대시보드 스타일 (`pages/dashboard/DashboardPage.css`)
- 총 자산 Hero 영역 강조 스타일
- 자산 구성 막대 바(진행률 형태) 스타일
- 카드형 UI + 반응형(모바일에서 세로 정렬) 구성

---

### 6. 개발환경 프록시 (`vite.config.ts`)
- 프론트에서 `/api` 호출 시 백엔드로 프록시 연결
- 브라우저에서 `localhost:8080` 직접 호출 없이 API 연동 가능

---

### 7. 회원가입 완료 후 로그인 유도 (`store/useAuthStore.ts`, `pages/auth/*`)
- 회원가입 성공 시 자동 로그인하지 않도록 `signup` 로직을 분리
- `SignupPage`에서 성공 시 로그인 페이지로 이동하면서 성공 메시지 전달
- `LoginPage`에서 전달된 메시지를 안내 배너로 표시
- `LoginPage.css`에 성공 메시지 스타일(`.auth-success`) 추가

---

## 3. 이번 단계에서 구현한 범위

### 이번(2차) 구현 범위
- 직접 입력 기반 자산 대시보드
- 대시보드 초기 조회 API 연동
- 대시보드 저장 API 연동
- 총 자산 현황 가독성 개선(Hero/저축률/구성 막대 바)
- 첫 화면 기본값 비노출 + 입력/저장 후 값 표시
- 자산 비중 그래프
- 최근 변동 기록
- 회원가입 완료 후 안내 메시지와 함께 로그인 페이지 이동(자동 로그인 제거)

대시보드 UI(직접 입력) -> API 조회/저장 -> 상태 반영 -> 시각화(Hero/카드/그래프/기록)
---

### 다음 구현 예정 내용
- 투자 목표 관리 (목표 생성/진행률/달성 예상일) 기능 추가
- 자산 성장 시뮬레이터(그래프로 구현 예정)



