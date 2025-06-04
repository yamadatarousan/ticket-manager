import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Navbar } from './Navbar';
import { AuthContext } from '../context/AuthContext';

// AuthContextのモック
const mockLogout = jest.fn();
const mockUseAuth = {
  user: {
    name: 'テストユーザー',
    email: 'test@example.com',
    role: 'admin'
  },
  logout: mockLogout,
  isAuthenticated: true
};

// AuthContextのモックを設定
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

describe('Navbarコンポーネント', () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  test('認証済みユーザーの場合、ユーザー名とロールが表示されること', () => {
    render(<Navbar />);
    
    expect(screen.getByText('テストユーザー')).toBeInTheDocument();
    expect(screen.getByText('管理者')).toBeInTheDocument();
  });

  test('管理者ユーザーの場合、ユーザー管理メニューが表示されること', () => {
    render(<Navbar />);
    
    expect(screen.getByText('ユーザー管理')).toBeInTheDocument();
  });

  test('一般ユーザーの場合、ユーザー管理メニューが表示されないこと', () => {
    // 一般ユーザーとしてモックを上書き
    mockUseAuth.user.role = 'user';
    
    render(<Navbar />);
    
    expect(screen.queryByText('ユーザー管理')).not.toBeInTheDocument();
  });
}); 