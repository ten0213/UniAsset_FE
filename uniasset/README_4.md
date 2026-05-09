# 4번째 프로젝트 구현 내용 정리 파일

## 1. 로그인 인증 및 사이드바 흐름 (데이터 흐름)

### A) 로그인 후 역할별 이동 흐름

사용자 입력 (아이디/비밀번호)
1. LoginPage.handleSubmit()
2. useAuthStore.login()
3. authApi.login()
4. POST /api/auth/login
5. 서버 응답 { token, user } (user.role 포함)
6. localStorage에 토큰 저장
7. isAdminUser(user)로 역할 확인
8. ADMIN → `/admin`, USER → `/dashboard`로 이동

로그인 요청 → 토큰 저장 → 역할 확인 → 역할별 페이지 이동

---

### B) 인증 에러 처리 흐름

API 요청 시 401 에러 발생
1. Response 인터셉터에서 error.config.url 확인
2. `/auth/login`, `/auth/signup` 요청인지 판별
3. 인증 엔드포인트면 → 에러만 전달 (토큰 삭제/이동 없음)
4. 일반 API 요청이면 → 토큰 삭제 + `/login` 이동

401 에러 → 인증 엔드포인트 여부 확인 → 조건부 토큰 제거/페이지 이동

---

### C) 사이드바 메뉴 이동 흐름

사용자 사이드바 메뉴 클릭
1. Sidebar handleMove(targetPath) 실행
2. navigate(targetPath) 처리
3. isActiveMenu()로 현재 경로와 비교해 active 스타일 적용
4. ADMIN 권한이면 관리자 메뉴 추가 노출

메뉴 클릭 → 라우팅 이동 → active 표시 → 권한별 메뉴 노출

---

## 2. 레이어별 역할 요약

### 1. 타입 정의 (`types/auth.ts`)
- `UserRole` 타입 추가 (`'USER' | 'ADMIN'`)
- `User` 인터페이스에 `role` 필드 추가
- 로그인 응답에서 사용자 역할을 프론트에서 활용 가능

---

### 2. 권한 유틸 (`constants/auth.ts`)
- `isAdminUser(user)`: user.role === 'ADMIN' 확인 함수
- 로그인 후 이동 경로 결정 및 사이드바 관리자 메뉴 노출에 사용

---

### 3. Axios 클라이언트 (`api/client.ts`)
- 401 응답 시 요청 URL이 인증 엔드포인트인지 확인
- `/auth/login`, `/auth/signup` 요청은 토큰 삭제/리다이렉트 제외
- 로그인 실패 시 잘못된 토큰 제거 방지

---

### 4. 상태관리 (`store/useAuthStore.ts`)
- `getKoreanErrorMessage()`: 서버 메시지 파싱 제거, HTTP 상태 코드 기반으로 단순화
- `getSignupErrorMessage()`: 서버 응답 분기 제거, 고정 메시지 반환으로 단순화
- 불필요한 서버 메시지 의존도 제거

---

### 5. 로그인 페이지 (`pages/auth/LoginPage.tsx`)
- 입력 필드 변경: 이메일 → 아이디 (label, type, placeholder)
- `type="email"` → `type="text"`로 변경
- 로그인 성공 후 `isAdminUser()`로 역별 라우팅 분기

---

### 6. 사이드바 (`pages/Sidebar.tsx`)
- 메뉴 항목 배열화: `MAIN_MENUS`, `COMMUNITY_MENUS`, `ADMIN_MENU`
- `isActiveMenu()`: 경로 기반 active 상태 감지 (하위 경로 포함)
- 커뮤니티 운영 섹션 추가 (커뮤니티 + 관리자 메뉴)
- ADMIN 권한 사용자에게만 관리자 메뉴 노출
- 서브타이틀 "학생 자산관리 플랫폼" 추가

---

### 7. 레이아웃 (`pages/SidebarLayout.tsx`)
- `props: any` → `SidebarLayoutProps` 인터페이스로 타입 안전하게 변경
- `children` 타입 명시적 선언

---

### 8. 사이드바 스타일 (`pages/Sidebar.css`)
- 사이드바 너비 220px → 240px 확장
- 섹션 구분선/라벨 스타일 추가 (`.sidebar-section`, `.sidebar-section-label`)
- 서브타이틀 스타일 크기 조정

---

## 3. 이번 단계에서 구현한 범위

### 이번(4차) 구현 범위
- 로그인 입력 방식 변경 (이메일 → 아이디)
- 사용자 역할(UserRole) 타입 및 권한 유틸 추가
- 로그인 후 역할별 라우팅 (ADMIN → /admin, USER → /dashboard)
- 401 에러 처리 로직 수정 (인증 엔드포인트 제외)
- 에러 메시지 매핑 단순화 (서버 메시지 의존도 제거)
- 사이드바 메뉴 구조 개선 (섹션 분리, 배열 기반 렌더링)
- 관리자 전용 메뉴 조건부 노출
- 사이드바 레이아웃 타입 안전성 개선
- 사이드바 디자인 개선 (너비 확장, 섹션 구분선, 서브타이틀)
- 개발 서버 프록시 포트 변경 (8080 → 8081)

로그인 인증 → 역할별 라우팅 → 사이드바 권한 메뉴 → 에러 처리 개선
---

### 다음 구현 예정 내용
- 투자 목표 관리 (목표 생성/진행률/달성 예상일) 기능 추가
- 자산 성장 시뮬레이터 (초기 자산, 월 투자, 수익률, 기간 입력 → 성장 그래프)
