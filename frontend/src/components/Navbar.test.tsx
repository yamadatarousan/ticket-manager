import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    logout: jest.fn(),
    isAuthenticated: true
  })
}));

// テスト用のナビゲーションバーラッパー
const NavbarWrapper: React.FC<{ initialEntries?: string[] }> = ({ 
  initialEntries = ['/tickets'] 
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Navbar />
  </MemoryRouter>
);

describe('Navbar', () => {
  it('ナビゲーションバーが正しく表示されること', () => {
    render(<NavbarWrapper />);
    
    // ナビゲーションバーの主要な要素が存在することを確認
    expect(screen.getByText('チケット管理')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('チケット')).toBeInTheDocument();
  });
}); 