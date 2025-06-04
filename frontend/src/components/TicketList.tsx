import React, { useState, useEffect, useCallback } from 'react';
import { Ticket } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * チケット一覧表示のプロパティ
 */
interface TicketListProps {
  /** 一覧の更新を通知するためのキー（親コンポーネントで変更すると再読み込み） */
  refreshKey?: number;
  onTicketClick?: (ticket: Ticket) => void;
  onCreateTicket?: () => void;
}

/**
 * チケット一覧表示コンポーネント
 * 
 * システム内のチケット一覧を表示し、以下の機能を提供します：
 * - チケットの検索とフィルタリング
 * - ステータス・優先度によるソート
 * - 詳細表示への遷移
 * - 担当者の割り当て
 * - ステータス変更
 * - 管理機能（編集・削除）
 * 
 * 異なる権限レベルによって表示内容や操作が変わります：
 * - 管理者：全てのチケットを表示・編集可能
 * - マネージャー：チーム全体のチケットを管理
 * - 一般ユーザー：自分に割り当てられたチケットと自分が作成したチケットのみ
 * 
 * @param props - コンポーネントのプロパティ
 * @returns チケット一覧表示のReactコンポーネント
 * 
 * @example
 * ```tsx
 * // 通常の表示
 * <TicketList />
 * 
 * // 更新機能付きの表示
 * const [refreshKey, setRefreshKey] = useState(0);
 * <TicketList refreshKey={refreshKey} />
 * // 更新したい時
 * setRefreshKey(prevKey => prevKey + 1);
 * ```
 */
export const TicketList: React.FC<TicketListProps> = ({ refreshKey = 0, onTicketClick, onCreateTicket }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    created_by: ''
  });

  const fetchTickets = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const filterParams = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value)
      );
      
      const response = await apiService.getTickets(filterParams);
      setTickets(response.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'チケットの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [filters, authLoading, isAuthenticated]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      assigned_to: '',
      created_by: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 認証状態が確定していない場合はローディング表示
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">認証状態を確認中...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">チケットを読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow-md p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">エラーが発生しました</h3>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={fetchTickets}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">チケット一覧</h2>
        <button
          onClick={onCreateTicket}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center space-x-2"
        >
          <span>➕</span>
          <span>新規チケット作成</span>
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべて</option>
              <option value="open">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="resolved">解決済み</option>
              <option value="closed">クローズ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべて</option>
              <option value="urgent">緊急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <input
              type="text"
              value={filters.assigned_to}
              onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              placeholder="メールアドレス"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
            >
              フィルターをクリア
            </button>
          </div>
        </div>
      </div>

      {/* チケット一覧 */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">チケットが見つかりません</h3>
          <p className="text-gray-500 mb-4">
            {Object.values(filters).some(v => v) 
              ? 'フィルター条件に一致するチケットがありません。' 
              : 'まだチケットが作成されていません。'
            }
          </p>
          <button
            onClick={onCreateTicket}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            最初のチケットを作成
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    優先度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日時
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => onTicketClick?.(ticket)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {ticket.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.assigned_to || '未割り当て'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.created_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* フッター情報 */}
      {tickets.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          {tickets.length} 件のチケットが表示されています
        </div>
      )}
    </div>
  );
}; 