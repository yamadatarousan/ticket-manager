import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserEditForm } from './UserEditForm';

// APIのモック
jest.mock('../services/api', () => ({
  updateUser: jest.fn().mockResolvedValue({}),
}));

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'admin@example.com', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  }),
}));

describe('UserEditForm', () => {
  it('ユーザー編集フォームが正しく表示されること', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user' as 'user' | 'manager' | 'admin',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    render(<UserEditForm user={mockUser} onSuccess={() => {}} onCancel={() => {}} />);

    // フォームの主要な要素が存在することを確認
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/名前/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ロール/i)).toBeInTheDocument();
    expect(screen.getByText(/ユーザー更新/i)).toBeInTheDocument();
  });
});
