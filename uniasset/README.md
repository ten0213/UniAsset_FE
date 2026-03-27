# UniAsset 프로젝트 구현 흐름 요약(지속적으로 수정/추가 예정)

---

## (03/27) 1번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_1 참조)

```
types/auth.ts       → 타입 정의
api/client.ts       → Axios 공통 설정 (인터셉터)
api/auth.ts         → 인증 API 함수 캡슐화
store/useAuthStore.ts → Zustand 전역 상태관리
pages/auth/LoginPage.tsx   → 로그인 UI
pages/auth/SignupPage.tsx  → 회원가입 UI
components/auth/ProtectedRoute.tsx → 인증 가드
App.tsx             → 라우팅
```

---

