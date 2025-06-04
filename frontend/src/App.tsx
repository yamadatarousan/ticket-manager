import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Navbar } from './components/Navbar';
import { TicketList } from './components/TicketList';
import { TicketCreateForm } from './components/TicketCreateForm';
import { UserList } from './components/UserList';
import { UserCreateForm } from './components/UserCreateForm';
import { UserEditForm } from './components/UserEditForm';
import { Ticket, User } from './types';
import './App.css';

// 認証が必要なページのメインコンポーネント
const AuthenticatedApp: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('tickets');
  const [ticketRefreshKey, setTicketRefreshKey] = useState(0);
  const [userRefreshKey, setUserRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // チケット作成完了時のハンドラー
  const handleTicketCreateSuccess = (ticket: Ticket) => {
    console.log('チケットが作成されました:', ticket);
    setCurrentView('tickets');
    setTicketRefreshKey(prev => prev + 1); // TicketListを再レンダリング
  };

  // チケット作成キャンセル時のハンドラー
  const handleTicketCreateCancel = () => {
    setCurrentView('tickets');
  };

  // ユーザー作成完了時のハンドラー
  const handleUserCreateSuccess = (user: User) => {
    console.log('ユーザーが作成されました:', user);
    setCurrentView('users');
    setUserRefreshKey(prev => prev + 1);
  };

  // ユーザー作成キャンセル時のハンドラー
  const handleUserCreateCancel = () => {
    setCurrentView('users');
  };

  // ユーザー編集完了時のハンドラー
  const handleUserEditSuccess = (user: User) => {
    console.log('ユーザーが更新されました:', user);
    setSelectedUser(null);
    setCurrentView('users');
    setUserRefreshKey(prev => prev + 1);
  };

  // ユーザー編集キャンセル時のハンドラー
  const handleUserEditCancel = () => {
    setSelectedUser(null);
    setCurrentView('users');
  };

  // ユーザークリック時のハンドラー
  const handleUserClick = (user: User) => {
    // 現在は編集画面に遷移
    setSelectedUser(user);
    setCurrentView('user-edit');
  };

  // ユーザー編集開始時のハンドラー
  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setCurrentView('user-edit');
  };

  // 認証されていない場合はログインフォームを表示
  if (!user) {
    return <LoginForm />;
  }

  // メインコンテンツのレンダリング
  const renderContent = () => {
    switch (currentView) {
      case 'tickets':
        return <TicketList key={ticketRefreshKey} />;
      case 'ticket-create':
        return (
          <TicketCreateForm
            onSuccess={handleTicketCreateSuccess}
            onCancel={handleTicketCreateCancel}
          />
        );
      case 'users':
        return (
          <UserList
            key={userRefreshKey}
            onUserClick={handleUserClick}
            onCreateUser={() => setCurrentView('user-create')}
            onEditUser={handleUserEdit}
          />
        );
      case 'user-create':
        return (
          <UserCreateForm
            onSuccess={handleUserCreateSuccess}
            onCancel={handleUserCreateCancel}
          />
        );
      case 'user-edit':
        return selectedUser ? (
          <UserEditForm
            user={selectedUser}
            onSuccess={handleUserEditSuccess}
            onCancel={handleUserEditCancel}
          />
        ) : (
          <div>ユーザーが選択されていません</div>
        );
      default:
        return <TicketList key={ticketRefreshKey} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={(page) => setCurrentView(page)} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

// 認証が不要なページのコンポーネント
const UnauthenticatedApp: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);

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
        {showRegister ? (
          <RegisterForm
            onSuccess={() => {
              // 登録成功時は自動的に認証状態になる
            }}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginForm
            onSuccess={() => {
              // ログイン成功時は自動的に認証状態になる
            }}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}

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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
