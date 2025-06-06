import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket } from '../types/index';
import { apiService } from '../services/api';
import { TicketEditForm } from './TicketEditForm';

/**
 * チケット編集ページコンポーネント
 *
 * URLパラメータからチケットIDを取得し、該当チケットの編集フォームを表示します。
 * 以下の機能を提供します：
 * - チケット情報の取得
 * - ローディング状態の表示
 * - エラーハンドリング
 * - 編集完了後のリダイレクト
 *
 * @returns チケット編集ページのReactコンポーネント
 *
 * @example
 * ```tsx
 * // ルーティング設定例
 * <Route path="/tickets/:id/edit" element={<TicketEditPage />} />
 * ```
 */
export const TicketEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) {
        setError('チケットIDが指定されていません');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiService.getTicket(parseInt(id, 10));
        setTicket(response.ticket);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケットの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleSuccess = (updatedTicket: Ticket) => {
    // 成功メッセージを表示（将来的に通知システムを実装）
    console.warn('チケットが更新されました:', updatedTicket);

    // チケット一覧ページに戻る
    navigate('/tickets');
  };

  const handleCancel = () => {
    navigate('/tickets');
  };

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

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h3>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                再読み込み
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">チケットが見つかりません</h3>
            <p className="text-sm text-gray-600 mb-6">
              指定されたチケットは存在しないか、アクセス権限がありません。
            </p>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <TicketEditForm ticket={ticket} onSuccess={handleSuccess} onCancel={handleCancel} />;
};
