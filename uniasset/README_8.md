# 8번째 프로젝트 구현 내용 정리 파일

> 직전 7차 커밋(`d7c7360`) 대비 새로 추가/변경된 사이드바 재구성 및 세션 저장소 변경 정리

## 1. 사이드바 / 세션 흐름 (데이터 흐름)

### A) 사이드바 관리자 섹션 점프 흐름

사이드바에서 관리자 하위 메뉴 클릭 (통계 현황 / 사용자 관리 / 댓글 모더레이션 / 활동 로그)

1. Sidebar.handleAdminSectionMove(hash) 실행
2. 분기 처리
   - 이미 `/admin` 페이지인 경우 → `document.getElementById(hash).scrollIntoView({ behavior: 'smooth' })`로 부드럽게 스크롤
   - 다른 페이지(대시보드 등)에서 클릭한 경우 → `navigate('/admin#' + hash)`로 이동
3. 다른 페이지에서 진입했을 때는 AdminPage.useEffect가 location.hash 감지
4. 로딩이 끝난 시점에 setTimeout(80ms) 후 해당 id의 섹션으로 자동 스크롤
5. CSS `scroll-margin-top`으로 상단 여백 확보 (섹션 헤더가 잘리지 않게)

사이드바 클릭 → pathname 분기 → 같은 페이지면 즉시 스크롤 / 다른 페이지면 navigate 후 hash 감지 → 자동 스크롤

> 7차에서 만든 관리자 페이지가 한 화면에 4개 섹션을 길게 나열하기 때문에, 원하는 섹션으로 한 번에 이동할 수 있도록 페이지 내 앵커 방식 채택

---

### B) 탭/창별 독립 로그인 세션 흐름

사용자가 다른 탭/창에서 다른 계정으로 동시에 로그인하고 싶을 때

1. 토큰 저장소를 `localStorage` → `sessionStorage`로 변경
   - localStorage: 같은 도메인의 모든 탭/창이 공유 → 한 곳에서 로그인하면 다른 탭의 토큰이 덮어써짐
   - sessionStorage: 탭/창별로 독립된 저장소 → 각 탭이 자기만의 토큰 보유
2. useAuthStore.login() 성공 시 `sessionStorage.setItem('token', data.token)`
3. apiClient 요청 인터셉터에서 `sessionStorage.getItem('token')` 으로 헤더에 Bearer 토큰 부착
4. ProtectedRoute에서도 `sessionStorage.getItem('token')`으로 인증 가드 검사
5. 401 응답 시 `sessionStorage.removeItem('token')`으로 해당 탭의 토큰만 제거

로그인 → 탭 전용 저장소에 토큰 저장 → 같은 탭에서만 인증 유지 → 다른 탭은 영향 없음

> 트레이드오프: 탭/창을 닫으면 토큰도 사라져서 재로그인 필요 (의도된 동작)
> 같은 탭의 새로고침(F5)은 sessionStorage 유지되므로 영향 없음

---

## 2. 레이어별 역할 요약

### 1. 사이드바 재구성 (`pages/Sidebar.tsx`) [수정]

- 메뉴 구조를 3개 섹션으로 명확히 분리
  - 일반 메뉴 (MAIN_MENUS): 대시보드 / 투자 목표 / 성장 시뮬레이터
  - 커뮤니티 (COMMUNITY_MENUS): 커뮤니티
  - 관리자 전용 (ADMIN_MAIN + ADMIN_SECTIONS): 관리자에게만 노출
- 관리자 전용 섹션 구성
  - 메인 진입점: "관리자 대시보드" (path: /admin)
  - 페이지 내 앵커 메뉴 4종: 통계 현황 / 사용자 관리 / 댓글 모더레이션 / 활동 로그
- `handleAdminSectionMove(hash)`:
  - `location.pathname === '/admin'` → scrollIntoView로 즉시 스크롤
  - 그 외 → `navigate('/admin#' + hash)`로 이동 (AdminPage가 hash 보고 스크롤 처리)
- `canAccessAdmin` 가드는 그대로 유지 (관리자 아닌 경우 섹션 자체 숨김)

