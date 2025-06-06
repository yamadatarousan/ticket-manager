import React from 'react';
import { render, screen } from '@testing-library/react';
import { SystemSettingsPage } from './SystemSettingsPage';

// AuthContextをモック
let mockUser: {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
} = {
  id: 1,
  email: 'admin@example.com',
  role: 'admin',
  name: 'Test Admin',
};

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    getSystemSettings: jest.fn(),
  },
}));

const mockApiService = require('../services/api').apiService;

describe('SystemSettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトで管理者ユーザーに戻す
    mockUser = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      name: 'Test Admin',
    };
  });

  test('管理者ユーザーの場合、ローディング状態が正常に表示されること', () => {
    // APIが遅延するようにモック設定
    mockApiService.getSystemSettings.mockReturnValue(new Promise(() => {}));

    render(<SystemSettingsPage />);

    // ローディング表示の確認
    expect(screen.getByText('設定を読み込み中...')).toBeInTheDocument();
  });

  test('管理者以外のユーザーの場合、アクセス権限エラーが表示されること', () => {
    // 非管理者ユーザーに変更
    mockUser.role = 'user';

    render(<SystemSettingsPage />);

    // アクセス権限エラーの確認
    expect(screen.getByText('アクセス権限がありません')).toBeInTheDocument();
    expect(
      screen.getByText('この機能にアクセスするには管理者権限が必要です。')
    ).toBeInTheDocument();
  });
});
