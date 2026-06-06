import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { useAuthStore } from '../../store/useAuthStore';
import { isAdminUser } from '../../constants/auth';
import type { AdminDashboardData } from '../../types/admin';
import AdminStats from './AdminStats';
import AdminUserList from './AdminUserList';
import AdminCommentList from './AdminCommentList';
import AdminModerationLog from './AdminModerationLog';
import './AdminPage.css';

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // 상태 관리
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 관리자 권한 가드 (비관리자면 대시보드로 강제 이동)
  useEffect(() => {
    if (!isAdminUser(user)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // 대시보드 데이터 통합 조회
  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboardData();
      setData(res.data);
    } catch (err) {
      console.log('관리자 데이터를 못 불러왔어요', err);
      setError('데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminUser(user)) {
      loadDashboard();
    }
  }, []);

  // 사이드바에서 hash로 진입한 경우 해당 섹션으로 자동 스크롤
  useEffect(() => {
    if (isLoading) return;
    if (!location.hash) return;

    const id = location.hash.substring(1);
    // 컴포넌트 렌더가 끝나길 살짝 기다린 후 스크롤
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  }, [isLoading, location.hash]);

  // 에러 핸들러 (자식 컴포넌트에서 호출)
  const handleError = (msg: string) => {
    setError(msg);
  };

  // 권한 없는 경우 빈 화면 (useEffect에서 리다이렉트됨)
  if (!isAdminUser(user)) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>관리자 대시보드</h1>
        <p className="admin-description">
          서비스 통계와 사용자/댓글 모더레이션을 관리합니다.
        </p>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {isLoading && <p className="admin-loading">불러오는 중...</p>}

      {!isLoading && data && (
        <>
          {/* 통계 현황 섹션 */}
          <section id="admin-stats" className="admin-section">
            <AdminStats metrics={data.metrics} />
          </section>

          {/* 사용자 관리 섹션 */}
          <section id="admin-users" className="admin-section">
            <AdminUserList
              users={data.users}
              currentUserId={user ? user.id : null}
              onRefresh={loadDashboard}
              onError={handleError}
            />
          </section>

          {/* 댓글 모더레이션 섹션 */}
          <section id="admin-comments" className="admin-section">
            <AdminCommentList
              comments={data.comments}
              onRefresh={loadDashboard}
              onError={handleError}
            />
          </section>

          {/* 활동 로그 섹션 */}
          <section id="admin-logs" className="admin-section">
            <AdminModerationLog logs={data.logs} />
          </section>
        </>
      )}
    </div>
  );
}
