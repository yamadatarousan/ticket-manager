import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * ログインフォームのプロパティ
 */
interface LoginFormProps {
  /** ログイン成功時に呼び出されるコールバック関数 */
  onSuccess?: () => void;
  /** 登録フォームに切り替える際に呼び出されるコールバック関数 */
  onSwitchToRegister?: () => void;
}

/**
 * ユーザーログインのためのフォームコンポーネント
 * 
 * このコンポーネントは以下の機能を提供します：
 * - メールアドレスとパスワードによる認証
 * - リアルタイムバリデーション
 * - ローディング状態の表示
 * - エラーメッセージの表示
 * - 登録フォームへの切り替え
 * - テスト用アカウント情報の表示
 * 
 * @param props - ログインフォームのプロパティ
 * @returns ログインフォームのReactコンポーネント
 * 
 * @example
 * ```tsx
 * <LoginForm
 *   onSuccess={() => navigate('/dashboard')}
 *   onSwitchToRegister={() => setCurrentForm('register')}
 * />
 * ```
 */
export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  /** フォームの入力データを管理するstate */
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  /** フォームバリデーションエラーを管理するstate */
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * フォームの入力値をバリデーションする
   * 
   * バリデーション規則：
   * - メールアドレス: 必須、有効な形式
   * - パスワード: 必須、6文字以上
   * 
   * @returns バリデーションが成功した場合true、失敗した場合false
   */
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // メールアドレスのバリデーション
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }

    // パスワードのバリデーション
    if (!formData.password.trim()) {
      errors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * フォーム送信時の処理
   * 
   * 1. バリデーションを実行
   * 2. 認証処理を実行
   * 3. 成功時にコールバックを呼び出し
   * 
   * @param e - フォーム送信イベント
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      // エラーは AuthContext で処理される
    }
  };

  /**
   * 入力フィールドの値変更時の処理
   * 
   * フォームデータを更新し、該当フィールドのエラーをクリアします
   * 
   * @param e - 入力変更イベント
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      {/* ヘッダー部分 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
        <p className="text-gray-600 mt-2">アカウントにサインインしてください</p>
      </div>

      {/* ログインフォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* メールアドレス入力フィールド */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your@example.com"
            disabled={isLoading}
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* パスワード入力フィールド */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="パスワードを入力"
            disabled={isLoading}
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* 認証エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ログイン中...
            </div>
          ) : (
            'ログイン'
          )}
        </button>

        {/* 登録フォームへの切り替えリンク */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない場合{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={isLoading}
            >
              新規登録
            </button>
          </p>
        </div>
      </form>

      {/* テスト用のアカウント情報表示 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <p className="text-xs text-gray-600 font-semibold mb-2">テスト用アカウント:</p>
        <div className="text-xs text-gray-500 space-y-1">
          <p>管理者: admin@example.com / password123</p>
          <p>マネージャー: manager@example.com / password123</p>
          <p>一般ユーザー: user@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}; 