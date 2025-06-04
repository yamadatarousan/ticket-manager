import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserEditForm } from './UserEditForm';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// apiServiceのモック
jest.mock('../services/api', () => ({
  apiService: {
    updateUser: jest.fn()
  }
}));

describe('UserEditFormコンポーネント', () => {
  const mockUser = {
    id: 1,
    name: 'テストユーザー',
    email: 'test@example.com',
    role: 'user' as const,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z'
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    // AuthContextのモックを設定
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: 2,
        name: '管理者',
        email: 'admin@example.com',
        role: 'admin',
        created_at: '2024-03-15T10:00:00Z',
        updated_at: '2024-03-15T10:00:00Z'
      }
    });

    // apiServiceのモックをリセット
    (apiService.updateUser as jest.Mock).mockReset();
    mockOnSuccess.mockReset();
    mockOnCancel.mockReset();
  });

  test('フォームが正しく表示されること', () => {
    render(
      <UserEditForm
        user={mockUser}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // フォームの要素が表示されていることを確認
    expect(screen.getByLabelText('名前 *')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス *')).toBeInTheDocument();
    expect(screen.getByLabelText('ロール *')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワードを変更する')).toBeInTheDocument();

    // 初期値が正しく設定されていることを確認
    expect(screen.getByLabelText('名前 *')).toHaveValue('テストユーザー');
    expect(screen.getByLabelText('メールアドレス *')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('ロール *')).toHaveValue('user');
  });

  test('バリデーションエラーが正しく表示されること', async () => {
    render(
      <UserEditForm
        user={mockUser}
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

    // パスワード変更を有効にする
    const changePasswordCheckbox = screen.getByLabelText('パスワードを変更する');
    fireEvent.click(changePasswordCheckbox);

    // パスワードを短すぎる値に設定
    const passwordInput = screen.getByLabelText('パスワード *');
    fireEvent.change(passwordInput, { target: { value: '12345' } });

    // パスワード確認を不一致に設定
    const passwordConfirmationInput = screen.getByLabelText('パスワード確認 *');
    fireEvent.change(passwordConfirmationInput, { target: { value: '123456' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: '更新' });
    fireEvent.click(submitButton);

    // バリデーションエラーメッセージが表示されることを確認
    expect(screen.getByText('名前は必須です')).toBeInTheDocument();
    expect(screen.getByText('有効なメールアドレスを入力してください')).toBeInTheDocument();
    expect(screen.getByText('パスワードは6文字以上で入力してください')).toBeInTheDocument();
    expect(screen.getByText('パスワードが一致しません')).toBeInTheDocument();

    // APIが呼ばれていないことを確認
    expect(apiService.updateUser).not.toHaveBeenCalled();
  });

  test('ユーザー情報が正しく更新されること', async () => {
    const updatedUser = {
      ...mockUser,
      name: '更新されたユーザー',
      email: 'updated@example.com',
      updated_at: '2024-03-15T11:00:00Z'
    };

    (apiService.updateUser as jest.Mock).mockResolvedValueOnce({ user: updatedUser });

    render(
      <UserEditForm
        user={mockUser}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 名前を更新
    const nameInput = screen.getByLabelText('名前 *');
    fireEvent.change(nameInput, { target: { value: '更新されたユーザー' } });

    // メールアドレスを更新
    const emailInput = screen.getByLabelText('メールアドレス *');
    fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: '更新' });
    fireEvent.click(submitButton);

    // APIが正しいパラメータで呼ばれることを確認
    await waitFor(() => {
      expect(apiService.updateUser).toHaveBeenCalledWith(mockUser.id, {
        name: '更新されたユーザー',
        email: 'updated@example.com',
        role: 'user'
      });
    });

    // onSuccessが正しいパラメータで呼ばれることを確認
    expect(mockOnSuccess).toHaveBeenCalledWith(updatedUser);
  });
}); 