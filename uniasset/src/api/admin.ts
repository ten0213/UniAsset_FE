import apiClient from './client';
import type {
  AdminDashboardData,
  ActionResultResponse,
  ModerationReasonRequest,
} from '../types/admin';

export const adminApi = {
  // 관리자 대시보드 통합 조회 (통계 + 사용자 + 댓글 + 로그)
  getDashboardData() {
    return apiClient.get<AdminDashboardData>('/admin/dashboard');
  },

  // 사용자 SoftBan
  softBanUser(userId: number, data: ModerationReasonRequest) {
    return apiClient.post<ActionResultResponse>(`/admin/users/${userId}/soft-ban`, data);
  },

  // 사용자 SoftBan 해제
  releaseSoftBan(userId: number) {
    return apiClient.post<ActionResultResponse>(`/admin/users/${userId}/soft-ban/release`);
  },

  // 사용자 강제 탈퇴
  forceWithdraw(userId: number, data: ModerationReasonRequest) {
    return apiClient.post<ActionResultResponse>(`/admin/users/${userId}/force-withdraw`, data);
  },

  // 댓글 숨김
  hideComment(commentId: string, data: ModerationReasonRequest) {
    return apiClient.post<ActionResultResponse>(`/admin/comments/${commentId}/hide`, data);
  },

  // 댓글 복원
  restoreComment(commentId: string) {
    return apiClient.post<ActionResultResponse>(`/admin/comments/${commentId}/restore`);
  },

  // 댓글 삭제 (관리자 권한)
  deleteComment(commentId: string, data: ModerationReasonRequest) {
    return apiClient.post<ActionResultResponse>(`/admin/comments/${commentId}/delete`, data);
  },
};
