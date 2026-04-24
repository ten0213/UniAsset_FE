import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  // 사이드바에 항목을 클릭했을 때 실행될 함수
  const goDashboard = () => {
    navigate('/dashboard');
  };

  const goGoal = () => {
    navigate('/goal');
  };

  const goSimulator = () => {
    navigate('/simulator');
  };


  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">UniAsset</h2>

      <div className="sidebar-menu">
        <button
          type="button"
          className={location.pathname === '/dashboard' ? 'sidebar-button active' : 'sidebar-button'}
          onClick={goDashboard}
        >
          대시보드
        </button>

        <button
          type="button"
          className={location.pathname === '/goal' ? 'sidebar-button active' : 'sidebar-button'}
          onClick={goGoal}
        >
          투자 목표
        </button>

        <button
          type="button"
          className={location.pathname === '/simulator' ? 'sidebar-button active' : 'sidebar-button'}
          onClick={goSimulator}
        >
          성장 시뮬레이터
        </button>
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
