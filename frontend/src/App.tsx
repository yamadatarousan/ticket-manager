/**
 * チケット管理システム メインアプリケーション
 * 
 * このコンポーネントはアプリケーション全体の構成を管理し、以下の機能を提供します：
 * - ルーティング設定（React Router）
 * - 認証状態管理（AuthProvider）
 * - レイアウト構成（ナビゲーション、メインコンテンツ）
 * - 権限に基づいたルート保護
 * 
 * アプリケーションのルーティング構造：
 * - / - ホーム画面（認証済みユーザーはダッシュボードにリダイレクト）
 * - /login - ログイン画面
 * - /register - ユーザー登録画面
 * - /dashboard - ダッシュボード（要認証）
 * - /projects - プロジェクト一覧（要認証）
 * - /projects/new - プロジェクト作成（要管理者/マネージャー権限）
 * - /projects/:id - プロジェクト詳細（要認証）
 * - /projects/:id/edit - プロジェクト編集（要管理者/マネージャー権限）
 * - /tickets - チケット一覧（要認証）
 * - /tickets/new - チケット作成（要認証）
 * - /tickets/:id - チケット詳細（要認証）
 * - /tickets/:id/edit - チケット編集（要認証）
 * - /users - ユーザー一覧（要管理者/マネージャー権限）
 * - /users/new - ユーザー作成（要管理者権限）
 * - /users/:id - ユーザー詳細（要管理者/マネージャー権限）
 * - /users/:id/edit - ユーザー編集（要管理者権限）
 * - /profile - ユーザープロフィール（要認証）
 * - /settings - システム設定（要管理者権限）
 * - * - 404ページ
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { TicketList } from './components/TicketList';
import { TicketCreateForm } from './components/TicketCreateForm';
import { TicketEditPage } from './components/TicketEditPage';
import { TicketDetailPage } from './components/TicketDetailPage';
import { UserList } from './components/UserList';
import { UserCreateForm } from './components/UserCreateForm';
import { UserEditForm } from './components/UserEditForm';
import { SystemSettingsPage } from './components/SystemSettingsPage';
import { ProjectList } from './components/ProjectList';
import { ProjectCreateForm } from './components/ProjectCreateForm';
import { Ticket, User, DashboardStats, Project } from './types';
import { apiService } from './services/api';
import './App.css';

// メインレイアウトコンポーネント
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'project-create':
        navigate('/projects/new');
        break;
      case 'tickets':
        navigate('/tickets');
        break;
      case 'ticket-create':
        navigate('/tickets/new');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'user-create':
        navigate('/users/new');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'register':
        navigate('/register');
        break;
      default:
        navigate('/tickets');
    }
  };

  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/tickets')) return 'tickets';
    if (path.startsWith('/users')) return 'users';
    if (path === '/profile') return 'profile';
    if (path === '/settings') return 'settings';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        onNavigate={handleNavigate} 
        currentView={getCurrentView()}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

// ダッシュボードコンポーネント
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getDashboardStats();
        setStats(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : '統計情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return '未対応';
      case 'in_progress': return '対応中';
      case 'resolved': return '解決済み';
      case 'closed': return 'クローズ';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return '低';
      case 'medium': return '中';
      case 'high': return '高';
      case 'urgent': return '緊急';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">統計情報を読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ダッシュボード
          </h1>
          <p className="text-gray-600 mb-6">
            こんにちは、{user?.name}さん！
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {stats && (
            <>
              {/* 統計情報カード */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* 総チケット数 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.ticket_stats.total}</div>
                    <div className="text-sm text-blue-700">総チケット数</div>
                  </div>
                </div>

                {/* 未対応チケット */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.ticket_stats.open}</div>
                    <div className="text-sm text-red-700">未対応</div>
                  </div>
                </div>

                {/* 対応中チケット */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats.ticket_stats.in_progress}</div>
                    <div className="text-sm text-yellow-700">対応中</div>
                  </div>
                </div>

                {/* 解決済みチケット */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.ticket_stats.resolved}</div>
                    <div className="text-sm text-green-700">解決済み</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 最近のチケット */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">最近のチケット</h3>
                  <div className="space-y-3">
                    {(stats.recent_tickets || []).slice(0, 5).map(ticket => (
                      <div 
                        key={ticket.id} 
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(ticket.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.status === 'open' ? 'bg-red-100 text-red-800' :
                            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(stats.recent_tickets || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      まだチケットがありません
                    </p>
                  )}
                </div>

                {/* 割り当てられたチケット */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">割り当てられたチケット</h3>
                  <div className="space-y-3">
                    {(stats.assigned_tickets || []).slice(0, 5).map(ticket => (
                      <div 
                        key={ticket.id} 
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            優先度: {getPriorityLabel(ticket.priority)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getPriorityLabel(ticket.priority)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(stats.assigned_tickets || []).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      割り当てられたチケットはありません
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// プロジェクト関連ページコンポーネント
const ProjectPages: React.FC = () => {
  const navigate = useNavigate();

  const handleProjectCreateSuccess = (project: Project) => {
    navigate('/projects');
  };

  const handleProjectCreateCancel = () => {
    navigate('/projects');
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleProjectEdit = (project: Project) => {
    navigate(`/projects/${project.id}/edit`);
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProjectList 
            onProjectClick={handleProjectClick}
            onProjectEdit={handleProjectEdit}
            onCreateProject={handleCreateProject}
          />
        } 
      />
      <Route 
        path="/new" 
        element={
          <ProjectCreateForm 
            onSuccess={handleProjectCreateSuccess}
            onCancel={handleProjectCreateCancel}
          />
        } 
      />
      {/* TODO: プロジェクト詳細と編集ページを実装 */}
      <Route path="/:id" element={<div>プロジェクト詳細（未実装）</div>} />
      <Route path="/:id/edit" element={<div>プロジェクト編集（未実装）</div>} />
    </Routes>
  );
};

// チケット関連ページコンポーネント
const TicketPages: React.FC = () => {
  const navigate = useNavigate();

  const handleTicketCreateSuccess = (ticket: Ticket) => {
    navigate('/tickets');
  };

  const handleTicketCreateCancel = () => {
    navigate('/tickets');
  };

  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleCreateTicket = () => {
    navigate('/tickets/new');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <TicketList 
            onTicketClick={handleTicketClick}
            onCreateTicket={handleCreateTicket}
          />
        } 
      />
      <Route 
        path="/new" 
        element={
          <TicketCreateForm 
            onSuccess={handleTicketCreateSuccess}
            onCancel={handleTicketCreateCancel}
          />
        } 
      />
      <Route 
        path="/:id" 
        element={<TicketDetailPage />} 
      />
      <Route 
        path="/:id/edit" 
        element={<TicketEditPage />} 
      />
    </Routes>
  );
};

// ユーザー関連ページコンポーネント
const UserPages: React.FC = () => {
  const navigate = useNavigate();

  const handleUserCreateSuccess = (user: User) => {
    navigate('/users');
  };

  const handleUserCreateCancel = () => {
    navigate('/users');
  };

  const handleUserClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  const handleUserEdit = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleUserEditSuccess = (user: User) => {
    navigate('/users');
  };

  const handleUserEditCancel = () => {
    navigate('/users');
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <UserList 
            onUserClick={handleUserClick}
            onCreateUser={handleCreateUser}
            onEditUser={handleUserEdit}
          />
        } 
      />
      <Route 
        path="/new" 
        element={
          <UserCreateForm 
            onSuccess={handleUserCreateSuccess}
            onCancel={handleUserCreateCancel}
          />
        } 
      />
      <Route 
        path="/:id/edit" 
        element={
          <UserEditFormWithId
            onSuccess={handleUserEditSuccess}
            onCancel={handleUserEditCancel}
          />
        } 
      />
    </Routes>
  );
};

// プロフィールページ
const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">プロフィール</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">名前</label>
          <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">役割</label>
          <p className="mt-1 text-sm text-gray-900">
            {user?.role === 'admin' ? '管理者' : user?.role === 'manager' ? 'マネージャー' : '一般ユーザー'}
          </p>
        </div>
      </div>
    </div>
  );
};

// 認証済みアプリケーション
const AuthenticatedApp: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/*" element={<ProjectPages />} />
        <Route path="/tickets/*" element={<TicketPages />} />
        <Route path="/users/*" element={<UserPages />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SystemSettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

// 未認証アプリケーション
const UnauthenticatedApp: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleRegisterSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          チケット管理システム
        </h1>
      </div>
      
      <Routes>
        <Route 
          path="/login" 
          element={<LoginForm onSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/register" 
          element={<RegisterForm onSuccess={handleRegisterSuccess} />} 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

// アプリケーションコンテンツ
const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
};

/**
 * URLパラメータからユーザーIDを取得してUserEditFormにuserプロパティを渡すラッパーコンポーネント
 */
const UserEditFormWithId: React.FC<{
  onSuccess: (user: User) => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('ユーザーIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiService.getUser(parseInt(id, 10));
        setUser(response.user);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ユーザーの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'ユーザーが見つかりません'}
            </h3>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserEditForm
      user={user}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

// メインアプリケーション
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
