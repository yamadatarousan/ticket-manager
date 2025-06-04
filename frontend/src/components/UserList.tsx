import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserListProps {
  onUserClick: (user: User) => void;
  onCreateUser: () => void;
  onEditUser: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({
  onUserClick,
  onCreateUser,
  onEditUser
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ユーザーの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('自分自身は削除できません');
      return;
    }

    if (!window.confirm(`ユーザー「${user.name}」を削除しますか？この操作は元に戻せません。`)) {
      return;
    }

    try {
      await apiService.deleteUser(user.id);
      await loadUsers(); // リスト再読み込み
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ユーザーの削除に失敗しました');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesName = user.name.toLowerCase().includes(filter.toLowerCase()) ||
                       user.email.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    return matchesName && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-yellow-100 text-yellow-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'manager':
        return 'マネージャー';
      case 'user':
        return '一般ユーザー';
      default:
        return role;
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isManagerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">ユーザーを読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ユーザー管理</h2>
          <p className="text-gray-600 mt-1">システム内のユーザー一覧と管理</p>
        </div>
        {isAdmin && (
          <button
            onClick={onCreateUser}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
            data-testid="create-user-button"
          >
            <span className="mr-2">+</span>
            新規ユーザー作成
          </button>
        )}
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              検索（名前・メールアドレス）
            </label>
            <input
              type="text"
              id="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ユーザーを検索..."
              data-testid="user-search-input"
            />
          </div>
          <div className="md:w-48">
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">
              ロール
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="role-filter-select"
            >
              <option value="">すべて</option>
              <option value="user">一般ユーザー</option>
              <option value="manager">マネージャー</option>
              <option value="admin">管理者</option>
            </select>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="text-sm">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            再試行
          </button>
        </div>
      )}

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザーが見つかりません</h3>
            <p className="text-gray-500">
              {filter || roleFilter ? '検索条件を変更してください' : 'ユーザーがまだ作成されていません'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                  {isManagerOrAdmin && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onUserClick(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-blue-600">(あなた)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}
                        data-testid={`role-badge-${user.id}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </td>
                    {isManagerOrAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                          {isAdmin && (
                            <button
                              onClick={() => onEditUser(user)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded"
                              data-testid={`edit-user-button-${user.id}`}
                            >
                              編集
                            </button>
                          )}
                          {isAdmin && user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded"
                              data-testid={`delete-user-button-${user.id}`}
                            >
                              削除
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 統計情報 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">統計情報</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-500">総ユーザー数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === 'user').length}
            </div>
            <div className="text-sm text-gray-500">一般ユーザー</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.role === 'manager').length}
            </div>
            <div className="text-sm text-gray-500">マネージャー</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-500">管理者</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 