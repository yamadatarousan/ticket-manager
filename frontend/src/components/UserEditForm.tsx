import React, { useState } from 'react';
import { User } from '../types/index';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserEditFormProps {
  user: User;
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

interface UserEditFormData {
  name: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
  password?: string;
  password_confirmation?: string;
}

export const UserEditForm: React.FC<UserEditFormProps> = ({ user, onSuccess, onCancel }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<UserEditFormData>({
    name: user.name,
    email: user.email,
    role: user.role,
    password: '',
    password_confirmation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [changePassword, setChangePassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
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

    if (changePassword) {
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
      // パスワード変更しない場合は、パスワードフィールドを除外
      const updateData: Partial<User> & { password?: string; password_confirmation?: string } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (changePassword && formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.password_confirmation;
      }

      const response = await apiService.updateUser(user.id, updateData);
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
          setErrors({ general: 'ユーザーの更新に失敗しました' });
        }
      } else {
        setErrors({ general: 'ユーザーの更新に失敗しました' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentUser = user.id === currentUser?.id;
  const canChangeRole = currentUser?.role === 'admin' && !isCurrentUser;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">ユーザー編集</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
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

          {/* 現在のユーザー情報表示 */}
          {isCurrentUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>注意:</strong> 自分自身のプロフィールを編集しています
              </p>
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
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
              disabled={!canChangeRole}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              } ${!canChangeRole ? 'bg-gray-100' : ''}`}
            >
              <option value="user">一般ユーザー</option>
              <option value="manager">マネージャー</option>
              <option value="admin">管理者</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            {!canChangeRole && (
              <p className="mt-1 text-sm text-gray-500">
                {isCurrentUser
                  ? '自分自身のロールは変更できません'
                  : 'ロールの変更には管理者権限が必要です'}
              </p>
            )}
          </div>

          {/* パスワード変更オプション */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={e => setChangePassword(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="changePassword" className="ml-2 block text-sm text-gray-900">
                パスワードを変更する
              </label>
            </div>
          </div>

          {/* パスワードフィールド（条件付き表示） */}
          {changePassword && (
            <>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード <span className="text-red-500">*</span>
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
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
            </>
          )}

          {/* ユーザー情報 */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">ユーザー情報</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>作成日:</strong> {new Date(user.created_at).toLocaleDateString('ja-JP')}
              </p>
              <p>
                <strong>最終更新:</strong> {new Date(user.updated_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
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
                  更新中...
                </>
              ) : (
                'ユーザー更新'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
