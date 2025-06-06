import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TicketEditPage } from './TicketEditPage';

// React Routerのモック
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
  useNavigate: () => jest.fn(),
}));

// APIサービスのモック
jest.mock('../services/api', () => ({
  apiService: {
    getTicket: jest.fn(),
  },
}));

describe('TicketEditPage', () => {
  test('ローディング状態が正常に表示されること', () => {
    render(
      <MemoryRouter>
        <TicketEditPage />
      </MemoryRouter>
    );

    // ローディング状態の確認（skeleton loader）
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });
});
