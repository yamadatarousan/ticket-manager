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
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { LoginForm } from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import { TicketList } from './components/TicketList';
import { TicketCreateForm } from './components/TicketCreateForm';
import { TicketDetailPage } from './components/TicketDetailPage';
import { TicketEditPage } from './components/TicketEditPage';
import { UserList } from './components/UserList';
import { UserCreateForm } from './components/UserCreateForm';
import { UserEditForm } from './components/UserEditForm';
import { SystemSettingsPage } from './components/SystemSettingsPage';
import { ProjectList } from './components/ProjectList';
import { ProjectCreateForm } from './components/ProjectCreateForm';
import { ProjectDetail } from './components/ProjectDetail';
import { Ticket, User, DashboardStats, Project } from './types/index';
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
    <div className="min-h-screen">
      {/* ハイセンスなナビゲーションバー */}
      <div className="glass-effect border-b border-white/20 sticky top-0 z-50">
        <Navbar onNavigate={handleNavigate} currentView={getCurrentView()} />
      </div>

      {/* メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* 装飾的なバックグラウンド要素 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>
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
      case 'open':
        return '未対応';
      case 'in_progress':
        return '対応中';
      case 'resolved':
        return '解決済み';
      case 'closed':
        return 'クローズ';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low':
        return '低';
      case 'medium':
        return '中';
      case 'high':
        return '高';
      case 'urgent':
        return '緊急';
      default:
        return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner"></div>
          <span className="text-gray-600 font-medium">統計情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ヘッダーセクション */}
      <div className="card hover-lift">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-3">ダッシュボード</h1>
              <p className="text-xl text-gray-600">
                こんにちは、<span className="font-semibold text-gray-800">{user?.name}</span>さん！
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="card border-red-200 bg-red-50 animate-bounce-in">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <>
          {/* 統計カードグリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 総チケット数 */}
            <div className="card hover-lift animate-bounce-in" style={{ animationDelay: '0.1s' }}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      総チケット数
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats.ticket_stats.total}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">📋</span>
                  </div>
                </div>
              </div>
            </div>

            {/* オープンチケット数 */}
            <div className="card hover-lift animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      オープン
                    </p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">
                      {stats.ticket_stats.open}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">🔓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 進行中チケット数 */}
            <div className="card hover-lift animate-bounce-in" style={{ animationDelay: '0.3s' }}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      進行中
                    </p>
                    <p className="text-3xl font-bold text-amber-600 mt-1">
                      {stats.ticket_stats.in_progress}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">⚡</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 解決済みチケット数 */}
            <div className="card hover-lift animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      解決済み
                    </p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">
                      {stats.ticket_stats.resolved}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-2xl">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 最近の活動 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 最近のチケット */}
            <div className="card hover-lift animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="card-header">
                <h3 className="text-xl font-bold text-gray-900">最近のチケット</h3>
              </div>
              <div className="card-body">
                {stats.recent_tickets && stats.recent_tickets.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recent_tickets.slice(0, 5).map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 truncate">{ticket.title}</h4>
                          <div className="flex items-center space-x-3 mt-2">
                            <span
                              className={`status-badge ${ticket.status === 'open' ? 'status-open' : ticket.status === 'in_progress' ? 'status-in-progress' : ticket.status === 'resolved' ? 'status-resolved' : 'status-closed'}`}
                            >
                              {getStatusLabel(ticket.status)}
                            </span>
                            <span
                              className={`status-badge ${ticket.priority === 'low' ? 'priority-low' : ticket.priority === 'medium' ? 'priority-medium' : ticket.priority === 'high' ? 'priority-high' : 'priority-urgent'}`}
                            >
                              {getPriorityLabel(ticket.priority)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 ml-4">
                          {formatDate(ticket.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-gray-500">まだチケットがありません</p>
                  </div>
                )}
              </div>
            </div>

            {/* クイックアクション */}
            <div className="card hover-lift animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="card-header">
                <h3 className="text-xl font-bold text-gray-900">クイックアクション</h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={() => navigate('/tickets/new')}
                    className="btn-primary text-left flex items-center space-x-4 hover-lift"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎫</span>
                    </div>
                    <div>
                      <div className="font-semibold">新しいチケットを作成</div>
                      <div className="text-sm opacity-90">問題や要望を報告</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/projects/new')}
                    className="btn-secondary text-left flex items-center space-x-4 hover-lift"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📁</span>
                    </div>
                    <div>
                      <div className="font-semibold">新しいプロジェクト</div>
                      <div className="text-sm text-gray-600">プロジェクトを開始</div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/tickets')}
                    className="btn-secondary text-left flex items-center space-x-4 hover-lift"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <div className="font-semibold">全てのチケット</div>
                      <div className="text-sm text-gray-600">チケット一覧を表示</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// プロジェクト関連ページコンポーネント
const ProjectPages: React.FC = () => {
  const navigate = useNavigate();

  const handleProjectCreateSuccess = (_project: Project) => {
    navigate('/projects');
  };

  const handleProjectCreateCancel = () => {
    navigate('/projects');
  };

  const handleProjectClick = (_project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleProjectEdit = (_project: Project) => {
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
      <Route path="/:id" element={<ProjectDetail />} />
      <Route path="/:id/edit" element={<div>プロジェクト編集（未実装）</div>} />
    </Routes>
  );
};

// チケット関連ページコンポーネント
const TicketPages: React.FC = () => {
  const navigate = useNavigate();

  const handleTicketCreateSuccess = (_ticket: Ticket) => {
    navigate('/tickets');
  };

  const handleTicketCreateCancel = () => {
    navigate('/tickets');
  };

  const handleTicketClick = (_ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`);
  };

  const handleCreateTicket = () => {
    navigate('/tickets/new');
  };

  const handleEditTicket = (_ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}/edit`);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <TicketList
            onTicketClick={handleTicketClick}
            onTicketEdit={handleEditTicket}
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
      <Route path="/:id" element={<TicketDetailPage />} />
      <Route path="/:id/edit" element={<TicketEditPage />} />
    </Routes>
  );
};

// ユーザー関連ページコンポーネント
const UserPages: React.FC = () => {
  const navigate = useNavigate();

  const handleUserCreateSuccess = (_user: User) => {
    navigate('/users');
  };

  const handleUserCreateCancel = () => {
    navigate('/users');
  };

  const handleUserClick = (_user: User) => {
    navigate(`/users/${user.id}`);
  };

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  const handleUserEdit = (_user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  const handleUserEditSuccess = (_user: User) => {
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
            onUserEdit={handleUserEdit}
          />
        }
      />
      <Route
        path="/new"
        element={
          <UserCreateForm onSuccess={handleUserCreateSuccess} onCancel={handleUserCreateCancel} />
        }
      />
      <Route
        path="/:id/edit"
        element={
          <UserEditFormWithId onSuccess={handleUserEditSuccess} onCancel={handleUserEditCancel} />
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
            {user?.role === 'admin'
              ? '管理者'
              : user?.role === 'manager'
                ? 'マネージャー'
                : '一般ユーザー'}
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
        <Route path="/login" element={<LoginForm onSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterForm onSuccess={handleRegisterSuccess} />} />
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
  onSuccess: (_user: User) => void;
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

  return <UserEditForm user={user} onSuccess={onSuccess} onCancel={onCancel} />;
};

// メインアプリケーション
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
