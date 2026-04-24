import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProtectedRoute(props: any) {
  // 로그인 성공시 
  const token = useAuthStore((state) => state.token);
  const localToken = localStorage.getItem('token');

  if (!token || !localToken || token !== localToken) {
    return <Navigate to="/login" replace />;
  }

  return props.children;
}
