import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import './LoginPage.css';
import './SignupPage.css';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [validationError, setValidationError] = useState('');
  const { signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== passwordConfirm) {
      setValidationError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 8) {
      setValidationError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    const isSignupSuccess = await signup(name, email, password);

    if (isSignupSuccess) {
      navigate('/login', {
        replace: true,
        state: {
          signupSuccessMessage: '회원가입이 완료되었습니다. 로그인해주세요.',
        },
      });
    }
  };

  const displayError = validationError || error;

  return (
    <div className="auth-page">
      <div className="auth-card signup-card">
        <h1>회원가입</h1>
        <p className="subtitle">UniAsset과 함께 자산관리를 시작하세요</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {displayError && <div className="auth-error">{displayError}</div>}

          <div className="form-group">
            <label htmlFor="name">이름</label>
            <input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError();
                setValidationError('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">이메일</label>
            <input
              id="signup-email"
              type="email"
              placeholder="example@university.ac.kr"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
                setValidationError('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">비밀번호</label>
            <input
              id="signup-password"
              type="password"
              placeholder="8자 이상 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
                setValidationError('');
              }}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password-confirm">비밀번호 확인</label>
            <input
              id="password-confirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                setValidationError('');
              }}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="auth-footer">
          이미 계정이 있으신가요?
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
