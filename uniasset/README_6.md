# 6번째 프로젝트 구현 내용 정리 파일

## 1. 커뮤니티 흐름 (데이터 흐름)

### A) 게시글 목록 + 댓글 통합 조회 흐름

페이지 진입

1. CommunityPage.useEffect()
2. communityApi.getPosts()
3. GET /api/community/posts
4. 서버 응답 [ Post(comments 포함), ... ]
5. posts 상태 업데이트
6. 게시글 카드 목록 UI 렌더링 (PostCard)
   - 카드에 좋아요 수 / 댓글 수(visible만) 표시

페이지 진입 → 통합 API 1회 호출 → 상태 반영 → 목록 UI 렌더링

---

### B) 게시글 작성 흐름

사용자 입력 (제목/내용)

1. PostCreateForm.handleSubmit()
2. 프론트 유효성 검증 (제목 2~80자, 내용 4~1000자 → 백엔드 조건과 동일)
3. onSubmit → communityApi.createPost({ title, content })
4. POST /api/community/posts
5. 서버 응답 CommunityPostDto
6. 작성 폼 닫기 + loadPosts() 재조회

입력 → 유효성 검증 → API 생성 → 목록 재조회 → UI 갱신

---

### C) 게시글 상세 보기 흐름

사용자 게시글 카드 클릭

1. CommunityPage.handlePostClick(postId) → 목록 중 해당 게시글을 navigate state로 전달
2. navigate(`/community/${postId}`, { state: { post } })
3. PostDetailPage가 location.state.post를 우선 사용
4. state가 없으면(직접 URL 접근) communityApi.getPosts() 다시 호출 후 postId로 필터링
5. 본문 + 좋아요 버튼 + 댓글 영역 UI 렌더링

카드 클릭 → state 전달 → 상세 렌더링 (또는 fallback 재조회)

> 백엔드에 단건 조회 API가 없어서 목록 데이터를 활용하는 방식으로 우회

---

### D) 게시글 좋아요 흐름

사용자 좋아요 버튼 클릭

1. PostDetailPage.handleLike()
2. communityApi.likePost(postId)
3. POST /api/community/posts/{postId}/like
4. 서버 응답 CommunityPostDto (likeCount 증가됨)
5. 기존 post에서 likeCount만 갱신 (comments는 그대로 유지)

좋아요 클릭 → API 호출 → likeCount만 갱신

---

### E) 댓글 작성 흐름

사용자 입력 (댓글 내용)

1. CommentForm.handleSubmit()
2. 빈 값 + 2자 이상 체크
3. communityApi.createComment({ postId, content })
4. POST /api/community/comments (postId가 body에 포함)
5. 서버 응답 CommunityCommentDto
6. content 초기화 + onCreated() → loadPost() 재조회
7. CommentList에서 받은 배열을 slice().reverse() 처리 → 새 댓글이 목록 맨 아래에 표시됨

입력 → API 호출 → 게시글 + 댓글 재조회 → reverse 정렬 → 새 댓글 아래쪽에 표시

> 백엔드는 createdAt DESC(최신순)로 주지만 사용자는 "위로 갈수록 오래된 글"이 자연스러워서 프론트에서 뒤집음

---

### F) 댓글 신고 흐름

사용자 신고 버튼 클릭 (본인 댓글 제외)

1. CommentList.handleReport(commentId)
2. confirm() 확인 대화상자
3. communityApi.reportComment(commentId)
4. POST /api/community/comments/{commentId}/report
5. 서버 응답 CommunityCommentDto (status=REPORTED, reportCount 증가)
6. onChanged() → loadPost() 재조회

본인 댓글이면 신고 버튼 숨김, HIDDEN/DELETED 상태면 안내 문구로 대체

신고 클릭 → 확인 → API 호출 → 게시글 재조회 → 상태 반영

---

## 2. 레이어별 역할 요약

### 1. 타입 정의 (`types/community.ts`)

- `CommentStatus`: VISIBLE / REPORTED / HIDDEN / DELETED
- `Post`: 게시글 (id=string UUID, title, content, authorId, authorName, createdAt, likeCount, comments)
  - 댓글 배열을 같이 받음 (백엔드 통합 응답에 맞춤)
- `Comment`: 댓글 (id=string, postId=string, content, authorId, authorName, createdAt, status, reportCount)
- `PostCreateRequest`: 게시글 작성 요청 (title, content)
- `CommentCreateRequest`: 댓글 작성 요청 (postId, content) — postId가 body에 포함됨
- 게시글 수정/삭제 / 댓글 사용자 삭제 요청은 백엔드에 없으므로 제거

---

### 2. 커뮤니티 API (`api/community.ts`)

