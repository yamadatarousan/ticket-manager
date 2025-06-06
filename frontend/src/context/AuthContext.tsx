import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/index';
import { apiService } from '../services/api';

/**
 * 認証状態を表すインターフェース
 */
interface AuthState {
  /** 現在ログインしているユーザー情報（未ログイン時はnull） */
  user: User | null;
  /** ユーザーが認証済みかどうか */
  isAuthenticated: boolean;
  /** 認証処理中かどうか */
  isLoading: boolean;
  /** 認証エラーメッセージ（エラーなし時はnull） */
  error: string | null;
}

/**
 * 認証状態を更新するためのアクション型
 */
type AuthAction =
  /** 認証処理開始 */
  | { type: 'AUTH_START' }
  /** 認証成功 */
  | { type: 'AUTH_SUCCESS'; payload: User }
  /** 認証エラー */
  | { type: 'AUTH_ERROR'; payload: string }
  /** ログアウト */
  | { type: 'AUTH_LOGOUT' }
  /** エラークリア */
  | { type: 'CLEAR_ERROR' };

/**
 * 認証コンテキストの型定義
 * 
 * 認証状態と認証に関する操作を提供するインターフェース
 */
interface AuthContextType extends AuthState {
  /** ユーザーログイン */
  login: (credentials: LoginRequest) => Promise<void>;
  /** ユーザー登録 */
  register: (userData: RegisterRequest) => Promise<void>;
  /** ユーザーログアウト */
  logout: () => Promise<void>;
  /** エラーメッセージをクリア */
  clearError: () => void;
  /** 認証状態をチェック */
  checkAuth: () => Promise<void>;
}

/**
 * 認証用のReactコンテキスト
 * 
 * アプリケーション全体で認証状態を共有するためのコンテキスト
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認証状態を管理するリデューサー関数
 * 
 * @param state - 現在の認証状態
 * @param action - 実行するアクション
 * @returns 新しい認証状態
 */
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

/**
 * 認証状態の初期値
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // 初期化時は認証チェック中
  error: null
};

/**
 * AuthProviderコンポーネントのプロパティ
 */
interface AuthProviderProps {
  /** 子コンポーネント */
  children: ReactNode;
}

/**
 * 認証コンテキストプロバイダーコンポーネント
 * 
 * アプリケーション全体に認証状態と認証操作を提供します。
 * このコンポーネントで以下の機能を管理します：
 * - ユーザーのログイン・ログアウト・登録
 * - 認証状態の永続化（ローカルストレージ）
 * - 自動認証チェック
 * - エラーハンドリング
 * 
 * @param props - プロバイダーのプロパティ
 * @returns 認証コンテキストを提供するコンポーネント
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AuthProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/login" element={<LoginPage />} />
 *           <Route path="/dashboard" element={<Dashboard />} />
 *         </Routes>
 *       </Router>
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * ユーザーログイン処理
   * 
   * 1. ログイン処理を開始
   * 2. APIにログイン要求を送信
   * 3. 成功時：ユーザー情報を状態に保存、トークンをローカルストレージに保存
   * 4. 失敗時：エラーメッセージを設定
   * 
   * @param credentials - ログイン認証情報（メールアドレスとパスワード）
   * @throws ログイン処理中にエラーが発生した場合
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
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

  /**
   * ユーザー登録処理
   * 
   * 1. 登録処理を開始
   * 2. APIに登録要求を送信
   * 3. 成功時：ユーザー情報を状態に保存、トークンをローカルストレージに保存
   * 4. 失敗時：エラーメッセージを設定
   * 
   * @param userData - ユーザー登録情報
   * @throws 登録処理中にエラーが発生した場合
   */
  const register = async (userData: RegisterRequest): Promise<void> => {
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

  /**
   * ユーザーログアウト処理
   * 
   * 1. APIにログアウト要求を送信
   * 2. ローカルストレージからトークンを削除
   * 3. 認証状態をクリア
   * 
   * @throws ログアウト処理中にエラーが発生した場合（状態は確実にクリアされる）
   */
  const logout = async (): Promise<void> => {
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

  /**
   * エラーメッセージをクリアする
   * 
   * 認証エラーが表示されている場合に、エラー状態をリセットします
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * 認証状態をチェックする
   * 
   * ローカルストレージに保存されたトークンを使用して、
   * サーバーから現在のユーザー情報を取得します。
   * 
   * 処理フロー：
   * 1. ローカルストレージからトークンを取得
   * 2. トークンがない場合：ログアウト状態に設定
   * 3. トークンがある場合：APIでユーザー情報を取得
   * 4. 成功時：ユーザー情報を状態に設定
   * 5. 失敗時：トークンを削除してログアウト状態に設定
   */
  const checkAuth = async (): Promise<void> => {
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

  /** コンテキストに提供する値 */
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

/**
 * 認証コンテキストを使用するためのカスタムフック
 * 
 * このフックを使用して、コンポーネント内で認証状態と
 * 認証操作にアクセスできます。
 * 
 * @returns 認証コンテキストの値
 * @throws AuthProvider外で使用された場合
 * 
 * @example
 * ```tsx
 * function LoginButton() {
 *   const { login, isLoading, error } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     await login({ email: 'user@example.com', password: 'password' });
 *   };
 *   
 *   if (isLoading) return <div>ログイン中...</div>;
 *   if (error) return <div>エラー: {error}</div>;
 *   
 *   return <button onClick={handleLogin}>ログイン</button>;
 * }
 * ```
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 