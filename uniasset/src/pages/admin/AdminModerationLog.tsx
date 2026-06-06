import type { ModerationLog } from '../../types/admin';

// 날짜+시간 포맷
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

// 액션 타입 한글 변환
function actionText(action: string): string {
  if (action === 'SOFT_BAN') return 'SoftBan';
  if (action === 'RELEASE_SOFT_BAN') return 'SoftBan 해제';
  if (action === 'FORCE_WITHDRAW') return '강제 탈퇴';
  if (action === 'HIDE_COMMENT') return '댓글 숨김';
  if (action === 'RESTORE_COMMENT') return '댓글 복원';
  if (action === 'DELETE_COMMENT') return '댓글 삭제';
  return action;
}

// 대상 타입 한글 변환
function targetText(target: string): string {
  if (target === 'USER') return '사용자';
  if (target === 'COMMENT') return '댓글';
  return target;
}

export default function AdminModerationLog(props: any) {
  const logs: ModerationLog[] = props.logs;

  if (logs.length === 0) {
    return (
      <div className="admin-log-card">
        <h2>모더레이션 기록</h2>
        <p className="admin-empty">기록된 모더레이션 활동이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="admin-log-card">
      <h2>모더레이션 기록 (최근 {logs.length}건)</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>액션</th>
              <th>대상</th>
              <th>대상 정보</th>
              <th>처리자</th>
              <th>사유</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="admin-log-time">{formatDateTime(log.createdAt)}</td>
                <td>
                  <span className="admin-log-action">{actionText(log.actionType)}</span>
                </td>
                <td>{targetText(log.targetType)}</td>
                <td className="admin-log-target">{log.targetLabel}</td>
                <td>{log.actorName}</td>
                <td className="admin-log-reason">{log.reason || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
