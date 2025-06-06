import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  it('ログインフォームが正しく表示されること', () => {
    render(<LoginForm />);

    // フォームの主要な要素が存在することを確認
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
  });
});
