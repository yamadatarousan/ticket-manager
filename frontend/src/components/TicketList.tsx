/**
 * チケット一覧 - ハイセンスデザイン
 *
 * チケットを美しいカードレイアウトで表示し、直感的なフィルタリング機能を提供します。
 * モダンなデザインシステムを適用し、ユーザビリティと視覚的魅力を両立します。
 *
 * 主な機能：
 * - カードベースのレスポンシブレイアウト
 * - リアルタイムフィルタリング（ステータス、優先度、プロジェクト）
 * - 美しいステータスバッジとプライオリティインジケーター
 * - スムーズなアニメーション効果
 * - アクセシビリティ対応
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, Project } from '../types/index';
import { apiService } from '../services/api';

interface TicketListProps {
  /** チケットクリック時のコールバック関数 */
  onTicketClick: (ticket: Ticket) => void;
  /** チケット編集時のコールバック関数 */
  onTicketEdit?: (ticket: Ticket) => void;
  /** チケット作成ボタンクリック時のコールバック関数 */
  onCreateTicket: () => void;
}

interface FilterState {
  status: string;
  priority: string;
  project: string;
  search: string;
}

/**
 * チケット一覧コンポーネント
 */
export const TicketList: React.FC<TicketListProps> = ({
  onTicketClick,
  onTicketEdit,
  onCreateTicket,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    priority: '',
    project: '',
    search: '',
  });

  // ページ読み込み時にデータを取得
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [ticketsResponse, projectsResponse] = await Promise.all([
          apiService.getTickets({ page: currentPage }),
          apiService.getProjects(),
        ]);

        setTickets(ticketsResponse.items);
        setTotalPages(ticketsResponse.total_pages);
        setTotalCount(ticketsResponse.total);
        setProjects(projectsResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage]);

  // フィルタリングされたチケット
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesPriority = !filters.priority || ticket.priority === filters.priority;
      const matchesProject = !filters.project || ticket.project_id.toString() === filters.project;
      const matchesSearch =
        !filters.search ||
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesPriority && matchesProject && matchesSearch;
    });
  }, [tickets, filters]);

  // ステータスラベルを取得
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

  // 優先度ラベルを取得
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

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 経過日数を計算
  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1日前';
    if (diffDays < 7) return `${diffDays}日前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
    return `${Math.floor(diffDays / 30)}ヶ月前`;
  };

  // フィルター更新
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // フィルターリセット
  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      project: '',
      search: '',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div className="loading-skeleton h-8 w-32 rounded-lg"></div>
          <div className="loading-skeleton h-10 w-32 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="card-body space-y-4">
                <div className="loading-skeleton h-6 w-3/4 rounded"></div>
                <div className="loading-skeleton h-4 w-full rounded"></div>
                <div className="loading-skeleton h-4 w-2/3 rounded"></div>
                <div className="flex space-x-2">
                  <div className="loading-skeleton h-6 w-16 rounded-full"></div>
                  <div className="loading-skeleton h-6 w-16 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">チケット管理</h1>
          <p className="text-gray-600 mt-2">
            総 <span className="font-semibold text-gray-900">{totalCount}</span> 件のチケット
            {filteredTickets.length !== tickets.length && (
              <span className="text-blue-600">（フィルター済み: {filteredTickets.length}件）</span>
            )}
          </p>
        </div>
        <button
          onClick={onCreateTicket}
          className="btn-primary hover-lift flex items-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>新しいチケット</span>
        </button>
      </div>

      {/* フィルターセクション */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="チケットを検索..."
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                className="form-input"
              />
            </div>

            {/* ステータスフィルター */}
            <div className="min-w-40">
              <select
                value={filters.status}
                onChange={e => updateFilter('status', e.target.value)}
                className="form-input"
              >
                <option value="">全てのステータス</option>
                <option value="open">未対応</option>
                <option value="in_progress">対応中</option>
                <option value="resolved">解決済み</option>
                <option value="closed">クローズ</option>
              </select>
            </div>

            {/* 優先度フィルター */}
            <div className="min-w-32">
              <select
                value={filters.priority}
                onChange={e => updateFilter('priority', e.target.value)}
                className="form-input"
              >
                <option value="">全ての優先度</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">緊急</option>
              </select>
            </div>

            {/* プロジェクトフィルター */}
            <div className="min-w-48">
              <select
                value={filters.project}
                onChange={e => updateFilter('project', e.target.value)}
                className="form-input"
              >
                <option value="">全てのプロジェクト</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id.toString()}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* リセットボタン */}
            <button onClick={resetFilters} className="btn-secondary flex items-center space-x-2">
              <span>🔄</span>
              <span>リセット</span>
            </button>
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

      {/* チケットカードグリッド */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="card hover-lift cursor-pointer animate-bounce-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onTicketClick(ticket)}
            >
              <div className="card-body">
                {/* チケットヘッダー */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{ticket.description}</p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onTicketEdit && onTicketEdit(ticket);
                    }}
                    className="ml-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="編集"
                  >
                    <span className="text-gray-400 hover:text-gray-600">✏️</span>
                  </button>
                </div>

                {/* ステータスと優先度 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`status-badge ${
                      ticket.status === 'open'
                        ? 'status-open'
                        : ticket.status === 'in_progress'
                          ? 'status-in-progress'
                          : ticket.status === 'resolved'
                            ? 'status-resolved'
                            : 'status-closed'
                    }`}
                  >
                    {getStatusLabel(ticket.status)}
                  </span>
                  <span
                    className={`status-badge ${
                      ticket.priority === 'low'
                        ? 'priority-low'
                        : ticket.priority === 'medium'
                          ? 'priority-medium'
                          : ticket.priority === 'high'
                            ? 'priority-high'
                            : 'priority-urgent'
                    }`}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </div>

                {/* チケット情報 */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600">📁</span>
                    <span>{ticket.project_name || 'プロジェクト未設定'}</span>
                  </div>

                  {ticket.assigned_to_name && (
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">👤</span>
                      <span>担当: {ticket.assigned_to_name}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400">📅</span>
                    <span>{formatDate(ticket.created_at)}</span>
                    <span className="text-gray-400">•</span>
                    <span>{getDaysAgo(ticket.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* チケットフッター */}
              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>#{ticket.id}</span>
                    <span>•</span>
                    <span>作成者: {ticket.created_by_name || '不明'}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-400">
                    <span className="text-xs">詳細を見る</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎫</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filters.search || filters.status || filters.priority || filters.project
                ? 'フィルター条件に一致するチケットがありません'
                : 'チケットがまだありません'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.priority || filters.project
                ? 'フィルター条件を変更してみてください。'
                : '最初のチケットを作成して、プロジェクトを開始しましょう。'}
            </p>
            {filters.search || filters.status || filters.priority || filters.project ? (
              <button onClick={resetFilters} className="btn-secondary">
                フィルターをリセット
              </button>
            ) : (
              <button onClick={onCreateTicket} className="btn-primary">
                最初のチケットを作成
              </button>
            )}
          </div>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← 前のページ
          </button>

          <div className="flex items-center space-x-2">
            {[...Array(Math.min(5, totalPages))].map((_, index) => {
              const pageNumber = Math.max(1, currentPage - 2) + index;
              if (pageNumber > totalPages) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次のページ →
          </button>
        </div>
      )}
    </div>
  );
};
