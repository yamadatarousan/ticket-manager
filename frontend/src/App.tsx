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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { Ticket, User } from './types';
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
    if (path === '/tickets') return 'tickets';
    if (path === '/tickets/new') return 'ticket-create';
    if (path === '/users') return 'users';
    if (path === '/users/new') return 'user-create';
    if (path === '/profile') return 'profile';
    if (path === '/settings') return 'settings';
    return 'tickets';
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

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ダッシュボード
          </h1>
          <p className="text-gray-600 mb-4">
            こんにちは、{user?.name}さん！
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100"
              onClick={() => navigate('/tickets')}
            >
              <h3 className="text-lg font-medium text-blue-900">チケット管理</h3>
              <p className="text-blue-700">チケットの確認・作成・編集</p>
            </div>
            {user && (user.role === 'admin' || user.role === 'manager') && (
              <div 
                className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100"
                onClick={() => navigate('/users')}
              >
                <h3 className="text-lg font-medium text-green-900">ユーザー管理</h3>
                <p className="text-green-700">ユーザーの確認・作成・編集</p>
              </div>
            )}
            <div 
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100"
              onClick={() => navigate('/profile')}
            >
              <h3 className="text-lg font-medium text-purple-900">プロフィール</h3>
              <p className="text-purple-700">個人設定の確認・変更</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// チケット関連のページコンポーネント
const TicketPages: React.FC = () => {
  const navigate = useNavigate();

  const handleTicketCreateSuccess = (ticket: Ticket) => {
    console.log('チケットが作成されました:', ticket);
    navigate('/tickets');
  };

  const handleTicketCreateCancel = () => {
    navigate('/tickets');
  };

  const handleTicketClick = (ticket: Ticket) => {
    console.log('チケットがクリックされました:', ticket);
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

// ユーザー関連のページコンポーネント
const UserPages: React.FC = () => {
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const handleUserCreateSuccess = (user: User) => {
    console.log('ユーザーが作成されました:', user);
    navigate('/users');
  };

  const handleUserCreateCancel = () => {
    navigate('/users');
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    navigate(`/users/${user.id}/edit`);
  };

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    navigate(`/users/${user.id}/edit`);
  };

  const handleUserEditSuccess = (user: User) => {
    console.log('ユーザーが更新されました:', user);
    setSelectedUser(null);
    navigate('/users');
  };

  const handleUserEditCancel = () => {
    setSelectedUser(null);
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
          selectedUser ? (
            <UserEditForm
              user={selectedUser}
              onSuccess={handleUserEditSuccess}
              onCancel={handleUserEditCancel}
            />
          ) : (
            <Navigate to="/users" replace />
          )
        } 
      />
    </Routes>
  );
};

// プロフィールページ
const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            プロフィール
          </h1>
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
              <label className="block text-sm font-medium text-gray-700">権限</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.role === 'admin' && '管理者'}
                {user?.role === 'manager' && 'マネージャー'}
                {user?.role === 'user' && '一般ユーザー'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 設定ページ
const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            システム設定
          </h1>
          <p className="text-gray-600">
            設定機能は今後実装予定です。
          </p>
        </div>
      </div>
    </div>
  );
};

// 認証済みアプリケーションのルーティング
const AuthenticatedApp: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/tickets" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets/*" element={<TicketPages />} />
        <Route path="/users/*" element={<UserPages />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/tickets" replace />} />
      </Routes>
    </MainLayout>
  );
};

// 認証が不要なページのコンポーネント
const UnauthenticatedApp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎫</h1>
          <h2 className="text-2xl font-bold text-gray-900">チケット管理システム</h2>
          <p className="text-gray-600 mt-2">BacklogやRedmineを参考にした統合チケット管理</p>
        </div>

        {/* 認証フォーム */}
        <Routes>
          <Route 
            path="/login" 
            element={
              <LoginForm
                onSwitchToRegister={() => navigate('/register')}
              />
            } 
          />
          <Route 
            path="/register" 
            element={
              <RegisterForm
                onSwitchToLogin={() => navigate('/login')}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {/* フッター */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            開発・テスト環境 | React + Rails + MySQL
          </p>
        </div>
      </div>
    </div>
  );
};

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />;
};

// ルートアプリケーションコンポーネント
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
