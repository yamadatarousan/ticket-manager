import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { TicketDetailPage } from './TicketDetailPage';

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    getTicket: jest.fn(),
  },
}));

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  }),
}));

const mockApiService = require('../services/api').apiService;

describe('TicketDetailPage', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  test('ローディング状態が正常に表示されること', async () => {
    // APIが遅延するようにモック設定
    mockApiService.getTicket.mockReturnValue(new Promise(() => {}));

    await waitFor(() => {
      render(
        <MemoryRouter
          initialEntries={['/tickets/1']}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    // スケルトンローダーの表示確認
    const skeletonElements = screen.getAllByText('', { selector: '.loading-skeleton' });
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
