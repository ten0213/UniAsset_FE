import { useLocation, useNavigate } from 'react-router-dom';
import { isAdminUser } from '../constants/auth';
import { useAuthStore } from '../store/useAuthStore';
import './Sidebar.css';

// 일반 메뉴
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

// 커뮤니티 메뉴
const COMMUNITY_MENUS = [
  {
    path: '/community',
    label: '커뮤니티',
  },
] as const;

// 관리자 전용 - 메인 진입점
const ADMIN_MAIN = {
  path: '/admin',
  label: '관리자 대시보드',
} as const;

// 관리자 전용 - 페이지 내 섹션 바로가기
const ADMIN_SECTIONS = [
  { hash: 'admin-stats', label: '통계 현황' },
  { hash: 'admin-users', label: '사용자 관리' },
  { hash: 'admin-comments', label: '댓글 모더레이션' },
  { hash: 'admin-logs', label: '활동 로그' },
] as const;

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

  // 관리자 페이지 안의 특정 섹션으로 스크롤
  const handleAdminSectionMove = (hash: string) => () => {
    if (location.pathname === '/admin') {
      // 이미 관리자 페이지면 그 자리에서 스크롤만
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // 다른 페이지면 /admin#xxx 로 이동 (AdminPage가 hash 보고 스크롤함)
      navigate('/admin#' + hash);
    }
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

      {/* 일반 메뉴 */}
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

      {/* 커뮤니티 섹션 */}
      <div className="sidebar-section">
        <p className="sidebar-section-label">커뮤니티</p>
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
        </div>
      </div>

      {/* 관리자 전용 섹션 - 관리자만 보임 */}
      {canAccessAdmin && (
        <div className="sidebar-section sidebar-section-admin">
          <p className="sidebar-section-label">관리자 전용</p>
          <div className="sidebar-menu">
            <button
              type="button"
              className={
                isActiveMenu(location.pathname, ADMIN_MAIN.path) ? 'sidebar-button active' : 'sidebar-button'
              }
              onClick={handleMove(ADMIN_MAIN.path)}
            >
              {ADMIN_MAIN.label}
            </button>

            {/* 페이지 내 섹션 바로가기 (관리자 대시보드 안의 위치로 스크롤) */}
            {ADMIN_SECTIONS.map((section) => (
              <button
                key={section.hash}
                type="button"
                className="sidebar-sub-button"
                onClick={handleAdminSectionMove(section.hash)}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-bottom">
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </aside>
  );
}
