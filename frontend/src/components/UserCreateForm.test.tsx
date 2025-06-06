import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserCreateForm } from './UserCreateForm';

// APIのモック
jest.mock('../services/api', () => ({
  createUser: jest.fn().mockResolvedValue({}),
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

describe('UserCreateForm', () => {
  it('ユーザー作成フォームが正しく表示されること', () => {
    render(<UserCreateForm onSuccess={() => {}} onCancel={() => {}} />);

    // フォームの主要な要素が存在することを確認
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/名前/i)).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード *')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード確認 *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ユーザー作成/ })).toBeInTheDocument();
  });
});
