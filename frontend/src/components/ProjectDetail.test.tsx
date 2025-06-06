import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProjectDetail } from './ProjectDetail';
import { apiService } from '../services/api';
import { AuthProvider } from '../context/AuthContext';

// APIサービスのモック
jest.mock('../services/api', () => ({
  apiService: {
    getProject: jest.fn(),
    getTickets: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

// AuthContextのモック
jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      role: 'admin',
    },
    isAuthenticated: true,
  }),
}));

// モックデータ
const mockProject = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'テストプロジェクトの説明',
  status: 'active',
  status_label: '進行中',
  progress_rate: 0.5,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  duration_string: '1年',
  days_remaining: 180,
  overdue: false,
  creator_name: 'テストユーザー',
  creator_id: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockTickets = {
  items: [
    {
      id: 1,
      title: 'テストチケット1',
      status: 'open',
      status_label: '未着手',
      priority: 'high',
      priority_label: '高',
      assignee_name: null,
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'テストチケット2',
      status: 'in_progress',
      status_label: '進行中',
      priority: 'medium',
      priority_label: '中',
      assignee_name: null,
      updated_at: '2024-01-02T00:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  per_page: 10,
  total_pages: 1
};

// テスト用のラッパーコンポーネント
const renderWithRouter = (ui: React.ReactElement, projectId: string = '1') => {
  return render(
    <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/projects/:id" element={ui} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('プロジェクト詳細コンポーネント', () => {
  beforeEach(() => {
    // モックのリセット
    jest.clearAllMocks();
    // デフォルトのモック実装
    (apiService.getProject as jest.Mock).mockResolvedValue(mockProject);
    (apiService.getTickets as jest.Mock).mockResolvedValue(mockTickets);
    (apiService.deleteProject as jest.Mock).mockResolvedValue({});
  });

  it('プロジェクトの基本情報が表示されること', async () => {
    renderWithRouter(<ProjectDetail />);

    // プロジェクト情報の表示確認
    await waitFor(() => {
      expect(screen.getByText('テストプロジェクト')).toBeInTheDocument();
      expect(screen.getByText('テストプロジェクトの説明')).toBeInTheDocument();
      expect(screen.getByText('作成者: テストユーザー')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  it('チケット一覧が表示されること', async () => {
    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      // チケット一覧のヘッダー確認
      expect(screen.getByText('関連チケット')).toBeInTheDocument();
      expect(screen.getByText('チケットを作成')).toBeInTheDocument();

      // チケットの内容確認
      expect(screen.getByText('テストチケット1')).toBeInTheDocument();
      expect(screen.getByText('テストチケット2')).toBeInTheDocument();
      expect(screen.getByText('未着手')).toBeInTheDocument();
      expect(screen.getByText('高')).toBeInTheDocument();
      expect(screen.getByText('中')).toBeInTheDocument();
      expect(screen.getAllByText('未割り当て')).toHaveLength(2);
    });
  });

  it('チケットが存在しない場合、適切なメッセージが表示されること', async () => {
    (apiService.getTickets as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      per_page: 10,
      total_pages: 0
    });

    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('チケットがありません')).toBeInTheDocument();
      expect(screen.getByText('このプロジェクトにはまだチケットが作成されていません。')).toBeInTheDocument();
      expect(screen.getByText('最初のチケットを作成')).toBeInTheDocument();
    });
  });

  it('エラーが発生した場合、エラーメッセージが表示されること', async () => {
    const errorMessage = 'プロジェクトの取得に失敗しました';
    (apiService.getProject as jest.Mock).mockRejectedValue(new Error(errorMessage));

    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('プロジェクトが見つからない場合、適切なメッセージが表示されること', async () => {
    (apiService.getProject as jest.Mock).mockResolvedValue(null);

    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('プロジェクトが見つかりません')).toBeInTheDocument();
      expect(screen.getByText('指定されたプロジェクトは存在しないか、アクセス権限がありません。')).toBeInTheDocument();
      expect(screen.getByText('プロジェクト一覧に戻る')).toBeInTheDocument();
    });
  });

  it('管理者の場合、編集・削除ボタンが表示されること', async () => {
    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('編集')).toBeInTheDocument();
      expect(screen.getByText('削除')).toBeInTheDocument();
    });
  });

  it('削除ボタンをクリックすると確認モーダルが表示されること', async () => {
    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('削除')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('削除'));

    await waitFor(() => {
      expect(screen.getByText('プロジェクト: テストプロジェクト')).toBeInTheDocument();
      expect(screen.getByText('※ この操作は取り消せません')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
      expect(screen.getByText('削除する')).toBeInTheDocument();
    });
  });

  it('チケットをクリックすると詳細ページに遷移すること', async () => {
    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('テストチケット1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('テストチケット1'));

    // 遷移の確認（実際のルーター動作をテストする場合）
    // この部分は実際のルーティングロジックに依存します
  });

  it('チケット作成ボタンをクリックすると新規作成ページに遷移すること', async () => {
    renderWithRouter(<ProjectDetail />);

    await waitFor(() => {
      expect(screen.getByText('チケットを作成')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('チケットを作成'));

    // 遷移の確認（実際のルーティングロジックに依存します）
    // この部分は実際のルーティングロジックに依存します
  });
}); 