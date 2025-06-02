import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await apiService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      // トークンが正常に保存されたことを確認
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        console.warn('トークンの保存に失敗しました');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ログインに失敗しました';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    }
  };

  const register = async (userData: RegisterRequest) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await apiService.register(userData);
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
      // トークンが正常に保存されたことを確認
      const savedToken = localStorage.getItem('auth_token');
      if (!savedToken) {
        console.warn('トークンの保存に失敗しました');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ユーザー登録に失敗しました';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      // 確実にローカル状態をクリア
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }

    dispatch({ type: 'AUTH_START' });
    try {
      const response = await apiService.getCurrentUser();
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      console.error('認証チェックエラー:', error);
      // トークンが無効な場合は削除
      localStorage.removeItem('auth_token');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // アプリケーション起動時に認証状態をチェック
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 