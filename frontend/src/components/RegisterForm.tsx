import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RegisterRequest } from '../types';

/**
 * ユーザー登録フォームのプロパティ
 */
interface RegisterFormProps {
  /** 登録成功時に呼び出されるコールバック関数 */
  onSuccess?: () => void;
  /** ログインフォームに切り替える際に呼び出されるコールバック関数 */
  onSwitchToLogin?: () => void;
}

/**
 * ユーザー登録フォームコンポーネント
 * 
 * 新規ユーザーアカウント作成のためのフォームを提供します。
 * このコンポーネントは以下の機能を実装しています：
 * - ユーザー名、メールアドレス、パスワード入力
 * - リアルタイムバリデーション
 * - パスワード確認チェック
 * - 送信状態の表示
 * - エラーメッセージの表示
 * - ログインフォームへの切り替え
 * 
 * @param props - 登録フォームのプロパティ
 * @returns 登録フォームのReactコンポーネント
 * 
 * @example
 * ```tsx
 * <RegisterForm
 *   onSuccess={() => navigate('/dashboard')}
 *   onSwitchToLogin={() => setCurrentForm('login')}
 * />
 * ```
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  
  /**
   * フォームの入力データを管理するstate
   */
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  
  /**
   * フォームのバリデーションエラーを管理するstate
   */
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * フォームの入力値をバリデーションする
   * 
   * バリデーション規則：
   * - 名前: 必須、1文字以上
   * - メールアドレス: 必須、有効な形式
   * - パスワード: 必須、6文字以上
   * - パスワード確認: 必須、パスワードと一致
   * 
   * @returns バリデーションが成功した場合true、失敗した場合false
   */
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // 名前のバリデーション
    if (!formData.name.trim()) {
      errors.name = '名前を入力してください';
    }

    // メールアドレスのバリデーション
    if (!formData.email.trim()) {
      errors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }

    // パスワードのバリデーション
    if (!formData.password) {
      errors.password = 'パスワードを入力してください';
    } else if (formData.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください';
    }

    // パスワード確認のバリデーション
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'パスワードを再入力してください';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'パスワードが一致しません';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * フォーム送信時の処理
   * 
   * バリデーションを実行し、成功時にユーザー登録処理を呼び出します。
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
      await register(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // エラーはAuthContextで処理される
      console.error('Registration error:', err);
    }
  };

  /**
   * 入力フィールドの値変更時の処理
   * 
   * フォームデータを更新し、該当フィールドのエラーをクリアします。
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
        <h2 className="text-2xl font-bold text-gray-900">アカウント登録</h2>
        <p className="text-gray-600 mt-2">新しいアカウントを作成してください</p>
      </div>

      {/* 登録フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 名前入力フィールド */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            名前
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="山田太郎"
            disabled={isLoading}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

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
            placeholder="6文字以上のパスワード"
            disabled={isLoading}
          />
          {formErrors.password && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* パスワード確認入力フィールド */}
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認）
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="パスワードをもう一度入力"
            disabled={isLoading}
          />
          {formErrors.password_confirmation && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password_confirmation}</p>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* 登録ボタン */}
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
              登録中...
            </div>
          ) : (
            '登録する'
          )}
        </button>

        {/* ログインへの切り替え */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちですか？{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 font-medium"
              disabled={isLoading}
            >
              ログイン
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm; 