import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Ticket } from '../types';

/**
 * チケット詳細表示ページコンポーネント
 * 
 * 指定されたIDのチケット詳細情報を読み取り専用で表示します。
 * 編集ボタンからチケット編集ページに遷移できます。
 */
export const TicketDetailPage: React.FC = () => {
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
        setError(null);
        const response = await apiService.getTicket(parseInt(id));
        setTicket(response.ticket);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケットの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  /**
   * ステータスの日本語表示を取得
   */
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      'open': '未着手',
      'in_progress': '進行中',
      'resolved': '解決済み',
      'closed': '完了'
    };
    return statusMap[status] || status;
  };

  /**
   * 優先度の日本語表示を取得
   */
  const getPriorityLabel = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      'low': '低',
      'medium': '中',
      'high': '高',
      'urgent': '緊急'
    };
    return priorityMap[priority] || priority;
  };

  /**
   * 優先度に応じたCSSクラスを取得
   */
  const getPriorityClass = (priority: string): string => {
    const priorityClassMap: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return priorityClassMap[priority] || 'bg-gray-100 text-gray-800';
  };

  /**
   * ステータスに応じたCSSクラスを取得
   */
  const getStatusClass = (status: string): string => {
    const statusClassMap: Record<string, string> = {
      'open': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return statusClassMap[status] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => {
    navigate(`/tickets/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/tickets');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">チケットを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">エラーが発生しました</h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                チケット一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">チケットが見つかりません</h3>
            <p className="mt-2 text-sm text-gray-500">指定されたチケットは存在しないか、削除されている可能性があります。</p>
            <div className="mt-6">
              <button
                onClick={handleBack}
                className="w-full inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                チケット一覧に戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">チケット詳細</h1>
              <p className="mt-2 text-sm text-gray-600">チケット #{ticket.id}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                一覧に戻る
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </button>
            </div>
          </div>
        </div>

        {/* チケット詳細情報 */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{ticket.title}</h2>
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                    優先度: {getPriorityLabel(ticket.priority)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ステータス</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">優先度</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">担当者</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {ticket.assigned_to || '未割り当て'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">作成者</dt>
                    <dd className="mt-1 text-sm text-gray-900">{ticket.created_by}</dd>
                  </div>
                </dl>
              </div>

              {/* 日時情報 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">日時情報</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">作成日時</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(ticket.created_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">更新日時</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(ticket.updated_at).toLocaleString('ja-JP')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* 説明 */}
          <div className="px-6 py-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">説明</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 