import { useState } from 'react';
import type { FormEvent } from 'react';

export default function PostCreateForm(props: any) {
  const onSubmit = props.onSubmit;
  const onCancel = props.onCancel;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 게시글 작성 폼 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 유효성 검사 (백엔드 조건에 맞춤)
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setErrorMsg('제목을 입력해주세요.');
      return;
    }
    if (trimmedTitle.length < 2 || trimmedTitle.length > 80) {
      setErrorMsg('제목은 2자 이상 80자 이하로 입력해주세요.');
      return;
    }
    if (!trimmedContent) {
      setErrorMsg('내용을 입력해주세요.');
      return;
    }
    if (trimmedContent.length < 4 || trimmedContent.length > 1000) {
      setErrorMsg('내용은 4자 이상 1000자 이하로 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        content: trimmedContent,
      });
    } catch (err) {
      setErrorMsg('게시글 작성에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="post-form-card">
      <h2>새 글 쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div className="post-form-group">
          <label>제목 (2~80자)</label>
          <input
            type="text"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="post-form-group">
          <label>내용 (4~1000자)</label>
          <textarea
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
        </div>
        {errorMsg && <div className="post-form-error">{errorMsg}</div>}
        <div className="post-form-btns">
          <button
            className="community-btn community-btn-primary"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '등록'}
          </button>
          <button
            className="community-btn community-btn-secondary"
            type="button"
            onClick={onCancel}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}
