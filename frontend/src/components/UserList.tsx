/**
 * ユーザー一覧 - ハイセンスデザイン
 * 
 * システムユーザーを美しいカードレイアウトで表示し、直感的な操作を提供します。
 * モダンなデザインシステムを適用し、ユーザビリティと視覚的魅力を両立します。
 * 
 * 主な機能：
 * - カードベースのレスポンシブレイアウト
 * - ユーザー権限の視覚的表示
 * - 美しいアニメーション効果
 * - 効率的なユーザー管理
 * - アクセシビリティ対応
 */
import React, { useState, useEffect } from 'react';
import { User } from '../types/index';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserListProps {
  /** ユーザークリック時のコールバック関数 */
  onUserClick: (user: User) => void;
  /** ユーザー編集時のコールバック関数 */
  onUserEdit: (user: User) => void;
  /** ユーザー作成ボタンクリック時のコールバック関数 */
  onCreateUser: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  onUserClick,
  onUserEdit,
  onCreateUser
}) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 管理者または管理者権限を持つユーザーかどうかを確認
  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const usersData = await apiService.getUsers();
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ユーザーの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // ユーザーの権限に応じたラベルとカラーを取得
  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: '管理者',
          bgColor: 'bg-rose-100',
          textColor: 'text-rose-800'
        };
      case 'manager':
        return {
          label: 'マネージャー',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        };
      case 'user':
        return {
          label: '一般ユーザー',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      default:
        return {
          label: '不明',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    if (!dateString) return '未定義';
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ユーザーのイニシャルを取得
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return name.substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // 複数の色からランダムに選択（ユーザーアバターの背景色）
  const getRandomColor = (userId: number) => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-violet-500',
      'bg-cyan-500',
      'bg-fuchsia-500',
      'bg-lime-500'
    ];
    return colors[userId % colors.length];
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-8 w-40 rounded-lg"></div>
          <div className="loading-skeleton h-10 w-40 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="card-body space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="loading-skeleton h-12 w-12 rounded-full"></div>
                  <div className="flex-1">
                    <div className="loading-skeleton h-4 w-3/4 rounded mb-2"></div>
                    <div className="loading-skeleton h-3 w-1/2 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">ユーザー管理</h1>
          <p className="text-gray-600 mt-2">
            <span className="font-semibold text-gray-900">{users.length}</span> 人のユーザー
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={onCreateUser}
            className="btn-primary hover-lift flex items-center space-x-2"
          >
            <span className="text-xl">➕</span>
            <span>新規ユーザー</span>
          </button>
        )}
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50 animate-bounce-in">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ユーザーカードグリッド */}
      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user, index) => {
            const roleInfo = getRoleInfo(user.role);

            return (
              <div
                key={user.id}
                className="card hover-lift cursor-pointer animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => onUserClick(user)}
              >
                <div className="card-body">
                  {/* ユーザーヘッダー */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getRandomColor(user.id)}`}>
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUserEdit(user);
                        }}
                        className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="編集"
                      >
                        <span className="text-gray-400 hover:text-gray-600">✏️</span>
                      </button>
                    )}
                  </div>

                  {/* ユーザー情報 */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">権限レベル：</span>
                      <span className={`status-badge ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">登録日：</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(user.created_at)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">最終更新：</span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(user.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ユーザーフッター */}
                <div className="card-footer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>ユーザーID: #{user.id}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <span className="text-xs">詳細を見る</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">👤</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ユーザーがまだ登録されていません
            </h3>
            <p className="text-gray-600 mb-6">
              最初のユーザーを登録して、システムの利用を開始しましょう。
            </p>
            {isAdmin && (
              <button
                onClick={onCreateUser}
                className="btn-primary"
              >
                最初のユーザーを作成
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 