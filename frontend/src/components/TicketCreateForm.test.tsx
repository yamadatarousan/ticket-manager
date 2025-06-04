import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TicketCreateForm } from './TicketCreateForm';

// APIのモック
jest.mock('../services/api', () => ({
  createTicket: jest.fn().mockResolvedValue({})
}));

describe('TicketCreateForm', () => {
  it('チケット作成フォームが正しく表示されること', () => {
    render(
      <TicketCreateForm 
        onSuccess={() => {}} 
        onCancel={() => {}} 
      />
    );
    
    // フォームの主要な要素が存在することを確認
    expect(screen.getByLabelText(/タイトル/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/優先度/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /作成/i })).toBeInTheDocument();
  });
}); 