- `getPosts()` → GET `/community/posts`: 게시글 + 댓글 통합 조회
- `createPost(data)` → POST `/community/posts`: 게시글 생성
- `createComment(data)` → POST `/community/comments`: 댓글 생성 (postId가 body)
- `likePost(postId)` → POST `/community/posts/{postId}/like`: 좋아요
- `reportComment(commentId)` → POST `/community/comments/{commentId}/report`: 댓글 신고
- 백엔드에 없는 단건 조회 / 수정 / 삭제는 정의하지 않음

---

### 3. 커뮤니티 메인 페이지 (`pages/community/CommunityPage.tsx`)

- 게시글 목록 + 작성 폼 토글
- 기능
  - 게시글 + 댓글 통합 조회 (1회 호출로 모든 데이터)
  - "+ 새 글 쓰기" 버튼으로 PostCreateForm 토글
  - 카드 클릭 시 navigate state로 해당 post 객체 전달 → 상세 페이지에서 추가 조회 없이 사용
- 로딩/에러 상태 관리

---

### 4. 게시글 카드 (`pages/community/PostCard.tsx`)

- 게시글 목록의 개별 카드
- 제목, 본문 미리보기(line-clamp), 작성자, 작성일, 좋아요 수, 댓글 수(DELETED 제외) 표시
- 카드 클릭 시 부모의 onClick(post.id) 호출

---

### 5. 게시글 작성 폼 (`pages/community/PostCreateForm.tsx`)

- 제목 / 내용 입력 폼
- 프론트 유효성 검증 (백엔드 조건과 동일하게 2~80자 / 4~1000자)
- 저장 중 버튼 비활성화로 중복 요청 방지

---

### 6. 게시글 상세 페이지 (`pages/community/PostDetailPage.tsx`)

- `useParams<{ postId: string }>`로 postId 받아옴 (string 그대로 사용)
- 1차: `location.state.post` 활용 → 추가 API 호출 없음
- 2차(fallback): state가 없으면 getPosts() 호출 후 필터링
- 게시글 본문 + 좋아요 버튼 + 댓글 영역
- 게시글 수정/삭제 제거 (백엔드 미지원)
- 좋아요 버튼: likePost API 후 likeCount만 부분 갱신

---

### 7. 댓글 목록 (`pages/community/CommentList.tsx`)

- props로 받은 comments 배열을 `slice().reverse()`로 뒤집어 정렬
  - 백엔드는 createdAt DESC로 주지만, 사용자 입장에서 새 댓글이 아래에 추가되는 게 자연스러워서 뒤집음
  - 원본 배열을 건드리지 않도록 slice()로 얕은 복사 후 reverse()
- 정렬된 배열을 map으로 렌더링
- 상태별 분기:
  - VISIBLE: 정상 표시
  - REPORTED: "신고됨" 배지 + 정상 표시
  - HIDDEN: "관리자에 의해 숨겨진 댓글입니다." 안내 박스
  - DELETED: "관리자에 의해 삭제된 댓글입니다." 안내 박스
- 본인 댓글이 아니면 "신고" 버튼 노출 (사용자 직접 삭제 기능은 백엔드에 없으므로 신고로 대체)

---

### 8. 댓글 작성 폼 (`pages/community/CommentForm.tsx`)

- textarea + 등록 버튼
- 빈 값 + 2자 이상 체크 (백엔드 검증과 동일)
- communityApi.createComment에 postId를 body로 함께 전송

---

### 9. 스타일 (`pages/community/CommunityPage.css`)

- 커뮤니티: 카드형 목록 + 상세 + 댓글 박스, 좋아요 / 신고 버튼, 숨김/삭제 댓글 안내 박스, 신고됨 배지
- 반응형 (모바일 시 grid 1열)

---

### 10. 라우팅 연결 (`App.tsx`)

- `/community` → CommunityPage (ProtectedRoute + SidebarLayout)
- `/community/:postId` → PostDetailPage (state 우선, 없으면 재조회)

---

## 3. 이번 단계에서 구현한 범위

### 이번(6차) 구현 범위

- 백엔드 `/api/community` 엔드포인트에 맞춘 프론트 매핑
- 게시글 + 댓글 통합 조회 (1회 API 호출)
- 게시글 작성 (백엔드 검증 조건과 동일한 프론트 유효성)
- 게시글 좋아요 / 댓글 신고 기능
- 댓글 상태별 표시 (정상 / 신고됨 / 숨김 / 삭제)
- 댓글 정렬 reverse 처리 (새 댓글이 목록 맨 아래에 추가되도록)
- 카드형 반응형 UI
- App.tsx 라우트 2개 (`/community`, `/community/:postId`)

## 통합 조회 기반 데이터 흐름 → 상태별 UI 분기 → 댓글 정렬 reverse → 좋아요/신고 액션

### 다음 구현 예정 내용

- 관리자 페이지 (통계 / 사용자 모더레이션 / 댓글 모더레이션 / 활동 로그)
- 사이드바 관리자 전용 섹션 + 페이지 내 앵커 메뉴
