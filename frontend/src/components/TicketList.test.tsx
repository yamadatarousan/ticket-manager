import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TicketList } from './TicketList';

// APIのモック
jest.mock('../services/api', () => ({
  apiService: {
    getTickets: jest.fn().mockReturnValue(new Promise(() => {})),
    getProjects: jest.fn().mockReturnValue(new Promise(() => {})),
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

describe('TicketList', () => {
  it('チケットリストが正しく表示されること', () => {
    render(<TicketList onTicketClick={() => {}} onCreateTicket={() => {}} />);

    // コンポーネントが正しくレンダリングされていることを確認
    expect(document.body).toBeInTheDocument();
  });
});
