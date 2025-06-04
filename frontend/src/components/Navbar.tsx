import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ナビゲーションバーコンポーネント
 * 
 * アプリケーション全体のナビゲーションバーを提供します。
 * このコンポーネントは以下の機能を実装しています：
 * - ページ間のナビゲーションリンク
 * - ユーザー権限に基づいたメニュー表示制御
 * - ログイン状態の表示・ログアウト機能
 * - モバイル対応のレスポンシブデザイン
 * - 現在のページのハイライト
 * 
 * @returns ナビゲーションバーのReactコンポーネント
 * 
 * @example
 * ```tsx
 * // アプリケーションのルートコンポーネントで使用
 * <div className="app-container">
 *   <Navbar />
 *   <main>{children}</main>
 * </div>
 * ```
 */
const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // モバイルメニューの開閉状態
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ユーザーメニューの開閉状態
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  /**
   * 現在のパスがナビゲーションリンクと一致するかチェックする
   * 
   * @param path - チェックするパス
   * @returns 現在のパスに一致する場合はtrue、それ以外はfalse
   */
  const isActive = (path: string): boolean => {
    // 完全一致または先頭一致（サブパスを含む）
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  /**
   * ログアウト処理を行い、ログインページに遷移する
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * モバイルメニューの開閉を切り替える
   */
  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * ユーザーメニューの開閉を切り替える
   */
  const toggleUserMenu = (): void => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  /**
   * ナビゲーションリンクの共通スタイルを取得する
   * 
   * @param path - リンクのパス
   * @returns CSSクラス名
   */
  const getLinkStyles = (path: string): string => {
    return `px-3 py-2 rounded-md text-sm font-medium ${
      isActive(path)
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  };

  /**
   * モバイルナビゲーションリンクの共通スタイルを取得する
   * 
   * @param path - リンクのパス
   * @returns CSSクラス名
   */
  const getMobileLinkStyles = (path: string): string => {
    return `block px-3 py-2 rounded-md text-base font-medium ${
      isActive(path)
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ロゴとデスクトップナビゲーションリンク */}
          <div className="flex items-center">
            {/* ロゴ */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-white font-bold text-xl">
                チケット管理
              </Link>
            </div>
            
            {/* デスクトップナビゲーションリンク */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className={getLinkStyles('/dashboard')}>
                      ダッシュボード
                    </Link>
                    <Link to="/tickets" className={getLinkStyles('/tickets')}>
                      チケット
                    </Link>
                    {/* 管理者またはマネージャーのみ表示 */}
                    {user && (user.role === 'admin' || user.role === 'manager') && (
                      <Link to="/users" className={getLinkStyles('/users')}>
                        ユーザー管理
                      </Link>
                    )}
                    {/* 管理者のみ表示 */}
                    {user && user.role === 'admin' && (
                      <Link to="/settings" className={getLinkStyles('/settings')}>
                        設定
                      </Link>
                    )}
                  </>
                )}
                
                {!isAuthenticated && (
                  <>
                    <Link to="/login" className={getLinkStyles('/login')}>
                      ログイン
                    </Link>
                    <Link to="/register" className={getLinkStyles('/register')}>
                      新規登録
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* ユーザーメニューとモバイルメニューボタン */}
          <div className="flex items-center">
            {/* ユーザー情報（認証済みの場合） */}
            {isAuthenticated && user && (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={toggleUserMenu}
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">ユーザーメニューを開く</span>
                    <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                
                {/* ユーザーメニュードロップダウン */}
                {isUserMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex={-1}
                  >
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-gray-500">{user.email}</div>
                      <div className="text-xs mt-1 bg-gray-100 px-2 py-1 rounded">
                        {user.role === 'admin' && '管理者'}
                        {user.role === 'manager' && 'マネージャー'}
                        {user.role === 'user' && '一般ユーザー'}
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex={-1}
                      id="user-menu-item-0"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      プロフィール
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex={-1}
                      id="user-menu-item-2"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* モバイルメニューボタン */}
            <div className="ml-4 flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">メニューを開く</span>
                {/* アイコン（メニュー閉じている時） */}
                {!isMobileMenuOpen && (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
                {/* アイコン（メニュー開いている時） */}
                {isMobileMenuOpen && (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={getMobileLinkStyles('/dashboard')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ダッシュボード
                </Link>
                <Link 
                  to="/tickets" 
                  className={getMobileLinkStyles('/tickets')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  チケット
                </Link>
                {/* 管理者またはマネージャーのみ表示 */}
                {user && (user.role === 'admin' || user.role === 'manager') && (
                  <Link 
                    to="/users" 
                    className={getMobileLinkStyles('/users')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ユーザー管理
                  </Link>
                )}
                {/* 管理者のみ表示 */}
                {user && user.role === 'admin' && (
                  <Link 
                    to="/settings" 
                    className={getMobileLinkStyles('/settings')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    設定
                  </Link>
                )}
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Link 
                  to="/login" 
                  className={getMobileLinkStyles('/login')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ログイン
                </Link>
                <Link 
                  to="/register" 
                  className={getMobileLinkStyles('/register')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  新規登録
                </Link>
              </>
            )}
          </div>
          
          {/* モバイルユーザーメニュー（認証済みの場合） */}
          {isAuthenticated && user && (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{user.name}</div>
                  <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user.email}</div>
                  <div className="text-xs mt-1 bg-gray-700 text-gray-300 px-2 py-1 rounded inline-block">
                    {user.role === 'admin' && '管理者'}
                    {user.role === 'manager' && 'マネージャー'}
                    {user.role === 'user' && '一般ユーザー'}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  プロフィール
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 