---

### 2. 사이드바 스타일 (`pages/Sidebar.css`) [수정]

- 관리자 전용 섹션 강조 (노란 라벨 `#fcd34d`)
- `sidebar-sub-button` 들여쓰기 (padding 26px) + 점 마커(`::before { content: '·' }`)
- 서브 버튼 hover 시 색상 강조 (`#374151` 배경 + 흰색 텍스트)
- 작은 폰트(13px), 약간 옅은 회색(`#d1d5db`)으로 메인 메뉴와 차별

---

### 3. 관리자 메인 페이지 (`pages/admin/AdminPage.tsx`) [수정]

- 7차에서 만든 4섹션 렌더링에 다음 기능 추가
- 각 섹션을 `<section id="admin-stats|admin-users|admin-comments|admin-logs">`으로 감싸 앵커 점프 대응
- `useLocation()` 추가 → `location.hash` 감지
- 로딩이 끝난 시점에 `setTimeout(80ms)` 후 `document.getElementById(id).scrollIntoView({ behavior: 'smooth' })` 호출
- 같은 페이지 내에서 hash가 바뀌어도 의존성 배열에 `location.hash` 추가해 다시 스크롤 발동

---

### 4. 관리자 스타일 (`pages/admin/AdminPage.css`) [수정]

- `.admin-section { scroll-margin-top: 20px; }` 추가
- 사이드바 점프 시 섹션 상단에 약간의 여백 확보 (헤더가 잘리지 않게)

---

### 5. 인증 토큰 저장소 변경 [수정]

- 기존 `localStorage` → `sessionStorage`로 일괄 전환 (총 3개 파일, 8개 위치)
- 변경 이유
  - `localStorage`는 같은 도메인의 모든 탭/창이 공유 → 한 탭에서 다른 계정으로 로그인하면 다른 탭의 세션이 덮어써짐
  - `sessionStorage`는 탭/창마다 독립된 저장소 → 각 탭에서 다른 계정으로 동시 로그인 가능
- 변경 위치
  - `store/useAuthStore.ts`: 초기 token 복원, login() 저장, login 실패/signup/logout 시 제거 (5곳)
  - `api/client.ts`: 요청 인터셉터에서 토큰 부착, 401 응답 시 제거 (2곳)
  - `components/auth/ProtectedRoute.tsx`: 가드 검사 시 토큰 비교 (1곳)
- 트레이드오프
  - 탭/창을 닫으면 토큰 사라짐 → 재로그인 필요 (의도된 동작)
  - 같은 탭의 새로고침(F5)은 영향 없음 (sessionStorage 유지)
  - 기존 localStorage 토큰은 무시되므로 업데이트 직후 한 번은 재로그인 필요

---

## 3. 이번 단계에서 구현한 범위

### 이번(8차) 구현 범위

- 사이드바 메뉴를 3개 섹션으로 분리 (일반 / 커뮤니티 / 관리자 전용)
- 관리자 전용 섹션에 페이지 내 앵커 메뉴 4종 추가 (통계 현황 / 사용자 관리 / 댓글 모더레이션 / 활동 로그)
- 같은 페이지면 scrollIntoView, 다른 페이지면 `/admin#hash`로 navigate 후 자동 점프
- AdminPage에 `useLocation().hash` 감지 useEffect 추가 + 각 섹션 `<section id="...">` 감싸기
- AdminPage.css에 `scroll-margin-top` 추가 (점프 시 상단 여백)
- 사이드바 관리자 전용 섹션 시각적 강조 (노란 라벨 + 들여쓰기 점 마커)
- 인증 토큰 저장소를 `localStorage` → `sessionStorage`로 변경 (탭/창별 독립 로그인 세션, 다른 계정 동시 로그인 가능)

## 사이드바 3섹션 분리 → 관리자 페이지 내 앵커 점프 → AdminPage hash 감지 자동 스크롤 → 탭별 독립 세션

### 다음 구현 예정 내용

- 이번 단계로 1차~8차에 걸친 주요 기능 구현 완료함
- 추후 사용자 피드백을 받아 디자인 / UX 개선 작업 예정
