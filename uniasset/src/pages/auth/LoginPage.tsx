import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import './LoginPage.css';

interface LoginPageLocationState {
  signupSuccessMessage?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const signupSuccessMessage =
    (location.state as LoginPageLocationState | null)?.signupSuccessMessage ?? '';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
    if (useAuthStore.getState().token) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>UniAsset</h1>
        <p className="subtitle">대학생 자산관리 플랫폼</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {signupSuccessMessage && <div className="auth-success">{signupSuccessMessage}</div>}
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="example@university.ac.kr"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="auth-footer">
          계정이 없으신가요?
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
