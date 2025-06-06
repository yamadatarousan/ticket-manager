import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TicketCreateForm } from './TicketCreateForm';
import { apiService } from '../services/api';

// apiServiceのモック
jest.mock('../services/api', () => ({
  apiService: {
    createTicket: jest.fn(),
    getProjects: jest.fn()
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

  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトのモック設定
    (apiService.getProjects as jest.Mock).mockResolvedValue([
      { id: 1, name: 'テストプロジェクト1' },
      { id: 2, name: 'テストプロジェクト2' }
    ]);
  });

  it('フォームの初期表示が正しいこと', async () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('新規チケット作成')).toBeInTheDocument();
    expect(screen.getByLabelText('タイトル')).toBeInTheDocument();
    expect(screen.getByLabelText('説明')).toBeInTheDocument();
    expect(screen.getByLabelText('優先度')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();

    // 最初はプロジェクト読み込み中の表示
    expect(screen.getByText('プロジェクト一覧を読み込み中...')).toBeInTheDocument();

    // プロジェクト一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByLabelText('プロジェクト')).toBeInTheDocument();
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
    });
  });

  it('プロジェクトIDが指定されている場合、プロジェクト選択フィールドが表示されないこと', () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        projectId={1}
      />
    );

    expect(screen.queryByLabelText('プロジェクト')).not.toBeInTheDocument();
  });

  it('フォーム送信が成功すること', async () => {
    const mockTicket = {
      id: 1,
      title: 'テストチケット',
      description: 'テスト説明',
      status: 'open' as const,
      priority: 'medium' as const,
      project_id: 1,
      creator_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      created_by: 1
    };

    (apiService.createTicket as jest.Mock).mockResolvedValue(mockTicket);

    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // プロジェクト一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
    });

    // フォームに入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストチケット' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });
    fireEvent.change(screen.getByLabelText('プロジェクト'), {
      target: { value: '1' }
    });

    // フォーム送信
    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(apiService.createTicket).toHaveBeenCalledWith({
        title: 'テストチケット',
        description: 'テスト説明',
        status: 'open',
        priority: 'medium',
        project_id: 1
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(mockTicket);
    });
  });

  it('フォーム送信が失敗した場合、エラーメッセージが表示されること', async () => {
    (apiService.createTicket as jest.Mock).mockRejectedValue(new Error('作成に失敗しました'));

    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // プロジェクト一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
    });

    // フォームに入力
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストチケット' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });
    fireEvent.change(screen.getByLabelText('プロジェクト'), {
      target: { value: '1' }
    });

    // フォーム送信
    fireEvent.click(screen.getByText('作成'));

    await waitFor(() => {
      expect(screen.getByText('作成に失敗しました')).toBeInTheDocument();
    });
  });

  it('プロジェクトIDが指定されていない場合、エラーメッセージが表示されること', async () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // プロジェクト一覧が読み込まれるまで待機
    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト1')).toBeInTheDocument();
    });

    // フォームに入力（プロジェクトは選択しない）
    fireEvent.change(screen.getByLabelText('タイトル'), {
      target: { value: 'テストチケット' }
    });
    fireEvent.change(screen.getByLabelText('説明'), {
      target: { value: 'テスト説明' }
    });

    // フォーム送信
    fireEvent.click(screen.getByText('作成'));

    // エラーメッセージの確認（より具体的なセレクターを使用）
    await waitFor(() => {
      const errorMessage = screen.getByRole('alert') || screen.getByText(/プロジェクトを選択してください/);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('キャンセルボタンが正しく動作すること', () => {
    renderWithRouter(
      <TicketCreateForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('キャンセル'));
    expect(mockOnCancel).toHaveBeenCalled();
  });
}); 