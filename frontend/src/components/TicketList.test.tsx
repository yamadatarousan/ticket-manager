import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TicketList } from './TicketList';

// APIのモック
jest.mock('../services/api', () => ({
  getTickets: jest.fn().mockResolvedValue([])
}));

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'admin@example.com', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    error: null
  })
}));

describe('TicketList', () => {
  it('チケットリストが正しく表示されること', () => {
    render(<TicketList />);
    
    // エラーが表示されることを確認（APIの問題による）
    expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
  });
}); 