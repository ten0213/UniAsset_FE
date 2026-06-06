# 7번째 프로젝트 구현 내용 정리 파일

## 1. 관리자 흐름 (데이터 흐름)

### A) 관리자 권한 가드 흐름

라우트 진입

1. ProtectedRoute에서 토큰 확인 (1차 가드)
2. AdminPage.useEffect()
3. isAdminUser(user) 검사
4. 관리자가 아니면 navigate('/dashboard', { replace: true })
5. 관리자면 통합 대시보드 데이터 조회

로그인 → 토큰 가드 → 권한 검사 → 비관리자 강제 이동 → 관리자만 데이터 조회

---

### B) 관리자 통합 대시보드 조회 흐름

페이지 진입

1. adminApi.getDashboardData()
2. GET /api/admin/dashboard
3. 서버 응답 AdminDashboardData
   - metrics: 사용자/댓글 통계 7개 지표
   - users: 전체 사용자 목록 (AdminUser[])
   - comments: 모더레이션 대상 댓글 (AdminComment[])
   - logs: 최근 모더레이션 로그 40개
4. data 상태 업데이트
5. 4개 섹션 UI 동시 렌더링 (AdminStats, AdminUserList, AdminCommentList, AdminModerationLog)

진입 → 통합 API 1회 호출 → 상태 반영 → 4개 섹션 렌더링

---

### C) 사용자 모더레이션 흐름 (SoftBan / 해제 / 강제 탈퇴)

SoftBan / 강제 탈퇴

1. 액션 버튼 클릭
2. prompt()로 사유 입력 (2~80자)
3. adminApi.softBanUser(userId, { reason }) 또는 forceWithdraw
4. POST /api/admin/users/{userId}/soft-ban 또는 force-withdraw
5. 서버 응답 ActionResultResponse(success)
6. success=true → onRefresh() → 대시보드 통합 재조회

SoftBan 해제

1. 액션 버튼 클릭
2. confirm() 확인
3. adminApi.releaseSoftBan(userId)
4. POST /api/admin/users/{userId}/soft-ban/release
5. 대시보드 재조회

본인 계정 / ADMIN 계정 / WITHDRAWN 상태는 액션 버튼 비활성화/숨김

액션 선택 → 사유 입력 → API 호출 → 통합 재조회 → 상태 반영

---

### D) 댓글 모더레이션 흐름 (숨김 / 복원 / 삭제)

숨김 / 삭제

1. 액션 버튼 클릭
2. prompt()로 사유 입력 (2~80자)
3. adminApi.hideComment 또는 deleteComment
4. POST /api/admin/comments/{commentId}/hide 또는 delete
5. 통합 재조회

복원

1. 액션 버튼 클릭
2. confirm() 확인
3. adminApi.restoreComment
4. POST /api/admin/comments/{commentId}/restore
5. 통합 재조회

상태(VISIBLE/REPORTED/HIDDEN/DELETED)에 따라 버튼 노출 분기

액션 선택 → 사유 입력 또는 확인 → API 호출 → 통합 재조회

---

## 2. 레이어별 역할 요약

### 1. 타입 정의 (`types/admin.ts`) [신규]

- `UserStatus`: ACTIVE / SOFT_BANNED / WITHDRAWN
- `AdminMetrics`: 통계 7개 (전체/활성/SoftBan/탈퇴 사용자 + 신고/숨김/삭제 댓글)
- `AdminUser`: 관리자 화면용 사용자 (id, name, email, role, status, createdAt, lastLoginAt, reportCount, softBanReason, softBannedAt, withdrawnAt, withdrawnReason)
- `AdminComment`: 모더레이션용 댓글
- `ModerationLog`: 액션 로그 (actionType, targetType, targetId, targetLabel, actorName, reason, createdAt)
- `AdminDashboardData`: 통합 응답 (metrics + users + comments + logs)
- `ModerationReasonRequest`: 사유 입력 요청
- `ActionResultResponse`: { success }

---

### 2. 관리자 API (`api/admin.ts`) [신규]

- `getDashboardData()` → GET `/admin/dashboard`: 통합 데이터 조회
- `softBanUser(userId, { reason })` → POST `/admin/users/{userId}/soft-ban`
- `releaseSoftBan(userId)` → POST `/admin/users/{userId}/soft-ban/release`
- `forceWithdraw(userId, { reason })` → POST `/admin/users/{userId}/force-withdraw`
- `hideComment(commentId, { reason })` → POST `/admin/comments/{commentId}/hide`
- `restoreComment(commentId)` → POST `/admin/comments/{commentId}/restore`
- `deleteComment(commentId, { reason })` → POST `/admin/comments/{commentId}/delete`

