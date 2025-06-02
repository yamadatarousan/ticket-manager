import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { Navbar } from './components/Navbar';
import { TicketList } from './components/TicketList';
import { Ticket } from './types';
import './App.css';

// 認証が必要なページのメインコンポーネント
const AuthenticatedApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedTicket(null);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setCurrentPage('ticket-detail');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tickets':
        return (
          <TicketList
            onTicketClick={handleTicketClick}
            onCreateTicket={() => setCurrentPage('create-ticket')}
          />
        );
      case 'create-ticket':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">新規チケット作成</h2>
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">チケット作成フォーム</h3>
                <p className="text-gray-500 mb-4">チケット作成機能は開発中です。</p>
                <button
                  onClick={() => setCurrentPage('tickets')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  チケット一覧に戻る
                </button>
              </div>
            </div>
          </div>
        );
      case 'ticket-detail':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">チケット詳細</h2>
                <button
                  onClick={() => setCurrentPage('tickets')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  ← 一覧に戻る
                </button>
              </div>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedTicket.title}</h3>
                    <p className="text-gray-600 mt-2">{selectedTicket.description}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">ステータス</span>
                      <p className="mt-1">{selectedTicket.status}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">優先度</span>
                      <p className="mt-1">{selectedTicket.priority}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">担当者</span>
                      <p className="mt-1">{selectedTicket.assigned_to || '未割り当て'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">作成者</span>
                      <p className="mt-1">{selectedTicket.created_by}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">チケットが選択されていません。</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ユーザー管理</h2>
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ユーザー管理機能</h3>
                <p className="text-gray-500 mb-4">ユーザー管理機能は開発中です。</p>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">プロフィール設定</h2>
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">プロフィール設定</h3>
                <p className="text-gray-500 mb-4">プロフィール設定機能は開発中です。</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <TicketList
            onTicketClick={handleTicketClick}
            onCreateTicket={() => setCurrentPage('create-ticket')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={handleNavigate} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderCurrentPage()}
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
