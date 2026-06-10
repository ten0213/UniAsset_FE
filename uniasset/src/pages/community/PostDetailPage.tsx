import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { communityApi } from '../../api/community';
import { useAuthStore } from '../../store/useAuthStore';
import type { Post } from '../../types/community';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import './CommunityPage.css';

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

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인한 사용자 정보 가져오기
  const user = useAuthStore((state) => state.user);

  // 주소에서 postId 가져오기
  let postId = '';

  if (params.postId) {
    postId = params.postId;
  }

  // 목록 페이지에서 넘어올 때 게시글 정보를 같이 받아온 경우
  const locationState = location.state as any;
  let statePost: Post | null = null;

  if (locationState && locationState.post) {
    statePost = locationState.post;
  }

  const [post, setPost] = useState<Post | null>(statePost);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  // 게시글 불러오기
  const loadPost = async () => {
    try {
      setError('');

      // 현재 게시글 단건 조회 API가 없어서 전체 게시글을 불러온다
      const response = await communityApi.getPosts();

      let foundPost: Post | null = null;

      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].id === postId) {
          foundPost = response.data[i];
          break;
        }
      }

      if (foundPost) {
        setPost(foundPost);
      } else {
        setError('게시글을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.log(err);
      setError('게시글을 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    const getPost = async () => {
      if (postId === '') {
        return;
      }

      setIsLoading(true);

      // 목록에서 게시글 정보를 받아온 경우에는 다시 요청하지 않는다
      if (statePost) {
        setPost(statePost);
      } else {
        await loadPost();
      }

      setIsLoading(false);
    };

    getPost();
  }, [postId]);

  // 좋아요 버튼 클릭
  const handleLike = async () => {
    if (post === null) {
      return;
    }

    try {
      setIsLiking(true);

      const response = await communityApi.likePost(post.id);

      const newPost = {
        ...post,
        likeCount: response.data.likeCount,
      };

      setPost(newPost);
    } catch (err) {
      console.log(err);
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setIsLiking(false);
    }
  };

  // 댓글 작성 또는 신고 후 다시 게시글을 불러온다
  const handleChanged = async () => {
    await loadPost();
  };

  // 목록으로 이동
  const goList = () => {
    navigate('/community');
  };

  if (isLoading) {
    return (
      <div className="community-page">
        <p className="community-loading">불러오는 중...</p>
      </div>
    );
  }

  if (error !== '' || post === null) {
    return (
      <div className="community-page">
        <div className="community-error">
          {error !== '' ? error : '게시글을 찾을 수 없습니다.'}
        </div>

        <button
          className="community-btn community-btn-secondary"
          onClick={goList}
        >
          목록으로
        </button>
      </div>
    );
  }

  let currentUserId = null;

  if (user) {
    currentUserId = user.id;
  }

  return (
    <div className="community-page">
      <button
        className="community-btn community-btn-secondary"
        onClick={goList}
      >
        ← 목록으로
      </button>

      <div className="post-detail-card">
        <div className="post-detail-header">
          <h1>{post.title}</h1>

          <div className="post-detail-meta">
            <span>{post.authorName}</span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        <div className="post-detail-content">
          {post.content}
        </div>

        <div className="post-detail-actions">
          <button
            className="community-btn community-btn-like"
            onClick={handleLike}
            disabled={isLiking}
          >
            좋아요 {post.likeCount}
          </button>
        </div>
      </div>

      <div className="comment-section">
        <h2>댓글 ({post.comments.length})</h2>

        <CommentForm
          postId={post.id}
          onCreated={handleChanged}
        />

        <CommentList
          comments={post.comments}
          currentUserId={currentUserId}
          onChanged={handleChanged}
        />
      </div>
    </div>
  );
}
