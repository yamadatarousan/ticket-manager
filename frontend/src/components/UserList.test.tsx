import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserList } from './UserList';

// APIのモック
jest.mock('../services/api', () => ({
  apiService: {
    getUsers: jest.fn().mockResolvedValue([]),
  },
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

describe('UserList', () => {
  it('ユーザーリストが正しく表示されること', async () => {
    await act(async () => {
      render(<UserList onUserClick={() => {}} onCreateUser={() => {}} onUserEdit={() => {}} />);
    });

    // ユーザーリストの主要な要素が存在することを確認
    await waitFor(() => {
      expect(screen.getByText(/ユーザー管理/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /新規ユーザー/i })).toBeInTheDocument();
    });
  });
});