---

### 3. 관리자 메인 페이지 (`pages/admin/AdminPage.tsx`) [신규]

- 관리자 전용 메인 페이지
- isAdminUser(user) 검사로 권한 가드 (비관리자 → /dashboard 강제 이동)
- 통합 대시보드 데이터 1회 조회
- 4개 섹션 동시 렌더링 (AdminStats, AdminUserList, AdminCommentList, AdminModerationLog)
- 자식에서 호출하는 onRefresh로 통합 재조회

---

### 4. 통계 카드 (`pages/admin/AdminStats.tsx`) [신규]

- 사용자 현황 (전체 / 활성 / SoftBan / 탈퇴)
- 댓글 모더레이션 현황 (신고 / 숨김 / 삭제)
- 상태에 따라 색상 분리 (정상=초록, 경고=주황, 위험=빨강)

---

### 5. 사용자 관리 테이블 (`pages/admin/AdminUserList.tsx`) [신규]

- 사용자 ID / 이름+이메일 / 권한 / 상태 / 신고 누적 / 가입일 / 액션 컬럼
- 액션 분기:
  - 상태가 ACTIVE: SoftBan + 강제 탈퇴 버튼
  - 상태가 SOFT_BANNED: 해제 + 강제 탈퇴 버튼
  - 상태가 WITHDRAWN: 액션 없음
- prompt()로 사유 입력 받음 (2~80자 유효성 검사)
- 본인 계정 + ADMIN 계정은 액션 차단 ("-" 표시)
- SoftBan / 탈퇴 사유 표시

---

### 6. 댓글 모더레이션 (`pages/admin/AdminCommentList.tsx`) [신규]

- 모더레이션 대상 댓글 목록을 카드형으로 렌더링
- 각 댓글의 작성자 / 작성일 / 상태 배지 / 신고 횟수 표시
- 액션 분기:
  - VISIBLE / REPORTED: 숨김 + 삭제 버튼
  - HIDDEN: 복원 + 삭제 버튼
  - DELETED: 액션 없음
- 숨김 / 삭제 시 prompt()로 사유 입력, 복원은 confirm()

---

### 7. 모더레이션 로그 (`pages/admin/AdminModerationLog.tsx`) [신규]

- 최근 모더레이션 활동 기록 테이블
- 시간 / 액션 / 대상 / 대상 정보 / 처리자 / 사유 컬럼
- 액션 / 대상 타입을 한글로 변환 표시
- 시간은 yyyy.MM.dd HH:mm 형식

---

### 8. 스타일 (`pages/admin/AdminPage.css`) [신규]

- 통계 카드 그리드, 테이블형 사용자 목록
- 상태별 색상 배지 (활성=초록 / SoftBan=주황 / 탈퇴=빨강)
- 댓글 모더레이션 카드 + 로그 테이블
- 반응형 (모바일 시 grid 1열, 테이블 가로 스크롤)

---

### 9. 라우팅 추가 (`App.tsx` 수정)

- `/admin` → AdminPage (ProtectedRoute + SidebarLayout + 권한 가드)
- 기존 `/community`, `/community/:postId` 라우트는 그대로 유지

---

## 3. 이번 단계에서 구현한 범위

### 이번(7차) 구현 범위

- 관리자 권한 가드 (비관리자 자동 리다이렉트)
- 관리자 통합 대시보드 (통계 7지표 + 사용자 + 댓글 + 로그)
- 사용자 모더레이션 (SoftBan / 해제 / 강제 탈퇴) — prompt 기반 사유 입력
- 댓글 모더레이션 (숨김 / 복원 / 삭제) — prompt 기반 사유 입력
- 최근 모더레이션 활동 로그 표시
- 본인 계정 / ADMIN 계정 보호 (액션 차단)
- 테이블형 반응형 UI
- App.tsx `/admin` 라우트 추가

## 관리자 가드 → 통합 대시보드 조회 → 모더레이션 액션 → 통합 재조회 → 활동 로그 표시

### 다음 구현 예정 내용

- 사이드바 메뉴 재구성 (관리자 전용 섹션 + 페이지 내 앵커 메뉴)
- 인증 토큰 저장소 변경 (localStorage → sessionStorage, 탭별 독립 세션)
