import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserCreateForm } from './UserCreateForm';
import { apiService } from '../services/api';

// apiServiceのモック
jest.mock('../services/api', () => ({
  apiService: {
    register: jest.fn()
  }
}));

describe('UserCreateFormコンポーネント', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // apiServiceのモックをリセット
    (apiService.register as jest.Mock).mockReset();
    mockOnSuccess.mockReset();
    mockOnCancel.mockReset();
  });

  test('フォームが正しく表示されること', () => {
    render(
      <UserCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // フォームの要素が表示されていることを確認
    expect(screen.getByLabelText('名前 *')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス *')).toBeInTheDocument();
    expect(screen.getByLabelText('ロール *')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード *')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード確認 *')).toBeInTheDocument();

    // 初期値が正しく設定されていることを確認
    expect(screen.getByLabelText('名前 *')).toHaveValue('');
    expect(screen.getByLabelText('メールアドレス *')).toHaveValue('');
    expect(screen.getByLabelText('ロール *')).toHaveValue('user');
    expect(screen.getByLabelText('パスワード *')).toHaveValue('');
    expect(screen.getByLabelText('パスワード確認 *')).toHaveValue('');
  });

  test('バリデーションエラーが正しく表示されること', async () => {
    render(
      <UserCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 名前を空にする
    const nameInput = screen.getByLabelText('名前 *');
    fireEvent.change(nameInput, { target: { value: '' } });

    // メールアドレスを無効な形式にする
    const emailInput = screen.getByLabelText('メールアドレス *');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // パスワードを短すぎる値に設定
    const passwordInput = screen.getByLabelText('パスワード *');
    fireEvent.change(passwordInput, { target: { value: '12345' } });

    // パスワード確認を不一致に設定
    const passwordConfirmationInput = screen.getByLabelText('パスワード確認 *');
    fireEvent.change(passwordConfirmationInput, { target: { value: '123456' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(submitButton);

    // バリデーションエラーメッセージが表示されることを確認
    expect(screen.getByText('名前は必須です')).toBeInTheDocument();
    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();

    // APIが呼ばれていないことを確認
    expect(apiService.register).not.toHaveBeenCalled();
  });

  test('ユーザーが正しく作成されること', async () => {
    const newUser = {
      id: 1,
      name: '新規ユーザー',
      email: 'new@example.com',
      role: 'user' as const,
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-15T10:00:00Z'
    };

    (apiService.register as jest.Mock).mockResolvedValueOnce({ user: newUser });

    render(
      <UserCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // フォームに値を入力
    const nameInput = screen.getByLabelText('名前 *');
    fireEvent.change(nameInput, { target: { value: '新規ユーザー' } });

    const emailInput = screen.getByLabelText('メールアドレス *');
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    const passwordInput = screen.getByLabelText('パスワード *');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const passwordConfirmationInput = screen.getByLabelText('パスワード確認 *');
    fireEvent.change(passwordConfirmationInput, { target: { value: 'password123' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(submitButton);

    // APIが正しいパラメータで呼ばれることを確認
    await waitFor(() => {
      expect(apiService.register).toHaveBeenCalledWith({
        name: '新規ユーザー',
        email: 'new@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'user'
      });
    });

    // onSuccessが正しいパラメータで呼ばれることを確認
    expect(mockOnSuccess).toHaveBeenCalledWith(newUser);
  });
}); 