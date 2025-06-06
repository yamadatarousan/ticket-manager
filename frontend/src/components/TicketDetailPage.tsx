/**
 * チケット詳細ページ - ハイセンスデザイン
 *
 * チケットの詳細情報を美しいレイアウトで表示し、コメント機能を提供します。
 * モダンなデザインシステムを適用し、ユーザビリティと視覚的魅力を両立します。
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Comment } from '../types/index';
import { apiService } from '../services/api';
import { CommentSection } from './CommentSection';
import { useAuth } from '../context/AuthContext';

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.getTicket(parseInt(id, 10));
        setTicket(response.ticket);

        const commentsResponse = await apiService.getComments(parseInt(id, 10));
        setComments(commentsResponse.comments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケット情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleEditClick = () => {
    if (ticket) {
      navigate(`/tickets/${ticket.id}/edit`);
    }
  };

  const handleDeleteClick = async () => {
    if (!ticket) return;

    if (window.confirm(`チケット「${ticket.title}」を削除してもよろしいですか？`)) {
      try {
        await apiService.deleteTicket(ticket.id);
        navigate('/tickets');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チケットの削除に失敗しました');
      }
    }
  };

  // 新しいコメントが追加された時に更新
  const handleCommentAdded = (newComment: Comment) => {
    setComments([...comments, newComment]);
  };

  // コメント削除時の処理
  const handleCommentDeleted = (commentId: number) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  // ステータスを日本語に変換
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

  // 優先度を日本語に変換
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 編集権限の確認
  const canEditTicket = () => {
    if (!currentUser || !ticket) return false;

    // 管理者は全て編集可能
    if (currentUser.role === 'admin') return true;

    // マネージャーは自分のプロジェクトのチケットを編集可能
    if (currentUser.role === 'manager') return true;

    // 作成者または担当者は編集可能
    return ticket.created_by === currentUser.id || ticket.assigned_to === currentUser.id;
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <div className="loading-skeleton h-8 w-2/3 rounded-lg"></div>
            <div className="flex space-x-2">
              <div className="loading-skeleton h-6 w-20 rounded-full"></div>
              <div className="loading-skeleton h-6 w-20 rounded-full"></div>
            </div>
          </div>
          <div className="loading-skeleton h-10 w-24 rounded-lg"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="card animate-pulse">
              <div className="card-header">
                <div className="loading-skeleton h-6 w-40 rounded"></div>
              </div>
              <div className="card-body space-y-4">
                <div className="loading-skeleton h-4 w-full rounded"></div>
                <div className="loading-skeleton h-4 w-full rounded"></div>
                <div className="loading-skeleton h-4 w-3/4 rounded"></div>
              </div>
            </div>

            <div className="mt-8 card animate-pulse">
              <div className="card-header">
                <div className="loading-skeleton h-6 w-32 rounded"></div>
              </div>
              <div className="card-body space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="loading-skeleton h-10 w-10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="loading-skeleton h-4 w-full rounded"></div>
                    <div className="loading-skeleton h-4 w-full rounded mt-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="card animate-pulse">
              <div className="card-header">
                <div className="loading-skeleton h-6 w-32 rounded"></div>
              </div>
              <div className="card-body space-y-4">
                <div className="loading-skeleton h-5 w-full rounded"></div>
                <div className="loading-skeleton h-5 w-full rounded"></div>
                <div className="loading-skeleton h-5 w-full rounded"></div>
                <div className="loading-skeleton h-5 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 animate-bounce-in">
        <div className="card-body">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-800">エラーが発生しました</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button onClick={() => navigate('/tickets')} className="btn-secondary">
              チケット一覧に戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="card animate-bounce-in">
        <div className="card-body text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎫</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">チケットが見つかりません</h3>
          <p className="text-gray-600 mb-6">
            指定されたチケットは存在しないか、アクセス権限がありません。
          </p>
          <button onClick={() => navigate('/tickets')} className="btn-primary">
            チケット一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ヘッダーセクション */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{ticket.title}</h1>
          <div className="flex items-center mt-2 flex-wrap gap-2">
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
              優先度: {getPriorityLabel(ticket.priority)}
            </span>
            <span className="text-gray-600 text-sm">
              #{ticket.id} • 作成日: {formatDate(ticket.created_at)}
            </span>
          </div>
        </div>

        {canEditTicket() && (
          <div className="flex space-x-3">
            <button
              onClick={handleEditClick}
              className="btn-secondary hover-lift flex items-center space-x-2"
            >
              <span className="text-lg">✏️</span>
              <span>編集</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="btn-secondary hover-lift flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              <span className="text-lg">🗑️</span>
              <span>削除</span>
            </button>
          </div>
        )}
      </div>

      {/* メインコンテンツエリア */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左側：チケット詳細とコメント */}
        <div className="md:col-span-2 space-y-8">
          {/* チケット詳細 */}
          <div className="card hover-lift">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">詳細情報</h2>
            </div>
            <div className="card-body">
              <div className="prose max-w-none">
                {ticket.description ? (
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                ) : (
                  <p className="text-gray-500 italic">説明はありません</p>
                )}
              </div>

              {ticket.project_name && (
                <div className="mt-6 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  プロジェクト: {ticket.project_name}
                </div>
              )}
            </div>
          </div>

          {/* コメントセクション */}
          <div className="card-glass hover-lift">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">コメント</h2>
            </div>
            <div className="card-body">
              <CommentSection
                ticketId={ticketId}
                comments={comments}
                onCommentAdded={handleCommentAdded}
                onCommentDeleted={handleCommentDeleted}
              />
            </div>
          </div>
        </div>

        {/* 右側：詳細情報 */}
        <div>
          <div className="card hover-lift">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">チケット情報</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">ステータス</p>
                  <p className="font-medium">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        ticket.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ticket.status === 'resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusLabel(ticket.status)}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">優先度</p>
                  <p className="font-medium">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        ticket.priority === 'low'
                          ? 'bg-green-100 text-green-800'
                          : ticket.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : ticket.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {getPriorityLabel(ticket.priority)}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">担当者</p>
                  <p className="font-medium">{ticket.assigned_to_name || '未割り当て'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">作成者</p>
                  <p className="font-medium">{ticket.created_by_name || '不明'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">作成日時</p>
                  <p className="font-medium">{formatDate(ticket.created_at)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">更新日時</p>
                  <p className="font-medium">{formatDate(ticket.updated_at)}</p>
                </div>

                {ticket.project_name && (
                  <div>
                    <p className="text-sm text-gray-500">プロジェクト</p>
                    <p className="font-medium">{ticket.project_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* チケット履歴またはアクティビティ */}
          <div className="card hover-lift mt-6">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">アクティビティ</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📝</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">作成されました</p>
                    <p className="text-xs text-gray-500">{formatDate(ticket.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">🔄</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">最終更新</p>
                    <p className="text-xs text-gray-500">{formatDate(ticket.updated_at)}</p>
                  </div>
                </div>

                {comments.length > 0 && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm">💬</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {comments.length}件のコメント
                      </p>
                      <p className="text-xs text-gray-500">
                        最新: {formatDate(comments[comments.length - 1].created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
