import apiClient from './client';
import type {
  Post,
  Comment,
  PostCreateRequest,
  CommentCreateRequest,
} from '../types/community';

export const communityApi = {
  // 게시글 + 댓글 통합 조회
  getPosts() {
    return apiClient.get<Post[]>('/community/posts');
  },

  // 게시글 작성
  createPost(data: PostCreateRequest) {
    return apiClient.post<Post>('/community/posts', data);
  },

  // 댓글 작성 (postId는 body에 포함됨)
  createComment(data: CommentCreateRequest) {
    return apiClient.post<Comment>('/community/comments', data);
  },

  // 게시글 좋아요
  likePost(postId: string) {
    return apiClient.post<Post>(`/community/posts/${postId}/like`);
  },

  // 댓글 신고
  reportComment(commentId: string) {
    return apiClient.post<Comment>(`/community/comments/${commentId}/report`);
  },
};
