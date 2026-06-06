import type { Post } from '../../types/community';

// 날짜 포맷 함수 (이 파일용)
function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return year + '.' + month + '.' + day;
}

export default function PostCard(props: any) {
  const post: Post = props.post;
  const onClick = props.onClick;

  // 보여줄 댓글 수 계산 (삭제된 건 제외하고 셈)
  let visibleCommentCount = 0;
  for (let i = 0; i < post.comments.length; i++) {
    if (post.comments[i].status !== 'DELETED') {
      visibleCommentCount = visibleCommentCount + 1;
    }
  }

  // 카드 클릭시 부모에서 받은 함수 호출
  const handleClick = () => {
    onClick(post.id);
  };

  return (
    <div className="post-card" onClick={handleClick}>
      <div className="post-card-header">
        <h3>{post.title}</h3>
      </div>
      <p className="post-card-preview">{post.content}</p>
      <div className="post-card-footer">
        <span className="post-card-author">{post.authorName}</span>
        <span className="post-card-date">{formatDate(post.createdAt)}</span>
        <span className="post-card-like">♥ {post.likeCount}</span>
        <span className="post-card-comment">댓글 {visibleCommentCount}</span>
      </div>
    </div>
  );
}
