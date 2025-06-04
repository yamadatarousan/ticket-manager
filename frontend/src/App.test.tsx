import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// AuthContextのモック
const mockUseAuth = jest.fn();
jest.mock('./context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// デフォルトのモック実装
mockUseAuth.mockImplementation(() => ({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    mockUseAuth.mockImplementation(() => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
    }));
  });

  test('チケット管理システムのタイトルが表示される', () => {
    render(<App />);
    const titleElement = screen.getByText(/チケット管理システム/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('ログインボタンが表示される', () => {
    render(<App />);
    const loginButton = screen.getByRole('button', { name: /ログイン/i });
    expect(loginButton).toBeInTheDocument();
  });

  test('メールアドレス入力フィールドが表示される', () => {
    render(<App />);
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    expect(emailInput).toBeInTheDocument();
  });

  test('登録フォームへの切り替えボタンが表示される', () => {
    render(<App />);
    const registerButton = screen.getByRole('button', { name: /新規登録/i });
    expect(registerButton).toBeInTheDocument();
  });

  test('ローディング状態が表示される', () => {
    mockUseAuth.mockImplementation(() => ({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      clearError: jest.fn(),
    }));

    render(<App />);
    const loadingText = screen.getByText(/認証状態を確認中/i);
    expect(loadingText).toBeInTheDocument();
  });

  test('フッターの開発環境情報が表示される', () => {
    render(<App />);
    const footerText = screen.getByText(/開発・テスト環境/i);
    expect(footerText).toBeInTheDocument();
  });
});
