import { create } from 'zustand';
import type { User } from '../types/auth';
import { authApi } from '../api/auth';
import type { AxiosError } from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// 에러 메시지 한글 매핑
const getKoreanErrorMessage = (error: AxiosError<{ message?: string }>): string => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message?.toLowerCase() || '';

  // HTTP 상태 코드에 따른 기본 메시지
  if (status === 401) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (status === 404) {
    return '존재하지 않는 계정입니다.';
  }
  if (status === 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  // 서버에서 보낸 메시지에 따른 매핑
  if (serverMessage.includes('invalid credentials') || serverMessage.includes('wrong password')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
  if (serverMessage.includes('user not found') || serverMessage.includes('email not found')) {
    return '존재하지 않는 이메일입니다.';
  }
  if (serverMessage.includes('locked') || serverMessage.includes('disabled')) {
    return '계정이 잠겨있습니다. 관리자에게 문의해주세요.';
  }
  if (serverMessage.includes('email already exists') || serverMessage.includes('duplicate')) {
    return '이미 가입된 이메일입니다.';
  }
  if (serverMessage.includes('invalid email')) {
    return '올바르지 않은 이메일 형식입니다.';
  }
  if (serverMessage.includes('weak password') || serverMessage.includes('password too short')) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  // 네트워크 에러
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return '네트워크 연결을 확인해주세요.';
  }

  // 기본 메시지
  return '이메일 또는 비밀번호가 올바르지 않습니다.';
};

const getSignupErrorMessage = (error: AxiosError<{ message?: string }>): string => {
  const status = error.response?.status;
  const serverMessage = error.response?.data?.message?.toLowerCase() || '';

  if (status === 409) {
    return '이미 가입된 이메일입니다.';
  }
  if (status === 400) {
    return '입력 정보를 확인해주세요.';
  }
  if (status === 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (serverMessage.includes('email already exists') || serverMessage.includes('duplicate')) {
    return '이미 가입된 이메일입니다.';
  }
  if (serverMessage.includes('invalid email')) {
    return '올바르지 않은 이메일 형식입니다.';
  }
  if (serverMessage.includes('weak password') || serverMessage.includes('password too short')) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return '네트워크 연결을 확인해주세요.';
  }

  return '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response
        ? getKoreanErrorMessage(axiosError)
        : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';

      // 로그인 실패 시 기존 세션 상태가 남아있지 않도록 정리
      localStorage.removeItem('token');
      set({ user: null, token: null, error: message, isLoading: false });
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.signup({ name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message = axiosError.response
        ? getSignupErrorMessage(axiosError)
        : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));
