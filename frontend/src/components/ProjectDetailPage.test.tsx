/**
 * ProjectDetailPageコンポーネントのテストスイート
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import { ProjectDetailPage } from './ProjectDetailPage';
import { apiService } from '../services/api';
import { Project, User } from '../types';

// apiServiceのモック
jest.mock('../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

// ダミープロジェクトデータ
const mockProject: Project = {
  id: 1,
  name: 'テストプロジェクト',
  description: 'これはテストプロジェクトの説明です。',
  status: 'active',
  status_label: '進行中',
  start_date: '2023-01-01',
  end_date: '2023-12-31',
  created_by: 1,
  creator_name: 'テストユーザー',
  progress_rate: 0.6,
  days_remaining: 180,
  overdue: false,
  duration_string: '2023/01/01 - 2023/12/31',
  created_at: '2023-01-01T10:00:00.000Z',
  updated_at: '2023-01-01T10:00:00.000Z',
};

// ダミーユーザーデータ
const mockUser: User = {
  id: 1,
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'user',
  created_at: '2023-01-01T10:00:00.000Z',
  updated_at: '2023-01-01T10:00:00.000Z',
};

// AuthContextのモックプロバイダー
const mockAuthContextValue: AuthContextType = {
  user: mockUser,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  fetchCurrentUser: jest.fn(),
};

// テスト用のラッパーコンポーネント
const renderWithRouterAndAuth = (ui: React.ReactElement, initialEntries: string[] = ['/projects/1']) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/projects/:id" element={ui} />
          <Route path="/projects" element={<div>プロジェクト一覧ページ</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('プロジェクト詳細が正しく表示されること', async () => {
    mockedApiService.getProject.mockResolvedValue(mockProject);

    await act(async () => {
      renderWithRouterAndAuth(<ProjectDetailPage />);
    });

    // プロジェクト名
    expect(screen.getByText(mockProject.name)).toBeInTheDocument();
    // ステータスラベル
    expect(screen.getByText(mockProject.status_label)).toBeInTheDocument();
    // 説明
    expect(screen.getByText(mockProject.description)).toBeInTheDocument();
    // 作成者
    expect(screen.getByText(mockProject.creator_name)).toBeInTheDocument();
    // 開始日
    expect(screen.getByText(new Date(mockProject.start_date!).toLocaleDateString())).toBeInTheDocument();
    // 終了日
    expect(screen.getByText(new Date(mockProject.end_date!).toLocaleDateString())).toBeInTheDocument();
    // 進捗率
    expect(screen.getByText(`${Math.round(mockProject.progress_rate * 100)}%`)).toBeInTheDocument();
    // 残り日数
    expect(screen.getByText(`${mockProject.days_remaining}日`)).toBeInTheDocument();
  });

  test('ローディング状態が正しく表示されること', async () => {
    mockedApiService.getProject.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockProject), 100))
    );

    renderWithRouterAndAuth(<ProjectDetailPage />);
    expect(screen.getByText('プロジェクト情報を読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('プロジェクト情報を読み込み中...')).not.toBeInTheDocument();
    });
  });

  test('APIエラー時にエラーメッセージが表示されること', async () => {
    const errorMessage = 'プロジェクトの取得に失敗しました';
    mockedApiService.getProject.mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      renderWithRouterAndAuth(<ProjectDetailPage />);
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText('プロジェクト一覧に戻る')).toBeInTheDocument();
  });

  test('プロジェクトが見つからない場合にメッセージが表示されること', async () => {
    mockedApiService.getProject.mockResolvedValue(null as any); // APIがnullを返すケース

    await act(async () => {
      renderWithRouterAndAuth(<ProjectDetailPage />);
    });

    expect(screen.getByText('プロジェクトが見つかりません。')).toBeInTheDocument();
    expect(screen.getByText('プロジェクト一覧に戻る')).toBeInTheDocument();
  });

  test('IDが不正な場合にエラーメッセージが表示されること', async () => {
    await act(async () => {
      renderWithRouterAndAuth(<ProjectDetailPage />, ['/projects/invalid-id']);
    });

    // useParamsでidが取得できない、またはparseIntでNaNになるシナリオ
    // useEffect内で `if (!id)` または `parseInt(id, 10)` が失敗するケースを想定
    // 現在の実装では、idが取得できない場合`プロジェクトIDが指定されていません`と表示される
    // idが数値でない場合、apiService.getProjectがエラーを返すことを期待

    // このテストは現在のコンポーネント実装だと `プロジェクトIDが指定されていません` になる
    // もしapiService.getProjectが呼ばれる前にidチェックで弾かれるなら、そのメッセージを確認
    // もしapiService.getProjectが呼ばれてエラーになるなら、そのエラーメッセージを確認

    // 今回はuseEffect内の最初のidチェックを期待
     await waitFor(() => {
       expect(screen.getByText('プロジェクトIDが指定されていません')).toBeInTheDocument();
     });
  });

  describe('権限による表示制御', () => {
    test('管理者ユーザーの場合、編集・削除ボタンが表示されること', async () => {
      mockedApiService.getProject.mockResolvedValue(mockProject);
      const adminUser: User = { ...mockUser, role: 'admin' };
      const adminAuthContext: AuthContextType = { ...mockAuthContextValue, user: adminUser };

      await act(async () => {
        render(
          <AuthContext.Provider value={adminAuthContext}>
            <MemoryRouter initialEntries={['/projects/1']}>
              <Routes>
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
              </Routes>
            </MemoryRouter>
          </AuthContext.Provider>
        );
      });

      expect(screen.getByText('プロジェクト編集')).toBeInTheDocument();
      expect(screen.getByText('プロジェクト削除')).toBeInTheDocument();
    });

    test('一般ユーザーの場合、編集・削除ボタンが表示されないこと', async () => {
      mockedApiService.getProject.mockResolvedValue(mockProject);
      // mockAuthContextValueはデフォルトで一般ユーザーなのでそのまま使用

      await act(async () => {
        renderWithRouterAndAuth(<ProjectDetailPage />);
      });

      expect(screen.queryByText('プロジェクト編集')).not.toBeInTheDocument();
      expect(screen.queryByText('プロジェクト削除')).not.toBeInTheDocument();
    });
  });

  // // TODO: 削除機能のテスト（モーダルとAPI呼び出し確認）
  // test('削除ボタンクリックで確認モーダルが表示され、確認後にAPIが呼ばれること', async () => {
  //   mockedApiService.getProject.mockResolvedValue(mockProject);
  //   mockedApiService.deleteProject.mockResolvedValue(undefined); // 削除成功
  //   window.confirm = jest.fn(() => true); // 確認ダイアログでOKを押す

  //   const adminUser: User = { ...mockUser, role: 'admin' };
  //   const adminAuthContext: AuthContextType = { ...mockAuthContextValue, user: adminUser };

  //   let navigateMock = jest.fn();
  //   jest.mock('react-router-dom', () => ({
  //     ...jest.requireActual('react-router-dom'),
  //     useNavigate: () => navigateMock,
  //   }));


  //   await act(async () => {
  //     render(
  //       <AuthContext.Provider value={adminAuthContext}>
  //         <MemoryRouter initialEntries={['/projects/1']}>
  //           <Routes>
  //             <Route path="/projects/:id" element={<ProjectDetailPage />} />
  //             <Route path="/projects" element={<div>プロジェクト一覧</div>} />
  //           </Routes>
  //         </MemoryRouter>
  //       </AuthContext.Provider>
  //     );
  //   });

  //   const deleteButton = screen.getByText('プロジェクト削除');
  //   fireEvent.click(deleteButton);

  //   expect(window.confirm).toHaveBeenCalledWith(`プロジェクト「${mockProject.name}」を削除しますか？この操作は元に戻せません。`);
  //   expect(mockedApiService.deleteProject).toHaveBeenCalledWith(mockProject.id);

  //   // alertが表示されることの確認は難しいので、ここでは省略
  //   // navigateが呼ばれることの確認
  //   await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/projects'));
  // });
});
