import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TicketCreateForm } from './TicketCreateForm';
import { apiService } from '../services/api';

// apiServiceのモック
jest.mock('../services/api', () => ({
  apiService: {
    createTicket: jest.fn()
  }
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  );
};

describe('TicketCreateForm', () => {
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();
  const mockProjectId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('フォームの初期表示が正しいこと', () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        projectId={mockProjectId}
      />
    );

    // タイトル入力フィールドの存在確認
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();

    // 説明入力フィールドの存在確認
    expect(screen.getByLabelText('説明')).toBeInTheDocument();

    // 優先度選択フィールドの存在確認
    expect(screen.getByLabelText('優先度')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: '優先度' })).toHaveValue('medium');

    // ボタンの存在確認
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '作成' })).toBeInTheDocument();
  });

  it('必須項目が未入力の場合、エラーメッセージが表示されること', async () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        projectId={mockProjectId}
      />
    );

    // 作成ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    // エラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    });
  });

  it('チケット作成が成功した場合、onSuccessが呼ばれること', async () => {
    const mockTicket = {
      id: 1,
      title: 'テストチケット',
      description: 'テスト説明',
      status: 'open' as const,
      priority: 'medium' as const,
      project_id: mockProjectId,
      creator_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };

    (apiService.createTicket as jest.Mock).mockResolvedValueOnce(mockTicket);

    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        projectId={mockProjectId}
      />
    );

    // フォームに入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストチケット' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });

    // 作成ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    // APIが呼ばれたことを確認
    await waitFor(() => {
      expect(apiService.createTicket).toHaveBeenCalledWith({
        title: 'テストチケット',
        description: 'テスト説明',
        status: 'open',
        priority: 'medium',
        project_id: mockProjectId
      });
    });

    // コールバックが呼ばれたことを確認
    expect(mockOnSuccess).toHaveBeenCalledWith(mockTicket);
  });

  it('チケット作成が失敗した場合、エラーメッセージが表示されること', async () => {
    const errorMessage = 'チケットの作成に失敗しました';
    (apiService.createTicket as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        projectId={mockProjectId}
      />
    );

    // フォームに入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストチケット' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });

    // 作成ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    // エラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // コールバックが呼ばれていないことを確認
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('キャンセルボタンをクリックした場合、onCancelが呼ばれること', () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        projectId={mockProjectId}
      />
    );

    // キャンセルボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

    // コールバックが呼ばれたことを確認
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('プロジェクトIDが指定されていない場合、エラーメッセージが表示されること', async () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // フォームに入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストチケット' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });

    // 作成ボタンをクリック
    fireEvent.click(screen.getByRole('button', { name: '作成' }));

    // エラーメッセージの確認
    await waitFor(() => {
      expect(screen.getByText('プロジェクトを選択してください')).toBeInTheDocument();
    });
  });
}); 