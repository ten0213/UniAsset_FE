import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const localToken = localStorage.getItem('token');

  // 메모리 상태와 저장소 상태가 다르면 인증 실패로 간주
  if (!token || !localToken || token !== localToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
