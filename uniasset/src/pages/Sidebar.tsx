import { useLocation, useNavigate } from 'react-router-dom';
import { isAdminUser } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';
import './Sidebar.css';

const MAIN_MENUS = [
  {
    path: '/dashboard',
    label: '대시보드',
  },
  {
    path: '/goal',
    label: '투자 목표',
  },
  {
    path: '/simulator',
    label: '성장 시뮬레이터',
  },
] as const;

const COMMUNITY_MENUS = [
  {
    path: '/community',
    label: '커뮤니티',
  },
] as const;

const ADMIN_MENU = {
  path: '/admin',
  label: '관리자',
} as const;

const isActiveMenu = (pathname: string, targetPath: string): boolean =>
  pathname === targetPath || pathname.startsWith(`${targetPath}/`);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const canAccessAdmin = isAdminUser(user);

  const handleMove = (targetPath: string) => () => {
    navigate(targetPath);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div>
        <h2 className="sidebar-title">UniAsset</h2>
        <p className="sidebar-subtitle">학생 자산관리 플랫폼</p>
      </div>

      <div className="sidebar-menu">
        {MAIN_MENUS.map((menu) => (
          <button
            key={menu.path}
            type="button"
            className={isActiveMenu(location.pathname, menu.path) ? 'sidebar-button active' : 'sidebar-button'}
            onClick={handleMove(menu.path)}
          >
            {menu.label}
          </button>
        ))}
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-label">커뮤니티 운영</p>
        <div className="sidebar-menu">
          {COMMUNITY_MENUS.map((menu) => (
            <button
              key={menu.path}
              type="button"
              className={isActiveMenu(location.pathname, menu.path) ? 'sidebar-button active' : 'sidebar-button'}
              onClick={handleMove(menu.path)}
            >
              {menu.label}
            </button>
          ))}

          {canAccessAdmin && (
            <button
              key={ADMIN_MENU.path}
              type="button"
              className={
                isActiveMenu(location.pathname, ADMIN_MENU.path) ? 'sidebar-button active' : 'sidebar-button'
              }
              onClick={handleMove(ADMIN_MENU.path)}
            >
              {ADMIN_MENU.label}
            </button>
          )}
        </div>
      </div>

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
