import type { CommentStatus } from './community';
import type { UserRole } from './auth';

// 사용자 상태
export type UserStatus = 'ACTIVE' | 'SOFT_BANNED' | 'WITHDRAWN';

// 관리자 대시보드 통계
export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  softBannedUsers: number;
  withdrawnUsers: number;
  reportedComments: number;
  hiddenComments: number;
  deletedComments: number;
}

// 관리자 화면용 사용자 정보
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string | null;
  lastLoginAt: string | null;
  reportCount: number;
  softBanReason: string | null;
  softBannedAt: string | null;
  withdrawnAt: string | null;
  withdrawnReason: string | null;
}

// 관리자 화면에 보여줄 댓글 (모더레이션 대상)
export interface AdminComment {
  id: string;
  postId: string;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  status: CommentStatus;
  reportCount: number;
}

// 모더레이션 기록 로그
export interface ModerationLog {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string;
  targetLabel: string;
  actorName: string;
  reason: string | null;
  createdAt: string;
}

// 통합 응답
export interface AdminDashboardData {
  metrics: AdminMetrics;
  users: AdminUser[];
  comments: AdminComment[];
  logs: ModerationLog[];
}

// 사유 입력 요청
export interface ModerationReasonRequest {
  reason: string;
}

// 액션 결과
export interface ActionResultResponse {
  success: boolean;
}
