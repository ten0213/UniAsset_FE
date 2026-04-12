# UniAsset 프로젝트 구현 흐름 요약(지속적으로 수정/추가 예정)

---

## (03/27) 1번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_1 참조)

```
types/auth.ts            : 타입 정의
api/client.ts            : Axios 공통 설정 (인터셉터)
api/auth.ts              :  인증 API 함수 캡슐화
store/useAuthStore.ts : Zustand 전역 상태관리
pages/auth/LoginPage.tsx   : 로그인 UI
pages/auth/SignupPage.tsx  : 회원가입 UI
components/auth/ProtectedRoute.tsx : 인증 가드
App.tsx             : 라우팅
```

---

## (04/12) 2번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_2 참조)

```
types/dashboard.ts                : 대시보드 타입 정의
api/dashboard.ts                  : 대시보드 조회/저장 API 함수
api/client.ts                     : baseURL /api 기반 + 인터셉터 유지
vite.config.ts                    : /api 프록시 설정 (개발환경)
pages/dashboard/DashboardPage.tsx : 자산 대시보드 UI + 서버 API 연동 + 총 자산 Hero/저축률/구성 바 개선
pages/dashboard/DashboardPage.css : 카드형/반응형 대시보드 스타일 + 가독성 개선 스타일
store/useAuthStore.ts             : 회원가입 성공 시 자동 로그인 제거 + 로그인 이동용 성공 여부 반환
pages/auth/SignupPage.tsx         : 회원가입 완료 시 로그인 페이지로 이동 + 성공 메시지 전달
pages/auth/LoginPage.tsx          : 회원가입 완료 안내 메시지 배너 노출
pages/auth/LoginPage.css          : 성공 안내 배너(auth-success) 스타일
App.tsx                           : /dashboard 실제 페이지 라우팅 연결
```

---
