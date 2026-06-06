import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../../api/community';
import type { Post } from '../../types/community';
import PostCard from './PostCard';
import PostCreateForm from './PostCreateForm';
import './CommunityPage.css';

export default function CommunityPage() {
  const navigate = useNavigate();

  // 상태 관리
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 게시글 + 댓글 통합 조회
  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await communityApi.getPosts();
      setPosts(res.data);
    } catch {
      setError('게시글을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // 게시글 생성
  const handleCreatePost = async (data: any) => {
    await communityApi.createPost(data);
    setIsFormOpen(false);
    await loadPosts();
  };

  // 게시글 카드 클릭 → 상세 페이지로 이동 (state로 게시글 데이터 같이 전달)
  const handlePostClick = (postId: string) => {
    const found = posts.find((p) => p.id === postId);
    navigate(`/community/${postId}`, { state: { post: found } });
  };

  return (
    <div className="community-page">
      <div className="community-header">
        <h1>커뮤니티</h1>
        <p className="community-description">
          자산 관리 정보와 노하우를 다른 사용자와 공유해보세요.
        </p>
      </div>

      {error && <div className="community-error">{error}</div>}

      <div className="community-toolbar">
        <button
          className="community-btn community-btn-primary"
          onClick={() => setIsFormOpen(!isFormOpen)}
        >
          {isFormOpen ? '취소' : '+ 새 글 쓰기'}
        </button>
      </div>

      {isFormOpen && (
        <PostCreateForm
          onSubmit={handleCreatePost}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isLoading && <p className="community-loading">불러오는 중...</p>}

      {!isLoading && posts.length === 0 && (
        <div className="community-empty">
          <p>아직 게시글이 없습니다.</p>
          <p>첫 글을 작성해보세요!</p>
        </div>
      )}

      <div className="community-list">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={handlePostClick}
          />
        ))}
      </div>
    </div>
  );
}
