import type { AdminMetrics } from '../../types/admin';

// 숫자 포맷 함수
function formatNumber(num: number): string {
  if (num == null) return '0';
  return num.toLocaleString('ko-KR');
}

export default function AdminStats(props: any) {
  const metrics: AdminMetrics | null = props.metrics;

  if (!metrics) {
    return null;
  }

  return (
    <div className="admin-stats-wrap">
      {/* 사용자 통계 */}
      <div className="admin-stats-card">
        <h2>사용자 현황</h2>
        <div className="admin-stats-grid">
          <div className="admin-stats-item">
            <span className="admin-stats-label">전체 사용자</span>
            <span className="admin-stats-value">{formatNumber(metrics.totalUsers)}명</span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">활성 사용자</span>
            <span className="admin-stats-value admin-stats-positive">
              {formatNumber(metrics.activeUsers)}명
            </span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">SoftBan</span>
            <span className="admin-stats-value admin-stats-warning">
              {formatNumber(metrics.softBannedUsers)}명
            </span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">탈퇴</span>
            <span className="admin-stats-value admin-stats-negative">
              {formatNumber(metrics.withdrawnUsers)}명
            </span>
          </div>
        </div>
      </div>

      {/* 댓글 통계 */}
      <div className="admin-stats-card">
        <h2>댓글 모더레이션 현황</h2>
        <div className="admin-stats-grid">
          <div className="admin-stats-item">
            <span className="admin-stats-label">신고된 댓글</span>
            <span className="admin-stats-value admin-stats-warning">
              {formatNumber(metrics.reportedComments)}개
            </span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">숨김 처리</span>
            <span className="admin-stats-value">{formatNumber(metrics.hiddenComments)}개</span>
          </div>
          <div className="admin-stats-item">
            <span className="admin-stats-label">삭제됨</span>
            <span className="admin-stats-value admin-stats-negative">
              {formatNumber(metrics.deletedComments)}개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
