/**
 * ナビゲーションバー - ハイセンスデザイン
 *
 * アプリケーションのメインナビゲーションを提供するコンポーネント。
 * モダンなデザインシステムを適用し、ユーザー体験を向上させます。
 *
 * 機能：
 * - メインナビゲーション（ダッシュボード、プロジェクト、チケット、ユーザー）
 * - ユーザー情報表示
 * - ログアウト機能
 * - レスポンシブデザイン対応
 * - アクセシビリティ対応
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  /** ナビゲーション選択時のコールバック関数 */
  onNavigate: (page: string) => void;
  /** 現在表示中のビュー */
  currentView: string;
}

/**
 * ナビゲーションバーコンポーネント
 */
const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // プロフィールドロップダウンの外側クリック検知
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate('login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'ダッシュボード',
      icon: '🏠',
      description: 'プロジェクトの概要',
    },
    {
      id: 'projects',
      label: 'プロジェクト',
      icon: '📁',
      description: 'プロジェクト管理',
    },
    {
      id: 'tickets',
      label: 'チケット',
      icon: '🎫',
      description: 'タスク管理',
    },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [
          {
            id: 'users',
            label: 'ユーザー',
            icon: '👥',
            description: 'ユーザー管理',
          },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [
          {
            id: 'settings',
            label: '設定',
            icon: '⚙️',
            description: 'システム設定',
          },
        ]
      : []),
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'manager':
        return 'マネージャー';
      case 'user':
        return 'ユーザー';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ・ブランド */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-3 cursor-pointer hover-lift"
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">T</span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold gradient-text">Ticket Manager</h1>
                <p className="text-xs text-gray-500 -mt-1">プロジェクト管理システム</p>
              </div>
            </div>
          </div>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`nav-item group relative ${currentView === item.id ? 'active' : ''}`}
                title={item.description}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>

                {/* ホバー時のツールチップ */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none z-50">
                  {item.description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </button>
            ))}
          </div>

          {/* ユーザープロフィール */}
          <div className="flex items-center space-x-4">
            {/* プロフィールドロップダウン */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || 'ユーザー'}
                    </p>
                    <p
                      className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user?.role || 'user')}`}
                    >
                      {getRoleLabel(user?.role || 'user')}
                    </p>
                  </div>
                </div>
                <div className="hidden md:block">
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {/* プロフィールドロップダウンメニュー */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-bounce-in">
                  {/* ユーザー情報ヘッダー */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{user?.name || 'ユーザー'}</p>
                        <p className="text-blue-100 text-sm">{user?.email}</p>
                        <p className="text-blue-200 text-xs mt-1">
                          {getRoleLabel(user?.role || 'user')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* メニューアイテム */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                    >
                      <span className="text-xl">👤</span>
                      <div>
                        <p className="font-medium text-gray-900">プロフィール</p>
                        <p className="text-sm text-gray-500">アカウント設定を編集</p>
                      </div>
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-xl">⚙️</span>
                        <div>
                          <p className="font-medium text-gray-900">システム設定</p>
                          <p className="text-sm text-gray-500">管理者設定</p>
                        </div>
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileOpen(false);
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600"
                    >
                      <span className="text-xl">🚪</span>
                      <div>
                        <p className="font-medium">ログアウト</p>
                        <p className="text-sm text-red-500">セッションを終了</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* モバイルナビゲーションメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-xl animate-slide-up">
            <div className="px-4 py-6 space-y-2">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full nav-item text-left ${currentView === item.id ? 'active' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
