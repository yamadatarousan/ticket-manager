import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketCreateForm } from '../TicketCreateForm';
import { apiService } from '../../services/api';

// apiServiceのモック
jest.mock('../../services/api', () => ({
  apiService: {
    createTicket: jest.fn()
  }
}));

describe('TicketCreateForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('フォームが正しく表示されること', () => {
    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // タイトルが表示されていること
    expect(screen.getByText('新規チケット作成')).toBeInTheDocument();

    // 必須フィールドが表示されていること
    expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/説明/)).toBeInTheDocument();
    expect(screen.getByLabelText(/ステータス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/優先度/)).toBeInTheDocument();
    expect(screen.getByLabelText(/担当者/)).toBeInTheDocument();

    // ボタンが表示されていること
    expect(screen.getByRole('button', { name: 'チケットを作成' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('入力フィールドの値が正しく更新されること', () => {
    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const titleInput = screen.getByLabelText(/タイトル/);
    const descriptionInput = screen.getByLabelText(/説明/);
    const statusSelect = screen.getByLabelText(/ステータス/);
    const prioritySelect = screen.getByLabelText(/優先度/);
    const assignedToInput = screen.getByLabelText(/担当者/);

    // 各フィールドに値を入力
    fireEvent.change(titleInput, { target: { value: 'テストタイトル' } });
    fireEvent.change(descriptionInput, { target: { value: 'テスト説明' } });
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    fireEvent.change(assignedToInput, { target: { value: 'test@example.com' } });

    // 値が正しく更新されていることを確認
    expect(titleInput).toHaveValue('テストタイトル');
    expect(descriptionInput).toHaveValue('テスト説明');
    expect(statusSelect).toHaveValue('in_progress');
    expect(prioritySelect).toHaveValue('high');
    expect(assignedToInput).toHaveValue('test@example.com');
  });

  it('必須フィールドが空の場合、エラーメッセージが表示されること', async () => {
    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole('button', { name: 'チケットを作成' });
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText('タイトルを入力してください')).toBeInTheDocument();
  });

  it('フォーム送信が成功した場合、onSuccessが呼ばれること', async () => {
    const mockTicket = {
      id: 1,
      title: 'テストタイトル',
      description: 'テスト説明',
      status: 'open',
      priority: 'medium',
      assigned_to: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    (apiService.createTicket as jest.Mock).mockResolvedValueOnce({ ticket: mockTicket });

    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // 必須フィールドに入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: 'テストタイトル' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'テスト説明' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: 'チケットを作成' });
    fireEvent.click(submitButton);

    // APIが呼ばれることを確認
    await waitFor(() => {
      expect(apiService.createTicket).toHaveBeenCalledWith({
        title: 'テストタイトル',
        description: 'テスト説明',
        status: 'open',
        priority: 'medium',
        assigned_to: null
      });
    });

    // onSuccessが呼ばれることを確認
    expect(mockOnSuccess).toHaveBeenCalledWith(mockTicket);
  });

  it('フォーム送信が失敗した場合、エラーメッセージが表示されること', async () => {
    const errorMessage = 'チケットの作成に失敗しました';
    (apiService.createTicket as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // 必須フィールドに入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: 'テストタイトル' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'テスト説明' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: 'チケットを作成' });
    fireEvent.click(submitButton);

    // エラーメッセージが表示されることを確認
    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
  });

  it('キャンセルボタンをクリックした場合、onCancelが呼ばれること', () => {
    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('送信中は送信ボタンが無効化され、ローディング表示になること', async () => {
    (apiService.createTicket as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<TicketCreateForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />);

    // 必須フィールドに入力
    fireEvent.change(screen.getByLabelText(/タイトル/), { target: { value: 'テストタイトル' } });
    fireEvent.change(screen.getByLabelText(/説明/), { target: { value: 'テスト説明' } });

    // フォームを送信
    const submitButton = screen.getByRole('button', { name: 'チケットを作成' });
    fireEvent.click(submitButton);

    // 送信ボタンが無効化され、ローディング表示になることを確認
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('作成中...')).toBeInTheDocument();
  });
}); 