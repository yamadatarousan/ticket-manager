import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '../../context/AuthContext';

// AuthContextのモック
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('LoginForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToRegister = jest.fn();
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // AuthContextのモックを更新
    (require('../../context/AuthContext').useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null,
      clearError: mockClearError
    });
  });

  const renderLoginForm = () => {
    return render(
      <AuthProvider>
        <LoginForm onSuccess={mockOnSuccess} onSwitchToRegister={mockOnSwitchToRegister} />
      </AuthProvider>
    );
  };

  it('フォームが正しく表示されること', () => {
    renderLoginForm();

    // タイトルと説明が表示されていること
    expect(screen.getByText('ログイン')).toBeInTheDocument();
    expect(screen.getByText('アカウントにサインインしてください')).toBeInTheDocument();

    // 入力フィールドが表示されていること
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument();

    // ボタンが表示されていること
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '新規登録' })).toBeInTheDocument();

    // テスト用アカウント情報が表示されていること
    expect(screen.getByText('テスト用アカウント:')).toBeInTheDocument();
  });

  it('入力フィールドの値が正しく更新されること', () => {
    renderLoginForm();

    const emailInput = screen.getByLabelText(/メールアドレス/);
    const passwordInput = screen.getByLabelText(/パスワード/);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('メールアドレスのバリデーションが正しく機能すること', async () => {
    renderLoginForm();

    const emailInput = screen.getByLabelText(/メールアドレス/);
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // 空のメールアドレス
    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();

    // 無効なメールアドレス
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();

    // 有効なメールアドレス
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    expect(screen.queryByText(/メールアドレス/)).not.toBeInTheDocument();
  });

  it('パスワードのバリデーションが正しく機能すること', async () => {
    renderLoginForm();

    const passwordInput = screen.getByLabelText(/パスワード/);
    const submitButton = screen.getByRole('button', { name: 'ログイン' });

    // 空のパスワード
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText('パスワードを入力してください')).toBeInTheDocument();

    // 短すぎるパスワード
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();

    // 有効なパスワード
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    expect(screen.queryByText(/パスワード/)).not.toBeInTheDocument();
  });

  it('ログインが成功した場合、onSuccessが呼ばれること', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginForm();

    // 有効な入力値を設定
    fireEvent.change(screen.getByLabelText(/メールアドレス/), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/パスワード/), {
      target: { value: 'password123' }
    });

    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    // loginが呼ばれることを確認
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    // onSuccessが呼ばれることを確認
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('ログインが失敗した場合、エラーメッセージが表示されること', async () => {
    const errorMessage = 'ログインに失敗しました';
    (require('../../context/AuthContext').useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: errorMessage,
      clearError: mockClearError
    });

    renderLoginForm();

    // 有効な入力値を設定
    fireEvent.change(screen.getByLabelText(/メールアドレス/), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/パスワード/), {
      target: { value: 'password123' }
    });

    // フォームを送信
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('新規登録ボタンをクリックした場合、onSwitchToRegisterが呼ばれること', () => {
    renderLoginForm();

    const registerButton = screen.getByRole('button', { name: '新規登録' });
    fireEvent.click(registerButton);

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('ローディング中は入力フィールドとボタンが無効化されること', () => {
    (require('../../context/AuthContext').useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null,
      clearError: mockClearError
    });

    renderLoginForm();

    // 入力フィールドが無効化されていることを確認
    expect(screen.getByLabelText(/メールアドレス/)).toBeDisabled();
    expect(screen.getByLabelText(/パスワード/)).toBeDisabled();

    // ログインボタンが無効化され、ローディング表示になっていることを確認
    const loginButton = screen.getByRole('button', { name: 'ログイン中...' });
    expect(loginButton).toBeDisabled();
    expect(screen.getByText('ログイン中...')).toBeInTheDocument();

    // 新規登録ボタンが無効化されていることを確認
    expect(screen.getByRole('button', { name: '新規登録' })).toBeDisabled();
  });
}); 