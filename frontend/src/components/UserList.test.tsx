import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from './UserList';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// apiServiceのモック
jest.mock('../services/api', () => ({
  apiService: {
    getUsers: jest.fn(),
    deleteUser: jest.fn()
  }
}));

describe('UserListコンポーネント', () => {
  const mockUsers = [
    {
      id: 1,
      name: 'テストユーザー1',
      email: 'user1@example.com',
      role: 'user' as const,
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'テストユーザー2',
      email: 'user2@example.com',
      role: 'manager' as const,
      created_at: '2024-03-15T11:00:00Z',
      updated_at: '2024-03-15T11:00:00Z'
    },
    {
      id: 3,
      name: 'テストユーザー3',
      email: 'user3@example.com',
      role: 'admin' as const,
      created_at: '2024-03-15T12:00:00Z',
      updated_at: '2024-03-15T12:00:00Z'
    }
  ];

  const mockOnUserClick = jest.fn();
  const mockOnCreateUser = jest.fn();
  const mockOnEditUser = jest.fn();

  beforeEach(() => {
    // AuthContextのモックを設定
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 1,
        name: 'テストユーザー1',
        email: 'user1@example.com',
        role: 'admin',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
      }
    });

    // apiServiceのモックを設定
    (apiService.getUsers as jest.Mock).mockResolvedValue({ users: mockUsers });
    (apiService.deleteUser as jest.Mock).mockResolvedValue(undefined);

    // モック関数をリセット
    mockOnUserClick.mockReset();
    mockOnCreateUser.mockReset();
    mockOnEditUser.mockReset();
  });

  test('ユーザー一覧が正しく表示されること', async () => {
    render(
      <UserList
        onUserClick={mockOnUserClick}
        onCreateUser={mockOnCreateUser}
        onEditUser={mockOnEditUser}
      />
    );

    // ローディング表示を確認
    expect(screen.getByText('ユーザーを読み込み中...')).toBeInTheDocument();

    // ユーザー一覧の表示を確認
    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー2')).toBeInTheDocument();
      expect(screen.getByText('テストユーザー3')).toBeInTheDocument();
    });

    // ロールの表示を確認（data-testidで取得）
    expect(screen.getByTestId('role-badge-1')).toHaveTextContent('一般ユーザー');
    expect(screen.getByTestId('role-badge-2')).toHaveTextContent('マネージャー');
    expect(screen.getByTestId('role-badge-3')).toHaveTextContent('管理者');
  });

  test('フィルター機能が正しく動作すること', async () => {
    render(
      <UserList
        onUserClick={mockOnUserClick}
        onCreateUser={mockOnCreateUser}
        onEditUser={mockOnEditUser}
      />
    );

    // ユーザー一覧の表示を待機
    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    });

    // 名前でフィルター
    const searchInput = screen.getByTestId('user-search-input');
    fireEvent.change(searchInput, { target: { value: 'テストユーザー1' } });

    // フィルター結果を確認
    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
      expect(screen.queryByText('テストユーザー2')).not.toBeInTheDocument();
      expect(screen.queryByText('テストユーザー3')).not.toBeInTheDocument();
    });

    // ロールでフィルター
    const roleFilter = screen.getByTestId('role-filter-select');
    // 検索欄をリセット
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.change(roleFilter, { target: { value: 'manager' } });

    // フィルター結果を確認
    await waitFor(() => {
      expect(screen.queryByText('テストユーザー1')).not.toBeInTheDocument();
      expect(screen.getByText('テストユーザー2')).toBeInTheDocument();
      expect(screen.queryByText('テストユーザー3')).not.toBeInTheDocument();
    });
  });

  test('管理者権限の場合、操作ボタンが表示されること', async () => {
    // 管理者ユーザーとして設定
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 1,
        name: '管理者',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
      }
    });

    render(
      <UserList
        onUserClick={mockOnUserClick}
        onCreateUser={mockOnCreateUser}
        onEditUser={mockOnEditUser}
      />
    );

    // ユーザー一覧の表示を待機
    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    });

    // 新規ユーザー作成ボタンが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('create-user-button')).toBeInTheDocument();
    });

    // 編集ボタンが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('edit-user-button-2')).toBeInTheDocument();
      expect(screen.getByTestId('edit-user-button-3')).toBeInTheDocument();
    });

    // 削除ボタンが表示されることを確認
    await waitFor(() => {
      expect(screen.getByTestId('delete-user-button-2')).toBeInTheDocument();
      expect(screen.getByTestId('delete-user-button-3')).toBeInTheDocument();
    });
  });

  test('一般ユーザー権限の場合、操作ボタンが表示されないこと', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 1,
        name: '一般ユーザー',
        email: 'user@example.com',
        role: 'user',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
      }
    });

    render(
      <UserList
        onUserClick={mockOnUserClick}
        onCreateUser={mockOnCreateUser}
        onEditUser={mockOnEditUser}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('テストユーザー1')).toBeInTheDocument();
    });

    // 新規ユーザー作成ボタンが表示されないことを確認
    await waitFor(() => {
      expect(screen.queryByTestId('create-user-button')).not.toBeInTheDocument();
    });

    // 編集ボタンが表示されないことを確認
    await waitFor(() => {
      expect(screen.queryByTestId('edit-user-button-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-user-button-3')).not.toBeInTheDocument();
    });

    // 削除ボタンが表示されないことを確認
    await waitFor(() => {
      expect(screen.queryByTestId('delete-user-button-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('delete-user-button-3')).not.toBeInTheDocument();
    });
  });
}); 