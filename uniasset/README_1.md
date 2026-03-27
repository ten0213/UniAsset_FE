# 1번째 프로젝트 구현 내용 정리 파일

## 1. 로그인 흐름 (데이터 흐름)

사용자 입력 (이메일/비밀번호)
→ LoginPage.handleSubmit()
→ useAuthStore.login()
→ authApi.login()
→ axios 인터셉터 (JWT 자동 첨부)
→ POST /api/auth/login
→ 서버 응답 { token, user }
→ localStorage에 토큰 저장
→ Zustand 상태 업데이트 (user, token)
→ /dashboard 로 이동


로그인 요청 → 토큰 저장 → 상태 업데이트 → 대시보드 이동

---

##  2. 레이어별 역할 요약

### 1. 타입 정의 (`types/auth.ts`)
- 로그인/회원가입 관련 데이터 구조 정의
- 예: `LoginRequest`, `SignupRequest`, `AuthResponse`, `User`
- 프론트와 백엔드 간 데이터 형식 맞추는 역할

---

### 2. Axios 클라이언트 (`api/client.ts`)
- API 요청을 보내는 공통 설정 파일
- `baseURL`을 한 곳에서 관리 → 배포 시 쉽게 변경 가능
- Request 인터셉터 → 모든 요청에 JWT 자동 추가
- Response 인터셉터 → 401 에러 발생 시 토큰 삭제 + 로그인 페이지 이동

---

### 3. 인증 API (`api/auth.ts`)
- 로그인/회원가입 API를 따로 분리한 파일
- `login`, `signup`, `logout` 함수 제공
- 컴포넌트에서 URL을 직접 쓰지 않도록 관리

---

### 4. 상태관리 (`store/useAuthStore.ts`)
- Zustand로 로그인 상태 관리
- 관리 값: `user`, `token`, `isLoading`, `error`
- `login()` 흐름
  - 로딩 시작 → API 요청 → 토큰 저장 → 상태 업데이트 → 에러 처리
- 토큰을 `localStorage`에도 저장 → 새로고침 후에도 로그인 유지

---

### 5. 로그인 페이지 (`LoginPage.tsx`)
- 입력값을 상태로 관리하는 폼 구조 (제어 컴포넌트)
- 로그인 중에는 버튼 비활성화 → 중복 요청 방지
- 입력 시 에러 초기화 → 사용자 경험 개선
- 최신 토큰 상태를 직접 확인해 안정적인 로그인 처리

---

### 6. 회원가입 페이지 (`SignupPage.tsx`)
- 비밀번호 길이, 일치 여부 등 기본 검증을 프론트에서 먼저 수행
- 서버 요청 전에 잘못된 입력을 차단
- 에러 종류 분리
  - `validationError` → 프론트 검증 에러
  - `error` → 서버 에러
- 두 에러 중 하나를 화면에 표시

---

### 7. 인증 가드 (`ProtectedRoute.tsx`)
- 로그인되지 않은 사용자의 접근을 막는 기능
- 토큰이 없으면 `/login`으로 이동
- 뒤로가기 시 다시 들어오지 못하도록 설정
- 필요한 상태만 구독하여 성능 최적화

---

### 8. 라우팅 (`App.tsx`)
- `/login`, `/signup` → 누구나 접근 가능
- `/dashboard` → 로그인한 사용자만 접근 가능
- 인증이 필요한 페이지는 `ProtectedRoute`로 감싸서 보호
- 잘못된 경로 접근 시 로그인 페이지로 이동

---

전체 순서: 페이지 → 상태관리(Zustand) → API → 서버
JWT → 로그인 상태 유지
