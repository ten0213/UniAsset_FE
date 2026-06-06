// 댓글 상태 (백엔드 CommentStatus와 동일)
export type CommentStatus = 'VISIBLE' | 'REPORTED' | 'HIDDEN' | 'DELETED';

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  status: CommentStatus;
  reportCount: number;
}

// 게시글 (백엔드와 매핑 동기화)
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: string;
  likeCount: number;
  comments: Comment[];
}

export interface PostCreateRequest {
  title: string;
  content: string;
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
}
