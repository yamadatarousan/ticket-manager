import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TicketDetailPage } from './TicketDetailPage';

// apiServiceをモック
jest.mock('../services/api', () => ({
  apiService: {
    getTicket: jest.fn()
  }
}));

const mockApiService = require('../services/api').apiService;

describe('TicketDetailPage', () => {
  beforeEach(() => {
    // 各テスト前にモックをリセット
    jest.clearAllMocks();
  });

  test('ローディング状態が正常に表示されること', () => {
    // APIが遅延するようにモック設定
    mockApiService.getTicket.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/tickets/1']}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // ローディング表示の確認
    expect(screen.getByText('チケットを読み込み中...')).toBeInTheDocument();
  });
}); 