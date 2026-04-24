# 3번째 프로젝트 구현 내용 정리 파일
## 1. 사이드바 페이지 이동 흐름

### A) 메뉴 클릭 이동 흐름
사용자 사이드바 메뉴 클릭
1. Sidebar 버튼 onClick 실행
2. navigate('/dashboard' | '/goal' | '/simulator') 처리
3. App.tsx 라우트 매칭
4. ProtectedRoute에서 토큰 확인하기
5. SidebarLayout + 해당 페이지 렌더링
사이드바 클릭 -> 라우팅 이동 -> 인증 확인 -> 페이지 표시
---

### B) 로그아웃 흐름
사이드바 로그아웃 버튼 클릭
1. Sidebar.handleLogout()
2. useAuthStore.logout()
3. localStorage 토큰 삭제
4. /login 으로 이동
로그아웃 -> 토큰 제거 -> 로그인 페이지 이동

---

## 2. 레이어별 역할 요약
### 1) 라우팅 (`App.tsx`)
- `/dashboard`, `/goal`, `/simulator` 경로 추가
- 각 Route에서 직접 컴포넌트 감싸는 방식으로 구성했음
- `ProtectedRoute` + `SidebarLayout` + 실제 페이지를 순서대로 렌더링

---
### 2) 인증 가드 (`components/auth/ProtectedRoute.tsx`)
- 토큰 유무 확인 후 미인증 상태면 `/login` 이동
---

### 3) 사이드바 (`pages/Sidebar.tsx`)
- 왼쪽 고정 메뉴 UI
- 메뉴 항목:
  - 대시보드
  - 투자 목표
  - 성장 시뮬레이터
- 현재 경로 active 표시
- 로그아웃 버튼 포함
---

### 4) 레이아웃 (`pages/SidebarLayout.tsx`)
- 왼쪽 `Sidebar` + 오른쪽 콘텐츠 영역 구조

---
### 5) 목표 페이지 (`pages/GoalPage.tsx`)
- 안내 텍스트/카드 형태로 구성
- 사이드바 이동 테스트용 기본 페이지
---

### 6) 시뮬레이터 페이지 (`pages/SimulatorPage.tsx`)
- 안내 텍스트/카드 형태로 구성
- 사이드바 이동 테스트용 기본 페이지
---

### 7) 스타일 (`pages/Sidebar.css`, `GoalPage.css`, `SimulatorPage.css`)
- 사이드바 기본 스타일
- active/hover/로그아웃 버튼 스타일
- 목표/시뮬레이터 페이지 스타일로 기본 지정
---

## 3. 이번 단계에서 구현한 범위
### 이번(3차) 구현 범위
- 왼쪽 사이드바 UI 추가
- 사이드바 메뉴 클릭 시 페이지 이동
- `/dashboard`, `/goal`, `/simulator` 라우팅 연결
- 목표/시뮬레이터 페이지 생성
- 로그아웃 버튼을 사이드바로 이동
사이드바 UI -> 메뉴 클릭 -> 라우팅 이동 -> 페이지 렌더링
---

* 이번 구현은 직전 구현을 완료한 상태에서 교수님의 설명을 인지하고 구현하였습니다. 따라서 기존 구현방법을 수정한 파일이 존재합니다.(App.tsx, ProtectedRoute.tsx)
