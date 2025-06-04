import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketList } from './TicketList';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// apiServiceのモック
jest.mock('../services/api', () => ({
  apiService: {
    getTickets: jest.fn()
  }
}));

describe('TicketListコンポーネント', () => {
  const mockTickets = [
    {
      id: 1,
      title: 'テストチケット1',
      description: 'テスト説明1',
      status: 'open',
      priority: 'high',
      assigned_to: 'user1@example.com',
      created_by: 'admin@example.com',
      created_at: '2024-03-15T10:00:00Z',
      updated_at: '2024-03-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'テストチケット2',
      description: 'テスト説明2',
      status: 'in_progress',
      priority: 'medium',
      assigned_to: 'user2@example.com',
      created_by: 'admin@example.com',
      created_at: '2024-03-15T11:00:00Z',
      updated_at: '2024-03-15T11:00:00Z'
    }
  ];

  beforeEach(() => {
    // AuthContextのモックを設定
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false
    });

    // apiServiceのモックを設定
    (apiService.getTickets as jest.Mock).mockResolvedValue({
      tickets: mockTickets
    });
  });

  test('チケット一覧が正しく表示されること', async () => {
    render(<TicketList />);

    // ローディング表示を確認
    expect(screen.getByText('チケットを読み込み中...')).toBeInTheDocument();

    // チケット一覧の表示を確認
    await waitFor(() => {
      expect(screen.getByText('テストチケット1')).toBeInTheDocument();
      expect(screen.getByText('テストチケット2')).toBeInTheDocument();
    });

    // ステータスと優先度の表示を確認
    expect(screen.getByText('未対応')).toBeInTheDocument();
    expect(screen.getByText('対応中')).toBeInTheDocument();
    expect(screen.getByText('高')).toBeInTheDocument();
    expect(screen.getByText('中')).toBeInTheDocument();
  });

  test('フィルター機能が正しく動作すること', async () => {
    render(<TicketList />);

    // フィルターの選択を待機
    await waitFor(() => {
      expect(screen.getByText('テストチケット1')).toBeInTheDocument();
    });

    // ステータスフィルターを変更
    const statusSelect = screen.getByLabelText('ステータス');
    fireEvent.change(statusSelect, { target: { value: 'open' } });

    // APIが正しいパラメータで呼ばれることを確認
    await waitFor(() => {
      expect(apiService.getTickets).toHaveBeenCalledWith({ status: 'open' });
    });
  });

  test('エラー時にエラーメッセージが表示されること', async () => {
    // APIエラーをモック
    (apiService.getTickets as jest.Mock).mockRejectedValue(new Error('APIエラー'));

    render(<TicketList />);

    // エラーメッセージの表示を確認
    await waitFor(() => {
      expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
      expect(screen.getByText('APIエラー')).toBeInTheDocument();
    });

    // 再試行ボタンの表示を確認
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });
}); 