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

## (04/24) 3번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_3 참조)

```
App.tsx (수정)                             : 사이드바 포함 라우팅 구조로 변경(Outlet 미사용)
components/auth/ProtectedRoute.tsx (수정)  : children 반환 방식으로 단순화
pages/Sidebar.tsx                         : 왼쪽 사이드바 컴포넌트
pages/SidebarLayout.tsx                   : 사이드바 + 콘텐츠 레이아웃
pages/Sidebar.css                         : 사이드바 스타일
pages/GoalPage.tsx                        : 투자 목표 최소 페이지
pages/GoalPage.css                        : 투자 목표 최소 스타일
pages/SimulatorPage.tsx                   : 시뮬레이터 최소 페이지
pages/SimulatorPage.css                   : 시뮬레이터 최소 스타일
```

---

## (05/09) 4번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_4 참조)

```
types/auth.ts (수정)          : UserRole 타입 추가, User 인터페이스에 role 필드 추가
constants/auth.ts (신규)      : isAdminUser() 권한 확인 유틸 함수
api/client.ts (수정)          : 401 에러 시 인증 엔드포인트 제외 처리
store/useAuthStore.ts (수정)  : 에러 메시지 매핑 단순화 (서버 메시지 의존도 제거)
pages/auth/LoginPage.tsx (수정): 이메일→아이디 입력 변경, 역할별 로그인 후 라우팅 분기
pages/Sidebar.tsx (수정)      : 메뉴 배열화, 섹션 분리(커뮤니티/관리자), 권한 기반 메뉴 노출
pages/SidebarLayout.tsx (수정): any → SidebarLayoutProps 인터페이스 타입 안전성 개선
pages/Sidebar.css (수정)      : 너비 확장, 섹션 구분선/라벨, 서브타이틀 스타일
vite.config.ts (수정)         : 프록시 포트 8080 → 8081 변경
```

---

## (05/24) 5번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_5 참조)

```
types/goal.ts (신규)                              : Goal/GoalCreateRequest/GoalUpdateRequest 타입 정의
api/goal.ts (신규)                                 : 목표 CRUD API 함수 (getGoals/createGoal/updateGoal/deleteGoal)
pages/goal/GoalPage.tsx (신규)                     : 목표 관리 메인 페이지 + 대시보드 데이터 연동
pages/goal/GoalSummary.tsx (신규)                  : 대시보드 기반 자산 현황 요약 카드
pages/goal/GoalOverview.tsx (신규)                 : 전체 목표 종합 현황 + 전체 달성률 + 저축 초과 경고
pages/goal/GoalCreateForm.tsx (신규)               : 목표 생성 폼 + 유효성 검증 + 월 잉여자금 빠른 입력
pages/goal/GoalCard.tsx (신규)                     : 목표 카드 + 진행률/달성예상일 계산 + 저축액 수정/삭제
pages/goal/GoalPage.css (신규)                     : 목표 페이지 카드형 반응형 스타일
pages/simulator/SimulatorPage.tsx (신규)           : 시뮬레이터 메인 + 월 복리 계산 + 목표/대시보드 연동
pages/simulator/SimQuickInput.tsx (신규)           : 빠른 입력 (목표 선택/대시보드 데이터)
pages/simulator/SimulatorForm.tsx (신규)           : 투자 정보 입력 폼 (초기자산/월투자/수익률/기간)
pages/simulator/SimResult.tsx (신규)               : 시뮬레이션 결과 (최종자산/투자금/수익금/연도별 테이블)
pages/simulator/SimGoalInfo.tsx (신규)             : 선택 목표 정보 + 달성 가능 여부 비교
pages/simulator/SimulatorPage.css (신규)           : 시뮬레이터 카드/테이블/결과 반응형 스타일
.env.local (신규)                                  : VITE_API_BASE_URL, VITE_API_PROXY_TARGET 환경변수 분리
vite.config.ts (수정)                              : 하드코딩 주소 → process.env.VITE_API_PROXY_TARGET 참조
```

---

## (06/06) 6번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_6 참조)

```
types/community.ts (신규)                          : Post(comments 포함)/Comment(status/reportCount)/CreateRequest 타입 정의
api/community.ts (신규)                            : 게시글 통합 조회 + 작성 + 댓글 작성 + 좋아요 + 신고 API (/api/community)
pages/community/CommunityPage.tsx (신규)           : 커뮤니티 메인 + 통합 조회 + 작성 폼 토글 + state로 상세 전달
pages/community/PostCard.tsx (신규)                : 게시글 카드 (제목/미리보기/작성자/좋아요/댓글 수)
pages/community/PostCreateForm.tsx (신규)          : 게시글 작성 폼 + 백엔드 검증과 동일한 유효성 (제목 2~80, 내용 4~1000)
pages/community/PostDetailPage.tsx (신규)          : 게시글 상세 + 좋아요 + 댓글 영역 (state 우선, 없으면 목록 재조회)
pages/community/CommentList.tsx (신규)             : 댓글 목록 + 상태별 분기(정상/신고됨/숨김/삭제) + 신고 버튼 + slice().reverse()로 새 댓글 아래 정렬
pages/community/CommentForm.tsx (신규)             : 댓글 작성 (postId body 포함)
pages/community/CommunityPage.css (신규)           : 커뮤니티 카드/상세/댓글/좋아요/신고 반응형 스타일
App.tsx (수정)                                     : /community, /community/:postId 라우트 추가
```

---

## (06/06) 7번째 프로젝트 구현 한눈에 보기(자세한 내용은 README_7 참조)

```
types/admin.ts (신규)                              : AdminDashboardData/Metrics/AdminUser/AdminComment/ModerationLog 타입 정의
api/admin.ts (신규)                                : 통합 대시보드 조회 + 사용자/댓글 모더레이션 6종 API (/api/admin)
pages/admin/AdminPage.tsx (신규)                   : 관리자 메인 + 권한 가드 + 통합 대시보드 1회 조회 → 4섹션 렌더링
pages/admin/AdminStats.tsx (신규)                  : 사용자/댓글 통계 7개 지표 카드 (활성/SoftBan/탈퇴/신고/숨김/삭제)
pages/admin/AdminUserList.tsx (신규)               : 사용자 모더레이션 테이블 (SoftBan/해제/강제 탈퇴, 본인/관리자 보호)
pages/admin/AdminCommentList.tsx (신규)            : 댓글 모더레이션 카드 (숨김/복원/삭제, 상태별 액션 분기)
pages/admin/AdminModerationLog.tsx (신규)          : 최근 모더레이션 활동 로그 테이블 (액션/대상/처리자/사유)
pages/admin/AdminPage.css (신규)                   : 통계 카드 + 테이블 + 상태 배지 + 댓글 카드 + 로그 반응형 스타일
App.tsx (수정)                                     : /admin 라우트 추가
```

---
