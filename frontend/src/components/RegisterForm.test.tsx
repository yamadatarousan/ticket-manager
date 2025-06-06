import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RegisterForm } from './RegisterForm';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

describe('RegisterForm', () => {
  it('登録フォームが正しく表示されること', () => {
    render(<RegisterForm />);

    // フォームの主要な要素が存在することを確認
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード（確認）')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '登録する' })).toBeInTheDocument();
  });
});
