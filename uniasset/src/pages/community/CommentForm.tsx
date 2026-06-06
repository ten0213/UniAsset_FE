import { useState } from 'react';

import { communityApi } from '../../api/community';

export default function CommentForm(props: any) {
  const postId: string = props.postId;
  const onCreated = props.onCreated;

  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 댓글 작성
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('댓글 내용을 입력해주세요!');
      return;
    }
    if (content.trim().length < 2) {
      alert('댓글은 2자 이상 입력해주세요!');
      return;
    }

    setIsSaving(true);
    try {
      // 백엔드에 postId도 같이 body에 보냄
      await communityApi.createComment({
        postId: postId,
        content: content.trim(),
      });
      setContent('');
      await onCreated();
    } catch (err) {
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        placeholder="댓글을 입력해주세요 (2자 이상)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <button
        type="submit"
        className="community-btn community-btn-primary"
        disabled={isSaving}
      >
        {isSaving ? '등록 중...' : '댓글 등록'}
      </button>
    </form>
  );
}
