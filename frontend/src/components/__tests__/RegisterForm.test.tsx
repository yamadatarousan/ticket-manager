import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterForm } from '../RegisterForm';
import { AuthProvider } from '../../context/AuthContext';

// AuthContextのモック
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn(),
    isLoading: false,
    error: null,
    clearError: jest.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('RegisterForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnSwitchToLogin = jest.fn();
  const mockRegister = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (require('../../context/AuthContext').useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      clearError: mockClearError
    });
  });

  const renderRegisterForm = () => {
    return render(
      <AuthProvider>
        <RegisterForm onSuccess={mockOnSuccess} onSwitchToLogin={mockOnSwitchToLogin} />
      </AuthProvider>
    );
  };

  it('フォームが正しく表示されること', () => {
    renderRegisterForm();
    expect(screen.getByText('新規登録')).toBeInTheDocument();
    expect(screen.getByText('新しいアカウントを作成してください')).toBeInTheDocument();
    expect(screen.getByLabelText(/名前/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ロール/)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード確認/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'アカウント作成' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByText('ご注意:')).toBeInTheDocument();
  });

  it('入力フィールドの値が正しく更新されること', () => {
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText(/名前/), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/ロール/), { target: { value: 'manager' } });
    fireEvent.change(screen.getByLabelText(/パスワード$/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/パスワード確認/), { target: { value: 'password123' } });
    expect(screen.getByLabelText(/名前/)).toHaveValue('テストユーザー');
    expect(screen.getByLabelText(/メールアドレス/)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/ロール/)).toHaveValue('manager');
    expect(screen.getByLabelText(/パスワード$/)).toHaveValue('password123');
    expect(screen.getByLabelText(/パスワード確認/)).toHaveValue('password123');
  });

  it('バリデーションが正しく機能すること', async () => {
    renderRegisterForm();
    const submitButton = screen.getByRole('button', { name: 'アカウント作成' });
    // 空欄で送信
    fireEvent.click(submitButton);
    expect(await screen.findByText('名前を入力してください')).toBeInTheDocument();
    expect(await screen.findByText('メールアドレスを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワード確認を入力してください')).toBeInTheDocument();
    // 不正な値
    fireEvent.change(screen.getByLabelText(/名前/), { target: { value: 'あ' } });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), { target: { value: 'invalid' } });
    fireEvent.change(screen.getByLabelText(/パスワード$/), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/パスワード確認/), { target: { value: '456' } });
    fireEvent.click(submitButton);
    expect(await screen.findByText('名前は2文字以上で入力してください')).toBeInTheDocument();
    expect(await screen.findByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    expect(await screen.findByText('パスワードが一致しません')).toBeInTheDocument();
  });

  it('登録が成功した場合、onSuccessが呼ばれること', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText(/名前/), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/ロール/), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/パスワード$/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/パスワード確認/), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'アカウント作成' }));
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'テストユーザー',
        email: 'test@example.com',
        role: 'user',
        password: 'password123',
        password_confirmation: 'password123'
      });
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('登録が失敗した場合、エラーメッセージが表示されること', async () => {
    const errorMessage = '登録に失敗しました';
    (require('../../context/AuthContext').useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: errorMessage,
      clearError: mockClearError
    });
    renderRegisterForm();
    fireEvent.change(screen.getByLabelText(/名前/), { target: { value: 'テストユーザー' } });
    fireEvent.change(screen.getByLabelText(/メールアドレス/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/ロール/), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/パスワード$/), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/パスワード確認/), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'アカウント作成' }));
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('ログインボタンをクリックした場合、onSwitchToLoginが呼ばれること', () => {
    renderRegisterForm();
    fireEvent.click(screen.getByRole('button', { name: 'ログイン' }));
    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('ローディング中は入力フィールドとボタンが無効化されること', () => {
    (require('../../context/AuthContext').useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
      clearError: mockClearError
    });
    renderRegisterForm();
    expect(screen.getByLabelText(/名前/)).toBeDisabled();
    expect(screen.getByLabelText(/メールアドレス/)).toBeDisabled();
    expect(screen.getByLabelText(/ロール/)).toBeDisabled();
    expect(screen.getByLabelText(/パスワード$/)).toBeDisabled();
    expect(screen.getByLabelText(/パスワード確認/)).toBeDisabled();
    expect(screen.getByRole('button', { name: 'アカウント作成' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeDisabled();
    expect(screen.getByText('登録中...')).toBeInTheDocument();
  });
}); 