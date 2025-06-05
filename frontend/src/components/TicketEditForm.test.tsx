import React from 'react';
import { render, screen } from '@testing-library/react';
import { TicketEditForm } from './TicketEditForm';
import { Ticket } from '../types';

// モックチケットデータ
const mockTicket: Ticket = {
  id: 1,
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'open',
  priority: 'medium',
  assigned_to: 2,
  created_by: 3,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

// APIサービスのモック
jest.mock('../services/api', () => ({
  apiService: {
    updateTicket: jest.fn()
  }
}));

describe('TicketEditForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('チケット編集フォームが正常にレンダリングされること', () => {
    render(
      <TicketEditForm
        ticket={mockTicket}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('チケット編集')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Ticket')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });
}); 