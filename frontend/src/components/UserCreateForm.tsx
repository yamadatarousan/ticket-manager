import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface UserCreateFormProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'user' | 'manager' | 'admin';
}

export const UserCreateForm: React.FC<UserCreateFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.password) {
      newErrors.password = 'パスワードは必須です';
    } else if (formData.password.length < 6) {
      newErrors.password = 'パスワードは6文字以上で入力してください';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'パスワード確認は必須です';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'パスワードが一致しません';
    }

    if (!formData.role) {
      newErrors.role = 'ロールは必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.register(formData);
      onSuccess(response.user);
    } catch (err) {
      if (err instanceof Error) {
        // サーバーからのバリデーションエラーを処理
        try {
          const errorMessage = err.message;
          if (errorMessage.includes('email')) {
            setErrors({ email: 'このメールアドレスは既に使用されています' });
          } else {
            setErrors({ general: errorMessage });
          }
        } catch {
          setErrors({ general: 'ユーザーの作成に失敗しました' });
        }
      } else {
        setErrors({ general: 'ユーザーの作成に失敗しました' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">新規ユーザー作成</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 一般的なエラーメッセージ */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          {/* 名前 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="山田 太郎"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* メールアドレス */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="user@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* ロール */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              ロール <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="user">一般ユーザー</option>
              <option value="manager">マネージャー</option>
              <option value="admin">管理者</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              ロールによってシステム内での権限が決まります
            </p>
          </div>

          {/* パスワード */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="6文字以上で入力してください"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* パスワード確認 */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード確認 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="上記と同じパスワードを入力してください"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
            )}
          </div>

          {/* 権限についての説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">ロールの権限について</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li><strong>一般ユーザー:</strong> チケットの閲覧、作成、自分のチケットの編集</li>
              <li><strong>マネージャー:</strong> 全チケットの管理、ユーザー情報の閲覧</li>
              <li><strong>管理者:</strong> 全機能へのアクセス、ユーザー管理</li>
            </ul>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              disabled={isLoading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  作成中...
                </>
              ) : (
                'ユーザー作成'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 