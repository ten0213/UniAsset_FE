import { useState } from 'react';
import { communityApi } from '../../api/community';
import type { Comment } from '../../types/community';

// 댓글용 날짜 포맷 (이 파일 안에 선언)
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate();
}

export default function CommentList(props: any) {
  const comments: Comment[] = props.comments;
  const currentUserId = props.currentUserId;
  const onChanged = props.onChanged; // 신고 후 새로고침용

  const [reportingId, setReportingId] = useState<string | null>(null);

  // 백엔드는 최신순으로 주는데 새 댓글이 아래로 가게 뒤집기
  const ordered = comments.slice().reverse();

  // 댓글 신고
  const handleReport = async (commentId: string) => {
    if (confirm('이 댓글을 신고하시겠습니까?') == false) return;

    setReportingId(commentId);
    try {
      await communityApi.reportComment(commentId);
      alert('신고가 접수되었습니다.');
      if (onChanged) {
        await onChanged();
      }
    } catch (err) {
      alert('신고에 실패했습니다.');
    } finally {
      setReportingId(null);
    }
  };

  if (ordered.length === 0) {
    return (
      <div className="comment-empty">
        <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
      </div>
    );
  }

  return (
    <div className="comment-list">
      {ordered.map((c) => {
        // 본인 댓글인지 확인
        let isMine = false;
        if (currentUserId != null && c.authorId === currentUserId) {
          isMine = true;
        }

        // 상태에 따른 메시지 분기
        if (c.status === 'DELETED') {
          return (
            <div key={c.id} className="comment-item comment-item-removed">
              <p className="comment-removed-text">관리자에 의해 삭제된 댓글입니다.</p>
            </div>
          );
        }

        if (c.status === 'HIDDEN') {
          return (
            <div key={c.id} className="comment-item comment-item-removed">
              <p className="comment-removed-text">관리자에 의해 숨겨진 댓글입니다.</p>
            </div>
          );
        }

        return (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{c.authorName}</span>
              <span className="comment-date">{formatDate(c.createdAt)}</span>
            </div>
            <div className="comment-content">{c.content}</div>
            {!isMine && (
              <button
                className="community-btn community-btn-secondary comment-report-btn"
                onClick={() => handleReport(c.id)}
                disabled={reportingId === c.id}
              >
                {reportingId === c.id ? '신고 중...' : '신고'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
