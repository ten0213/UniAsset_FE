import { useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminUser, UserStatus } from '../../types/admin';

// 날짜 포맷 함수
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
}

// 사용자 상태 한글 변환
function statusText(status: UserStatus): string {
  if (status === 'ACTIVE') return '활성';
  if (status === 'SOFT_BANNED') return 'SoftBan';
  if (status === 'WITHDRAWN') return '탈퇴';
  return status;
}

// 사용자 상태별 클래스
function statusClass(status: UserStatus): string {
  if (status === 'ACTIVE') return 'admin-status-active';
  if (status === 'SOFT_BANNED') return 'admin-status-soft';
  if (status === 'WITHDRAWN') return 'admin-status-withdrawn';
  return '';
}

export default function AdminUserList(props: any) {
  const users: AdminUser[] = props.users;
  const currentUserId = props.currentUserId;
  const onRefresh = props.onRefresh;
  const onError = props.onError;

  const [busyId, setBusyId] = useState<number | null>(null);

  // SoftBan 처리
  const handleSoftBan = async (userId: number, name: string) => {
    const reason = prompt(`${name} 사용자를 SoftBan 처리합니다. 사유를 입력해주세요. (2~80자)`);
    if (!reason) return;
    if (reason.trim().length < 2) {
      alert('사유는 2자 이상이어야 합니다.');
      return;
    }

    setBusyId(userId);
    try {
      const res = await adminApi.softBanUser(userId, { reason: reason.trim() });
      if (res.data.success) {
        await onRefresh();
      } else {
        onError('SoftBan 처리에 실패했습니다.');
      }
    } catch (err) {
      onError('SoftBan 처리에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  // SoftBan 해제
  const handleRelease = async (userId: number, name: string) => {
    if (confirm(`${name} 사용자의 SoftBan을 해제하시겠습니까?`) == false) return;

    setBusyId(userId);
    try {
      const res = await adminApi.releaseSoftBan(userId);
      if (res.data.success) {
        await onRefresh();
      } else {
        onError('SoftBan 해제에 실패했습니다.');
      }
    } catch (err) {
      onError('SoftBan 해제에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  // 강제 탈퇴
  const handleForceWithdraw = async (userId: number, name: string) => {
    const reason = prompt(`${name} 사용자를 강제 탈퇴 처리합니다. 사유를 입력해주세요. (2~80자)`);
    if (!reason) return;
    if (reason.trim().length < 2) {
      alert('사유는 2자 이상이어야 합니다.');
      return;
    }

    setBusyId(userId);
    try {
      const res = await adminApi.forceWithdraw(userId, { reason: reason.trim() });
      if (res.data.success) {
        await onRefresh();
      } else {
        onError('강제 탈퇴 처리에 실패했습니다.');
      }
    } catch (err) {
      onError('강제 탈퇴 처리에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="admin-user-card">
        <h2>사용자 관리</h2>
        <p className="admin-empty">사용자가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="admin-user-card">
      <h2>사용자 관리 ({users.length}명)</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>이름 / 이메일</th>
              <th>권한</th>
              <th>상태</th>
              <th>신고 누적</th>
              <th>가입일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              // 본인 계정 여부
              let isMe = false;
              if (currentUserId != null && u.id === currentUserId) {
                isMe = true;
              }
              const isBusy = busyId === u.id;
              const isAdminAccount = u.role === 'ADMIN';

              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <div className="admin-user-name">
                      {u.name}
                      {isMe && <span className="admin-me-badge">나</span>}
                    </div>
                    <div className="admin-user-email">{u.email}</div>
                  </td>
                  <td>
                    <span className={isAdminAccount ? 'admin-role-admin' : 'admin-role-user'}>
                      {isAdminAccount ? '관리자' : '일반'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-status ${statusClass(u.status)}`}>
                      {statusText(u.status)}
                    </span>
                    {u.softBanReason && (
                      <div className="admin-reason-text">사유: {u.softBanReason}</div>
                    )}
                    {u.withdrawnReason && (
                      <div className="admin-reason-text">사유: {u.withdrawnReason}</div>
                    )}
                  </td>
                  <td>{u.reportCount}</td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="admin-action-btns">
                      {u.status === 'ACTIVE' && !isAdminAccount && !isMe && (
                        <button
                          className="community-btn community-btn-secondary admin-action-btn"
                          onClick={() => handleSoftBan(u.id, u.name)}
                          disabled={isBusy}
                        >
                          SoftBan
                        </button>
                      )}
                      {u.status === 'SOFT_BANNED' && !isAdminAccount && !isMe && (
                        <button
                          className="community-btn community-btn-secondary admin-action-btn"
                          onClick={() => handleRelease(u.id, u.name)}
                          disabled={isBusy}
                        >
                          해제
                        </button>
                      )}
                      {u.status !== 'WITHDRAWN' && !isAdminAccount && !isMe && (
                        <button
                          className="community-btn community-btn-danger admin-action-btn"
                          onClick={() => handleForceWithdraw(u.id, u.name)}
                          disabled={isBusy}
                        >
                          강제 탈퇴
                        </button>
                      )}
                      {(isAdminAccount || isMe) && (
                        <span className="admin-no-action">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
