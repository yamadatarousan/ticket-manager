import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navbar } from './Navbar';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    logout: jest.fn(),
    isAuthenticated: true
  })
}));

describe('Navbar', () => {
  it('ナビゲーションバーが正しく表示されること', () => {
    render(<Navbar />);
    
    // ナビゲーションバーの主要な要素が存在することを確認
    expect(screen.getByText(/チケット管理システム/i)).toBeInTheDocument();
    expect(screen.getByText(/チケット一覧/i)).toBeInTheDocument();
  });
}); 