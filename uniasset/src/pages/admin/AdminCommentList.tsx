import { useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminComment } from '../../types/admin';

// 날짜를 보기 좋게 바꾸는 함수
function formatDate(dateStr: string): string {
  if (dateStr === '') {
    return '';
  }

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return year + '.' + month + '.' + day;
}

// 댓글 상태를 한글로 바꾸는 함수
function statusText(status: string): string {
  if (status === 'VISIBLE') {
    return '정상';
  }

  if (status === 'REPORTED') {
    return '신고됨';
  }

  if (status === 'HIDDEN') {
    return '숨김';
  }

  if (status === 'DELETED') {
    return '삭제됨';
  }

  return status;
}

// 댓글 상태에 따라 CSS 클래스 이름을 정하는 함수
function statusClass(status: string): string {
  if (status === 'VISIBLE') {
    return 'admin-comment-visible';
  }

  if (status === 'REPORTED') {
    return 'admin-comment-reported';
  }

  if (status === 'HIDDEN') {
    return 'admin-comment-hidden';
  }

  if (status === 'DELETED') {
    return 'admin-comment-deleted';
  }

  return '';
}

export default function AdminCommentList(props: any) {
  // 부모 컴포넌트에서 받은 값들
  const comments: AdminComment[] = props.comments;
  const onRefresh = props.onRefresh;
  const onError = props.onError;

  // 현재 처리 중인 댓글 id 저장
  const [busyId, setBusyId] = useState<string | null>(null);

  // 댓글 숨김 처리
  const handleHide = async (commentId: string) => {
    const reason = prompt('숨김 처리 사유를 입력해주세요. (2~80자)');

    if (!reason) {
      return;
    }

    const reasonText = reason.trim();

    if (reasonText.length < 2) {
      alert('사유는 2자 이상이어야 합니다.');
      return;
    }

    setBusyId(commentId);

    try {
      const result = await adminApi.hideComment(commentId, {
        reason: reasonText,
      });

      if (result.data.success) {
        await onRefresh();
      } else {
        onError('숨김 처리에 실패했습니다.');
      }
    } catch (err) {
      console.log(err);
      onError('숨김 처리에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  // 댓글 복원 처리
  const handleRestore = async (commentId: string) => {
    const ok = confirm('해당 댓글을 복원하시겠습니까?');

    if (ok === false) {
      return;
    }

    setBusyId(commentId);

    try {
      const result = await adminApi.restoreComment(commentId);

      if (result.data.success) {
        await onRefresh();
      } else {
        onError('복원에 실패했습니다.');
      }
    } catch (err) {
      console.log(err);
      onError('복원에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  // 댓글 삭제 처리
  const handleDelete = async (commentId: string) => {
    const reason = prompt('삭제 사유를 입력해주세요. (2~80자)');

    if (!reason) {
      return;
    }

    const reasonText = reason.trim();

    if (reasonText.length < 2) {
      alert('사유는 2자 이상이어야 합니다.');
      return;
    }

    setBusyId(commentId);

    try {
      const result = await adminApi.deleteComment(commentId, {
        reason: reasonText,
      });

      if (result.data.success) {
        await onRefresh();
      } else {
        onError('삭제에 실패했습니다.');
      }
    } catch (err) {
      console.log(err);
      onError('삭제에 실패했습니다.');
    } finally {
      setBusyId(null);
    }
  };

  // 댓글이 없을 때
  if (comments.length === 0) {
    return (
      <div className="admin-comment-card">
        <h2>댓글 모더레이션</h2>
        <p className="admin-empty">관리 대상 댓글이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="admin-comment-card">
      <h2>댓글 모더레이션 ({comments.length}개)</h2>

      <div className="admin-comment-list">
        {comments.map((comment) => {
          // 처리 중인 댓글인지 확인
          let isBusy = false;

          if (busyId === comment.id) {
            isBusy = true;
          }

          // 숨김 버튼을 보여줄지 확인
          let showHideButton = true;

          if (comment.status === 'HIDDEN') {
            showHideButton = false;
          }

          if (comment.status === 'DELETED') {
            showHideButton = false;
          }

          // 복원 버튼을 보여줄지 확인
          let showRestoreButton = false;

          if (comment.status === 'HIDDEN') {
            showRestoreButton = true;
          }

          // 삭제 버튼을 보여줄지 확인
          let showDeleteButton = true;

          if (comment.status === 'DELETED') {
            showDeleteButton = false;
          }

          // 신고 수가 있는지 확인
          let hasReport = false;

          if (comment.reportCount > 0) {
            hasReport = true;
          }

          return (
            <div key={comment.id} className="admin-comment-item">
              <div className="admin-comment-header">
                <span className="admin-comment-author">
                  {comment.authorName}
                </span>

                <span className="admin-comment-date">
                  {formatDate(comment.createdAt)}
                </span>

                <span className={'admin-comment-status ' + statusClass(comment.status)}>
                  {statusText(comment.status)}
                </span>

                {hasReport && (
                  <span className="admin-comment-report">
                    신고 {comment.reportCount}회
                  </span>
                )}
              </div>

              <div className="admin-comment-content">
                {comment.content}
              </div>

              <div className="admin-comment-actions">
                {showHideButton && (
                  <button
                    className="community-btn community-btn-secondary admin-action-btn"
                    onClick={() => handleHide(comment.id)}
                    disabled={isBusy}
                  >
                    숨김
                  </button>
                )}

                {showRestoreButton && (
                  <button
                    className="community-btn community-btn-secondary admin-action-btn"
                    onClick={() => handleRestore(comment.id)}
                    disabled={isBusy}
                  >
                    복원
                  </button>
                )}

                {showDeleteButton && (
                  <button
                    className="community-btn community-btn-danger admin-action-btn"
                    onClick={() => handleDelete(comment.id)}
                    disabled={isBusy}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
